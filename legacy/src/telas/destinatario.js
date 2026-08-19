/* SAMAÚMA — área do destinatário.
   O ponto final do ciclo: recebe a carga, pesa, separa o que é rejeito e
   declara o destino do material. Sem esta confirmação não existe comprovante.

   O aterro sanitário também entra por aqui: parte relevante do que sai do
   gerador termina em disposição final, e o sistema registra isso como registro,
   não como exceção. */

function faixaDestino(p) {
  return faixaPerfil({
    nome: p.unidade.nome,
    papel: `${p.unidade.tipo} · licença ${p.unidade.licenca} · ${Catalogo.endereco(p.unidade.ponto)}`,
    medidas: [
      [p.aCaminho.length, 'a caminho'],
      [Fmt.kg(p.esperado), 'esperados'],
      [Fmt.kg(p.recebidoHoje), 'recebidos hoje'],
      [Fmt.toneladas(p.massa), 'total confirmado']
    ]
  });
}

function telaDestinoPainel() {
  const p = Painel.destino(Sessao.destino.id);
  const aterro = p.unidade.aterro;

  return `
    ${cabecalho('Painel do destinatário', `${p.unidade.nome} · ${p.unidade.tipo}`,
      `<button class="btn" data-acao="aba" data-aba="fila">Receber ${p.aCaminho.length} carga(s)</button>`)}

    ${kpis([
      kpi('Recebimentos de hoje', p.recebidasHoje.length, `${Fmt.kg(p.recebidoHoje)} pesados na balança`, { tom: 'marca', destaque: true }),
      kpi('Coletas aguardadas', p.aCaminho.length, `${Fmt.kg(p.esperado)} declarados pelos catadores`, { tom: p.aCaminho.length ? 'alerta' : 'ok' }),
      kpi('Total confirmado', Fmt.toneladas(p.massa), `${p.atendimentos} carga(s) com comprovante`),
      kpi('Divergência média', Fmt.percentual(p.divergenciaMedia), 'campo × balança desta unidade')
    ])}

    <div class="colunas dois-um">
      ${cartao({ titulo: 'Entrada de material', sub: 'Massa confirmada nesta unidade, dia a dia', corpo: graficoSerie(p.serie, { separarRejeito: !aterro }) })}
      ${cartao({
        titulo: 'Ocupação de hoje',
        sub: 'Balança contra capacidade instalada',
        corpo: `${anel(p.ocupacao, { rotulo: 'da capacidade', tom: 'teal',
            nota: `${Fmt.kg(p.recebidoHoje)} de ${Fmt.kg(p.unidade.capacidadeDiaria)} hoje` })}
          <div class="micro-kpis">
            <div><b class="num">${esc(Fmt.kg(Math.round(p.ambiental.co2Evitado)))}</b><span>CO₂e evitado</span></div>
            <div><b class="num">${esc(Fmt.reais(p.financeiro.valor))}</b><span>valor do material</span></div>
          </div>`
      })}
    </div>

    ${cartao({
      titulo: 'Destino dado ao material',
      sub: p.unidade.destinoFinal,
      corpo: aterro
        ? `${aviso('Esta unidade é disposição final',
            'Tudo que entra aqui é contabilizado como massa aterrada. É o fim do ciclo para o material — e o número que a Prefeitura precisa acompanhar.')}
           ${kpis([
             kpi('Massa aterrada', Fmt.toneladas(p.ambiental.rejeito), 'em célula licenciada', { tom: 'alerta' }),
             kpi('Cargas recebidas', p.atendimentos, 'com comprovante emitido'),
             kpi('Origem principal', p.origens.length ? p.origens[0].nome : '—', p.origens.length ? Fmt.percentual(p.origens[0].parte, 0) + ' do total' : '')
           ])}`
        : `${barraRecuperacao(p.ambiental)}
           <div class="micro-kpis">
             <div><b class="num">${esc(Fmt.percentual(p.ambiental.taxaRecuperacao, 0))}</b><span>taxa de recuperação</span></div>
             <div><b class="num">${esc(Fmt.kg(p.ambiental.rejeito))}</b><span>rejeito ao aterro</span></div>
             <div><b class="num">${esc(Fmt.kg(p.ambiental.reciclado))}</b><span>voltou ao ciclo</span></div>
           </div>`,
      nota: 'O rejeito declarado aqui é o que a triagem não conseguiu aproveitar e segue para o aterro sanitário.'
    })}

    <div class="colunas dois-um">
      ${cartao({ titulo: 'O que entra nesta unidade', sub: 'Composição por material', corpo: graficoRosca(p.materiais) })}
      ${cartao({
        titulo: 'De quem vem',
        sub: 'Origem do material recebido',
        corpo: ranking(p.origens.map(o => ({ ...o, nota: o.n + ' carga(s)' })))
      })}
    </div>

    ${cartao({
      titulo: 'Fila de recebimento',
      sub: p.aCaminho.length ? 'Cargas que já saíram e ainda não passaram pela balança' : 'Nenhuma carga a caminho',
      acao: '<button class="btn sec" data-acao="aba" data-aba="fila">Abrir fila</button>',
      corpo: p.aCaminho.length
        ? listaDemandas(p.aCaminho.slice(0, 5), { visao: 'destinatario' })
        : vazio('Nada a caminho', 'Quando um catador fechar uma carga para esta unidade, ela aparece aqui.')
    })}`;
}

