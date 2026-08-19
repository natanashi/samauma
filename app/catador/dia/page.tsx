'use client';

/* Portado de `telaCatadorDia` + `blocoProximaColeta` em `src/telas/catador.js`. */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cabecalho, Cartao, Kpi, Kpis, SituacaoDemanda, Vazio } from '@/components/ui/Basicos';
import { ListaColetas } from '@/components/ui/Listas';
import { BlocoCanais } from '@/components/catador/BlocoCanais';
import { FaixaCatador } from '@/components/catador/FaixaCatador';
import { Catalogo } from '@/lib/dominio/catalogo';
import { DemandaRegras as Demanda } from '@/lib/dominio/demanda';
import { Fmt, agoraMs } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import type { Demanda as TDemanda } from '@/lib/dominio/tipos';
import { useDominio } from '@/state/hooks';

export default function PaginaCatadorDia() {
  useDominio();
  const router = useRouter();
  const p = Painel.catador(Sessao.catador.id);
  const hoje = p.hoje;

  return (
    <>
      <Cabecalho titulo="Meu dia" texto={`${p.pessoa.nome} · ${Fmt.data(new Date(agoraMs()).toISOString())}`}
        acao={<Link href="/catador/disponiveis" className="btn">{p.naFila} demanda(s) na fila</Link>} />

      <FaixaCatador />

      <BlocoCanais />

      <Cartao titulo="Próxima coleta" sub={p.proxima ? 'A mais urgente entre as suas' : 'Nada em campo agora'}
        classe={p.proxima ? 'acao-viva' : ''}
        corpo={p.proxima
          ? <BlocoProximaColeta demanda={p.proxima} aoAbrir={id => router.push(`/catador/demandas/${id}`)} />
          : <Vazio titulo="Nenhuma coleta aceita" texto="Escolha uma demanda disponível para começar o dia." />} />

      <Cartao titulo="Coletas de hoje" sub={hoje.length ? `${hoje.length} coleta(s) com prazo hoje ou vencido` : 'Nenhuma coleta vence hoje'}
        corpo={<ListaColetas demandas={hoje} vazioTitulo="Nada vence hoje" vazioTexto="Suas outras coletas aparecem em “Minhas coletas”."
          aoAbrir={id => router.push(`/catador/demandas/${id}`)} />} />

      <Kpis>
        <Kpi rotulo="Na semana" valor={Fmt.kg(p.massaSemana)} sub="massa entregue nos últimos 7 dias" variacao={p.variacaoSemana} />
        <Kpi rotulo="Valor na semana" valor={Fmt.reais(p.rendaSemana)} sub="pelo material recuperado" tom="marca" />
        <Kpi rotulo="Meta semanal" valor={Fmt.percentual(p.metaAtingida, 0)} sub={`${Fmt.kg(p.meta)} combinados`} tom={p.metaAtingida != null && p.metaAtingida >= 100 ? 'ok' : ''} />
        <Kpi rotulo="Em campo agora" valor={p.emAndamento} sub="sob sua responsabilidade" tom={p.emAndamento ? 'alerta' : 'ok'} />
      </Kpis>
    </>
  );
}

function BlocoProximaColeta({ demanda, aoAbrir }: { demanda: TDemanda; aoAbrir: (id: string) => void }) {
  const ponto = Catalogo.ponto(demanda.ponto)!;
  const proxima = Demanda.proximaAcao(demanda);
  return (
    <div className="proxima-coleta">
      <div className="quando">
        <span className="etiqueta">Prazo</span>
        <b>{Fmt.prazo(demanda.prazo)}</b>
        <span>{Fmt.data(demanda.prazo)} · {Fmt.turno(demanda.prazo)}</span>
      </div>
      <div className="onde">
        <span className="etiqueta">Endereço</span>
        <b>{demanda.gerador.nome}</b>
        <span>{ponto.bairro} · {ponto.zona}</span>
        <span className="acesso">{ponto.acesso}</span>
        {demanda.observacao && <span className="acesso">“{demanda.observacao}”</span>}
      </div>
      <div className="oque">
        <span className="etiqueta">Material</span>
        <b>{Catalogo.nomeResiduo(demanda.residuo)}</b>
        <span>{Fmt.kg(demanda.estimadoKg)} estimados</span>
        <span>{demanda.km.toLocaleString('pt-BR')} km · {Fmt.reais(Demanda.valor({ ...demanda, verificadoKg: demanda.estimadoKg, rejeitoKg: 0 }))} estimados</span>
      </div>
      <div className="agir">
        <SituacaoDemanda demanda={demanda} />
        <button className="btn" onClick={() => aoAbrir(demanda.id)}>{proxima.texto}</button>
      </div>
    </div>
  );
}
