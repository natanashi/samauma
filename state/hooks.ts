'use client';

/* SAMAÚMA — ponte entre os módulos de domínio (armazéns mutáveis, com
   localStorage) e o React. Cada hook apenas força o componente a renderizar de
   novo quando o armazém correspondente notifica uma mudança; os dados em si
   continuam sendo lidos direto do domínio (Store, Painel, Catalogo...) no
   corpo do componente — o mesmo modelo do `App.renderizar()` original, só que
   o React decide o que redesenhar. */

import { useSyncExternalStore } from 'react';
import { Cadastro } from '@/lib/dominio/cadastro';
import { Conta } from '@/lib/dominio/conta';
import { Sessao } from '@/lib/dominio/sessao';
import { Store } from '@/lib/dominio/store';

export function useStoreVersao() {
  useSyncExternalStore(Store.subscribe, Store.getSnapshot, Store.getSnapshot);
}

export function useSessaoVersao() {
  useSyncExternalStore(Sessao.subscribe, Sessao.getSnapshot, Sessao.getSnapshot);
}

export function useContaVersao() {
  useSyncExternalStore(Conta.subscribe, Conta.getSnapshot, Conta.getSnapshot);
}

export function useCadastroVersao() {
  useSyncExternalStore(Cadastro.subscribe, Cadastro.getSnapshot, Cadastro.getSnapshot);
}

/* Assina os quatro armazéns de uma vez — o que a maioria das telas precisa,
   já que quase todo painel cruza demanda, sessão, conta e cadastro. */
export function useDominio() {
  useStoreVersao();
  useSessaoVersao();
  useContaVersao();
  useCadastroVersao();
}
