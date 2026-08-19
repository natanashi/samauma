/* SAMAÚMA — catálogo do domínio.
   Aqui ficam apenas as tabelas: quem é quem, o que é o quê e quanto vale.
   Nenhuma regra e nenhuma tela — só os dados que o resto do sistema lê.

   Organizações, pessoas, documentos, coordenadas e valores são fictícios ou
   demonstrativos. Os bairros são reais; as coordenadas são aproximadas e não
   vieram do geoportal da Prefeitura. */

import type { Canal, Catador, Cooperativa, Destino, Gerador, Operador, Ponto, Residuo } from './tipos';

/* Tolerância entre o que o catador registrou e o que a balança do destino pesou.
   Acima disso a demanda vira pendência e a Prefeitura precisa conciliar. */
export const TOLERANCIA = 0.05;

/* Piso absoluto da tolerância. Cinco por cento de uma carga de 120 kg são 6 kg —
   menos que a variação de uma balança de plataforma. */
export const TOLERANCIA_MINIMA_KG = 10;

export const CANAIS: Record<string, Canal> = {
  compartilhado: { nome: 'Aparelho da equipe', digitadoPor: null,
    texto: 'A sessao pertence a rota. O aparelho e da cooperativa e passa de mao em mao.' },
  pessoal: { nome: 'Celular pessoal', digitadoPor: null,
    texto: 'So para quem quiser usar o proprio aparelho e tiver dados disponiveis.' },
  terminal: { nome: 'Terminal do galpao', digitadoPor: 'Encarregado do galpao',
    texto: 'A ficha de papel e digitada depois, no computador do galpao, preservando horario e autoria.' },
  assistido: { nome: 'Registro assistido', digitadoPor: 'Encarregado da cooperativa',
    texto: 'O encarregado digita por quem coletou. Quem executou e quem digitou ficam identificados separadamente.' }
};

export const TARIFA_ATERRO = 96.50;

export const ETAPAS = ['Demanda', 'Aceite', 'Coleta', 'Transporte', 'Recebimento', 'Comprovação'];

export const STATUS: Record<string, { id: string; rotulo: string; tom: string; etapa: number }> = {
  CRIADA:     { id: 'CRIADA',     rotulo: 'Rascunho',   tom: 'neutro', etapa: 1 },
  DISPONIVEL: { id: 'DISPONIVEL', rotulo: 'Disponível', tom: 'info',   etapa: 2 },
  ACEITA:     { id: 'ACEITA',     rotulo: 'Aceita',     tom: 'info',   etapa: 3 },
  EM_COLETA:  { id: 'EM_COLETA',  rotulo: 'Em coleta',  tom: 'alerta', etapa: 3 },
  COLETADA:   { id: 'COLETADA',   rotulo: 'A caminho',  tom: 'marca',  etapa: 4 },
  PENDENCIA:  { id: 'PENDENCIA',  rotulo: 'Pendência',  tom: 'erro',   etapa: 5 },
  COMPROVADA: { id: 'COMPROVADA', rotulo: 'Comprovada', tom: 'ok',     etapa: 6 }
};

export const EM_ABERTO = ['CRIADA', 'DISPONIVEL', 'ACEITA', 'EM_COLETA'];
export const EM_CURSO = ['DISPONIVEL', 'ACEITA', 'EM_COLETA', 'COLETADA'];

export const SITUACOES: Record<string, { id: string; rotulo: string; tom: string; ordem: number }> = {
  REGULAR:          { id: 'REGULAR',          rotulo: 'Regular',          tom: 'ok',     ordem: 3 },
  EM_REGULARIZACAO: { id: 'EM_REGULARIZACAO', rotulo: 'Em regularização', tom: 'alerta', ordem: 2 },
  IRREGULAR:        { id: 'IRREGULAR',        rotulo: 'Irregular',        tom: 'erro',   ordem: 1 }
};

