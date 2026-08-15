/* SAMAÚMA — catálogo do domínio.
   Aqui ficam apenas as tabelas: quem é quem, o que é o quê e quanto vale.
   Nenhuma regra e nenhuma tela — só os dados que o resto do sistema lê.

   Organizações, pessoas, documentos, coordenadas e valores são fictícios ou
   demonstrativos. Os bairros são reais; as coordenadas são aproximadas e não
   vieram do geoportal da Prefeitura. */

/* Tolerância entre o que o catador registrou e o que a balança do destino pesou.
   Acima disso a demanda vira pendência e a Prefeitura precisa conciliar. */
const TOLERANCIA = 0.05;

/* Tarifa demonstrativa de disposição em aterro, por tonelada. Serve para
   dimensionar o custo que o município evita quando o material é recuperado. */
const TARIFA_ATERRO = 96.50;

/* As seis etapas do ciclo. Cada situação da demanda aponta para a etapa em curso. */
const ETAPAS = ['Demanda', 'Aceite', 'Coleta', 'Transporte', 'Recebimento', 'Comprovação'];

const STATUS = {
  CRIADA:     { id: 'CRIADA',     rotulo: 'Rascunho',   tom: 'neutro', etapa: 1 },
  DISPONIVEL: { id: 'DISPONIVEL', rotulo: 'Disponível', tom: 'info',   etapa: 2 },
  ACEITA:     { id: 'ACEITA',     rotulo: 'Aceita',     tom: 'info',   etapa: 3 },
  EM_COLETA:  { id: 'EM_COLETA',  rotulo: 'Em coleta',  tom: 'alerta', etapa: 3 },
  COLETADA:   { id: 'COLETADA',   rotulo: 'A caminho',  tom: 'marca',  etapa: 4 },
  PENDENCIA:  { id: 'PENDENCIA',  rotulo: 'Pendência',  tom: 'erro',   etapa: 5 },
  COMPROVADA: { id: 'COMPROVADA', rotulo: 'Comprovada', tom: 'ok',     etapa: 6 }
};

/* Situações em que a demanda ainda não saiu do estabelecimento. */
const EM_ABERTO = ['CRIADA', 'DISPONIVEL', 'ACEITA', 'EM_COLETA'];

/* Situações que já saíram e ainda não fecharam. */
const EM_CURSO = ['DISPONIVEL', 'ACEITA', 'EM_COLETA', 'COLETADA'];

/* Situação regulatória do gerador. Não é digitada: a regra que a calcula está
   em `dominio/gerador.js` e usa o PGRS, as pendências e a última destinação. */
const SITUACOES = {
  REGULAR:          { id: 'REGULAR',          rotulo: 'Regular',          tom: 'ok',     ordem: 3 },
  EM_REGULARIZACAO: { id: 'EM_REGULARIZACAO', rotulo: 'Em regularização', tom: 'alerta', ordem: 2 },
  IRREGULAR:        { id: 'IRREGULAR',        rotulo: 'Irregular',        tom: 'erro',   ordem: 1 }
};

/* A cor acompanha o material em toda a interface: gráfico, legenda e etiqueta
   falam do mesmo resíduo com a mesma cor.
   `preco` é o valor demonstrativo por quilo; `co2` é a emissão evitada por quilo
   recuperado; `recuperavel` diz se o material volta ao ciclo produtivo ou se é
   rejeito destinado ao aterro. `perdaTriagem` é a fração que costuma virar
   rejeito na triagem — contaminação, umidade, material misturado. */
const RESIDUOS = [
  { id: 'papelao',  nome: 'Papelão',               preco: 0.62, co2: 1.1, cor: '#c98f2a', recuperavel: true,  perdaTriagem: 0.08 },
  { id: 'plastico', nome: 'Plástico (PET)',        preco: 1.85, co2: 1.8, cor: '#2a6fa8', recuperavel: true,  perdaTriagem: 0.14 },
  { id: 'papel',    nome: 'Papel branco',          preco: 0.74, co2: 0.9, cor: '#7aa6c2', recuperavel: true,  perdaTriagem: 0.11 },
  { id: 'vidro',    nome: 'Vidro',                 preco: 0.18, co2: 0.3, cor: '#2a8c7a', recuperavel: true,  perdaTriagem: 0.06 },
  { id: 'metal',    nome: 'Metal e alumínio',      preco: 4.20, co2: 4.5, cor: '#8fbb3f', recuperavel: true,  perdaTriagem: 0.04 },
  { id: 'oleo',     nome: 'Óleo de cozinha usado', preco: 1.10, co2: 2.4, cor: '#e0a93a', recuperavel: true,  perdaTriagem: 0.02 },
  { id: 'rejeito',  nome: 'Rejeito indiferenciado', preco: 0,   co2: 0,   cor: '#8a9690', recuperavel: false, perdaTriagem: 1 }
];

/* ------------------------------------------------------------- cooperativa */

