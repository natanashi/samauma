'use client';

/* Portado de `telaCatadorMinhas` em `src/telas/catador.js`. */

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Cabecalho, Cartao, Exportar, Filtros } from '@/components/ui/Basicos';
import { ListaComprovantes, ListaDemandas } from '@/components/ui/Listas';
import { FaixaCatador } from '@/components/catador/FaixaCatador';
import { useExportar } from '@/components/relatorio/useExportar';
import { useComprovante } from '@/components/comprovante/ComprovanteProvider';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import type { Demanda } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

type Filtro = 'andamento' | 'comprovadas' | 'todas';

const GRUPOS: Record<Filtro, (d: Demanda) => boolean> = {
  andamento: d => d.status !== 'COMPROVADA',
  comprovadas: d => d.status === 'COMPROVADA',
  todas: () => true
};

function Conteudo() {
  useDominio();
  const router = useRouter();
  const busca = useSearchParams();
  const { aoCsv, aoPdf } = useExportar();
  const { abrir } = useComprovante();
  const filtro = (busca.get('filtro') as Filtro) || 'andamento';
  const p = Painel.catador(Sessao.catador.id);

  return (
    <>
      <Cabecalho titulo="Minhas coletas" texto="O que você aceitou, o que está em campo e o que já virou comprovante."
        acao={<Exportar escopo="catador" aoCsv={e => aoCsv(e, { id: Sessao.catador.id })} aoPdf={e => aoPdf(e, { id: Sessao.catador.id })} />} />
      <FaixaCatador />
      <Filtros todas={p.demandas} grupos={GRUPOS} atual={filtro}
        rotulos={[['andamento', 'Em andamento'], ['comprovadas', 'Comprovadas'], ['todas', 'Todas']]}
        aoEscolher={f => router.push(`/catador/minhas?filtro=${f}`)} />
      <ListaDemandas demandas={p.demandas.filter(GRUPOS[filtro] || GRUPOS.todas)} visao="catador"
        vazioTitulo="Nenhuma coleta neste filtro" vazioTexto="Aceite uma demanda disponível para começar."
        aoAbrir={id => router.push(`/catador/demandas/${id}`)} />

      <Cartao titulo="Meus comprovantes" sub={`${p.atendimentos} atendimento(s) com prova emitida`}
        corpo={<ListaComprovantes demandas={p.comprovantes} visao="catador" aoVer={abrir} />} />
    </>
  );
}

export default function PaginaCatadorMinhas() {
  return <Suspense fallback={null}><Conteudo /></Suspense>;
}
