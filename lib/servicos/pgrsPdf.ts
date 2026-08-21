/* SAMAÚMA — PGRS em PDF.
   Monta o mesmo roteiro de seções do modelo padrão (identificação,
   caracterização, classificação, manejo e assinatura) usando jsPDF +
   jspdf-autotable, para anexar ao cadastro do gerador sem depender de
   "imprimir e salvar como PDF". */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GRUPOS_MANEJADOS, GRUPOS_RESIDUO, type DadosPgrs } from '../dominio/pgrs';
import { baixarBlob, carimboArquivo } from './arquivo';

const MARGEM = 12;
const COR_TITULO: [number, number, number] = [31, 107, 74];
const COR_TEXTO: [number, number, number] = [44, 51, 47];

function finalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}

function garantirEspaco(doc: jsPDF, y: number, altura: number): number {
  const alturaPagina = doc.internal.pageSize.getHeight();
  if (y + altura > alturaPagina - MARGEM) {
    doc.addPage();
    return MARGEM;
  }
  return y;
}

function titulo(doc: jsPDF, texto: string, y: number): number {
  y = garantirEspaco(doc, y, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COR_TITULO);
  doc.text(texto, MARGEM, y);
  doc.setTextColor(...COR_TEXTO);
  return y + 6;
}

function subtitulo(doc: jsPDF, texto: string, y: number): number {
  y = garantirEspaco(doc, y, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(texto, MARGEM, y);
  return y + 5;
}

function tabelaPares(doc: jsPDF, pares: [string, string][], y: number): number {
  y = garantirEspaco(doc, y, 12);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGEM, right: MARGEM },
    body: pares.map(([rotulo, valor]) => [rotulo, valor || '—']),
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.6, textColor: COR_TEXTO },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 }, 1: { cellWidth: 'auto' } }
  });
  return finalY(doc) + 6;
}

function tabelaGrade(doc: jsPDF, cabecalho: string[], linhas: string[][], y: number): number {
  y = garantirEspaco(doc, y, 14);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGEM, right: MARGEM },
    head: [cabecalho],
    body: linhas.length ? linhas : [cabecalho.map(() => '—')],
    theme: 'grid',
    styles: { fontSize: 8.3, cellPadding: 2, textColor: COR_TEXTO, overflow: 'linebreak' },
    headStyles: { fillColor: [31, 107, 74], textColor: 255, fontStyle: 'bold' }
  });
  return finalY(doc) + 6;
}

