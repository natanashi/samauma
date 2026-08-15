/* SAMAÚMA — formatação e apoio.
   Um lugar só para número, massa, dinheiro, data e prazo, para que a mesma
   grandeza seja escrita igual em toda a interface e em todo relatório. */

const Fmt = {
  kg(valor) {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' kg';
  },

  /* Acima de uma tonelada o número fica mais legível em toneladas. */
  toneladas(valor) {
    if (valor == null) return '—';
    if (valor < 1000) return Fmt.kg(valor);
    return (valor / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' t';
  },

  reais(valor) {
    if (valor == null) return '—';
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  numero(valor, casas = 0) {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  },

  percentual(valor, casas = 1) {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + '%';
  },

  variacao(valor) {
    if (valor == null) return '—';
    return (valor > 0 ? '+' : '') + valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%';
  },

  data(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  dataHora(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  },

  hora(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  },

  mes(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  },

  duracao(horas) {
    if (horas == null) return '—';
    if (horas < 24) return horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h';
    return (horas / 24).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' dias';
  },

  /* Prazo em linguagem de quem está com pressa, não em data seca. */
  prazo(iso) {
    if (!iso) return '—';
    const dias = Fmt.diasAte(iso);
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'amanhã';
    if (dias < 0) return `atrasada há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`;
    return `em ${dias} dias`;
  },

  diasAte(iso) {
    return Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  },

  /* Turno da coleta: o catador se organiza por período, não por hora exata. */
  turno(iso) {
    const hora = new Date(iso).getHours();
    if (hora < 12) return 'manhã';
    if (hora < 18) return 'tarde';
    return 'noite';
  }
};

/* Texto vindo de dado nunca entra cru no HTML — nem na tela, nem no relatório. */
function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Data relativa a hoje, com hora cheia. Usada pela semente e pelos prazos. */
function dataRelativa(dias, hora = 9, minuto = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString();
}

function inicioDoDia(data = new Date()) {
  return new Date(data).setHours(0, 0, 0, 0);
}

function mesmoDia(iso, referencia = new Date()) {
  return !!iso && inicioDoDia(new Date(iso)) === inicioDoDia(referencia);
}

/* Gerador pseudoaleatório determinístico: a demonstração reinicia sempre igual. */
function sorteador(semente) {
  let estado = semente;
  return function (min, max) {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return min + (estado / 2147483648) * (max - min);
  };
}

/* Soma um campo de uma lista sem repetir reduce em vinte lugares. */
function somar(lista, campo) {
  return lista.reduce((total, item) => total + (typeof campo === 'function' ? (campo(item) || 0) : (item[campo] || 0)), 0);
}

/* Média que devolve null em vez de NaN quando não há o que medir. */
function media(valores) {
  const limpos = valores.filter(v => v != null && !Number.isNaN(v));
  return limpos.length ? limpos.reduce((s, v) => s + v, 0) / limpos.length : null;
}

/* Agrupa uma lista por chave e devolve os grupos já com participação no total. */
function agrupar(lista, chave, valor) {
  const grupos = new Map();
  lista.forEach(item => {
    const k = chave(item);
    if (k == null) return;
    const atual = grupos.get(k) || { chave: k, itens: [], massa: 0, n: 0 };
    atual.itens.push(item);
    atual.massa += valor(item) || 0;
    atual.n += 1;
    grupos.set(k, atual);
  });
  const total = [...grupos.values()].reduce((s, g) => s + g.massa, 0);
  return [...grupos.values()]
    .map(g => ({ ...g, parte: total ? (g.massa / total) * 100 : 0 }))
    .sort((a, b) => b.massa - a.massa);
}
