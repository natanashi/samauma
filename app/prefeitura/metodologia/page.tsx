'use client';

/* Portado de `telaMetodologia` em `src/telas/metodologia.js`. */

import { Aviso, Cabecalho, Cartao, Pares, Pino } from '@/components/ui/Basicos';
import { RESIDUOS, TARIFA_ATERRO, TOLERANCIA, TOLERANCIA_MINIMA_KG } from '@/lib/dominio/catalogo';
import { JANELA_DESTINACAO, JANELA_PGRS } from '@/lib/dominio/regulatorio';
import { Fmt } from '@/lib/dominio/formato';
import { useDominio } from '@/state/hooks';

const NATUREZAS: [string, string, string][] = [
  ['declarado', 'Declarado', 'Informado por quem responde pelo resíduo. Vale como declaração, não como prova.'],
  ['medido', 'Medido', 'Aferido em balança, no destino. É o que sustenta o comprovante.'],
  ['calculado', 'Calculado', 'Derivado de outros dois valores por regra explícita, como a taxa de recuperação.'],
  ['parametro', 'Parâmetro de trabalho', 'Valor de referência adotado para a demonstração, a ser substituído por medição local.']
];

const FONTES_EXTERNAS: [string, string, string, string][] = [
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

const BASE_LEGAL: [string, string][] = [
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

export default function PaginaMetodologia() {
  useDominio();

  return (
    <>
      <Cabecalho titulo="Metodologia e fontes" texto="De onde vem cada número, com que natureza e sob qual norma" />

      <Aviso titulo="Nenhum número aparece sem natureza declarada"
        texto="O sistema separa o que foi declarado, o que foi medido em balança, o que foi calculado por regra e o que é parâmetro de trabalho. As quatro naturezas nunca são somadas no mesmo campo." />

      <div className="colunas dois-um">
        <Cartao titulo="Natureza do dado" sub="A regra que atravessa todas as telas"
          corpo={<div className="lista-def">
            {NATUREZAS.map(([id, nome, texto]) => (
              <div className="def" key={id}><Pino rotulo={nome} tom={id === 'medido' ? 'ok' : id === 'parametro' ? 'alerta' : ''} /><p>{texto}</p></div>
            ))}
          </div>} />

        <Cartao titulo="Regras de decisão" sub="Os limiares que o sistema aplica"
          corpo={<Pares itens={[
            ['Tolerância entre campo e balança', `${Fmt.percentual(TOLERANCIA * 100, 0)} ou ${Fmt.kg(TOLERANCIA_MINIMA_KG)}, o que for maior`],
            ['Acima da tolerância', 'abre pendência para a Prefeitura, sem penalidade automática'],
            ['Sem destinação comprovada', `${JANELA_DESTINACAO} dias rebaixam a situação do gerador`],
            ['PGRS vencendo', `alerta a partir de ${JANELA_PGRS} dias do vencimento`],
            ['Correção de registro', 'entra como evento novo; o valor anterior permanece na trilha']
          ]} />} />
      </div>

      <Cartao titulo="Parâmetros por material" sub="Preço, emissão evitada e perda de triagem — parâmetros de trabalho, não valores oficiais"
        nota={`Tarifa de disposição em aterro adotada: ${Fmt.reais(TARIFA_ATERRO)} por tonelada. Estes valores sustentam apenas a demonstração. No piloto, o preço passa a vir da nota de venda da própria cooperativa, e a perda de triagem deixa de ser estimada por tabela para ser medida lote a lote, que é o dado correto.`}
        corpo={
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead><tr><th>Material</th><th className="num">Preço por kg</th><th className="num">CO₂e por kg</th><th className="num">Perda na triagem</th><th>Destino</th></tr></thead>
              <tbody>
                {RESIDUOS.map(r => (
                  <tr key={r.id}>
                    <td><span className="ponto-cor" style={{ ['--cor' as string]: r.cor }}></span>{r.nome}</td>
                    <td className="num">{r.preco ? Fmt.reais(r.preco) : '—'}</td>
                    <td className="num">{r.co2 ? Fmt.numero(r.co2, 1) : '—'}</td>
                    <td className="num">{Fmt.percentual(r.perdaTriagem * 100, 0)}</td>
                    <td>{r.recuperavel ? <span className="pino ok">volta ao ciclo</span> : <span className="pino erro">aterro</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        } />

      <Cartao titulo="Fontes externas e o que consumimos de cada uma" sub="Inclusive o que não foi possível ligar, e por quê"
        nota="O sistema não copia dado de fonte oficial para dentro de si: consulta na hora e mostra a origem. Onde a consulta direta não é possível, a tela diz o motivo em vez de simular o número."
        corpo={
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead><tr><th>Fonte</th><th>Endereço</th><th>Situação</th><th>O que entra ou o que falta</th></tr></thead>
              <tbody>
                {FONTES_EXTERNAS.map(([nome, onde, estado, texto]) => (
                  <tr key={nome}>
                    <td><b>{nome}</b></td>
                    <td><code>{onde}</code></td>
                    <td><span className={`pino ${estado === 'ligada' ? 'ok' : estado === 'bloqueada' ? 'erro' : 'alerta'}`}>{estado}</span></td>
                    <td>{texto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        } />

      <Cartao titulo="Base legal" sub="O que sustenta o enquadramento e a competência"
        nota="A decisão administrativa permanece no processo oficial. O sistema organiza a evidência; não notifica, não autua e não substitui o SEI."
        corpo={<div className="lista-def">
          {BASE_LEGAL.map(([norma, texto]) => <div className="def" key={norma}><b>{norma}</b><p>{texto}</p></div>)}
        </div>} />

      <Cartao titulo="Origem dos dados territoriais" sub="O que é real e o que é aproximado"
        nota="Substituir a tabela de pontos pela camada oficial do GeoPortal não altera nenhuma outra parte do sistema: todo o resto lê o ponto pelo identificador."
        corpo={<Pares itens={[
          ['Bairros e zonas', 'reais, de Porto Velho'],
          ['Ruas e rio no mapa', 'OpenStreetMap, reais'],
          ['Coordenadas dos pontos de coleta', 'aproximadas — não vêm do GeoPortal municipal'],
          ['Estabelecimentos, pessoas e documentos', 'fictícios'],
          ['Massas e valores da demonstração', 'gerados por cenário, com semente fixa']
        ]} />} />

      <Cartao titulo="O que o sistema ainda não faz" sub="Declarado por escolha, não por esquecimento"
        corpo={<div className="lista-def">
          <div className="def"><b>Não emite ato administrativo</b><p>Não há notificação, prazo processual nem ciência do interessado. Quem notifica é o processo no SEI.</p></div>
          <div className="def"><b>Não substitui o MTR</b><p>Onde o manifesto é exigível, a obrigação permanece no sistema nacional do SINIR. O SAMAÚMA referencia, não emite.</p></div>
          <div className="def"><b>Não trata resíduo de serviço de saúde</b><p>O RSS tem regra e plano próprios e está fora deste modelo.</p></div>
          <div className="def"><b>Não classifica resíduo por norma técnica</b><p>A tabela de materiais é comercial. A correspondência com a classificação normativa é requisito para uso oficial.</p></div>
        </div>} />
    </>
  );
}
