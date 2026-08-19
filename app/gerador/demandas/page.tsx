'use client';

/* Portado de `telaGeradorDemandas` em `src/telas/gerador.js`. */

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Cabecalho, Exportar, Filtros } from '@/components/ui/Basicos';
import { ListaDemandas } from '@/components/ui/Listas';
import { useExportar } from '@/components/relatorio/useExportar';
import { EM_CURSO } from '@/lib/dominio/catalogo';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import type { Demanda } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

type Filtro = 'todas' | 'andamento' | 'rascunhos' | 'pendencias' | 'comprovadas';

const GRUPOS: Record<Filtro, (d: Demanda) => boolean> = {
  todas: () => true,
  andamento: d => EM_CURSO.includes(d.status),
  rascunhos: d => d.status === 'CRIADA',
  pendencias: d => d.status === 'PENDENCIA',
  comprovadas: d => d.status === 'COMPROVADA'
};

function Conteudo() {
  useDominio();
  const router = useRouter();
  const busca = useSearchParams();
  const { aoCsv, aoPdf } = useExportar();
  const filtro = (busca.get('filtro') as Filtro) || 'todas';

  const p = Painel.gerador(Sessao.gerador);

  return (
    <>
      <Cabecalho titulo="Minhas demandas" texto="Cada linha é um pedido de destinação, do rascunho ao comprovante."
        acao={<><Link href="/gerador/nova" className="btn">Nova demanda</Link>
          <Exportar escopo="gerador" aoCsv={e => aoCsv(e, { id: Sessao.gerador })} aoPdf={e => aoPdf(e, { id: Sessao.gerador })} /></>} />
      <Filtros todas={p.demandas} grupos={GRUPOS} atual={filtro}
        rotulos={[['todas', 'Todas'], ['andamento', 'Em andamento'], ['rascunhos', 'Rascunhos'], ['pendencias', 'Pendências'], ['comprovadas', 'Comprovadas']]}
        aoEscolher={f => router.push(`/gerador/demandas?filtro=${f}`)} />
      <ListaDemandas demandas={p.demandas.filter(GRUPOS[filtro] || GRUPOS.todas)} visao="gerador"
        vazioTitulo="Nenhuma demanda neste filtro" vazioTexto="Crie uma demanda informando resíduo, quantidade, local e prazo."
        aoAbrir={id => router.push(`/gerador/demandas/${id}`)} />
    </>
  );
}

export default function PaginaGeradorDemandas() {
  return <Suspense fallback={null}><Conteudo /></Suspense>;
}
