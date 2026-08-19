/* SAMAÚMA — gráficos.
   Feitos à mão: barras em HTML, rosca e anel em SVG inline. Sem biblioteca,
   sem canvas e sem fonte remota. Portado de `src/ui/graficos.js`. */

import { Catalogo } from '@/lib/dominio/catalogo';
import { Fmt, somar } from '@/lib/dominio/formato';
import { Vazio } from './Basicos';

interface DiaSerie { iso: string; rotulo: string; curto: string; hoje: boolean; kg: number; reciclado: number; rejeito: number; n: number }

export function GraficoSerie({ serie, separarRejeito = true }: { serie: DiaSerie[]; separarRejeito?: boolean }) {
  const max = Math.max(...serie.map(d => d.kg), 1);
  const total = somar(serie, 'kg');
  const reciclado = somar(serie, 'reciclado');

  return (
    <div className="serie">
      <div className="serie-topo">
        <span className="etiqueta">massa comprovada por dia</span>
        <span className="serie-total num">{Fmt.toneladas(total)} <small>em 14 dias</small></span>
      </div>
      <div className="barras">
        {serie.map((dia, i) => {
          const altura = dia.kg ? Math.max(4, (dia.kg / max) * 100) : 2;
          const parteRejeito = dia.kg ? (dia.rejeito / dia.kg) * 100 : 0;
          const titulo = `${dia.rotulo} · ${Fmt.kg(dia.kg)} em ${dia.n} carga(s)` +
            (dia.kg ? ` · recuperado ${Fmt.kg(dia.reciclado)}, rejeito ${Fmt.kg(dia.rejeito)}` : '');
          return (
            <div key={i} className={`col ${dia.hoje ? 'hoje' : ''} ${dia.kg ? '' : 'zero'}`} title={titulo}>
              <span className="haste" style={{ ['--h' as string]: `${altura.toFixed(1)}%` }}>
                {separarRejeito && parteRejeito > 0 && <i className="rejeito" style={{ ['--r' as string]: `${parteRejeito.toFixed(1)}%` }}></i>}
              </span>
              <span className="dia">{dia.curto}</span>
            </div>
          );
        })}
      </div>
      {separarRejeito && (
        <div className="serie-legenda">
          <span><i className="amostra recuperado"></i>recuperado {Fmt.kg(reciclado)}</span>
          <span><i className="amostra rejeito"></i>rejeito {Fmt.kg(total - reciclado)}</span>
          <span><i className="amostra hoje"></i>hoje</span>
        </div>
      )}
    </div>
  );
}

interface ItemRosca { id?: string; nome: string; kg: number; cor?: string; renda?: number; parte: number }

let roscaSeq = 0;

/* Deslocamento acumulado de cada fatia da rosca, calculado fora do corpo do
   componente: mutar um contador dentro do `.map()` de um render é o tipo de
   impureza que o linter de hooks rejeita. */
function deslocamentosDaRosca(itens: ItemRosca[], total: number, volta: number): number[] {
  let acumulado = 0;
  return itens.map(item => {
    const atual = acumulado;
    acumulado += (total ? item.kg / total : 0) * volta;
    return atual;
  });
}

