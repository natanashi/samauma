/* SAMAÚMA — metodologia, parâmetros e base legal.
   A tela existe para responder à pergunta que decide se um número pode ser
   usado: de onde ele veio. Tudo aqui é gerado a partir do próprio catálogo do
   domínio — se um parâmetro mudar no código, muda nesta tela também, sem
   ninguém precisar lembrar de atualizar texto. */

/* Natureza do dado: o sistema nunca soma naturezas diferentes no mesmo campo. */
const NATUREZAS = [
  ['declarado', 'Declarado', 'Informado por quem responde pelo resíduo. Vale como declaração, não como prova.'],
  ['medido', 'Medido', 'Aferido em balança, no destino. É o que sustenta o comprovante.'],
  ['calculado', 'Calculado', 'Derivado de outros dois valores por regra explícita, como a taxa de recuperação.'],
  ['parametro', 'Parâmetro de trabalho', 'Valor de referência adotado para a demonstração, a ser substituído por medição local.']
];

/* De onde vem cada dado que nao nasce aqui dentro, e o que impede o resto de
   entrar. Publicar a lista completa — inclusive o que nao deu — e a parte
   honesta da transparencia. */
const FONTES_EXTERNAS = [
  ['API de Contratos da Prefeitura', 'api.portovelho.ro.gov.br', 'ligada',
   'Contratos municipais do exercicio, consultados ao vivo no painel da Prefeitura. JSON publico, sem chave, com CORS liberado.'],
  ['Malha municipal do IBGE', 'servicodados.ibge.gov.br', 'ligada',
   'Limite oficial de Porto Velho desenhado no mapa, em GeoJSON, direto da fonte federal.'],
  ['OpenStreetMap', 'tile.openstreetmap.org', 'ligada',
   'Ruas, rio e referencias do mapa base. E a unica parte do sistema que exige internet.'],
  ['Portal de Dados Abertos do Municipio', 'dados.portovelho.ro.gov.br', 'bloqueada',
   'A API CKAN responde e traz empenhos, liquidacoes e pagamentos, mas nao envia cabecalho de CORS: o navegador nao consegue ler direto. Exige um servico intermediario, que o prototipo nao tem.'],
  ['GeoPortal da Prefeitura', 'geoportal.portovelho.ro.gov.br', 'pendente',
   'Nao foi localizado endereco publico de servico geografico padrao (WFS ou REST). Depende de indicacao da SMTI para trocar as coordenadas aproximadas pela camada oficial.'],
  ['SNIS — Serie Historica', 'app4.mdr.gov.br', 'pendente',
   'Linha de base municipal de residuos. Consulta publica por formulario; sem interface programavel.'],
  ['SINIR / MTR nacional', 'mtr.sinir.gov.br', 'pendente',
   'Manifesto e certificado de destinacao, quando exigiveis. Requer credenciamento de gerador, transportador e destinador.'],
  ['SEI municipal', 'processo administrativo', 'pendente',
   'Numero do processo, tipo documental e dossie. Requer homologacao da unidade gestora e da SMTI.']
];

const BASE_LEGAL = [
  ['Decreto Municipal nº 15.603, de 26/11/2018',
   'Cria o Cadastro de Grandes Geradores de Resíduos Sólidos de Porto Velho, considera grande gerador quem produz volume superior a 100 litros por dia e veda a coleta pública acima de 200 litros por dia, atribuindo ao gerador o custo de coleta, transporte e destinação. Institui a obrigatoriedade de apresentação do PGRS no licenciamento ambiental.'],
  ['Lei Complementar Municipal nº 199/2004, art. 147, § 4º',
   'Referência do enquadramento de volume adotada pelo decreto municipal.'],
  ['Lei Federal nº 12.305/2010 — Política Nacional de Resíduos Sólidos',
   'Obriga o grande gerador a elaborar Plano de Gerenciamento de Resíduos Sólidos e a disponibilizá-lo ao poder público. É a norma que o decreto municipal regulamenta.'],
  ['Lei Federal nº 11.445/2007',
   'Prioriza a participação de organizações de catadores na prestação de serviços de limpeza urbana.'],
  ['Lei Federal nº 14.133/2021, art. 75, IV, "j"',
   'Permite contratação direta de cooperativa de catadores para coleta, processamento e comercialização de recicláveis. Aplica-se ao resíduo do próprio município e não alcança a escolha de prestador por gerador privado, que permanece livre.'],
  ['Lei Federal nº 13.709/2018 — LGPD',
   'Dado de CNPJ é público e não é dado pessoal. Nome, produção e renda de catador são dados pessoais: exibição individual restrita ao próprio titular e à coordenação da organização; nos painéis de gestão, apenas agregado.']
];

