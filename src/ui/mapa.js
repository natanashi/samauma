/* SAMAÚMA — mapa dos pontos de coleta.
   Mapa real, com ruas e rio de verdade: Leaflet + OpenStreetMap. É a única
   dependência externa do site — só ela precisa de internet para carregar os
   tiles; o resto do sistema continua funcionando sem rede.

   ATENÇÃO: as coordenadas dos pontos são aproximadas e demonstrativas. Não
   vieram do geoportal da Prefeitura de Porto Velho. O mapa em si (ruas, rio,
   bairros) é real — vem do OpenStreetMap. */

const CENTRO_PORTO_VELHO = [-8.7619, -63.9039];
const CORES_SITUACAO = { ok: '#2f8f5b', alerta: '#b6801c', erro: '#b5453b', marca: '#1f6b4a' };

/* Guardado fora da função porque o HTML é montado numa hora e o mapa
   inicializado depois, quando o <div> já está no DOM (ver app.js). */
let _mapaLeafletDados = null;

function mapaPontos(itens, { titulo = 'Grandes geradores', legenda = 'situacao' } = {}) {
  const comCoordenada = itens.filter(i => i.lat != null && i.lng != null);
  if (!comCoordenada.length) {
    _mapaLeafletDados = null;
    return vazio('Sem pontos para mostrar', 'Cadastre o ponto de coleta do gerador.');
  }
  _mapaLeafletDados = { itens: comCoordenada, legenda };

  return `<div class="mapa">
    <div id="mapaLeaflet" class="mapa-leaflet" role="img" aria-label="${esc(titulo)} no território"></div>
    <div class="mapa-legenda">
      <span><i class="amostra ok"></i>regular</span>
      <span><i class="amostra alerta"></i>em regularização</span>
      <span><i class="amostra erro"></i>irregular</span>
      <span class="mapa-nota">tamanho do círculo = massa destinada · ruas e rio são reais (OpenStreetMap) · coordenadas dos pontos são aproximadas</span>
    </div>
  </div>`;
}

/* Chamado por app.js depois que o HTML entra no DOM. Destrói o mapa anterior
   (a tela inteira é remontada a cada navegação) e sobe um novo, se houver
   onde montar. */
function inicializarMapaLeaflet(aoClicar) {
  if (window._mapaLeafletInstancia) {
    window._mapaLeafletInstancia.remove();
    window._mapaLeafletInstancia = null;
  }
  const alvo = document.getElementById('mapaLeaflet');
  if (!alvo || typeof L === 'undefined' || !_mapaLeafletDados) return;

  const { itens, legenda } = _mapaLeafletDados;
  const mapa = L.map(alvo, { scrollWheelZoom: false }).setView(CENTRO_PORTO_VELHO, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(mapa);

  const maiorMassa = Math.max(...itens.map(i => i.massa || 0), 1);
  const grupo = [];
  itens.forEach(item => {
    const tom = legenda === 'situacao' && item.situacao ? item.situacao.tom : 'marca';
    const raio = 7 + Math.sqrt((item.massa || 0) / maiorMassa) * 13;
    const marcador = L.circleMarker([item.lat, item.lng], {
      radius: raio, color: '#fff', weight: 2,
      fillColor: CORES_SITUACAO[tom] || CORES_SITUACAO.marca, fillOpacity: .85
    }).bindPopup(`<b>${escapar(item.nome)}</b><br>${escapar(item.bairro)} · ${Fmt.kg(item.massa)}` +
      (item.situacao ? `<br>${escapar(item.situacao.rotulo)}` : ''));
    if (item.id && aoClicar) marcador.on('click', () => aoClicar(item.id));
    marcador.addTo(mapa);
    grupo.push(marcador);
  });

  if (grupo.length > 1) mapa.fitBounds(L.featureGroup(grupo).getBounds().pad(0.25));
  window._mapaLeafletInstancia = mapa;
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
