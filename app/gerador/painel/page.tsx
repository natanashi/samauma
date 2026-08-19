'use client';

/* Portado de `telaGeradorPainel` + `blocoSituacao` em `src/telas/gerador.js`. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cartao, Kpi, Kpis, SeloDestinacao, SituacaoGerador, Vazio } from '@/components/ui/Basicos';
import { Anel, BarraRecuperacao, GraficoRosca, GraficoSerie, Ranking } from '@/components/ui/Graficos';
import { ListaColetas } from '@/components/ui/Listas';
import { Aviso } from '@/components/ui/Basicos';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import type { Situacao } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

export default function PaginaGeradorPainel() {
  useDominio();
  const router = useRouter();
  const abrir = (id: string) => router.push(`/gerador/demandas/${id}`);
  const p = Painel.gerador(Sessao.gerador);

  return (
    <>
      <div className="cabecalho">
        <div><h2>Painel do gerador</h2><span className="tri"><i></i><i></i><i></i></span>
          <p>{p.cadastro.nome} · {p.cadastro.ramo} · {p.ponto ? p.ponto.bairro + ' · ' + p.ponto.zona : ''}</p></div>
        <div className="acoes"><Link href="/gerador/nova" className="btn">Nova demanda</Link></div>
      </div>

      <BlocoSituacao p={p} />

      <Kpis>
        <Kpi rotulo="Massa destinada" valor={Fmt.toneladas(p.ambiental.massa)} sub="confirmada por quem recebeu" tom="marca" destaque />
        <Kpi rotulo="Efetivamente reciclada" valor={Fmt.toneladas(p.ambiental.reciclado)} sub={`${Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} do que saiu daqui`} tom="ok" />
        <Kpi rotulo="Em andamento" valor={p.emAberto + p.emTransporte} sub={`${p.emTransporte} a caminho do destino`} />
        <Kpi rotulo="Pendências" valor={p.pendencias} sub="em conciliação na Prefeitura" tom={p.pendencias ? 'erro' : 'ok'} />
      </Kpis>

      <div className="colunas dois-um">
        <Cartao titulo="Próxima coleta" sub={p.proxima ? 'Demanda em campo agora' : 'Nada agendado'}
          acao={<Link href="/gerador/demandas" className="btn sec sm">Ver demandas</Link>}
          corpo={p.proxima
            ? <>
              <ListaColetas demandas={[p.proxima]} aoAbrir={abrir} />
              <Aviso titulo="Operador responsável" texto={p.operador ? `${p.operador.nome} — ${p.operador.detalhe}.` : 'Sem operador contratado: a demanda vai para a fila aberta de catadores.'} />
            </>
            : <Vazio titulo="Nenhuma coleta em campo" texto="Crie uma demanda quando houver material acumulado." />} />
        <Cartao titulo="Volume declarado" sub="Declarado no cadastro × destinado com prova"
          corpo={
            <>
              <Anel valor={p.aderencia ? Math.min(100, p.aderencia.parte) : 0} rotulo="do declarado" tom="azul"
                nota={p.aderencia ? `${Fmt.kg(p.aderencia.destinado)} destinados de ${Fmt.kg(p.aderencia.declarado)} declarados por mês` : 'sem volume declarado no cadastro'} />
              <div className="micro-kpis">
                <div><b className="num">{Fmt.percentual(p.precisao, 0)}</b><span>precisão da estimativa</span></div>
                <div><b className="num">{Fmt.duracao(p.cicloMedio)}</b><span>ciclo médio</span></div>
              </div>
            </>
          }
          nota="Precisão compara a quantidade que você estima com o peso registrado na balança do destinatário." />
      </div>

      <Cartao titulo="O que aconteceu com o seu resíduo" sub="Massa recebida, separada entre o que voltou ao ciclo e o que foi aterrado"
        nota="Coletar não é reciclar: parte do material é separada como rejeito na triagem e segue para o aterro sanitário."
        corpo={
          <>
            <BarraRecuperacao ambiental={p.ambiental} />
            <div className="micro-kpis">
              <div><b className="num">{Fmt.kg(Math.round(p.ambiental.co2Evitado))}</b><span>CO₂e evitado</span></div>
              <div><b className="num">{Fmt.kg(p.ambiental.massaAterrada)}</b><span>enviado direto ao aterro</span></div>
              <div><b className="num">{Fmt.reais(p.financeiro.custoAterroEvitado)}</b><span>custo de aterro evitado</span></div>
            </div>
          </>
        } />

      <div className="colunas dois-um">
        <Cartao titulo="Destinação dia a dia" sub="Últimos 14 dias" corpo={<GraficoSerie serie={p.serie} />} />
        <Cartao titulo="Composição" sub="Por tipo de resíduo" corpo={<GraficoRosca itens={p.materiais} />} />
      </div>

      <Cartao titulo="Para onde o material foi" sub="Unidades que receberam, confirmaram e declararam o destino final"
        corpo={<Ranking itens={p.destinos.map(d => ({ ...d, nota: `${d.destinoFinal} · ${d.n} carga(s)` }))} />} />
    </>
  );
}

function BlocoSituacao({ p }: { p: ReturnType<typeof Painel.gerador> }) {
  const s = p.situacao as Situacao;
  return (
    <section className={`cartao situacao-regulatoria ${s.tom}`}>
      <div className="cartao-corpo">
        <div className="situacao-topo">
          <div className="situacao-quem">
            <span className="etiqueta">Situação regulatória</span>
            <div className="situacao-pino"><SituacaoGerador situacao={s} /></div>
            <ul className="motivos">{s.motivos.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
          <SeloDestinacao selo={p.selo} />
        </div>
      </div>
    </section>
  );
}
