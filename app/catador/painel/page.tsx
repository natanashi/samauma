'use client';

/* Portado de `telaCatadorPainel` + `blocoPosicao` em `src/telas/catador.js`. */

import { Aviso, Cabecalho, Cartao, Exportar, Kpi, Kpis, Pares } from '@/components/ui/Basicos';
import { Anel, GraficoRosca, GraficoSerie, Ranking } from '@/components/ui/Graficos';
import { useExportar } from '@/components/relatorio/useExportar';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { useDominio } from '@/state/hooks';

export default function PaginaCatadorPainel() {
  useDominio();
  const { aoCsv, aoPdf } = useExportar();
  const p = Painel.catador(Sessao.catador.id);
  const equipe = p.cooperativa ? Painel.cooperativa(p.cooperativa.id) : null;

  return (
    <>
      <Cabecalho titulo="Meu painel"
        texto={`${p.pessoa.nome} · ${p.cooperativa ? 'cooperado da ' + p.cooperativa.nome : 'catador autônomo'} · desde ${Fmt.data(p.pessoa.desde)}`}
        acao={<Exportar escopo="catador" aoCsv={e => aoCsv(e, { id: Sessao.catador.id })} aoPdf={e => aoPdf(e, { id: Sessao.catador.id })} />} />

      <Kpis>
        <Kpi rotulo="Valor gerado" valor={Fmt.reais(p.renda)} sub={`${p.atendimentos} atendimento(s) comprovado(s)`} tom="marca" destaque />
        <Kpi rotulo="Massa entregue" valor={Fmt.toneladas(p.massa)} sub="confirmada na balança do destino" />
        <Kpi rotulo="Na semana" valor={Fmt.kg(p.massaSemana)} sub="últimos 7 dias" variacao={p.variacaoSemana} />
        <Kpi rotulo="Minha posição" valor={p.posicao ? `${p.posicao}º` : '—'} sub={`entre ${p.totalCatadores} catadores cadastrados`} tom="ok" />
      </Kpis>

      <div className="colunas dois-um">
        <Cartao titulo="Minha semana" sub="Massa comprovada dia a dia" corpo={<GraficoSerie serie={p.serie} />} />
        <Cartao titulo="Minha meta" sub={`${Fmt.kg(p.meta)} por semana`}
          corpo={<>
            <Anel valor={p.metaAtingida} rotulo="da meta" tom="ouro" nota={`${Fmt.kg(p.massaSemana)} de ${Fmt.kg(p.meta)} nesta semana`} />
            <div className="micro-kpis">
              <div><b className="num">{Fmt.reais(p.rendaSemana)}</b><span>valor na semana</span></div>
              <div><b className="num">{Fmt.kg(Math.round(p.massaMedia || 0))}</b><span>média por coleta</span></div>
            </div>
          </>} />
      </div>

      <div className="colunas tres">
        <Cartao titulo="Meu desempenho" sub="Indicadores pessoais"
          nota="Precisão é o quanto o peso que você registrou bateu com a balança de quem recebeu."
          corpo={<Pares itens={[
            ['Precisão da pesagem', Fmt.percentual(p.precisao)],
            ['Valor médio por coleta', Fmt.reais(p.rendaMedia)],
            ['Dias com coleta comprovada', p.diasAtivos],
            ['Material que mais rende', p.melhorMaterial ? p.melhorMaterial.nome : '—'],
            ['CO₂e evitado por você', Fmt.kg(Math.round(p.co2))],
            ['Pendências abertas', p.pendencias]
          ]} />} />
        <Cartao titulo="O que eu coleto" sub="Meus materiais por valor"
          corpo={<GraficoRosca itens={p.materiais} legenda="renda" centro={<><b className="num">{Fmt.reais(p.renda)}</b><span>gerados</span></>} />} />
        <Cartao titulo={p.cooperativa ? 'Minha posição na equipe' : 'Minha posição no município'}
          sub={p.cooperativa ? p.cooperativa.nome : 'entre os catadores com coleta comprovada'}
          corpo={<BlocoPosicao p={p} equipe={equipe} />} />
      </div>

      {p.cooperativa ? (
        <Cartao titulo={`Equipe ${p.cooperativa.nome}`} sub="A cooperativa organiza o trabalho; a coleta continua sendo de cada catador"
          nota="A CATANORTE é estrutura de operação do catador, não um usuário à parte do sistema."
          corpo={<Kpis>
            <Kpi rotulo="Catadores na equipe" valor={equipe!.catadores} sub="cooperados ativos" />
            <Kpi rotulo="Massa da equipe" valor={Fmt.toneladas(equipe!.massa)} sub={`${equipe!.atendimentos} atendimento(s)`} />
            <Kpi rotulo="Capacidade livre" valor={Fmt.percentual(equipe!.disponibilidade, 0)} sub={`${equipe!.emAndamento} coleta(s) em campo`} />
            <Kpi rotulo="Valor da equipe" valor={Fmt.reais(equipe!.renda)} sub="no período demonstrativo" tom="marca" />
          </Kpis>} />
      ) : (
        <Cartao titulo="Catadora autônoma" sub="Sem vínculo com cooperativa"
          corpo={<Aviso titulo="Você trabalha por conta própria"
            texto="Os mesmos indicadores existem dentro do seu perfil: fila aberta, coletas, valor gerado e comprovantes. Nenhuma função depende de cooperativa." />} />
      )}

      <Cartao titulo="Onde eu coleto" sub="Bairros com mais massa entregue por você"
        corpo={<Ranking itens={p.bairros.map(b => ({ ...b, nota: b.n + ' coleta(s)' }))} />} />
    </>
  );
}

function BlocoPosicao({ p, equipe }: { p: ReturnType<typeof Painel.catador>; equipe: ReturnType<typeof Painel.cooperativa> }) {
  const grupo = p.cooperativa ? equipe!.equipe : p.ranking;
  const total = grupo.length || 1;
  const posicao = p.posicao || total;
  const media = grupo.reduce((soma, c) => soma + (c.massa || 0), 0) / total;
  const diferenca = media ? ((p.massa - media) / media) * 100 : null;
  const melhores = Math.max(0, Math.round(((total - posicao) / total) * 100));

  return (
    <>
      <Kpis>
        <Kpi rotulo="Sua posição" valor={`${posicao}º`} sub={`entre ${total} catador(es) com coleta comprovada`} tom="marca" />
        <Kpi rotulo="Sua massa" valor={Fmt.toneladas(p.massa)} sub="comprovada no período" />
        <Kpi rotulo="Média do grupo" valor={Fmt.toneladas(media)} sub="massa por catador" />
        <Kpi rotulo="Comparação" valor={Fmt.variacao(diferenca)} sub="sua massa contra a média" tom={diferenca != null && diferenca >= 0 ? 'ok' : ''} />
      </Kpis>
      <div className="barra-capacidade" role="img" aria-label={`Você está à frente de ${melhores}% do grupo`}>
        <i className={melhores >= 50 ? '' : 'alerta'} style={{ width: `${melhores}%` }}></i>
      </div>
      <p className="fonte-dado" style={{ marginTop: 8 }}>Você está à frente de {melhores}% do grupo. Os nomes e os números de cada colega ficam com a coordenação da organização, não nesta tela.</p>
    </>
  );
}
