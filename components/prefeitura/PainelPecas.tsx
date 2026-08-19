/* SAMAÚMA — peças do painel da Prefeitura: ícone, KPI com centelha, indicador
   compacto e o gráfico de conformidade ao longo do tempo. Portado de
   `src/telas/prefeitura.js`. */

import { Fmt } from '@/lib/dominio/formato';

const ICONES_PAINEL: Record<string, string> = {
  predio: '<path d="M5 9.5v10h14v-10"/><path d="M3.3 9.5 12 4 20.7 9.5"/><path d="M10 19.5v-5.5h4v5.5"/>',
  tonelada: '<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M8 7V5.3a1.3 1.3 0 0 1 1.3-1.3h5.4A1.3 1.3 0 0 1 16 5.3V7"/><path d="M8 13h8"/>',
  moeda: '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.6v8.8M14.6 9.6c0-1.1-1.1-1.7-2.6-1.7s-2.5.7-2.5 1.7c0 2.3 5.1.9 5.1 3.3 0 1.1-1.2 1.8-2.6 1.8s-2.7-.6-2.7-1.8"/>',
  grupo: '<circle cx="8.7" cy="9" r="3"/><circle cx="16.3" cy="10.2" r="2.4"/><path d="M2.8 19c0-3.3 2.6-5.3 5.9-5.3s5.9 2 5.9 5.3"/><path d="M15.2 14.2c2.5.3 4 2 4 4.8"/>',
  recibo: '<path d="M6 3.5h12v17l-2.4-1.6L13.2 20l-1.2-1.6L10.8 20l-2.4-1.1L6 20.5z"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5"/>',
  crescer: '<path d="M3.5 17.5 9 11l4 3.2 7.5-8.4"/><path d="M16.3 5.8h4.2V10"/>',
  relogio: '<circle cx="12" cy="12.5" r="8.3"/><path d="M12 7.6v5l3.6 2"/>',
  caminhao: '<path d="M2.8 8h11v9h-11z"/><path d="M13.8 11.2h4.1l3.3 3.1v2.7h-7.4z"/><circle cx="7.2" cy="19.3" r="1.8"/><circle cx="17.6" cy="19.3" r="1.8"/>',
  balanca: '<path d="M12 4v16M7 20h10"/><path d="M4.5 8h6M13.5 8h6"/><path d="M4.5 8 2 13a2.5 2.5 0 0 0 5 0zM19.5 8 17 13a2.5 2.5 0 0 0 5 0z"/>',
  pessoa: '<circle cx="12" cy="8.2" r="3.5"/><path d="M4.8 20.3c0-4.2 3.3-6.7 7.2-6.7s7.2 2.5 7.2 6.7"/>'
};

export function IconePainel({ nome, cor }: { nome: string; cor: string }) {
  return (
    <span className="painel-icone" style={{ ['--cor-icone' as string]: cor }} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: ICONES_PAINEL[nome] }} />
    </span>
  );
}

