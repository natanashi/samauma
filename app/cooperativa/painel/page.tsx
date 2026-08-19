'use client';

/* Portado de `telaDestinoPainel` em `src/telas/destinatario.js`. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Aviso, Cabecalho, Cartao, Kpi, Kpis, Vazio } from '@/components/ui/Basicos';
import { Anel, BarraRecuperacao, GraficoRosca, GraficoSerie, Ranking } from '@/components/ui/Graficos';
import { ListaDemandas } from '@/components/ui/Listas';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { useDominio } from '@/state/hooks';

export default function PaginaCooperativaPainel() {
  useDominio();
  const router = useRouter();
  const p = Painel.destino(Sessao.destino.id);
  const aterro = p.unidade.aterro;

  return (
    <>
      <Cabecalho titulo="Painel do destinatário" texto={`${p.unidade.nome} · ${p.unidade.tipo}`}
        acao={<Link href="/cooperativa/fila" className="btn">Receber {p.aCaminho.length} carga(s)</Link>} />

      <Kpis>
        <Kpi rotulo="Recebimentos de hoje" valor={p.recebidasHoje.length} sub={`${Fmt.kg(p.recebidoHoje)} pesados na balança`} tom="marca" destaque />
        <Kpi rotulo="Coletas aguardadas" valor={p.aCaminho.length} sub={`${Fmt.kg(p.esperado)} declarados pelos catadores`} tom={p.aCaminho.length ? 'alerta' : 'ok'} />
        <Kpi rotulo="Total confirmado" valor={Fmt.toneladas(p.massa)} sub={`${p.atendimentos} carga(s) com comprovante`} />
        <Kpi rotulo="Divergência média" valor={Fmt.percentual(p.divergenciaMedia)} sub="campo × balança desta unidade" />
      </Kpis>

      <div className="colunas dois-um">
        <Cartao titulo="Entrada de material" sub="Massa confirmada nesta unidade, dia a dia" corpo={<GraficoSerie serie={p.serie} separarRejeito={!aterro} />} />
        <Cartao titulo="Ocupação de hoje" sub="Balança contra capacidade instalada"
          corpo={<>
            <Anel valor={p.ocupacao} rotulo="da capacidade" tom="teal" nota={`${Fmt.kg(p.recebidoHoje)} de ${Fmt.kg(p.unidade.capacidadeDiaria)} hoje`} />
            <div className="micro-kpis">
              <div><b className="num">{Fmt.kg(Math.round(p.ambiental.co2Evitado))}</b><span>CO₂e evitado</span></div>
              <div><b className="num">{Fmt.reais(p.financeiro.valor)}</b><span>valor do material</span></div>
            </div>
          </>} />
      </div>

      <Cartao titulo="Destino dado ao material" sub={p.unidade.destinoFinal}
        nota="O rejeito declarado aqui é o que a triagem não conseguiu aproveitar e segue para o aterro sanitário."
        corpo={aterro ? (
          <>
            <Aviso titulo="Esta unidade é disposição final" texto="Tudo que entra aqui é contabilizado como massa aterrada. É o fim do ciclo para o material — e o número que a Prefeitura precisa acompanhar." />
            <Kpis>
              <Kpi rotulo="Massa aterrada" valor={Fmt.toneladas(p.ambiental.rejeito)} sub="em célula licenciada" tom="alerta" />
              <Kpi rotulo="Cargas recebidas" valor={p.atendimentos} sub="com comprovante emitido" />
              <Kpi rotulo="Origem principal" valor={p.origens.length ? p.origens[0].nome : '—'} sub={p.origens.length ? Fmt.percentual(p.origens[0].parte, 0) + ' do total' : ''} />
            </Kpis>
          </>
        ) : (
          <>
            <BarraRecuperacao ambiental={p.ambiental} />
            <div className="micro-kpis">
              <div><b className="num">{Fmt.percentual(p.ambiental.taxaRecuperacao, 0)}</b><span>taxa de recuperação</span></div>
              <div><b className="num">{Fmt.kg(p.ambiental.rejeito)}</b><span>rejeito ao aterro</span></div>
              <div><b className="num">{Fmt.kg(p.ambiental.reciclado)}</b><span>voltou ao ciclo</span></div>
            </div>
          </>
        )} />

      <div className="colunas dois-um">
        <Cartao titulo="O que entra nesta unidade" sub="Composição por material" corpo={<GraficoRosca itens={p.materiais} />} />
        <Cartao titulo="De quem vem" sub="Origem do material recebido" corpo={<Ranking itens={p.origens.map(o => ({ ...o, nota: o.n + ' carga(s)' }))} />} />
      </div>

      <Cartao titulo="Fila de recebimento" sub={p.aCaminho.length ? 'Cargas que já saíram e ainda não passaram pela balança' : 'Nenhuma carga a caminho'}
        acao={<Link href="/cooperativa/fila" className="btn sec">Abrir fila</Link>}
        corpo={p.aCaminho.length
          ? <ListaDemandas demandas={p.aCaminho.slice(0, 5)} visao="destinatario" aoAbrir={id => router.push(`/cooperativa/demandas/${id}`)} />
          : <Vazio titulo="Nada a caminho" texto="Quando um catador fechar uma carga para esta unidade, ela aparece aqui." />} />
    </>
  );
}
