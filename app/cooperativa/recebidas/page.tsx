'use client';

/* Portado de `telaDestinoRecebidas` em `src/telas/destinatario.js`. */

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Cabecalho, Cartao, Exportar, Filtros, Vazio } from '@/components/ui/Basicos';
import { useExportar } from '@/components/relatorio/useExportar';
import { Catalogo } from '@/lib/dominio/catalogo';
import { DemandaRegras as Demanda } from '@/lib/dominio/demanda';
import { Fmt, mesmoDia } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import type { Demanda as TDemanda } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

type Filtro = 'todas' | 'hoje' | 'pendentes' | 'comprovadas';

const GRUPOS: Record<Filtro, (d: TDemanda) => boolean> = {
  todas: () => true,
  hoje: d => mesmoDia(d.recebidaEm),
  pendentes: d => d.status === 'PENDENCIA',
  comprovadas: d => d.status === 'COMPROVADA'
};

function Conteudo() {
  useDominio();
  const router = useRouter();
  const busca = useSearchParams();
  const { aoCsv, aoPdf } = useExportar();
  const filtro = (busca.get('filtro') as Filtro) || 'todas';
  const p = Painel.destino(Sessao.destino.id);
  const lista = p.recebidasTodas.filter(GRUPOS[filtro] || GRUPOS.todas);

  return (
    <>
      <Cabecalho titulo="Cargas recebidas" texto="Tudo que passou pela balança desta unidade, com lote, origem e destino do material."
        acao={<Exportar escopo="destinatario" aoCsv={e => aoCsv(e, { id: Sessao.destino.id })} aoPdf={e => aoPdf(e, { id: Sessao.destino.id })} />} />
      <Filtros todas={p.recebidasTodas} grupos={GRUPOS} atual={filtro}
        rotulos={[['todas', 'Todas'], ['hoje', 'Hoje'], ['comprovadas', 'Comprovadas'], ['pendentes', 'Pendentes']]}
        aoEscolher={f => router.push(`/cooperativa/recebidas?filtro=${f}`)} />

      {lista.length ? (
        <Cartao titulo="Registro de recebimento" sub={`${lista.length} carga(s)`}
          nota="Cada linha guarda o peso do catador e o peso da balança. Nenhum dos dois é apagado."
          corpo={
            <div className="tabela-rolagem">
              <table className="tabela">
                <thead><tr>
                  <th>Lote</th><th>Data/hora</th><th>Tipo de resíduo</th><th>Origem</th>
                  <th className="dir">Peso</th><th className="dir">Recuperado</th><th className="dir">Rejeito</th>
                  <th>Destino do material</th><th>Comprovante</th>
                </tr></thead>
                <tbody>
                  {lista.map(d => (
                    <tr key={d.id} tabIndex={0} onClick={() => router.push(`/cooperativa/demandas/${d.id}`)}>
                      <td className="mono">{d.lote || '—'}</td>
                      <td>{Fmt.dataHora(d.recebidaEm)}</td>
                      <td><span className="ponto-material" style={{ background: Catalogo.corResiduo(d.residuo) }}></span>{Catalogo.nomeResiduo(d.residuo)}</td>
                      <td>{d.gerador.nome}<small>{d.catador ? d.catador.nome : '—'}</small></td>
                      <td className="dir num">{Fmt.kg(d.verificadoKg)}</td>
                      <td className="dir num">{Fmt.kg(Demanda.reciclado(d))}</td>
                      <td className="dir num">{Fmt.kg(Demanda.rejeito(d))}</td>
                      <td>{Demanda.destinoFinal(d)}</td>
                      <td className="mono">{d.comprovante ? d.comprovante.codigo : <span className="alerta">pendência</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          } />
      ) : <Vazio titulo="Nenhuma carga neste filtro" texto="Confirme uma carga da fila para começar o histórico." />}
    </>
  );
}

export default function PaginaCooperativaRecebidas() {
  return <Suspense fallback={null}><Conteudo /></Suspense>;
}