function telaDestinoFila() {
  const p = Painel.destino(Sessao.destino.id);

  return `
    ${cabecalho('Cargas a caminho', 'Confirme o peso da balança. É essa confirmação que fecha o ciclo e emite o comprovante.')}
    ${faixaDestino(p)}
    ${blocoCapacidade(p)}
    ${p.aCaminho.length
      ? aviso('O que fazer com cada carga',
          'Abra a carga, informe a massa da balança e quanto do material é rejeito. O sistema compara com o peso do catador e emite o comprovante — ou abre pendência para a Prefeitura.')
      : ''}
    ${listaDemandas(p.aCaminho, {
      visao: 'destinatario',
      vazioTitulo: 'Nenhuma carga a caminho',
      vazioTexto: 'Quando um catador finalizar uma coleta para esta unidade, ela entra nesta fila.'
    })}`;
}

/* Histórico de recebimento: tipo, peso, origem, data/hora e destino do material
   — exatamente o que a unidade precisa provar depois. */
function telaDestinoRecebidas(estado) {
  const p = Painel.destino(Sessao.destino.id);
  const filtro = estado.filtro || 'todas';
  const grupos = {
    todas: () => true,
    hoje: d => mesmoDia(d.recebidaEm),
    pendentes: d => d.status === 'PENDENCIA',
    comprovadas: d => d.status === 'COMPROVADA'
  };
  const lista = p.recebidasTodas.filter(grupos[filtro] || grupos.todas);

  return `
    ${cabecalho('Cargas recebidas', 'Tudo que passou pela balança desta unidade, com lote, origem e destino do material.',
      exportar('destinatario'))}
    ${filtros(p.recebidasTodas, grupos, filtro, [
      ['todas', 'Todas'], ['hoje', 'Hoje'], ['comprovadas', 'Comprovadas'], ['pendentes', 'Pendentes']
    ])}

    ${lista.length ? cartao({
      titulo: 'Registro de recebimento',
      sub: `${lista.length} carga(s)`,
      corpo: `<div class="tabela-rolagem"><table class="tabela">
        <thead><tr>
          <th>Lote</th><th>Data/hora</th><th>Tipo de resíduo</th><th>Origem</th>
          <th class="dir">Peso</th><th class="dir">Recuperado</th><th class="dir">Rejeito</th>
          <th>Destino do material</th><th>Comprovante</th>
        </tr></thead>
        <tbody>${lista.map(d => `<tr data-acao="abrir" data-id="${d.id}" tabindex="0">
          <td class="mono">${esc(d.lote || '—')}</td>
          <td>${esc(Fmt.dataHora(d.recebidaEm))}</td>
          <td><span class="ponto-material" style="background:${Catalogo.corResiduo(d.residuo)}"></span>${esc(Catalogo.nomeResiduo(d.residuo))}</td>
          <td>${esc(d.gerador.nome)}<small>${esc(d.catador ? d.catador.nome : '—')}</small></td>
          <td class="dir num">${esc(Fmt.kg(d.verificadoKg))}</td>
          <td class="dir num">${esc(Fmt.kg(Demanda.reciclado(d)))}</td>
          <td class="dir num">${esc(Fmt.kg(Demanda.rejeito(d)))}</td>
          <td>${esc(Demanda.destinoFinal(d))}</td>
          <td class="mono">${d.comprovante ? esc(d.comprovante.codigo) : '<span class="alerta">pendência</span>'}</td>
        </tr>`).join('')}</tbody>
      </table></div>`,
      nota: 'Cada linha guarda o peso do catador e o peso da balança. Nenhum dos dois é apagado.'
    }) : vazio('Nenhuma carga neste filtro', 'Confirme uma carga da fila para começar o histórico.')}`;
}

