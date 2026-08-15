/* SAMAÚMA — detalhe da demanda.
   A mesma tela para os quatro perfis: o ciclo, as medições, os dados e a
   trilha. O que muda é o bloco de ação — cada um só enxerga o que pode fazer. */

function telaDemanda(estado) {
  const demanda = Store.obter(estado.demandaId);
  if (!demanda) return vazio('Demanda não encontrada', 'Ela pode ter sido removida ao reiniciar a demonstração.');

  return `
    <button class="voltar" data-acao="voltar">Voltar</button>

    <div class="cabecalho detalhe" style="--material:${Catalogo.corResiduo(demanda.residuo)}">
      <div>
        <span class="codigo">DEMANDA ${esc(demanda.id.replace('DEM-', '#'))}</span>
        <h2>${esc(Catalogo.nomeResiduo(demanda.residuo))} · ${esc(demanda.gerador.nome)}</h2>
        <p>${esc(Catalogo.endereco(demanda.ponto))} · prazo ${esc(Fmt.prazo(demanda.prazo))} · destino ${esc(demanda.destino.nome)}</p>
      </div>
      <div class="acoes">${situacaoDemanda(demanda)}</div>
    </div>

    ${cartao({ corpo: ciclo(demanda), classe: 'sem-borda' })}

    <div class="colunas dois-um">
      <div class="pilha">
        ${acoesDoPerfil(demanda, estado.perfil)}
        ${blocoMedicoes(demanda)}
        ${blocoDados(demanda)}
      </div>
      <div class="pilha">
        ${blocoTrilha(demanda)}
      </div>
    </div>`;
}

/* O ciclo em seis etapas, ligadas por um fio. */
function ciclo(demanda) {
  const atual = STATUS[demanda.status].etapa;
  const problema = demanda.status === 'PENDENCIA';
  return `<ol class="ciclo">${ETAPAS.map((nome, i) => {
    const n = i + 1;
    const classe = problema && n === atual ? 'problema' : n < atual ? 'feita' : n === atual ? 'atual' : '';
    return `<li class="${classe}"><span class="bolha">${n < atual && !problema ? '✓' : n}</span><b>${nome}</b></li>`;
  }).join('')}</ol>`;
}

/* Cada perfil só enxerga o que pode fazer. Nada de botão decorativo. */
function acoesDoPerfil(demanda, perfil) {
  if (perfil === 'gerador') return acoesGerador(demanda);
  if (perfil === 'catador') return acoesCatador(demanda);
  if (perfil === 'destinatario') return acoesDestinatario(demanda);
  return acoesPrefeitura(demanda);
}

function esperando(demanda) {
  const proxima = Demanda.proximaAcao(demanda);
  if (!proxima.perfil) return '';
  const dono = {
    gerador: 'o gerador', catador: 'o catador',
    destinatario: 'quem recebe a carga', prefeitura: 'a Prefeitura', sistema: 'o sistema'
  }[proxima.perfil];
  return cartao({ corpo: aviso(`Aguardando ${dono}`, proxima.texto + '.') });
}

function acoesGerador(demanda) {
  if (demanda.status === 'CRIADA') {
    const operador = Catalogo.operador(Catalogo.gerador(demanda.gerador.id));
    return cartao({
      titulo: 'Publicar demanda',
      sub: 'Ainda é um rascunho: nenhum catador enxerga.',
      classe: 'acao-viva',
      corpo: `<p class="texto">${operador
          ? `A demanda vai para o operador contratado, <b>${esc(operador.nome)}</b>.`
          : 'Sem operador contratado, a demanda entra na fila aberta de catadores e cooperativas.'}
          O material segue para <b>${esc(demanda.destino.nome)}</b>, que confirma o recebimento no fim do ciclo.</p>
        <button class="btn" data-acao="publicar" data-id="${demanda.id}">Publicar demanda</button>`
    });
  }
  if (demanda.status === 'COMPROVADA') return blocoComprovado(demanda);
  return esperando(demanda);
}

