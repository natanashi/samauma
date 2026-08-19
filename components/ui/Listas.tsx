/* SAMAÚMA — listas.
   O cartão da demanda é o mesmo objeto para os quatro usuários: muda o que se
   destaca. Portado de `src/ui/listas.js`. */

import { Catalogo } from '@/lib/dominio/catalogo';
import { DemandaRegras as Demanda } from '@/lib/dominio/demanda';
import { Fmt } from '@/lib/dominio/formato';
import type { Demanda as TDemanda } from '@/lib/dominio/tipos';
import { SituacaoDemanda, SituacaoGerador, Vazio } from './Basicos';

type Visao = 'prefeitura' | 'catador' | 'destinatario' | 'gerador';

export function CartaoDemanda({ demanda, visao = 'prefeitura', aoAbrir }: { demanda: TDemanda; visao?: Visao; aoAbrir: (id: string) => void }) {
  const massa = Demanda.massaCorrente(demanda);
  const residuo = Catalogo.nomeResiduo(demanda.residuo);
  const cor = Catalogo.corResiduo(demanda.residuo);
  const catador = demanda.catador ? demanda.catador.nome : 'aguardando catador';

  const titulo = visao === 'catador' ? residuo : demanda.gerador.nome;
  const detalhe = visao === 'catador'
    ? <><b>{demanda.gerador.nome}</b><span>{Catalogo.endereco(demanda.ponto)}</span><span>{demanda.km.toLocaleString('pt-BR')} km</span></>
    : <><b>{residuo}</b><span>{catador}</span><span>{demanda.bairro}</span></>;

  return (
    <button className="demanda" style={{ ['--material' as string]: cor }} onClick={() => aoAbrir(demanda.id)}>
      <span className="fita" aria-hidden="true"></span>
      <span className="corpo">
        <span className="codigo">{demanda.id.replace('DEM-', '#')}</span>
        <span className="nome">{titulo}</span>
        <span className="detalhe">{detalhe}</span>
      </span>
      <span className="lado">
        <SituacaoDemanda demanda={demanda} />
        <span className="massa num">{Fmt.kg(massa.kg)}</span>
        <span className={`prazo ${massa.atrasada ? 'atrasada' : ''}`}>{massa.rotulo} · {massa.nota}</span>
      </span>
    </button>
  );
}

export function ListaDemandas({ demandas, visao = 'prefeitura', vazioTitulo = 'Nada por aqui', vazioTexto = '', aoAbrir }: {
  demandas: TDemanda[]; visao?: Visao; vazioTitulo?: string; vazioTexto?: string; aoAbrir: (id: string) => void;
}) {
  if (!demandas.length) return <Vazio titulo={vazioTitulo} texto={vazioTexto} />;
  return <div className="lista">{demandas.map(d => <CartaoDemanda key={d.id} demanda={d} visao={visao} aoAbrir={aoAbrir} />)}</div>;
}

export function CartaoColeta({ demanda, aoAbrir }: { demanda: TDemanda; aoAbrir: (id: string) => void }) {
  const ponto = Catalogo.ponto(demanda.ponto);
  const proxima = Demanda.proximaAcao(demanda);
  return (
    <button className={`coleta ${Demanda.atrasada(demanda) ? 'atrasada' : ''}`}
      style={{ ['--material' as string]: Catalogo.corResiduo(demanda.residuo) }} onClick={() => aoAbrir(demanda.id)}>
      <span className="hora">
        <b>{Fmt.turno(demanda.prazo)}</b>
        <span>{Fmt.prazo(demanda.prazo)}</span>
      </span>
      <span className="corpo">
        <span className="nome">{demanda.gerador.nome}</span>
        <span className="endereco">{ponto ? ponto.bairro + ' · ' + ponto.zona : '—'}</span>
        <span className="acesso">{ponto ? ponto.acesso : ''}</span>
      </span>
      <span className="lado">
        <SituacaoDemanda demanda={demanda} />
        <span className="massa num">{Fmt.kg(demanda.coletadoKg ?? demanda.estimadoKg)}</span>
        <span className="tipo">{Catalogo.nomeResiduo(demanda.residuo)}</span>
        <span className="proxima">{proxima.texto}</span>
      </span>
    </button>
  );
}

export function ListaColetas({ demandas, vazioTitulo = 'Nenhuma coleta', vazioTexto = '', aoAbrir }: {
  demandas: TDemanda[]; vazioTitulo?: string; vazioTexto?: string; aoAbrir: (id: string) => void;
}) {
  if (!demandas.length) return <Vazio titulo={vazioTitulo} texto={vazioTexto} />;
  return <div className="lista">{demandas.map(d => <CartaoColeta key={d.id} demanda={d} aoAbrir={aoAbrir} />)}</div>;
}

export function ListaComprovantes({ demandas, visao = 'gerador', aoVer }: { demandas: TDemanda[]; visao?: Visao; aoVer: (id: string) => void }) {
  if (!demandas.length) return <Vazio titulo="Nenhum comprovante emitido" texto="O comprovante nasce quando o destinatário confirma a carga." />;
  return (
    <ul className="comprovantes">
      {demandas.map(d => (
        <li key={d.id}>
          <span className="codigo mono">{d.comprovante!.codigo}</span>
          <span className="sobre">
            <b>{visao === 'gerador' ? Catalogo.nomeResiduo(d.residuo) : d.gerador.nome}</b>
            <span>{Fmt.data(d.comprovante!.emitidoEm)} · {d.destino.nome}</span>
          </span>
          <span className="massa num">{Fmt.kg(d.verificadoKg)}</span>
          <button className="btn sec sm" onClick={() => aoVer(d.id)}>Ver</button>
        </li>
      ))}
    </ul>
  );
}

export function ListaGeradores({ geradores, compacta = false, aoAbrir }: {
  geradores: ReturnType<typeof import('@/lib/dominio/indicadores').Painel.geradores>; compacta?: boolean; aoAbrir: (id: string) => void;
}) {
  if (!geradores.length) return <Vazio titulo="Nenhum gerador nesta situação" texto="Ajuste o filtro para ver os demais." />;
  return (
    <ul className="geradores">
      {geradores.map(g => (
        <li key={g.id} className={g.situacao.tom}>
          <button className="linha-gerador" onClick={() => aoAbrir(g.id)}>
            <span className="corpo">
              <span className="nome">{g.nome}</span>
              <span className="detalhe">{g.ramo} · {g.bairro} · {g.cnpj}</span>
              {!compacta && <span className="motivo">{g.situacao.motivos[0]}</span>}
            </span>
            <span className="lado">
              <SituacaoGerador situacao={g.situacao} />
              <span className="massa num">{Fmt.kg(g.massa)}</span>
              <span className="nota">{g.comprovantes} comprovante(s)</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
