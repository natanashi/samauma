/* SAMAÚMA — cadastro de novos participantes.
   Três formulários, um por papel, com o mínimo que o sistema precisa saber para
   a pessoa começar a trabalhar no mesmo minuto. Nada de campo que ninguém vai
   ler depois: cada informação pedida aqui aparece em alguma tela ou entra em
   alguma regra. */

const TIPOS_CADASTRO = {
  gerador: {
    nome: 'Gerador',
    papel: 'QUEM GERA O RESÍDUO',
    cor: '#2a6fa8',
    resumo: 'Estabelecimento que precisa destinar resíduo e comprovar a destinação.',
    itens: ['CNPJ e ramo de atividade', 'Ponto de coleta e acesso', 'PGRS, se já houver']
  },
  catador: {
    nome: 'Catador',
    papel: 'QUEM EXECUTA A COLETA',
    cor: '#b8791f',
    resumo: 'Pessoa que coleta, pesa em campo e leva a carga até a unidade de destino.',
    itens: ['Cooperado ou autônomo', 'Veículo e zona de trabalho', 'Meta semanal combinada']
  },
  destino: {
    nome: 'Unidade receptora',
    papel: 'QUEM RECEBE E FECHA O CICLO',
    cor: '#2a8c7a',
    resumo: 'Galpão de triagem, indústria recicladora, unidade de transformação ou aterro.',
    itens: ['Licença e capacidade diária', 'Materiais aceitos', 'Destinação declarada']
  }
};

const RAMOS = ['Supermercado', 'Centro comercial', 'Alimentação', 'Hotelaria', 'Serviço de saúde',
  'Ensino', 'Atacado', 'Indústria gráfica', 'Distribuição', 'Comércio'];

const TIPOS_UNIDADE = ['Central de triagem', 'Indústria recicladora', 'Unidade de transformação', 'Disposição final'];

/* Só os bairros que servem de endereço — as estruturas do ciclo ficam de fora. */
function pontosDeCadastro() {
  const estruturas = ['pt-galpao', 'pt-aterro', 'pt-recicl', 'pt-usina'];
  const vistos = new Set();
  return PONTOS.filter(p => {
    if (estruturas.includes(p.id) || vistos.has(p.bairro)) return false;
    vistos.add(p.bairro);
    return true;
  });
}

function zonasDeCadastro() {
  return [...new Set(PONTOS.map(p => p.zona))];
}

/* Um campo com rótulo, ajuda e o erro logo abaixo, onde a pessoa está olhando. */
function campo(id, rotulo, controle, ajuda, erro) {
  return `<div class="${erro ? 'com-erro' : ''}">
    <label class="rot" for="${id}">${esc(rotulo)}</label>
    ${controle}
    ${erro ? `<div class="erro-campo" role="alert">${esc(erro)}</div>`
           : ajuda ? `<div class="ajuda">${esc(ajuda)}</div>` : ''}
  </div>`;
}

function opcoes(lista, selecionado) {
  return lista.map(v => `<option value="${esc(v)}" ${v === selecionado ? 'selected' : ''}>${esc(v)}</option>`).join('');
}

/* ------------------------------------------------------------ escolha do papel */

function telaCadastroEscolha() {
  const cartoes = Object.entries(TIPOS_CADASTRO).map(([id, t]) => `
    <article class="porta" style="--cor-perfil:${t.cor}">
      <span class="porta-icone" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONES_PERFIL[id === 'destino' ? 'cooperativa' : id]}</svg></span>
      <h2>${esc(t.nome)}</h2>
      <p>${esc(t.resumo)}</p>
      <ul class="porta-itens">${t.itens.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      <div class="porta-acoes">
        <button class="btn" data-acao="cadastro-tipo" data-tipo="${id}">Cadastrar ${esc(t.nome.toLowerCase())} <span class="seta">→</span></button>
      </div>
    </article>`).join('');

  return `
    <div class="cadastro-topo">
      <button class="voltar" data-acao="cadastro-sair">Voltar para a entrada</button>
      <h2>Criar cadastro</h2>
      <p>Quem se cadastra passa a existir para todo o sistema: publica demanda, aceita coleta ou recebe carga já no mesmo acesso.</p>
    </div>
    <div class="cadastro-portas">${cartoes}</div>
    ${aviso('Cadastro demonstrativo, sem senha',
      'Nada aqui sai deste navegador e nenhum dado é verificado em base oficial. Em produção, a identificação viria do login único do Município ou do Gov.br, e este formulário seria a segunda etapa, depois de identificada a pessoa.')}`;
}