function acoesCatador(demanda) {
  if (demanda.status === 'DISPONIVEL') {
    const ponto = Catalogo.ponto(demanda.ponto);
    const valor = Demanda.valor({ ...demanda, verificadoKg: demanda.estimadoKg, rejeitoKg: 0 });
    return cartao({
      titulo: 'Aceitar esta demanda',
      sub: `${demanda.km.toLocaleString('pt-BR')} km · prazo ${Fmt.prazo(demanda.prazo)}`,
      classe: 'acao-viva',
      corpo: `<div class="campos">
          <div class="campo"><div class="rot">Endereço</div><div class="val">${esc(ponto.bairro)}<small>${esc(ponto.acesso)}</small></div></div>
          <div class="campo"><div class="rot">Volume estimado</div><div class="val num">${Fmt.kg(demanda.estimadoKg)}<small>estimativa do gerador</small></div></div>
          <div class="campo"><div class="rot">Valor estimado</div><div class="val num">${Fmt.reais(valor)}<small>demonstrativo, pelo peso estimado</small></div></div>
          <div class="campo"><div class="rot">Entrega em</div><div class="val">${esc(demanda.destino.nome)}<small>ponto final do ciclo</small></div></div>
        </div>
        <div class="acoes-form"><button class="btn" data-acao="aceitar" data-id="${demanda.id}">Aceitar demanda</button></div>`
    });
  }

  const minha = demanda.catador && demanda.catador.id === Sessao.catador.id;
  if (!minha) return esperando(demanda);
  if (['ACEITA', 'EM_COLETA'].includes(demanda.status)) return blocoExecucao(demanda);
  if (demanda.status === 'COMPROVADA') return blocoComprovado(demanda);
  return esperando(demanda);
}

/* Execução da coleta: os quatro toques que o catador dá em campo. */
function blocoExecucao(demanda) {
  const iniciada = demanda.status === 'EM_COLETA';
  const pesada = demanda.coletadoKg != null;
  const fotografada = !!demanda.foto;
  const ponto = Catalogo.ponto(demanda.ponto);

  const passo = (n, titulo, texto, estadoPasso, controle) => `
    <li class="passo ${estadoPasso}">
      <span class="n">${estadoPasso === 'feito' ? '✓' : n}</span>
      <span class="texto"><b>${titulo}</b><span>${texto}</span></span>
      <span class="controle">${controle || ''}</span>
    </li>`;

  return cartao({
    titulo: 'Registrar a coleta',
    sub: `${demanda.gerador.nome} · ${ponto.bairro} · ${ponto.acesso}`,
    classe: 'acao-viva',
    corpo: `<ol class="execucao">
      ${passo(1, 'Iniciar coleta', iniciada ? 'Coleta em andamento.' : 'Confirme quando estiver a caminho do estabelecimento.',
        iniciada ? 'feito' : 'ativo',
        iniciada ? '' : `<button class="btn" data-acao="iniciar" data-id="${demanda.id}">Iniciar</button>`)}

      ${passo(2, 'Registrar peso', pesada
        ? `${Fmt.kg(demanda.coletadoKg)} registrados. Estimativa do gerador: ${Fmt.kg(demanda.estimadoKg)}.`
        : `Informe a massa observada. O gerador estimou ${Fmt.kg(demanda.estimadoKg)}.`,
        !iniciada ? '' : pesada ? 'feito' : 'ativo',
        iniciada ? `<input type="number" id="campoPeso" min="1" value="${demanda.coletadoKg ?? demanda.estimadoKg}">
          <button class="btn sec" data-acao="peso" data-id="${demanda.id}">${pesada ? 'Corrigir' : 'Salvar'}</button>` : '')}

      ${passo(3, 'Adicionar foto', fotografada ? 'Evidência anexada à demanda.' : 'Registro fotográfico da carga (opcional, fortalece a prova).',
        !iniciada ? '' : fotografada ? 'feito' : 'ativo',
        iniciada ? `${fotografada
            ? (demanda.foto.startsWith('data:')
              ? `<img class="foto" src="${demanda.foto}" alt="Registro fotográfico da carga">`
              : '<span class="foto-vazia">foto demonstrativa</span>')
            : '<span class="foto-vazia">sem foto</span>'}
          <input type="file" id="campoFoto" accept="image/*" capture="environment" hidden data-id="${demanda.id}">
          <button class="btn sec" data-acao="foto" data-id="${demanda.id}">${fotografada ? 'Trocar' : 'Anexar'}</button>` : '')}

      ${passo(4, 'Fechar a carga', `Ao finalizar, a carga segue para ${esc(demanda.destino.nome)}, que pesa e confirma.`,
        pesada && iniciada ? 'ativo' : '',
        `<button class="btn" data-acao="finalizar" data-id="${demanda.id}" ${pesada && iniciada ? '' : 'disabled'}>Enviar ao destino</button>`)}
    </ol>`,
    nota: 'O peso informado em campo nunca é sobrescrito. Se a balança do destino registrar outro valor, os dois ficam na trilha.'
  });
}

