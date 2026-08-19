/* SAMAÚMA — regras da demanda de destinação.
   Funções puras sobre um objeto demanda: nada aqui lê armazenamento nem escreve
   tela. O que a demanda vale, quanto foi recuperado, se está atrasada e quem
   precisa agir agora. */

import { Catalogo, EM_ABERTO, STATUS, TOLERANCIA, TOLERANCIA_MINIMA_KG } from './catalogo';
import { Fmt } from './formato';
import type { Demanda } from './tipos';

export const DemandaRegras = {
  divergencia(demanda: Demanda): number | null {
    if (demanda.coletadoKg == null || demanda.verificadoKg == null) return null;
    return Math.abs(demanda.verificadoKg - demanda.coletadoKg) / demanda.coletadoKg * 100;
  },

  toleranciaKg(demanda: Demanda): number | null {
    if (demanda.coletadoKg == null) return null;
    return Math.max(demanda.coletadoKg * TOLERANCIA, TOLERANCIA_MINIMA_KG);
  },

  dentroDaTolerancia(demanda: Demanda): boolean {
    if (demanda.coletadoKg == null || demanda.verificadoKg == null) return false;
    return Math.abs(demanda.verificadoKg - demanda.coletadoKg) <= (DemandaRegras.toleranciaKg(demanda) as number);
  },

  reciclado(demanda: Demanda): number | null {
    if (demanda.verificadoKg == null) return null;
    return Math.max(0, demanda.verificadoKg - (demanda.rejeitoKg || 0));
  },

  rejeito(demanda: Demanda): number | null {
    if (demanda.verificadoKg == null) return null;
    return demanda.rejeitoKg || 0;
  },

  taxaRecuperacao(demanda: Demanda): number | null {
    const reciclado = DemandaRegras.reciclado(demanda);
    if (reciclado == null || !demanda.verificadoKg) return null;
    return (reciclado / demanda.verificadoKg) * 100;
  },

  valor(demanda: Demanda): number | null {
    const kg = DemandaRegras.reciclado(demanda) ?? demanda.coletadoKg;
    if (kg == null) return null;
    const residuo = Catalogo.residuo(demanda.residuo);
    return kg * (residuo ? residuo.preco : 0.5);
  },

  co2(demanda: Demanda): number | null {
    const kg = DemandaRegras.reciclado(demanda) ?? demanda.coletadoKg;
    if (kg == null) return null;
    const residuo = Catalogo.residuo(demanda.residuo);
    return kg * (residuo ? residuo.co2 : 1);
  },

  atrasada(demanda: Demanda): boolean {
    return EM_ABERTO.includes(demanda.status) && new Date(demanda.prazo) < new Date();
  },

  rotulo(demanda: Demanda): string {
    const base = STATUS[demanda.status].rotulo;
    return demanda.conciliada && demanda.status === 'COMPROVADA' ? base + ' · conciliada' : base;
  },

  cicloHoras(demanda: Demanda): number | null {
    if (!demanda.comprovante) return null;
    return (new Date(demanda.comprovante.emitidoEm).getTime() - new Date(demanda.criadaEm).getTime()) / 3600000;
  },

  destinoFinal(demanda: Demanda): string {
    if (!demanda.destino) return '—';
    if (demanda.destinoFinal) return demanda.destinoFinal;
    const unidade = Catalogo.destino(demanda.destino.id);
    return unidade ? unidade.destinoFinal : '—';
  },

  proximaAcao(demanda: Demanda): { perfil: string | null; texto: string } {
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

  massaCorrente(demanda: Demanda): { kg: number | null; rotulo: string; nota: string; atrasada?: boolean } {
    if (demanda.status === 'COMPROVADA') {
      return { kg: demanda.verificadoKg, rotulo: 'recebidos', nota: 'comprovada em ' + Fmt.data(demanda.comprovante!.emitidoEm) };
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
      atrasada: DemandaRegras.atrasada(demanda)
    };
  }
};
