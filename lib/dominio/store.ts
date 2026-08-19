/* SAMAÚMA — o armazém da demanda de destinação.
   Guarda as demandas, aplica as transições de estado e responde às consultas de
   cada perfil. Não calcula painel (isso é `indicadores.ts`) nem monta tela.

   Porte para React: os mesmos métodos imperativos do app original, mais um
   subscribe/notify mínimo para que `useSyncExternalStore` saiba quando algo
   mudou — sem introduzir Redux/Zustand. */

import { CANAIS, Catalogo, destinoDoResiduo, GERADOR_SESSAO } from './catalogo';
import { DemandaRegras as Demanda } from './demanda';
import { Fmt } from './formato';
import { Semente } from './semente';
import type { Demanda as TDemanda, DemandaCatador } from './tipos';

const CHAVE_ARMAZENAMENTO = 'samauma.next.demandas.v1';

type Ouvinte = () => void;

class ArmazemDemandas {
  demandas: TDemanda[] = [];
  sequencia = 0;
  private ouvintes = new Set<Ouvinte>();
  private instantaneo = { demandas: this.demandas };

  subscribe = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  getSnapshot = (): { demandas: TDemanda[] } => this.instantaneo;

  private notificar() {
    this.instantaneo = { demandas: this.demandas };
    this.ouvintes.forEach(ouvinte => ouvinte());
  }

  iniciar(): this {
    const salvo = this._ler();
    if (salvo) {
      this.demandas = salvo.demandas;
      this.sequencia = salvo.sequencia;
    } else {
      this.reiniciarSemNotificar();
    }
    this.instantaneo = { demandas: this.demandas };
    return this;
  }

  reiniciar() {
    this.reiniciarSemNotificar();
    this.notificar();
  }

  private reiniciarSemNotificar() {
    const semente = Semente.gerar();
    this.demandas = semente.demandas;
    this.sequencia = semente.sequencia;
    this._gravar();
  }

  obter(id: string | null | undefined): TDemanda | null {
    return this.demandas.find(d => d.id === id) || null;
  }

  todas(): TDemanda[] {
    return this.demandas.slice().sort(this._maisRecente);
  }

  doGerador(geradorId: string = GERADOR_SESSAO): TDemanda[] {
    return this.demandas.filter(d => d.gerador.id === geradorId).sort(this._maisRecente);
  }

  disponiveis(): TDemanda[] {
    return this.demandas.filter(d => d.status === 'DISPONIVEL').sort(this._porPrazo);
  }

  doCatador(catadorId: string): TDemanda[] {
    return this.demandas.filter(d => d.catador && d.catador.id === catadorId).sort(this._maisRecente);
  }

  daCooperativa(cooperativaId: string): TDemanda[] {
    const equipe = Catalogo.equipe(cooperativaId).map(c => c.id);
    return this.demandas.filter(d => d.catador && equipe.includes(d.catador.id)).sort(this._maisRecente);
  }

  paraDestino(destinoId: string): TDemanda[] {
    return this.demandas.filter(d => d.destino && d.destino.id === destinoId).sort(this._maisRecente);
  }

  aCaminhoDe(destinoId: string): TDemanda[] {
    return this.demandas
      .filter(d => d.status === 'COLETADA' && d.destino && d.destino.id === destinoId)
      .sort(this._porPrazo);
  }

  pendentes(): TDemanda[] {
    return this.demandas.filter(d => d.status === 'PENDENCIA').sort(this._maisRecente);
  }

  doDia(catadorId: string): TDemanda[] {
    return this.demandas
      .filter(d => d.catador && d.catador.id === catadorId &&
        ['ACEITA', 'EM_COLETA'].includes(d.status) && Fmt.diasAte(d.prazo) <= 0)
      .sort(this._porPrazo);
  }

  proximaColeta(catadorId: string): TDemanda | null {
    return this.demandas
      .filter(d => d.catador && d.catador.id === catadorId && ['ACEITA', 'EM_COLETA'].includes(d.status))
      .sort(this._porPrazo)[0] || null;
  }

  proximaDoGerador(geradorId: string = GERADOR_SESSAO): TDemanda | null {
    return this.doGerador(geradorId)
      .filter(d => ['DISPONIVEL', 'ACEITA', 'EM_COLETA', 'COLETADA'].includes(d.status))
      .sort(this._porPrazo)[0] || null;
  }

  comprovantes(demandas: TDemanda[]): TDemanda[] {
    return demandas.filter(d => d.status === 'COMPROVADA' && d.comprovante);
  }

  private _maisRecente(a: TDemanda, b: TDemanda) { return new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime(); }
  private _porPrazo(a: TDemanda, b: TDemanda) { return new Date(a.prazo).getTime() - new Date(b.prazo).getTime(); }

