/* SAMAÚMA — área da Prefeitura.
   O município inteiro: quem gera, quem coleta, quem recebe e o que virou prova.
   Nenhum indicador é digitado — todos derivam das demandas registradas. */

function telaPrefeituraPainel() {
  const p = Painel.municipio();

  return `
    ${cabecalho('Acompanhamento municipal', 'O que está acontecendo, o que foi comprovado e onde existe problema.',
      exportar('prefeitura'))}

    ${kpis([
      kpi('Destinação comprovada', Fmt.toneladas(p.ambiental.massa), `${p.comprovadas} carga(s) com prova`, { tom: 'marca', destaque: true }),
      kpi('Coletas realizadas hoje', p.comprovadasHoje.length, `${Fmt.kg(p.massaHoje)} no dia`, { tom: 'ok' }),
      kpi('Demandas em andamento', p.emAndamento, `${p.emTransporte} a caminho do destino`),
      kpi('Geradores em atenção', p.atencao.length, `de ${p.geradores.length} cadastrados`, { tom: p.atencao.length ? 'erro' : 'ok' })
    ])}

    ${cartao({
      titulo: 'Para onde vai o resíduo do município',
      sub: 'Massa comprovada, separada entre o que voltou ao ciclo e o que foi aterrado',
      corpo: `${barraRecuperacao(p.ambiental)}
        <div class="micro-kpis">
          <div><b class="num">${esc(Fmt.toneladas(p.ambiental.massaAterrada))}</b><span>enviada direto ao aterro</span></div>
          <div><b class="num">${p.ambiental.cargasAterro}</b><span>cargas de rejeito</span></div>
          <div><b class="num">${esc(Fmt.reais(p.financeiro.custoAterroEvitado))}</b><span>custo de aterro evitado</span></div>
        </div>`,
      nota: 'Massa coletada não é massa reciclada: o rejeito da triagem e o resíduo indiferenciado seguem para o aterro sanitário.'
    })}

    <div class="colunas dois-um">
      ${cartao({ titulo: 'Destinação dia a dia', sub: 'Últimos 14 dias no município', corpo: graficoSerie(p.serie) })}
      ${cartao({
        titulo: 'Saúde do processo',
        sub: 'Sem número digitado',
        corpo: `<div class="aneis">
            ${anel(p.taxaComprovacao, { rotulo: 'comprovação', nota: 'demandas que fecharam o ciclo' })}
            ${anel(100 - (p.divergenciaMedia || 0), { rotulo: 'aderência', tom: 'azul', nota: `divergência média de ${Fmt.percentual(p.divergenciaMedia)}` })}
          </div>
          <div class="micro-kpis">
            <div><b class="num">${esc(Fmt.duracao(p.cicloMedio))}</b><span>ciclo médio</span></div>
            <div><b class="num">${p.pendentes}</b><span>pendências</span></div>
            <div><b class="num">${p.atrasadas}</b><span>atrasadas</span></div>
          </div>`
      })}
    </div>

    <div class="colunas tres">
      ${cartao({
        titulo: 'Indicadores ambientais',
        sub: 'O que o município deixou de aterrar',
        classe: 'indicador-tema ambiental',
        corpo: pares([
          ['Massa destinada com prova', esc(Fmt.toneladas(p.ambiental.massa))],
          ['Massa recuperada', esc(Fmt.toneladas(p.ambiental.reciclado))],
          ['Taxa de recuperação', esc(Fmt.percentual(p.ambiental.taxaRecuperacao))],
          ['Rejeito para aterro', esc(Fmt.toneladas(p.ambiental.rejeito))],
          ['CO₂e evitado', esc(Fmt.kg(Math.round(p.ambiental.co2Evitado)))],
          ['Cargas diretas ao aterro', p.ambiental.cargasAterro]
        ])
      })}
      ${cartao({
        titulo: 'Indicadores sociais',
        sub: 'Inclusão produtiva de catadores',
        classe: 'indicador-tema social',
        corpo: pares([
          ['Catadores com renda registrada', p.social.catadoresAtivos],
          ['Catadores cadastrados', p.social.catadoresCadastrados],
          ['Cooperados ativos', p.social.cooperados],
          ['Autônomos ativos', p.social.autonomos],
          ['Renda média por catador', esc(Fmt.reais(p.social.rendaMediaPorCatador))],
          ['Atendimentos comprovados', p.social.atendimentos]
        ])
      })}
      ${cartao({
        titulo: 'Indicadores financeiros',
        sub: 'O que o material movimenta',
        classe: 'indicador-tema financeiro',
        corpo: pares([
          ['Valor do material recuperado', esc(Fmt.reais(p.financeiro.valor))],
          ['Renda de cooperados', esc(Fmt.reais(p.social.rendaCooperados))],
          ['Renda de autônomos', esc(Fmt.reais(p.social.rendaAutonomos))],
          ['Valor médio por carga', esc(Fmt.reais(p.financeiro.ticketMedio))],
          ['Custo de aterro evitado', esc(Fmt.reais(p.financeiro.custoAterroEvitado))],
          ['Material mais valioso', p.financeiro.materialMaisValioso ? esc(p.financeiro.materialMaisValioso.nome) : '—']
        ])
      })}
    </div>

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Onde o material termina',
        sub: 'Destinatários que confirmaram o recebimento',
        corpo: ranking(p.destinos.map(d => ({ ...d, nota: `${d.tipo} · ${d.aCaminho} a caminho` })))
      })}
      ${cartao({ titulo: 'Composição municipal', sub: 'Massa por material', corpo: graficoRosca(p.materiais) })}
    </div>

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Quem coleta',
        sub: 'Cooperativas e catadores autônomos',
        corpo: ranking(p.cooperativas.map(c => ({
          ...c, nota: `${c.catadores} catador(es) · ${c.atendimentos} atendimento(s)`
        })))
      })}
      ${cartao({
        titulo: 'Geradores que precisam de atenção',
        sub: `${p.atencao.length} fora da situação regular`,
        acao: '<button class="btn sec sm" data-acao="aba" data-aba="geradores">Ver todos</button>',
        classe: p.atencao.length ? 'destaque-erro' : '',
        corpo: listaGeradores(p.atencao.slice(0, 5), { compacta: false })
      })}
    </div>

    ${blocoPendencias()}

    ${cartao({
      titulo: 'Histórico recente',
      sub: 'Últimas destinações comprovadas',
      acao: '<button class="btn sec sm" data-acao="aba" data-aba="processos">Ver processos</button>',
      corpo: listaDemandas(p.historico.slice(0, 6))
    })}`;
}

