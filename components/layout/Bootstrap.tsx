'use client';

/* SAMAÚMA — inicialização do domínio no navegador.
   Equivalente ao `App.iniciar()` do protótipo original: carrega o que foi
   cadastrado neste navegador, depois o armazém de demandas (semeando os dados
   de demonstração na primeira visita). Precisa rodar uma vez, só no cliente.

   Usa o mesmo idioma de `useSyncExternalStore` que o resto do estado do
   domínio: o snapshot do servidor é `false` (nada rodou ainda), o do cliente
   é `true` — a própria função `subscribe`, chamada uma vez na montagem, é
   onde `Cadastro.iniciar()`/`Store.iniciar()` rodam. Evita chamar `setState`
   direto dentro de um efeito só para marcar "já montei". */

import { createContext, useContext, useSyncExternalStore } from 'react';
import { Cadastro } from '@/lib/dominio/cadastro';
import { Store } from '@/lib/dominio/store';

const DominioProntoContext = createContext(false);

export function useDominioPronto() {
  return useContext(DominioProntoContext);
}

function subscribe() {
  Cadastro.iniciar();
  Store.iniciar();
  return () => {};
}

function snapshotCliente() { return true; }
function snapshotServidor() { return false; }

export function Bootstrap({ children }: { children: React.ReactNode }) {
  const pronto = useSyncExternalStore(subscribe, snapshotCliente, snapshotServidor);

  return (
    <DominioProntoContext.Provider value={pronto}>
      {children}
    </DominioProntoContext.Provider>
  );
}
