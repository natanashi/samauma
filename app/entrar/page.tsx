'use client';

/* SAMAÚMA — entrar na conta.
   Portado de `telaLogin` em `src/telas/acesso.js`. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CabecalhoPublico } from '@/components/layout/CabecalhoPublico';
import { useDominioPronto } from '@/components/layout/Bootstrap';
import { Aviso, Cartao } from '@/components/ui/Basicos';
import { Conta } from '@/lib/dominio/conta';
import { PERFIS } from '@/lib/dominio/perfis';
import { Sessao } from '@/lib/dominio/sessao';
import type { Conta as TConta } from '@/lib/dominio/tipos';
import { useCadastroVersao, useContaVersao } from '@/state/hooks';

export default function PaginaEntrar() {
  const pronto = useDominioPronto();
  useContaVersao();
  useCadastroVersao();
  const router = useRouter();
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [lembrar, setLembrar] = useState(false);

  if (!pronto) return null;
  const contas = Conta.lembretes();

  function entrarComConta(conta: TConta) {
    Conta.entrarComConta(conta);
    if (conta.tipo === 'gerador') { Sessao.entrarComoGerador(conta.registro.id); router.push(`/gerador/${PERFIS.gerador.abas[0].id}`); }
    if (conta.tipo === 'catador') { Sessao.entrarComoCatador(conta.registro.id); router.push(`/catador/${PERFIS.catador.abas[0].id}`); }
    if (conta.tipo === 'destino') { Sessao.entrarComoDestino(conta.registro.id); router.push(`/cooperativa/${PERFIS.cooperativa.abas[0].id}`); }
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const { conta, erro: erroConta } = Conta.entrar(valor);
    if (erroConta || !conta) { setErro(erroConta || 'Não encontramos essa conta.'); return; }
    entrarComConta(conta);
  }

  return (
    <section className="portao" role="dialog" aria-modal="true">
      <div className="portao-caixa">
        <CabecalhoPublico />
        <div className="portao-grade modo-cadastro">
          <div className="cadastro-topo">
            <Link href="/" className="voltar">Voltar para a entrada</Link>
            <h2>Entrar na sua conta</h2>
            <p>Use o código de acesso que apareceu quando você se cadastrou. Sendo gerador,
              o CNPJ do estabelecimento também serve.</p>
          </div>

          <Cartao classe="cartao-cadastro" corpo={
            <form className="form" onSubmit={enviar} noValidate>
              <div className={`largo ${erro ? 'com-erro' : ''}`}>
                <label className="rot" htmlFor="loginIdentificador">Código de acesso ou CNPJ</label>
                <input type="text" id="loginIdentificador" value={valor}
                  onChange={e => setValor(e.target.value)}
                  placeholder="GER-4K7P" autoComplete="off" autoCapitalize="characters" />
                {erro ? <div className="erro-campo" role="alert">{erro}</div>
                  : <div className="ajuda">O código tem quatro letras e números depois do papel: GER, CAT ou UNI.</div>}
              </div>
              <div className="largo acoes-form">
                <button className="btn" type="submit">Entrar</button>
                <Link href="/cadastro" className="btn sec">Ainda não tenho cadastro</Link>
                {!!contas.length && (
                  <button className="btn fantasma" type="button" onClick={() => setLembrar(!lembrar)}>
                    {lembrar ? 'Ocultar' : 'Esqueci meu código'}
                  </button>
                )}
              </div>
            </form>
          } />

          {lembrar && (
            <Cartao titulo="Cadastros feitos neste navegador" sub="A recuperação só enxerga este aparelho — não há servidor guardando conta"
              corpo={
                <div className="lista-def">
                  {contas.map((c, i) => (
                    <div className="def" key={i}>
                      <b><code className="codigo-acesso">{c.codigo}</code> {c.nome}</b>
                      <p>{c.papel}</p>
                    </div>
                  ))}
                </div>
              }
              nota="Em produção, recuperar o acesso seria por e-mail ou consulta autenticada; nunca uma lista aberta como esta." />
          )}

          <Aviso titulo="Acesso demonstrativo, sem senha"
            texto="O código é gerado pelo sistema e vale só para esta demonstração, neste navegador. Nunca use uma senha de verdade em protótipo — este aqui não tem servidor nem como proteger nada. Em produção, a identificação viria do login único do Município ou do Gov.br." />
        </div>
      </div>
    </section>
  );
}