function blocoPendencias() {
  const pendencias = Store.pendentes();
  if (!pendencias.length) {
    return cartao({ titulo: 'Pendências', corpo: aviso('Sem divergências abertas', 'Todas as cargas fecharam dentro da tolerância.', 'bom') });
  }
  return cartao({
    titulo: 'Onde existe problema',
    sub: `${pendencias.length} divergência(s) acima da tolerância`,
    classe: 'destaque-erro',
    corpo: listaDemandas(pendencias),
    nota: 'Divergência não é punição: o sistema mantém os dois registros e pede uma decisão humana.'
  });
}

/* O território: onde estão os grandes geradores e quanto sai de cada ponto. */
function telaPrefeituraMapa() {
  const p = Painel.municipio();

  return `
    ${cabecalho('Mapa dos grandes geradores', 'Cada círculo é um ponto de coleta; o tamanho é a massa destinada e a cor é a situação regulatória.')}

    ${kpis([
      kpi('Pontos com coleta', p.pontos.length, `de ${PONTOS.length} cadastrados`, { tom: 'marca' }),
      kpi('Bairros atendidos', p.bairros.length, 'com massa comprovada'),
      kpi('Zona com mais massa', p.zonas.length ? p.zonas[0].nome : '—', p.zonas.length ? Fmt.percentual(p.zonas[0].parte, 0) + ' do total' : ''),
      kpi('Geradores em atenção', p.atencao.length, 'fora do regular', { tom: p.atencao.length ? 'erro' : 'ok' })
    ])}

    ${cartao({
      titulo: 'Território',
      sub: 'Grandes geradores por ponto de coleta',
      corpo: mapaPontos(p.geradores),
      nota: 'Coordenadas aproximadas de bairros reais de Porto Velho, para demonstrar a leitura territorial. Não são dados do geoportal da Prefeitura.'
    })}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Pontos de coleta',
        sub: 'Massa comprovada por ponto',
        corpo: listaPontos(p.pontos)
      })}
      ${cartao({
        titulo: 'Zonas da cidade',
        sub: 'Distribuição territorial',
        corpo: ranking(p.zonas.map(z => ({ ...z, nota: z.n + ' carga(s)' })))
      })}
    </div>`;
}

