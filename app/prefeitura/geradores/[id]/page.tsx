'use client';

/* Portado de `telaGeradorFicha` em `src/telas/prefeitura.js`. */

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Cabecalho, Cartao, Kpi, Kpis, Pares, SituacaoGerador, Vazio } from '@/components/ui/Basicos';
import { GraficoRosca, GraficoSerie } from '@/components/ui/Graficos';
import { ListaDemandas } from '@/components/ui/Listas';
import { Fmt } from '@/lib/dominio/formato';
import { Catalogo } from '@/lib/dominio/catalogo';
import { Painel } from '@/lib/dominio/indicadores';
import { useDominio } from '@/state/hooks';

export default function PaginaFichaGerador({ params }: { params: Promise<{ id: string }> }) {
  useDominio();
  const router = useRouter();
  const { id } = use(params);

  if (!Catalogo.gerador(id)) return <Vazio titulo="Gerador não encontrado" texto="Ele pode ter sido removido ao reiniciar a demonstração." />;

  const p = Painel.gerador(id);
  const s = p.situacao;

  return (
    <>
      <button className="voltar" onClick={() => router.back()}>Voltar</button>

      <Cabecalho titulo={p.cadastro.nome} texto={`${p.cadastro.ramo} · CNPJ ${p.cadastro.cnpj} · ${Catalogo.endereco(p.cadastro.ponto)}`}
        acao={<SituacaoGerador situacao={s} />} />

      <Kpis>
        <Kpi rotulo="Massa destinada" valor={Fmt.toneladas(p.ambiental.massa)} sub={`${p.comprovadas} comprovante(s)`} tom="marca" />
        <Kpi rotulo="Taxa de recuperação" valor={Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} sub="do que saiu deste gerador" tom="ok" />
        <Kpi rotulo="Em andamento" valor={p.emAberto + p.emTransporte} sub="demandas em campo" />
        <Kpi rotulo="Pendências" valor={p.pendencias} sub="aguardando conciliação" tom={p.pendencias ? 'erro' : 'ok'} />
      </Kpis>

      <div className="colunas dois-um">
        <Cartao titulo="Por que esta situação" sub={s.rotulo} classe={s.id === 'REGULAR' ? 'acao-viva bom' : 'destaque-erro'}
          corpo={
            <>
              <ul className="motivos">{s.motivos.map((m, i) => <li key={i}>{m}</li>)}</ul>
              <Pares itens={[
                ['PGRS', s.pgrs ? s.pgrs.numero : 'não cadastrado'],
                ['Validade', s.pgrs ? Fmt.data(s.pgrs.validade) : '—'],
                ['Última destinação', s.ultimaDestinacao ? Fmt.data(s.ultimaDestinacao) : 'nunca'],
                ['Operador contratado', p.operador ? p.operador.nome : 'sem operador'],
                ['Volume declarado', Fmt.kg(p.cadastro.volumeMes) + ' / mês'],
                ['Aderência ao declarado', Fmt.percentual(p.aderencia ? p.aderencia.parte : null, 0)]
              ]} />
            </>
          } />
        <Cartao titulo="Composição" sub="O que este gerador destina" corpo={<GraficoRosca itens={p.materiais} />} />
      </div>

      <Cartao titulo="Destinação dia a dia" sub="Últimos 14 dias" corpo={<GraficoSerie serie={p.serie} />} />

      <Cartao titulo="Processos deste gerador" sub={`${p.total} demanda(s)`}
        corpo={<ListaDemandas demandas={p.demandas.slice(0, 10)} aoAbrir={did => router.push(`/prefeitura/demandas/${did}`)} />} />
    </>
  );
}