/* A tela mais importante do destinatário: pesar, separar rejeito e confirmar. */
function acoesDestinatario(demanda) {
  const minha = demanda.destino && demanda.destino.id === Sessao.destino.id;

  if (demanda.status === 'COLETADA' && minha) {
    const unidade = Catalogo.destino(demanda.destino.id);
    const leitura = leituraSugerida(demanda);
    const residuo = Catalogo.residuo(demanda.residuo);
    const rejeitoSugerido = unidade.aterro ? leitura : Math.round(leitura * residuo.perdaTriagem);

    return cartao({
      titulo: 'Confirmar recebimento',
      sub: `${demanda.catador ? demanda.catador.nome : 'Catador'} declarou ${Fmt.kg(demanda.coletadoKg)} em campo`,
      classe: 'acao-viva',
      corpo: `${aviso('Você é o ponto final deste ciclo',
          'O comprovante só existe depois que esta unidade confirmar o que entrou na balança e o que foi feito do material.')}
        <div class="form">
          <div>
            <label class="rot" for="campoRecebido">Massa na balança (kg)</label>
            <input type="number" id="campoRecebido" min="1" value="${leitura}">
            <div class="ajuda">Declarado pelo catador: ${esc(Fmt.kg(demanda.coletadoKg))}. Diferença acima de ${esc(Fmt.percentual(TOLERANCIA * 100, 0))} abre pendência.</div>
          </div>
          <div>
            <label class="rot" for="campoRejeito">Rejeito para o aterro (kg)</label>
            <input type="number" id="campoRejeito" min="0" value="${rejeitoSugerido}" ${unidade.aterro ? 'readonly' : ''}>
            <div class="ajuda">${unidade.aterro
              ? 'Esta unidade é disposição final: toda a carga é contabilizada como aterrada.'
              : `O que a triagem não aproveita segue para o aterro. Perda típica deste material: ${esc(Fmt.percentual(residuo.perdaTriagem * 100, 0))}.`}</div>
          </div>
          <div>
            <label class="rot" for="campoDestinoFinal">Destino dado ao material</label>
            <input type="text" id="campoDestinoFinal" value="${esc(unidade.destinoFinal)}">
          </div>
          <div>
            <label class="rot" for="campoLote">Lote interno (opcional)</label>
            <input type="text" id="campoLote" placeholder="gerado automaticamente">
          </div>
          <div class="largo">
            <label class="rot" for="campoNotaDestino">Observação da portaria (opcional)</label>
            <input type="text" id="campoNotaDestino" placeholder="Carga íntegra, material segregado, tíquete 4471...">
          </div>
        </div>
        <div class="acoes-form">
          <button class="btn" data-acao="receber" data-id="${demanda.id}">Confirmar recebimento</button>
          <span class="ajuda">O peso do catador nunca é apagado: os dois registros ficam na trilha.</span>
        </div>`
    });
  }

  if (demanda.status === 'COMPROVADA') return blocoComprovado(demanda);
  if (!minha) {
    return cartao({
      corpo: aviso('Outra unidade recebe esta carga',
        `Destino desta demanda: ${demanda.destino ? demanda.destino.nome : '—'}.`)
    });
  }
  return esperando(demanda);
}

