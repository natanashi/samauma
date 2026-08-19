'use client';

/* Portado de `telaGeradorRelatorios` em `src/telas/gerador.js`. */

import { Cabecalho, Cartao, Exportar, Kpi, Kpis, Pares } from '@/components/ui/Basicos';
import { GraficoRosca, Ranking } from '@/components/ui/Graficos';
import { useExportar } from '@/components/relatorio/useExportar';
import { agoraMs, Fmt, haDias } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { useDominio } from '@/state/hooks';

export default function PaginaGeradorRelatorios() {
  useDominio();
  const { aoCsv, aoPdf } = useExportar();
  const p = Painel.gerador(Sessao.gerador);
  const corte = haDias(30);
  const doMes = p.demandas.filter(d => d.status === 'COMPROVADA' && new Date(d.comprovante!.emitidoEm).getTime() >= corte);
  const ambientalMes = Painel.ambiental(doMes);
  const materiaisMes = Painel.porResiduo(doMes);

  return (
    <>
      <Cabecalho titulo="Relatórios" texto="Exportação do seu histórico completo, em planilha ou documento." />

      <Cartao titulo="Relatório mensal" sub={`Competência ${Fmt.mes(new Date(agoraMs()).toISOString())} · ${doMes.length} carga(s) comprovada(s)`}
        classe="acao-viva"
        acao={<div className="exportar">
          <button className="btn sec sm" onClick={() => aoCsv('mensal', { id: Sessao.gerador })}>CSV</button>
          <button className="btn sm" onClick={() => aoPdf('mensal', { id: Sessao.gerador })}>PDF</button>
        </div>}
        nota="O relatório mensal traz quantidade coletada, tipo de resíduo, quanto foi reciclado e o destino final de cada carga."
        corpo={
          <>
            <Kpis>
              <Kpi rotulo="Quantidade coletada" valor={Fmt.kg(ambientalMes.massa)} sub="pesada na balança do destino" />
              <Kpi rotulo="Quanto foi reciclado" valor={Fmt.kg(ambientalMes.reciclado)} sub={`${Fmt.percentual(ambientalMes.taxaRecuperacao, 0)} de recuperação`} tom="ok" />
              <Kpi rotulo="Rejeito ao aterro" valor={Fmt.kg(ambientalMes.rejeito)} sub="disposição final" tom="alerta" />
              <Kpi rotulo="Comprovantes" valor={doMes.length} sub="no período" tom="marca" />
            </Kpis>
            <div className="colunas dois-um" style={{ marginTop: 'var(--e4)' }}>
              <Cartao titulo="Tipo de resíduo" sub="Composição do mês" classe="sem-sombra" corpo={<GraficoRosca itens={materiaisMes} />} />
              <Cartao titulo="Destino final" sub="Declarado por quem recebeu" classe="sem-sombra"
                corpo={<Ranking itens={Painel.porDestino(doMes).map(d => ({ ...d, nota: d.destinoFinal }))} />} />
            </div>
          </>
        } />

      <Cartao titulo="Histórico completo" sub={`${p.total} demanda(s) registradas desde o início`}
        acao={<Exportar escopo="gerador" rotulo="Baixar tudo" aoCsv={e => aoCsv(e, { id: Sessao.gerador })} aoPdf={e => aoPdf(e, { id: Sessao.gerador })} />}
        nota="O CSV traz uma linha por demanda, com peso de campo, peso de balança, rejeito, destino final e comprovante."
        corpo={<Pares itens={[
          ['Demandas registradas', Fmt.numero(p.total)],
          ['Destinações comprovadas', Fmt.numero(p.comprovadas)],
          ['Massa destinada', Fmt.kg(p.ambiental.massa)],
          ['Massa recuperada', Fmt.kg(p.ambiental.reciclado)],
          ['Rejeito ao aterro', Fmt.kg(p.ambiental.rejeito)],
          ['Valor movimentado', Fmt.reais(p.financeiro.valor)],
          ['CO₂e evitado', Fmt.kg(Math.round(p.ambiental.co2Evitado))]
        ]} />} />
    </>
  );
}
