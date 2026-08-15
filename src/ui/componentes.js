/* SAMAÚMA — componentes de interface.
   As peças que todas as telas montam: marca, cartão, indicador, aviso, filtro,
   pino de situação, faixa de identidade e selo. Cada função devolve HTML e não
   conhece nenhuma tela em particular. */

const esc = escapar;

/* ------------------------------------------------------------------ marca */

/* A marca é o arquivo `assets/logo.png`. Enquanto ele não existir, o símbolo
   desenhado em SVG assume o lugar — a interface nunca fica com imagem quebrada.
   `forma` escolhe entre o logotipo inteiro e só o símbolo, recortado por CSS. */
function marca(tamanho = 44, forma = 'simbolo') {
  const completa = forma === 'completa';
  /* Na reserva do logotipo inteiro o nome vem junto: sem o arquivo, a marca
     continua se apresentando. */
  const assinatura = completa
    ? '<b>SAMAÚMA</b><small>Sistema de Grandes Geradores e Inclusão Produtiva</small>'
    : '';
  return `<span class="${completa ? 'marca-completa' : 'marca-simbolo'}" style="--tam:${tamanho}px">
    <img src="assets/logo.png" alt="SAMAÚMA"
      onerror="this.hidden=true;this.nextElementSibling.hidden=false">
    <span class="marca-desenho" hidden>${simbolo()}${assinatura}</span>
  </span>`;
}

/* Reserva: a samaúma em traço dentro do anel do ciclo, desenhada em código. */
let _simboloSeq = 0;
function simbolo() {
  const id = 'ciclo-' + (++_simboloSeq);
  return `<svg viewBox="0 0 64 64" role="img" aria-label="SAMAÚMA" focusable="false">
    <defs>
      <linearGradient id="${id}" x1="6" y1="58" x2="58" y2="6" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#e0a93a"/><stop offset=".38" stop-color="#8fbb3f"/>
        <stop offset=".7" stop-color="#2f8f5b"/><stop offset="1" stop-color="#2a6fa8"/>
      </linearGradient>
    </defs>
    <g fill="none" stroke="url(#${id})" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M46.5 9.4A27 27 0 0 1 55 41.6"/><path d="M55.6 33.6 55.2 42l-7.4-3.6"/>
      <path d="M17.5 54.6A27 27 0 0 1 9 22.4"/><path d="M8.4 30.4 8.8 22l7.4 3.6"/>
      <path d="M24.6 27.4a5.6 5.6 0 0 1 2.6-8.6 6.4 6.4 0 0 1 11.4-.6 5.6 5.6 0 0 1 3.2 8.8"/>
      <path d="M24.6 27.4a4.6 4.6 0 0 0 4 3.2h9.4a4.6 4.6 0 0 0 3.8-3.2"/>
      <path d="M32 18.6v20"/><path d="M32 25.6 27.4 21M32 25.6l4.6-4.6"/>
      <path d="M32 38.6c-4.6 0-6.2 2.2-6.2 6M32 38.6c4.6 0 6.2 2.2 6.2 6M32 38.6v6.2"/>
    </g>
    <g fill="url(#${id})">
      <circle cx="25.8" cy="46.6" r="2.1"/><circle cx="32" cy="47" r="2.1"/><circle cx="38.2" cy="46.6" r="2.1"/>
    </g>
  </svg>`;
}

/* A assinatura de três traços que fecha o logotipo. */
function tri() {
  return '<span class="tri" aria-hidden="true"><i></i><i></i><i></i></span>';
}

/* --------------------------------------------------------------- moldura */

function cabecalho(titulo, texto, acao) {
  return `<div class="cabecalho">
    <div><h2>${esc(titulo)}</h2>${tri()}${texto ? `<p>${esc(texto)}</p>` : ''}</div>
    ${acao ? `<div class="acoes">${acao}</div>` : ''}
  </div>`;
}

function cartao({ titulo, sub, acao, corpo, nota, classe = '' }) {
  return `<section class="cartao ${classe}">
    ${titulo ? `<header class="cartao-topo">
      <div><h3>${esc(titulo)}</h3>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
      ${acao || ''}
    </header>` : ''}
    <div class="cartao-corpo">${corpo}</div>
    ${nota ? `<div class="cartao-nota">${esc(nota)}</div>` : ''}
  </section>`;
}

