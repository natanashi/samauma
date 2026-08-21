/* SAMAÚMA — Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS).
   Modelo de dados do gerador padrão de PGRS e o rascunho salvo por CNPJ, para
   que quem preencheu o plano antes de se cadastrar tenha ele anexado
   automaticamente (com possibilidade de correção) na hora do cadastro. */

export interface PgrsIdentificacao {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  propriedade: 'Público' | 'Privado' | '';
  endereco: string;
  foneFax: string;
  horarioFuncionamento: string;
  tipoEstabelecimento: string;
  municipioUf: string;
  responsavelTecnico: string;
}

export interface PgrsRecursoPessoal { id: string; funcao: string; quantidade: string; tipoContrato: string; }

export interface PgrsEdificacao {
  areaTerreno: string;
  qtdPredios: string;
  qtdSalas: string;
  areaConstruida: string;
}

export interface PgrsAmbiente { id: string; descricao: string; quantidade: string; }

export interface PgrsAspectoAmbiental { id: string; local: string; residuo: string; classificacao: string; }

export interface PgrsAbastecimentoAgua { fonte: string; observacoes: string; }
export interface PgrsEfluentes { destino: string; observacoes: string; }

export interface PgrsGrupoResiduo { descricao: string; pesoEstimado: string; }
export interface PgrsClassificacaoResiduos {
  A: PgrsGrupoResiduo; B: PgrsGrupoResiduo; C: PgrsGrupoResiduo; D: PgrsGrupoResiduo; E: PgrsGrupoResiduo;
}

export interface PgrsSegregacaoLinha {
  id: string; local: string; residuo: string; grupo: string;
  estadoFisico: string; segregacaoOrigem: string; coletaTransporte: string;
}

export type GrupoManejado = 'A' | 'B' | 'D' | 'E';

export interface PgrsColetaInterna {
  fonteParaTemporario: Record<GrupoManejado, string>;
  temporarioParaExterno: Record<GrupoManejado, string>;
}

export interface PgrsAbrigoTemporario { abrigo: string; revestimento: string; exclusivoRss: 'sim' | 'nao' | ''; }
export interface PgrsArmazenamentoTemporario {
  B: PgrsAbrigoTemporario; A: PgrsAbrigoTemporario; E: PgrsAbrigoTemporario; D: PgrsAbrigoTemporario;
}

export interface PgrsAbrigoExterno { abrigo: string; localizado: string; }
export interface PgrsArmazenamentoExterno {
  D: PgrsAbrigoExterno; A: PgrsAbrigoExterno; B: PgrsAbrigoExterno; E: PgrsAbrigoExterno;
}

export interface PgrsColetaExterna {
  grupos: string;
  tipoResiduos: string;
  veiculoEquipamento: string;
  epis: string;
  frequenciaD: string;
  frequenciaOutros: string;
  horaD: string;
  horaOutros: string;
  distanciaDisposicaoFinal: string;
}

export interface PgrsDestinacaoFinal {
  grupo: string;
  residuo: string;
  disposicaoFinal: string;
  mediaMensalKg: string;
  mediaMensalLitros: string;
  custoTonelada: string;
  empresaNome: string;
  empresaCnpj: string;
  empresaEndereco: string;
  empresaTelefone: string;
  empresaResponsavel: string;
}

export interface PgrsHigienizacaoLinha { id: string; areaItem: string; procedimento: string; epis: string; local: string; }

export interface PgrsAssinatura { local: string; data: string; responsavel: string; }

