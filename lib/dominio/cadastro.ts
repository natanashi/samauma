/* SAMAÚMA — cadastro de novos participantes.
   Quem chega ao sistema se cadastra e passa a existir para todo o resto: um
   gerador cadastrado publica demanda, um catador cadastrado aceita coleta, uma
   unidade cadastrada recebe carga. O registro entra nas mesmas tabelas do
   catálogo, então nenhuma outra parte do sistema precisa saber que ele é novo.

   O que este cadastro NÃO é: autenticação. Não há senha, não há verificação de
   identidade e nada sai deste navegador. */

import { CATADORES, Catalogo, COOPERATIVAS, DESTINOS, GERADORES, PONTOS } from './catalogo';
import { Conta } from './conta';
import type { Catador, DadosCadastro, Destino, Gerador, Ponto, RegistrosCadastro, TipoCadastro } from './tipos';

function paraTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : '';
}

function paraLista(valor: unknown): string[] {
  return Array.isArray(valor) ? valor : [];
}

const CHAVE_CADASTRO = 'samauma.next.cadastros.v1';

type Ouvinte = () => void;

class CadastroParticipantes {
  registros: RegistrosCadastro = { geradores: [], catadores: [], destinos: [], pontos: [] };
  private ouvintes = new Set<Ouvinte>();
  private instantaneo = {};

  subscribe = (ouvinte: Ouvinte): (() => void) => {
    this.ouvintes.add(ouvinte);
    return () => this.ouvintes.delete(ouvinte);
  };

  getSnapshot = () => this.instantaneo;

  private notificar() {
    this.instantaneo = {};
    this.ouvintes.forEach(o => o());
  }

  iniciar(): this {
    const salvo = this._ler();
    if (salvo) this.registros = salvo;
    this.registros.pontos.forEach(p => { if (!Catalogo.ponto(p.id)) PONTOS.push(p); });
    this.registros.geradores.forEach(g => { if (!Catalogo.gerador(g.id)) GERADORES.push(g); });
    this.registros.catadores.forEach(c => { if (!Catalogo.catador(c.id)) CATADORES.push(c); });
    this.registros.destinos.forEach(d => { if (!Catalogo.destino(d.id)) DESTINOS.push(d); });
    return this;
  }

