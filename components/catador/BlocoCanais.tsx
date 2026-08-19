'use client';

/* Como esta rota será registrada. Portado de `blocoCanais()` em
   `src/telas/catador.js`. */

import { useSyncExternalStore } from 'react';
import { Cartao } from '@/components/ui/Basicos';
import { useRecado } from '@/components/layout/RecadoProvider';
import { CANAIS } from '@/lib/dominio/catalogo';
import { CanalRegistro } from '@/lib/dominio/canalRegistro';
import { baixarFichaColeta } from '@/lib/servicos/ficha';
import { Sessao } from '@/lib/dominio/sessao';

export function BlocoCanais() {
  const recado = useRecado();
  useSyncExternalStore(CanalRegistro.subscribe, CanalRegistro.getSnapshot, CanalRegistro.getSnapshot);

  return (
    <Cartao titulo="Como esta rota será registrada" sub="Quatro caminhos — nenhum deles exige celular próprio"
      acao={<button className="btn sec sm" onClick={() => { baixarFichaColeta(Sessao.catador); recado(`Ficha gerada para impressão.`); }}>Baixar ficha de papel</button>}
      nota="O canal escolhido entra na trilha: quando alguem digita por outra pessoa, o evento guarda quem executou e quem registrou. Sem aparelho ou sem bateria, a coleta vai para a ficha numerada e e digitada depois no galpao."
      corpo={
        <div className="canais">
          {Object.entries(CANAIS).map(([id, canal]) => (
            <button key={id} className={`canal ${id === CanalRegistro.atual ? 'on' : ''}`} aria-pressed={id === CanalRegistro.atual}
              onClick={() => { CanalRegistro.escolher(id); recado('Canal de registro: ' + canal.nome + '.'); }}>
              <b>{canal.nome}</b><span>{canal.texto}</span>
              {canal.digitadoPor && <small className="fonte-dado">assina tambem: {canal.digitadoPor}</small>}
            </button>
          ))}
        </div>
      } />
  );
}
