/* SAMAÚMA — entrada.
   As quatro portas na ordem do ciclo, com o que cada usuário tem acesso e por
   onde ele entra. A definição dos perfis mora aqui porque é o que a entrada
   apresenta e o que a moldura usa para montar as abas. */

const PERFIS = {
  gerador: {
    id: 'gerador',
    nome: 'Gerador',
    cor: '#2a6fa8',
    resumo: 'Declara o que precisa destinar e acompanha a coleta.',
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'demandas', rotulo: 'Demandas' },
      { id: 'documentos', rotulo: 'Documentos' },
      { id: 'relatorios', rotulo: 'Relatórios' }
    ],
    entradas: [{ rotulo: 'Entrar como gerador' }]
  },

  /* O catador é usuário por si — cooperado ou autônomo. O vínculo muda o que
     ele enxerga da equipe, nunca o que ele pode fazer. É dele a única massa do
     sistema que nasce de observação em campo, antes de qualquer balança. */
  catador: {
    id: 'catador',
    nome: 'Catador',
    cor: '#b8791f',
    resumo: 'Aceita a demanda, coleta, pesa em campo e registra o atendimento.',
    abas: [
      { id: 'dia', rotulo: 'Meu dia' },
      { id: 'disponiveis', rotulo: 'Disponíveis' },
      { id: 'minhas', rotulo: 'Minhas coletas' },
      { id: 'painel', rotulo: 'Meu painel' }
    ],
    entradas: [
      { rotulo: 'Entrar como catador', catador: 'cat-01' },
      { rotulo: 'ou como catadora autônoma', catador: 'cat-05', secundaria: true }
    ]
  },

  /* A cooperativa é quem recebe: pesa na balança, separa o que é rejeito e
     confirma o destino do material — o antigo perfil "Destinatário", só com
     o nome que a organização usa no dia a dia. Foco só no recebimento e no
     rastreio; nada de tela de coleta aqui. */
  cooperativa: {
    id: 'cooperativa',
    nome: 'Cooperativa',
    cor: '#c98f2a',
    resumo: 'Recebe a carga, pesa e confirma o destino do material.',
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'fila', rotulo: 'A caminho' },
      { id: 'recebidas', rotulo: 'Recebidas' },
      { id: 'relatorios', rotulo: 'Relatórios' }
    ],
    entradas: [
      { rotulo: 'Entrar como cooperativa', destino: 'dst-01' },
      { rotulo: 'ou como aterro sanitário', destino: 'dst-04', secundaria: true }
    ]
  },

  prefeitura: {
    id: 'prefeitura',
    nome: 'Prefeitura',
    cor: '#1f6b4a',
    resumo: 'Acompanha o ciclo e monitora os indicadores do município.',
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'mapa', rotulo: 'Mapa' },
      { id: 'geradores', rotulo: 'Geradores' },
      { id: 'processos', rotulo: 'Processos' },
      { id: 'metodologia', rotulo: 'Metodologia' }
    ],
    entradas: [{ rotulo: 'Entrar como prefeitura' }]
  }
};

/* Ordem do ciclo: quem gera, quem cata, quem recebe, quem fiscaliza. */
const ORDEM_PERFIS = ['gerador', 'catador', 'cooperativa', 'prefeitura'];

/* Um ícone de traço fino por perfil — nada de biblioteca ou fonte remota,
   mesma regra do resto do desenho. */
const ICONES_PERFIL = {
  gerador: '<path d="M4 10v9.5h16V10"/><path d="M2.5 10 12 3.2 21.5 10"/><path d="M9.3 19.5v-6h5.4v6"/>',
  catador: '<circle cx="9.2" cy="4.6" r="2.1"/><path d="M9.2 8v5.4l3.4 2.4"/><path d="M6.6 9.4 9.2 8l3.6 1.9 2.9-.7"/><path d="M8.4 13.4 6.6 20"/><path d="M15.2 12.6h5.3l-1 7.4h-5.9l1.6-7.4z"/>',
  cooperativa: '<path d="M2.7 7.8h10.6v8.8H2.7z"/><path d="M13.3 11h3.9l3.1 3v2.6h-7z"/><circle cx="7" cy="18.3" r="1.7"/><circle cx="17" cy="18.3" r="1.7"/>',
  prefeitura: '<path d="M3 9.6 12 4.3l9 5.3"/><path d="M4.2 9.6v9.4M8.6 9.6v9.4M15.4 9.6v9.4M19.8 9.6v9.4"/><path d="M2.5 20.5h19"/>'
};

function telaEntrada() {
  return ORDEM_PERFIS.map(chave => {
    const p = PERFIS[chave];
    const entradas = p.entradas.map(e =>
      `<button class="${e.secundaria ? 'porta-secundaria' : 'btn'}" data-acao="perfil" data-perfil="${p.id}"
        ${e.catador ? `data-catador="${e.catador}"` : ''}${e.destino ? `data-destino="${e.destino}"` : ''}>
        ${esc(e.rotulo)}${e.secundaria ? '' : ' <span class="seta">→</span>'}
      </button>`).join('');

    return `<article class="porta" style="--cor-perfil:${p.cor}">
      <span class="porta-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONES_PERFIL[p.id]}</svg></span>
      <h2>${esc(p.nome)}</h2>
      <p>${esc(p.resumo)}</p>
      <div class="porta-acoes">${entradas}</div>
    </article>`;
  }).join('');
}
