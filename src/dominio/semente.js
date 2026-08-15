/* SAMAÚMA — dados demonstrativos.
   Histórico plausível para que todo perfil abra o sistema com o que acompanhar:
   a Prefeitura com indicadores, o catador com renda, o destinatário com fila e o
   gerador com situação regulatória.

   O retrato inclui o que costuma ser escondido: parte relevante da massa vai
   para o aterro sanitário, seja como rejeito indiferenciado, seja como perda de
   triagem do material reciclável. */

const Semente = {
  gerar() {
    const sortear = sorteador(20260815);
    const demandas = [];
    let sequencia = 0;

    const registrar = (demanda, titulo, detalhe, autor, quando) => {
      demanda.eventos.push({ quando, titulo, detalhe, autor });
    };

    const nova = (config) => {
      sequencia += 1;
      const gerador = GERADORES[config.geradorIndice];
      const ponto = Catalogo.ponto(gerador.ponto);
      const destino = destinoDoResiduo(config.residuo);
      const demanda = {
        id: 'DEM-' + String(sequencia).padStart(4, '0'),
        gerador: { id: gerador.id, nome: gerador.nome },
        residuo: config.residuo,
        estimadoKg: config.estimadoKg,
        ponto: ponto.id,
        bairro: ponto.bairro,
        zona: ponto.zona,
        km: gerador.km,
        prazo: dataRelativa(config.prazoEm, 17),
        observacao: config.observacao || '',
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
        criadaEm: dataRelativa(config.criadaEm, 8, 30),
        eventos: []
      };
      demandas.push(demanda);
      return demanda;
    };

    const avancar = (demanda, ate, config) => {
      const dia = config.criadaEm;
      const marca = (h, m) => dataRelativa(dia, h, m);
      const unidade = Catalogo.destino(demanda.destino.id);
      const gerador = Catalogo.gerador(demanda.gerador.id);
      const operador = Catalogo.operador(gerador);

      registrar(demanda, 'Demanda criada',
        `${demanda.gerador.nome} · ${Fmt.kg(demanda.estimadoKg)} de ${Catalogo.nomeResiduo(demanda.residuo)}. Destino previsto: ${demanda.destino.nome}.`,
        'Gerador', marca(8, 30));
      if (ate === 'CRIADA') return;

      demanda.status = 'DISPONIVEL';
      registrar(demanda, 'Demanda disponível',
        operador ? `Encaminhada ao operador contratado: ${operador.nome}.`
          : 'Encaminhada à fila aberta de catadores e cooperativas da região.',
        'Sistema', marca(8, 32));
      if (ate === 'DISPONIVEL') return;

      const catador = CATADORES[config.catadorIndice];
      const coop = Catalogo.cooperativa(catador.cooperativa);
      demanda.catador = { id: catador.id, nome: catador.nome, cooperativa: catador.cooperativa };
      demanda.status = 'ACEITA';
      registrar(demanda, 'Demanda aceita',
        `${catador.nome} · ${coop ? 'cooperado da ' + coop.nome : 'catador autônomo'}.`, 'Catador', marca(9, 10));
      if (ate === 'ACEITA') return;

      demanda.status = 'EM_COLETA';
      registrar(demanda, 'Coleta iniciada',
        `Deslocamento para ${demanda.gerador.nome} · ${Catalogo.endereco(demanda.ponto)}.`, 'Catador', marca(13, 20));
      if (ate === 'EM_COLETA') return;

      demanda.coletadoKg = Math.round(demanda.estimadoKg * (0.94 + sortear(0, 0.08)));
      registrar(demanda, 'Peso registrado',
        `${Fmt.kg(demanda.coletadoKg)} observados em campo · estimativa do gerador: ${Fmt.kg(demanda.estimadoKg)}.`,
        'Catador', marca(14, 5));
      demanda.foto = 'demonstrativa';
      registrar(demanda, 'Registro fotográfico anexado', 'Evidência da carga vinculada à demanda.', 'Catador', marca(14, 7));
      demanda.status = 'COLETADA';
      registrar(demanda, 'Carga em transporte',
        `${Fmt.kg(demanda.coletadoKg)} a caminho de ${demanda.destino.nome}.`, 'Catador', marca(14, 40));
      if (ate === 'COLETADA') return;

      /* Recebimento: a balança confirma e a unidade declara o que fez do material. */
      const desvio = config.divergente ? 0.055 + sortear(0, 0.03) : sortear(0, 0.028);
      demanda.verificadoKg = Math.round(demanda.coletadoKg * (1 - desvio));
      const residuo = Catalogo.residuo(demanda.residuo);
      demanda.rejeitoKg = unidade.aterro
        ? demanda.verificadoKg
        : Math.round(demanda.verificadoKg * residuo.perdaTriagem * (0.7 + sortear(0, 0.8)));
      demanda.destinoFinal = unidade.destinoFinal;
      demanda.recebidaEm = marca(15, 30);
      demanda.lote = 'LT-' + demanda.id.replace('DEM-', '') + '-' + String(Math.abs(dia)).padStart(2, '0');
      registrar(demanda, 'Carga recebida no destino',
        `${Fmt.kg(demanda.verificadoKg)} pesados na balança de ${demanda.destino.nome} · lote ${demanda.lote}. ` +
        `Recuperado ${Fmt.kg(Demanda.reciclado(demanda))}, rejeito ${Fmt.kg(demanda.rejeitoKg)}. ` +
        `Destino do material: ${demanda.destinoFinal}.`,
        'Destinatário', marca(15, 30));

      const divergencia = Demanda.divergencia(demanda);
      if (config.divergente) {
        demanda.status = 'PENDENCIA';
        registrar(demanda, 'Pendência aberta',
          `Divergência de ${Fmt.percentual(divergencia)} entre campo e balança, acima da tolerância de ${Fmt.percentual(TOLERANCIA * 100, 0)}. Nenhum registro foi apagado.`,
          'Sistema', marca(15, 31));
        if (ate === 'PENDENCIA') return;

        demanda.verificadoKg = Math.round(demanda.coletadoKg * 0.996);
        demanda.conciliada = true;
        registrar(demanda, 'Divergência conciliada',
          `Massa aceita: ${Fmt.kg(demanda.verificadoKg)} após conferência do tíquete de balança. Registro anterior preservado na trilha.`,
          'Prefeitura', marca(16, 10));
      }

      demanda.status = 'COMPROVADA';
      demanda.comprovante = {
        codigo: 'CMP-' + demanda.id.replace('DEM-', ''),
        emitidoEm: marca(16, 20),
        divergencia: Demanda.divergencia(demanda)
      };
      registrar(demanda, 'Comprovante emitido',
        `${demanda.comprovante.codigo} · divergência final de ${Fmt.percentual(demanda.comprovante.divergencia)}. Ciclo fechado com quem recebeu.`,
        'Sistema', marca(16, 20));
    };

    /* Histórico comprovado dos últimos doze dias.
       catadorIndice: 0 João, 1 Antônio, 2 Célio, 3 Rosa (CATANORTE), 4 Maria (autônoma). */
    const historico = [
      { criadaEm: -12, geradorIndice: 1, residuo: 'papelao', estimadoKg: 640, catadorIndice: 1 },
      { criadaEm: -12, geradorIndice: 3, residuo: 'rejeito', estimadoKg: 2400, catadorIndice: 2 },
      { criadaEm: -11, geradorIndice: 4, residuo: 'oleo', estimadoKg: 120, catadorIndice: 4 },
      { criadaEm: -11, geradorIndice: 3, residuo: 'plastico', estimadoKg: 380, catadorIndice: 0 },
      { criadaEm: -10, geradorIndice: 6, residuo: 'papel', estimadoKg: 510, catadorIndice: 3 },
      { criadaEm: -10, geradorIndice: 5, residuo: 'rejeito', estimadoKg: 1900, catadorIndice: 1 },
      { criadaEm: -9, geradorIndice: 0, residuo: 'papelao', estimadoKg: 720, catadorIndice: 0 },
      { criadaEm: -9, geradorIndice: 8, residuo: 'vidro', estimadoKg: 260, catadorIndice: 3 },
      { criadaEm: -8, geradorIndice: 2, residuo: 'papel', estimadoKg: 340, catadorIndice: 1, divergente: true },
      { criadaEm: -8, geradorIndice: 0, residuo: 'rejeito', estimadoKg: 1600, catadorIndice: 2 },
      { criadaEm: -7, geradorIndice: 5, residuo: 'papelao', estimadoKg: 980, catadorIndice: 3 },
      { criadaEm: -7, geradorIndice: 9, residuo: 'metal', estimadoKg: 180, catadorIndice: 4 },
      { criadaEm: -6, geradorIndice: 1, residuo: 'plastico', estimadoKg: 450, catadorIndice: 0 },
      { criadaEm: -6, geradorIndice: 3, residuo: 'rejeito', estimadoKg: 2100, catadorIndice: 1 },
      { criadaEm: -5, geradorIndice: 7, residuo: 'papel', estimadoKg: 290, catadorIndice: 2 },
      { criadaEm: -5, geradorIndice: 3, residuo: 'papelao', estimadoKg: 830, catadorIndice: 1 },
      { criadaEm: -4, geradorIndice: 4, residuo: 'oleo', estimadoKg: 95, catadorIndice: 4 },
      { criadaEm: -4, geradorIndice: 0, residuo: 'plastico', estimadoKg: 410, catadorIndice: 0 },
      { criadaEm: -3, geradorIndice: 6, residuo: 'papelao', estimadoKg: 560, catadorIndice: 3, divergente: true },
      { criadaEm: -3, geradorIndice: 8, residuo: 'vidro', estimadoKg: 310, catadorIndice: 2 },
      { criadaEm: -3, geradorIndice: 5, residuo: 'rejeito', estimadoKg: 1750, catadorIndice: 1 },
      { criadaEm: -2, geradorIndice: 2, residuo: 'papel', estimadoKg: 470, catadorIndice: 1 },
      { criadaEm: -2, geradorIndice: 5, residuo: 'metal', estimadoKg: 240, catadorIndice: 4 },
      { criadaEm: -1, geradorIndice: 9, residuo: 'papelao', estimadoKg: 700, catadorIndice: 0 },
      { criadaEm: -1, geradorIndice: 7, residuo: 'plastico', estimadoKg: 360, catadorIndice: 3 },
      { criadaEm: -1, geradorIndice: 0, residuo: 'papel', estimadoKg: 320, catadorIndice: 2 },
      { criadaEm: 0, geradorIndice: 1, residuo: 'papelao', estimadoKg: 520, catadorIndice: 1 },
      { criadaEm: 0, geradorIndice: 3, residuo: 'papel', estimadoKg: 280, catadorIndice: 3 },
      { criadaEm: 0, geradorIndice: 0, residuo: 'metal', estimadoKg: 150, catadorIndice: 0 }
    ];
    historico.forEach(config => avancar(nova({ ...config, prazoEm: config.criadaEm + 2 }), 'COMPROVADA', config));

    /* Cargas a caminho: é a fila de trabalho do destinatário. */
    const emAberto = [
      { criadaEm: -1, prazoEm: 1, geradorIndice: 5, residuo: 'papelao', estimadoKg: 1200, ate: 'COLETADA', catadorIndice: 3 },
      { criadaEm: 0, prazoEm: 1, geradorIndice: 1, residuo: 'plastico', estimadoKg: 540, ate: 'COLETADA', catadorIndice: 0 },
      { criadaEm: 0, prazoEm: 1, geradorIndice: 7, residuo: 'papel', estimadoKg: 380, ate: 'COLETADA', catadorIndice: 2 },
      { criadaEm: 0, prazoEm: 2, geradorIndice: 9, residuo: 'metal', estimadoKg: 210, ate: 'COLETADA', catadorIndice: 1 },
      { criadaEm: 0, prazoEm: 1, geradorIndice: 3, residuo: 'rejeito', estimadoKg: 2200, ate: 'COLETADA', catadorIndice: 2 },

      /* Em campo agora, com o catador da sessão. */
      { criadaEm: -1, prazoEm: 0, geradorIndice: 2, residuo: 'plastico', estimadoKg: 320, ate: 'EM_COLETA', catadorIndice: 0 },
      { criadaEm: 0, prazoEm: 0, geradorIndice: 6, residuo: 'papelao', estimadoKg: 540, ate: 'EM_COLETA', catadorIndice: 3 },
      { criadaEm: 0, prazoEm: 0, geradorIndice: 8, residuo: 'papelao', estimadoKg: 430, ate: 'ACEITA', catadorIndice: 0 },
      { criadaEm: 0, prazoEm: 0, geradorIndice: 4, residuo: 'oleo', estimadoKg: 110, ate: 'ACEITA', catadorIndice: 0,
        observacao: 'Bombonas na área de serviço; falar com o gerente do salão.' },
      { criadaEm: 0, prazoEm: 2, geradorIndice: 6, residuo: 'papel', estimadoKg: 610, ate: 'ACEITA', catadorIndice: 1 },
      { criadaEm: -1, prazoEm: 0, geradorIndice: 0, residuo: 'papelao', estimadoKg: 480, ate: 'ACEITA', catadorIndice: 4 },

      /* Fila aberta, esperando alguém aceitar. */
      { criadaEm: 0, prazoEm: 1, geradorIndice: 4, residuo: 'oleo', estimadoKg: 140, ate: 'DISPONIVEL' },
      { criadaEm: 0, prazoEm: 2, geradorIndice: 9, residuo: 'metal', estimadoKg: 220, ate: 'DISPONIVEL' },
      { criadaEm: 0, prazoEm: 3, geradorIndice: 7, residuo: 'vidro', estimadoKg: 350, ate: 'DISPONIVEL' },
      { criadaEm: 0, prazoEm: 2, geradorIndice: 5, residuo: 'rejeito', estimadoKg: 1800, ate: 'DISPONIVEL' },
      { criadaEm: 0, prazoEm: 1, geradorIndice: 3, residuo: 'plastico', estimadoKg: 480, ate: 'DISPONIVEL',
        observacao: 'Material segregado na doca de carga, acesso pela rua lateral.' }
    ];
    emAberto.forEach(config => avancar(nova(config), config.ate, config));

    /* Pendências abertas aguardando a Prefeitura. */
    const comPendencia = [
      { criadaEm: -1, prazoEm: 0, geradorIndice: 5, residuo: 'papelao', estimadoKg: 800, catadorIndice: 3, divergente: true },
      { criadaEm: -2, prazoEm: -1, geradorIndice: 2, residuo: 'papel', estimadoKg: 390, catadorIndice: 1, divergente: true },
      { criadaEm: -2, prazoEm: 0, geradorIndice: 6, residuo: 'plastico', estimadoKg: 260, catadorIndice: 4, divergente: true }
    ];
    comPendencia.forEach(config => avancar(nova(config), 'PENDENCIA', config));

    /* Rascunho do gerador da sessão, para que ele veja o ciclo desde o início. */
    avancar(nova({ criadaEm: 0, prazoEm: 2, geradorIndice: 0, residuo: 'plastico', estimadoKg: 300 }), 'CRIADA', { criadaEm: 0 });

    return { demandas, sequencia };
  }
};
