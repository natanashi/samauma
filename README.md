# SAMAÚMA

**Sistema de Grandes Geradores e Inclusão Produtiva.** Protótipo municipal demonstrativo que conecta
**geradores, catadores, destinatários e Prefeitura** para registrar e comprovar a destinação de resíduos
em Porto Velho, Rondônia.

> O gerador declara. O catador coleta. O destinatário recebe, pesa e confirma.
> O sistema registra a prova. A Prefeitura acompanha.

O sistema não cria uma nova verdade: **conecta as provas que já existem**.

## Quatro usuários, um ciclo

| Usuário | O que faz | Onde entra |
| --- | --- | --- |
| **Gerador** | Declara o resíduo, acompanha a coleta e responde pela regularidade | início |
| **Catador** | Aceita a demanda, coleta, pesa e registra o atendimento | meio |
| **Destinatário** | Recebe a carga, pesa na balança e declara o destino do material | **ponto final** |
| **Prefeitura** | Acompanha o município, fiscaliza e concilia divergências | acompanhamento |

### Catador, cooperativa e destinatário são coisas diferentes

- O **catador é usuário do sistema por si**. Pode ser cooperado ou autônomo; isso não muda o que ele pode
  fazer, só o que ele enxerga da equipe.
- A **cooperativa** organiza catadores. Na demonstração é a **CATANORTE**, a principal (e praticamente
  única) do município — ela aparece como vínculo do catador e como estrutura de operação, nunca como um
  usuário separado.
- O **destinatário** é outra coisa ainda: é quem recebe a carga. Pode ser o galpão de triagem da própria
  CATANORTE, uma indústria recicladora, uma unidade de transformação — ou o **aterro sanitário**.

### Boa parte do resíduo vai para o aterro, e o sistema mostra isso

Coletar não é reciclar. O sistema separa as duas coisas em dois lugares:

1. **Resíduo indiferenciado** declarado como rejeito vai direto ao Aterro Sanitário Municipal.
2. **Material reciclável** que chega à triagem tem uma parcela de rejeito — contaminação, umidade,
   material misturado — que o destinatário informa no recebimento e que segue para o aterro.

Por isso todo painel tem *massa recebida*, *massa recuperada* e *taxa de recuperação* como números
distintos, e a barra de recuperação aparece do gerador à Prefeitura.

## Um processo central

```text
CRIADA → DISPONÍVEL → ACEITA → EM COLETA → A CAMINHO → COMPROVADA
                                               ↓
                                          PENDÊNCIA → CONCILIADA
```

Uma demanda tem gerador, ponto de coleta, resíduo, quantidade estimada, prazo, situação, catador
responsável, destinatário, peso de campo, peso de balança, rejeito, destino final, lote e comprovante.
O destinatário é atribuído na criação, pelo tipo de material.

## A prova final

```text
GERADOR        800 kg estimados
CATADOR        785 kg coletados em campo
DESTINATÁRIO   782 kg pesados na balança → 722 recuperados, 60 de rejeito
SISTEMA        divergência 0,4% → COMPROVADO
```

Acima da tolerância de 5%, a demanda vira **pendência**: nenhum registro é apagado e a Prefeitura decide
qual massa vale. A trilha guarda a decisão com autoria e horário.

## O que cada usuário acessa

**Gerador** — situação regulatória (Regular / Em regularização / Irregular) calculada a partir do PGRS,
das pendências e da última destinação; volume declarado × destinado; operador contratado; próxima coleta;
histórico; comprovantes; PGRS e documentos; selo de destinação; relatório mensal com quantidade coletada,
tipo de resíduo, quanto foi reciclado e destino final.

**Catador** — coletas de hoje; próxima coleta com endereço, acesso, tipo e volume estimado; status da
coleta; histórico; valor gerado; comprovantes; demandas disponíveis; e um **painel individual**: meta
semanal, variação contra a semana anterior, valor médio por coleta, precisão da pesagem, posição no
ranking, dias com coleta, material que mais rende, CO₂e evitado.

**Destinatário** — recebimentos de hoje; coletas aguardadas; tipo de resíduo, peso, origem e data/hora de
cada carga; destino dado ao material; histórico completo em tabela; comprovantes emitidos.

**Prefeitura** — mapa dos grandes geradores; geradores que precisam de atenção com o motivo; demandas em
andamento; coletas realizadas; destinação comprovada; indicadores **ambientais**, **sociais** e
**financeiros**; histórico.

## Relatórios

Exportação por **escopo de perfil**, não só de um processo:

| Escopo | CSV | PDF |
| --- | --- | --- |
| Gerador | histórico completo | dossiê de destinação |
| Gerador · mensal | cargas do mês | relatório mensal |
| Catador | suas coletas | relatório de coletas |
| Destinatário | recebimentos | relatório de recebimentos |
| Prefeitura | município inteiro | relatório municipal |

