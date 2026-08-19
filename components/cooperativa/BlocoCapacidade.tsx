'use client';

/* Capacidade instalada contra o que está vindo. Portado de `blocoCapacidade`
   em `src/telas/destinatario.js`. */

import { Cartao, Kpi, Kpis } from '@/components/ui/Basicos';
import { Catalogo } from '@/lib/dominio/catalogo';
import { Fmt, somar } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';

export function BlocoCapacidade({ p }: { p: ReturnType<typeof Painel.destino> }) {
  const unidade = Catalogo.destino(Sessao.destino.id)!;
  const capacidade = unidade.capacidadeDiaria || 0;
  const aCaminho = somar(p.aCaminho, d => d.coletadoKg || d.estimadoKg || 0);
  if (!capacidade) return null;

  const ocupacao = (aCaminho / capacidade) * 100;
  const tom = ocupacao >= 100 ? 'erro' : ocupacao >= 75 ? 'alerta' : 'ok';

  return (
    <Cartao titulo="Capacidade do dia" sub={`${unidade.tipo} · licença ${unidade.licenca}`}
      classe={tom === 'erro' ? 'acao-viva' : ''}
      nota={ocupacao >= 100
        ? 'A fila já supera o que a unidade consegue triar em um dia. Aceitar mais carga agora significa material parado, contaminação e mais rejeito.'
        : 'A capacidade é declarada pela própria unidade e deve ser medida no piloto: é ela que limita quanto trabalho o sistema pode prometer.'}
      corpo={
        <>
          <Kpis>
            <Kpi rotulo="Capacidade diária" valor={Fmt.kg(capacidade)} sub="declarada no cadastro da unidade" />
            <Kpi rotulo="A caminho agora" valor={Fmt.kg(aCaminho)} sub={`${p.aCaminho.length} carga(s) na fila`} tom={tom} />
            <Kpi rotulo="Ocupação prevista" valor={Fmt.percentual(ocupacao, 0)} sub="do que a unidade tria por dia" tom={tom} />
          </Kpis>
          <div className="barra-capacidade" role="img" aria-label={`Ocupação prevista de ${Fmt.percentual(ocupacao, 0)}`}>
            <i className={tom} style={{ width: `${Math.min(100, ocupacao).toFixed(1)}%` }}></i>
          </div>
        </>
      } />
  );
}
