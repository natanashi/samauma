/* SAMAÚMA — área do gerador.
   Quatro telas: onde ele está (painel), o que ele mandou destinar (demandas),
   o que comprova a regularidade (documentos) e o que ele precisa entregar à
   fiscalização (relatórios). */

function telaGeradorPainel() {
  const p = Painel.gerador(Sessao.gerador);

  return `
    ${cabecalho('Painel do gerador', `${p.cadastro.nome} · ${p.cadastro.ramo} · ${Catalogo.endereco(p.cadastro.ponto)}`,
      '<button class="btn" data-acao="nova">Nova demanda</button>')}

    ${blocoSituacao(p)}

    ${kpis([
      kpi('Massa destinada', Fmt.toneladas(p.ambiental.massa), 'confirmada por quem recebeu', { tom: 'marca', destaque: true }),
      kpi('Efetivamente reciclada', Fmt.toneladas(p.ambiental.reciclado), `${Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} do que saiu daqui`, { tom: 'ok' }),
      kpi('Em andamento', p.emAberto + p.emTransporte, `${p.emTransporte} a caminho do destino`),
      kpi('Pendências', p.pendencias, 'em conciliação na Prefeitura', { tom: p.pendencias ? 'erro' : 'ok' })
    ])}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Próxima coleta',
        sub: p.proxima ? 'Demanda em campo agora' : 'Nada agendado',
        acao: '<button class="btn sec sm" data-acao="aba" data-aba="demandas">Ver demandas</button>',
        corpo: p.proxima
          ? `${listaColetas([p.proxima])}
             ${aviso('Operador responsável', p.operador
               ? `${p.operador.nome} — ${p.operador.detalhe}.`
               : 'Sem operador contratado: a demanda vai para a fila aberta de catadores.')}`
          : vazio('Nenhuma coleta em campo', 'Crie uma demanda quando houver material acumulado.')
      })}
      ${cartao({
        titulo: 'Volume declarado',
        sub: 'Declarado no cadastro × destinado com prova',
        corpo: `${anel(p.aderencia ? Math.min(100, p.aderencia.parte) : 0, {
            rotulo: 'do declarado', tom: 'azul',
            nota: p.aderencia
              ? `${Fmt.kg(p.aderencia.destinado)} destinados de ${Fmt.kg(p.aderencia.declarado)} declarados por mês`
              : 'sem volume declarado no cadastro'
          })}
          <div class="micro-kpis">
            <div><b class="num">${esc(Fmt.percentual(p.precisao, 0))}</b><span>precisão da estimativa</span></div>
            <div><b class="num">${esc(Fmt.duracao(p.cicloMedio))}</b><span>ciclo médio</span></div>
          </div>`,
        nota: 'Precisão compara a quantidade que você estima com o peso registrado na balança do destinatário.'
      })}
    </div>

    ${cartao({
      titulo: 'O que aconteceu com o seu resíduo',
      sub: 'Massa recebida, separada entre o que voltou ao ciclo e o que foi aterrado',
      corpo: `${barraRecuperacao(p.ambiental)}
        <div class="micro-kpis">
          <div><b class="num">${esc(Fmt.kg(Math.round(p.ambiental.co2Evitado)))}</b><span>CO₂e evitado</span></div>
          <div><b class="num">${esc(Fmt.kg(p.ambiental.massaAterrada))}</b><span>enviado direto ao aterro</span></div>
          <div><b class="num">${esc(Fmt.reais(p.financeiro.custoAterroEvitado))}</b><span>custo de aterro evitado</span></div>
        </div>`,
      nota: 'Coletar não é reciclar: parte do material é separada como rejeito na triagem e segue para o aterro sanitário.'
    })}

    <div class="colunas dois-um">
      ${cartao({ titulo: 'Destinação dia a dia', sub: 'Últimos 14 dias', corpo: graficoSerie(p.serie) })}
      ${cartao({ titulo: 'Composição', sub: 'Por tipo de resíduo', corpo: graficoRosca(p.materiais) })}
    </div>

    ${cartao({
      titulo: 'Para onde o material foi',
      sub: 'Unidades que receberam, confirmaram e declararam o destino final',
      corpo: ranking(p.destinos.map(d => ({ ...d, nota: `${d.destinoFinal} · ${d.n} carga(s)` })))
    })}`;
}

/* A situação regulatória é o primeiro bloco: é o que o gerador precisa saber
   antes de qualquer número. Vem com os motivos, porque "Irregular" sozinho não
   diz o que fazer. */
function blocoSituacao(p) {
  const s = p.situacao;
  return `<section class="cartao situacao-regulatoria ${s.tom}">
    <div class="cartao-corpo">
      <div class="situacao-topo">
        <div class="situacao-quem">
          <span class="etiqueta">Situação regulatória</span>
          <div class="situacao-pino">${situacaoGerador(s)}</div>
          <ul class="motivos">${s.motivos.map(m => `<li>${esc(m)}</li>`).join('')}</ul>
        </div>
        ${seloDestinacao(p.selo)}
      </div>
    </div>
  </section>`;
}