/* Leitura plausível da balança, estável por demanda: a demonstração não muda de
   valor a cada redesenho, e algumas cargas caem fora da tolerância de propósito. */
function leituraSugerida(demanda) {
  const semente = [...demanda.id].reduce((soma, letra) => soma + letra.charCodeAt(0), 0);
  const desvio = ((semente % 17) - 6) / 100;
  return Math.max(1, Math.round(demanda.coletadoKg * (1 + desvio)));
}

function acoesPrefeitura(demanda) {
  if (demanda.status === 'PENDENCIA') {
    return cartao({
      titulo: 'Conciliar divergência',
      sub: `Diferença de ${Fmt.percentual(Demanda.divergencia(demanda))} entre campo e balança do destino`,
      classe: 'acao-viva',
      corpo: `${aviso('Os dois registros continuam válidos',
          `O catador informou ${Fmt.kg(demanda.coletadoKg)} e ${demanda.destino.nome} pesou ${Fmt.kg(demanda.verificadoKg)}. Conciliar é decidir qual massa vale para o comprovante — nada é apagado.`, 'problema')}
        <div class="form">
          <div>
            <label class="rot" for="campoConciliado">Massa aceita (kg)</label>
            <input type="number" id="campoConciliado" min="1" value="${demanda.verificadoKg}">
          </div>
          <div>
            <label class="rot" for="campoNota">Justificativa</label>
            <input type="text" id="campoNota" value="Tíquete de balança conferido pela fiscalização.">
          </div>
        </div>
        <div class="acoes-form">
          <button class="btn" data-acao="conciliar" data-id="${demanda.id}">Conciliar e emitir comprovante</button>
          <span class="ajuda">A decisão entra na trilha com autoria e horário.</span>
        </div>`
    });
  }
  if (demanda.status === 'COMPROVADA') return blocoComprovado(demanda);
  return esperando(demanda);
}

function blocoComprovado(demanda) {
  return cartao({
    titulo: 'Ciclo comprovado',
    sub: `${demanda.comprovante.codigo} · ${Fmt.dataHora(demanda.comprovante.emitidoEm)}`,
    classe: 'acao-viva bom',
    corpo: `${aviso('Existe prova verificável desta destinação',
        `${Fmt.kg(demanda.verificadoKg)} confirmados por ${demanda.destino.nome}, com ${Fmt.kg(Demanda.reciclado(demanda))} recuperados e ${Fmt.kg(Demanda.rejeito(demanda))} de rejeito. Divergência final de ${Fmt.percentual(demanda.comprovante.divergencia)}${demanda.conciliada ? ', após conciliação da Prefeitura' : ''}.`, 'bom')}
      <div class="acoes-form">
        <button class="btn" data-acao="comprovante" data-id="${demanda.id}">Ver comprovante</button>
        <span class="ajuda">O mesmo documento para gerador, catador, destinatário e Prefeitura.</span>
      </div>`
  });
}