/* Cadastro de geradores, ordenado por quem precisa de atenção primeiro. */
function telaPrefeituraGeradores(estado) {
  const geradores = Painel.geradores();
  const filtro = estado.filtro || 'atencao';
  const grupos = {
    atencao: g => g.situacao.id !== 'REGULAR',
    irregular: g => g.situacao.id === 'IRREGULAR',
    regularizacao: g => g.situacao.id === 'EM_REGULARIZACAO',
    regular: g => g.situacao.id === 'REGULAR',
    todos: () => true
  };

  return `
    ${cabecalho('Grandes geradores', 'Situação regulatória calculada a partir do PGRS, das pendências e da última destinação comprovada.',
      exportar('prefeitura'))}

    ${kpis([
      kpi('Irregulares', geradores.filter(grupos.irregular).length, 'sem PGRS válido ou sem destinar', { tom: 'erro' }),
      kpi('Em regularização', geradores.filter(grupos.regularizacao).length, 'com prazo ou pendência a resolver', { tom: 'alerta' }),
      kpi('Regulares', geradores.filter(grupos.regular).length, 'com plano válido e destinação em dia', { tom: 'ok' }),
      kpi('Massa dos irregulares', Fmt.toneladas(somar(geradores.filter(grupos.irregular), 'massa')), 'já destinada com prova')
    ])}

    ${filtros(geradores, grupos, filtro, [
      ['atencao', 'Precisam de atenção'], ['irregular', 'Irregulares'],
      ['regularizacao', 'Em regularização'], ['regular', 'Regulares'], ['todos', 'Todos']
    ])}

    ${listaGeradores(geradores.filter(grupos[filtro] || grupos.todos))}`;
}

/* Ficha do gerador, na visão de quem fiscaliza. */
function telaGeradorFicha(estado) {
  const p = Painel.gerador(estado.geradorId);
  const s = p.situacao;

  return `
    <button class="voltar" data-acao="voltar">Voltar</button>

    ${cabecalho(p.cadastro.nome, `${p.cadastro.ramo} · CNPJ ${p.cadastro.cnpj} · ${Catalogo.endereco(p.cadastro.ponto)}`,
      situacaoGerador(s))}

    ${kpis([
      kpi('Massa destinada', Fmt.toneladas(p.ambiental.massa), `${p.comprovadas} comprovante(s)`, { tom: 'marca' }),
      kpi('Taxa de recuperação', Fmt.percentual(p.ambiental.taxaRecuperacao, 0), 'do que saiu deste gerador', { tom: 'ok' }),
      kpi('Em andamento', p.emAberto + p.emTransporte, 'demandas em campo'),
      kpi('Pendências', p.pendencias, 'aguardando conciliação', { tom: p.pendencias ? 'erro' : 'ok' })
    ])}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Por que esta situação',
        sub: s.rotulo,
        classe: s.id === 'REGULAR' ? 'acao-viva bom' : 'destaque-erro',
        corpo: `<ul class="motivos">${s.motivos.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
          ${pares([
            ['PGRS', s.pgrs ? esc(s.pgrs.numero) : 'não cadastrado'],
            ['Validade', s.pgrs ? esc(Fmt.data(s.pgrs.validade)) : '—'],
            ['Última destinação', s.ultimaDestinacao ? esc(Fmt.data(s.ultimaDestinacao)) : 'nunca'],
            ['Operador contratado', p.operador ? esc(p.operador.nome) : 'sem operador'],
            ['Volume declarado', esc(Fmt.kg(p.cadastro.volumeMes)) + ' / mês'],
            ['Aderência ao declarado', esc(Fmt.percentual(p.aderencia ? p.aderencia.parte : null, 0))]
          ])}`
      })}
      ${cartao({ titulo: 'Composição', sub: 'O que este gerador destina', corpo: graficoRosca(p.materiais) })}
    </div>

    ${cartao({ titulo: 'Destinação dia a dia', sub: 'Últimos 14 dias', corpo: graficoSerie(p.serie) })}

    ${cartao({
      titulo: 'Processos deste gerador',
      sub: `${p.total} demanda(s)`,
      corpo: listaDemandas(p.demandas.slice(0, 10))
    })}`;
}

function telaProcessos(estado) {
  const filtro = estado.filtro || 'todas';
  const grupos = {
    todas: () => true,
    andamento: d => ['DISPONIVEL', 'ACEITA', 'EM_COLETA'].includes(d.status),
    transporte: d => d.status === 'COLETADA',
    pendentes: d => d.status === 'PENDENCIA',
    comprovadas: d => d.status === 'COMPROVADA'
  };
  const todas = Store.todas();

  return `
    ${cabecalho('Processos', 'Cada linha é uma demanda de destinação, do cadastro ao comprovante.', exportar('prefeitura'))}
    ${filtros(todas, grupos, filtro, [
      ['todas', 'Todas'], ['andamento', 'Em coleta'], ['transporte', 'A caminho'],
      ['pendentes', 'Pendentes'], ['comprovadas', 'Comprovadas']
    ])}
    ${listaDemandas(todas.filter(grupos[filtro] || grupos.todas), {
      vazioTitulo: 'Nenhum processo neste filtro',
      vazioTexto: 'Ajuste o filtro para ver outras situações.'
    })}`;
}
