/* SAMAÚMA — componentes de interface.
   As peças que todas as telas montam: marca, cartão, indicador, aviso, filtro,
   pino de situação, faixa de identidade e selo. Portado de `src/ui/componentes.js`
   — mesma marcação e mesmas classes CSS, agora em JSX em vez de string HTML. */

import type { ReactNode } from 'react';
import { STATUS } from '@/lib/dominio/catalogo';
import { DemandaRegras as Demanda } from '@/lib/dominio/demanda';
import { Fmt } from '@/lib/dominio/formato';
import type { Demanda as TDemanda, Selo, Situacao } from '@/lib/dominio/tipos';
import { arquivoPublico } from '@/lib/caminhos';

export const LOGO_URL = arquivoPublico('/logo.png');

let simboloSeq = 0;

export function Simbolo() {
  const id = 'ciclo-' + (++simboloSeq);
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="SAMAÚMA" focusable="false">
      <defs>
        <linearGradient id={id} x1="6" y1="58" x2="58" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e0a93a" /><stop offset=".38" stopColor="#8fbb3f" />
          <stop offset=".7" stopColor="#2f8f5b" /><stop offset="1" stopColor="#2a6fa8" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id})`} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M46.5 9.4A27 27 0 0 1 55 41.6" /><path d="M55.6 33.6 55.2 42l-7.4-3.6" />
        <path d="M17.5 54.6A27 27 0 0 1 9 22.4" /><path d="M8.4 30.4 8.8 22l7.4 3.6" />
        <path d="M24.6 27.4a5.6 5.6 0 0 1 2.6-8.6 6.4 6.4 0 0 1 11.4-.6 5.6 5.6 0 0 1 3.2 8.8" />
        <path d="M24.6 27.4a4.6 4.6 0 0 0 4 3.2h9.4a4.6 4.6 0 0 0 3.8-3.2" />
        <path d="M32 18.6v20" /><path d="M32 25.6 27.4 21M32 25.6l4.6-4.6" />
        <path d="M32 38.6c-4.6 0-6.2 2.2-6.2 6M32 38.6c4.6 0 6.2 2.2 6.2 6M32 38.6v6.2" />
      </g>
      <g fill={`url(#${id})`}>
        <circle cx={25.8} cy={46.6} r={2.1} /><circle cx={32} cy={47} r={2.1} /><circle cx={38.2} cy={46.6} r={2.1} />
      </g>
    </svg>
  );
}

export function Tri() {
  return <span className="tri" aria-hidden="true"><i></i><i></i><i></i></span>;
}

