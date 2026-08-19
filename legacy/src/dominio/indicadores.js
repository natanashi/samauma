/* SAMAÚMA — indicadores e painéis.
   Todo número desta camada é derivado das demandas registradas: nada aqui é
   digitado por um operador. As séries são as mesmas para todos os perfis —
   muda apenas o recorte de demandas que entra nelas. */

const Painel = {

  /* ------------------------------------------------------------- séries */

  /* Massa comprovada dia a dia, com o que foi recuperado e o que virou rejeito. */
  serieDiaria(demandas, dias = 14) {
    const hoje = inicioDoDia();
    const inicio = hoje - (dias - 1) * 86400000;
    const baldes = [];
    for (let i = 0; i < dias; i++) {
      const dia = new Date(inicio + i * 86400000);
      baldes.push({
        iso: dia.toISOString(),
        rotulo: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        curto: String(dia.getDate()).padStart(2, '0'),
        hoje: i === dias - 1,
        kg: 0, reciclado: 0, rejeito: 0, n: 0
      });
    }
    Store.comprovantes(demandas).forEach(d => {
      const indice = Math.round((inicioDoDia(new Date(d.comprovante.emitidoEm)) - inicio) / 86400000);
      if (indice >= 0 && indice < dias) {
        baldes[indice].kg += d.verificadoKg;
        baldes[indice].reciclado += Demanda.reciclado(d) || 0;
        baldes[indice].rejeito += Demanda.rejeito(d) || 0;
        baldes[indice].n += 1;
      }
    });
    return baldes;
  },

  /* Composição do que foi destinado, por material. */
  porResiduo(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    const total = somar(comprovadas, d => d.verificadoKg);
    return RESIDUOS
      .map(residuo => {
        const doTipo = comprovadas.filter(d => d.residuo === residuo.id);
        const kg = somar(doTipo, d => d.verificadoKg);
        return {
          id: residuo.id,
          nome: residuo.nome,
          cor: residuo.cor,
          kg,
          n: doTipo.length,
          reciclado: somar(doTipo, Demanda.reciclado),
          renda: somar(doTipo, Demanda.valor),
          parte: total ? (kg / total) * 100 : 0
        };
      })
      .filter(item => item.kg > 0)
      .sort((a, b) => b.kg - a.kg);
  },

  /* Massa por ponto de coleta: a leitura territorial do sistema. */
  porPonto(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    return agrupar(comprovadas, d => d.ponto, d => d.verificadoKg).map(grupo => {
      const ponto = Catalogo.ponto(grupo.chave);
      const geradores = [...new Set(grupo.itens.map(d => d.gerador.nome))];
      return {
        id: grupo.chave,
        nome: geradores.length === 1 ? geradores[0] : `${geradores.length} geradores`,
        bairro: ponto ? ponto.bairro : '—',
        zona: ponto ? ponto.zona : '—',
        lat: ponto ? ponto.lat : null,
        lng: ponto ? ponto.lng : null,
        geradores,
        massa: grupo.massa,
        reciclado: somar(grupo.itens, Demanda.reciclado),
        n: grupo.n,
        parte: grupo.parte
      };
    });
  },

  porBairro(demandas) {
    return agrupar(Store.comprovantes(demandas), d => d.bairro, d => d.verificadoKg)
      .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte }));
  },

  porZona(demandas) {
    return agrupar(Store.comprovantes(demandas), d => d.zona, d => d.verificadoKg)
      .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte }));
  },

  /* Para onde o material foi, e o que a unidade declarou ter feito com ele. */
  porDestino(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    const total = somar(comprovadas, d => d.verificadoKg);
    return DESTINOS.map(unidade => {
      const recebidas = comprovadas.filter(d => d.destino.id === unidade.id);
      const massa = somar(recebidas, d => d.verificadoKg);
      return {
        id: unidade.id,
        nome: unidade.nome,
        tipo: unidade.tipo,
        aterro: !!unidade.aterro,
        destinoFinal: unidade.destinoFinal,
        massa,
        n: recebidas.length,
        aCaminho: Store.aCaminhoDe(unidade.id).length,
        parte: total ? (massa / total) * 100 : 0
      };
    }).filter(u => u.massa > 0 || u.aCaminho > 0).sort((a, b) => b.massa - a.massa);
  },

  /* ------------------------------------------------------ blocos temáticos */

  /* Ambiental: massa recuperada de verdade, rejeito aterrado e emissão evitada.
     Massa coletada não é massa reciclada — a diferença aparece aqui. */
  ambiental(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    const massa = somar(comprovadas, d => d.verificadoKg);
    const reciclado = somar(comprovadas, Demanda.reciclado);
    const rejeito = somar(comprovadas, Demanda.rejeito);
    const aterradas = comprovadas.filter(d => {
      const unidade = Catalogo.destino(d.destino.id);
      return unidade && unidade.aterro;
    });
    return {
      massa,
      reciclado,
      rejeito,
      taxaRecuperacao: massa ? (reciclado / massa) * 100 : null,
      co2Evitado: somar(comprovadas, Demanda.co2),
      massaAterrada: somar(aterradas, d => d.verificadoKg),
      cargasAterro: aterradas.length,
      /* Aterro evitado é a massa que deixou de ir para a célula porque foi triada. */
      aterroEvitado: reciclado
    };
  },

  /* Social: quem está sendo incluído produtivamente, e quanto disso é renda. */
  social(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    const porCatador = agrupar(comprovadas.filter(d => d.catador), d => d.catador.id, Demanda.valor);
    const cooperados = comprovadas.filter(d => d.catador && d.catador.cooperativa);
    const autonomos = comprovadas.filter(d => d.catador && !d.catador.cooperativa);
    const renda = somar(comprovadas, Demanda.valor);
    return {
      catadoresAtivos: porCatador.length,
      catadoresCadastrados: CATADORES.length,
      cooperados: new Set(cooperados.map(d => d.catador.id)).size,
      autonomos: new Set(autonomos.map(d => d.catador.id)).size,
      renda,
      rendaCooperados: somar(cooperados, Demanda.valor),
      rendaAutonomos: somar(autonomos, Demanda.valor),
      rendaMediaPorCatador: porCatador.length ? renda / porCatador.length : null,
      atendimentos: comprovadas.length
    };
  },

  /* Financeiro: o valor que o material movimenta e como ele se distribui. */
  financeiro(demandas) {
    const comprovadas = Store.comprovantes(demandas);
    const valor = somar(comprovadas, Demanda.valor);
    const porMaterial = Painel.porResiduo(demandas);
    return {
      valor,
      ticketMedio: comprovadas.length ? valor / comprovadas.length : null,
      valorPorKg: somar(comprovadas, Demanda.reciclado) ? valor / somar(comprovadas, Demanda.reciclado) : null,
      materialMaisValioso: porMaterial.slice().sort((a, b) => b.renda - a.renda)[0] || null,
      /* Custo evitado de disposição: cada tonelada não aterrada deixa de pagar
         tarifa de aterro. Valor demonstrativo por tonelada. */
      custoAterroEvitado: (somar(comprovadas, Demanda.reciclado) / 1000) * TARIFA_ATERRO
    };
  },

  /* --------------------------------------------------- painéis por perfil */

  /* O gerador acompanha a própria destinação e a própria situação regulatória. */
  gerador(geradorId = GERADOR_SESSAO) {
    const cadastro = Catalogo.gerador(geradorId);
    const minhas = Store.doGerador(geradorId);
    const comprovadas = Store.comprovantes(minhas);
    const emAberto = minhas.filter(d => EM_ABERTO.includes(d.status));
    const estimado = somar(comprovadas, d => d.estimadoKg);
    const massa = somar(comprovadas, d => d.verificadoKg);

    return {
      cadastro,
      operador: Catalogo.operador(cadastro),
      situacao: Regulatorio.situacao(cadastro, minhas),
      selo: Regulatorio.selo(cadastro, minhas),
      aderencia: Regulatorio.aderencia(cadastro, minhas),
      ponto: Catalogo.ponto(cadastro.ponto),

      total: minhas.length,
      emAberto: emAberto.length,
      emTransporte: minhas.filter(d => d.status === 'COLETADA').length,
      comprovadas: comprovadas.length,
      pendencias: minhas.filter(d => d.status === 'PENDENCIA').length,
      atrasadas: minhas.filter(Demanda.atrasada).length,
      rascunhos: minhas.filter(d => d.status === 'CRIADA').length,

      ambiental: Painel.ambiental(minhas),
      financeiro: Painel.financeiro(minhas),
      /* Quanto a estimativa do gerador se aproximou da balança do destinatário. */
      precisao: estimado ? Math.max(0, 100 - Math.abs(massa - estimado) / estimado * 100) : null,
      taxaComprovacao: minhas.length ? (comprovadas.length / minhas.length) * 100 : null,
      cicloMedio: media(comprovadas.map(Demanda.cicloHoras)),

      proxima: Store.proximaDoGerador(geradorId),
      serie: Painel.serieDiaria(minhas),
      materiais: Painel.porResiduo(minhas),
      destinos: Painel.porDestino(minhas),
      comprovantes: comprovadas.slice(0, 8),
      proximas: emAberto.slice().sort((a, b) => new Date(a.prazo) - new Date(b.prazo)).slice(0, 5),
      demandas: minhas
    };
  },

  /* O painel individual do catador: a renda dele, a meta dele, a posição dele. */
  catador(catadorId) {
    const pessoa = Catalogo.catador(catadorId);
    const minhas = Store.doCatador(catadorId);
    const comprovadas = Store.comprovantes(minhas);
    const serie = Painel.serieDiaria(minhas);
    const semana = somar(serie.slice(-7), 'kg');
    const semanaAnterior = somar(serie.slice(0, 7), 'kg');
    const corte = Date.now() - 7 * 86400000;
    const rendaSemana = somar(comprovadas.filter(d => new Date(d.comprovante.emitidoEm) >= corte), Demanda.valor);
    const ranking = Painel.rankingCatadores();
    const posicao = ranking.findIndex(r => r.id === catadorId) + 1;
    const materiais = Painel.porResiduo(minhas);

    return {
      pessoa,
      cooperativa: Catalogo.cooperativa(pessoa.cooperativa),
      atendimentos: comprovadas.length,
      massa: somar(comprovadas, d => d.verificadoKg),
      renda: somar(comprovadas, Demanda.valor),
      co2: somar(comprovadas, Demanda.co2),
      emAndamento: minhas.filter(d => d.status !== 'COMPROVADA').length,
      pendencias: minhas.filter(d => d.status === 'PENDENCIA').length,
      naFila: Store.disponiveis().length,

      hoje: Store.doDia(catadorId),
      proxima: Store.proximaColeta(catadorId),
      massaSemana: semana,
      rendaSemana,
      variacaoSemana: semanaAnterior ? ((semana - semanaAnterior) / semanaAnterior) * 100 : null,
      meta: pessoa.metaSemanal,
      metaAtingida: pessoa.metaSemanal ? Math.min(100, (semana / pessoa.metaSemanal) * 100) : null,
      rendaMedia: comprovadas.length ? somar(comprovadas, Demanda.valor) / comprovadas.length : null,
      massaMedia: comprovadas.length ? somar(comprovadas, d => d.verificadoKg) / comprovadas.length : null,
      precisao: media(comprovadas.map(d => d.comprovante.divergencia)) == null
        ? null : 100 - media(comprovadas.map(d => d.comprovante.divergencia)),
      posicao: posicao || null,
      totalCatadores: ranking.length,
      diasAtivos: new Set(comprovadas.map(d => new Date(d.comprovante.emitidoEm).toDateString())).size,
      melhorMaterial: materiais.slice().sort((a, b) => b.renda - a.renda)[0] || null,

      serie,
      materiais,
      ranking,
      bairros: Painel.porBairro(minhas),
      comprovantes: comprovadas.slice(0, 8),
      ativas: minhas.filter(d => d.status !== 'COMPROVADA').sort((a, b) => new Date(a.prazo) - new Date(b.prazo)),
      demandas: minhas
    };
  },

  /* A cooperativa é estrutura de operação do catador, não usuário à parte:
     este painel vive dentro da área de quem é cooperado. */
  cooperativa(cooperativaId) {
    const coop = Catalogo.cooperativa(cooperativaId);
    if (!coop) return null;
    const membros = Catalogo.equipe(cooperativaId);
    const daEquipe = Store.daCooperativa(cooperativaId);
    const comprovadas = Store.comprovantes(daEquipe);
    const massa = somar(comprovadas, d => d.verificadoKg);
    const emAndamento = daEquipe.filter(d => ['ACEITA', 'EM_COLETA', 'COLETADA'].includes(d.status)).length;
    const capacidadeSemanal = membros.length * 3;

    return {
      cadastro: coop,
      catadores: membros.length,
      emAndamento,
      disponibilidade: Math.max(0, Math.round((1 - emAndamento / capacidadeSemanal) * 100)),
      massa,
      renda: somar(comprovadas, Demanda.valor),
      atendimentos: comprovadas.length,
      pendencias: daEquipe.filter(d => d.status === 'PENDENCIA').length,
      naFila: Store.disponiveis().length,
      equipe: membros.map(membro => {
        const dele = Store.comprovantes(Store.doCatador(membro.id));
        const massaDele = somar(dele, d => d.verificadoKg);
        return {
          id: membro.id,
          nome: membro.nome,
          desde: membro.desde,
          massa: massaDele,
          renda: somar(dele, Demanda.valor),
          atendimentos: dele.length,
          parte: massa ? (massaDele / massa) * 100 : 0
        };
      }).sort((a, b) => b.massa - a.massa),
      serie: Painel.serieDiaria(daEquipe),
      materiais: Painel.porResiduo(daEquipe),
      emCampo: daEquipe.filter(d => ['ACEITA', 'EM_COLETA', 'COLETADA'].includes(d.status))
        .sort((a, b) => new Date(a.prazo) - new Date(b.prazo))
    };
  },

  /* O painel de quem fecha o ciclo. */
  destino(destinoId = DESTINO_SESSAO) {
    const unidade = Catalogo.destino(destinoId);
    const minhas = Store.paraDestino(destinoId);
    const comprovadas = Store.comprovantes(minhas);
    const recebidas = minhas.filter(d => d.verificadoKg != null);
    const aCaminho = Store.aCaminhoDe(destinoId);
    const recebidoHoje = somar(recebidas.filter(d => mesmoDia(d.recebidaEm)), d => d.verificadoKg);
    const massa = somar(comprovadas, d => d.verificadoKg);

    return {
      unidade,
      ponto: Catalogo.ponto(unidade.ponto),
      aCaminho,
      esperado: somar(aCaminho, d => d.coletadoKg),
      recebidoHoje,
      recebidasHoje: recebidas.filter(d => mesmoDia(d.recebidaEm)),
      ocupacao: unidade.capacidadeDiaria ? Math.min(100, (recebidoHoje / unidade.capacidadeDiaria) * 100) : null,
      massa,
      atendimentos: comprovadas.length,
      pendencias: minhas.filter(d => d.status === 'PENDENCIA').length,
      divergenciaMedia: media(comprovadas.map(d => d.comprovante.divergencia)),
      ambiental: Painel.ambiental(minhas),
      financeiro: Painel.financeiro(minhas),
      serie: Painel.serieDiaria(minhas),
      materiais: Painel.porResiduo(minhas),
      origens: agrupar(comprovadas.filter(d => d.catador), d => d.catador.cooperativa
        ? Catalogo.cooperativa(d.catador.cooperativa).nome : 'Catadores autônomos', d => d.verificadoKg)
        .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte })),
      geradores: agrupar(comprovadas, d => d.gerador.nome, d => d.verificadoKg)
        .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte })),
      recebidasTodas: recebidas.filter(d => d.status !== 'COLETADA'),
      comprovantes: comprovadas.slice(0, 8),
      demandas: minhas
    };
  },

  /* O município inteiro, na visão de quem fiscaliza. */
  municipio() {
    const todas = Store.todas();
    const comprovadas = Store.comprovantes(todas);
    const emAndamento = todas.filter(d => EM_CURSO.includes(d.status));

    return {
      total: todas.length,
      comprovadas: comprovadas.length,
      emAndamento: emAndamento.length,
      emTransporte: todas.filter(d => d.status === 'COLETADA').length,
      pendentes: Store.pendentes().length,
      atrasadas: todas.filter(Demanda.atrasada).length,
      criadasHoje: todas.filter(d => mesmoDia(d.criadaEm)).length,
      comprovadasHoje: comprovadas.filter(d => mesmoDia(d.comprovante.emitidoEm)),
      massaHoje: somar(comprovadas.filter(d => mesmoDia(d.comprovante.emitidoEm)), d => d.verificadoKg),

      ambiental: Painel.ambiental(todas),
      social: Painel.social(todas),
      financeiro: Painel.financeiro(todas),

      taxaComprovacao: todas.length ? (comprovadas.length / todas.length) * 100 : null,
      divergenciaMedia: media(comprovadas.map(d => d.comprovante.divergencia)),
      cicloMedio: media(comprovadas.map(Demanda.cicloHoras)),

      serie: Painel.serieDiaria(todas),
      materiais: Painel.porResiduo(todas),
      pontos: Painel.porPonto(todas),
      bairros: Painel.porBairro(todas),
      zonas: Painel.porZona(todas),
      destinos: Painel.porDestino(todas),
      cooperativas: Painel.rankingCooperativas(),
      catadores: Painel.rankingCatadores(),
      geradores: Painel.geradores(),
      atencao: Painel.geradores().filter(g => g.situacao.id !== 'REGULAR'),
      historico: comprovadas.slice(0, 12)
    };
  },

  /* --------------------------------------------------------- classificações */

  /* Todo gerador cadastrado com a sua situação calculada. Base do mapa e da
     lista de quem precisa de atenção. */
  geradores() {
    return GERADORES.map(cadastro => {
      const minhas = Store.doGerador(cadastro.id);
      const comprovadas = Store.comprovantes(minhas);
      const ponto = Catalogo.ponto(cadastro.ponto);
      return {
        id: cadastro.id,
        nome: cadastro.nome,
        cnpj: cadastro.cnpj,
        ramo: cadastro.ramo,
        bairro: ponto ? ponto.bairro : '—',
        zona: ponto ? ponto.zona : '—',
        lat: ponto ? ponto.lat : null,
        lng: ponto ? ponto.lng : null,
        operador: Catalogo.operador(cadastro),
        situacao: Regulatorio.situacao(cadastro, minhas),
        aderencia: Regulatorio.aderencia(cadastro, minhas),
        massa: somar(comprovadas, d => d.verificadoKg),
        comprovantes: comprovadas.length,
        emAberto: minhas.filter(d => EM_CURSO.includes(d.status)).length,
        pendencias: minhas.filter(d => d.status === 'PENDENCIA').length
      };
    }).sort((a, b) => a.situacao.ordem - b.situacao.ordem || b.massa - a.massa);
  },

  rankingCooperativas() {
    const comprovadas = Store.comprovantes(Store.todas()).filter(d => d.catador);
    return agrupar(comprovadas,
      d => d.catador.cooperativa ? Catalogo.cooperativa(d.catador.cooperativa).nome : 'Catadores autônomos',
      d => d.verificadoKg
    ).map(g => ({
      nome: g.chave,
      massa: g.massa,
      atendimentos: g.n,
      renda: somar(g.itens, Demanda.valor),
      catadores: new Set(g.itens.map(d => d.catador.id)).size,
      autonomos: g.chave === 'Catadores autônomos',
      parte: g.parte
    }));
  },

  rankingCatadores() {
    const total = somar(Store.comprovantes(Store.todas()).filter(d => d.catador), d => d.verificadoKg);
    return CATADORES.map(pessoa => {
      const dele = Store.comprovantes(Store.doCatador(pessoa.id));
      const massa = somar(dele, d => d.verificadoKg);
      const coop = Catalogo.cooperativa(pessoa.cooperativa);
      return {
        id: pessoa.id,
        nome: pessoa.nome,
        vinculo: coop ? coop.nome : 'autônomo',
        massa,
        renda: somar(dele, Demanda.valor),
        atendimentos: dele.length,
        parte: total ? (massa / total) * 100 : 0
      };
    }).sort((a, b) => b.massa - a.massa);
  }
};
