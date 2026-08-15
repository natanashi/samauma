/* SAMAÚMA — mapa dos pontos de coleta.
   Projeção linear simples de latitude e longitude sobre um retângulo: sem
   biblioteca de mapa, sem tile remoto e sem chave de API. Serve para ler o
   território, não para navegar.

   ATENÇÃO: as coordenadas são aproximadas e demonstrativas. Não vieram do
   geoportal da Prefeitura de Porto Velho. Trocar a tabela de PONTOS por uma
   camada oficial não muda nada aqui — a projeção é a mesma. */

const LARGURA_MAPA = 720;
const ALTURA_MAPA = 460;
const MARGEM_MAPA = 46;

function mapaPontos(itens, { titulo = 'Grandes geradores', legenda = 'situacao' } = {}) {
  const comCoordenada = itens.filter(i => i.lat != null && i.lng != null);
  if (!comCoordenada.length) return vazio('Sem pontos para mostrar', 'Cadastre o ponto de coleta do gerador.');

  const lats = comCoordenada.map(i => i.lat);
  const lngs = comCoordenada.map(i => i.lng);
  const limites = {
    norte: Math.max(...lats), sul: Math.min(...lats),
    leste: Math.max(...lngs), oeste: Math.min(...lngs)
  };
  /* Margem em grau para os pontos não colarem na borda. */
  const folgaY = Math.max((limites.norte - limites.sul) * 0.16, 0.008);
  const folgaX = Math.max((limites.leste - limites.oeste) * 0.12, 0.008);

  const x = lng => MARGEM_MAPA + ((lng - (limites.oeste - folgaX)) /
    ((limites.leste + folgaX) - (limites.oeste - folgaX))) * (LARGURA_MAPA - MARGEM_MAPA * 2);
  const y = lat => MARGEM_MAPA + (((limites.norte + folgaY) - lat) /
    ((limites.norte + folgaY) - (limites.sul - folgaY))) * (ALTURA_MAPA - MARGEM_MAPA * 2);

  const maiorMassa = Math.max(...comCoordenada.map(i => i.massa || 0), 1);
  const raio = massa => 7 + Math.sqrt((massa || 0) / maiorMassa) * 15;

  /* Ordena do maior para o menor para que o pequeno fique por cima e clicável. */
  const marcas = comCoordenada.slice().sort((a, b) => (b.massa || 0) - (a.massa || 0)).map(item => {
    const tom = legenda === 'situacao' && item.situacao ? item.situacao.tom : 'marca';
    const titulo = `${item.nome} · ${item.bairro} · ${Fmt.kg(item.massa)}` +
      (item.situacao ? ` · ${item.situacao.rotulo}` : '');
    return `<g class="marca-mapa ${tom}" data-acao="gerador" data-id="${item.id}" role="button" tabindex="0"
      aria-label="${esc(titulo)}">
      <title>${esc(titulo)}</title>
      <circle class="halo" cx="${x(item.lng).toFixed(1)}" cy="${y(item.lat).toFixed(1)}" r="${(raio(item.massa) + 6).toFixed(1)}"/>
      <circle class="ponto" cx="${x(item.lng).toFixed(1)}" cy="${y(item.lat).toFixed(1)}" r="${raio(item.massa).toFixed(1)}"/>
    </g>`;
  }).join('');

  /* Rótulos dos bairros, um por bairro, no ponto de maior massa. */
  const porBairro = new Map();
  comCoordenada.forEach(i => {
    const atual = porBairro.get(i.bairro);
    if (!atual || (i.massa || 0) > (atual.massa || 0)) porBairro.set(i.bairro, i);
  });
  const rotulos = [...porBairro.values()].map(item =>
    `<text class="rotulo-bairro" x="${x(item.lng).toFixed(1)}" y="${(y(item.lat) - raio(item.massa) - 9).toFixed(1)}"
      text-anchor="middle">${esc(item.bairro)}</text>`).join('');

  return `<div class="mapa">
    <svg viewBox="0 0 ${LARGURA_MAPA} ${ALTURA_MAPA}" role="img" aria-label="${esc(titulo)} no território"
      preserveAspectRatio="xMidYMid meet">
      <rect class="fundo-mapa" x="0" y="0" width="${LARGURA_MAPA}" height="${ALTURA_MAPA}" rx="18"/>
      <g class="grade-mapa">
        ${[1, 2, 3].map(i => `<line x1="0" y1="${(ALTURA_MAPA / 4) * i}" x2="${LARGURA_MAPA}" y2="${(ALTURA_MAPA / 4) * i}"/>`).join('')}
        ${[1, 2, 3].map(i => `<line x1="${(LARGURA_MAPA / 4) * i}" y1="0" x2="${(LARGURA_MAPA / 4) * i}" y2="${ALTURA_MAPA}"/>`).join('')}
      </g>
      ${rotulos}
      ${marcas}
    </svg>
    <div class="mapa-legenda">
      <span><i class="amostra ok"></i>regular</span>
      <span><i class="amostra alerta"></i>em regularização</span>
      <span><i class="amostra erro"></i>irregular</span>
      <span class="mapa-nota">tamanho do círculo = massa destinada · coordenadas aproximadas, não oficiais</span>
    </div>
  </div>`;
}

/* Lista de pontos de coleta com massa e participação — a leitura do mapa em
   texto, para quem precisa do número e não do desenho. */
function listaPontos(pontos) {
  if (!pontos.length) return vazio('Nenhum ponto com coleta comprovada', 'Os pontos aparecem quando o primeiro ciclo fechar.');
  const maior = Math.max(...pontos.map(p => p.massa), 1);
  return `<ol class="pontos">${pontos.map(ponto => `
    <li>
      <span class="dados">
        <span class="linha1"><b>${esc(ponto.nome)}</b><span class="num">${esc(Fmt.kg(ponto.massa))}</span></span>
        <span class="trilho"><span class="preenche" style="--p:${((ponto.massa / maior) * 100).toFixed(1)}%"></span></span>
        <span class="linha2">${esc(ponto.bairro)} · ${esc(ponto.zona)} · ${ponto.n} carga(s)
          <span class="num">recuperado ${esc(Fmt.percentual(ponto.massa ? (ponto.reciclado / ponto.massa) * 100 : 0, 0))}</span></span>
      </span>
    </li>`).join('')}</ol>`;
}
