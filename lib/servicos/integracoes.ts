/* SAMAÚMA — integrações com fontes oficiais.
   O sistema não inventa outra verdade: consome o que a Prefeitura já publica.

   API pública de contratos do Município (JSON, CORS liberado, sem chave) e a
   malha oficial do IBGE para o contorno do município no mapa. Se a rede
   falhar, a tela diz isso e o resto do sistema continua funcionando. */

const API_CONTRATOS = 'https://api.portovelho.ro.gov.br/api/v1/contratos';
const API_MALHA_IBGE = 'https://servicodados.ibge.gov.br/api/v3/malhas/municipios/1100205?formato=application/vnd.geo+json';

/* Toda consulta externa desiste em oito segundos. */
const LIMITE_ESPERA = 8000;

function buscarComLimite(url: string, opcoes: RequestInit = {}): Promise<Response> {
  if (typeof AbortController === 'undefined') return fetch(url, opcoes);
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), LIMITE_ESPERA);
  return fetch(url, { ...opcoes, signal: controle.signal }).finally(() => clearTimeout(relogio));
}

const TERMOS_LIMPEZA = ['RESÍDUO', 'RESIDUO', 'LIMPEZA', 'COLETA', 'RECICL', 'VARRI', 'ATERRO', 'ENTULHO'];

export interface ContratoLigado {
  numero: string;
  valor: string;
  objeto: string;
  inicio: string | null;
}

export interface ContratosPMPV {
  ano: number;
  total: number;
  lidos: number;
  ligados: ContratoLigado[];
  achados: number;
}

interface ContratoBruto {
  numero?: string;
  contrato_numero?: string | number;
  contrato_ano?: string | number;
  objeto?: string;
  valor?: { brl?: string };
  data_vigencia_inicio?: string;
  data_assinatura?: string;
}

export async function buscarContratosPMPV(): Promise<ContratosPMPV> {
  const ano = new Date().getFullYear();
  const resposta = await buscarComLimite(`${API_CONTRATOS}?ano=${ano}&por-pagina=100`, { headers: { Accept: 'application/json' } });
  if (!resposta.ok) throw new Error('resposta ' + resposta.status);
  const dados = await resposta.json();
  const lista: ContratoBruto[] = Array.isArray(dados.data) ? dados.data : [];
  const ligados = lista.filter(c => {
    const objeto = (c.objeto || '').toUpperCase();
    return TERMOS_LIMPEZA.some(termo => objeto.includes(termo));
  });
  return {
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
}

let malhaCache: GeoJSON.GeoJsonObject | null = null;

/* Consulta a malha oficial do IBGE, com cache em memória de sessão. */
export async function buscarMalhaMunicipal(): Promise<GeoJSON.GeoJsonObject> {
  if (malhaCache) return malhaCache;
  const resposta = await buscarComLimite(API_MALHA_IBGE);
  if (!resposta.ok) throw new Error('malha ' + resposta.status);
  const geo = await resposta.json();
  malhaCache = geo;
  return geo;
}
