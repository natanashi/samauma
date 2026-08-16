/* SAMAÚMA — área da Prefeitura.
   O município inteiro: quem gera, quem coleta, quem recebe e o que virou prova.
   Nenhum indicador é digitado — todos derivam das demandas registradas. */

/* Um ícone de traço fino por indicador — mesma regra do resto do desenho:
   nada de biblioteca ou fonte remota. */
const ICONES_PAINEL = {
  predio: '<path d="M5 9.5v10h14v-10"/><path d="M3.3 9.5 12 4 20.7 9.5"/><path d="M10 19.5v-5.5h4v5.5"/>',
  tonelada: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M8 7V5.3a1.3 1.3 0 0 1 1.3-1.3h5.4A1.3 1.3 0 0 1 16 5.3V7"/><path d="M8 13h8"/>',
  moeda: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v8.8M14.6 9.6c0-1.1-1.1-1.7-2.6-1.7s-2.5.7-2.5 1.7c0 2.3 5.1.9 5.1 3.3 0 1.1-1.2 1.8-2.6 1.8s-2.7-.6-2.7-1.8"/>',
  grupo: '<circle cx="8.7" cy="9" r="3"/><circle cx="16.3" cy="10.2" r="2.4"/><path d="M2.8 19c0-3.3 2.6-5.3 5.9-5.3s5.9 2 5.9 5.3"/><path d="M15.2 14.2c2.5.3 4 2 4 4.8"/>',
  recibo: '<path d="M6 3.5h12v17l-2.4-1.6L13.2 20l-1.2-1.6L10.8 20l-2.4-1.1L6 20.5z"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5"/>',
  crescer: '<path d="M3.5 17.5 9 11l4 3.2 7.5-8.4"/><path d="M16.3 5.8h4.2V10"/>',
  relogio: '<circle cx="12" cy="12.5" r="8.3"/><path d="M12 7.6v5l3.6 2"/>',
  caminhao: '<path d="M2.8 8h11v9h-11z"/><path d="M13.8 11.2h4.1l3.3 3.1v2.7h-7.4z"/><circle cx="7.2" cy="19.3" r="1.8"/><circle cx="17.6" cy="19.3" r="1.8"/>',
  balanca: '<path d="M12 4v16M7 20h10"/><path d="M4.5 8h6M13.5 8h6"/><path d="M4.5 8 2 13a2.5 2.5 0 0 0 5 0zM19.5 8 17 13a2.5 2.5 0 0 0 5 0z"/>',
  pessoa: '<circle cx="12" cy="8.2" r="3.5"/><path d="M4.8 20.3c0-4.2 3.3-6.7 7.2-6.7s7.2 2.5 7.2 6.7"/>'
};
function iconePainel(nome, cor) {
  return `<span class="painel-icone" style="--cor-icone:${cor}" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONES_PAINEL[nome]}</svg>
  </span>`;
}

/* Linha fina em SVG: a variação da semana, sem precisar de biblioteca de
   gráfico só para isto. */
