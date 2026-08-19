'use client';

/* Portado de `telaCatadorDisponiveis` em `src/telas/catador.js`. */

import { useRouter } from 'next/navigation';
import { Aviso, Cabecalho } from '@/components/ui/Basicos';
import { ListaDemandas } from '@/components/ui/Listas';
import { FaixaCatador } from '@/components/catador/FaixaCatador';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { Store } from '@/lib/dominio/store';
import { useDominio } from '@/state/hooks';

export default function PaginaCatadorDisponiveis() {
  useDominio();
  const router = useRouter();
  const disponiveis = Store.disponiveis();
  const p = Painel.catador(Sessao.catador.id);

  return (
    <>
      <Cabecalho titulo="Demandas disponíveis" texto="Escolha o que cabe na sua rota. Aceitar é decisão sua." />
      <FaixaCatador />
      {p.cooperativa && <Aviso titulo="Fila compartilhada" texto={`Estas demandas estão abertas para toda a rede — cooperados da ${p.cooperativa.nome} e catadores autônomos.`} />}
      <ListaDemandas demandas={disponiveis} visao="catador"
        vazioTitulo="Nenhuma demanda aberta agora" vazioTexto="Assim que um gerador publicar, ela aparece aqui."
        aoAbrir={id => router.push(`/catador/demandas/${id}`)} />
    </>
  );
}
