/* SAMAÚMA — formatação e apoio.
   Um lugar só para número, massa, dinheiro, data e prazo, para que a mesma
   grandeza seja escrita igual em toda a interface e em todo relatório. */

export const Fmt = {
  kg(valor: number | null | undefined): string {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' kg';
  },

  toneladas(valor: number | null | undefined): string {
    if (valor == null) return '—';
    if (valor < 1000) return Fmt.kg(valor);
    return (valor / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' t';
  },

  reais(valor: number | null | undefined): string {
    if (valor == null) return '—';
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  numero(valor: number | null | undefined, casas = 0): string {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  },

  percentual(valor: number | null | undefined, casas = 1): string {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }) + '%';
  },

  variacao(valor: number | null | undefined): string {
    if (valor == null) return '—';
    return (valor > 0 ? '+' : '') + valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%';
  },

  data(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

  dataHora(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  },

  hora(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  },

  mes(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  },

  duracao(horas: number | null | undefined): string {
    if (horas == null) return '—';
    if (horas < 24) return horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h';
    return (horas / 24).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' dias';
  },

  prazo(iso: string | null | undefined): string {
    if (!iso) return '—';
    const dias = Fmt.diasAte(iso);
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'amanhã';
    if (dias < 0) return `atrasada há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`;
    return `em ${dias} dias`;
  },

  diasAte(iso: string): number {
    return Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  },

  turno(iso: string): string {
    const hora = new Date(iso).getHours();
    if (hora < 12) return 'manhã';
    if (hora < 18) return 'tarde';
    return 'noite';
  }
};

/* Texto vindo de dado nunca entra cru no HTML — usado nas exportações que
   montam HTML fora do React (relatório, comprovante baixado, ficha). Dentro de
   componentes React o JSX já escapa por padrão. */
export function escapar(texto: unknown): string {
  return String(texto ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
}

/* Data relativa a hoje, com hora cheia. Usada pela semente e pelos prazos. */
export function dataRelativa(dias: number, hora = 9, minuto = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minuto, 0, 0);
  return d.toISOString();
}

export function inicioDoDia(data: Date = new Date()): number {
  return new Date(data).setHours(0, 0, 0, 0);
}

export function mesmoDia(iso: string | null | undefined, referencia: Date = new Date()): boolean {
  return !!iso && inicioDoDia(new Date(iso)) === inicioDoDia(referencia);
}

/* Instante atual, isolado num nome próprio: chamar `Date.now()` direto no
   corpo de um componente conta como impureza para o linter de hooks — mover
   a leitura para uma função comum (não-componente) resolve isso. */
export function agoraMs(): number {
  return Date.now();
}

export function haDias(dias: number): number {
  return Date.now() - dias * 86400000;
}

export function daquiADias(dias: number): Date {
  return new Date(Date.now() + dias * 86400000);
}

/* Gerador pseudoaleatório determinístico: a demonstração reinicia sempre igual. */
export function sorteador(semente: number): (min: number, max: number) => number {
  let estado = semente;
  return function (min: number, max: number): number {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return min + (estado / 2147483648) * (max - min);
  };
}

type Campo<T> = keyof T | ((item: T) => number);

export function somar<T>(lista: T[], campo: Campo<T>): number {
  return lista.reduce((total: number, item) => {
    const valor = typeof campo === 'function' ? campo(item) : (item[campo] as unknown as number);
    return total + (valor || 0);
  }, 0);
}

export function media(valores: (number | null | undefined)[]): number | null {
  const limpos = valores.filter((v): v is number => v != null && !Number.isNaN(v));
  return limpos.length ? limpos.reduce((s, v) => s + v, 0) / limpos.length : null;
}

export interface Grupo<T> {
  chave: string;
  itens: T[];
  massa: number;
  n: number;
  parte: number;
}

export function agrupar<T>(lista: T[], chave: (item: T) => string | null | undefined, valor: (item: T) => number): Grupo<T>[] {
  const grupos = new Map<string, Grupo<T>>();
  lista.forEach(item => {
    const k = chave(item);
    if (k == null) return;
    const atual = grupos.get(k) || { chave: k, itens: [] as T[], massa: 0, n: 0, parte: 0 };
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