function centelha(valores, cor) {
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores, 0);
  const amplitude = max - min || 1;
  const pontos = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * 60;
    const y = 18 - ((v - min) / amplitude) * 16;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `<svg class="centelha" viewBox="0 0 60 18" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="${pontos}" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* Indicador do topo: ícone, número, e ou uma variação real semana a semana,
   ou uma linha de contexto — nunca uma variação inventada. */
function kpiPainel({ icone, cor, rotulo, valor, sub, variacao, pontos }) {
  const tendencia = variacao == null ? '' : `<span class="painel-kpi-delta ${variacao >= 0 ? 'sobe' : 'desce'}" title="desde a semana passada">
    ${variacao >= 0 ? '▲' : '▼'} ${esc(Fmt.variacao(Math.abs(variacao)))}</span>`;
  return `<div class="cartao painel-kpi">
    <div class="cartao-corpo">
      ${iconePainel(icone, cor)}
      <div class="painel-kpi-rotulo">${esc(rotulo)}</div>
      <div class="painel-kpi-valor num">${valor}</div>
      <div class="painel-kpi-pe">
        ${tendencia || `<span class="painel-kpi-sub">${esc(sub || '')}</span>`}
        ${pontos ? centelha(pontos, cor) : ''}
      </div>
    </div>
  </div>`;
}

/* Indicador menor, em grade — mesma peça do KPI do topo, só mais compacta:
   ícone alinhado com o rótulo (uma linha), nunca com o bloco inteiro — é o
   que mantém o ícone centrado a olho, não só na matemática. */
function indicadorPainel(icone, cor, rotulo, valor, sub) {
  return `<div class="indicador-painel">
    <div class="indicador-topo">${iconePainel(icone, cor)}<span class="indicador-rotulo">${esc(rotulo)}</span></div>
    <div class="indicador-valor num">${valor}</div>
    ${sub ? `<div class="indicador-sub">${esc(sub)}</div>` : ''}
  </div>`;
}

/* Conformidade ao longo do tempo: recuperação diária (linha) e o total
   desviado do aterro acumulado no período (área) — as duas únicas séries que
   o domínio realmente sustenta dia a dia, nada de mês fabricado. */
let _conformidadeSeq = 0;
function graficoConformidade(serie) {
  const taxas = serie.map(d => d.kg ? (d.reciclado / d.kg) * 100 : 0);
  let acumulado = 0;
  const acumulados = serie.map(d => (acumulado += d.reciclado) / 1000);
  const maiorAcumulado = Math.max(...acumulados, 1);
  const id = 'conf-' + (++_conformidadeSeq);

  const largura = 100, base = 82;
  const passo = largura / (serie.length - 1);
  const coords = (valores, max) => valores.map((v, i) => ({
    x: i * passo, y: base - (v / max) * base
  }));

  const paraPontos = pts => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const paraCirculos = (pts, tom) => pts.map(p =>
    `<circle class="ponto-linha ${tom}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.6"/>`).join('');

  const pTaxa = coords(taxas, 100);
  const pMassa = coords(acumulados, maiorAcumulado);
  const areaMassa = `${paraPontos(pMassa)} ${largura.toFixed(1)},${base} 0,${base}`;

  return `<div class="conformidade">
    <div class="conformidade-linha">
      <span class="eixo-y esquerda"><span>100%</span><span>50%</span><span>0%</span></span>
      <span class="meio">
        <svg viewBox="0 0 ${largura} 90" preserveAspectRatio="none" role="img" aria-label="Conformidade ao longo do tempo">
          <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--ouro-fundo)" stop-opacity=".22"/>
            <stop offset="1" stop-color="var(--ouro-fundo)" stop-opacity="0"/>
          </linearGradient></defs>
          ${[0, 1, 2, 3].map(i => `<line class="grade" x1="0" x2="${largura}" y1="${(base / 3) * i}" y2="${(base / 3) * i}"/>`).join('')}
          <polygon class="area" points="${areaMassa}" fill="url(#${id})"/>
          <polyline class="linha ouro" points="${paraPontos(pMassa)}"/>
          <polyline class="linha verde" points="${paraPontos(pTaxa)}"/>
          ${paraCirculos(pMassa, 'ouro')}${paraCirculos(pTaxa, 'verde')}
        </svg>
      </span>
      <span class="eixo-y direita"><span>${esc(Fmt.toneladas(maiorAcumulado * 1000))}</span><span>${esc(Fmt.toneladas(maiorAcumulado * 500))}</span><span>0 t</span></span>
    </div>
    <div class="conformidade-legenda">
      <span><i class="amostra verde"></i>Taxa de recuperação diária</span>
      <span><i class="amostra ouro"></i>Toneladas desviadas, acumulado no período</span>
    </div>
    <div class="conformidade-eixo">
      <span>${esc(serie[0].rotulo)}</span><span>${esc(serie[Math.floor(serie.length / 2)].rotulo)}</span><span>${esc(serie[serie.length - 1].rotulo)}</span>
    </div>
  </div>`;
}

/* Atividades recentes: os últimos eventos reais da trilha, de todas as
   demandas do município — nada digitado à parte, é a mesma trilha que
   aparece no comprovante. */
function atividadesRecentes(demandas, limite = 6) {
  const eventos = demandas.flatMap(d => d.eventos)
    .sort((a, b) => new Date(b.quando) - new Date(a.quando))
    .slice(0, limite);
  if (!eventos.length) return vazio('Sem atividade ainda', 'As primeiras demandas ainda não geraram eventos.');

  const quando = iso => mesmoDia(iso) ? `Hoje, ${Fmt.hora(iso)}`
    : mesmoDia(iso, new Date(Date.now() - 86400000)) ? `Ontem, ${Fmt.hora(iso)}`
      : Fmt.dataHora(iso);

  /* Mesma trilha do comprovante — cor por autoria já vem de lá. */
  return `<ol class="trilha">${eventos.map(ev => `
    <li data-autor="${esc(ev.autor)}">
      <span class="quando">${esc(quando(ev.quando))}</span>
      <b>${esc(ev.titulo)}</b>
      <p>${esc(ev.detalhe.split(' · ')[0])}</p>
    </li>`).join('')}</ol>`;
}

/* Maiores geradores por massa destinada com prova — a lista curta que a
   prefeitura mais consulta, em formato de tabela. */
function tabelaGeradores(geradores, limite = 6) {
  const maiores = geradores.slice().sort((a, b) => b.massa - a.massa).slice(0, limite);
  if (!maiores.length) return vazio('Sem destinação comprovada ainda', 'Os maiores geradores aparecem quando o primeiro ciclo fechar.');
  return `<div class="tabela-rolagem"><table class="tabela">
    <thead><tr><th>Estabelecimento</th><th>Ramo</th><th>Massa destinada</th><th>Situação</th></tr></thead>
    <tbody>${maiores.map(g => `<tr data-acao="gerador" data-id="${g.id}" tabindex="0">
      <td><b>${esc(g.nome)}</b></td>
      <td>${esc(g.ramo)}</td>
      <td class="num">${esc(Fmt.kg(g.massa))}</td>
      <td>${situacaoGerador(g.situacao)}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function telaPrefeituraPainel() {
  const p = Painel.municipio();
  const totalGeradores = p.geradores.length;
  const regularizados = p.geradores.filter(g => g.situacao.id === 'REGULAR').length;
  const cooperativasAtivas = p.cooperativas.filter(c => !c.autonomos).length;

  const semana = p.serie.slice(-7);
  const semanaAnterior = p.serie.slice(0, 7);
  const recicladoSemana = somar(semana, 'reciclado');
  const recicladoSemanaAnterior = somar(semanaAnterior, 'reciclado');
  const variacaoTonelada = recicladoSemanaAnterior ? ((recicladoSemana - recicladoSemanaAnterior) / recicladoSemanaAnterior) * 100 : null;
  const economiaSemana = (recicladoSemana / 1000) * TARIFA_ATERRO;
  const economiaSemanaAnterior = (recicladoSemanaAnterior / 1000) * TARIFA_ATERRO;
  const variacaoEconomia = economiaSemanaAnterior ? ((economiaSemana - economiaSemanaAnterior) / economiaSemanaAnterior) * 100 : null;

  return `
    <div class="painel-topo">
      <div>
        <h1>Visão geral</h1>
        <p>Acompanhe os principais indicadores e atividades do sistema.</p>
      </div>
      <div class="painel-topo-acoes">
        <span class="chip">Porto Velho / RO</span>
        <span class="chip">${esc(p.serie[0].rotulo)} – ${esc(p.serie[p.serie.length - 1].rotulo)}</span>
      </div>
    </div>

    <div class="painel-kpis">
      ${kpiPainel({ icone: 'predio', cor: 'var(--azul)', rotulo: 'Geradores regularizados', valor: regularizados, sub: `de ${totalGeradores} cadastrados` })}
      ${kpiPainel({ icone: 'tonelada', cor: 'var(--ouro-fundo)', rotulo: 'Toneladas desviadas de aterro', valor: esc(Fmt.toneladas(p.ambiental.reciclado)), variacao: variacaoTonelada, pontos: semana.map(d => d.reciclado) })}
      ${kpiPainel({ icone: 'moeda', cor: 'var(--ok)', rotulo: 'Economia realizada', valor: esc(Fmt.reais(p.financeiro.custoAterroEvitado)), variacao: variacaoEconomia, pontos: semana.map(d => d.reciclado) })}
      ${kpiPainel({ icone: 'grupo', cor: 'var(--raiz)', rotulo: 'Cooperativas ativas', valor: cooperativasAtivas, sub: `de ${COOPERATIVAS.length} cadastradas` })}
      ${kpiPainel({ icone: 'recibo', cor: 'var(--teal)', rotulo: 'Comprovantes emitidos', valor: p.comprovadas, sub: `${p.pendentes} pendência(s) em aberto` })}
    </div>

    ${cartao({
      titulo: 'Para onde vai o resíduo do município',
      sub: 'Massa comprovada, separada entre o que voltou ao ciclo e o que foi aterrado',
      corpo: `${barraRecuperacao(p.ambiental)}
        <div class="micro-kpis">
          <div><b class="num">${esc(Fmt.toneladas(p.ambiental.massaAterrada))}</b><span>enviada direto ao aterro</span></div>
          <div><b class="num">${p.ambiental.cargasAterro}</b><span>cargas de rejeito</span></div>
          <div><b class="num">${esc(Fmt.kg(Math.round(p.ambiental.co2Evitado)))}</b><span>CO₂e evitado</span></div>
        </div>`,
      nota: 'Massa coletada não é massa reciclada: o rejeito da triagem e o resíduo indiferenciado seguem para o aterro sanitário.'
    })}

    <div class="colunas painel-linha">
      ${cartao({
        titulo: 'Mapa de geradores', sub: 'Situação regulatória por ponto de coleta',
        acao: '<button class="btn sec sm" data-acao="aba" data-aba="mapa">Ver todos</button>',
        corpo: mapaPontos(p.geradores)
      })}
      ${cartao({ titulo: 'Conformidade ao longo do tempo', sub: `Últimos ${p.serie.length} dias`, corpo: graficoConformidade(p.serie) })}
      ${cartao({
        titulo: 'Atividades recentes', acao: '<button class="btn sec sm" data-acao="aba" data-aba="processos">Ver todas</button>',
        corpo: atividadesRecentes(Store.todas())
      })}
    </div>

    ${cartao({
      titulo: 'Indicadores principais', sub: 'Sem número digitado — tudo deriva das demandas registradas',
      corpo: `<div class="indicadores-painel">
        ${indicadorPainel('crescer', 'var(--ok)', 'Taxa de comprovação', esc(Fmt.percentual(p.taxaComprovacao, 0)), 'do que foi criado')}
        ${indicadorPainel('relogio', 'var(--azul)', 'Ciclo médio', esc(Fmt.duracao(p.cicloMedio)), 'da criação ao comprovante')}
        ${indicadorPainel('caminhao', 'var(--ouro-fundo)', 'Demandas em andamento', p.emAndamento, `${p.emTransporte} a caminho`)}
        ${indicadorPainel('balanca', 'var(--teal)', 'Divergência média', esc(Fmt.percentual(p.divergenciaMedia)), 'campo × balança')}
        ${indicadorPainel('moeda', 'var(--raiz)', 'Renda gerada p/ cooperados', esc(Fmt.reais(p.social.rendaCooperados)), `${p.social.cooperados} catador(es)`)}
        ${indicadorPainel('pessoa', 'var(--lima)', 'Renda média por catador', esc(Fmt.reais(p.social.rendaMediaPorCatador)), `${p.social.catadoresAtivos} ativos`)}
      </div>`
    })}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Maiores geradores', sub: 'Por massa destinada com prova',
        acao: '<button class="btn sec sm" data-acao="aba" data-aba="geradores">Ver todos</button>',
        corpo: tabelaGeradores(p.geradores)
      })}
      ${cartao({
        titulo: 'Desempenho das cooperativas', sub: 'Massa comprovada no período',
        corpo: ranking(p.cooperativas.filter(c => !c.autonomos).slice().sort((a, b) => b.massa - a.massa)
          .map(c => ({ ...c, nota: `${c.catadores} catador(es) · ${c.atendimentos} atendimento(s)` })))
      })}
    </div>

    ${blocoPendencias()}

    <div class="painel-rodape">
      <span>${iconePainel('grupo', 'var(--ok)')} Ambiente demonstrativo — dados fictícios para fins de apresentação.</span>
      <span class="painel-rodape-marca">Sistema SAMAÚMA · Desenvolvido para gestão inteligente de resíduos ${marca(28)}</span>
    </div>`;
}

function blocoPendencias() {
  const pendencias = Store.pendentes();
  if (!pendencias.length) {
    return cartao({ titulo: 'Pendências', corpo: aviso('Sem divergências abertas', 'Todas as cargas fecharam dentro da tolerância.', 'bom') });
  }
  return cartao({
    titulo: 'Onde existe problema',
    sub: `${pendencias.length} divergência(s) acima da tolerância`,
    classe: 'destaque-erro',
    corpo: listaDemandas(pendencias),
    nota: 'Divergência não é punição: o sistema mantém os dois registros e pede uma decisão humana.'
  });
}

/* O território: onde estão os grandes geradores e quanto sai de cada ponto. */
function telaPrefeituraMapa() {
  const p = Painel.municipio();

  return `
    ${cabecalho('Mapa dos grandes geradores', 'Cada círculo é um ponto de coleta; o tamanho é a massa destinada e a cor é a situação regulatória.')}

    ${kpis([
      kpi('Pontos com coleta', p.pontos.length, `de ${PONTOS.length} cadastrados`, { tom: 'marca' }),
      kpi('Bairros atendidos', p.bairros.length, 'com massa comprovada'),
      kpi('Zona com mais massa', p.zonas.length ? p.zonas[0].nome : '—', p.zonas.length ? Fmt.percentual(p.zonas[0].parte, 0) + ' do total' : ''),
      kpi('Geradores em atenção', p.atencao.length, 'fora do regular', { tom: p.atencao.length ? 'erro' : 'ok' })
    ])}

    ${cartao({
      titulo: 'Território',
      sub: 'Grandes geradores por ponto de coleta',
      corpo: mapaPontos(p.geradores),
      nota: 'Coordenadas aproximadas de bairros reais de Porto Velho, para demonstrar a leitura territorial. Não são dados do geoportal da Prefeitura.'
    })}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Pontos de coleta',
        sub: 'Massa comprovada por ponto',
        corpo: listaPontos(p.pontos)
      })}
      ${cartao({
        titulo: 'Zonas da cidade',
        sub: 'Distribuição territorial',
        corpo: ranking(p.zonas.map(z => ({ ...z, nota: z.n + ' carga(s)' })))
      })}
    </div>`;
}

/* Cadastro de geradores, ordenado por quem precisa de atenção primeiro. */
function telaPrefeituraGeradores(estado) {
  const geradores = Painel.geradores();
  const filtro = estado.filtro || 'atencao';
  const grupos = {
    atencao: g => g.situacao.id !== 'REGULAR',
    irregular: g => g.situacao.id === 'IRREGULAR',
    regularizacao: g => g.situacao.id === 'EM_REGULARIZACAO',
    regular: g => g.situacao.id === 'REGULAR',
    todos: () => true
  };

  return `
    ${cabecalho('Grandes geradores', 'Situação regulatória calculada a partir do PGRS, das pendências e da última destinação comprovada.',
      exportar('prefeitura'))}

    ${kpis([
      kpi('Irregulares', geradores.filter(grupos.irregular).length, 'sem PGRS válido ou sem destinar', { tom: 'erro' }),
      kpi('Em regularização', geradores.filter(grupos.regularizacao).length, 'com prazo ou pendência a resolver', { tom: 'alerta' }),
      kpi('Regulares', geradores.filter(grupos.regular).length, 'com plano válido e destinação em dia', { tom: 'ok' }),
      kpi('Massa dos irregulares', Fmt.toneladas(somar(geradores.filter(grupos.irregular), 'massa')), 'já destinada com prova')
    ])}

    ${filtros(geradores, grupos, filtro, [
      ['atencao', 'Precisam de atenção'], ['irregular', 'Irregulares'],
      ['regularizacao', 'Em regularização'], ['regular', 'Regulares'], ['todos', 'Todos']
    ])}

    ${listaGeradores(geradores.filter(grupos[filtro] || grupos.todos))}`;
}

/* Ficha do gerador, na visão de quem fiscaliza. */
function telaGeradorFicha(estado) {
  const p = Painel.gerador(estado.geradorId);
  const s = p.situacao;

  return `
    <button class="voltar" data-acao="voltar">Voltar</button>

    ${cabecalho(p.cadastro.nome, `${p.cadastro.ramo} · CNPJ ${p.cadastro.cnpj} · ${Catalogo.endereco(p.cadastro.ponto)}`,
      situacaoGerador(s))}

    ${kpis([
      kpi('Massa destinada', Fmt.toneladas(p.ambiental.massa), `${p.comprovadas} comprovante(s)`, { tom: 'marca' }),
      kpi('Taxa de recuperação', Fmt.percentual(p.ambiental.taxaRecuperacao, 0), 'do que saiu deste gerador', { tom: 'ok' }),
      kpi('Em andamento', p.emAberto + p.emTransporte, 'demandas em campo'),
      kpi('Pendências', p.pendencias, 'aguardando conciliação', { tom: p.pendencias ? 'erro' : 'ok' })
    ])}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Por que esta situação',
        sub: s.rotulo,
        classe: s.id === 'REGULAR' ? 'acao-viva bom' : 'destaque-erro',
        corpo: `<ul class="motivos">${s.motivos.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
          ${pares([
            ['PGRS', s.pgrs ? esc(s.pgrs.numero) : 'não cadastrado'],
            ['Validade', s.pgrs ? esc(Fmt.data(s.pgrs.validade)) : '—'],
            ['Última destinação', s.ultimaDestinacao ? esc(Fmt.data(s.ultimaDestinacao)) : 'nunca'],
            ['Operador contratado', p.operador ? esc(p.operador.nome) : 'sem operador'],
            ['Volume declarado', esc(Fmt.kg(p.cadastro.volumeMes)) + ' / mês'],
            ['Aderência ao declarado', esc(Fmt.percentual(p.aderencia ? p.aderencia.parte : null, 0))]
          ])}`
      })}
      ${cartao({ titulo: 'Composição', sub: 'O que este gerador destina', corpo: graficoRosca(p.materiais) })}
    </div>

    ${cartao({ titulo: 'Destinação dia a dia', sub: 'Últimos 14 dias', corpo: graficoSerie(p.serie) })}

    ${cartao({
      titulo: 'Processos deste gerador',
      sub: `${p.total} demanda(s)`,
      corpo: listaDemandas(p.demandas.slice(0, 10))
    })}`;
}

function telaProcessos(estado) {
  const filtro = estado.filtro || 'todas';
  const grupos = {
    todas: () => true,
    andamento: d => ['DISPONIVEL', 'ACEITA', 'EM_COLETA'].includes(d.status),
    transporte: d => d.status === 'COLETADA',
    pendentes: d => d.status === 'PENDENCIA',
    comprovadas: d => d.status === 'COMPROVADA'
  };
  const todas = Store.todas();

  return `
    ${cabecalho('Processos', 'Cada linha é uma demanda de destinação, do cadastro ao comprovante.', exportar('prefeitura'))}
    ${filtros(todas, grupos, filtro, [
      ['todas', 'Todas'], ['andamento', 'Em coleta'], ['transporte', 'A caminho'],
      ['pendentes', 'Pendentes'], ['comprovadas', 'Comprovadas']
    ])}
    ${listaDemandas(todas.filter(grupos[filtro] || grupos.todas), {
      vazioTitulo: 'Nenhum processo neste filtro',
      vazioTexto: 'Ajuste o filtro para ver outras situações.'
    })}`;
}
