/* SAMAÚMA — entrar na conta.
   Uma caixa, um campo, um botão. Quem já se cadastrou entra com o código que
   recebeu — ou, sendo gerador, com o próprio CNPJ. */

function telaLogin(estado) {
  const { erro = '', valor = '', lembrar = false } = (estado && estado.login) || {};
  const contas = Conta.lembretes();

  return `
    <div class="cadastro-topo">
      <button class="voltar" data-acao="cadastro-sair">Voltar para a entrada</button>
      <h2>Entrar na sua conta</h2>
      <p>Use o código de acesso que apareceu quando você se cadastrou. Sendo gerador,
        o CNPJ do estabelecimento também serve.</p>
    </div>

    ${cartao({ classe: 'cartao-cadastro', corpo: `<form class="form" id="formLogin" novalidate>
      <div class="largo ${erro ? 'com-erro' : ''}">
        <label class="rot" for="loginIdentificador">Código de acesso ou CNPJ</label>
        <input type="text" id="loginIdentificador" value="${esc(valor)}"
          placeholder="GER-4K7P" autocomplete="off" autocapitalize="characters">
        ${erro ? `<div class="erro-campo" role="alert">${esc(erro)}</div>`
               : '<div class="ajuda">O código tem quatro letras e números depois do papel: GER, CAT ou UNI.</div>'}
      </div>
      <div class="largo acoes-form">
        <button class="btn" type="submit">Entrar</button>
        <button class="btn sec" type="button" data-acao="cadastrar">Ainda não tenho cadastro</button>
        ${contas.length ? `<button class="btn fantasma" type="button" data-acao="login-lembrar">${lembrar ? 'Ocultar' : 'Esqueci meu código'}</button>` : ''}
      </div>
    </form>` })}

    ${lembrar ? cartao({
      titulo: 'Cadastros feitos neste navegador',
      sub: 'A recuperação só enxerga este aparelho — não há servidor guardando conta',
      corpo: `<div class="lista-def">${contas.map(c => `
        <div class="def">
          <b><code class="codigo-acesso">${esc(c.codigo)}</code> ${esc(c.nome)}</b>
          <p>${esc(c.papel)}</p>
        </div>`).join('')}</div>`,
      nota: 'Em produção, recuperar o acesso seria por e-mail ou consulta autenticada; nunca uma lista aberta como esta.'
    }) : ''}

    ${aviso('Acesso demonstrativo, sem senha',
      'O código é gerado pelo sistema e vale só para esta demonstração, neste navegador. Nunca use uma senha de verdade em protótipo — este aqui não tem servidor nem como proteger nada. Em produção, a identificação viria do login único do Município ou do Gov.br.')}`;
}

/* Tela mostrada uma única vez, logo depois do cadastro: é aqui que a pessoa
   vê o código pela primeira e última vez em destaque. */
function telaCodigoCriado(registro, papel) {
  return `
    <div class="cadastro-topo">
      <span class="cadastro-papel">CADASTRO CONCLUÍDO</span>
      <h2>${esc(registro.nome)}</h2>
      <p>Guarde o código abaixo: é com ele que você volta ao sistema neste navegador.</p>
    </div>

    ${cartao({ classe: 'cartao-codigo', corpo: `
      <div class="codigo-destaque">
        <span>Seu código de acesso</span>
        <b class="codigo-acesso">${esc(registro.codigo)}</b>
        <small>${esc(papel)}${registro.cnpj ? ' · ou entre com o CNPJ ' + esc(registro.cnpj) : ''}</small>
      </div>
      <div class="acoes-form">
        <button class="btn" data-acao="codigo-continuar">Entrar no sistema</button>
        <button class="btn sec" data-acao="codigo-copiar" data-codigo="${esc(registro.codigo)}">Copiar código</button>
      </div>` })}

    ${aviso('Anote antes de continuar',
      'O código fica guardado neste navegador e pode ser recuperado em “Esqueci meu código”. Se você limpar os dados do navegador ou usar outro aparelho, o cadastro se perde — é a limitação de um protótipo sem servidor.')}`;
}
