/* SAMAÚMA — situação regulatória do gerador.
   A situação não é digitada por ninguém: sai do PGRS, das pendências abertas e
   da última destinação comprovada. Toda condição devolve um motivo em texto,
   porque "Irregular" sem explicação não ajuda quem precisa regularizar. */

/* Sem destinação comprovada por mais tempo que isto, o gerador sai do regular. */
const JANELA_DESTINACAO = 30;

/* PGRS vencendo dentro desta janela já pede providência. */
const JANELA_PGRS = 90;

const Regulatorio = {
  /* O PGRS do gerador, com a validade resolvida em data e em dias. */
  pgrs(gerador) {
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

  /* Situação regulatória a partir dos fatos. A ordem das regras importa:
     o que impede a regularidade vem antes do que apenas a ameaça. */
  situacao(gerador, demandas) {
    const motivos = [];
    const plano = Regulatorio.pgrs(gerador);
    const comprovadas = demandas.filter(d => d.status === 'COMPROVADA');
    const ultima = comprovadas
      .map(d => new Date(d.comprovante.emitidoEm))
      .sort((a, b) => b - a)[0] || null;
    /* Comprovante carimbado mais tarde no mesmo dia nao pode virar dia negativo. */
    const diasSemDestinar = ultima ? Math.max(0, Math.floor((Date.now() - ultima) / 86400000)) : null;

    let id = 'REGULAR';
    const rebaixar = (nivel, motivo) => {
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
    } else if (diasSemDestinar > JANELA_DESTINACAO) {
      rebaixar('IRREGULAR', `Sem destinação comprovada há ${diasSemDestinar} dias.`);
    }

    const pendencias = demandas.filter(d => d.status === 'PENDENCIA').length;
    if (pendencias) rebaixar('EM_REGULARIZACAO', `${pendencias} divergência(s) aguardando conciliação.`);

    const atrasadas = demandas.filter(Demanda.atrasada).length;
    if (atrasadas) rebaixar('EM_REGULARIZACAO', `${atrasadas} demanda(s) com prazo vencido sem coleta.`);

    if (!gerador.operador) rebaixar('EM_REGULARIZACAO', 'Sem operador de coleta contratado.');

    if (!motivos.length) {
      motivos.push(`PGRS válido, sem pendências e última destinação há ${diasSemDestinar} dia(s).`);
    }

    return { ...SITUACOES[id], motivos, pgrs: plano, diasSemDestinar, ultimaDestinacao: ultima ? ultima.toISOString() : null };
  },

  /* Aderência entre o que o gerador declara produzir por mês e o que de fato
     saiu do estabelecimento com comprovante nos últimos 30 dias. */
  aderencia(gerador, demandas) {
    if (!gerador || !gerador.volumeMes) return null;
    const corte = Date.now() - 30 * 86400000;
    const massa = somar(
      demandas.filter(d => d.status === 'COMPROVADA' && new Date(d.comprovante.emitidoEm) >= corte),
      d => d.verificadoKg
    );
    return { declarado: gerador.volumeMes, destinado: massa, parte: (massa / gerador.volumeMes) * 100 };
  },

  /* O selo só existe onde há prova: gerador regular, com destinação no período.
     O código é verificável e vira QR no painel e no relatório mensal. */
  selo(gerador, demandas) {
    const situacao = Regulatorio.situacao(gerador, demandas);
    const comprovadas = demandas.filter(d => d.status === 'COMPROVADA');
    const massa = somar(comprovadas, d => d.verificadoKg);
    const agora = new Date();
    const competencia = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}`;
    const codigo = `SAM-${gerador.id.replace('ger-', 'G')}-${competencia}`;

    return {
      codigo,
      valido: situacao.id === 'REGULAR',
      situacao,
      competencia,
      massa,
      comprovantes: comprovadas.length,
      /* Endereço de conferência pública do selo — no protótipo, a própria página. */
      verificacao: `https://samauma.portovelho.ro.gov.br/selo/${codigo}`
    };
  }
};