/* Indicador: rótulo em versalete, número grande, uma linha de contexto. */
function kpi(rotulo, valor, sub, { tom = '', variacao = null, destaque = false } = {}) {
  const seta = variacao == null ? '' :
    `<span class="delta ${variacao >= 0 ? 'sobe' : 'desce'}">${variacao >= 0 ? '▲' : '▼'} ${esc(Fmt.variacao(Math.abs(variacao)))}</span>`;
  return `<div class="kpi ${tom} ${destaque ? 'destaque' : ''}">
    <div class="rot">${esc(rotulo)}</div>
    <div class="val num">${valor}${seta}</div>
    <div class="sub">${esc(sub || '')}</div>
  </div>`;
}

function kpis(lista) {
  return `<div class="kpis">${lista.join('')}</div>`;
}

/* Lista de pares rótulo/valor: a tabela mais simples possível, sem tabela. */
function pares(itens) {
  return `<dl class="pares">${itens.map(([rotulo, valor, tom]) => `
    <div><dt>${esc(rotulo)}</dt><dd class="num ${tom || ''}">${valor}</dd></div>`).join('')}</dl>`;
}

function aviso(titulo, texto, tom = '') {
  return `<div class="aviso ${tom}"><b>${esc(titulo)}</b><span>${esc(texto)}</span></div>`;
}

function vazio(titulo, texto) {
  return `<div class="vazio">${marca(38)}<b>${esc(titulo)}</b><span>${esc(texto)}</span></div>`;
}

function pino(rotulo, tom) {
  return `<span class="pino ${tom}">${esc(rotulo)}</span>`;
}

function situacaoDemanda(demanda) {
  return pino(Demanda.rotulo(demanda), STATUS[demanda.status].tom);
}

function situacaoGerador(situacao) {
  return pino(situacao.rotulo, situacao.tom);
}

function filtros(todas, grupos, atual, rotulos) {
  return `<div class="filtros">${rotulos.map(([chave, rotulo]) => {
    const n = todas.filter(grupos[chave]).length;
    return `<button class="${atual === chave ? 'on' : ''}" data-acao="filtro" data-filtro="${chave}">
      ${esc(rotulo)}<span class="n num">${n}</span></button>`;
  }).join('')}</div>`;
}

/* Botões de exportação: o mesmo par em todas as áreas, sempre no escopo do
   perfil — nunca só a demanda aberta. */
function exportar(escopo, rotulo = 'Exportar') {
  return `<div class="exportar">
    <span class="etiqueta">${esc(rotulo)}</span>
    <button class="btn sec sm" data-acao="csv" data-escopo="${escopo}">CSV</button>
    <button class="btn sec sm" data-acao="pdf" data-escopo="${escopo}">PDF</button>
  </div>`;
}

/* Faixa de identidade: quem sou eu neste perfil, com meus números do lado. */
function faixaPerfil({ nome, papel, medidas, acao }) {
  return `<div class="faixa-perfil">
    <div class="identidade">
      ${marca(36)}
      <div><b>${esc(nome)}</b><span>${esc(papel)}</span></div>
    </div>
    <div class="medidas">${medidas.map(([valor, rotulo]) =>
      `<div><b class="num">${valor}</b><span>${esc(rotulo)}</span></div>`).join('')}</div>
    ${acao ? `<div class="faixa-acao">${acao}</div>` : ''}
  </div>`;
}

/* O selo de destinação do gerador: existe quando há prova, e diz o porquê
   quando não existe. */
function seloDestinacao(selo) {
  if (!selo.valido) {
    return `<div class="selo pendente">
      <div class="selo-marca">${marca(48)}</div>
      <div class="selo-texto">
        <span class="etiqueta">Selo de destinação</span>
        <b>Não emitido</b>
        <p>${esc(selo.situacao.motivos[0])}</p>
      </div>
    </div>`;
  }
  return `<div class="selo">
    <div class="selo-marca">${marca(48)}</div>
    <div class="selo-texto">
      <span class="etiqueta">Selo de destinação · competência ${esc(selo.competencia)}</span>
      <b class="mono">${esc(selo.codigo)}</b>
      <p>${esc(Fmt.kg(selo.massa))} com destinação comprovada em ${selo.comprovantes} carga(s).</p>
      <small class="mono">${esc(selo.verificacao)}</small>
    </div>
    ${tri()}
  </div>`;
}