export function Marca({ tamanho = 44, forma = 'simbolo' as 'simbolo' | 'completa' }: { tamanho?: number; forma?: 'simbolo' | 'completa' }) {
  const completa = forma === 'completa';
  return (
    <span className={completa ? 'marca-completa' : 'marca-simbolo'} style={{ ['--tam' as string]: `${tamanho}px` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_URL} alt="SAMAÚMA"
        onError={e => {
          e.currentTarget.hidden = true;
          const irmao = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (irmao) irmao.hidden = false;
        }} />
      <span className="marca-desenho" hidden>
        <Simbolo />
        {completa && <><b>SAMAÚMA</b><small>Sistema de Grandes Geradores e Inclusão Produtiva</small></>}
      </span>
    </span>
  );
}

export function Cabecalho({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="cabecalho">
      <div><h2>{titulo}</h2><Tri />{texto && <p>{texto}</p>}</div>
      {acao && <div className="acoes">{acao}</div>}
    </div>
  );
}

export function Cartao({ titulo, sub, acao, corpo, nota, classe = '' }: {
  titulo?: string; sub?: string; acao?: ReactNode; corpo: ReactNode; nota?: string; classe?: string;
}) {
  return (
    <section className={`cartao ${classe}`}>
      {titulo && (
        <header className="cartao-topo">
          <div><h3>{titulo}</h3>{sub && <p>{sub}</p>}</div>
          {acao}
        </header>
      )}
      <div className="cartao-corpo">{corpo}</div>
      {nota && <div className="cartao-nota">{nota}</div>}
    </section>
  );
}

export function Kpi({ rotulo, valor, sub, tom = '', variacao = null, destaque = false }: {
  rotulo: string; valor: ReactNode; sub?: string; tom?: string; variacao?: number | null; destaque?: boolean;
}) {
  return (
    <div className={`kpi ${tom} ${destaque ? 'destaque' : ''}`}>
      <div className="rot">{rotulo}</div>
      <div className="val num">
        {valor}
        {variacao != null && (
          <span className={`delta ${variacao >= 0 ? 'sobe' : 'desce'}`}>
            {variacao >= 0 ? '▲' : '▼'} {Fmt.variacao(Math.abs(variacao))}
          </span>
        )}
      </div>
      <div className="sub">{sub || ''}</div>
    </div>
  );
}

export function Kpis({ children }: { children: ReactNode }) {
  return <div className="kpis">{children}</div>;
}

export function Pares({ itens }: { itens: [string, ReactNode, string?][] }) {
  return (
    <dl className="pares">
      {itens.map(([rotulo, valor, tom], i) => (
        <div key={i}><dt>{rotulo}</dt><dd className={`num ${tom || ''}`}>{valor}</dd></div>
      ))}
    </dl>
  );
}

export function Aviso({ titulo, texto, tom = '' }: { titulo: string; texto: string; tom?: string }) {
  return <div className={`aviso ${tom}`}><b>{titulo}</b><span>{texto}</span></div>;
}

export function Vazio({ titulo, texto }: { titulo: string; texto: string }) {
  return <div className="vazio"><Marca tamanho={38} /><b>{titulo}</b><span>{texto}</span></div>;
}

export function Pino({ rotulo, tom }: { rotulo: string; tom: string }) {
  return <span className={`pino ${tom}`}>{rotulo}</span>;
}

export function SituacaoDemanda({ demanda }: { demanda: TDemanda }) {
  return <Pino rotulo={Demanda.rotulo(demanda)} tom={STATUS[demanda.status].tom} />;
}

export function SituacaoGerador({ situacao }: { situacao: Situacao }) {
  return <Pino rotulo={situacao.rotulo} tom={situacao.tom} />;
}

export function Filtros<T, G extends string>({ todas, grupos, atual, rotulos, aoEscolher }: {
  todas: T[]; grupos: Record<G, (item: T) => boolean>; atual: G; rotulos: [G, string][]; aoEscolher: (chave: G) => void;
}) {
  return (
    <div className="filtros">
      {rotulos.map(([chave, rotulo]) => {
        const n = todas.filter(grupos[chave]).length;
        return (
          <button key={chave} className={atual === chave ? 'on' : ''} aria-pressed={atual === chave}
            onClick={() => aoEscolher(chave)}>
            {rotulo}<span className="n num">{n}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Exportar({ escopo, rotulo = 'Exportar', aoCsv, aoPdf }: {
  escopo: string; rotulo?: string; aoCsv: (escopo: string) => void; aoPdf: (escopo: string) => void;
}) {
  return (
    <div className="exportar">
      <span className="etiqueta">{rotulo}</span>
      <button className="btn sec sm" onClick={() => aoCsv(escopo)}>CSV</button>
      <button className="btn sec sm" onClick={() => aoPdf(escopo)}>PDF</button>
    </div>
  );
}

export function FaixaPerfil({ nome, papel, medidas, acao }: {
  nome: string; papel: string; medidas: [ReactNode, string][]; acao?: ReactNode;
}) {
  return (
    <div className="faixa-perfil">
      <div className="identidade">
        <Marca tamanho={36} />
        <div><b>{nome}</b><span>{papel}</span></div>
      </div>
      <div className="medidas">
        {medidas.map(([valor, rotulo], i) => <div key={i}><b className="num">{valor}</b><span>{rotulo}</span></div>)}
      </div>
      {acao && <div className="faixa-acao">{acao}</div>}
    </div>
  );
}

export function SeloDestinacao({ selo }: { selo: Selo }) {
  if (!selo.valido) {
    return (
      <div className="selo pendente">
        <div className="selo-marca"><Marca tamanho={48} /></div>
        <div className="selo-texto">
          <span className="etiqueta">Selo de destinação</span>
          <b>Não emitido</b>
          <p>{selo.situacao.motivos[0]}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="selo">
      <div className="selo-marca"><Marca tamanho={48} /></div>
      <div className="selo-texto">
        <span className="etiqueta">Selo de destinação · competência {selo.competencia}</span>
        <b className="mono">{selo.codigo}</b>
        <p>{Fmt.kg(selo.massa)} com destinação comprovada em {selo.comprovantes} carga(s).</p>
        <small className="mono">{selo.verificacao}</small>
      </div>
      <Tri />
    </div>
  );
}
