/* SAMAÚMA — PGRS em Word (.docx), mesmo roteiro de seções do PDF, gerado com
   a biblioteca `docx` para produzir um arquivo editável de verdade — não uma
   impressão de tela. */

import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow,
  TextRun, WidthType
} from 'docx';
import { GRUPOS_MANEJADOS, GRUPOS_RESIDUO, type DadosPgrs } from '../dominio/pgrs';
import { baixarBlob, carimboArquivo } from './arquivo';

const COR_TITULO = '1f6b4a';

function h(texto: string) {
  return new Paragraph({ text: texto, heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 } });
}

function h3(texto: string) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [new TextRun({ text: texto, bold: true, size: 20 })]
  });
}

function celula(texto: string, opcoes: { negrito?: boolean; largura?: number } = {}) {
  return new TableCell({
    width: opcoes.largura ? { size: opcoes.largura, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: texto || '—', bold: opcoes.negrito, size: 18 })] })]
  });
}

function celulaCabecalho(texto: string) {
  return new TableCell({
    shading: { fill: COR_TITULO },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: texto, bold: true, size: 18, color: 'FFFFFF' })] })]
  });
}

function tabelaPares(pares: [string, string][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pares.map(([rotulo, valor]) => new TableRow({
      children: [celula(rotulo, { negrito: true, largura: 32 }), celula(valor, { largura: 68 })]
    }))
  });
}

function tabelaGrade(cabecalho: string[], linhas: string[][]) {
  const corpo = linhas.length ? linhas : [cabecalho.map(() => '—')];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: cabecalho.map(celulaCabecalho) }),
      ...corpo.map(linha => new TableRow({ children: linha.map(v => celula(v)) }))
    ]
  });
}

const SEM_BORDA = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
};

