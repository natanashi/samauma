/* SAMAÚMA — área do catador.
   O catador é usuário por si: cooperado da CATANORTE ou autônomo, ele vê o
   mesmo sistema e pode as mesmas coisas. O vínculo muda só o que ele enxerga
   da equipe.

   Quatro telas: o dia (o que fazer agora), as demandas disponíveis, as coletas
   dele e o painel individual. */

/* Como esta rota vai ser registrada. Celular pessoal nunca é requisito para
   trabalhar: a sessão pertence à rota, não ao aparelho nem à pessoa. */
let CANAL_REGISTRO = 'compartilhado';

function blocoCanais() {
  const opcoes = Object.entries(CANAIS).map(([id, canal]) => `
    <button class="canal ${id === CANAL_REGISTRO ? 'on' : ''}" data-acao="canal" data-canal="${id}"
      aria-pressed="${id === CANAL_REGISTRO}">
      <b>${esc(canal.nome)}</b><span>${esc(canal.texto)}</span>
      ${canal.digitadoPor ? `<small class="fonte-dado">assina tambem: ${esc(canal.digitadoPor)}</small>` : ''}
    </button>`).join('');

  return cartao({
    titulo: 'Como esta rota será registrada',
    sub: 'Quatro caminhos — nenhum deles exige celular próprio',
    corpo: `<div class="canais">${opcoes}</div>`,
    acao: `<button class="btn sec sm" data-acao="ficha">Baixar ficha de papel</button>`,
    nota: 'O canal escolhido entra na trilha: quando alguem digita por outra pessoa, o evento guarda quem executou e quem registrou. Sem aparelho ou sem bateria, a coleta vai para a ficha numerada e e digitada depois no galpao.'
  });
}

function faixaCatador(acao) {
  const p = Painel.catador(Sessao.catador.id);
  return faixaPerfil({
    nome: p.pessoa.nome,
    papel: p.cooperativa ? `Cooperado da ${p.cooperativa.nome} · ${p.pessoa.veiculo}` : `Catador autônomo · ${p.pessoa.veiculo}`,
    medidas: [
      [p.atendimentos, 'atendimentos'],
      [Fmt.toneladas(p.massa), 'massa entregue'],
      [Fmt.reais(p.renda), 'valor gerado'],
      [p.emAndamento, 'em campo']
    ],
    acao
  });
}

/* O dia de trabalho: o que está com ele, onde fica e o que fazer agora. */
function telaCatadorDia() {
  const p = Painel.catador(Sessao.catador.id);
  const hoje = p.hoje;

  return `
    ${cabecalho('Meu dia', `${p.pessoa.nome} · ${Fmt.data(new Date().toISOString())}`,
      `<button class="btn" data-acao="aba" data-aba="disponiveis">${p.naFila} demanda(s) na fila</button>`)}

    ${faixaCatador()}

    ${blocoCanais()}

    ${cartao({
      titulo: 'Próxima coleta',
      sub: p.proxima ? 'A mais urgente entre as suas' : 'Nada em campo agora',
      classe: p.proxima ? 'acao-viva' : '',
      corpo: p.proxima ? blocoProximaColeta(p.proxima) : vazio(
        'Nenhuma coleta aceita',
        'Escolha uma demanda disponível para começar o dia.')
    })}

    ${cartao({
      titulo: 'Coletas de hoje',
      sub: hoje.length ? `${hoje.length} coleta(s) com prazo hoje ou vencido` : 'Nenhuma coleta vence hoje',
      corpo: listaColetas(hoje, {
        vazioTitulo: 'Nada vence hoje',
        vazioTexto: 'Suas outras coletas aparecem em “Minhas coletas”.'
      })
    })}

    ${kpis([
      kpi('Na semana', Fmt.kg(p.massaSemana), 'massa entregue nos últimos 7 dias', { variacao: p.variacaoSemana }),
      kpi('Valor na semana', Fmt.reais(p.rendaSemana), 'pelo material recuperado', { tom: 'marca' }),
      kpi('Meta semanal', Fmt.percentual(p.metaAtingida, 0), `${Fmt.kg(p.meta)} combinados`, { tom: p.metaAtingida >= 100 ? 'ok' : '' }),
      kpi('Em campo agora', p.emAndamento, 'sob sua responsabilidade', { tom: p.emAndamento ? 'alerta' : 'ok' })
    ])}`;
}

