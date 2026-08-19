/* SAMAÚMA — atividades recentes e maiores geradores. Portado de
   `atividadesRecentes` / `tabelaGeradores` em `src/telas/prefeitura.js`. */

'use client';

import { useRouter } from 'next/navigation';
import { SituacaoGerador, Vazio } from '@/components/ui/Basicos';
import { Fmt, haDias, mesmoDia } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import type { Demanda } from '@/lib/dominio/tipos';

export function AtividadesRecentes({ demandas, limite = 6 }: { demandas: Demanda[]; limite?: number }) {
  const eventos = demandas.flatMap(d => d.eventos)
    .sort((a, b) => new Date(b.quando).getTime() - new Date(a.quando).getTime())
    .slice(0, limite);
  if (!eventos.length) return <Vazio titulo="Sem atividade ainda" texto="As primeiras demandas ainda não geraram eventos." />;

  const quando = (iso: string) => mesmoDia(iso) ? `Hoje, ${Fmt.hora(iso)}`
    : mesmoDia(iso, new Date(haDias(1))) ? `Ontem, ${Fmt.hora(iso)}`
      : Fmt.dataHora(iso);

  return (
    <ol className="trilha">
      {eventos.map((ev, i) => (
        <li key={i} data-autor={ev.autor}>
          <span className="quando">{quando(ev.quando)}</span>
          <b>{ev.titulo}</b>
          <p>{ev.detalhe.split(' · ')[0]}</p>
        </li>
      ))}
    </ol>
  );
}

export function TabelaGeradores({ geradores, limite = 6 }: { geradores: ReturnType<typeof Painel.geradores>; limite?: number }) {
  const router = useRouter();
  const maiores = geradores.slice().sort((a, b) => b.massa - a.massa).slice(0, limite);
  if (!maiores.length) return <Vazio titulo="Sem destinação comprovada ainda" texto="Os maiores geradores aparecem quando o primeiro ciclo fechar." />;
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead><tr><th>Estabelecimento</th><th>Ramo</th><th>Massa destinada</th><th>Situação</th></tr></thead>
        <tbody>
          {maiores.map(g => (
            <tr key={g.id} tabIndex={0} onClick={() => router.push(`/prefeitura/geradores/${g.id}`)}>
              <td><b>{g.nome}</b></td>
              <td>{g.ramo}</td>
              <td className="num">{Fmt.kg(g.massa)}</td>
              <td><SituacaoGerador situacao={g.situacao} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
