/* SAMAÚMA — situação regulatória do gerador.
   A situação não é digitada por ninguém: sai do PGRS, das pendências abertas e
   da última destinação comprovada. Toda condição devolve um motivo em texto,
   porque "Irregular" sem explicação não ajuda quem precisa regularizar. */

import { SITUACOES } from './catalogo';
import { DemandaRegras as Demanda } from './demanda';
import { dataRelativa, somar } from './formato';
import type { Aderencia, Demanda as TDemanda, Gerador, PgrsResolvido, Selo, Situacao, SituacaoId } from './tipos';

/* Sem destinação comprovada por mais tempo que isto, o gerador sai do regular. */
export const JANELA_DESTINACAO = 30;

/* PGRS vencendo dentro desta janela já pede providência. */
export const JANELA_PGRS = 90;

export const Regulatorio = {
  pgrs(gerador: Gerador | null): PgrsResolvido | null {
    if (!gerador || !gerador.pgrs) return null;
    const dias = gerador.pgrs.validade;
    return {
      numero: gerador.pgrs.numero,
      validade: dataRelativa(dias, 23, 59),
      dias,
      vencido: dias < 0,
      vencendo: dias >= 0 && dias <= JANELA_PGRS
    };
  },

  situacao(gerador: Gerador | null, demandas: TDemanda[]): Situacao {
    const motivos: string[] = [];
    const plano = Regulatorio.pgrs(gerador);
    const comprovadas = demandas.filter(d => d.status === 'COMPROVADA');
    const ultima = comprovadas
      .map(d => new Date(d.comprovante!.emitidoEm))
      .sort((a, b) => b.getTime() - a.getTime())[0] || null;
    const diasSemDestinar = ultima ? Math.max(0, Math.floor((Date.now() - ultima.getTime()) / 86400000)) : null;

    let id: SituacaoId = 'REGULAR';
    const rebaixar = (nivel: SituacaoId, motivo: string) => {
      motivos.push(motivo);
      if (SITUACOES[nivel].ordem < SITUACOES[id].ordem) id = nivel;
    };

    if (!plano) {
      rebaixar('IRREGULAR', 'Sem PGRS cadastrado no sistema.');
    } else if (plano.vencido) {
      rebaixar('IRREGULAR', `PGRS ${plano.numero} vencido há ${Math.abs(plano.dias)} dias.`);
    } else if (plano.vencendo) {
      rebaixar('EM_REGULARIZACAO', `PGRS ${plano.numero} vence em ${plano.dias} dias.`);
    }

    if (!comprovadas.length) {
      rebaixar('IRREGULAR', 'Nenhuma destinação comprovada no sistema.');
    } else if (diasSemDestinar != null && diasSemDestinar > JANELA_DESTINACAO) {
      rebaixar('IRREGULAR', `Sem destinação comprovada há ${diasSemDestinar} dias.`);
    }

    const pendencias = demandas.filter(d => d.status === 'PENDENCIA').length;
    if (pendencias) rebaixar('EM_REGULARIZACAO', `${pendencias} divergência(s) aguardando conciliação.`);

    const atrasadas = demandas.filter(Demanda.atrasada).length;
    if (atrasadas) rebaixar('EM_REGULARIZACAO', `${atrasadas} demanda(s) com prazo vencido sem coleta.`);

    if (gerador && !gerador.operador) rebaixar('EM_REGULARIZACAO', 'Sem operador de coleta contratado.');

    if (!motivos.length) {
      motivos.push(`PGRS válido, sem pendências e última destinação há ${diasSemDestinar} dia(s).`);
    }

    return { ...SITUACOES[id] as Situacao, motivos, pgrs: plano, diasSemDestinar, ultimaDestinacao: ultima ? ultima.toISOString() : null };
  },

  aderencia(gerador: Gerador | null, demandas: TDemanda[]): Aderencia | null {
    if (!gerador || !gerador.volumeMes) return null;
    const corte = Date.now() - 30 * 86400000;
    const massa = somar(
      demandas.filter(d => d.status === 'COMPROVADA' && new Date(d.comprovante!.emitidoEm).getTime() >= corte),
      d => d.verificadoKg || 0
    );
    return { declarado: gerador.volumeMes, destinado: massa, parte: (massa / gerador.volumeMes) * 100 };
  },

  selo(gerador: Gerador | null, demandas: TDemanda[]): Selo {
    const situacao = Regulatorio.situacao(gerador, demandas);
    const comprovadas = demandas.filter(d => d.status === 'COMPROVADA');
    const massa = somar(comprovadas, d => d.verificadoKg || 0);
    const agora = new Date();
    const competencia = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const codigo = `SAM-${(gerador?.id || '').replace('ger-', 'G')}-${competencia}`;

    return {
      codigo,
      valido: situacao.id === 'REGULAR',
      situacao,
      competencia,
      massa,
      comprovantes: comprovadas.length,
      verificacao: `https://samauma.portovelho.ro.gov.br/selo/${codigo}`
    };
  }
};