  criar(opcoes: { geradorId?: string; residuo: string; estimadoKg: number; ponto?: string; prazo: string; observacao?: string }): TDemanda {
    const { geradorId = GERADOR_SESSAO, residuo, estimadoKg, ponto, prazo, observacao } = opcoes;
    const gerador = Catalogo.gerador(geradorId) || undefined;
    if (!gerador) throw new Error('Gerador não encontrado: ' + geradorId);
    const destino = destinoDoResiduo(residuo);
    const local = Catalogo.ponto(ponto || gerador.ponto) || Catalogo.ponto(gerador.ponto)!;

    const demanda: TDemanda = {
      id: this._novoId(),
      gerador: { id: gerador.id, nome: gerador.nome },
      residuo,
      estimadoKg,
      ponto: local.id,
      bairro: local.bairro,
      zona: local.zona,
      km: gerador.km,
      prazo,
      observacao: observacao || '',
      status: 'CRIADA',
      catador: null,
      destino: { id: destino.id, nome: destino.nome },
      coletadoKg: null,
      verificadoKg: null,
      rejeitoKg: null,
      destinoFinal: null,
      recebidaEm: null,
      lote: null,
      foto: null,
      conciliada: false,
      comprovante: null,
      criadaEm: new Date().toISOString(),
      eventos: []
    };

    this._registrar(demanda, 'Demanda criada',
      `${gerador.nome} · ${Fmt.kg(estimadoKg)} de ${Catalogo.nomeResiduo(residuo)}. Destino previsto: ${destino.nome}.`, 'Gerador');
    this.demandas.push(demanda);
    this._gravar();
    this.notificar();
    return demanda;
  }

  publicar(id: string): TDemanda {
    const demanda = this._exigir(id, 'CRIADA');
    demanda.status = 'DISPONIVEL';
    const operador = Catalogo.operador(Catalogo.gerador(demanda.gerador.id));
    this._registrar(demanda, 'Demanda disponível',
      operador
        ? `Encaminhada ao operador contratado: ${operador.nome}.`
        : 'Encaminhada à fila aberta de catadores e cooperativas da região.',
      'Sistema');
    this._gravar();
    this.notificar();
    return demanda;
  }

  aceitar(id: string, catador: DemandaCatador): TDemanda {
    const demanda = this._exigir(id, 'DISPONIVEL');
    demanda.status = 'ACEITA';
    demanda.catador = { id: catador.id, nome: catador.nome, cooperativa: catador.cooperativa };
    const coop = Catalogo.cooperativa(catador.cooperativa);
    this._registrar(demanda, 'Demanda aceita',
      `${catador.nome} · ${coop ? 'cooperado da ' + coop.nome : 'catador autônomo'}.`, 'Catador');
    this._gravar();
    this.notificar();
    return demanda;
  }

  iniciarColeta(id: string): TDemanda {
    const demanda = this._exigir(id, 'ACEITA');
    demanda.status = 'EM_COLETA';
    this._registrar(demanda, 'Coleta iniciada',
      `Deslocamento para ${demanda.gerador.nome} · ${Catalogo.endereco(demanda.ponto)}.`, 'Catador');
    this._gravar();
    this.notificar();
    return demanda;
  }

  registrarPeso(id: string, kg: number, canalId: string = 'compartilhado'): TDemanda {
    const demanda = this._exigir(id, 'EM_COLETA');
    const canal = CANAIS[canalId] || CANAIS.compartilhado;
    demanda.coletadoKg = kg;
    demanda.canalRegistro = canal.nome;
    const autor = canal.digitadoPor ? `Catador · digitado por ${canal.digitadoPor}` : 'Catador';
    this._registrar(demanda, 'Peso registrado',
      `${Fmt.kg(kg)} observados em campo · estimativa do gerador: ${Fmt.kg(demanda.estimadoKg)}. ` +
      `Registro por ${canal.nome.toLowerCase()}${canal.digitadoPor && demanda.catador ? ', executado por ' + demanda.catador.nome : ''}.`,
      autor);
    this._gravar();
    this.notificar();
    return demanda;
  }

  anexarFoto(id: string, imagem: string): TDemanda {
    const demanda = this._exigir(id, 'EM_COLETA');
    demanda.foto = imagem;
    this._registrar(demanda, 'Registro fotográfico anexado', 'Evidência da carga vinculada à demanda.', 'Catador');
    this._gravar();
    this.notificar();
    return demanda;
  }

  finalizarColeta(id: string): TDemanda {
    const demanda = this._exigir(id, 'EM_COLETA');
    if (demanda.coletadoKg == null) throw new Error('Registre o peso antes de finalizar.');
    demanda.status = 'COLETADA';
    this._registrar(demanda, 'Carga em transporte',
      `${Fmt.kg(demanda.coletadoKg)} a caminho de ${demanda.destino.nome}.`, 'Catador');
    this._gravar();
    this.notificar();
    return demanda;
  }