export interface DadosPgrs {
  identificacao: PgrsIdentificacao;
  recursosPessoais: PgrsRecursoPessoal[];
  edificacao: PgrsEdificacao;
  ambientes: PgrsAmbiente[];
  aspectosAmbientais: PgrsAspectoAmbiental[];
  abastecimentoAgua: PgrsAbastecimentoAgua;
  efluentes: PgrsEfluentes;
  classificacaoResiduos: PgrsClassificacaoResiduos;
  segregacao: PgrsSegregacaoLinha[];
  coletaInterna: PgrsColetaInterna;
  armazenamentoTemporario: PgrsArmazenamentoTemporario;
  armazenamentoExterno: PgrsArmazenamentoExterno;
  coletaExterna: PgrsColetaExterna;
  destinacaoFinal: PgrsDestinacaoFinal;
  higienizacao: PgrsHigienizacaoLinha[];
  assinatura: PgrsAssinatura;
  atualizadoEm: string;
}

let idSeq = 0;
export function novoIdPgrs(prefixo: string): string {
  idSeq += 1;
  return `${prefixo}-${idSeq}`;
}

export function soDigitos(valor: unknown): string {
  return String(valor || '').replace(/\D/g, '');
}

export const GRUPOS_RESIDUO: { id: 'A' | 'B' | 'C' | 'D' | 'E'; nome: string }[] = [
  { id: 'A', nome: 'Grupo A — potencialmente infectantes' },
  { id: 'B', nome: 'Grupo B — químicos' },
  { id: 'C', nome: 'Grupo C — rejeitos radioativos' },
  { id: 'D', nome: 'Grupo D — resíduos comuns' },
  { id: 'E', nome: 'Grupo E — perfurocortantes' }
];

export const GRUPOS_MANEJADOS: GrupoManejado[] = ['A', 'B', 'D', 'E'];

export function pgrsVazio(): DadosPgrs {
  const grupoResiduoVazio = (): PgrsGrupoResiduo => ({ descricao: '', pesoEstimado: '' });
  const abrigoTempVazio = (): PgrsAbrigoTemporario => ({ abrigo: '', revestimento: '', exclusivoRss: '' });
  const abrigoExtVazio = (): PgrsAbrigoExterno => ({ abrigo: '', localizado: '' });

  return {
    identificacao: {
      razaoSocial: '', nomeFantasia: '', cnpj: '', propriedade: '', endereco: '', foneFax: '',
      horarioFuncionamento: '', tipoEstabelecimento: '', municipioUf: 'Porto Velho/RO', responsavelTecnico: ''
    },
    recursosPessoais: [{ id: novoIdPgrs('rp'), funcao: '', quantidade: '', tipoContrato: '' }],
    edificacao: { areaTerreno: '', qtdPredios: '', qtdSalas: '', areaConstruida: '' },
    ambientes: [{ id: novoIdPgrs('amb'), descricao: '', quantidade: '' }],
    aspectosAmbientais: [{ id: novoIdPgrs('asp'), local: '', residuo: '', classificacao: '' }],
    abastecimentoAgua: { fonte: 'CAERD — rede pública', observacoes: 'Tratamento já realizado pela companhia de água e esgoto.' },
    efluentes: { destino: 'Rede coletora do município', observacoes: 'Não há tratamento de efluentes no estabelecimento nem na rede coletora.' },
    classificacaoResiduos: {
      A: grupoResiduoVazio(), B: grupoResiduoVazio(), C: grupoResiduoVazio(), D: grupoResiduoVazio(), E: grupoResiduoVazio()
    },
    segregacao: [{ id: novoIdPgrs('seg'), local: '', residuo: '', grupo: '', estadoFisico: '', segregacaoOrigem: '', coletaTransporte: '' }],
    coletaInterna: {
      fonteParaTemporario: { A: '', B: '', D: '', E: '' },
      temporarioParaExterno: { A: '', B: '', D: '', E: '' }
    },
    armazenamentoTemporario: {
      B: abrigoTempVazio(), A: abrigoTempVazio(), E: abrigoTempVazio(), D: abrigoTempVazio()
    },
    armazenamentoExterno: {
      D: abrigoExtVazio(), A: abrigoExtVazio(), B: abrigoExtVazio(), E: abrigoExtVazio()
    },
    coletaExterna: {
      grupos: 'A, D, E', tipoResiduos: '', veiculoEquipamento: 'Caminhão da companhia de coleta pública',
      epis: 'Boné, botas, luvas, calça e blusa', frequenciaD: 'Todos os dias', frequenciaOutros: '',
      horaD: '', horaOutros: '', distanciaDisposicaoFinal: ''
    },
    destinacaoFinal: {
      grupo: '', residuo: '', disposicaoFinal: '', mediaMensalKg: '', mediaMensalLitros: '', custoTonelada: '',
      empresaNome: '', empresaCnpj: '', empresaEndereco: '', empresaTelefone: '', empresaResponsavel: ''
    },
    higienizacao: [
      { id: novoIdPgrs('hig'), areaItem: 'Coletores de resíduos (cestos de lixo)', procedimento: '', epis: '', local: '' },
      { id: novoIdPgrs('hig'), areaItem: 'Sala de armazenamento interno', procedimento: '', epis: '', local: '' },
      { id: novoIdPgrs('hig'), areaItem: 'Carro de coleta interna', procedimento: '', epis: '', local: '' },
      { id: novoIdPgrs('hig'), areaItem: 'Carro de transporte externo', procedimento: '', epis: '', local: '' },
      { id: novoIdPgrs('hig'), areaItem: 'Abrigo externo', procedimento: '', epis: '', local: '' }
    ],
    assinatura: { local: 'Porto Velho-RO', data: '', responsavel: '' },
    atualizadoEm: new Date().toISOString()
  };
}