export function Centelha({ valores, cor }: { valores: number[]; cor: string }) {
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores, 0);
  const amplitude = max - min || 1;
  const pontos = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * 60;
    const y = 18 - ((v - min) / amplitude) * 16;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg className="centelha" viewBox="0 0 60 18" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pontos} fill="none" stroke={cor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KpiPainel({ icone, cor, rotulo, valor, sub, variacao, pontos }: {
  icone: string; cor: string; rotulo: string; valor: React.ReactNode; sub?: string; variacao?: number | null; pontos?: number[];
}) {
  const tendencia = variacao == null ? null : (
    <span className={`painel-kpi-delta ${variacao >= 0 ? 'sobe' : 'desce'}`} title="desde a semana passada">
      {variacao >= 0 ? '▲' : '▼'} {Fmt.variacao(Math.abs(variacao))}
    </span>
  );
  return (
    <div className="cartao painel-kpi">
      <div className="cartao-corpo">
        <IconePainel nome={icone} cor={cor} />
        <div className="painel-kpi-rotulo">{rotulo}</div>
        <div className="painel-kpi-valor num">{valor}</div>
        <div className="painel-kpi-pe">
          {tendencia || <span className="painel-kpi-sub">{sub || ''}</span>}
          {pontos && <Centelha valores={pontos} cor={cor} />}
        </div>
      </div>
    </div>
  );
}

export function IndicadorPainel({ icone, cor, rotulo, valor, sub }: { icone: string; cor: string; rotulo: string; valor: React.ReactNode; sub?: string }) {
  return (
    <div className="indicador-painel">
      <div className="indicador-topo"><IconePainel nome={icone} cor={cor} /><span className="indicador-rotulo">{rotulo}</span></div>
      <div className="indicador-valor num">{valor}</div>
      {sub && <div className="indicador-sub">{sub}</div>}
    </div>
  );
}

interface DiaSerie { rotulo: string; kg: number; reciclado: number }

/* Toneladas acumuladas dia a dia, calculado fora do corpo do componente pelo
   mesmo motivo do deslocamento da rosca (ver `components/ui/Graficos.tsx`). */
function acumularToneladas(serie: DiaSerie[]): number[] {
  let acumulado = 0;
  return serie.map(d => (acumulado += d.reciclado) / 1000);
}

export function GraficoConformidade({ serie }: { serie: DiaSerie[] }) {
  const taxas = serie.map(d => d.kg ? (d.reciclado / d.kg) * 100 : 0);
  const acumulados = acumularToneladas(serie);
  const maiorAcumulado = Math.max(...acumulados, 1);

  const largura = 100, base = 82;
  const passo = largura / (serie.length - 1);
  const coords = (valores: number[], max: number) => valores.map((v, i) => ({ x: i * passo, y: base - (v / max) * base }));

  const paraPontos = (pts: { x: number; y: number }[]) => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const pTaxa = coords(taxas, 100);
  const pMassa = coords(acumulados, maiorAcumulado);
  const areaMassa = `${paraPontos(pMassa)} ${largura.toFixed(1)},${base} 0,${base}`;

  return (
    <div className="conformidade">
      <div className="conformidade-linha">
        <span className="eixo-y esquerda"><span>100%</span><span>50%</span><span>0%</span></span>
        <span className="meio">
          <svg viewBox={`0 0 ${largura} 90`} preserveAspectRatio="none" role="img" aria-label="Conformidade ao longo do tempo">
            <defs><linearGradient id="conf-gradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--ouro-fundo)" stopOpacity=".22" />
              <stop offset="1" stopColor="var(--ouro-fundo)" stopOpacity="0" />
            </linearGradient></defs>
            {[0, 1, 2, 3].map(i => <line key={i} className="grade" x1={0} x2={largura} y1={(base / 3) * i} y2={(base / 3) * i} />)}
            <polygon className="area" points={areaMassa} fill="url(#conf-gradiente)" />
            <polyline className="linha ouro" points={paraPontos(pMassa)} />
            <polyline className="linha verde" points={paraPontos(pTaxa)} />
            {pMassa.map((p, i) => <circle key={'m' + i} className="ponto-linha ouro" cx={p.x} cy={p.y} r={1.6} />)}
            {pTaxa.map((p, i) => <circle key={'t' + i} className="ponto-linha verde" cx={p.x} cy={p.y} r={1.6} />)}
          </svg>
        </span>
        <span className="eixo-y direita"><span>{Fmt.toneladas(maiorAcumulado * 1000)}</span><span>{Fmt.toneladas(maiorAcumulado * 500)}</span><span>0 t</span></span>
      </div>
      <div className="conformidade-legenda">
        <span><i className="amostra verde"></i>Taxa de recuperação diária</span>
        <span><i className="amostra ouro"></i>Toneladas desviadas, acumulado no período</span>
      </div>
      <div className="conformidade-eixo">
        <span>{serie[0].rotulo}</span><span>{serie[Math.floor(serie.length / 2)].rotulo}</span><span>{serie[serie.length - 1].rotulo}</span>
      </div>
    </div>
  );
}