/* O que o catador precisa saber antes de sair: endereço, acesso, tipo, volume. */
function blocoProximaColeta(demanda) {
  const ponto = Catalogo.ponto(demanda.ponto);
  const proxima = Demanda.proximaAcao(demanda);
  return `<div class="proxima-coleta">
    <div class="quando">
      <span class="etiqueta">Prazo</span>
      <b>${esc(Fmt.prazo(demanda.prazo))}</b>
      <span>${esc(Fmt.data(demanda.prazo))} · ${esc(Fmt.turno(demanda.prazo))}</span>
    </div>
    <div class="onde">
      <span class="etiqueta">Endereço</span>
      <b>${esc(demanda.gerador.nome)}</b>
      <span>${esc(ponto.bairro)} · ${esc(ponto.zona)}</span>
      <span class="acesso">${esc(ponto.acesso)}</span>
      ${demanda.observacao ? `<span class="acesso">“${esc(demanda.observacao)}”</span>` : ''}
    </div>
    <div class="oque">
      <span class="etiqueta">Material</span>
      <b>${esc(Catalogo.nomeResiduo(demanda.residuo))}</b>
      <span>${esc(Fmt.kg(demanda.estimadoKg))} estimados</span>
      <span>${demanda.km.toLocaleString('pt-BR')} km · ${esc(Fmt.reais(Demanda.valor({ ...demanda, verificadoKg: demanda.estimadoKg, rejeitoKg: 0 })))} estimados</span>
    </div>
    <div class="agir">
      ${situacaoDemanda(demanda)}
      <button class="btn" data-acao="abrir" data-id="${demanda.id}">${esc(proxima.texto)}</button>
    </div>
  </div>`;
}

function telaCatadorDisponiveis() {
  const disponiveis = Store.disponiveis();
  const p = Painel.catador(Sessao.catador.id);

  return `
    ${cabecalho('Demandas disponíveis', 'Escolha o que cabe na sua rota. Aceitar é decisão sua.')}
    ${faixaCatador()}
    ${p.cooperativa ? aviso('Fila compartilhada',
      `Estas demandas estão abertas para toda a rede — cooperados da ${p.cooperativa.nome} e catadores autônomos.`) : ''}
    ${listaDemandas(disponiveis, {
      visao: 'catador',
      vazioTitulo: 'Nenhuma demanda aberta agora',
      vazioTexto: 'Assim que um gerador publicar, ela aparece aqui.'
    })}`;
}

function telaCatadorMinhas(estado) {
  const p = Painel.catador(Sessao.catador.id);
  const filtro = estado.filtro || 'andamento';
  const grupos = {
    andamento: d => d.status !== 'COMPROVADA',
    comprovadas: d => d.status === 'COMPROVADA',
    todas: () => true
  };

  return `
    ${cabecalho('Minhas coletas', 'O que você aceitou, o que está em campo e o que já virou comprovante.',
      exportar('catador'))}
    ${faixaCatador()}
    ${filtros(p.demandas, grupos, filtro, [
      ['andamento', 'Em andamento'], ['comprovadas', 'Comprovadas'], ['todas', 'Todas']
    ])}
    ${listaDemandas(p.demandas.filter(grupos[filtro] || grupos.todas), {
      visao: 'catador',
      vazioTitulo: 'Nenhuma coleta neste filtro',
      vazioTexto: 'Aceite uma demanda disponível para começar.'
    })}

    ${cartao({
      titulo: 'Meus comprovantes',
      sub: `${p.atendimentos} atendimento(s) com prova emitida`,
      corpo: listaComprovantes(p.comprovantes, { visao: 'catador' })
    })}`;
}

/* O painel individual: a renda desta pessoa, a meta desta pessoa, a posição
   desta pessoa. Nada de média da equipe onde cabe o nome próprio. */
