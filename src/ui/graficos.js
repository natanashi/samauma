/* SAMAÚMA — gráficos.
   Feitos à mão: barras em HTML, rosca e anel em SVG inline. Sem biblioteca,
   sem canvas e sem fonte remota. Cada gráfico recebe dados já calculados pelo
   domínio — nenhum deles soma nada por conta própria. */

/* Barras diárias. Cada coluna é um dia e se divide no que foi recuperado e no
   que virou rejeito: a diferença entre coletar e reciclar fica visível. */
function graficoSerie(serie, { rotulo = 'massa comprovada por dia', separarRejeito = true } = {}) {
  const max = Math.max(...serie.map(d => d.kg), 1);
  const total = somar(serie, 'kg');
  const reciclado = somar(serie, 'reciclado');

  const barras = serie.map(dia => {
    const altura = dia.kg ? Math.max(4, (dia.kg / max) * 100) : 2;
    const parteRejeito = dia.kg ? (dia.rejeito / dia.kg) * 100 : 0;
    const titulo = `${dia.rotulo} · ${Fmt.kg(dia.kg)} em ${dia.n} carga(s)` +
      (dia.kg ? ` · recuperado ${Fmt.kg(dia.reciclado)}, rejeito ${Fmt.kg(dia.rejeito)}` : '');
    return `<div class="col ${dia.hoje ? 'hoje' : ''} ${dia.kg ? '' : 'zero'}" title="${esc(titulo)}">
      <span class="haste" style="--h:${altura.toFixed(1)}%">
        ${separarRejeito && parteRejeito > 0 ? `<i class="rejeito" style="--r:${parteRejeito.toFixed(1)}%"></i>` : ''}
      </span>
      <span class="dia">${esc(dia.curto)}</span>
    </div>`;
  }).join('');

  return `<div class="serie">
    <div class="serie-topo">
      <span class="etiqueta">${esc(rotulo)}</span>
      <span class="serie-total num">${esc(Fmt.toneladas(total))} <small>em 14 dias</small></span>
    </div>
    <div class="barras">${barras}</div>
    ${separarRejeito ? `<div class="serie-legenda">
      <span><i class="amostra recuperado"></i>recuperado ${esc(Fmt.kg(reciclado))}</span>
      <span><i class="amostra rejeito"></i>rejeito ${esc(Fmt.kg(total - reciclado))}</span>
      <span><i class="amostra hoje"></i>hoje</span>
    </div>` : ''}
  </div>`;
}

/* Rosca de composição: o material dá a cor, aqui e em toda a interface. */
let _roscaSeq = 0;
function graficoRosca(itens, { centro = '', legenda = 'kg' } = {}) {
  if (!itens.length) return vazio('Sem material comprovado', 'A composição aparece quando o primeiro ciclo fechar.');

  const total = somar(itens, 'kg');
  const raio = 42;
  const volta = 2 * Math.PI * raio;
  const id = 'rosca-' + (++_roscaSeq);
  let deslocamento = 0;

  const arcos = itens.map(item => {
    const traco = (total ? item.kg / total : 0) * volta;
    const arco = `<circle class="arco" cx="50" cy="50" r="${raio}" stroke="${item.cor || '#8a9690'}"
      stroke-dasharray="${traco.toFixed(2)} ${(volta - traco).toFixed(2)}"
      stroke-dashoffset="${(-deslocamento).toFixed(2)}"><title>${esc(item.nome)}: ${esc(Fmt.kg(item.kg))}</title></circle>`;
    deslocamento += traco;
    return arco;
  }).join('');

  const linhas = itens.map(item => `<li>
    <span class="ponto" style="background:${item.cor || '#8a9690'}"></span>
    <span class="nome">${esc(item.nome)}</span>
    <span class="valor num">${legenda === 'renda' ? esc(Fmt.reais(item.renda)) : esc(Fmt.kg(item.kg))}</span>
    <span class="parte num">${esc(Fmt.percentual(item.parte, 0))}</span>
  </li>`).join('');

  return `<div class="composicao">
    <div class="rosca">
      <svg viewBox="0 0 100 100" role="img" aria-labelledby="${id}" focusable="false">
        <title id="${id}">Composição por material</title>
        <circle class="trilho" cx="50" cy="50" r="${raio}"/>
        <g transform="rotate(-90 50 50)">${arcos}</g>
      </svg>
      <div class="rosca-centro">${centro || `<b class="num">${esc(Fmt.toneladas(total))}</b><span>comprovados</span>`}</div>
    </div>
    <ul class="legenda">${linhas}</ul>
  </div>`;
}

