/* SAMAÚMA — integrações com fontes oficiais.
   O sistema não inventa outra verdade: consome o que a Prefeitura já publica.

   Esta é a primeira integração real e viva do protótipo — a API pública de
   contratos do Município. Ela responde em JSON, libera CORS e não exige chave,
   então o navegador consulta direto, sem servidor intermediário. Se a rede
   falhar, a tela diz isso e o resto do sistema continua funcionando. */

const API_CONTRATOS = 'https://api.portovelho.ro.gov.br/api/v1/contratos';

/* Malha oficial do municipio, direto do IBGE: GeoJSON publico, sem chave e com
   CORS liberado. E o contorno de Porto Velho desenhado por quem tem competencia
   para defini-lo, em vez de uma linha inventada pelo prototipo. */
const API_MALHA_IBGE = 'https://servicodados.ibge.gov.br/api/v3/malhas/municipios/1100205?formato=application/vnd.geo+json';

/* Toda consulta externa desiste em oito segundos. Sem isso, uma API pendurada
   deixa o cartao em "consultando" para sempre. */
const LIMITE_ESPERA = 8000;

function buscarComLimite(url, opcoes = {}) {
  if (typeof AbortController === 'undefined') return fetch(url, opcoes);
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), LIMITE_ESPERA);
  return fetch(url, { ...opcoes, signal: controle.signal })
    .finally(() => clearTimeout(relogio));
}

/* Palavras que identificam contrato ligado a resíduo e limpeza urbana. A busca
   é feita aqui porque a API não expõe filtro por texto do objeto. */
const TERMOS_LIMPEZA = ['RESÍDUO', 'RESIDUO', 'LIMPEZA', 'COLETA', 'RECICL', 'VARRI', 'ATERRO', 'ENTULHO'];

/* Uma consulta por sessão: o resultado fica em memória entre as renderizações. */
let contratosCache = null;
let contratosEstado = 'inicial';

function blocoIntegracaoContratos() {
  return cartao({
    titulo: 'Contratos municipais de limpeza urbana',
    sub: 'Consulta ao vivo na API pública de contratos da Prefeitura',
    corpo: `<div id="integracaoContratos" class="integracao">
      <p class="integracao-espera">Consultando <code>api.portovelho.ro.gov.br</code>…</p>
    </div>`,
    nota: 'Fonte oficial, sem chave de acesso e sem servidor intermediário. Os demais números desta tela vêm do cenário demonstrativo; estes vêm da Prefeitura.'
  });
}

/* Chamada depois que a tela entra no documento, como o mapa. */
function carregarContratosPMPV() {
  const alvo = document.getElementById('integracaoContratos');
  if (!alvo) return;

  if (contratosCache) return pintarContratos(alvo, contratosCache);
  if (contratosEstado === 'carregando') return;
  contratosEstado = 'carregando';

  const ano = new Date().getFullYear();
  buscarComLimite(`${API_CONTRATOS}?ano=${ano}&por-pagina=100`, { headers: { Accept: 'application/json' } })
    .then(resposta => {
      if (!resposta.ok) throw new Error('resposta ' + resposta.status);
      return resposta.json();
    })
    .then(dados => {
      const lista = Array.isArray(dados.data) ? dados.data : [];
      const ligados = lista.filter(c => {
        const objeto = (c.objeto || '').toUpperCase();
        return TERMOS_LIMPEZA.some(termo => objeto.includes(termo));
      });
      contratosCache = {
        ano,
        total: (dados.meta && dados.meta.total) || lista.length,
        lidos: lista.length,
        ligados: ligados.slice(0, 4).map(c => ({
          numero: c.numero || `Contrato ${c.contrato_numero}/${c.contrato_ano}`,
          valor: c.valor && c.valor.brl ? c.valor.brl : '—',
          objeto: (c.objeto || '').replace(/\s+/g, ' ').trim().slice(0, 170),
          inicio: c.data_vigencia_inicio || c.data_assinatura || null
        })),
        achados: ligados.length
      };
      contratosEstado = 'pronto';
      pintarContratos(document.getElementById('integracaoContratos'), contratosCache);
    })
    .catch(erro => {
      contratosEstado = 'erro';
      const atual = document.getElementById('integracaoContratos');
      if (!atual) return;
      const motivo = erro.name === 'AbortError'
        ? 'a consulta passou de oito segundos e foi interrompida'
        : erro.message;
      atual.innerHTML = aviso('Sem resposta da API da Prefeitura agora',
        `A consulta a api.portovelho.ro.gov.br nao completou (${motivo}). O restante do sistema continua funcionando: esta e a unica parte que depende de rede.`,
        'alerta');
    });
}

function pintarContratos(alvo, dados) {
  if (!alvo) return;
  const linhas = dados.ligados.map(c => `
    <div class="def">
      <b>${esc(c.numero)} · ${esc(c.valor)}</b>
      <p>${esc(c.objeto)}${c.objeto.length >= 170 ? '…' : ''}</p>
      ${c.inicio ? `<small class="fonte-dado">vigência desde ${Fmt.data(c.inicio)}</small>` : ''}
    </div>`).join('');

  alvo.innerHTML = `
    ${kpis([
      kpi('Contratos em ' + dados.ano, Fmt.numero(dados.total), 'registros na base municipal', { tom: 'marca' }),
      kpi('Ligados a resíduo', dados.achados, `entre os ${dados.lidos} lidos nesta consulta`),
      kpi('Origem', 'API pública', 'dado oficial, não demonstrativo', { tom: 'ok' })
    ])}
    ${dados.achados
      ? `<div class="lista-def" style="margin-top:var(--e3)">${linhas}</div>`
      : aviso('Nenhum contrato de limpeza no recorte deste ano',
          'A consulta funcionou e trouxe os contratos do exercício; nenhum deles casa com os termos de resíduo e limpeza urbana.')}`;
}

/* --------------------------------------------------- malha oficial do IBGE */

let malhaCache = null;

/* Desenha o limite do municipio sobre o mapa. E consulta a fonte federal, nao
   um contorno guardado aqui: se a malha mudar, o mapa acompanha. Falhar e
   aceitavel — o mapa continua util sem o contorno. */
function desenharLimiteMunicipal(mapa) {
  if (typeof L === 'undefined' || !mapa) return;

  const pintar = geo => {
    const camada = L.geoJSON(geo, {
      style: { color: '#1f6b4a', weight: 1.6, opacity: .75, fill: false, dashArray: '5 4' },
      interactive: false
    }).addTo(mapa);
    camada.bindTooltip('Limite municipal de Porto Velho · malha oficial do IBGE', { sticky: true });
  };

  if (malhaCache) return pintar(malhaCache);

  buscarComLimite(API_MALHA_IBGE)
    .then(resposta => (resposta.ok ? resposta.json() : Promise.reject(new Error('malha ' + resposta.status))))
    .then(geo => { malhaCache = geo; pintar(geo); })
    .catch(() => { /* sem contorno, o mapa segue funcionando */ });
}