function telaCatadorPainel() {
  const p = Painel.catador(Sessao.catador.id);
  const equipe = p.cooperativa ? Painel.cooperativa(p.cooperativa.id) : null;

  return `
    ${cabecalho('Meu painel', `${p.pessoa.nome} · ${p.cooperativa ? 'cooperado da ' + p.cooperativa.nome : 'catador autônomo'} · desde ${Fmt.data(p.pessoa.desde)}`,
      exportar('catador'))}

    ${kpis([
      kpi('Valor gerado', Fmt.reais(p.renda), `${p.atendimentos} atendimento(s) comprovado(s)`, { tom: 'marca', destaque: true }),
      kpi('Massa entregue', Fmt.toneladas(p.massa), 'confirmada na balança do destino'),
      kpi('Na semana', Fmt.kg(p.massaSemana), 'últimos 7 dias', { variacao: p.variacaoSemana }),
      kpi('Minha posição', p.posicao ? `${p.posicao}º` : '—', `entre ${p.totalCatadores} catadores cadastrados`, { tom: 'ok' })
    ])}

    <div class="colunas dois-um">
      ${cartao({ titulo: 'Minha semana', sub: 'Massa comprovada dia a dia', corpo: graficoSerie(p.serie) })}
      ${cartao({
        titulo: 'Minha meta',
        sub: `${Fmt.kg(p.meta)} por semana`,
        corpo: `${anel(p.metaAtingida, { rotulo: 'da meta', tom: 'ouro',
            nota: `${Fmt.kg(p.massaSemana)} de ${Fmt.kg(p.meta)} nesta semana` })}
          <div class="micro-kpis">
            <div><b class="num">${esc(Fmt.reais(p.rendaSemana))}</b><span>valor na semana</span></div>
            <div><b class="num">${esc(Fmt.kg(Math.round(p.massaMedia || 0)))}</b><span>média por coleta</span></div>
          </div>`
      })}
    </div>

    <div class="colunas tres">
      ${cartao({
        titulo: 'Meu desempenho',
        sub: 'Indicadores pessoais',
        corpo: pares([
          ['Precisão da pesagem', esc(Fmt.percentual(p.precisao))],
          ['Valor médio por coleta', esc(Fmt.reais(p.rendaMedia))],
          ['Dias com coleta comprovada', p.diasAtivos],
          ['Material que mais rende', p.melhorMaterial ? esc(p.melhorMaterial.nome) : '—'],
          ['CO₂e evitado por você', esc(Fmt.kg(Math.round(p.co2)))],
          ['Pendências abertas', p.pendencias]
        ]),
        nota: 'Precisão é o quanto o peso que você registrou bateu com a balança de quem recebeu.'
      })}
      ${cartao({
        titulo: 'O que eu coleto',
        sub: 'Meus materiais por valor',
        corpo: graficoRosca(p.materiais, { legenda: 'renda', centro: `<b class="num">${esc(Fmt.reais(p.renda))}</b><span>gerados</span>` })
      })}
      ${cartao({
        titulo: p.cooperativa ? 'Minha posição na equipe' : 'Minha posição no município',
        sub: p.cooperativa ? p.cooperativa.nome : 'entre os catadores com coleta comprovada',
        corpo: blocoPosicao(p, equipe)
      })}
    </div>

    ${p.cooperativa ? cartao({
      titulo: `Equipe ${p.cooperativa.nome}`,
      sub: 'A cooperativa organiza o trabalho; a coleta continua sendo de cada catador',
      corpo: `${kpis([
        kpi('Catadores na equipe', equipe.catadores, 'cooperados ativos'),
        kpi('Massa da equipe', Fmt.toneladas(equipe.massa), `${equipe.atendimentos} atendimento(s)`),
        kpi('Capacidade livre', Fmt.percentual(equipe.disponibilidade, 0), `${equipe.emAndamento} coleta(s) em campo`),
        kpi('Valor da equipe', Fmt.reais(equipe.renda), 'no período demonstrativo', { tom: 'marca' })
      ])}`,
      nota: 'A CATANORTE é estrutura de operação do catador, não um usuário à parte do sistema.'
    }) : cartao({
      titulo: 'Catadora autônoma',
      sub: 'Sem vínculo com cooperativa',
      corpo: aviso('Você trabalha por conta própria',
        'Os mesmos indicadores existem dentro do seu perfil: fila aberta, coletas, valor gerado e comprovantes. Nenhuma função depende de cooperativa.')
    })}

    ${cartao({
      titulo: 'Onde eu coleto',
      sub: 'Bairros com mais massa entregue por você',
      corpo: ranking(p.bairros.map(b => ({ ...b, nota: b.n + ' coleta(s)' })))
    })}`;
}

/* A posição do catador sem expor os colegas.
   Ranking nominal entre pessoas, numa cooperativa pequena, é constrangimento —
   e é dado pessoal de terceiro na tela de quem não responde por ele. O catador
   vê onde está e como se compara com a média; a lista com nomes fica com a
   coordenação, no painel da organização. */
function blocoPosicao(p, equipe) {
  const grupo = p.cooperativa ? equipe.equipe : p.ranking;
  const total = grupo.length || 1;
  const posicao = p.posicao || total;
  const media = grupo.reduce((soma, c) => soma + (c.massa || 0), 0) / total;
  const diferenca = media ? ((p.massa - media) / media) * 100 : null;
  const melhores = Math.max(0, Math.round(((total - posicao) / total) * 100));

  return `${kpis([
      kpi('Sua posição', `${posicao}º`, `entre ${total} catador(es) com coleta comprovada`, { tom: 'marca' }),
      kpi('Sua massa', Fmt.toneladas(p.massa), 'comprovada no período'),
      kpi('Média do grupo', Fmt.toneladas(media), 'massa por catador'),
      kpi('Comparação', Fmt.variacao(diferenca), 'sua massa contra a média', { tom: diferenca >= 0 ? 'ok' : '' })
    ])}
    <div class="barra-capacidade" role="img" aria-label="Você está à frente de ${melhores}% do grupo">
      <i class="${melhores >= 50 ? '' : 'alerta'}" style="width:${melhores}%"></i>
    </div>
    <p class="fonte-dado" style="margin-top:8px">Você está à frente de ${melhores}% do grupo. Os nomes e os números de cada colega ficam com a coordenação da organização, não nesta tela.</p>`;
}
