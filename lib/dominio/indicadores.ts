/* SAMAÚMA — indicadores e painéis.
   Todo número desta camada é derivado das demandas registradas: nada aqui é
   digitado por um operador. As séries são as mesmas para todos os perfis —
   muda apenas o recorte de demandas que entra nelas. */

import {
  CATADORES, Catalogo, DESTINOS, DESTINO_SESSAO, EM_ABERTO, EM_CURSO,
  GERADORES, GERADOR_SESSAO, RESIDUOS, TARIFA_ATERRO
} from './catalogo';
import { DemandaRegras as Demanda } from './demanda';
import { agrupar, inicioDoDia, media, mesmoDia, somar } from './formato';
import { Regulatorio } from './regulatorio';
import { Store } from './store';
import type { Demanda as TDemanda } from './tipos';

export const Painel = {

  serieDiaria(demandas: TDemanda[], dias = 14) {
    const hoje = inicioDoDia();
    const inicio = hoje - (dias - 1) * 86400000;
    const baldes: { iso: string; rotulo: string; curto: string; hoje: boolean; kg: number; reciclado: number; rejeito: number; n: number }[] = [];
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
      const indice = Math.round((inicioDoDia(new Date(d.comprovante!.emitidoEm)) - inicio) / 86400000);
      if (indice >= 0 && indice < dias) {
        baldes[indice].kg += d.verificadoKg || 0;
        baldes[indice].reciclado += Demanda.reciclado(d) || 0;
        baldes[indice].rejeito += Demanda.rejeito(d) || 0;
        baldes[indice].n += 1;
      }
    });
    return baldes;
  },

  porResiduo(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    const total = somar(comprovadas, d => d.verificadoKg || 0);
    return RESIDUOS
      .map(residuo => {
        const doTipo = comprovadas.filter(d => d.residuo === residuo.id);
        const kg = somar(doTipo, d => d.verificadoKg || 0);
        return {
          id: residuo.id,
          nome: residuo.nome,
          cor: residuo.cor,
          kg,
          n: doTipo.length,
          reciclado: somar(doTipo, d => Demanda.reciclado(d) || 0),
          renda: somar(doTipo, d => Demanda.valor(d) || 0),
          parte: total ? (kg / total) * 100 : 0
        };
      })
      .filter(item => item.kg > 0)
      .sort((a, b) => b.kg - a.kg);
  },

  porPonto(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    return agrupar(comprovadas, d => d.ponto, d => d.verificadoKg || 0).map(grupo => {
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
        reciclado: somar(grupo.itens, d => Demanda.reciclado(d) || 0),
        n: grupo.n,
        parte: grupo.parte
      };
    });
  },

  porBairro(demandas: TDemanda[]) {
    return agrupar(Store.comprovantes(demandas), d => d.bairro, d => d.verificadoKg || 0)
      .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte }));
  },

  porZona(demandas: TDemanda[]) {
    return agrupar(Store.comprovantes(demandas), d => d.zona, d => d.verificadoKg || 0)
      .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte }));
  },

  porDestino(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    const total = somar(comprovadas, d => d.verificadoKg || 0);
    return DESTINOS.map(unidade => {
      const recebidas = comprovadas.filter(d => d.destino.id === unidade.id);
      const massa = somar(recebidas, d => d.verificadoKg || 0);
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

  ambiental(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    const massa = somar(comprovadas, d => d.verificadoKg || 0);
    const reciclado = somar(comprovadas, d => Demanda.reciclado(d) || 0);
    const rejeito = somar(comprovadas, d => Demanda.rejeito(d) || 0);
    const aterradas = comprovadas.filter(d => {
      const unidade = Catalogo.destino(d.destino.id);
      return unidade && unidade.aterro;
    });
    return {
      massa,
      reciclado,
      rejeito,
      taxaRecuperacao: massa ? (reciclado / massa) * 100 : null,
      co2Evitado: somar(comprovadas, d => Demanda.co2(d) || 0),
      massaAterrada: somar(aterradas, d => d.verificadoKg || 0),
      cargasAterro: aterradas.length,
      aterroEvitado: reciclado
    };
  },

  social(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    const porCatador = agrupar(comprovadas.filter(d => d.catador), d => d.catador!.id, d => Demanda.valor(d) || 0);
    const cooperados = comprovadas.filter(d => d.catador && d.catador.cooperativa);
    const autonomos = comprovadas.filter(d => d.catador && !d.catador.cooperativa);
    const renda = somar(comprovadas, d => Demanda.valor(d) || 0);
    return {
      catadoresAtivos: porCatador.length,
      catadoresCadastrados: CATADORES.length,
      cooperados: new Set(cooperados.map(d => d.catador!.id)).size,
      autonomos: new Set(autonomos.map(d => d.catador!.id)).size,
      renda,
      rendaCooperados: somar(cooperados, d => Demanda.valor(d) || 0),
      rendaAutonomos: somar(autonomos, d => Demanda.valor(d) || 0),
      rendaMediaPorCatador: porCatador.length ? renda / porCatador.length : null,
      atendimentos: comprovadas.length
    };
  },

  financeiro(demandas: TDemanda[]) {
    const comprovadas = Store.comprovantes(demandas);
    const valor = somar(comprovadas, d => Demanda.valor(d) || 0);
    const porMaterial = Painel.porResiduo(demandas);
    const recicladoTotal = somar(comprovadas, d => Demanda.reciclado(d) || 0);
    return {
      valor,
      ticketMedio: comprovadas.length ? valor / comprovadas.length : null,
      valorPorKg: recicladoTotal ? valor / recicladoTotal : null,
      materialMaisValioso: porMaterial.slice().sort((a, b) => b.renda - a.renda)[0] || null,
      custoAterroEvitado: (recicladoTotal / 1000) * TARIFA_ATERRO
    };
  },

  gerador(geradorId: string = GERADOR_SESSAO) {
    const cadastro = Catalogo.gerador(geradorId);
    const minhas = Store.doGerador(geradorId);
    const comprovadas = Store.comprovantes(minhas);
    const emAberto = minhas.filter(d => EM_ABERTO.includes(d.status));
    const estimado = somar(comprovadas, d => d.estimadoKg);
    const massa = somar(comprovadas, d => d.verificadoKg || 0);

    return {
      cadastro: cadastro!,
      operador: Catalogo.operador(cadastro),
      situacao: Regulatorio.situacao(cadastro, minhas),
      selo: Regulatorio.selo(cadastro, minhas),
      aderencia: Regulatorio.aderencia(cadastro, minhas),
      ponto: Catalogo.ponto(cadastro!.ponto)!,

      total: minhas.length,
      emAberto: emAberto.length,
      emTransporte: minhas.filter(d => d.status === 'COLETADA').length,
      comprovadas: comprovadas.length,
      pendencias: minhas.filter(d => d.status === 'PENDENCIA').length,
      atrasadas: minhas.filter(Demanda.atrasada).length,
      rascunhos: minhas.filter(d => d.status === 'CRIADA').length,

      ambiental: Painel.ambiental(minhas),
      financeiro: Painel.financeiro(minhas),
      precisao: estimado ? Math.max(0, 100 - Math.abs(massa - estimado) / estimado * 100) : null,
      taxaComprovacao: minhas.length ? (comprovadas.length / minhas.length) * 100 : null,
      cicloMedio: media(comprovadas.map(d => Demanda.cicloHoras(d))),

      proxima: Store.proximaDoGerador(geradorId),
      serie: Painel.serieDiaria(minhas),
      materiais: Painel.porResiduo(minhas),
      destinos: Painel.porDestino(minhas),
      comprovantes: comprovadas.slice(0, 8),
      proximas: emAberto.slice().sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime()).slice(0, 5),
      demandas: minhas
    };
  },

  catador(catadorId: string) {
    const pessoa = Catalogo.catador(catadorId)!;
    const minhas = Store.doCatador(catadorId);
    const comprovadas = Store.comprovantes(minhas);
    const serie = Painel.serieDiaria(minhas);
    const semana = somar(serie.slice(-7), 'kg');
    const semanaAnterior = somar(serie.slice(0, 7), 'kg');
    const corte = Date.now() - 7 * 86400000;
    const rendaSemana = somar(comprovadas.filter(d => new Date(d.comprovante!.emitidoEm).getTime() >= corte), d => Demanda.valor(d) || 0);
    const ranking = Painel.rankingCatadores();
    const posicao = ranking.findIndex(r => r.id === catadorId) + 1;
    const materiais = Painel.porResiduo(minhas);
    const massaMedia = comprovadas.length ? somar(comprovadas, d => d.verificadoKg || 0) / comprovadas.length : null;
    const mediaDivergencia = media(comprovadas.map(d => d.comprovante!.divergencia));

    return {
      pessoa,
      cooperativa: Catalogo.cooperativa(pessoa.cooperativa),
      atendimentos: comprovadas.length,
      massa: somar(comprovadas, d => d.verificadoKg || 0),
      renda: somar(comprovadas, d => Demanda.valor(d) || 0),
      co2: somar(comprovadas, d => Demanda.co2(d) || 0),
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
      rendaMedia: comprovadas.length ? somar(comprovadas, d => Demanda.valor(d) || 0) / comprovadas.length : null,
      massaMedia,
      precisao: mediaDivergencia == null ? null : 100 - mediaDivergencia,
      posicao: posicao || null,
      totalCatadores: ranking.length,
      diasAtivos: new Set(comprovadas.map(d => new Date(d.comprovante!.emitidoEm).toDateString())).size,
      melhorMaterial: materiais.slice().sort((a, b) => b.renda - a.renda)[0] || null,

      serie,
      materiais,
      ranking,
      bairros: Painel.porBairro(minhas),
      comprovantes: comprovadas.slice(0, 8),
      ativas: minhas.filter(d => d.status !== 'COMPROVADA').sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime()),
      demandas: minhas
    };
  },

  cooperativa(cooperativaId: string) {
    const coop = Catalogo.cooperativa(cooperativaId);
    if (!coop) return null;
    const membros = Catalogo.equipe(cooperativaId);
    const daEquipe = Store.daCooperativa(cooperativaId);
    const comprovadas = Store.comprovantes(daEquipe);
    const massa = somar(comprovadas, d => d.verificadoKg || 0);
    const emAndamento = daEquipe.filter(d => ['ACEITA', 'EM_COLETA', 'COLETADA'].includes(d.status)).length;
    const capacidadeSemanal = membros.length * 3;

    return {
      cadastro: coop,
      catadores: membros.length,
      emAndamento,
      disponibilidade: Math.max(0, Math.round((1 - emAndamento / capacidadeSemanal) * 100)),
      massa,
      renda: somar(comprovadas, d => Demanda.valor(d) || 0),
      atendimentos: comprovadas.length,
      pendencias: daEquipe.filter(d => d.status === 'PENDENCIA').length,
      naFila: Store.disponiveis().length,
      equipe: membros.map(membro => {
        const dele = Store.comprovantes(Store.doCatador(membro.id));
        const massaDele = somar(dele, d => d.verificadoKg || 0);
        return {
          id: membro.id,
          nome: membro.nome,
          desde: membro.desde,
          massa: massaDele,
          renda: somar(dele, d => Demanda.valor(d) || 0),
          atendimentos: dele.length,
          parte: massa ? (massaDele / massa) * 100 : 0
        };
      }).sort((a, b) => b.massa - a.massa),
      serie: Painel.serieDiaria(daEquipe),
      materiais: Painel.porResiduo(daEquipe),
      emCampo: daEquipe.filter(d => ['ACEITA', 'EM_COLETA', 'COLETADA'].includes(d.status))
        .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
    };
  },

  destino(destinoId: string = DESTINO_SESSAO) {
    const unidade = Catalogo.destino(destinoId)!;
    const minhas = Store.paraDestino(destinoId);
    const comprovadas = Store.comprovantes(minhas);
    const recebidas = minhas.filter(d => d.verificadoKg != null);
    const aCaminho = Store.aCaminhoDe(destinoId);
    const recebidoHoje = somar(recebidas.filter(d => mesmoDia(d.recebidaEm)), d => d.verificadoKg || 0);
    const massa = somar(comprovadas, d => d.verificadoKg || 0);

    return {
      unidade,
      ponto: Catalogo.ponto(unidade.ponto)!,
      aCaminho,
      esperado: somar(aCaminho, d => d.coletadoKg || 0),
      recebidoHoje,
      recebidasHoje: recebidas.filter(d => mesmoDia(d.recebidaEm)),
      ocupacao: unidade.capacidadeDiaria ? Math.min(100, (recebidoHoje / unidade.capacidadeDiaria) * 100) : null,
      massa,
      atendimentos: comprovadas.length,
      pendencias: minhas.filter(d => d.status === 'PENDENCIA').length,
      divergenciaMedia: media(comprovadas.map(d => d.comprovante!.divergencia)),
      ambiental: Painel.ambiental(minhas),
      financeiro: Painel.financeiro(minhas),
      serie: Painel.serieDiaria(minhas),
      materiais: Painel.porResiduo(minhas),
      origens: agrupar(comprovadas.filter(d => d.catador), d => d.catador!.cooperativa
        ? Catalogo.cooperativa(d.catador!.cooperativa)!.nome : 'Catadores autônomos', d => d.verificadoKg || 0)
        .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte })),
      geradores: agrupar(comprovadas, d => d.gerador.nome, d => d.verificadoKg || 0)
        .map(g => ({ nome: g.chave, massa: g.massa, n: g.n, parte: g.parte })),
      recebidasTodas: recebidas.filter(d => d.status !== 'COLETADA'),
      comprovantes: comprovadas.slice(0, 8),
      demandas: minhas
    };
  },

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
      comprovadasHoje: comprovadas.filter(d => mesmoDia(d.comprovante!.emitidoEm)),
      massaHoje: somar(comprovadas.filter(d => mesmoDia(d.comprovante!.emitidoEm)), d => d.verificadoKg || 0),

      ambiental: Painel.ambiental(todas),
      social: Painel.social(todas),
      financeiro: Painel.financeiro(todas),

      taxaComprovacao: todas.length ? (comprovadas.length / todas.length) * 100 : null,
      divergenciaMedia: media(comprovadas.map(d => d.comprovante!.divergencia)),
      cicloMedio: media(comprovadas.map(d => Demanda.cicloHoras(d))),

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
        massa: somar(comprovadas, d => d.verificadoKg || 0),
        comprovantes: comprovadas.length,
        emAberto: minhas.filter(d => EM_CURSO.includes(d.status)).length,
        pendencias: minhas.filter(d => d.status === 'PENDENCIA').length
      };
    }).sort((a, b) => a.situacao.ordem - b.situacao.ordem || b.massa - a.massa);
  },

  rankingCooperativas() {
    const comprovadas = Store.comprovantes(Store.todas()).filter(d => d.catador);
    return agrupar(comprovadas,
      d => d.catador!.cooperativa ? Catalogo.cooperativa(d.catador!.cooperativa)!.nome : 'Catadores autônomos',
      d => d.verificadoKg || 0
    ).map(g => ({
      nome: g.chave,
      massa: g.massa,
      atendimentos: g.n,
      renda: somar(g.itens, d => Demanda.valor(d) || 0),
      catadores: new Set(g.itens.map(d => d.catador!.id)).size,
      autonomos: g.chave === 'Catadores autônomos',
      parte: g.parte
    }));
  },

  rankingCatadores() {
    const total = somar(Store.comprovantes(Store.todas()).filter(d => d.catador), d => d.verificadoKg || 0);
    return CATADORES.map(pessoa => {
      const dele = Store.comprovantes(Store.doCatador(pessoa.id));
      const massa = somar(dele, d => d.verificadoKg || 0);
      const coop = Catalogo.cooperativa(pessoa.cooperativa);
      return {
        id: pessoa.id,
        nome: pessoa.nome,
        vinculo: coop ? coop.nome : 'autônomo',
        massa,
        renda: somar(dele, d => Demanda.valor(d) || 0),
        atendimentos: dele.length,
        parte: total ? (massa / total) * 100 : 0
      };
    }).sort((a, b) => b.massa - a.massa);
  }
};