export function gerarPdfPgrs(dados: DadosPgrs): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGEM;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COR_TITULO);
  doc.text('PLANO DE GERENCIAMENTO DE RESÍDUOS', MARGEM, y);
  y += 6;
  doc.text('DE SERVIÇOS DE SAÚDE (PGRSS)', MARGEM, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);
  doc.text(dados.identificacao.razaoSocial || 'Estabelecimento não identificado', MARGEM, y);
  y += 8;

  const i = dados.identificacao;
  y = titulo(doc, '2 — IDENTIFICAÇÃO DO ESTABELECIMENTO', y);
  y = tabelaPares(doc, [
    ['Razão social', i.razaoSocial],
    ['Nome fantasia', i.nomeFantasia],
    ['CNPJ', i.cnpj],
    ['Quanto à propriedade', i.propriedade],
    ['Endereço', i.endereco],
    ['Fone/Fax', i.foneFax],
    ['Horário de funcionamento', i.horarioFuncionamento],
    ['Tipo de estabelecimento', i.tipoEstabelecimento],
    ['Município/UF', i.municipioUf],
    ['Responsável técnico', i.responsavelTecnico]
  ], y);

  y = titulo(doc, '3 — CARACTERIZAÇÃO DO ESTABELECIMENTO', y);
  y = subtitulo(doc, '3.1 Recursos pessoais', y);
  y = tabelaGrade(doc, ['Função', 'Quantidade', 'Tipo de contrato'],
    dados.recursosPessoais.filter(r => r.funcao || r.quantidade).map(r => [r.funcao, r.quantidade, r.tipoContrato]), y);
  y = subtitulo(doc, '3.2 Edificação', y);
  const e = dados.edificacao;
  y = tabelaPares(doc, [
    ['Área total do terreno', e.areaTerreno ? `${e.areaTerreno} m²` : ''],
    ['Quantidade de prédios', e.qtdPredios],
    ['Quantidade de salas', e.qtdSalas],
    ['Área total construída', e.areaConstruida ? `${e.areaConstruida} m²` : '']
  ], y);

  y = titulo(doc, '4 — CARACTERIZAÇÃO DAS ESPECIALIDADES E SERVIÇOS', y);
  y = tabelaGrade(doc, ['Descrição dos ambientes', 'Quantidade'],
    dados.ambientes.filter(a => a.descricao).map(a => [a.descricao, a.quantidade]), y);

  y = titulo(doc, '5 — CARACTERIZAÇÃO DOS ASPECTOS AMBIENTAIS', y);
  y = tabelaGrade(doc, ['Local de geração do resíduo', 'Descrição do resíduo', 'Classificação/Grupo'],
    dados.aspectosAmbientais.filter(a => a.local).map(a => [a.local, a.residuo, a.classificacao]), y);
  y = subtitulo(doc, '5.1 Abastecimento de água', y);
  y = tabelaPares(doc, [['Fonte', dados.abastecimentoAgua.fonte], ['Observações', dados.abastecimentoAgua.observacoes]], y);
  y = subtitulo(doc, '5.2 Efluentes líquidos', y);
  y = tabelaPares(doc, [['Destino', dados.efluentes.destino], ['Observações', dados.efluentes.observacoes]], y);

  y = titulo(doc, '6 — CLASSIFICAÇÃO DOS RESÍDUOS', y);
  y = tabelaGrade(doc, ['Grupo', 'Descrição', 'Peso estimado'],
    GRUPOS_RESIDUO.map(g => [g.nome, dados.classificacaoResiduos[g.id].descricao, dados.classificacaoResiduos[g.id].pesoEstimado]), y);

  y = titulo(doc, '7 — SEGREGAÇÃO, ACONDICIONAMENTO E IDENTIFICAÇÃO', y);
  y = tabelaGrade(doc, ['Local', 'Resíduo gerado', 'Grupo', 'Estado físico', 'Segregação na origem', 'Coleta e transporte'],
    dados.segregacao.filter(s => s.local).map(s => [s.local, s.residuo, s.grupo, s.estadoFisico, s.segregacaoOrigem, s.coletaTransporte]), y);

  y = titulo(doc, '8 — COLETA INTERNA', y);
  y = subtitulo(doc, 'Da fonte de geração para o armazenamento temporário', y);
  y = tabelaGrade(doc, ['Grupo', 'Como é manejado'],
    GRUPOS_MANEJADOS.map(g => [`Grupo ${g}`, dados.coletaInterna.fonteParaTemporario[g]]), y);
  y = subtitulo(doc, 'Do abrigo temporário para o abrigo externo', y);
  y = tabelaGrade(doc, ['Grupo', 'Como é manejado'],
    GRUPOS_MANEJADOS.map(g => [`Grupo ${g}`, dados.coletaInterna.temporarioParaExterno[g]]), y);

  y = titulo(doc, '9 — ARMAZENAMENTO TEMPORÁRIO', y);
  y = tabelaGrade(doc, ['Grupo', 'Abrigo', 'Revestimento', 'Exclusivo para RSS'],
    (['B', 'A', 'E', 'D'] as const).map(g => {
      const a = dados.armazenamentoTemporario[g];
      return [`Grupo ${g}`, a.abrigo, a.revestimento, a.exclusivoRss === 'sim' ? 'Sim' : a.exclusivoRss === 'nao' ? 'Não' : ''];
    }), y);

  y = titulo(doc, '10 — ARMAZENAMENTO EXTERNO', y);
  y = tabelaGrade(doc, ['Grupo', 'Abrigo', 'Localizado em'],
    (['D', 'A', 'B', 'E'] as const).map(g => {
      const a = dados.armazenamentoExterno[g];
      return [`Grupo ${g}`, a.abrigo, a.localizado];
    }), y);

  y = titulo(doc, '11 — COLETA EXTERNA', y);
  const ce = dados.coletaExterna;
  y = tabelaPares(doc, [
    ['Grupo(s)', ce.grupos],
    ['Tipo de resíduos', ce.tipoResiduos],
    ['Veículo/equipamento', ce.veiculoEquipamento],
    ['EPIs', ce.epis],
    ['Frequência — Grupo D', ce.frequenciaD],
    ['Frequência — demais grupos', ce.frequenciaOutros],
    ['Hora — Grupo D', ce.horaD],
    ['Hora — demais grupos', ce.horaOutros],
    ['Distância até a disposição final', ce.distanciaDisposicaoFinal]
  ], y);

  y = titulo(doc, '12 — DESTINAÇÃO FINAL', y);
  const df = dados.destinacaoFinal;
  y = tabelaPares(doc, [
    ['Grupo', df.grupo],
    ['Resíduo', df.residuo],
    ['Disposição final', df.disposicaoFinal],
    ['Média mensal (kg/mês)', df.mediaMensalKg],
    ['Média mensal (litros/mês)', df.mediaMensalLitros],
    ['Custo (R$/tonelada)', df.custoTonelada],
    ['Empresa responsável', df.empresaNome],
    ['CNPJ da empresa', df.empresaCnpj],
    ['Endereço da empresa', df.empresaEndereco],
    ['Telefone da empresa', df.empresaTelefone],
    ['Responsável técnico da empresa', df.empresaResponsavel]
  ], y);

  y = titulo(doc, '13 — PROCESSOS DE HIGIENIZAÇÃO DOS MATERIAIS E EQUIPAMENTOS', y);
  y = tabelaGrade(doc, ['Área/item', 'Procedimento', 'EPIs', 'Local'],
    dados.higienizacao.map(h => [h.areaItem, h.procedimento, h.epis, h.local]), y);

  y = garantirEspaco(doc, y, 30);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const assinatura = dados.assinatura;
  doc.text(`${assinatura.local || 'Porto Velho-RO'}, ${assinatura.data || '____ de ____________ de ______'}.`, MARGEM, y);
  y += 20;
  doc.text('________________________________________', MARGEM, y);
  y += 5;
  doc.text(assinatura.responsavel || 'Responsável pelo PGRS', MARGEM, y);

  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 150, 144);
    doc.text(`SAMAÚMA · PGRSS gerado pelo sistema · página ${p}/${paginas}`, MARGEM,
      doc.internal.pageSize.getHeight() - 6);
  }

  return doc.output('blob');
}

export function baixarPdfPgrs(dados: DadosPgrs) {
  const blob = gerarPdfPgrs(dados);
  baixarBlob(blob, `samauma-pgrs-${carimboArquivo()}.pdf`);
}
