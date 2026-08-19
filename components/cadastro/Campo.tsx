/* Um campo com rótulo, ajuda e o erro logo abaixo, onde a pessoa está olhando.
   Portado de `campo()` em `src/telas/cadastro.js`. */

import type { ReactNode } from 'react';

export function Campo({ id, rotulo, controle, ajuda, erro, largo = false }: {
  id: string; rotulo: string; controle: ReactNode; ajuda?: string; erro?: string; largo?: boolean;
}) {
  return (
    <div className={`${erro ? 'com-erro' : ''} ${largo ? 'largo' : ''}`}>
      <label className="rot" htmlFor={id}>{rotulo}</label>
      {controle}
      {erro ? <div className="erro-campo" role="alert">{erro}</div>
        : ajuda ? <div className="ajuda">{ajuda}</div> : null}
    </div>
  );
}