/* As medições da mesma carga, lado a lado, e o que sobrou de cada uma. */
function blocoMedicoes(demanda) {
  if (demanda.coletadoKg == null) return '';
  const divergencia = Demanda.divergencia(demanda);
  const dentro = Demanda.dentroDaTolerancia(demanda);
  const recebida = demanda.verificadoKg != null;

  return cartao({
    titulo: 'Registros da mesma carga',
    sub: 'O sistema não cria uma nova verdade: conecta as provas que existem.',
    corpo: `<div class="medicoes">
        <div class="medicao"><span class="quem">Gerador</span><b class="num">${Fmt.kg(demanda.estimadoKg)}</b><span class="origem">estimado</span></div>
        <div class="medicao"><span class="quem">Catador</span><b class="num">${Fmt.kg(demanda.coletadoKg)}</b><span class="origem">coletado em campo</span></div>
        <div class="medicao final"><span class="quem">Destinatário</span><b class="num">${Fmt.kg(demanda.verificadoKg)}</b>
          <span class="origem">${!recebida ? 'aguardando balança' : demanda.conciliada ? 'conciliado' : 'pesado na balança'}</span></div>
      </div>
      ${recebida ? `
        <div class="divergencia ${dentro ? '' : 'acima'}">
          <b>Divergência de ${esc(Fmt.percentual(divergencia))}</b>
          <span>${dentro
            ? `Dentro da tolerância de ${esc(Fmt.percentual(TOLERANCIA * 100, 0))}. Comprovante emitido automaticamente.`
            : `Acima da tolerância de ${esc(Fmt.percentual(TOLERANCIA * 100, 0))}. A Prefeitura precisa conciliar antes do comprovante.`}</span>
        </div>
        <div class="destino-material">
          <span class="etiqueta">Destino dado ao material</span>
          ${barraRecuperacao({
            reciclado: Demanda.reciclado(demanda),
            rejeito: Demanda.rejeito(demanda),
            taxaRecuperacao: Demanda.taxaRecuperacao(demanda)
          })}
          <p>${esc(Demanda.destinoFinal(demanda))}</p>
        </div>` : ''}`
  });
}

function blocoDados(demanda) {
  const ponto = Catalogo.ponto(demanda.ponto);
  const coop = demanda.catador ? Catalogo.cooperativa(demanda.catador.cooperativa) : null;

  return cartao({
    titulo: 'Dados da demanda',
    corpo: `<div class="campos">
      <div class="campo"><div class="rot">Gerador</div><div class="val">${esc(demanda.gerador.nome)}
        <small>${esc(Catalogo.gerador(demanda.gerador.id) ? Catalogo.gerador(demanda.gerador.id).cnpj : '')}</small></div></div>
      <div class="campo"><div class="rot">Resíduo</div><div class="val">${esc(Catalogo.nomeResiduo(demanda.residuo))}</div></div>
      <div class="campo"><div class="rot">Quantidade estimada</div><div class="val num">${Fmt.kg(demanda.estimadoKg)}</div></div>
      <div class="campo"><div class="rot">Ponto de coleta</div><div class="val">${esc(ponto.bairro)}
        <small>${esc(ponto.zona)} · ${esc(ponto.acesso)}</small></div></div>
      <div class="campo"><div class="rot">Prazo</div><div class="val">${esc(Fmt.data(demanda.prazo))}<small>${esc(Fmt.prazo(demanda.prazo))}</small></div></div>
      <div class="campo"><div class="rot">Catador responsável</div><div class="val">${demanda.catador ? esc(demanda.catador.nome) : '—'}
        <small>${demanda.catador ? (coop ? 'cooperado da ' + esc(coop.nome) : 'catador autônomo') : 'ainda sem atribuição'}</small></div></div>
      <div class="campo"><div class="rot">Destinatário</div><div class="val">${esc(demanda.destino.nome)}
        <small>${demanda.recebidaEm ? 'recebido em ' + esc(Fmt.dataHora(demanda.recebidaEm)) : 'ponto final do ciclo'}</small></div></div>
      <div class="campo"><div class="rot">Lote no destino</div><div class="val mono">${demanda.lote ? esc(demanda.lote) : '—'}
        <small>${demanda.lote ? 'registro interno da unidade' : 'gerado no recebimento'}</small></div></div>
    </div>
    ${demanda.observacao ? aviso('Observação do gerador', demanda.observacao) : ''}`
  });
}

function blocoTrilha(demanda) {
  return cartao({
    titulo: 'Trilha do ciclo',
    sub: `${demanda.eventos.length} registro(s), com autoria e horário`,
    classe: 'grudenta',
    corpo: `<ol class="trilha">
      ${demanda.eventos.slice().reverse().map(e => `
        <li data-autor="${esc(e.autor)}">
          <span class="quando">${esc(Fmt.dataHora(e.quando))} · <span class="autor">${esc(e.autor)}</span></span>
          <b>${esc(e.titulo)}</b>
          <p>${esc(e.detalhe)}</p>
        </li>`).join('')}
    </ol>`
  });
}
