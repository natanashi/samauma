'use client';

/* Portado de `telaGeradorDocumentos` em `src/telas/gerador.js`. */

import Link from 'next/link';
import { Aviso, Cabecalho, Cartao, Exportar, Pares, SeloDestinacao } from '@/components/ui/Basicos';
import { useExportar } from '@/components/relatorio/useExportar';
import { ListaComprovantes } from '@/components/ui/Listas';
import { Catalogo } from '@/lib/dominio/catalogo';
import { Fmt } from '@/lib/dominio/formato';
import { Painel } from '@/lib/dominio/indicadores';
import { soDigitos } from '@/lib/dominio/pgrs';
import { Sessao } from '@/lib/dominio/sessao';
import { baixarDocxPgrs } from '@/lib/servicos/pgrsDocx';
import { baixarPdfPgrs } from '@/lib/servicos/pgrsPdf';
import { useDominio } from '@/state/hooks';
import { useComprovante } from '@/components/comprovante/ComprovanteProvider';

export default function PaginaGeradorDocumentos() {
  useDominio();
  const { abrir } = useComprovante();
  const { aoCsv, aoPdf } = useExportar();
  const p = Painel.gerador(Sessao.gerador);
  const plano = p.situacao.pgrs;
  const pgrsCompleto = p.cadastro.pgrsCompleto;

  return (
    <>
      <Cabecalho titulo="Documentos e comprovação" texto="PGRS, selo de destinação e os comprovantes emitidos no seu CNPJ." />

      <div className="colunas dois-um">
        <Cartao titulo="Plano de Gerenciamento de Resíduos Sólidos" sub={plano ? plano.numero : 'não cadastrado'}
          classe={plano && plano.vencido ? 'destaque-erro' : ''}
          corpo={plano ? (
            <>
              <Pares itens={[
                ['Número', plano.numero],
                ['Validade', Fmt.data(plano.validade)],
                ['Situação', plano.vencido
                  ? <span className="erro">{`vencido há ${Math.abs(plano.dias)} dias`}</span>
                  : plano.vencendo ? <span className="alerta">{`vence em ${plano.dias} dias`}</span> : <span className="ok">{`válido por ${plano.dias} dias`}</span>],
                ['Responsável técnico', 'Registro no protocolo municipal'],
                ['Volume declarado', Fmt.kg(p.cadastro.volumeMes) + ' / mês']
              ]} />
              <div className="acoes-form">
                <button className="btn sec" onClick={() => aoPdf('gerador', { id: Sessao.gerador })}>Baixar dossiê em PDF</button>
                {pgrsCompleto && (
                  <>
                    <button className="btn sec" onClick={() => baixarPdfPgrs(pgrsCompleto)}>Baixar PGRSS completo (PDF)</button>
                    <button className="btn sec" onClick={() => baixarDocxPgrs(pgrsCompleto)}>Baixar PGRSS completo (Word)</button>
                    <Link href={`/pgrs/gerar?cnpj=${soDigitos(p.cadastro.cnpj)}&retorno=documentos`} className="btn fantasma">Corrigir PGRS</Link>
                  </>
                )}
                <span className="ajuda">O dossiê reúne situação, massa destinada e a lista de processos.</span>
              </div>
            </>
          ) : <Aviso tom="problema" titulo="Sem PGRS cadastrado" texto="Enquanto não houver plano no sistema, o gerador permanece irregular." />} />
        <Cartao titulo="Selo de destinação" sub="Emitido quando há prova no período"
          corpo={<>
            <SeloDestinacao selo={p.selo} />
            {p.selo.valido && <Aviso titulo="Como conferir" texto="O código do selo aponta para a página pública de verificação, que mostra as mesmas cargas listadas aqui." />}
          </>} />
      </div>

      <Cartao titulo="Comprovantes de destinação" sub={`${p.comprovadas} documento(s) emitido(s)`}
        acao={<Exportar escopo="gerador" aoCsv={e => aoCsv(e, { id: Sessao.gerador })} aoPdf={e => aoPdf(e, { id: Sessao.gerador })} />}
        corpo={<ListaComprovantes demandas={p.comprovantes} visao="gerador" aoVer={abrir} />} />

      <Cartao titulo="Operador contratado" sub="Quem executa a coleta para este gerador"
        corpo={p.operador
          ? <Pares itens={[
            ['Operador', p.operador.nome],
            ['Tipo', p.operador.tipo === 'cooperativa' ? 'Cooperativa de catadores' : 'Catador autônomo'],
            ['Instrumento', p.operador.detalhe],
            ['Ponto de coleta', Catalogo.endereco(p.cadastro.ponto)],
            ['Acesso', p.ponto.acesso]
          ]} />
          : <Aviso tom="problema" titulo="Sem operador contratado" texto="As demandas vão para a fila aberta e podem ser aceitas por qualquer catador cadastrado." />} />
    </>
  );
}