export async function gerarDocxPgrs(dados: DadosPgrs): Promise<Blob> {
  const i = dados.identificacao;
  const e = dados.edificacao;
  const ce = dados.coletaExterna;
  const df = dados.destinacaoFinal;
  const assinatura = dados.assinatura;

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 40 },
          children: [new TextRun({ text: 'PLANO DE GERENCIAMENTO DE RESÍDUOS DE SERVIÇOS DE SAÚDE (PGRSS)', bold: true, size: 30, color: COR_TITULO })]
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [new TextRun({ text: i.razaoSocial || 'Estabelecimento não identificado', size: 22 })]
        }),

        h('2 — Identificação do estabelecimento'),
        tabelaPares([
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
        ]),

        h('3 — Caracterização do estabelecimento'),
        h3('3.1 Recursos pessoais'),
        tabelaGrade(['Função', 'Quantidade', 'Tipo de contrato'],
          dados.recursosPessoais.filter(r => r.funcao || r.quantidade).map(r => [r.funcao, r.quantidade, r.tipoContrato])),
        h3('3.2 Edificação'),
        tabelaPares([
          ['Área total do terreno', e.areaTerreno ? `${e.areaTerreno} m²` : ''],
          ['Quantidade de prédios', e.qtdPredios],
          ['Quantidade de salas', e.qtdSalas],
          ['Área total construída', e.areaConstruida ? `${e.areaConstruida} m²` : '']
        ]),

        h('4 — Caracterização das especialidades e serviços'),
        tabelaGrade(['Descrição dos ambientes', 'Quantidade'],
          dados.ambientes.filter(a => a.descricao).map(a => [a.descricao, a.quantidade])),

        h('5 — Caracterização dos aspectos ambientais'),
        tabelaGrade(['Local de geração do resíduo', 'Descrição do resíduo', 'Classificação/Grupo'],
          dados.aspectosAmbientais.filter(a => a.local).map(a => [a.local, a.residuo, a.classificacao])),
        h3('5.1 Abastecimento de água'),
        tabelaPares([['Fonte', dados.abastecimentoAgua.fonte], ['Observações', dados.abastecimentoAgua.observacoes]]),
        h3('5.2 Efluentes líquidos'),
        tabelaPares([['Destino', dados.efluentes.destino], ['Observações', dados.efluentes.observacoes]]),

        h('6 — Classificação dos resíduos'),
        tabelaGrade(['Grupo', 'Descrição', 'Peso estimado'],
          GRUPOS_RESIDUO.map(g => [g.nome, dados.classificacaoResiduos[g.id].descricao, dados.classificacaoResiduos[g.id].pesoEstimado])),

        h('7 — Segregação, acondicionamento e identificação'),
        tabelaGrade(['Local', 'Resíduo gerado', 'Grupo', 'Estado físico', 'Segregação na origem', 'Coleta e transporte'],
          dados.segregacao.filter(s => s.local).map(s => [s.local, s.residuo, s.grupo, s.estadoFisico, s.segregacaoOrigem, s.coletaTransporte])),

        h('8 — Coleta interna'),
        h3('Da fonte de geração para o armazenamento temporário'),
        tabelaGrade(['Grupo', 'Como é manejado'],
          GRUPOS_MANEJADOS.map(g => [`Grupo ${g}`, dados.coletaInterna.fonteParaTemporario[g]])),
        h3('Do abrigo temporário para o abrigo externo'),
        tabelaGrade(['Grupo', 'Como é manejado'],
          GRUPOS_MANEJADOS.map(g => [`Grupo ${g}`, dados.coletaInterna.temporarioParaExterno[g]])),

        h('9 — Armazenamento temporário'),
        tabelaGrade(['Grupo', 'Abrigo', 'Revestimento', 'Exclusivo para RSS'],
          (['B', 'A', 'E', 'D'] as const).map(g => {
            const a = dados.armazenamentoTemporario[g];
            return [`Grupo ${g}`, a.abrigo, a.revestimento, a.exclusivoRss === 'sim' ? 'Sim' : a.exclusivoRss === 'nao' ? 'Não' : ''];
          })),

        h('10 — Armazenamento externo'),
        tabelaGrade(['Grupo', 'Abrigo', 'Localizado em'],
          (['D', 'A', 'B', 'E'] as const).map(g => {
            const a = dados.armazenamentoExterno[g];
            return [`Grupo ${g}`, a.abrigo, a.localizado];
          })),

        h('11 — Coleta externa'),
        tabelaPares([
          ['Grupo(s)', ce.grupos],
          ['Tipo de resíduos', ce.tipoResiduos],
          ['Veículo/equipamento', ce.veiculoEquipamento],
          ['EPIs', ce.epis],
          ['Frequência — Grupo D', ce.frequenciaD],
          ['Frequência — demais grupos', ce.frequenciaOutros],
          ['Hora — Grupo D', ce.horaD],
          ['Hora — demais grupos', ce.horaOutros],
          ['Distância até a disposição final', ce.distanciaDisposicaoFinal]
        ]),

        h('12 — Destinação final'),
        tabelaPares([
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
        ]),

        h('13 — Processos de higienização dos materiais e equipamentos'),
        tabelaGrade(['Área/item', 'Procedimento', 'EPIs', 'Local'],
          dados.higienizacao.map(hig => [hig.areaItem, hig.procedimento, hig.epis, hig.local])),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({
            children: [new TableCell({
              borders: SEM_BORDA,
              margins: { top: 400, bottom: 100 },
              children: [
                new Paragraph({ text: `${assinatura.local || 'Porto Velho-RO'}, ${assinatura.data || '____ de ____________ de ______'}.`, spacing: { after: 480 } }),
                new Paragraph({ text: '________________________________________' }),
                new Paragraph({ text: assinatura.responsavel || 'Responsável pelo PGRS' })
              ]
            })]
          })]
        })
      ]
    }]
  });

  return Packer.toBlob(doc);
}

export async function baixarDocxPgrs(dados: DadosPgrs) {
  const blob = await gerarDocxPgrs(dados);
  baixarBlob(blob, `samauma-pgrs-${carimboArquivo()}.docx`);
}