O CSV usa `;` e vírgula decimal, com BOM — abre direto no Excel em português. O PDF é montado num iframe
e sai pela impressão do navegador ("Salvar como PDF"): sem biblioteca e sem servidor.

## Pontos de coleta e mapa

Cada gerador tem um ponto de coleta com bairro, zona, acesso e coordenada. A Prefeitura vê o mapa dos
grandes geradores — tamanho do círculo é a massa destinada, cor é a situação regulatória — mais a massa
por ponto, por bairro e por zona.

> **As coordenadas são aproximadas e demonstrativas.** Os bairros são reais; os pontos **não vieram do
> geoportal da Prefeitura**. Trocar a tabela `PONTOS` em `src/dominio/catalogo.js` por uma camada oficial
> não muda nenhuma outra linha do sistema.

## Identidade

A marca é o arquivo **`assets/logo.png`** — veja [assets/LEIA-ME.md](assets/LEIA-ME.md) para onde ele é
usado e como o símbolo é recortado dele. Enquanto o arquivo não existir, a interface cai num símbolo
desenhado em SVG e continua íntegra.

O resto do desenho sai do logotipo: gradiente do azul do rio ao verde da folha e ao ouro da margem, em
fios de 2 a 3 px; assinatura de três traços; papel quase branco; traço fino; cantos generosos. Cada
material tem cor fixa e cada perfil tem a sua, aplicada em `--perfil`.

Gráficos feitos à mão: barras em HTML, rosca e anel em SVG inline, mapa em SVG com projeção linear.
Nenhuma biblioteca, fonte ou ícone remoto.

## Estrutura

```text
index.html                     shell e ordem de carga
styles.css                     folha única e design system
assets/logo.png                a marca (você fornece)

src/dominio/                   não conhece a tela
  catalogo.js                  tabelas: resíduos, cooperativas, catadores, pontos, geradores, destinos
  formato.js                   número, massa, dinheiro, data, prazo, escape e agrupamento
  demanda.js                   regras da demanda: divergência, recuperação, valor, CO₂e, próxima ação
  gerador.js                   situação regulatória, PGRS, aderência e selo
  sessao.js                    quem está usando agora
  semente.js                   dados demonstrativos
  store.js                     armazém, transições de estado e consultas
  indicadores.js               séries e painéis por perfil

src/ui/                        não conhece nenhuma tela em particular
  componentes.js               marca, cartão, indicador, aviso, filtro, selo
  graficos.js                  série, rosca, anel, ranking, barra de recuperação
  mapa.js                      mapa de pontos e lista territorial
  listas.js                    cartões de demanda, coleta, comprovante e gerador

src/servicos/relatorio.js      escopos, CSV e documento imprimível

src/telas/                     uma por área do sistema
  entrada.js gerador.js catador.js destinatario.js prefeitura.js demanda.js comprovante.js

src/app.js                     estado da sessão, roteamento e ações
sw.js                          cache offline
verificacao.js                 checagem do domínio, dos relatórios e das telas
```

Sem dependências externas e sem build. O estado da demonstração fica no navegador (`localStorage`) e o
botão **Reiniciar** devolve os dados iniciais.

## Executar localmente

```bash
python -m http.server 4173
```

Depois abra `http://localhost:4173`.

Atalhos de apresentação: `?perfil=gerador`, `?perfil=catador`, `?perfil=destinatario`, `?perfil=prefeitura`.
Para o catador autônomo: `?perfil=catador&catador=cat-05`. Para o aterro: `?perfil=destinatario&destino=dst-04`.

## Verificação

```bash
node verificacao.js
```

Carrega os módulos na mesma ordem do `index.html` e roda mais de cem checagens: máquina de estados até o
recebimento, ramo da pendência, carga direto para o aterro, rejeito maior que a carga, integridade da
semente, as três situações regulatórias, os painéis de cada perfil, os cinco escopos de relatório, o CSV
(colunas, escape e uma linha por demanda) e todas as telas em todas as situações, para os quatro perfis.

## Aviso importante

Organizações, pessoas, documentos, coordenadas e valores são fictícios ou demonstrativos. Os bairros de
Porto Velho são reais e usados apenas para demonstrar a experiência do produto; as coordenadas são
aproximadas e não vêm do geoportal. Os fatores de preço, de CO₂e e a tarifa de aterro são demonstrativos.

O protótipo não acessa sistemas oficiais, não movimenta dinheiro e não representa integração, contratação,
decisão administrativa ou procedimento homologado pela Prefeitura de Porto Velho.

## Publicação

<https://natanashi.github.io/samauma/>