export function GraficoRosca({ itens, legenda = 'kg', centro }: { itens: ItemRosca[]; legenda?: 'kg' | 'renda'; centro?: React.ReactNode }) {
  if (!itens.length) return <Vazio titulo="Sem material comprovado" texto="A composição aparece quando o primeiro ciclo fechar." />;

  const total = somar(itens, 'kg');
  const raio = 42;
  const volta = 2 * Math.PI * raio;
  const id = 'rosca-' + (++roscaSeq);
  const deslocamentos = deslocamentosDaRosca(itens, total, volta);

  const arcos = itens.map((item, i) => {
    const traco = (total ? item.kg / total : 0) * volta;
    return (
      <circle key={i} className="arco" cx={50} cy={50} r={raio} stroke={item.cor || '#8a9690'}
        strokeDasharray={`${traco.toFixed(2)} ${(volta - traco).toFixed(2)}`}
        strokeDashoffset={(-deslocamentos[i]).toFixed(2)}>
        <title>{item.nome}: {Fmt.kg(item.kg)}</title>
      </circle>
    );
  });

  return (
    <div className="composicao">
      <div className="rosca">
        <svg viewBox="0 0 100 100" role="img" aria-labelledby={id} focusable="false">
          <title id={id}>Composição por material</title>
          <circle className="trilho" cx={50} cy={50} r={raio} />
          <g transform="rotate(-90 50 50)">{arcos}</g>
        </svg>
        <div className="rosca-centro">{centro || <><b className="num">{Fmt.toneladas(total)}</b><span>comprovados</span></>}</div>
      </div>
      <ul className="legenda">
        {itens.map((item, i) => {
          const residuo = Catalogo.residuo(item.id || '');
          const preco = residuo ? residuo.preco : 0;
          return (
            <li key={i}>
              <span className="ponto" style={{ background: item.cor || '#8a9690' }}></span>
              <span className="nome">{item.nome}</span>
              <span className="preco num">{legenda === 'renda' || !preco ? '' : Fmt.reais(preco) + '/kg'}</span>
              <span className="valor num">{legenda === 'renda' ? Fmt.reais(item.renda) : Fmt.kg(item.kg)}</span>
              <span className="parte num">{Fmt.percentual(item.parte, 0)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

let anelSeq = 0;

export function Anel({ valor, rotulo = '', nota = '', tom = 'verde', texto = null }: {
  valor: number | null; rotulo?: string; nota?: string; tom?: string; texto?: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, valor || 0));
  const raio = 42;
  const volta = 2 * Math.PI * raio;
  const preenchido = (pct / 100) * volta;
  const id = 'anel-' + (++anelSeq);

  return (
    <div className={`anel ${tom}`}>
      <svg viewBox="0 0 100 100" role="img" aria-labelledby={id} focusable="false">
        <title id={id}>{rotulo}: {Fmt.percentual(pct, 0)}</title>
        <circle className="trilho" cx={50} cy={50} r={raio} />
        <circle className="arco" cx={50} cy={50} r={raio} transform="rotate(-90 50 50)"
          strokeDasharray={`${preenchido.toFixed(2)} ${(volta - preenchido).toFixed(2)}`} />
      </svg>
      <div className="anel-centro">
        <b className="num">{texto || Fmt.percentual(pct, 0)}</b>
        {rotulo && <span>{rotulo}</span>}
      </div>
      {nota && <div className="anel-nota">{nota}</div>}
    </div>
  );
}

interface ItemRanking { id?: string; nome: string; massa: number; renda?: number; parte: number; nota?: string; aterro?: boolean }

export function Ranking({ itens, destacar = null, unidade = 'kg' }: { itens: ItemRanking[]; destacar?: string | null; unidade?: 'kg' | 'reais' }) {
  if (!itens.length) return <Vazio titulo="Sem dados ainda" texto="O ranking aparece quando houver massa comprovada." />;
  const maior = Math.max(...itens.map(i => i.massa), 1);
  return (
    <ol className="rank">
      {itens.map((item, i) => (
        <li key={i} className={`${destacar && item.id === destacar ? 'eu' : ''} ${item.aterro ? 'aterro' : ''}`}>
          <span className="pos num">{i + 1}</span>
          <span className="dados">
            <span className="linha1"><b>{item.nome}</b>
              <span className="num">{unidade === 'reais' ? Fmt.reais(item.renda) : Fmt.kg(item.massa)}</span></span>
            <span className="trilho"><span className="preenche" style={{ ['--p' as string]: `${((item.massa / maior) * 100).toFixed(1)}%` }}></span></span>
            <span className="linha2">{item.nota || ''}<span className="num">{Fmt.percentual(item.parte, 0)}</span></span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function BarraRecuperacao({ ambiental }: { ambiental: { taxaRecuperacao: number | null; reciclado: number; rejeito: number } }) {
  const taxa = ambiental.taxaRecuperacao || 0;
  return (
    <div className="recuperacao">
      <div className="barra-dupla" role="img" aria-label={`Recuperado ${Fmt.percentual(taxa, 0)}, rejeito ${Fmt.percentual(100 - taxa, 0)}`}>
        <span className="recuperado" style={{ ['--p' as string]: `${taxa.toFixed(1)}%` }}></span>
        <span className="rejeito" style={{ ['--p' as string]: `${(100 - taxa).toFixed(1)}%` }}></span>
      </div>
      <div className="barra-dupla-legenda">
        <span><i className="amostra recuperado"></i><b className="num">{Fmt.kg(ambiental.reciclado)}</b> recuperado</span>
        <span><i className="amostra rejeito"></i><b className="num">{Fmt.kg(ambiental.rejeito)}</b> para o aterro</span>
      </div>
    </div>
  );
}
