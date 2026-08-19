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

import { Cadastro } from './cadastro';
import type { Conta as TConta, TipoCadastro } from './tipos';

const CHAVE_SESSAO = 'samauma.next.sessao.v1';

/* Sem vogais nem caracteres que se confundem à mão: 0/O, 1/I, 5/S. */
const ALFABETO_CODIGO = 'ACDEFGHJKLMNPQRTUVWXY2346789';

const PREFIXO_CONTA: Record<TipoCadastro, string> = { gerador: 'GER', catador: 'CAT', destino: 'UNI' };

type Ouvinte = () => void;

class ContaAcesso {
  atual: TConta | null = null;
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

  gerarCodigo(tipo: TipoCadastro): string {
    const sorteio = Array.from({ length: 4 },
      () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]).join('');
    const codigo = `${PREFIXO_CONTA[tipo] || 'SAM'}-${sorteio}`;
    return this.porCodigo(codigo) ? this.gerarCodigo(tipo) : codigo;
  }

  contas(): TConta[] {
    return [
      ...Cadastro.registros.geradores.map(r => ({ tipo: 'gerador' as const, perfil: 'gerador' as const, registro: r })),
      ...Cadastro.registros.catadores.map(r => ({ tipo: 'catador' as const, perfil: 'catador' as const, registro: r })),
      ...Cadastro.registros.destinos.map(r => ({ tipo: 'destino' as const, perfil: 'cooperativa' as const, registro: r }))
    ].filter(c => c.registro.codigo);
  }

  porCodigo(codigo: string): TConta | null {
    const alvo = String(codigo || '').trim().toUpperCase();
    if (!alvo) return null;
    return this.contas().find(c => c.registro.codigo === alvo) || null;
  }

  porIdentificador(valor: string): TConta | null {
    const bruto = String(valor || '').trim();
    if (!bruto) return null;
    const porCodigo = this.porCodigo(bruto);
    if (porCodigo) return porCodigo;

    const digitos = bruto.replace(/\D/g, '');
    if (digitos.length === 14) {
      return this.contas().find(c =>
        c.tipo === 'gerador' && 'cnpj' in c.registro && c.registro.cnpj.replace(/\D/g, '') === digitos) || null;
    }
    return null;
  }

  entrar(valor: string): { conta?: TConta; erro?: string } {
    const conta = this.porIdentificador(valor);
    if (!conta) {
      return { erro: 'Não encontramos esse código ou CNPJ entre os cadastros deste navegador.' };
    }
    this.atual = conta;
    this._gravar({ tipo: conta.tipo, id: conta.registro.id });
    this.notificar();
    return { conta };
  }

  retomar(): TConta | null {
    const salvo = this._ler();
    if (!salvo) return null;
    const conta = this.contas().find(c => c.tipo === salvo.tipo && c.registro.id === salvo.id);
    if (!conta) { this.sair(); return null; }
    this.atual = conta;
    this.notificar();
    return conta;
  }

  entrarComConta(conta: TConta) {
    this.atual = conta;
    this._gravar({ tipo: conta.tipo, id: conta.registro.id });
    this.notificar();
  }

  sair() {
    this.atual = null;
    if (typeof localStorage !== 'undefined') {
      try { localStorage.removeItem(CHAVE_SESSAO); } catch { /* nada a fazer */ }
    }
    this.notificar();
  }

  lembretes() {
    return this.contas().map(c => ({
      codigo: c.registro.codigo!,
      nome: c.registro.nome,
      papel: { gerador: 'Gerador', catador: 'Catador', destino: 'Unidade receptora' }[c.tipo]
    }));
  }

  private _ler(): { tipo: TipoCadastro; id: string } | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const bruto = localStorage.getItem(CHAVE_SESSAO);
      return bruto ? JSON.parse(bruto) : null;
    } catch {
      return null;
    }
  }

  private _gravar(dados: { tipo: TipoCadastro; id: string }) {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify(dados)); } catch { /* segue sem lembrar */ }
  }
}

export const Conta = new ContaAcesso();