/* Anel de progresso: meta, precisão, ocupação, taxa de recuperação. */
let _anelSeq = 0;
function anel(valor, { rotulo = '', nota = '', tom = 'verde', texto = null } = {}) {
  const pct = Math.max(0, Math.min(100, valor || 0));
  const raio = 42;
  const volta = 2 * Math.PI * raio;
  const preenchido = (pct / 100) * volta;
  const id = 'anel-' + (++_anelSeq);

  return `<div class="anel ${tom}">
    <svg viewBox="0 0 100 100" role="img" aria-labelledby="${id}" focusable="false">
      <title id="${id}">${esc(rotulo)}: ${esc(Fmt.percentual(pct, 0))}</title>
      <circle class="trilho" cx="50" cy="50" r="${raio}"/>
      <circle class="arco" cx="50" cy="50" r="${raio}" transform="rotate(-90 50 50)"
        stroke-dasharray="${preenchido.toFixed(2)} ${(volta - preenchido).toFixed(2)}"/>
    </svg>
    <div class="anel-centro">
      <b class="num">${texto || esc(Fmt.percentual(pct, 0))}</b>
      ${rotulo ? `<span>${esc(rotulo)}</span>` : ''}
    </div>
    ${nota ? `<div class="anel-nota">${esc(nota)}</div>` : ''}
  </div>`;
}

/* Ranking: barra proporcional com nome, valor e participação. */
function ranking(itens, { destacar = null, unidade = 'kg' } = {}) {
  if (!itens.length) return vazio('Sem dados ainda', 'O ranking aparece quando houver massa comprovada.');
  const maior = Math.max(...itens.map(i => i.massa), 1);
  return `<ol class="rank">${itens.map((item, i) => `
    <li class="${destacar && item.id === destacar ? 'eu' : ''} ${item.aterro ? 'aterro' : ''}">
      <span class="pos num">${i + 1}</span>
      <span class="dados">
        <span class="linha1"><b>${esc(item.nome)}</b>
          <span class="num">${unidade === 'reais' ? esc(Fmt.reais(item.renda)) : esc(Fmt.kg(item.massa))}</span></span>
        <span class="trilho"><span class="preenche" style="--p:${((item.massa / maior) * 100).toFixed(1)}%"></span></span>
        <span class="linha2">${esc(item.nota || '')}<span class="num">${esc(Fmt.percentual(item.parte, 0))}</span></span>
      </span>
    </li>`).join('')}</ol>`;
}

/* Barra única de recuperação: quanto do que entrou voltou ao ciclo produtivo
   e quanto seguiu para o aterro. É o indicador ambiental em uma linha. */
function barraRecuperacao(ambiental) {
  const taxa = ambiental.taxaRecuperacao || 0;
  return `<div class="recuperacao">
    <div class="barra-dupla" role="img"
      aria-label="Recuperado ${esc(Fmt.percentual(taxa, 0))}, rejeito ${esc(Fmt.percentual(100 - taxa, 0))}">
      <span class="recuperado" style="--p:${taxa.toFixed(1)}%"></span>
      <span class="rejeito" style="--p:${(100 - taxa).toFixed(1)}%"></span>
    </div>
    <div class="barra-dupla-legenda">
      <span><i class="amostra recuperado"></i><b class="num">${esc(Fmt.kg(ambiental.reciclado))}</b> recuperado</span>
      <span><i class="amostra rejeito"></i><b class="num">${esc(Fmt.kg(ambiental.rejeito))}</b> para o aterro</span>
    </div>
  </div>`;
}