function telaDestinoRelatorios() {
  const p = Painel.destino(Sessao.destino.id);

  return `
    ${cabecalho('Relatórios', 'Exportação de tudo que esta unidade recebeu e destinou.')}

    ${cartao({
      titulo: 'Relatório de recebimentos',
      sub: `${p.atendimentos} carga(s) confirmada(s) · ${Fmt.kg(p.massa)}`,
      classe: 'acao-viva',
      acao: exportar('destinatario', 'Baixar'),
      corpo: `${kpis([
          kpi('Massa recebida', Fmt.toneladas(p.massa), 'pesada nesta balança', { tom: 'marca' }),
          kpi('Recuperado', Fmt.toneladas(p.ambiental.reciclado), Fmt.percentual(p.ambiental.taxaRecuperacao, 0) + ' do recebido', { tom: 'ok' }),
          kpi('Rejeito', Fmt.toneladas(p.ambiental.rejeito), 'encaminhado ao aterro', { tom: 'alerta' }),
          kpi('Comprovantes', p.atendimentos, 'emitidos com esta unidade')
        ])}`,
      nota: 'O CSV traz lote, data/hora, origem, peso de campo, peso de balança, rejeito e destino declarado.'
    })}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Geradores atendidos',
        sub: 'De quais estabelecimentos veio o material',
        corpo: ranking(p.geradores.map(g => ({ ...g, nota: g.n + ' carga(s)' })))
      })}
      ${cartao({
        titulo: 'Comprovantes emitidos',
        sub: `${p.comprovantes.length} mais recentes`,
        corpo: listaComprovantes(p.comprovantes, { visao: 'destinatario' })
      })}
    </div>`;
}

/* Capacidade instalada contra o que está vindo. O gargalo da economia circular
   não é software: é galpão, prensa e gente. Melhor descobrir antes da carga
   chegar do que com o material parado no pátio. */
function blocoCapacidade(p) {
  const unidade = Catalogo.destino(Sessao.destino.id);
  const capacidade = unidade.capacidadeDiaria || 0;
  const aCaminho = somar(p.aCaminho, d => d.coletadoKg || d.estimadoKg || 0);
  if (!capacidade) return '';

  const ocupacao = (aCaminho / capacidade) * 100;
  const tom = ocupacao >= 100 ? 'erro' : ocupacao >= 75 ? 'alerta' : 'ok';

  return cartao({
    titulo: 'Capacidade do dia',
    sub: `${unidade.tipo} · licença ${unidade.licenca}`,
    classe: tom === 'erro' ? 'acao-viva' : '',
    corpo: `${kpis([
        kpi('Capacidade diária', Fmt.kg(capacidade), 'declarada no cadastro da unidade'),
        kpi('A caminho agora', Fmt.kg(aCaminho), `${p.aCaminho.length} carga(s) na fila`, { tom }),
        kpi('Ocupação prevista', Fmt.percentual(ocupacao, 0), 'do que a unidade tria por dia', { tom })
      ])}
      <div class="barra-capacidade" role="img" aria-label="Ocupação prevista de ${Fmt.percentual(ocupacao, 0)}">
        <i class="${tom}" style="width:${Math.min(100, ocupacao).toFixed(1)}%"></i>
      </div>`,
    nota: ocupacao >= 100
      ? 'A fila já supera o que a unidade consegue triar em um dia. Aceitar mais carga agora significa material parado, contaminação e mais rejeito.'
      : 'A capacidade é declarada pela própria unidade e deve ser medida no piloto: é ela que limita quanto trabalho o sistema pode prometer.'
  });
}
