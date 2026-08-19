'use client';

/* Portado de `telaPrefeituraPainel` + `blocoPendencias` em `src/telas/prefeitura.js`. */

import { useRouter } from 'next/navigation';
import { Marca, Cartao, Aviso } from '@/components/ui/Basicos';
import { BarraRecuperacao, Ranking } from '@/components/ui/Graficos';
import { ListaDemandas } from '@/components/ui/Listas';
import { MapaDinamico as Mapa } from '@/components/mapa/MapaDinamico';
import { AtividadesRecentes, TabelaGeradores } from '@/components/prefeitura/AtividadesTabela';
import { GraficoConformidade, IconePainel, IndicadorPainel, KpiPainel } from '@/components/prefeitura/PainelPecas';
import { IntegracaoContratos } from '@/components/prefeitura/IntegracaoContratos';
import { COOPERATIVAS, TARIFA_ATERRO } from '@/lib/dominio/catalogo';
import { Fmt, somar } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Store } from '@/lib/dominio/store';
import { useDominio } from '@/state/hooks';

export default function PaginaPrefeituraPainel() {
  useDominio();
  const router = useRouter();
  const p = Painel.municipio();
  const totalGeradores = p.geradores.length;
  const regularizados = p.geradores.filter(g => g.situacao.id === 'REGULAR').length;
  const cooperativasAtivas = p.cooperativas.filter(c => !c.autonomos).length;

  const semana = p.serie.slice(-7);
  const semanaAnterior = p.serie.slice(0, 7);
  const recicladoSemana = somar(semana, 'reciclado');
  const recicladoSemanaAnterior = somar(semanaAnterior, 'reciclado');
  const variacaoTonelada = recicladoSemanaAnterior ? ((recicladoSemana - recicladoSemanaAnterior) / recicladoSemanaAnterior) * 100 : null;
  const economiaSemana = (recicladoSemana / 1000) * TARIFA_ATERRO;
  const economiaSemanaAnterior = (recicladoSemanaAnterior / 1000) * TARIFA_ATERRO;
  const variacaoEconomia = economiaSemanaAnterior ? ((economiaSemana - economiaSemanaAnterior) / economiaSemanaAnterior) * 100 : null;

  const pendencias = Store.pendentes();

  return (
    <>
      <div className="painel-topo">
        <div>
          <h1>Visão geral</h1>
          <p>Acompanhe os principais indicadores e atividades do sistema.</p>
        </div>
        <div className="painel-topo-acoes">
          <span className="chip">Porto Velho / RO</span>
          <span className="chip">{p.serie[0].rotulo} – {p.serie[p.serie.length - 1].rotulo}</span>
        </div>
      </div>

      <div className="painel-kpis">
        <KpiPainel icone="predio" cor="var(--azul)" rotulo="Geradores regularizados" valor={regularizados} sub={`de ${totalGeradores} cadastrados`} />
        <KpiPainel icone="tonelada" cor="var(--ouro-fundo)" rotulo="Toneladas desviadas de aterro" valor={Fmt.toneladas(p.ambiental.reciclado)} variacao={variacaoTonelada} pontos={semana.map(d => d.reciclado)} />
        <KpiPainel icone="moeda" cor="var(--ok)" rotulo="Economia realizada" valor={Fmt.reais(p.financeiro.custoAterroEvitado)} variacao={variacaoEconomia} pontos={semana.map(d => d.reciclado)} />
        <KpiPainel icone="grupo" cor="var(--raiz)" rotulo="Cooperativas ativas" valor={cooperativasAtivas} sub={`de ${COOPERATIVAS.length} cadastradas`} />
        <KpiPainel icone="recibo" cor="var(--teal)" rotulo="Comprovantes emitidos" valor={p.comprovadas} sub={`${p.pendentes} pendência(s) em aberto`} />
      </div>

      <Cartao titulo="Para onde vai o resíduo do município" sub="Massa comprovada, separada entre o que voltou ao ciclo e o que foi aterrado"
        nota="Massa coletada não é massa reciclada: o rejeito da triagem e o resíduo indiferenciado seguem para o aterro sanitário."
        corpo={
          <>
            <BarraRecuperacao ambiental={p.ambiental} />
            <div className="micro-kpis">
              <div><b className="num">{Fmt.toneladas(p.ambiental.massaAterrada)}</b><span>enviada direto ao aterro</span></div>
              <div><b className="num">{p.ambiental.cargasAterro}</b><span>cargas de rejeito</span></div>
              <div><b className="num">{Fmt.kg(Math.round(p.ambiental.co2Evitado))}</b><span>CO₂e evitado</span></div>
            </div>
          </>
        } />

      <div className="colunas painel-linha">
        <Cartao titulo="Mapa de geradores" sub="Situação regulatória por ponto de coleta"
          acao={<button className="btn sec sm" onClick={() => router.push('/prefeitura/mapa')}>Ver todos</button>}
          corpo={<Mapa itens={p.geradores} aoClicar={id => router.push(`/prefeitura/geradores/${id}`)} />} />
        <Cartao titulo="Conformidade ao longo do tempo" sub={`Últimos ${p.serie.length} dias`} corpo={<GraficoConformidade serie={p.serie} />} />
        <Cartao titulo="Atividades recentes"
          acao={<button className="btn sec sm" onClick={() => router.push('/prefeitura/processos')}>Ver todas</button>}
          corpo={<AtividadesRecentes demandas={Store.todas()} />} />
      </div>

      <Cartao titulo="Indicadores principais" sub="Sem número digitado — tudo deriva das demandas registradas"
        corpo={
          <div className="indicadores-painel">
            <IndicadorPainel icone="crescer" cor="var(--ok)" rotulo="Taxa de comprovação" valor={Fmt.percentual(p.taxaComprovacao, 0)} sub="do que foi criado" />
            <IndicadorPainel icone="relogio" cor="var(--azul)" rotulo="Ciclo médio" valor={Fmt.duracao(p.cicloMedio)} sub="da criação ao comprovante" />
            <IndicadorPainel icone="caminhao" cor="var(--ouro-fundo)" rotulo="Demandas em andamento" valor={p.emAndamento} sub={`${p.emTransporte} a caminho`} />
            <IndicadorPainel icone="balanca" cor="var(--teal)" rotulo="Divergência média" valor={Fmt.percentual(p.divergenciaMedia)} sub="campo × balança" />
            <IndicadorPainel icone="moeda" cor="var(--raiz)" rotulo="Renda gerada p/ cooperados" valor={Fmt.reais(p.social.rendaCooperados)} sub={`${p.social.cooperados} catador(es)`} />
            <IndicadorPainel icone="pessoa" cor="var(--lima)" rotulo="Renda média por catador" valor={Fmt.reais(p.social.rendaMediaPorCatador)} sub={`${p.social.catadoresAtivos} ativos`} />
          </div>
        } />

      <div className="colunas dois-um">
        <Cartao titulo="Maiores geradores" sub="Por massa destinada com prova"
          acao={<button className="btn sec sm" onClick={() => router.push('/prefeitura/geradores')}>Ver todos</button>}
          corpo={<TabelaGeradores geradores={p.geradores} />} />
        <Cartao titulo="Desempenho das cooperativas" sub="Massa comprovada no período"
          corpo={<Ranking itens={p.cooperativas.filter(c => !c.autonomos).slice().sort((a, b) => b.massa - a.massa)
            .map(c => ({ ...c, nota: `${c.catadores} catador(es) · ${c.atendimentos} atendimento(s)` }))} />} />
      </div>

      {pendencias.length ? (
        <Cartao titulo="Onde existe problema" sub={`${pendencias.length} divergência(s) acima da tolerância`} classe="destaque-erro"
          nota="Divergência não é punição: o sistema mantém os dois registros e pede uma decisão humana."
          corpo={<ListaDemandas demandas={pendencias} aoAbrir={id => router.push(`/prefeitura/demandas/${id}`)} />} />
      ) : (
        <Cartao titulo="Pendências" corpo={<Aviso tom="bom" titulo="Sem divergências abertas" texto="Todas as cargas fecharam dentro da tolerância." />} />
      )}

      <IntegracaoContratos />

      <div className="painel-rodape">
        <span><IconePainel nome="grupo" cor="var(--ok)" /> Ambiente demonstrativo — dados fictícios para fins de apresentação.</span>
        <span className="painel-rodape-marca">Sistema SAMAÚMA · Desenvolvido para gestão inteligente de resíduos <Marca tamanho={28} /></span>
      </div>
    </>
  );
}