  cnpjValido(bruto: unknown): boolean {
    const n = String(bruto || '').replace(/\D/g, '');
    if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
    const digito = (base: number[], pesos: number[]) => {
      const soma = base.reduce((total, valor, i) => total + valor * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };
    const nums = n.split('').map(Number);
    const d1 = digito(nums.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const d2 = digito(nums.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return d1 === nums[12] && d2 === nums[13];
  }

  formatarCnpj(bruto: unknown): string {
    const n = String(bruto || '').replace(/\D/g, '').slice(0, 14);
    return n.replace(/^(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?$/,
      (_todo, a, b, c, d, e) => [a, b && '.' + b, c && '.' + c, d && '/' + d, e && '-' + e].filter(Boolean).join(''));
  }

  conferir(tipo: TipoCadastro, dados: DadosCadastro): Record<string, string> {
    const erros: Record<string, string> = {};
    const texto = (campo: string, minimo: number, rotulo: string) => {
      if (!dados[campo] || String(dados[campo]).trim().length < minimo) {
        erros[campo] = `${rotulo} precisa de pelo menos ${minimo} caracteres.`;
      }
    };
    const numero = (campo: string, minimo: number, rotulo: string) => {
      const valor = Number(dados[campo]);
      if (!valor || valor < minimo) erros[campo] = `${rotulo} precisa ser maior que ${minimo}.`;
    };

    texto('nome', 3, 'O nome');
    if (dados.nome && this._nomeEmUso(tipo, paraTexto(dados.nome))) {
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
  }

  private _nomeEmUso(tipo: TipoCadastro, nome: string): boolean {
    const alvo = nome.trim().toLowerCase();
    const listas: Record<TipoCadastro, { nome: string }[]> = { gerador: GERADORES, catador: CATADORES, destino: DESTINOS };
    return (listas[tipo] || []).some(item => item.nome.trim().toLowerCase() === alvo);
  }

  criar(tipo: TipoCadastro, dados: DadosCadastro): { registro?: Gerador | Catador | Destino; erros: Record<string, string> } {
    const erros = this.conferir(tipo, dados);
    if (Object.keys(erros).length) return { erros };

    if (tipo === 'gerador') return { registro: this._criarGerador(dados), erros: {} };
    if (tipo === 'catador') return { registro: this._criarCatador(dados), erros: {} };
    return { registro: this._criarDestino(dados), erros: {} };
  }

  private _criarGerador(dados: DadosCadastro): Gerador {
    const base = Catalogo.ponto(paraTexto(dados.ponto))!;
    const ponto: Ponto = {
      id: this._novoId('pt-c', PONTOS),
      bairro: base.bairro, zona: base.zona,
      lat: base.lat, lng: base.lng,
      acesso: paraTexto(dados.acesso).trim()
    };
    const gerador: Gerador = {
      id: this._novoId('ger-c', GERADORES),
      nome: paraTexto(dados.nome).trim(),
      cnpj: this.formatarCnpj(paraTexto(dados.cnpj)),
      ramo: paraTexto(dados.ramo),
      ponto: ponto.id,
      km: Number(dados.km) || 5,
      volumeMes: Number(dados.volumeMes),
      operador: paraTexto(dados.operador) || null,
      pgrs: dados.pgrsNumero
        ? { numero: paraTexto(dados.pgrsNumero).trim(), validade: Number(dados.pgrsValidade) || 365 }
        : null,
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('gerador')
    };
    PONTOS.push(ponto);
    GERADORES.push(gerador);
    this.registros.pontos.push(ponto);
    this.registros.geradores.push(gerador);
    this._gravar();
    this.notificar();
    return gerador;
  }

  private _criarCatador(dados: DadosCadastro): Catador {
    const catador: Catador = {
      id: this._novoId('cat-c', CATADORES),
      nome: paraTexto(dados.nome).trim(),
      cooperativa: paraTexto(dados.cooperativa) || null,
      desde: new Date().toISOString().slice(0, 10),
      metaSemanal: Number(dados.metaSemanal),
      veiculo: paraTexto(dados.veiculo).trim(),
      zona: paraTexto(dados.zona),
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('catador')
    };
    CATADORES.push(catador);
    this.registros.catadores.push(catador);
    this._gravar();
    this.notificar();
    return catador;
  }

  private _criarDestino(dados: DadosCadastro): Destino {
    const base = Catalogo.ponto(paraTexto(dados.ponto))!;
    const ponto: Ponto = {
      id: this._novoId('pt-c', PONTOS),
      bairro: base.bairro, zona: base.zona,
      lat: base.lat, lng: base.lng,
      acesso: paraTexto(dados.acesso || 'Balança da entrada').trim()
    };
    const aceita = paraLista(dados.aceita);
    const destino: Destino = {
      id: this._novoId('dst-c', DESTINOS),
      nome: paraTexto(dados.nome).trim(),
      tipo: paraTexto(dados.tipoUnidade),
      cooperativa: paraTexto(dados.cooperativa) || null,
      ponto: ponto.id,
      licenca: paraTexto(dados.licenca).trim(),
      capacidadeDiaria: Number(dados.capacidadeDiaria),
      aceita: aceita.slice(),
      destinoFinal: paraTexto(dados.destinoFinal).trim(),
      triagem: !aceita.includes('rejeito'),
      aterro: dados.tipoUnidade === 'Disposição final',
      cadastradoAqui: true,
      codigo: Conta.gerarCodigo('destino')
    };
    PONTOS.push(ponto);
    DESTINOS.push(destino);
    this.registros.pontos.push(ponto);
    this.registros.destinos.push(destino);
    this._gravar();
    this.notificar();
    return destino;
  }

  total(): number {
    return this.registros.geradores.length + this.registros.catadores.length + this.registros.destinos.length;
  }

  private _novoId(prefixo: string, lista: { id: string }[]): string {
    let n = 1;
    while (lista.some(item => item.id === `${prefixo}-${String(n).padStart(2, '0')}`)) n += 1;
    return `${prefixo}-${String(n).padStart(2, '0')}`;
  }

  private _ler(): RegistrosCadastro | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const bruto = localStorage.getItem(CHAVE_CADASTRO);
      if (!bruto) return null;
      const dados = JSON.parse(bruto);
      return dados && dados.geradores ? dados : null;
    } catch {
      return null;
    }
  }

  private _gravar() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CHAVE_CADASTRO, JSON.stringify(this.registros));
    } catch {
      /* sem armazenamento, o cadastro vale para esta sessão */
    }
  }

  limpar() {
    this.registros = { geradores: [], catadores: [], destinos: [], pontos: [] };
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(CHAVE_CADASTRO); } catch { /* nada a fazer */ }
    }
    this.notificar();
  }
}

export const Cadastro = new CadastroParticipantes();

/* Referenciado por formulários de cadastro. */
export { COOPERATIVAS };
