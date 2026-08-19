'use client';

/* Portado de `telaDestinoRelatorios` em `src/telas/destinatario.js`. */

import { useComprovante } from '@/components/comprovante/ComprovanteProvider';
import { useExportar } from '@/components/relatorio/useExportar';
import { Cabecalho, Cartao, Exportar, Kpi, Kpis } from '@/components/ui/Basicos';
import { Ranking } from '@/components/ui/Graficos';
import { ListaComprovantes } from '@/components/ui/Listas';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { Sessao } from '@/lib/dominio/sessao';
import { useDominio } from '@/state/hooks';

export default function PaginaCooperativaRelatorios() {
  useDominio();
  const { aoCsv, aoPdf } = useExportar();
  const { abrir } = useComprovante();
  const p = Painel.destino(Sessao.destino.id);

  return (
    <>
      <Cabecalho titulo="Relatórios" texto="Exportação de tudo que esta unidade recebeu e destinou." />

      <Cartao titulo="Relatório de recebimentos" sub={`${p.atendimentos} carga(s) confirmada(s) · ${Fmt.kg(p.massa)}`}
        classe="acao-viva"
        acao={<Exportar escopo="destinatario" rotulo="Baixar" aoCsv={e => aoCsv(e, { id: Sessao.destino.id })} aoPdf={e => aoPdf(e, { id: Sessao.destino.id })} />}
        nota="O CSV traz lote, data/hora, origem, peso de campo, peso de balança, rejeito e destino declarado."
        corpo={
          <Kpis>
            <Kpi rotulo="Massa recebida" valor={Fmt.toneladas(p.massa)} sub="pesada nesta balança" tom="marca" />
            <Kpi rotulo="Recuperado" valor={Fmt.toneladas(p.ambiental.reciclado)} sub={`${Fmt.percentual(p.ambiental.taxaRecuperacao, 0)} do recebido`} tom="ok" />
            <Kpi rotulo="Rejeito" valor={Fmt.toneladas(p.ambiental.rejeito)} sub="encaminhado ao aterro" tom="alerta" />
            <Kpi rotulo="Comprovantes" valor={p.atendimentos} sub="emitidos com esta unidade" />
          </Kpis>
        } />

      <div className="colunas dois-um">
        <Cartao titulo="Geradores atendidos" sub="De quais estabelecimentos veio o material"
          corpo={<Ranking itens={p.geradores.map(g => ({ ...g, nota: g.n + ' carga(s)' }))} />} />
        <Cartao titulo="Comprovantes emitidos" sub={`${p.comprovantes.length} mais recentes`}
          corpo={<ListaComprovantes demandas={p.comprovantes} visao="destinatario" aoVer={abrir} />} />
      </div>
    </>
  );
}