/* ------------------------------------------------------------------ formulários */

function telaCadastro(estado) {
  const { tipo, dados = {}, erros = {} } = estado.cadastro || {};
  if (!tipo) return telaCadastroEscolha();

  const t = TIPOS_CADASTRO[tipo];
  const corpo = tipo === 'gerador' ? formularioGerador(dados, erros)
    : tipo === 'catador' ? formularioCatador(dados, erros)
      : formularioDestino(dados, erros);

  const quantos = Object.keys(erros).length;

  return `
    <div class="cadastro-topo" style="--cor-perfil:${t.cor}">
      <button class="voltar" data-acao="cadastro-tipo" data-tipo="">Escolher outro papel</button>
      <span class="cadastro-papel">${esc(t.papel)}</span>
      <h2>Cadastro de ${esc(t.nome.toLowerCase())}</h2>
      <p>${esc(t.resumo)}</p>
    </div>

    ${quantos ? aviso('Confira antes de continuar',
      `${quantos} campo(s) precisam de correção. O que falta está marcado abaixo.`, 'problema') : ''}

    ${cartao({ classe: 'cartao-cadastro', corpo: `<form class="form" id="formCadastro" novalidate>
      ${corpo}
      <div class="largo acoes-form">
        <button class="btn" type="submit">Concluir cadastro e entrar</button>
        <button class="btn sec" type="button" data-acao="cadastro-sair">Cancelar</button>
        <span class="ajuda">Ao concluir, você entra no sistema já como ${esc(t.nome.toLowerCase())}.</span>
      </div>
    </form>` })}`;
}