export const RESIDUOS: Residuo[] = [
  { id: 'papelao',  nome: 'Papelão',               preco: 0.62, co2: 1.1, cor: '#c98f2a', recuperavel: true,  perdaTriagem: 0.08 },
  { id: 'plastico', nome: 'Plástico (PET)',        preco: 1.85, co2: 1.8, cor: '#2a6fa8', recuperavel: true,  perdaTriagem: 0.14 },
  { id: 'papel',    nome: 'Papel branco',          preco: 0.74, co2: 0.9, cor: '#7aa6c2', recuperavel: true,  perdaTriagem: 0.11 },
  { id: 'vidro',    nome: 'Vidro',                 preco: 0.18, co2: 0.3, cor: '#2a8c7a', recuperavel: true,  perdaTriagem: 0.06 },
  { id: 'metal',    nome: 'Metal e alumínio',      preco: 4.20, co2: 4.5, cor: '#8fbb3f', recuperavel: true,  perdaTriagem: 0.04 },
  { id: 'oleo',     nome: 'Óleo de cozinha usado', preco: 1.10, co2: 2.4, cor: '#e0a93a', recuperavel: true,  perdaTriagem: 0.02 },
  { id: 'rejeito',  nome: 'Rejeito indiferenciado', preco: 0,   co2: 0,   cor: '#8a9690', recuperavel: false, perdaTriagem: 1 }
];

export const COOPERATIVAS: Cooperativa[] = [
  { id: 'coop-01', nome: 'CATANORTE', razao: 'Cooperativa de Trabalho dos Catadores de Materiais Recicláveis do Norte',
    fundada: '2011-05-18', bairro: 'Industrial', ponto: 'pt-galpao',
    contrato: 'Termo de cooperação 034/2025 · coleta seletiva conveniada', galpao: 'dst-01' },
  { id: 'coop-02', nome: 'COOCAMAR', razao: 'Cooperativa dos Catadores de Materiais Recicláveis',
    fundada: '2015-09-02', bairro: 'Embratel', ponto: 'pt-07',
    contrato: 'Termo de cooperação 019/2024 · coleta seletiva conveniada' },
  { id: 'coop-03', nome: 'COOPRECICLA PVH', razao: 'Cooperativa de Reciclagem de Porto Velho',
    fundada: '2017-02-14', bairro: 'Caiari', ponto: 'pt-09',
    contrato: 'Termo de cooperação 027/2024 · coleta seletiva conveniada' },
  { id: 'coop-04', nome: 'COOPVERDE', razao: 'Cooperativa Verde de Trabalhadores em Materiais Recicláveis',
    fundada: '2019-06-30', bairro: 'Cidade Nova', ponto: 'pt-12',
    contrato: 'Termo de cooperação 041/2025 · coleta seletiva conveniada' },
  { id: 'coop-05', nome: 'COOPAMAZÔNIA', razao: 'Cooperativa Amazônia de Catadores de Materiais Recicláveis',
    fundada: '2020-11-05', bairro: 'Areal', ponto: 'pt-02',
    contrato: 'Termo de cooperação 052/2025 · coleta seletiva conveniada' }
];

