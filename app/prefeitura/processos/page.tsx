'use client';

/* Portado de `telaProcessos` em `src/telas/prefeitura.js`. */

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Cabecalho, Exportar, Filtros } from '@/components/ui/Basicos';
import { ListaDemandas } from '@/components/ui/Listas';
import { useExportar } from '@/components/relatorio/useExportar';
import { Store } from '@/lib/dominio/store';
import type { Demanda } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

type Filtro = 'todas' | 'andamento' | 'transporte' | 'pendentes' | 'comprovadas';

const GRUPOS: Record<Filtro, (d: Demanda) => boolean> = {
  todas: () => true,
  andamento: d => ['DISPONIVEL', 'ACEITA', 'EM_COLETA'].includes(d.status),
  transporte: d => d.status === 'COLETADA',
  pendentes: d => d.status === 'PENDENCIA',
  comprovadas: d => d.status === 'COMPROVADA'
};

function Conteudo() {
  useDominio();
  const router = useRouter();
  const busca = useSearchParams();
  const { aoCsv, aoPdf } = useExportar();
  const filtro = (busca.get('filtro') as Filtro) || 'todas';
  const todas = Store.todas();

  return (
    <>
      <Cabecalho titulo="Processos" texto="Cada linha é uma demanda de destinação, do cadastro ao comprovante."
        acao={<Exportar escopo="prefeitura" aoCsv={aoCsv} aoPdf={aoPdf} />} />
      <Filtros todas={todas} grupos={GRUPOS} atual={filtro}
        rotulos={[['todas', 'Todas'], ['andamento', 'Em coleta'], ['transporte', 'A caminho'], ['pendentes', 'Pendentes'], ['comprovadas', 'Comprovadas']]}
        aoEscolher={f => router.push(`/prefeitura/processos?filtro=${f}`)} />
      <ListaDemandas demandas={todas.filter(GRUPOS[filtro] || GRUPOS.todas)}
        vazioTitulo="Nenhum processo neste filtro" vazioTexto="Ajuste o filtro para ver outras situações."
        aoAbrir={id => router.push(`/prefeitura/demandas/${id}`)} />
    </>
  );
}

export default function PaginaProcessos() {
  return <Suspense fallback={null}><Conteudo /></Suspense>;
}
