/* SAMAÚMA — tipos do domínio. */

export type StatusId =
  | 'CRIADA' | 'DISPONIVEL' | 'ACEITA' | 'EM_COLETA' | 'COLETADA' | 'PENDENCIA' | 'COMPROVADA';

export type SituacaoId = 'REGULAR' | 'EM_REGULARIZACAO' | 'IRREGULAR';

export interface Evento {
  quando: string;
  titulo: string;
  detalhe: string;
  autor: string;
}

export interface Comprovante {
  codigo: string;
  emitidoEm: string;
  divergencia: number | null;
}

export interface DemandaCatador {
  id: string;
  nome: string;
  cooperativa: string | null;
}

export interface Demanda {
  id: string;
  gerador: { id: string; nome: string };
  residuo: string;
  estimadoKg: number;
  ponto: string;
  bairro: string;
  zona: string;
  km: number;
  prazo: string;
  observacao: string;
  status: StatusId;
  catador: DemandaCatador | null;
  destino: { id: string; nome: string };
  coletadoKg: number | null;
  verificadoKg: number | null;
  rejeitoKg: number | null;
  destinoFinal: string | null;
  recebidaEm: string | null;
  lote: string | null;
  foto: string | null;
  conciliada: boolean;
  comprovante: Comprovante | null;
  criadaEm: string;
  eventos: Evento[];
  canalRegistro?: string;
}

export interface Ponto {
  id: string;
  bairro: string;
  zona: string;
  lat: number;
  lng: number;
  acesso: string;
}

export interface Pgrs {
  numero: string;
  validade: number;
}

export interface Gerador {
  id: string;
  nome: string;
  cnpj: string;
  ramo: string;
  ponto: string;
  km: number;
  volumeMes: number;
  operador: string | null;
  pgrs: Pgrs | null;
  cadastradoAqui?: boolean;
  codigo?: string;
}

export interface Catador {
  id: string;
  nome: string;
  cooperativa: string | null;
  desde: string;
  metaSemanal: number;
  veiculo: string;
  zona: string;
  cadastradoAqui?: boolean;
  codigo?: string;
}

export interface Cooperativa {
  id: string;
  nome: string;
  razao: string;
  fundada: string;
  bairro: string;
  ponto: string;
  contrato: string;
  galpao?: string;
}

export interface Destino {
  id: string;
  nome: string;
  tipo: string;
  cooperativa: string | null;
  ponto: string;
  licenca: string;
  capacidadeDiaria: number;
  aceita: string[];
  destinoFinal: string;
  triagem: boolean;
  aterro?: boolean;
  cadastradoAqui?: boolean;
  codigo?: string;
}

export interface Residuo {
  id: string;
  nome: string;
  preco: number;
  co2: number;
  cor: string;
  recuperavel: boolean;
  perdaTriagem: number;
}

export interface Canal {
  nome: string;
  digitadoPor: string | null;
  texto: string;
}

export interface Situacao {
  id: SituacaoId;
  rotulo: string;
  tom: string;
  ordem: number;
  motivos: string[];
  pgrs: PgrsResolvido | null;
  diasSemDestinar: number | null;
  ultimaDestinacao: string | null;
}

export interface PgrsResolvido {
  numero: string;
  validade: string;
  dias: number;
  vencido: boolean;
  vencendo: boolean;
}

export interface Aderencia {
  declarado: number;
  destinado: number;
  parte: number;
}

export interface Selo {
  codigo: string;
  valido: boolean;
  situacao: Situacao;
  competencia: string;
  massa: number;
  comprovantes: number;
  verificacao: string;
}

export interface Operador {
  tipo: 'cooperativa' | 'catador';
  id: string;
  nome: string;
  detalhe: string;
}

export type Perfil = 'gerador' | 'catador' | 'cooperativa' | 'prefeitura';

export interface AbaPerfil {
  id: string;
  rotulo: string;
}

export interface EntradaPerfil {
  rotulo: string;
  catador?: string;
  destino?: string;
  secundaria?: boolean;
}

export interface DefinicaoPerfil {
  id: Perfil;
  nome: string;
  cor: string;
  resumo: string;
  abas: AbaPerfil[];
  entradas: EntradaPerfil[];
}

export type TipoCadastro = 'gerador' | 'catador' | 'destino';

export type ValorCampoCadastro = string | string[] | undefined;
export type DadosCadastro = Record<string, ValorCampoCadastro>;

export interface RegistrosCadastro {
  geradores: Gerador[];
  catadores: Catador[];
  destinos: Destino[];
  pontos: Ponto[];
}

export interface Conta {
  tipo: TipoCadastro;
  perfil: 'gerador' | 'catador' | 'cooperativa';
  registro: Gerador | Catador | Destino;
}