/* A cooperativa não é um usuário: é a estrutura que organiza catadores.
   Em Porto Velho a demonstração usa a CATANORTE, que concentra a coleta
   seletiva conveniada. Catador autônomo existe e não pertence a nenhuma. */
const COOPERATIVAS = [
  {
    id: 'coop-01',
    nome: 'CATANORTE',
    razao: 'Cooperativa de Trabalho dos Catadores de Materiais Recicláveis do Norte',
    fundada: '2011-05-18',
    bairro: 'Industrial',
    ponto: 'pt-galpao',
    contrato: 'Termo de cooperação 034/2025 · coleta seletiva conveniada',
    galpao: 'dst-01'
  }
];

/* O catador é usuário do sistema por si — vinculado a uma cooperativa ou não.
   O vínculo muda o que ele vê (a equipe), nunca o que ele pode fazer. */
const CATADORES = [
  { id: 'cat-01', nome: 'João Silva',      cooperativa: 'coop-01', desde: '2021-03-11', metaSemanal: 1800, veiculo: 'Triciclo elétrico', zona: 'Zona Sul' },
  { id: 'cat-02', nome: 'Antônio Ribeiro', cooperativa: 'coop-01', desde: '2019-11-27', metaSemanal: 1800, veiculo: 'Caminhonete da cooperativa', zona: 'Zona Leste' },
  { id: 'cat-03', nome: 'Célio Barbosa',   cooperativa: 'coop-01', desde: '2022-06-09', metaSemanal: 1500, veiculo: 'Carroça motorizada', zona: 'Centro' },
  { id: 'cat-04', nome: 'Rosa Menezes',    cooperativa: 'coop-01', desde: '2023-01-15', metaSemanal: 1500, veiculo: 'Triciclo elétrico', zona: 'Zona Norte' },
  { id: 'cat-05', nome: 'Maria Duarte',    cooperativa: null,      desde: '2022-08-02', metaSemanal: 900,  veiculo: 'Carroça própria', zona: 'Centro' }
];

/* -------------------------------------------------------- pontos de coleta */

/* Coordenadas aproximadas de bairros reais de Porto Velho, para demonstrar a
   leitura territorial do sistema. NÃO são dados do geoportal da Prefeitura:
   substituir esta tabela por uma camada oficial não muda nenhuma outra linha
   do sistema — todo o resto lê o ponto pelo id. */
const PONTOS = [
  { id: 'pt-01', bairro: 'Nova Porto Velho',        zona: 'Zona Sul',    lat: -8.7690, lng: -63.8890, acesso: 'Doca lateral · 6h às 11h' },
  { id: 'pt-02', bairro: 'Areal',                   zona: 'Zona Sul',    lat: -8.7700, lng: -63.8990, acesso: 'Pátio dos fundos · 7h às 12h' },
  { id: 'pt-03', bairro: 'Agenor de Carvalho',      zona: 'Zona Leste',  lat: -8.7480, lng: -63.8710, acesso: 'Expurgo · acesso controlado' },
  { id: 'pt-04', bairro: 'Flodoaldo Pontes Pinto',  zona: 'Zona Leste',  lat: -8.7580, lng: -63.8620, acesso: 'Doca de carga · 8h às 17h' },
  { id: 'pt-05', bairro: 'Centro',                  zona: 'Centro',      lat: -8.7619, lng: -63.9039, acesso: 'Calçada lateral · após 18h' },
  { id: 'pt-06', bairro: 'Candeias do Jamari',      zona: 'Região metropolitana', lat: -8.7930, lng: -63.6980, acesso: 'Portaria de carga · 24h' },
  { id: 'pt-07', bairro: 'Embratel',                zona: 'Zona Norte',  lat: -8.7420, lng: -63.8830, acesso: 'Depósito interno · 8h às 16h' },
  { id: 'pt-08', bairro: 'Olaria',                  zona: 'Centro',      lat: -8.7660, lng: -63.8930, acesso: 'Estacionamento · 7h às 19h' },
  { id: 'pt-09', bairro: 'Caiari',                  zona: 'Centro',      lat: -8.7580, lng: -63.9080, acesso: 'Portaria · 6h às 10h' },
  { id: 'pt-10', bairro: 'Industrial',              zona: 'Zona Sul',    lat: -8.7900, lng: -63.8850, acesso: 'Balança da entrada · 24h' },
  { id: 'pt-11', bairro: 'São João Bosco',          zona: 'Centro',      lat: -8.7550, lng: -63.8890, acesso: 'Doca coberta · 7h às 13h' },
  { id: 'pt-12', bairro: 'Cidade Nova',             zona: 'Zona Norte',  lat: -8.7250, lng: -63.8760, acesso: 'Pátio externo · 8h às 18h' },
  /* Estruturas do ciclo, não geradores. */
  { id: 'pt-galpao', bairro: 'Industrial',          zona: 'Zona Sul',    lat: -8.7880, lng: -63.8790, acesso: 'Galpão da CATANORTE' },
  { id: 'pt-aterro', bairro: 'Vila Princesa',       zona: 'Região metropolitana', lat: -8.8330, lng: -63.9560, acesso: 'Aterro sanitário municipal' },
  { id: 'pt-recicl', bairro: 'Candeias do Jamari',  zona: 'Região metropolitana', lat: -8.7960, lng: -63.7050, acesso: 'Indústria recicladora' },
  { id: 'pt-usina',  bairro: 'Distrito Industrial', zona: 'Zona Sul',    lat: -8.8020, lng: -63.8720, acesso: 'Unidade de transformação' }
];

