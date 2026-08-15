/* SAMAÚMA — listas.
   O cartão da demanda é o mesmo objeto para os quatro usuários: muda o que se
   destaca. O gerador já sabe quem é; o catador quer saber onde fica e quanto
   anda; quem recebe quer saber de quem veio; a Prefeitura quer saber de tudo. */

function cartaoDemanda(demanda, { visao = 'prefeitura' } = {}) {
  const massa = Demanda.massaCorrente(demanda);
  const residuo = esc(Catalogo.nomeResiduo(demanda.residuo));
  const cor = Catalogo.corResiduo(demanda.residuo);
  const catador = demanda.catador ? esc(demanda.catador.nome) : 'aguardando catador';

  const titulo = visao === 'catador' ? residuo : esc(demanda.gerador.nome);
  const detalhe = visao === 'catador'
    ? `<b>${esc(demanda.gerador.nome)}</b><span>${esc(Catalogo.endereco(demanda.ponto))}</span><span>${demanda.km.toLocaleString('pt-BR')} km</span>`
    : visao === 'destinatario'
      ? `<b>${residuo}</b><span>${catador}</span><span>${esc(demanda.bairro)}</span>`
      : `<b>${residuo}</b><span>${catador}</span><span>${esc(demanda.bairro)}</span>`;

  return `<button class="demanda" style="--material:${cor}" data-acao="abrir" data-id="${demanda.id}">
    <span class="fita" aria-hidden="true"></span>
    <span class="corpo">
      <span class="codigo">${esc(demanda.id.replace('DEM-', '#'))}</span>
      <span class="nome">${titulo}</span>
      <span class="detalhe">${detalhe}</span>
    </span>
    <span class="lado">
      ${situacaoDemanda(demanda)}
      <span class="massa num">${Fmt.kg(massa.kg)}</span>
      <span class="prazo ${massa.atrasada ? 'atrasada' : ''}">${esc(massa.rotulo)} · ${esc(massa.nota)}</span>
    </span>
  </button>`;
}

function listaDemandas(demandas, opcoes = {}) {
  if (!demandas.length) return vazio(opcoes.vazioTitulo || 'Nada por aqui', opcoes.vazioTexto || '');
  return `<div class="lista">${demandas.map(d => cartaoDemanda(d, opcoes)).join('')}</div>`;
}

/* A coleta de hoje, na forma que o catador precisa em campo: endereço,
   tipo, volume, situação e o que fazer agora. */
function cartaoColeta(demanda) {
  const ponto = Catalogo.ponto(demanda.ponto);
  const proxima = Demanda.proximaAcao(demanda);
  return `<button class="coleta ${Demanda.atrasada(demanda) ? 'atrasada' : ''}"
    style="--material:${Catalogo.corResiduo(demanda.residuo)}" data-acao="abrir" data-id="${demanda.id}">
    <span class="hora">
      <b>${esc(Fmt.turno(demanda.prazo))}</b>
      <span>${esc(Fmt.prazo(demanda.prazo))}</span>
    </span>
    <span class="corpo">
      <span class="nome">${esc(demanda.gerador.nome)}</span>
      <span class="endereco">${esc(ponto ? ponto.bairro + ' · ' + ponto.zona : '—')}</span>
      <span class="acesso">${esc(ponto ? ponto.acesso : '')}</span>
    </span>
    <span class="lado">
      ${situacaoDemanda(demanda)}
      <span class="massa num">${esc(Fmt.kg(demanda.coletadoKg ?? demanda.estimadoKg))}</span>
      <span class="tipo">${esc(Catalogo.nomeResiduo(demanda.residuo))}</span>
      <span class="proxima">${esc(proxima.texto)}</span>
    </span>
  </button>`;
}

function listaColetas(demandas, opcoes = {}) {
  if (!demandas.length) return vazio(opcoes.vazioTitulo || 'Nenhuma coleta', opcoes.vazioTexto || '');
  return `<div class="lista">${demandas.map(cartaoColeta).join('')}</div>`;
}

/* Comprovantes: o documento, não o processo. Linha enxuta com acesso direto. */
function listaComprovantes(demandas, { visao = 'gerador' } = {}) {
  if (!demandas.length) return vazio('Nenhum comprovante emitido', 'O comprovante nasce quando o destinatário confirma a carga.');
  return `<ul class="comprovantes">${demandas.map(d => `
    <li>
      <span class="codigo mono">${esc(d.comprovante.codigo)}</span>
      <span class="sobre">
        <b>${esc(visao === 'gerador' ? Catalogo.nomeResiduo(d.residuo) : d.gerador.nome)}</b>
        <span>${esc(Fmt.data(d.comprovante.emitidoEm))} · ${esc(d.destino.nome)}</span>
      </span>
      <span class="massa num">${esc(Fmt.kg(d.verificadoKg))}</span>
      <button class="btn sec sm" data-acao="comprovante" data-id="${d.id}">Ver</button>
    </li>`).join('')}</ul>`;
}

/* Geradores na visão de quem fiscaliza: situação primeiro, motivo junto. */
function listaGeradores(geradores, { compacta = false } = {}) {
  if (!geradores.length) return vazio('Nenhum gerador nesta situação', 'Ajuste o filtro para ver os demais.');
  return `<ul class="geradores">${geradores.map(g => `
    <li class="${g.situacao.tom}">
      <button class="linha-gerador" data-acao="gerador" data-id="${g.id}">
        <span class="corpo">
          <span class="nome">${esc(g.nome)}</span>
          <span class="detalhe">${esc(g.ramo)} · ${esc(g.bairro)} · ${esc(g.cnpj)}</span>
          ${compacta ? '' : `<span class="motivo">${esc(g.situacao.motivos[0])}</span>`}
        </span>
        <span class="lado">
          ${situacaoGerador(g.situacao)}
          <span class="massa num">${esc(Fmt.kg(g.massa))}</span>
          <span class="nota">${g.comprovantes} comprovante(s)</span>
        </span>
      </button>
    </li>`).join('')}</ul>`;
}