function telaGeradorDemandas(estado) {
  const p = Painel.gerador(Sessao.gerador);
  const filtro = estado.filtro || 'todas';
  const grupos = {
    todas: () => true,
    andamento: d => EM_CURSO.includes(d.status),
    rascunhos: d => d.status === 'CRIADA',
    pendencias: d => d.status === 'PENDENCIA',
    comprovadas: d => d.status === 'COMPROVADA'
  };

  return `
    ${cabecalho('Minhas demandas', 'Cada linha é um pedido de destinação, do rascunho ao comprovante.',
      `<button class="btn" data-acao="nova">Nova demanda</button>${exportar('gerador')}`)}
    ${filtros(p.demandas, grupos, filtro, [
      ['todas', 'Todas'], ['andamento', 'Em andamento'], ['rascunhos', 'Rascunhos'],
      ['pendencias', 'Pendências'], ['comprovadas', 'Comprovadas']
    ])}
    ${listaDemandas(p.demandas.filter(grupos[filtro] || grupos.todas), {
      visao: 'gerador',
      vazioTitulo: 'Nenhuma demanda neste filtro',
      vazioTexto: 'Crie uma demanda informando resíduo, quantidade, local e prazo.'
    })}`;
}

/* Documentos: o que o gerador mostra à fiscalização. */
function telaGeradorDocumentos() {
  const p = Painel.gerador(Sessao.gerador);
  const plano = p.situacao.pgrs;

  return `
    ${cabecalho('Documentos e comprovação', 'PGRS, selo de destinação e os comprovantes emitidos no seu CNPJ.')}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Plano de Gerenciamento de Resíduos Sólidos',
        sub: plano ? plano.numero : 'não cadastrado',
        classe: plano && plano.vencido ? 'destaque-erro' : '',
        corpo: plano
          ? `${pares([
              ['Número', esc(plano.numero)],
              ['Validade', esc(Fmt.data(plano.validade))],
              ['Situação', plano.vencido
                ? `<span class="erro">vencido há ${Math.abs(plano.dias)} dias</span>`
                : plano.vencendo
                  ? `<span class="alerta">vence em ${plano.dias} dias</span>`
                  : `<span class="ok">válido por ${plano.dias} dias</span>`],
              ['Responsável técnico', 'Registro no protocolo municipal'],
              ['Volume declarado', esc(Fmt.kg(p.cadastro.volumeMes)) + ' / mês']
            ])}
            <div class="acoes-form">
              <button class="btn sec" data-acao="pdf" data-escopo="gerador">Baixar dossiê em PDF</button>
              <span class="ajuda">O dossiê reúne situação, massa destinada e a lista de processos.</span>
            </div>`
          : `${aviso('Sem PGRS cadastrado', 'Enquanto não houver plano no sistema, o gerador permanece irregular.', 'problema')}`
      })}
      ${cartao({
        titulo: 'Selo de destinação',
        sub: 'Emitido quando há prova no período',
        corpo: `${seloDestinacao(p.selo)}
          ${p.selo.valido
            ? aviso('Como conferir', 'O código do selo aponta para a página pública de verificação, que mostra as mesmas cargas listadas aqui.')
            : ''}`
      })}
    </div>

    ${cartao({
      titulo: 'Comprovantes de destinação',
      sub: `${p.comprovadas} documento(s) emitido(s)`,
      acao: exportar('gerador'),
      corpo: listaComprovantes(p.comprovantes, { visao: 'gerador' })
    })}

    ${cartao({
      titulo: 'Operador contratado',
      sub: 'Quem executa a coleta para este gerador',
      corpo: p.operador
        ? pares([
            ['Operador', esc(p.operador.nome)],
            ['Tipo', p.operador.tipo === 'cooperativa' ? 'Cooperativa de catadores' : 'Catador autônomo'],
            ['Instrumento', esc(p.operador.detalhe)],
            ['Ponto de coleta', esc(Catalogo.endereco(p.cadastro.ponto))],
            ['Acesso', esc(p.ponto.acesso)]
          ])
        : aviso('Sem operador contratado', 'As demandas vão para a fila aberta e podem ser aceitas por qualquer catador cadastrado.', 'problema')
    })}`;
}

