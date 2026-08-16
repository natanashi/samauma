/* SAMAÚMA — o armazém da demanda de destinação.
   Guarda as demandas, aplica as transições de estado e responde às consultas de
   cada perfil. Não calcula painel (isso é `indicadores.js`) nem monta tela. */

const CHAVE_ARMAZENAMENTO = 'samauma.demandas.v4';

const Store = {
  demandas: [],
  sequencia: 0,

  iniciar() {
    const salvo = this._ler();
    if (salvo) {
      this.demandas = salvo.demandas;
      this.sequencia = salvo.sequencia;
    } else {
      this.reiniciar();
    }
    return this;
  },

  reiniciar() {
    const semente = Semente.gerar();
    this.demandas = semente.demandas;
    this.sequencia = semente.sequencia;
    this._gravar();
  },

  obter(id) {
    return this.demandas.find(d => d.id === id) || null;
  },

  /* --------------------------------------------------------------- consultas */

  todas() {
    return this.demandas.slice().sort(this._maisRecente);
  },

  doGerador(geradorId = GERADOR_SESSAO) {
    return this.demandas.filter(d => d.gerador.id === geradorId).sort(this._maisRecente);
  },

  disponiveis() {
    return this.demandas.filter(d => d.status === 'DISPONIVEL').sort(this._porPrazo);
  },

  doCatador(catadorId) {
    return this.demandas.filter(d => d.catador && d.catador.id === catadorId).sort(this._maisRecente);
  },

  /* Todas as coletas da cooperativa: soma do trabalho dos catadores vinculados. */
  daCooperativa(cooperativaId) {
    const equipe = Catalogo.equipe(cooperativaId).map(c => c.id);
    return this.demandas.filter(d => d.catador && equipe.includes(d.catador.id)).sort(this._maisRecente);
  },

  paraDestino(destinoId) {
    return this.demandas.filter(d => d.destino && d.destino.id === destinoId).sort(this._maisRecente);
  },

  /* A fila de trabalho de quem recebe: já saiu, ainda não passou pela balança. */
  aCaminhoDe(destinoId) {
    return this.demandas
      .filter(d => d.status === 'COLETADA' && d.destino && d.destino.id === destinoId)
      .sort(this._porPrazo);
  },

  pendentes() {
    return this.demandas.filter(d => d.status === 'PENDENCIA').sort(this._maisRecente);
  },

  /* O dia de trabalho do catador: o que está com ele e vence hoje ou já venceu. */
  doDia(catadorId) {
    return this.demandas
      .filter(d => d.catador && d.catador.id === catadorId &&
        ['ACEITA', 'EM_COLETA'].includes(d.status) && Fmt.diasAte(d.prazo) <= 0)
      .sort(this._porPrazo);
  },

  proximaColeta(catadorId) {
    return this.demandas
      .filter(d => d.catador && d.catador.id === catadorId && ['ACEITA', 'EM_COLETA'].includes(d.status))
      .sort(this._porPrazo)[0] || null;
  },

  /* A próxima coleta na visão do gerador: qualquer demanda dele ainda em campo. */
  proximaDoGerador(geradorId = GERADOR_SESSAO) {
    return this.doGerador(geradorId)
      .filter(d => EM_CURSO.includes(d.status))
      .sort(this._porPrazo)[0] || null;
  },

  comprovantes(demandas) {
    return demandas.filter(d => d.status === 'COMPROVADA' && d.comprovante);
  },

  _maisRecente(a, b) { return new Date(b.criadaEm) - new Date(a.criadaEm); },
  _porPrazo(a, b) { return new Date(a.prazo) - new Date(b.prazo); },

  /* -------------------------------------------------------------- transições */

  criar({ geradorId = GERADOR_SESSAO, residuo, estimadoKg, ponto, prazo, observacao }) {
    const gerador = Catalogo.gerador(geradorId) || GERADORES[0];
    const destino = destinoDoResiduo(residuo);
    const local = Catalogo.ponto(ponto || gerador.ponto) || Catalogo.ponto(gerador.ponto);

    const demanda = {
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
    return demanda;
  },

  publicar(id) {
    const demanda = this._exigir(id, 'CRIADA');
    demanda.status = 'DISPONIVEL';
    const operador = Catalogo.operador(Catalogo.gerador(demanda.gerador.id));
    this._registrar(demanda, 'Demanda disponível',
      operador
        ? `Encaminhada ao operador contratado: ${operador.nome}.`
        : 'Encaminhada à fila aberta de catadores e cooperativas da região.',
      'Sistema');
    this._gravar();
    return demanda;
  },

  aceitar(id, catador) {
    const demanda = this._exigir(id, 'DISPONIVEL');
    demanda.status = 'ACEITA';
    demanda.catador = { id: catador.id, nome: catador.nome, cooperativa: catador.cooperativa };
    const coop = Catalogo.cooperativa(catador.cooperativa);
    this._registrar(demanda, 'Demanda aceita',
      `${catador.nome} · ${coop ? 'cooperado da ' + coop.nome : 'catador autônomo'}.`, 'Catador');
    this._gravar();
    return demanda;
  },

  iniciarColeta(id) {
    const demanda = this._exigir(id, 'ACEITA');
    demanda.status = 'EM_COLETA';
    this._registrar(demanda, 'Coleta iniciada',
      `Deslocamento para ${demanda.gerador.nome} · ${Catalogo.endereco(demanda.ponto)}.`, 'Catador');
    this._gravar();
    return demanda;
  },

  registrarPeso(id, kg) {
    const demanda = this._exigir(id, 'EM_COLETA');
    demanda.coletadoKg = kg;
    this._registrar(demanda, 'Peso registrado',
      `${Fmt.kg(kg)} observados em campo · estimativa do gerador: ${Fmt.kg(demanda.estimadoKg)}.`, 'Catador');
    this._gravar();
    return demanda;
  },

  anexarFoto(id, imagem) {
    const demanda = this._exigir(id, 'EM_COLETA');
    demanda.foto = imagem;
    this._registrar(demanda, 'Registro fotográfico anexado', 'Evidência da carga vinculada à demanda.', 'Catador');
    this._gravar();
    return demanda;
  },

  /* O catador fecha a carga e ela segue para o destinatário.
     Daqui em diante quem age é quem recebe. */
  finalizarColeta(id) {
    const demanda = this._exigir(id, 'EM_COLETA');
    if (demanda.coletadoKg == null) throw new Error('Registre o peso antes de finalizar.');
    demanda.status = 'COLETADA';
    this._registrar(demanda, 'Carga em transporte',
      `${Fmt.kg(demanda.coletadoKg)} a caminho de ${demanda.destino.nome}.`, 'Catador');
    this._gravar();
    return demanda;
  },

  /* Ponto final do ciclo: a balança confirma o que entrou e a unidade declara o
     que fez com o material. O rejeito é separado aqui — massa recebida não é
     massa reciclada, e o sistema mostra a diferença. */
  receber(id, { kg, rejeitoKg = 0, destinoFinal, nota, lote } = {}) {
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
        `Divergência de ${Fmt.percentual(divergencia)} entre campo e balança, acima da tolerância de ${Fmt.percentual(TOLERANCIA * 100, 0)}. Nenhum registro foi apagado.`,
        'Sistema');
    }
    this._gravar();
    return demanda;
  },

  /* Ato da Prefeitura: analisa a divergência, aceita uma massa e libera a prova. */
  conciliar(id, { kgAceito, nota }) {
    const demanda = this._exigir(id, 'PENDENCIA');
    const anterior = demanda.verificadoKg;
    const unidade = Catalogo.destino(demanda.destino.id);
    demanda.verificadoKg = kgAceito;
    demanda.rejeitoKg = unidade && unidade.aterro ? kgAceito : Math.min(demanda.rejeitoKg, kgAceito);
    demanda.conciliada = true;
    this._registrar(demanda, 'Divergência conciliada',
      `Massa aceita: ${Fmt.kg(kgAceito)} (registro anterior de ${Fmt.kg(anterior)} preservado na trilha).${nota ? ' ' + nota : ''}`,
      'Prefeitura');
    this._comprovar(demanda, Demanda.divergencia(demanda));
    this._gravar();
    return demanda;
  },

  _comprovar(demanda, divergencia) {
    demanda.status = 'COMPROVADA';
    demanda.comprovante = {
      codigo: 'CMP-' + demanda.id.replace('DEM-', ''),
      emitidoEm: new Date().toISOString(),
      divergencia
    };
    this._registrar(demanda, 'Comprovante emitido',
      `${demanda.comprovante.codigo} · divergência final de ${Fmt.percentual(divergencia)}. Ciclo fechado com quem recebeu.`, 'Sistema');
  },

  /* ------------------------------------------------------------ infra local */

  _novoId() {
    this.sequencia += 1;
    return 'DEM-' + String(this.sequencia).padStart(4, '0');
  },

  _novoLote(demanda) {
    const dia = new Date();
    return 'LT-' + String(dia.getFullYear()).slice(2) + String(dia.getMonth() + 1).padStart(2, '0') +
      String(dia.getDate()).padStart(2, '0') + '-' + demanda.id.replace('DEM-', '');
  },

  _exigir(id, status) {
    const demanda = this.obter(id);
    if (!demanda) throw new Error('Demanda não encontrada: ' + id);
    if (demanda.status !== status) {
      throw new Error(`Ação indisponível: a demanda está ${STATUS[demanda.status].rotulo.toLowerCase()}.`);
    }
    return demanda;
  },

  _registrar(demanda, titulo, detalhe, autor, quando) {
    demanda.eventos.push({ quando: quando || new Date().toISOString(), titulo, detalhe, autor });
  },

  _ler() {
    try {
      const bruto = localStorage.getItem(CHAVE_ARMAZENAMENTO);
      if (!bruto) return null;
      const dados = JSON.parse(bruto);
      return Array.isArray(dados.demandas) ? dados : null;
    } catch (erro) {
      return null;
    }
  },

  _gravar() {
    try {
      localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({
        demandas: this.demandas,
        sequencia: this.sequencia
      }));
    } catch (erro) {
      /* Sem armazenamento local a demonstração continua, apenas não persiste. */
    }
  }
};
