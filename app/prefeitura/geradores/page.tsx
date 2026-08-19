'use client';

/* Portado de `telaPrefeituraGeradores` em `src/telas/prefeitura.js`. */

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Cabecalho, Exportar, Filtros, Kpi, Kpis } from '@/components/ui/Basicos';
import { ListaGeradores } from '@/components/ui/Listas';
import { useExportar } from '@/components/relatorio/useExportar';
import { Fmt, somar } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { useDominio } from '@/state/hooks';

type Gerador = ReturnType<typeof Painel.geradores>[number];
type Filtro = 'atencao' | 'irregular' | 'regularizacao' | 'regular' | 'todos';

const GRUPOS: Record<Filtro, (g: Gerador) => boolean> = {
  atencao: g => g.situacao.id !== 'REGULAR',
  irregular: g => g.situacao.id === 'IRREGULAR',
  regularizacao: g => g.situacao.id === 'EM_REGULARIZACAO',
  regular: g => g.situacao.id === 'REGULAR',
  todos: () => true
};

function Conteudo() {
  useDominio();
  const router = useRouter();
  const busca = useSearchParams();
  const { aoCsv, aoPdf } = useExportar();
  const filtro = (busca.get('filtro') as Filtro) || 'atencao';
  const geradores = Painel.geradores();

  return (
    <>
      <Cabecalho titulo="Grandes geradores" texto="Situação regulatória calculada a partir do PGRS, das pendências e da última destinação comprovada."
        acao={<Exportar escopo="prefeitura" aoCsv={aoCsv} aoPdf={aoPdf} />} />

      <Kpis>
        <Kpi rotulo="Irregulares" valor={geradores.filter(GRUPOS.irregular).length} sub="sem PGRS válido ou sem destinar" tom="erro" />
        <Kpi rotulo="Em regularização" valor={geradores.filter(GRUPOS.regularizacao).length} sub="com prazo ou pendência a resolver" tom="alerta" />
        <Kpi rotulo="Regulares" valor={geradores.filter(GRUPOS.regular).length} sub="com plano válido e destinação em dia" tom="ok" />
        <Kpi rotulo="Massa dos irregulares" valor={Fmt.toneladas(somar(geradores.filter(GRUPOS.irregular), 'massa'))} sub="já destinada com prova" />
      </Kpis>

      <Filtros todas={geradores} grupos={GRUPOS} atual={filtro}
        rotulos={[['atencao', 'Precisam de atenção'], ['irregular', 'Irregulares'], ['regularizacao', 'Em regularização'], ['regular', 'Regulares'], ['todos', 'Todos']]}
        aoEscolher={f => router.push(`/prefeitura/geradores?filtro=${f}`)} />

      <ListaGeradores geradores={geradores.filter(GRUPOS[filtro] || GRUPOS.todos)} aoAbrir={id => router.push(`/prefeitura/geradores/${id}`)} />
    </>
  );
}

export default function PaginaPrefeituraGeradores() {
  return <Suspense fallback={null}><Conteudo /></Suspense>;
}