export const CATADORES: Catador[] = [
  { id: 'cat-01', nome: 'João Silva',      cooperativa: 'coop-01', desde: '2021-03-11', metaSemanal: 1800, veiculo: 'Triciclo elétrico', zona: 'Zona Sul' },
  { id: 'cat-02', nome: 'Antônio Ribeiro', cooperativa: 'coop-01', desde: '2019-11-27', metaSemanal: 1800, veiculo: 'Caminhonete da cooperativa', zona: 'Zona Leste' },
  { id: 'cat-03', nome: 'Célio Barbosa',   cooperativa: 'coop-01', desde: '2022-06-09', metaSemanal: 1500, veiculo: 'Carroça motorizada', zona: 'Centro' },
  { id: 'cat-04', nome: 'Rosa Menezes',    cooperativa: 'coop-01', desde: '2023-01-15', metaSemanal: 1500, veiculo: 'Triciclo elétrico', zona: 'Zona Norte' },
  { id: 'cat-05', nome: 'Maria Duarte',    cooperativa: null,      desde: '2022-08-02', metaSemanal: 900,  veiculo: 'Carroça própria', zona: 'Centro' },
  { id: 'cat-06', nome: 'Edilene Farias',  cooperativa: 'coop-02', desde: '2020-04-19', metaSemanal: 1200, veiculo: 'Triciclo elétrico', zona: 'Zona Norte' },
  { id: 'cat-07', nome: 'Vanderlei Souza', cooperativa: 'coop-02', desde: '2021-08-22', metaSemanal: 1200, veiculo: 'Carroça motorizada', zona: 'Zona Norte' },
  { id: 'cat-08', nome: 'Iracema Pantoja', cooperativa: 'coop-03', desde: '2018-12-03', metaSemanal: 1100, veiculo: 'Triciclo elétrico', zona: 'Centro' },
  { id: 'cat-09', nome: 'Raimundo Costa',  cooperativa: 'coop-03', desde: '2022-02-17', metaSemanal: 1100, veiculo: 'Carroça própria', zona: 'Centro' },
  { id: 'cat-10', nome: 'Deuzimar Alves',  cooperativa: 'coop-04', desde: '2020-10-08', metaSemanal: 900,  veiculo: 'Triciclo elétrico', zona: 'Zona Norte' },
  { id: 'cat-11', nome: 'Josenilde Reis',  cooperativa: 'coop-04', desde: '2023-05-14', metaSemanal: 900,  veiculo: 'Carroça motorizada', zona: 'Zona Norte' },
  { id: 'cat-12', nome: 'Adenilson Melo',  cooperativa: 'coop-05', desde: '2021-01-27', metaSemanal: 800,  veiculo: 'Carroça própria', zona: 'Zona Sul' },
  { id: 'cat-13', nome: 'Cleonice Farias', cooperativa: 'coop-05', desde: '2023-09-10', metaSemanal: 800,  veiculo: 'Triciclo elétrico', zona: 'Zona Sul' }
];

export const PONTOS: Ponto[] = [
  { id: 'pt-01', bairro: 'Nova Porto Velho',        zona: 'Zona Sul',    lat: -8.7644, lng: -63.8779, acesso: 'Doca lateral · 6h às 11h' },
  { id: 'pt-02', bairro: 'Areal',                   zona: 'Zona Sul',    lat: -8.7735, lng: -63.8973, acesso: 'Pátio dos fundos · 7h às 12h' },
  { id: 'pt-03', bairro: 'Agenor de Carvalho',      zona: 'Zona Leste',  lat: -8.7605, lng: -63.8684, acesso: 'Expurgo · acesso controlado' },
  { id: 'pt-04', bairro: 'Flodoaldo Pontes Pinto',  zona: 'Zona Leste',  lat: -8.7476, lng: -63.8694, acesso: 'Doca de carga · 8h às 17h' },
  { id: 'pt-05', bairro: 'Centro',                  zona: 'Centro',      lat: -8.7647, lng: -63.9041, acesso: 'Calçada lateral · após 18h' },
  { id: 'pt-06', bairro: 'Candeias do Jamari',      zona: 'Região metropolitana', lat: -8.7950, lng: -63.7019, acesso: 'Portaria de carga · 24h' },
  { id: 'pt-07', bairro: 'Embratel',                zona: 'Zona Norte',  lat: -8.7510, lng: -63.8819, acesso: 'Depósito interno · 8h às 16h' },
  { id: 'pt-08', bairro: 'Olaria',                  zona: 'Centro',      lat: -8.7556, lng: -63.9054, acesso: 'Estacionamento · 7h às 19h' },
  { id: 'pt-09', bairro: 'Caiari',                  zona: 'Centro',      lat: -8.7614, lng: -63.9064, acesso: 'Portaria · 6h às 10h' },
  { id: 'pt-10', bairro: 'Industrial',              zona: 'Zona Sul',    lat: -8.7367, lng: -63.8841, acesso: 'Balança da entrada · 24h' },
  { id: 'pt-11', bairro: 'São João Bosco',          zona: 'Centro',      lat: -8.7481, lng: -63.8980, acesso: 'Doca coberta · 7h às 13h' },
  { id: 'pt-12', bairro: 'Cidade Nova',             zona: 'Zona Sul',    lat: -8.8102, lng: -63.8781, acesso: 'Pátio externo · 8h às 18h' },
  { id: 'pt-galpao', bairro: 'Industrial',          zona: 'Zona Sul',    lat: -8.7390, lng: -63.8815, acesso: 'Galpão da CATANORTE' },
  { id: 'pt-aterro', bairro: 'Vila Princesa',       zona: 'Região metropolitana', lat: -8.8330, lng: -63.9560, acesso: 'Aterro sanitário municipal' },
  { id: 'pt-recicl', bairro: 'Candeias do Jamari',  zona: 'Região metropolitana', lat: -8.7970, lng: -63.7040, acesso: 'Indústria recicladora' },
  { id: 'pt-usina',  bairro: 'Distrito Industrial', zona: 'Zona Sul',    lat: -8.8142, lng: -63.7394, acesso: 'Unidade de transformação' }
];

