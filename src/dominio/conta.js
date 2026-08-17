/* SAMAÚMA — contas de acesso.
   Quem se cadastra recebe um código de acesso e volta ao sistema com ele. A
   sessão fica guardada neste navegador, então fechar a aba não obriga a entrar
   de novo, e sair encerra de verdade.

   Por que código e não senha: pedir senha num protótipo ensina a pessoa a
   digitar uma senha de verdade numa página que não tem servidor, não tem
   criptografia em trânsito e não tem como proteger nada. O código é gerado
   pelo sistema, vale só para esta demonstração e não se parece com credencial
   de banco. Em produção, a identificação viria do login único do Município ou
   do Gov.br, e nada disto aqui seria reaproveitado. */

const CHAVE_SESSAO = 'samauma.sessao.v1';

/* Sem vogais nem caracteres que se confundem à mão: 0/O, 1/I, 5/S. */
const ALFABETO_CODIGO = 'ACDEFGHJKLMNPQRTUVWXY2346789';

const PREFIXO_CONTA = { gerador: 'GER', catador: 'CAT', destino: 'UNI' };

const Conta = {
  atual: null,

  /* ---------------------------------------------------------- identificação */

  gerarCodigo(tipo) {
    const sorteio = Array.from({ length: 4 },
      () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]).join('');
    const codigo = `${PREFIXO_CONTA[tipo] || 'SAM'}-${sorteio}`;
    return this.porCodigo(codigo) ? this.gerarCodigo(tipo) : codigo;
  },

  /* Todas as contas criadas neste navegador, com o papel de cada uma. */
  contas() {
    return [
      ...Cadastro.registros.geradores.map(r => ({ tipo: 'gerador', perfil: 'gerador', registro: r })),
      ...Cadastro.registros.catadores.map(r => ({ tipo: 'catador', perfil: 'catador', registro: r })),
      ...Cadastro.registros.destinos.map(r => ({ tipo: 'destino', perfil: 'cooperativa', registro: r }))
    ].filter(c => c.registro.codigo);
  },

  porCodigo(codigo) {
    const alvo = String(codigo || '').trim().toUpperCase();
    if (!alvo) return null;
    return this.contas().find(c => c.registro.codigo === alvo) || null;
  },

  /* O gerador também entra pelo CNPJ: é o número que ele tem à mão. */
  porIdentificador(valor) {
    const bruto = String(valor || '').trim();
    if (!bruto) return null;
    const porCodigo = this.porCodigo(bruto);
    if (porCodigo) return porCodigo;

    const digitos = bruto.replace(/\D/g, '');
    if (digitos.length === 14) {
      return this.contas().find(c =>
        c.tipo === 'gerador' && c.registro.cnpj.replace(/\D/g, '') === digitos) || null;
    }
    return null;
  },

  /* ------------------------------------------------------------- sessão */

  entrar(valor) {
    const conta = this.porIdentificador(valor);
    if (!conta) {
      return { erro: 'Não encontramos esse código ou CNPJ entre os cadastros deste navegador.' };
    }
    this.atual = conta;
    this._gravar({ tipo: conta.tipo, id: conta.registro.id });
    return { conta };
  },

  /* Chamado na abertura: devolve a sessão anterior, se o cadastro ainda existir. */
  retomar() {
    const salvo = this._ler();
    if (!salvo) return null;
    const conta = this.contas().find(c => c.tipo === salvo.tipo && c.registro.id === salvo.id);
    if (!conta) { this.sair(); return null; }
    this.atual = conta;
    return conta;
  },

  sair() {
    this.atual = null;
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { /* nada a fazer */ }
  },

  /* Quem esqueceu o código: neste protótipo, a lista está no próprio navegador.
     Em produção seria envio por e-mail ou consulta autenticada. */
  lembretes() {
    return this.contas().map(c => ({
      codigo: c.registro.codigo,
      nome: c.registro.nome,
      papel: { gerador: 'Gerador', catador: 'Catador', destino: 'Unidade receptora' }[c.tipo]
    }));
  },

  _ler() {
    try {
      const bruto = localStorage.getItem(CHAVE_SESSAO);
      return bruto ? JSON.parse(bruto) : null;
    } catch (erro) {
      return null;
    }
  },

  _gravar(dados) {
    try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dados)); } catch (erro) { /* segue sem lembrar */ }
  }
};
