'use client';

/* SAMAÚMA — entrada.
   Quatro portas na ordem do ciclo, mais o acesso por conta. Portado de
   `telas/entrada.js` + a parte de `App.iniciar()`/`App.entrar()` que decide
   para onde ir: atalho `?perfil=`, sessão retomada, ou escolha manual. */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useDominioPronto } from '@/components/layout/Bootstrap';
import { Marca } from '@/components/ui/Basicos';
import { Conta } from '@/lib/dominio/conta';
import { ICONES_PERFIL, ORDEM_PERFIS, PERFIS } from '@/lib/dominio/perfis';
import { Sessao } from '@/lib/dominio/sessao';
import type { Perfil } from '@/lib/dominio/tipos';
import { useCadastroVersao, useContaVersao, useSessaoVersao } from '@/state/hooks';

function primeiraRota(perfil: Perfil) {
  return `/${perfil}/${PERFIS[perfil].abas[0].id}`;
}

function PaginaEntradaConteudo() {
  const pronto = useDominioPronto();
  useSessaoVersao();
  useContaVersao();
  useCadastroVersao();
  const router = useRouter();
  const busca = useSearchParams();

  useEffect(() => {
    if (!pronto) return;

    const atalho = busca.get('perfil') as Perfil | null;
    if (atalho && PERFIS[atalho]) {
      entrar(atalho, busca.get('catador'), busca.get('destino'));
      return;
    }

    const conta = Conta.retomar();
    if (conta) {
      if (conta.tipo === 'gerador') { Sessao.entrarComoGerador(conta.registro.id); entrar('gerador', null, null); }
      if (conta.tipo === 'catador') entrar('catador', conta.registro.id, null);
      if (conta.tipo === 'destino') entrar('cooperativa', null, conta.registro.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto]);

  function entrar(perfil: Perfil, catadorId?: string | null, destinoId?: string | null) {
    if (catadorId) Sessao.entrarComoCatador(catadorId);
    if (destinoId) Sessao.entrarComoDestino(destinoId);
    router.push(primeiraRota(perfil));
  }

  if (!pronto) return null;

  return (
    <section className="portao" role="dialog" aria-modal="true" aria-labelledby="portaoTitulo">
      <div className="portao-caixa">
        <header className="portao-marca">
          <Marca tamanho={190} forma="completa" />
          <h1 id="portaoTitulo" className="oculto">SAMAÚMA — Sistema de Grandes Geradores e Inclusão Produtiva</h1>
        </header>

        <p className="portao-lead">
          O gerador declara o resíduo. O catador coleta. O destinatário recebe, pesa e confirma.
          A Prefeitura acompanha. O ciclo só fecha quando existe prova.
        </p>

        <div className="portao-acesso">
          <Link href="/entrar" className="btn grande">Entrar na minha conta</Link>
          <Link href="/cadastro" className="btn sec grande">Criar cadastro</Link>
          <p>Já tem código de acesso? Entre. Ainda não participa? Cadastre seu estabelecimento,
            sua coleta ou sua unidade receptora e comece a usar no mesmo acesso.</p>
        </div>

        <p className="portao-ou"><span>ou conheça o sistema pelas áreas de demonstração</span></p>

        <div className="portao-grade">
          {ORDEM_PERFIS.map(chave => {
            const p = PERFIS[chave];
            return (
              <article key={chave} className="porta" style={{ ['--cor-perfil' as string]: p.cor }}>
                <span className="porta-icone" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: ICONES_PERFIL[p.id] }} />
                </span>
                <h2>{p.nome}</h2>
                <p>{p.resumo}</p>
                <div className="porta-acoes">
                  {p.entradas.map((e, i) => (
                    <button key={i} className={e.secundaria ? 'porta-secundaria' : 'btn'}
                      onClick={() => entrar(p.id, e.catador, e.destino)}>
                      {e.rotulo}{!e.secundaria && <span className="seta"> →</span>}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <p className="portao-aviso">
          Organizações, pessoas, documentos, coordenadas e valores são fictícios
          ou aproximados. O protótipo não acessa sistemas oficiais nem o geoportal, não movimenta dinheiro e não
          representa contratação, decisão administrativa ou procedimento homologado pela Prefeitura de Porto Velho.
        </p>
      </div>
    </section>
  );
}

export default function PaginaEntrada() {
  return (
    <Suspense fallback={null}>
      <PaginaEntradaConteudo />
    </Suspense>
  );
}
