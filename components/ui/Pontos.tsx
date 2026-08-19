/* SAMAÚMA — lista de pontos de coleta com massa e participação, a leitura do
   mapa em texto. Portado de `src/ui/mapa.js` (`listaPontos`). */

import { Fmt } from '@/lib/dominio/formato';
import { Vazio } from './Basicos';

interface ItemPonto { nome: string; bairro: string; zona: string; massa: number; reciclado: number; n: number }

export function ListaPontos({ pontos }: { pontos: ItemPonto[] }) {
  if (!pontos.length) return <Vazio titulo="Nenhum ponto com coleta comprovada" texto="Os pontos aparecem quando o primeiro ciclo fechar." />;
  const maior = Math.max(...pontos.map(p => p.massa), 1);
  return (
    <ol className="pontos">
      {pontos.map((ponto, i) => (
        <li key={i}>
          <span className="dados">
            <span className="linha1"><b>{ponto.nome}</b><span className="num">{Fmt.kg(ponto.massa)}</span></span>
            <span className="trilho"><span className="preenche" style={{ ['--p' as string]: `${((ponto.massa / maior) * 100).toFixed(1)}%` }}></span></span>
            <span className="linha2">{ponto.bairro} · {ponto.zona} · {ponto.n} carga(s)
              <span className="num">recuperado {Fmt.percentual(ponto.massa ? (ponto.reciclado / ponto.massa) * 100 : 0, 0)}</span></span>
          </span>
        </li>
      ))}
    </ol>
  );
}
