'use client';

/* Portado de `telaPrefeituraMapa` em `src/telas/prefeitura.js`. */

import { useRouter } from 'next/navigation';
import { Cabecalho, Cartao, Kpi, Kpis } from '@/components/ui/Basicos';
import { Ranking } from '@/components/ui/Graficos';
import { ListaPontos } from '@/components/ui/Pontos';
import { MapaDinamico as Mapa } from '@/components/mapa/MapaDinamico';
import { PONTOS } from '@/lib/dominio/catalogo';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { useDominio } from '@/state/hooks';

export default function PaginaPrefeituraMapa() {
  useDominio();
  const router = useRouter();
  const p = Painel.municipio();

  return (
    <>
      <Cabecalho titulo="Mapa dos grandes geradores" texto="Cada círculo é um ponto de coleta; o tamanho é a massa destinada e a cor é a situação regulatória." />

      <Kpis>
        <Kpi rotulo="Pontos com coleta" valor={p.pontos.length} sub={`de ${PONTOS.length} cadastrados`} tom="marca" />
        <Kpi rotulo="Bairros atendidos" valor={p.bairros.length} sub="com massa comprovada" />
        <Kpi rotulo="Zona com mais massa" valor={p.zonas.length ? p.zonas[0].nome : '—'} sub={p.zonas.length ? Fmt.percentual(p.zonas[0].parte, 0) + ' do total' : ''} />
        <Kpi rotulo="Geradores em atenção" valor={p.atencao.length} sub="fora do regular" tom={p.atencao.length ? 'erro' : 'ok'} />
      </Kpis>

      <Cartao titulo="Território" sub="Grandes geradores por ponto de coleta"
        nota="Coordenadas aproximadas de bairros reais de Porto Velho, para demonstrar a leitura territorial. Não são dados do geoportal da Prefeitura."
        corpo={<Mapa itens={p.geradores} aoClicar={id => router.push(`/prefeitura/geradores/${id}`)} />} />

      <div className="colunas dois-um">
        <Cartao titulo="Pontos de coleta" sub="Massa comprovada por ponto" corpo={<ListaPontos pontos={p.pontos} />} />
        <Cartao titulo="Zonas da cidade" sub="Distribuição territorial" corpo={<Ranking itens={p.zonas.map(z => ({ ...z, nota: z.n + ' carga(s)' }))} />} />
      </div>
    </>
  );
}
