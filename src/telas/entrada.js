/* SAMAÚMA — entrada.
   As quatro portas na ordem do ciclo, com o que cada usuário tem acesso e por
   onde ele entra. A definição dos perfis mora aqui porque é o que a entrada
   apresenta e o que a moldura usa para montar as abas. */

const PERFIS = {
  gerador: {
    id: 'gerador',
    nome: 'Gerador',
    papel: 'QUEM GERA O RESÍDUO',
    cor: '#2a6fa8',
    resumo: 'Declara o que precisa destinar, acompanha a coleta e responde pela regularidade.',
    itens: ['Situação regulatória e PGRS', 'Próxima coleta e histórico', 'Comprovantes, selo e relatório mensal'],
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'demandas', rotulo: 'Demandas' },
      { id: 'documentos', rotulo: 'Documentos' },
      { id: 'relatorios', rotulo: 'Relatórios' }
    ],
    entradas: [{ rotulo: 'Entrar como Mercado Ipê Roxo', nota: 'grande gerador · Nova Porto Velho' }]
  },

  catador: {
    id: 'catador',
    nome: 'Catador',
    papel: 'QUEM EXECUTA A COLETA',
    cor: '#c98f2a',
    resumo: 'Recebe e escolhe demandas, coleta, pesa e registra o atendimento.',
    itens: ['Coletas de hoje e próxima coleta', 'Endereço, tipo e volume estimado', 'Valor gerado, histórico e comprovantes'],
    abas: [
      { id: 'dia', rotulo: 'Meu dia' },
      { id: 'disponiveis', rotulo: 'Disponíveis' },
      { id: 'minhas', rotulo: 'Minhas coletas' },
      { id: 'painel', rotulo: 'Meu painel' }
    ],
    entradas: [
      { rotulo: 'Entrar como João Silva', nota: 'cooperado da CATANORTE', catador: 'cat-01' },
      { rotulo: 'Entrar como Maria Duarte', nota: 'catadora autônoma', catador: 'cat-05', secundaria: true }
    ]
  },

  destinatario: {
    id: 'destinatario',
    nome: 'Destinatário',
    papel: 'QUEM RECEBE E FECHA O CICLO',
    cor: '#2a8c7a',
    resumo: 'Recebe a carga, pesa na balança e declara o destino dado ao material.',
    itens: ['Recebimentos de hoje e cargas aguardadas', 'Peso, origem e data/hora', 'Destino do material e comprovantes'],
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'fila', rotulo: 'A caminho' },
      { id: 'recebidas', rotulo: 'Recebidas' },
      { id: 'relatorios', rotulo: 'Relatórios' }
    ],
    entradas: [
      { rotulo: 'Entrar como Galpão CATANORTE', nota: 'central de triagem · papel, papelão e plástico' },
      { rotulo: 'Entrar como Aterro Sanitário', nota: 'disposição final · rejeito', destino: 'dst-04', secundaria: true }
    ]
  },

  prefeitura: {
    id: 'prefeitura',
    nome: 'Prefeitura',
    papel: 'QUEM ACOMPANHA E FISCALIZA',
    cor: '#1f6b4a',
    resumo: 'Enxerga o município inteiro: quem gera, quem coleta, quem recebe e o que virou prova.',
    itens: ['Mapa dos grandes geradores', 'Geradores que precisam de atenção', 'Indicadores ambientais, sociais e financeiros'],
    abas: [
      { id: 'painel', rotulo: 'Painel' },
      { id: 'mapa', rotulo: 'Mapa' },
      { id: 'geradores', rotulo: 'Geradores' },
      { id: 'processos', rotulo: 'Processos' }
    ],
    entradas: [{ rotulo: 'Entrar como Prefeitura', nota: 'Secretaria Municipal de Meio Ambiente' }]
  }
};

/* Ordem do ciclo: quem gera, quem coleta, quem recebe, quem fiscaliza. */
const ORDEM_PERFIS = ['gerador', 'catador', 'destinatario', 'prefeitura'];

function telaEntrada() {
  return ORDEM_PERFIS.map((chave, i) => {
    const p = PERFIS[chave];
    const entradas = p.entradas.map(e =>
      `<button class="btn ${e.secundaria ? 'sec' : ''}" data-acao="perfil" data-perfil="${p.id}"
        ${e.catador ? `data-catador="${e.catador}"` : ''}${e.destino ? `data-destino="${e.destino}"` : ''}>
        <span>${esc(e.rotulo)}</span>${e.nota ? `<small>${esc(e.nota)}</small>` : ''}
      </button>`).join('');

    return `<article class="porta" style="--cor-perfil:${p.cor}">
      <div class="porta-topo">
        <span class="ordem num">${i + 1}</span>
        <span class="papel">${esc(p.papel)}</span>
      </div>
      <h2>${esc(p.nome)}</h2>
      <p>${esc(p.resumo)}</p>
      <ul>${p.itens.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
      <div class="porta-acoes">${entradas}</div>
    </article>`;
  }).join('');
}
