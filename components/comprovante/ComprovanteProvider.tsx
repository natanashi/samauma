'use client';

/* SAMAÚMA — comprovante como sobreposição global.
   Tela compartilhada entre os quatro perfis, aberta por cima de qualquer rota
   — por isso vive num Provider no layout raiz, e não numa rota própria.
   Portado do par `#sobreposicao` / `App.verComprovante` do protótipo original. */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Store } from '@/lib/dominio/store';
import { baixarComprovante, comprovanteHtml } from '@/lib/servicos/comprovante';
import { LOGO_URL } from '../ui/Basicos';

interface ComprovanteContexto {
  abrir: (id: string) => void;
}

const ComprovanteContext = createContext<ComprovanteContexto>({ abrir: () => {} });

export function useComprovante() {
  return useContext(ComprovanteContext);
}

export function ComprovanteProvider({ children }: { children: React.ReactNode }) {
  const [id, setId] = useState<string | null>(null);

  const abrir = useCallback((novoId: string) => setId(novoId), []);
  const fechar = useCallback(() => setId(null), []);

  useEffect(() => {
    if (!id) return;
    const aoTeclar = (evento: KeyboardEvent) => { if (evento.key === 'Escape') fechar(); };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [id, fechar]);

  const demanda = id ? Store.obter(id) : null;

  return (
    <ComprovanteContext.Provider value={{ abrir }}>
      {children}
      <div className="sobreposicao" hidden={!demanda} role="dialog" aria-modal="true" aria-label="Comprovante de destinação"
        onClick={evento => { if (evento.target === evento.currentTarget) fechar(); }}>
        <div className="folha">
          <div className="folha-topo">
            <b>Comprovante de destinação</b>
            <div className="acoes">
              <button className="btn sec sm" onClick={() => demanda && baixarComprovante(demanda, location.origin + LOGO_URL)}>Baixar</button>
              <button className="btn sec sm" onClick={() => {
                document.body.classList.add('somente-comprovante');
                window.print();
                document.body.classList.remove('somente-comprovante');
              }}>Imprimir</button>
              <button className="btn sm" onClick={fechar}>Fechar</button>
            </div>
          </div>
          <div id="folhaConteudo" dangerouslySetInnerHTML={{ __html: demanda ? comprovanteHtml(demanda, LOGO_URL) : '' }} />
        </div>
      </div>
    </ComprovanteContext.Provider>
  );
}