/* Relatórios: o recorte inteiro do gerador, não uma demanda por vez. */
function telaGeradorRelatorios() {
  const p = Painel.gerador(Sessao.gerador);
  const corte = Date.now() - 30 * 86400000;
  const doMes = p.demandas.filter(d => d.status === 'COMPROVADA' && new Date(d.comprovante.emitidoEm) >= corte);
  const ambientalMes = Painel.ambiental(doMes);
  const materiaisMes = Painel.porResiduo(doMes);

  return `
    ${cabecalho('Relatórios', 'Exportação do seu histórico completo, em planilha ou documento.')}

    ${cartao({
      titulo: 'Relatório mensal',
      sub: `Competência ${Fmt.mes(new Date().toISOString())} · ${doMes.length} carga(s) comprovada(s)`,
      classe: 'acao-viva',
      acao: `<div class="exportar">
        <button class="btn sec sm" data-acao="csv" data-escopo="mensal">CSV</button>
        <button class="btn sm" data-acao="pdf" data-escopo="mensal">PDF</button>
      </div>`,
      corpo: `${kpis([
          kpi('Quantidade coletada', Fmt.kg(ambientalMes.massa), 'pesada na balança do destino'),
          kpi('Quanto foi reciclado', Fmt.kg(ambientalMes.reciclado), Fmt.percentual(ambientalMes.taxaRecuperacao, 0) + ' de recuperação', { tom: 'ok' }),
          kpi('Rejeito ao aterro', Fmt.kg(ambientalMes.rejeito), 'disposição final', { tom: 'alerta' }),
          kpi('Comprovantes', doMes.length, 'no período', { tom: 'marca' })
        ])}
        <div class="colunas dois-um" style="margin-top:var(--e4)">
          ${cartao({ titulo: 'Tipo de resíduo', sub: 'Composição do mês', corpo: graficoRosca(materiaisMes), classe: 'sem-sombra' })}
          ${cartao({
            titulo: 'Destino final',
            sub: 'Declarado por quem recebeu',
            classe: 'sem-sombra',
            corpo: ranking(Painel.porDestino(doMes).map(d => ({ ...d, nota: d.destinoFinal })))
          })}
        </div>`,
      nota: 'O relatório mensal traz quantidade coletada, tipo de resíduo, quanto foi reciclado e o destino final de cada carga.'
    })}

    ${cartao({
      titulo: 'Histórico completo',
      sub: `${p.total} demanda(s) registradas desde o início`,
      acao: exportar('gerador', 'Baixar tudo'),
      corpo: `${pares([
        ['Demandas registradas', Fmt.numero(p.total)],
        ['Destinações comprovadas', Fmt.numero(p.comprovadas)],
        ['Massa destinada', Fmt.kg(p.ambiental.massa)],
        ['Massa recuperada', Fmt.kg(p.ambiental.reciclado)],
        ['Rejeito ao aterro', Fmt.kg(p.ambiental.rejeito)],
        ['Valor movimentado', Fmt.reais(p.financeiro.valor)],
        ['CO₂e evitado', Fmt.kg(Math.round(p.ambiental.co2Evitado))]
      ])}`,
      nota: 'O CSV traz uma linha por demanda, com peso de campo, peso de balança, rejeito, destino final e comprovante.'
    })}`;
}

function telaNovaDemanda() {
  const prazoPadrao = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const cadastro = Sessao.cadastroGerador;

  return `
    <button class="voltar" data-acao="voltar">Voltar para minhas demandas</button>
    ${cabecalho('Nova demanda de destinação', 'Quatro informações bastam para o ciclo começar.')}

    ${cartao({
      corpo: `<form class="form" id="formDemanda">
        <div>
          <label class="rot" for="campoResiduo">Tipo de resíduo</label>
          <select id="campoResiduo">${RESIDUOS.map(r =>
            `<option value="${r.id}">${esc(r.nome)}${r.recuperavel ? '' : ' — vai para o aterro'}</option>`).join('')}</select>
          <div class="ajuda">O material define a unidade que vai receber a carga.</div>
        </div>
        <div>
          <label class="rot" for="campoQuantidade">Quantidade estimada (kg)</label>
          <input type="number" id="campoQuantidade" min="1" step="10" value="800" required>
          <div class="ajuda">Estimativa sua. O peso real é registrado na coleta e na balança do destino.</div>
        </div>
        <div>
          <label class="rot" for="campoPonto">Ponto de coleta</label>
          <select id="campoPonto">${PONTOS.filter(p => !p.id.startsWith('pt-a') && !['pt-galpao', 'pt-recicl', 'pt-usina'].includes(p.id))
            .map(p => `<option value="${p.id}" ${p.id === cadastro.ponto ? 'selected' : ''}>${esc(p.bairro)} · ${esc(p.zona)}</option>`).join('')}</select>
          <div class="ajuda">${esc(Catalogo.ponto(cadastro.ponto).acesso)}</div>
        </div>
        <div>
          <label class="rot" for="campoPrazo">Prazo</label>
          <input type="date" id="campoPrazo" value="${prazoPadrao}" required>
        </div>
        <div class="largo">
          <label class="rot" for="campoObservacao">Observação para o catador (opcional)</label>
          <textarea id="campoObservacao" placeholder="Ponto de retirada, horário de acesso, condição do material..."></textarea>
        </div>
        <div class="largo acoes-form">
          <button class="btn" type="submit">Criar e publicar demanda</button>
          <button class="btn sec" type="button" data-acao="voltar">Cancelar</button>
          <span class="ajuda">${esc(Catalogo.operador(cadastro)
            ? 'A demanda vai direto para o operador contratado: ' + Catalogo.operador(cadastro).nome + '.'
            : 'Sem operador contratado, a demanda entra na fila aberta de catadores.')}</span>
        </div>
      </form>`
    })}`;
}