/* Um PGRS é considerado preenchido o suficiente para anexar quando a
   identificação essencial e ao menos um responsável estão informados — o
   resto do plano pode ser corrigido depois, na tela de correção. */
export function pgrsMinimamentePreenchido(dados: DadosPgrs): boolean {
  const i = dados.identificacao;
  return !!(i.razaoSocial.trim() && i.cnpj.trim() && i.endereco.trim() && i.responsavelTecnico.trim());
}

const CHAVE_RASCUNHOS = 'samauma.next.pgrs.v1';

type Ouvinte = () => void;

class RascunhosPgrs {
  private rascunhos: Record<string, DadosPgrs> = {};
  private ouvintes = new Set<Ouvinte>();
  private instantaneo = {};
  private carregado = false;

  private garantirCarregado() {
    if (this.carregado) return;
    this.carregado = true;
    if (typeof localStorage === 'undefined') return;
    try {
      const bruto = localStorage.getItem(CHAVE_RASCUNHOS);
      if (bruto) this.rascunhos = JSON.parse(bruto);
    } catch {
      this.rascunhos = {};
    }
  }

  subscribe = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  getSnapshot = () => {
    this.garantirCarregado();
    return this.instantaneo;
  };

  private notificar() {
    this.instantaneo = {};
    this.ouvintes.forEach(o => o());
  }

  obter(cnpj: string): DadosPgrs | null {
    this.garantirCarregado();
    const chave = soDigitos(cnpj);
    return chave ? this.rascunhos[chave] || null : null;
  }

  salvar(cnpj: string, dados: DadosPgrs) {
    this.garantirCarregado();
    const chave = soDigitos(cnpj);
    if (!chave) return;
    this.rascunhos[chave] = { ...dados, atualizadoEm: new Date().toISOString() };
    this._gravar();
    this.notificar();
  }

  remover(cnpj: string) {
    this.garantirCarregado();
    const chave = soDigitos(cnpj);
    if (!chave || !this.rascunhos[chave]) return;
    delete this.rascunhos[chave];
    this._gravar();
    this.notificar();
  }

  private _gravar() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CHAVE_RASCUNHOS, JSON.stringify(this.rascunhos));
    } catch {
      /* sem armazenamento, o rascunho vale para esta sessão */
    }
  }
}

export const Pgrs = new RascunhosPgrs();