/* ------------------------------------------------------------- geradores */

/* Grande gerador: quem produz volume suficiente para responder pela própria
   destinação. O PGRS e o operador contratado ficam aqui; a situação regulatória
   é calculada a partir deles e do histórico. */
const GERADORES = [
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

/* Gerador demonstrativo que assume o perfil "Gerador" na entrada. */
const GERADOR_SESSAO = 'ger-01';

/* ---------------------------------------------------------- destinatários */

/* O ponto final do ciclo. Recebe a carga, pesa e declara o que fez com o
   material. O aterro sanitário também é um destinatário: boa parte do que sai
   do gerador termina em disposição final, e o sistema mostra isso em vez de
   esconder. */
const DESTINOS = [
  {
    id: 'dst-01', nome: 'Galpão de Triagem CATANORTE', tipo: 'Central de triagem',
    cooperativa: 'coop-01', ponto: 'pt-galpao', licenca: 'LO 1187/2025',
    capacidadeDiaria: 9000, aceita: ['papelao', 'papel', 'plastico'],
    destinoFinal: 'Reciclagem, com rejeito encaminhado ao aterro', triagem: true
  },
  {
    id: 'dst-02', nome: 'Recicladora Norte · Vidro e Metal', tipo: 'Indústria recicladora',
    cooperativa: null, ponto: 'pt-recicl', licenca: 'LO 0942/2024',
    capacidadeDiaria: 6000, aceita: ['vidro', 'metal'],
    destinoFinal: 'Reciclagem industrial', triagem: true
  },
  {
    id: 'dst-03', nome: 'Usina de Biodiesel Jamari', tipo: 'Unidade de transformação',
    cooperativa: null, ponto: 'pt-usina', licenca: 'LO 0663/2025',
    capacidadeDiaria: 2500, aceita: ['oleo'],
    destinoFinal: 'Transformação em biodiesel', triagem: true
  },
  {
    id: 'dst-04', nome: 'Aterro Sanitário Municipal', tipo: 'Disposição final',
    cooperativa: null, ponto: 'pt-aterro', licenca: 'LO 0075/2023',
    capacidadeDiaria: 40000, aceita: ['rejeito'],
    destinoFinal: 'Disposição final em célula licenciada', triagem: false, aterro: true
  }
];

/* Destinatário demonstrativo que assume o perfil na entrada. */
const DESTINO_SESSAO = 'dst-01';

/* O material define para onde a carga vai. Rejeito vai direto ao aterro. */
function destinoDoResiduo(residuo) {
  return DESTINOS.find(d => d.aceita.includes(residuo)) || DESTINOS[0];
}

/* ------------------------------------------------------------ atalhos de leitura */

const Catalogo = {
  residuo: id => RESIDUOS.find(r => r.id === id) || null,
  nomeResiduo(id) { const r = Catalogo.residuo(id); return r ? r.nome : id; },
  corResiduo(id) { const r = Catalogo.residuo(id); return r ? r.cor : '#8a9690'; },

  gerador: id => GERADORES.find(g => g.id === id) || null,
  catador: id => CATADORES.find(c => c.id === id) || null,
  cooperativa: id => COOPERATIVAS.find(c => c.id === id) || null,
  destino: id => DESTINOS.find(d => d.id === id) || null,
  ponto: id => PONTOS.find(p => p.id === id) || null,

  /* Quem opera a coleta do gerador: a cooperativa contratada, um catador
     contratado, ou ninguém — e aí a demanda vai para a fila aberta. */
  operador(gerador) {
    if (!gerador || !gerador.operador) return null;
    const coop = Catalogo.cooperativa(gerador.operador);
    if (coop) return { tipo: 'cooperativa', id: coop.id, nome: coop.nome, detalhe: coop.contrato };
    const catador = Catalogo.catador(gerador.operador);
    if (catador) return { tipo: 'catador', id: catador.id, nome: catador.nome, detalhe: 'catador autônomo contratado' };
    return null;
  },

  /* Catadores de uma cooperativa. */
  equipe: cooperativaId => CATADORES.filter(c => c.cooperativa === cooperativaId),

  /* Endereço legível de um ponto de coleta. */
  endereco(pontoId) {
    const ponto = Catalogo.ponto(pontoId);
    return ponto ? `${ponto.bairro} · ${ponto.zona}` : '—';
  }
};