export const GERADORES: Gerador[] = [
  { id: 'ger-01', nome: 'Mercado Ipê Roxo',         cnpj: '11.222.333/0001-44', ramo: 'Supermercado',     ponto: 'pt-01', km: 2.4,  volumeMes: 14000, operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0142', validade: 240 } },
  { id: 'ger-02', nome: 'Supermercado Rio Madeira', cnpj: '22.333.444/0001-55', ramo: 'Supermercado',     ponto: 'pt-02', km: 4.1,  volumeMes: 11000, operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0088', validade: 210 } },
  { id: 'ger-03', nome: 'Hospital Santa Marcelina', cnpj: '33.444.555/0001-66', ramo: 'Serviço de saúde', ponto: 'pt-03', km: 6.7,  volumeMes: 9000,  operador: 'coop-01', pgrs: { numero: 'PGRS 2024/0311', validade: 40 } },
  { id: 'ger-04', nome: 'Shopping Porto Velho',     cnpj: '44.555.666/0001-77', ramo: 'Centro comercial', ponto: 'pt-04', km: 5.3,  volumeMes: 22000, operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0007', validade: 320 } },
  { id: 'ger-05', nome: 'Restaurante Beiradão',     cnpj: '55.666.777/0001-88', ramo: 'Alimentação',      ponto: 'pt-05', km: 1.8,  volumeMes: 2600,  operador: 'cat-05', pgrs: { numero: 'PGRS 2024/0290', validade: -20 } },
  { id: 'ger-06', nome: 'Atacadão Candeias',        cnpj: '66.777.888/0001-99', ramo: 'Atacado',          ponto: 'pt-06', km: 11.2, volumeMes: 18000, operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0165', validade: 260 } },
  { id: 'ger-07', nome: 'Gráfica Selva Norte',      cnpj: '77.888.999/0001-00', ramo: 'Indústria gráfica', ponto: 'pt-07', km: 3.6, volumeMes: 5400,  operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0121', validade: 150 } },
  { id: 'ger-08', nome: 'Faculdade Rio Branco',     cnpj: '88.999.000/0001-11', ramo: 'Ensino',           ponto: 'pt-08', km: 2.9,  volumeMes: 4200,  operador: 'coop-01', pgrs: { numero: 'PGRS 2025/0053', validade: 190 } },
  { id: 'ger-09', nome: 'Hotel Vila Rica',          cnpj: '99.000.111/0001-22', ramo: 'Hotelaria',        ponto: 'pt-09', km: 1.5,  volumeMes: 3800,  operador: 'cat-05', pgrs: { numero: 'PGRS 2024/0402', validade: 60 } },
  { id: 'ger-10', nome: 'Distribuidora Tucumã',     cnpj: '10.111.222/0001-33', ramo: 'Distribuição',     ponto: 'pt-10', km: 8.4,  volumeMes: 7600,  operador: 'coop-01', pgrs: { numero: 'PGRS 2023/0198', validade: -140 } },
  { id: 'ger-11', nome: 'Panificadora Madeira',     cnpj: '20.222.333/0001-44', ramo: 'Alimentação',      ponto: 'pt-11', km: 2.2,  volumeMes: 1900,  operador: null,     pgrs: null },
  { id: 'ger-12', nome: 'Auto Peças Cidade Nova',   cnpj: '30.333.444/0001-55', ramo: 'Comércio',         ponto: 'pt-12', km: 7.1,  volumeMes: 2400,  operador: null,     pgrs: null }
];

export const GERADOR_SESSAO = 'ger-01';

export const DESTINOS: Destino[] = [
  { id: 'dst-01', nome: 'Galpão de Triagem CATANORTE', tipo: 'Central de triagem',
    cooperativa: 'coop-01', ponto: 'pt-galpao', licenca: 'LO 1187/2025',
    capacidadeDiaria: 9000, aceita: ['papelao', 'papel', 'plastico'],
    destinoFinal: 'Reciclagem, com rejeito encaminhado ao aterro', triagem: true },
  { id: 'dst-02', nome: 'Recicladora Norte · Vidro e Metal', tipo: 'Indústria recicladora',
    cooperativa: null, ponto: 'pt-recicl', licenca: 'LO 0942/2024',
    capacidadeDiaria: 6000, aceita: ['vidro', 'metal'],
    destinoFinal: 'Reciclagem industrial', triagem: true },
  { id: 'dst-03', nome: 'Usina de Biodiesel Jamari', tipo: 'Unidade de transformação',
    cooperativa: null, ponto: 'pt-usina', licenca: 'LO 0663/2025',
    capacidadeDiaria: 2500, aceita: ['oleo'],
    destinoFinal: 'Transformação em biodiesel', triagem: true },
  { id: 'dst-04', nome: 'Aterro Sanitário Municipal', tipo: 'Disposição final',
    cooperativa: null, ponto: 'pt-aterro', licenca: 'LO 0075/2023',
    capacidadeDiaria: 40000, aceita: ['rejeito'],
    destinoFinal: 'Disposição final em célula licenciada', triagem: false, aterro: true }
];

export const DESTINO_SESSAO = 'dst-01';

export function destinoDoResiduo(residuo: string): Destino {
  return DESTINOS.find(d => d.aceita.includes(residuo)) || DESTINOS[0];
}

export const Catalogo = {
  residuo: (id: string): Residuo | null => RESIDUOS.find(r => r.id === id) || null,
  nomeResiduo(id: string): string { const r = Catalogo.residuo(id); return r ? r.nome : id; },
  corResiduo(id: string): string { const r = Catalogo.residuo(id); return r ? r.cor : '#8a9690'; },

  gerador: (id: string | null | undefined): Gerador | null => GERADORES.find(g => g.id === id) || null,
  catador: (id: string | null | undefined): Catador | null => CATADORES.find(c => c.id === id) || null,
  cooperativa: (id: string | null | undefined): Cooperativa | null => COOPERATIVAS.find(c => c.id === id) || null,
  destino: (id: string | null | undefined): Destino | null => DESTINOS.find(d => d.id === id) || null,
  ponto: (id: string | null | undefined): Ponto | null => PONTOS.find(p => p.id === id) || null,

  operador(gerador: Gerador | null): Operador | null {
    if (!gerador || !gerador.operador) return null;
    const coop = Catalogo.cooperativa(gerador.operador);
    if (coop) return { tipo: 'cooperativa', id: coop.id, nome: coop.nome, detalhe: coop.contrato };
    const catador = Catalogo.catador(gerador.operador);
    if (catador) return { tipo: 'catador', id: catador.id, nome: catador.nome, detalhe: 'catador autônomo contratado' };
    return null;
  },

  equipe: (cooperativaId: string): Catador[] => CATADORES.filter(c => c.cooperativa === cooperativaId),

  endereco(pontoId: string): string {
    const ponto = Catalogo.ponto(pontoId);
    return ponto ? `${ponto.bairro} · ${ponto.zona}` : '—';
  }
};
