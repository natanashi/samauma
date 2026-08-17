/* SAMAÚMA — cadastro de novos participantes.
   Quem chega ao sistema se cadastra e passa a existir para todo o resto: um
   gerador cadastrado publica demanda, um catador cadastrado aceita coleta, uma
   unidade cadastrada recebe carga. O registro entra nas mesmas tabelas do
   catálogo, então nenhuma outra parte do sistema precisa saber que ele é novo.

   O que este cadastro NÃO é: autenticação. Não há senha, não há verificação de
   identidade e nada sai deste navegador. Em produção, a identificação viria do
   login único do Município ou do Gov.br, e o cadastro seria a segunda etapa,
   depois de identificada a pessoa. */

const CHAVE_CADASTRO = 'samauma.cadastros.v1';

const Cadastro = {
  registros: { geradores: [], catadores: [], destinos: [], pontos: [] },

  /* Lê o que foi cadastrado antes e devolve ao catálogo, para que o sistema
     inteiro enxergue esses participantes como enxerga os demais. */
  iniciar() {
    const salvo = this._ler();
    if (salvo) this.registros = salvo;
    this.registros.pontos.forEach(p => { if (!Catalogo.ponto(p.id)) PONTOS.push(p); });
    this.registros.geradores.forEach(g => { if (!Catalogo.gerador(g.id)) GERADORES.push(g); });
    this.registros.catadores.forEach(c => { if (!Catalogo.catador(c.id)) CATADORES.push(c); });
    this.registros.destinos.forEach(d => { if (!Catalogo.destino(d.id)) DESTINOS.push(d); });
    return this;
  },

  /* ------------------------------------------------------------ validação */

  /* CNPJ conferido de verdade, com os dois dígitos verificadores. Um cadastro
     que aceita qualquer número não serve nem para demonstração. */
  cnpjValido(bruto) {
    const n = String(bruto || '').replace(/\D/g, '');
    if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
    const digito = (base, pesos) => {
      const soma = base.reduce((total, valor, i) => total + valor * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    const nums = n.split('').map(Number);
    const d1 = digito(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = digito(nums.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return d1 === nums[12] && d2 === nums[13];
  },

  formatarCnpj(bruto) {
    const n = String(bruto || '').replace(/\D/g, '').slice(0, 14);
    return n.replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?$/,
      (todo, a, b, c, d, e) => [a, b && '.' + b, c && '.' + c, d && '/' + d, e && '-' + e].filter(Boolean).join(''));
  },

  /* Cada campo devolve o próprio erro em texto: mensagem genérica obriga a
     pessoa a adivinhar o que está errado. */
  conferir(tipo, dados) {
    const erros = {};
    const texto = (campo, minimo, rotulo) => {
      if (!dados[campo] || dados[campo].trim().length < minimo) {
        erros[campo] = `${rotulo} precisa de pelo menos ${minimo} caracteres.`;
      }
    };
    const numero = (campo, minimo, rotulo) => {
      const valor = Number(dados[campo]);
      if (!valor || valor < minimo) erros[campo] = `${rotulo} precisa ser maior que ${minimo}.`;
    };

    texto('nome', 3, 'O nome');
    if (dados.nome && this._nomeEmUso(tipo, dados.nome)) {
      erros.nome = 'Já existe um cadastro com esse nome no sistema.';
    }

    if (tipo === 'gerador') {
      if (!this.cnpjValido(dados.cnpj)) erros.cnpj = 'CNPJ inválido: confira os 14 dígitos.';
      if (!dados.ramo) erros.ramo = 'Escolha o ramo de atividade.';
      if (!dados.ponto) erros.ponto = 'Escolha o bairro do ponto de coleta.';
      texto('acesso', 5, 'A instrução de acesso');
      numero('volumeMes', 1, 'O volume mensal estimado');
    }

    if (tipo === 'catador') {
      texto('veiculo', 3, 'O veículo ou equipamento');
      if (!dados.zona) erros.zona = 'Escolha a zona onde você trabalha.';
      numero('metaSemanal', 1, 'A meta semanal');
    }

    if (tipo === 'destino') {
      if (!dados.tipoUnidade) erros.tipoUnidade = 'Escolha o tipo de unidade.';
      texto('licenca', 3, 'A licença');
      numero('capacidadeDiaria', 1, 'A capacidade diária');
      if (!dados.aceita || !dados.aceita.length) erros.aceita = 'Selecione ao menos um material aceito.';
      texto('destinoFinal', 5, 'A destinação declarada');
      if (!dados.ponto) erros.ponto = 'Escolha o bairro da unidade.';
    }

    return erros;
  },

  _nomeEmUso(tipo, nome) {
    const alvo = nome.trim().toLowerCase();
    const listas = { gerador: GERADORES, catador: CATADORES, destino: DESTINOS };
    return (listas[tipo] || []).some(item => item.nome.trim().toLowerCase() === alvo);
  },

  /* --------------------------------------------------------------- criação */

  criar(tipo, dados) {
    const erros = this.conferir(tipo, dados);
    if (Object.keys(erros).length) return { erros };

    if (tipo === 'gerador') return { registro: this._criarGerador(dados), erros: {} };
    if (tipo === 'catador') return { registro: this._criarCatador(dados), erros: {} };
    return { registro: this._criarDestino(dados), erros: {} };
  },

  _criarGerador(dados) {
    const base = Catalogo.ponto(dados.ponto);
    const ponto = {
      id: this._novoId('pt-c', PONTOS),
      bairro: base.bairro, zona: base.zona,
      lat: base.lat, lng: base.lng,
      acesso: dados.acesso.trim()
    };
    const gerador = {
      id: this._novoId('ger-c', GERADORES),
      nome: dados.nome.trim(),
      cnpj: this.formatarCnpj(dados.cnpj),
      ramo: dados.ramo,
      ponto: ponto.id,
      km: Number(dados.km) || 5,
      volumeMes: Number(dados.volumeMes),
      operador: dados.operador || null,
      pgrs: dados.pgrsNumero
        ? { numero: dados.pgrsNumero.trim(), validade: Number(dados.pgrsValidade) || 365 }
        : null,
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('gerador')
    };
    PONTOS.push(ponto);
    GERADORES.push(gerador);
    this.registros.pontos.push(ponto);
    this.registros.geradores.push(gerador);
    this._gravar();
    return gerador;
  },

  _criarCatador(dados) {
    const catador = {
      id: this._novoId('cat-c', CATADORES),
      nome: dados.nome.trim(),
      cooperativa: dados.cooperativa || null,
      desde: new Date().toISOString().slice(0, 10),
      metaSemanal: Number(dados.metaSemanal),
      veiculo: dados.veiculo.trim(),
      zona: dados.zona,
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('catador')
    };
    CATADORES.push(catador);
    this.registros.catadores.push(catador);
    this._gravar();
    return catador;
  },

  _criarDestino(dados) {
    const base = Catalogo.ponto(dados.ponto);
    const ponto = {
      id: this._novoId('pt-c', PONTOS),
      bairro: base.bairro, zona: base.zona,
      lat: base.lat, lng: base.lng,
      acesso: (dados.acesso || 'Balança da entrada').trim()
    };
    const destino = {
      id: this._novoId('dst-c', DESTINOS),
      nome: dados.nome.trim(),
      tipo: dados.tipoUnidade,
      cooperativa: dados.cooperativa || null,
      ponto: ponto.id,
      licenca: dados.licenca.trim(),
      capacidadeDiaria: Number(dados.capacidadeDiaria),
      aceita: dados.aceita.slice(),
      destinoFinal: dados.destinoFinal.trim(),
      triagem: !dados.aceita.includes('rejeito'),
      aterro: dados.tipoUnidade === 'Disposição final',
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('destino')
    };
    PONTOS.push(ponto);
    DESTINOS.push(destino);
    this.registros.pontos.push(ponto);
    this.registros.destinos.push(destino);
    this._gravar();
    return destino;
  },

  /* Quantos participantes entraram por cadastro, para a tela mostrar. */
  total() {
    return this.registros.geradores.length + this.registros.catadores.length + this.registros.destinos.length;
  },

  /* ---------------------------------------------------------------- infra */

  _novoId(prefixo, lista) {
    let n = 1;
    while (lista.some(item => item.id === `${prefixo}-${String(n).padStart(2, '0')}`)) n += 1;
    return `${prefixo}-${String(n).padStart(2, '0')}`;
  },

  _ler() {
    try {
      const bruto = localStorage.getItem(CHAVE_CADASTRO);
      if (!bruto) return null;
      const dados = JSON.parse(bruto);
      return dados && dados.geradores ? dados : null;
    } catch (erro) {
      return null;
    }
  },

  _gravar() {
    try {
      localStorage.setItem(CHAVE_CADASTRO, JSON.stringify(this.registros));
    } catch (erro) {
      /* sem armazenamento, o cadastro vale para esta sessão */
    }
  },

  limpar() {
    this.registros = { geradores: [], catadores: [], destinos: [], pontos: [] };
    try { localStorage.removeItem(CHAVE_CADASTRO); } catch (erro) { /* nada a fazer */ }
  }
};
