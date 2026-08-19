'use client';

/* SAMAÚMA — moldura do perfil: topo, abas, sessão e rodapé.
   Portado de `<div id="app">` do `index.html` e de `App.renderizar()` /
   `App.renderizarAbas()` / `App.contexto()` / `App.contadores()`. Cada perfil
   usa esta mesma moldura (`app/<perfil>/layout.tsx`); o que muda é o `perfil`. */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Cadastro } from '@/lib/dominio/cadastro';
import { Conta } from '@/lib/dominio/conta';
import { EM_CURSO } from '@/lib/dominio/catalogo';
import { Painel } from '@/lib/dominio/indicadores';
import { PERFIS } from '@/lib/dominio/perfis';
import { Sessao } from '@/lib/dominio/sessao';
import { Store } from '@/lib/dominio/store';
import type { Perfil } from '@/lib/dominio/tipos';
import { useCadastroVersao, useContaVersao, useSessaoVersao, useStoreVersao } from '@/state/hooks';
import { useDominioPronto } from './Bootstrap';
import { Marca } from '../ui/Basicos';

function contadoresDoPerfil(perfil: Perfil): Record<string, number> {
  if (perfil === 'gerador') {
    const minhas = Store.doGerador(Sessao.gerador);
    return { demandas: minhas.filter(d => EM_CURSO.includes(d.status) || d.status === 'CRIADA').length };
  }
  if (perfil === 'catador') {
    return {
      dia: Store.doDia(Sessao.catador.id).length,
      disponiveis: Store.disponiveis().length,
      minhas: Store.doCatador(Sessao.catador.id).filter(d => d.status !== 'COMPROVADA').length
    };
  }
  if (perfil === 'cooperativa') {
    return { fila: Store.aCaminhoDe(Sessao.destino.id).length };
  }
  return {
    painel: Store.pendentes().length,
    geradores: Painel.geradores().filter(g => g.situacao.id !== 'REGULAR').length
  };
}

function contextoDoPerfil(perfil: Perfil): string {
  if (perfil === 'gerador') return Sessao.cadastroGerador?.nome || '—';
  if (perfil === 'catador') {
    const coop = Sessao.cooperativa;
    return Sessao.catador.nome + (coop ? ' · ' + coop.nome : ' · autônomo');
  }
  if (perfil === 'cooperativa') return Sessao.destino.nome;
  return 'Secretaria de Meio Ambiente';
}

export function AppShell({ perfil, children }: { perfil: Perfil; children: React.ReactNode }) {
  const pronto = useDominioPronto();
  useStoreVersao();
  useSessaoVersao();
  useContaVersao();
  useCadastroVersao();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pronto && Sessao.perfil !== perfil) Sessao.definirPerfil(perfil);
  }, [pronto, perfil]);

  if (!pronto) return null;

  const perfilAtual = PERFIS[perfil];
  const contadores = contadoresDoPerfil(perfil);
  const abaAtiva = pathname.split('/')[2] || perfilAtual.abas[0].id;
  const comConta = !!Conta.atual;

  const trocarOuSair = () => {
    if (comConta) {
      Conta.sair();
    }
    Sessao.definirPerfil(null);
    router.push('/');
  };

  const reiniciar = () => {
    Store.reiniciar();
    Cadastro.limpar();
    router.push(`/${perfil}/${perfilAtual.abas[0].id}`);
  };

  const botoesAbas = () => (
    <>
      {perfilAtual.abas.map(a => {
        const ativa = abaAtiva === a.id || (abaAtiva === 'nova' && a.id === 'demandas');
        const n = contadores[a.id];
        return (
          <Link key={a.id} href={`/${perfil}/${a.id}`} className={ativa ? 'on' : ''} aria-current={ativa ? 'page' : undefined}>
            <span>{a.rotulo}</span>{!!n && <span className="n num">{n}</span>}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="app" style={{ ['--perfil' as string]: perfilAtual.cor }}>
      <header className="topo">
        <div className="marca">
          <Marca tamanho={40} />
          <div className="marca-texto">
            <strong>SAMAÚMA</strong>
            <small>Grandes geradores e inclusão produtiva · Porto Velho/RO</small>
          </div>
        </div>

        <nav className="menu" aria-label="Seções do perfil">{botoesAbas()}</nav>

        <div className="sessao">
          <div className="quem">
            <span className="etiqueta">{perfilAtual.nome}</span>
            <span className="onde">{contextoDoPerfil(perfil)}</span>
          </div>
          <button className="btn fantasma sm" title="Voltar aos dados iniciais" onClick={reiniciar}>Reiniciar</button>
          <button className="btn sec sm" onClick={trocarOuSair}>{comConta ? 'Sair' : 'Trocar perfil'}</button>
        </div>
      </header>

      <main className="principal" id="conteudo">
        <div id="tela">{children}</div>
      </main>

      <footer className="rodape">
        <Marca tamanho={30} />
        <p><b>Protótipo demonstrativo.</b>
          Uma demanda entra no sistema, um catador assume, a carga é recebida e conferida por quem fecha o ciclo,
          e passa a existir uma prova verificável dessa destinação. Dados fictícios; bairros reais de Porto
          Velho/RO com coordenadas aproximadas, usadas apenas para demonstrar o produto.</p>
      </footer>

      <nav className="menu-mobile" aria-label="Seções do perfil">{botoesAbas()}</nav>
    </div>
  );
}
