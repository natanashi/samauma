/* SAMAÚMA — regras da demanda de destinação.
   Funções puras sobre um objeto demanda: nada aqui lê armazenamento nem escreve
   tela. O que a demanda vale, quanto foi recuperado, se está atrasada e quem
   precisa agir agora. */

const Demanda = {
  /* Divergência entre o registrado em campo e o pesado na balança do destino. */
  divergencia(demanda) {
    if (demanda.coletadoKg == null || demanda.verificadoKg == null) return null;
    return Math.abs(demanda.verificadoKg - demanda.coletadoKg) / demanda.coletadoKg * 100;
  },

  dentroDaTolerancia(demanda) {
    const d = Demanda.divergencia(demanda);
    return d != null && d <= TOLERANCIA * 100;
  },

  /* Massa que efetivamente voltou ao ciclo produtivo. O que a triagem separou
     como rejeito não é reciclado — é aterro, e o sistema diz isso. */
  reciclado(demanda) {
    if (demanda.verificadoKg == null) return null;
    return Math.max(0, demanda.verificadoKg - (demanda.rejeitoKg || 0));
  },

  rejeito(demanda) {
    if (demanda.verificadoKg == null) return null;
    return demanda.rejeitoKg || 0;
  },

  /* Quanto do que entrou voltou ao ciclo. É o indicador ambiental honesto:
     massa coletada não é massa reciclada. */
  taxaRecuperacao(demanda) {
    const reciclado = Demanda.reciclado(demanda);
    if (reciclado == null || !demanda.verificadoKg) return null;
    return (reciclado / demanda.verificadoKg) * 100;
  },

  /* Valor demonstrativo do material recuperado — só o que foi reciclado gera
     renda; rejeito não paga nada a ninguém. */
  valor(demanda) {
    const kg = Demanda.reciclado(demanda) ?? demanda.coletadoKg;
    if (kg == null) return null;
    const residuo = Catalogo.residuo(demanda.residuo);
    return kg * (residuo ? residuo.preco : 0.5);
  },

  /* Emissão evitada por não mandar o material recuperado para o aterro. */
  co2(demanda) {
    const kg = Demanda.reciclado(demanda) ?? demanda.coletadoKg;
    if (kg == null) return null;
    const residuo = Catalogo.residuo(demanda.residuo);
    return kg * (residuo ? residuo.co2 : 1);
  },

  atrasada(demanda) {
    return EM_ABERTO.includes(demanda.status) && new Date(demanda.prazo) < new Date();
  },

  rotulo(demanda) {
    const base = STATUS[demanda.status].rotulo;
    return demanda.conciliada && demanda.status === 'COMPROVADA' ? base + ' · conciliada' : base;
  },

  /* Horas entre a criação da demanda e a emissão do comprovante. */
  cicloHoras(demanda) {
    if (!demanda.comprovante) return null;
    return (new Date(demanda.comprovante.emitidoEm) - new Date(demanda.criadaEm)) / 3600000;
  },

  /* O que a unidade receptora declarou ter feito com o material. */
  destinoFinal(demanda) {
    if (!demanda.destino) return '—';
    if (demanda.destinoFinal) return demanda.destinoFinal;
    const unidade = Catalogo.destino(demanda.destino.id);
    return unidade ? unidade.destinoFinal : '—';
  },

  /* Quem pode agir agora, e sobre o quê. Usado para não inventar botões. */
  proximaAcao(demanda) {
    switch (demanda.status) {
      case 'CRIADA':     return { perfil: 'gerador',      texto: 'Publicar para os catadores' };
      case 'DISPONIVEL': return { perfil: 'catador',      texto: 'Aceitar a demanda' };
      case 'ACEITA':     return { perfil: 'catador',      texto: 'Iniciar a coleta' };
      case 'EM_COLETA':  return { perfil: 'catador',      texto: 'Registrar peso e foto' };
      case 'COLETADA':   return { perfil: 'cooperativa',  texto: 'Receber a carga e pesar na balança' };
      case 'PENDENCIA':  return { perfil: 'prefeitura',   texto: 'Conciliar divergência' };
      default:           return { perfil: null,           texto: 'Ciclo concluído' };
    }
  },

  /* Massa que representa a demanda numa lista: sempre a medição mais recente,
     com o rótulo de quem a produziu. */
  massaCorrente(demanda) {
    if (demanda.status === 'COMPROVADA') {
      return { kg: demanda.verificadoKg, rotulo: 'recebidos', nota: 'comprovada em ' + Fmt.data(demanda.comprovante.emitidoEm) };
    }
    if (demanda.status === 'PENDENCIA') {
      return { kg: demanda.coletadoKg, rotulo: 'coletados', nota: 'em conciliação' };
    }
    if (demanda.status === 'COLETADA') {
      return { kg: demanda.coletadoKg, rotulo: 'coletados', nota: 'aguardando recebimento' };
    }
    return {
      kg: demanda.coletadoKg ?? demanda.estimadoKg,
      rotulo: demanda.coletadoKg != null ? 'coletados' : 'estimados',
      nota: 'prazo ' + Fmt.prazo(demanda.prazo),
      atrasada: Demanda.atrasada(demanda)
    };
  }
};
