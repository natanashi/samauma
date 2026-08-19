'use client';

/* SAMAÚMA — recado: o aviso de rodapé que confirma cada ação (demanda
   publicada, peso registrado, comprovante emitido...). Portado de
   `App.recado()` — um toast simples, sem biblioteca. */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const RecadoContext = createContext<(texto: string) => void>(() => {});

export function useRecado() {
  return useContext(RecadoContext);
}

export function RecadoProvider({ children }: { children: React.ReactNode }) {
  const [texto, setTexto] = useState('');
  const [visivel, setVisivel] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const recado = useCallback((novoTexto: string) => {
    setTexto(novoTexto);
    setVisivel(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setVisivel(false), 4200);
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <RecadoContext.Provider value={recado}>
      {children}
      <div className={`recado ${visivel ? 'on' : ''}`} role="status" aria-live="polite">{texto}</div>
    </RecadoContext.Provider>
  );
}
