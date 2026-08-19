'use client';

/* Portado de `telaDestinoFila` em `src/telas/destinatario.js`. */

import { useRouter } from 'next/navigation';
import { Aviso, Cabecalho } from '@/components/ui/Basicos';
import { ListaDemandas } from '@/components/ui/Listas';
import { BlocoCapacidade } from '@/components/cooperativa/BlocoCapacidade';
import { FaixaPerfil } from '@/components/ui/Basicos';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { useDominio } from '@/state/hooks';

function FaixaDestino({ p }: { p: ReturnType<typeof Painel.destino> }) {
  return (
    <FaixaPerfil nome={p.unidade.nome} papel={`${p.unidade.tipo} · licença ${p.unidade.licenca}`}
      medidas={[
        [p.aCaminho.length, 'a caminho'],
        [Fmt.kg(p.esperado), 'esperados'],
        [Fmt.kg(p.recebidoHoje), 'recebidos hoje'],
        [Fmt.toneladas(p.massa), 'total confirmado']
      ]} />
  );
}

export default function PaginaCooperativaFila() {
  useDominio();
  const router = useRouter();
  const p = Painel.destino(Sessao.destino.id);

  return (
    <>
      <Cabecalho titulo="Cargas a caminho" texto="Confirme o peso da balança. É essa confirmação que fecha o ciclo e emite o comprovante." />
      <FaixaDestino p={p} />
      <BlocoCapacidade p={p} />
      {p.aCaminho.length > 0 && (
        <Aviso titulo="O que fazer com cada carga"
          texto="Abra a carga, informe a massa da balança e quanto do material é rejeito. O sistema compara com o peso do catador e emite o comprovante — ou abre pendência para a Prefeitura." />
      )}
      <ListaDemandas demandas={p.aCaminho} visao="destinatario"
        vazioTitulo="Nenhuma carga a caminho" vazioTexto="Quando um catador finalizar uma coleta para esta unidade, ela entra nesta fila."
        aoAbrir={id => router.push(`/cooperativa/demandas/${id}`)} />
    </>
  );
}