  receber(id: string, opcoes: { kg: number; rejeitoKg?: number; destinoFinal?: string; nota?: string; lote?: string }): TDemanda {
    const { kg, rejeitoKg = 0, destinoFinal, nota, lote } = opcoes;
    const demanda = this._exigir(id, 'COLETADA');
    if (!kg || kg <= 0) throw new Error('Informe a massa pesada na balança.');
    if (rejeitoKg < 0 || rejeitoKg > kg) throw new Error('O rejeito não pode ser maior que a massa recebida.');

    const unidade = Catalogo.destino(demanda.destino.id);
    demanda.verificadoKg = kg;
    demanda.rejeitoKg = unidade && unidade.aterro ? kg : rejeitoKg;
    demanda.destinoFinal = destinoFinal || (unidade ? unidade.destinoFinal : null);
    demanda.recebidaEm = new Date().toISOString();
    demanda.lote = lote || this._novoLote(demanda);

    const recuperado = Demanda.reciclado(demanda);
    this._registrar(demanda, 'Carga recebida no destino',
      `${Fmt.kg(kg)} pesados na balança de ${demanda.destino.nome} · lote ${demanda.lote}. ` +
      `Recuperado ${Fmt.kg(recuperado)}, rejeito ${Fmt.kg(demanda.rejeitoKg)}. ` +
      `Destino do material: ${demanda.destinoFinal}.${nota ? ' ' + nota : ''}`,
      'Destinatário');

    const divergencia = Demanda.divergencia(demanda);
    if (Demanda.dentroDaTolerancia(demanda)) {
      this._comprovar(demanda, divergencia);
    } else {
      demanda.status = 'PENDENCIA';
      this._registrar(demanda, 'Pendência aberta',
        `Divergência de ${Fmt.percentual(divergencia)} entre campo e balança, acima da tolerância de ${Fmt.percentual(5, 0)}. Nenhum registro foi apagado.`,
        'Sistema');
    }
    this._gravar();
    this.notificar();
    return demanda;
  }

  conciliar(id: string, opcoes: { kgAceito: number; nota?: string }): TDemanda {
    const { kgAceito, nota } = opcoes;
    const demanda = this._exigir(id, 'PENDENCIA');
    const anterior = demanda.verificadoKg;
    const unidade = Catalogo.destino(demanda.destino.id);
    demanda.verificadoKg = kgAceito;
    demanda.rejeitoKg = unidade && unidade.aterro ? kgAceito : Math.min(demanda.rejeitoKg || 0, kgAceito);
    demanda.conciliada = true;
    this._registrar(demanda, 'Divergência conciliada',
      `Massa aceita: ${Fmt.kg(kgAceito)} (registro anterior de ${Fmt.kg(anterior)} preservado na trilha).${nota ? ' ' + nota : ''}`,
      'Prefeitura');
    this._comprovar(demanda, Demanda.divergencia(demanda));
    this._gravar();
    this.notificar();
    return demanda;
  }

  private _comprovar(demanda: TDemanda, divergencia: number | null) {
    demanda.status = 'COMPROVADA';
    demanda.comprovante = {
      codigo: 'CMP-' + demanda.id.replace('DEM-', ''),
      emitidoEm: new Date().toISOString(),
      divergencia
    };
    this._registrar(demanda, 'Comprovante emitido',
      `${demanda.comprovante.codigo} · divergência final de ${Fmt.percentual(divergencia)}. Ciclo fechado com quem recebeu.`, 'Sistema');
  }

  private _novoId(): string {
    this.sequencia += 1;
    return 'DEM-' + String(this.sequencia).padStart(4, '0');
  }

  private _novoLote(demanda: TDemanda): string {
    const dia = new Date();
    return 'LT-' + String(dia.getFullYear()).slice(2) + String(dia.getMonth() + 1).padStart(2, '0') +
      String(dia.getDate()).padStart(2, '0') + '-' + demanda.id.replace('DEM-', '');
  }

  private _exigir(id: string, status: string): TDemanda {
    const demanda = this.obter(id);
    if (!demanda) throw new Error('Demanda não encontrada: ' + id);
    if (demanda.status !== status) {
      throw new Error(`Ação indisponível: a demanda está ${statusRotulo(demanda.status)}.`);
    }
    return demanda;
  }

  private _registrar(demanda: TDemanda, titulo: string, detalhe: string, autor: string, quando?: string) {
    demanda.eventos.push({ quando: quando || new Date().toISOString(), titulo, detalhe, autor });
  }

  private _ler(): { demandas: TDemanda[]; sequencia: number } | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (!bruto) return null;
      const dados = JSON.parse(bruto);
      return Array.isArray(dados.demandas) ? dados : null;
    } catch {
      return null;
    }
  }

  private _gravar() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({
        demandas: this.demandas,
        sequencia: this.sequencia
      }));
    } catch {
      /* Sem armazenamento local a demonstração continua, apenas não persiste. */
    }
  }
}

function statusRotulo(status: string): string {
  const rotulos: Record<string, string> = {
    CRIADA: 'rascunho', DISPONIVEL: 'disponível', ACEITA: 'aceita', EM_COLETA: 'em coleta',
    COLETADA: 'a caminho', PENDENCIA: 'pendência', COMPROVADA: 'comprovada'
  };
  return rotulos[status] || status.toLowerCase();
}

export const Store = new ArmazemDemandas();