function formularioGerador(d, e) {
  const cooperativas = COOPERATIVAS.map(c => `<option value="${c.id}" ${d.operador === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
  return `
    ${campo('cadNome', 'Nome do estabelecimento',
      `<input type="text" id="cadNome" value="${esc(d.nome || '')}" placeholder="Mercado Central de Porto Velho">`,
      'Como o estabelecimento é conhecido.', e.nome)}
    ${campo('cadCnpj', 'CNPJ',
      `<input type="text" id="cadCnpj" inputmode="numeric" value="${esc(d.cnpj || '')}" placeholder="00.000.000/0001-00">`,
      'Conferido com os dois dígitos verificadores.', e.cnpj)}
    ${campo('cadRamo', 'Ramo de atividade',
      `<select id="cadRamo"><option value="">Selecione…</option>${opcoes(RAMOS, d.ramo)}</select>`,
      'Define o perfil de resíduo esperado.', e.ramo)}
    ${campo('cadVolume', 'Volume estimado por mês (kg)',
      `<input type="number" id="cadVolume" min="1" step="50" value="${esc(d.volumeMes || '')}" placeholder="4000">`,
      'Serve para comparar o declarado com o efetivamente destinado.', e.volumeMes)}
    ${campo('cadPonto', 'Bairro do ponto de coleta',
      `<select id="cadPonto"><option value="">Selecione…</option>${pontosDeCadastro().map(p =>
        `<option value="${p.id}" ${d.ponto === p.id ? 'selected' : ''}>${esc(p.bairro)} · ${esc(p.zona)}</option>`).join('')}</select>`,
      'Bairros reais de Porto Velho; a coordenada é aproximada.', e.ponto)}
    ${campo('cadAcesso', 'Como o catador acessa a carga',
      `<input type="text" id="cadAcesso" value="${esc(d.acesso || '')}" placeholder="Doca lateral · 7h às 12h">`,
      'Aparece na tela do catador antes de ele sair.', e.acesso)}
    ${campo('cadOperador', 'Operador contratado (opcional)',
      `<select id="cadOperador"><option value="">Sem operador — vai para a fila aberta</option>${cooperativas}</select>`,
      'Sem operador, a demanda fica disponível para qualquer catador.', e.operador)}
    ${campo('cadPgrs', 'Número do PGRS (opcional)',
      `<input type="text" id="cadPgrs" value="${esc(d.pgrsNumero || '')}" placeholder="PGRS 2026/0001">`,
      'Sem PGRS cadastrado, a situação começa como irregular — e o sistema explica o motivo.', e.pgrsNumero)}
    ${campo('cadPgrsValidade', 'Dias até o vencimento do PGRS',
      `<input type="number" id="cadPgrsValidade" step="30" value="${esc(d.pgrsValidade || 365)}">`,
      'Menos de 90 dias já aparece como alerta de regularização.', e.pgrsValidade)}`;
}

function formularioCatador(d, e) {
  const cooperativas = COOPERATIVAS.map(c => `<option value="${c.id}" ${d.cooperativa === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
  return `
    ${campo('cadNome', 'Seu nome',
      `<input type="text" id="cadNome" value="${esc(d.nome || '')}" placeholder="Maria da Silva">`,
      'É o nome que aparece no comprovante da coleta.', e.nome)}
    ${campo('cadCooperativa', 'Vínculo',
      `<select id="cadCooperativa"><option value="">Autônomo — sem vínculo com cooperativa</option>${cooperativas}</select>`,
      'O vínculo muda o que você enxerga da equipe, nunca o que você pode fazer.', e.cooperativa)}
    ${campo('cadVeiculo', 'Veículo ou equipamento',
      `<input type="text" id="cadVeiculo" value="${esc(d.veiculo || '')}" placeholder="Triciclo elétrico">`,
      'Ajuda a cooperativa a dimensionar a rota.', e.veiculo)}
    ${campo('cadZona', 'Zona onde você trabalha',
      `<select id="cadZona"><option value="">Selecione…</option>${opcoes(zonasDeCadastro(), d.zona)}</select>`,
      'Usada para priorizar as demandas mais próximas.', e.zona)}
    ${campo('cadMeta', 'Meta semanal (kg)',
      `<input type="number" id="cadMeta" min="1" step="100" value="${esc(d.metaSemanal || 1200)}">`,
      'Combinada com a organização; aparece no seu painel.', e.metaSemanal)}`;
}

function formularioDestino(d, e) {
  const cooperativas = COOPERATIVAS.map(c => `<option value="${c.id}" ${d.cooperativa === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
  const materiais = RESIDUOS.map(r => `
    <label class="marca-material">
      <input type="checkbox" name="cadAceita" value="${r.id}" ${(d.aceita || []).includes(r.id) ? 'checked' : ''}>
      <span><i class="ponto-cor" style="--cor:${r.cor}"></i>${esc(r.nome)}</span>
    </label>`).join('');

  return `
    ${campo('cadNome', 'Nome da unidade',
      `<input type="text" id="cadNome" value="${esc(d.nome || '')}" placeholder="Galpão de Triagem Vila Nova">`,
      'Aparece no comprovante como quem recebeu a carga.', e.nome)}
    ${campo('cadTipoUnidade', 'Tipo de unidade',
      `<select id="cadTipoUnidade"><option value="">Selecione…</option>${opcoes(TIPOS_UNIDADE, d.tipoUnidade)}</select>`,
      'Disposição final marca a unidade como aterro: tudo que entra é rejeito.', e.tipoUnidade)}
    ${campo('cadCooperativa', 'Cooperativa responsável (opcional)',
      `<select id="cadCooperativa"><option value="">Sem vínculo com cooperativa</option>${cooperativas}</select>`,
      'Só para unidades operadas por organização de catadores.', e.cooperativa)}
    ${campo('cadLicenca', 'Licença de operação',
      `<input type="text" id="cadLicenca" value="${esc(d.licenca || '')}" placeholder="LO 0000/2026">`,
      'Consta no relatório e no comprovante de destinação.', e.licenca)}
    ${campo('cadCapacidade', 'Capacidade diária (kg)',
      `<input type="number" id="cadCapacidade" min="1" step="500" value="${esc(d.capacidadeDiaria || 5000)}">`,
      'É o que limita quanto trabalho o sistema pode prometer à sua unidade.', e.capacidadeDiaria)}
    ${campo('cadPonto', 'Bairro da unidade',
      `<select id="cadPonto"><option value="">Selecione…</option>${pontosDeCadastro().map(p =>
        `<option value="${p.id}" ${d.ponto === p.id ? 'selected' : ''}>${esc(p.bairro)} · ${esc(p.zona)}</option>`).join('')}</select>`,
      '', e.ponto)}
    ${campo('cadDestinoFinal', 'Destinação declarada',
      `<input type="text" id="cadDestinoFinal" value="${esc(d.destinoFinal || '')}" placeholder="Reciclagem, com rejeito encaminhado ao aterro">`,
      'É o que a unidade declara fazer com o material recebido.', e.destinoFinal)}
    <div class="largo ${e.aceita ? 'com-erro' : ''}">
      <span class="rot">Materiais aceitos</span>
      <div class="materiais">${materiais}</div>
      ${e.aceita ? `<div class="erro-campo" role="alert">${esc(e.aceita)}</div>`
                 : '<div class="ajuda">O material define quais demandas serão encaminhadas para esta unidade.</div>'}
    </div>`;
}