function telaMetodologia() {
  const materiais = RESIDUOS.map(r => `
    <tr>
      <td><span class="ponto-cor" style="--cor:${r.cor}"></span>${esc(r.nome)}</td>
      <td class="num">${r.preco ? Fmt.reais(r.preco) : '—'}</td>
      <td class="num">${r.co2 ? Fmt.numero(r.co2, 1) : '—'}</td>
      <td class="num">${Fmt.percentual(r.perdaTriagem * 100, 0)}</td>
      <td>${r.recuperavel ? '<span class="pino ok">volta ao ciclo</span>' : '<span class="pino erro">aterro</span>'}</td>
    </tr>`).join('');

  return `
    ${cabecalho('Metodologia e fontes',
      'De onde vem cada número, com que natureza e sob qual norma')}

    ${aviso('Nenhum número aparece sem natureza declarada',
      'O sistema separa o que foi declarado, o que foi medido em balança, o que foi calculado por regra e o que é parâmetro de trabalho. As quatro naturezas nunca são somadas no mesmo campo.')}

    <div class="colunas dois-um">
      ${cartao({
        titulo: 'Natureza do dado',
        sub: 'A regra que atravessa todas as telas',
        corpo: `<div class="lista-def">${NATUREZAS.map(([id, nome, texto]) =>
          `<div class="def"><span class="pino ${id === 'medido' ? 'ok' : id === 'parametro' ? 'alerta' : ''}">${esc(nome)}</span><p>${esc(texto)}</p></div>`).join('')}</div>`
      })}

      ${cartao({
        titulo: 'Regras de decisão',
        sub: 'Os limiares que o sistema aplica',
        corpo: pares([
          ['Tolerância entre campo e balança', `${Fmt.percentual(TOLERANCIA * 100, 0)} ou ${Fmt.kg(TOLERANCIA_MINIMA_KG)}, o que for maior`],
          ['Acima da tolerância', 'abre pendência para a Prefeitura, sem penalidade automática'],
          ['Sem destinação comprovada', `${JANELA_DESTINACAO} dias rebaixam a situação do gerador`],
          ['PGRS vencendo', `alerta a partir de ${JANELA_PGRS} dias do vencimento`],
          ['Correção de registro', 'entra como evento novo; o valor anterior permanece na trilha']
        ])
      })}
    </div>

    ${cartao({
      titulo: 'Parâmetros por material',
      sub: 'Preço, emissão evitada e perda de triagem — parâmetros de trabalho, não valores oficiais',
      corpo: `<div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Material</th><th class="num">Preço por kg</th><th class="num">CO₂e por kg</th><th class="num">Perda na triagem</th><th>Destino</th></tr></thead>
        <tbody>${materiais}</tbody>
      </table></div>`,
      nota: `Tarifa de disposição em aterro adotada: ${Fmt.reais(TARIFA_ATERRO)} por tonelada. ` +
        'Estes valores sustentam apenas a demonstração. No piloto, o preço passa a vir da nota de venda da própria cooperativa, ' +
        'e a perda de triagem deixa de ser estimada por tabela para ser medida lote a lote, que é o dado correto.'
    })}

    ${cartao({
      titulo: 'Fontes externas e o que consumimos de cada uma',
      sub: 'Inclusive o que não foi possível ligar, e por quê',
      corpo: `<div class="tabela-rolagem"><table class="tabela">
        <thead><tr><th>Fonte</th><th>Endereço</th><th>Situação</th><th>O que entra ou o que falta</th></tr></thead>
        <tbody>${FONTES_EXTERNAS.map(([nome, onde, estado, texto]) => `
          <tr>
            <td><b>${esc(nome)}</b></td>
            <td><code>${esc(onde)}</code></td>
            <td><span class="pino ${estado === 'ligada' ? 'ok' : estado === 'bloqueada' ? 'erro' : 'alerta'}">${estado}</span></td>
            <td>${esc(texto)}</td>
          </tr>`).join('')}</tbody>
      </table></div>`,
      nota: 'O sistema não copia dado de fonte oficial para dentro de si: consulta na hora e mostra a origem. Onde a consulta direta não é possível, a tela diz o motivo em vez de simular o número.'
    })}

    ${cartao({
      titulo: 'Base legal',
      sub: 'O que sustenta o enquadramento e a competência',
      corpo: `<div class="lista-def">${BASE_LEGAL.map(([norma, texto]) =>
        `<div class="def"><b>${esc(norma)}</b><p>${esc(texto)}</p></div>`).join('')}</div>`,
      nota: 'A decisão administrativa permanece no processo oficial. O sistema organiza a evidência; não notifica, não autua e não substitui o SEI.'
    })}

    ${cartao({
      titulo: 'Origem dos dados territoriais',
      sub: 'O que é real e o que é aproximado',
      corpo: pares([
        ['Bairros e zonas', 'reais, de Porto Velho'],
        ['Ruas e rio no mapa', 'OpenStreetMap, reais'],
        ['Coordenadas dos pontos de coleta', 'aproximadas — não vêm do GeoPortal municipal'],
        ['Estabelecimentos, pessoas e documentos', 'fictícios'],
        ['Massas e valores da demonstração', 'gerados por cenário, com semente fixa']
      ]),
      nota: 'Substituir a tabela de pontos pela camada oficial do GeoPortal não altera nenhuma outra parte do sistema: todo o resto lê o ponto pelo identificador.'
    })}

    ${cartao({
      titulo: 'O que o sistema ainda não faz',
      sub: 'Declarado por escolha, não por esquecimento',
      corpo: `<div class="lista-def">
        <div class="def"><b>Não emite ato administrativo</b><p>Não há notificação, prazo processual nem ciência do interessado. Quem notifica é o processo no SEI.</p></div>
        <div class="def"><b>Não substitui o MTR</b><p>Onde o manifesto é exigível, a obrigação permanece no sistema nacional do SINIR. O SAMAÚMA referencia, não emite.</p></div>
        <div class="def"><b>Não trata resíduo de serviço de saúde</b><p>O RSS tem regra e plano próprios e está fora deste modelo.</p></div>
        <div class="def"><b>Não classifica resíduo por norma técnica</b><p>A tabela de materiais é comercial. A correspondência com a classificação normativa é requisito para uso oficial.</p></div>
      </div>`
    })}`;
}
