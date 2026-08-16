/* SAMAÚMA — entrada.
   As quatro portas na ordem do ciclo. A entrada é por categoria de uso, nunca
   por pessoa ou organização: quem entra escolhe o papel que exerce, e o sistema
   abre a área correspondente com o cadastro demonstrativo daquele papel.
   A definição dos perfis mora aqui porque é o que a entrada apresenta e o que a
   moldura usa para montar as abas. */

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
    ]
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
    ]
  }
};

/* Ordem do ciclo: quem gera, quem coleta, quem recebe, quem fiscaliza. */
const ORDEM_PERFIS = ['gerador', 'catador', 'destinatario', 'prefeitura'];

/* Cada porta é inteira clicável: o cartão é o botão. Sem nome de pessoa e sem
   organização no rótulo — a área abre com o cadastro demonstrativo do papel. */
function telaEntrada() {
  return ORDEM_PERFIS.map((chave, i) => {
    const p = PERFIS[chave];
    return `<article class="porta" style="--cor-perfil:${p.cor}"
      data-acao="perfil" data-perfil="${p.id}" role="button" tabindex="0"
      aria-label="Entrar na área ${esc(p.nome)}">
      <div class="porta-topo">
        <span class="ordem num">${i + 1}</span>
        <span class="papel">${esc(p.papel)}</span>
      </div>
      <h2>${esc(p.nome)}</h2>
      <p>${esc(p.resumo)}</p>
      <ul>${p.itens.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
      <span class="porta-entrar">Entrar nesta área<i aria-hidden="true">›</i></span>
    </article>`;
  }).join('');
}
