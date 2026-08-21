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

O sistema foi migrado para **TypeScript + React + Next.js** (App Router). O app original em JavaScript
puro, sem build, permanece recuperável no histórico do repositório (até o commit `b8c2020`),
mas não faz mais parte do projeto: existe uma única versão oficial, esta.

```text
app/                            rotas (Next.js App Router)
  page.tsx                      entrada (portão): perfis de demonstração, entrar, cadastrar
  cadastro/, entrar/            cadastro de participantes e login por código
  gerador/, catador/,
  cooperativa/, prefeitura/     uma pasta por perfil; cada aba é uma rota (`/gerador/painel`, ...);
                                 `demandas/[id]` é o detalhe da demanda daquele perfil
  globals.css                   folha única e design system
  manifest.ts                   manifesto PWA

lib/dominio/                    regras, tabelas e armazém — não conhece a tela
lib/servicos/                   relatórios, integrações externas e comprovante
components/ui/                  marca, cartão, indicador, gráficos, listas
components/demanda/             detalhe da demanda, compartilhado pelos quatro perfis
components/layout/              moldura do perfil, inicialização do domínio, recado (toast)
components/comprovante/         comprovante como sobreposição global
components/mapa/                mapa Leaflet (client-side, carregado sob demanda)
state/hooks.ts                  ponte entre os armazéns de domínio (localStorage) e o React

```

Não há backend: o estado da demonstração fica no navegador (`localStorage`), do mesmo jeito que na versão
anterior. Nenhuma rota de servidor lê ou escreve dado nenhum — `npm run build` gera um app Next.js completo,
mas cada perfil só existe no armazenamento do navegador de quem está usando.

## Executar localmente

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000`.

Atalhos de apresentação: `?perfil=gerador`, `?perfil=catador`, `?perfil=cooperativa`, `?perfil=prefeitura`.
Para o catador autônomo: `?perfil=catador&catador=cat-05`. Para o aterro: `?perfil=cooperativa&destino=dst-04`.

## Verificação

```bash
npm run build     # type-check + build de produção
npm test          # cenários do domínio (Vitest)
npm run lint       # ESLint

```

Os testes cobrem a máquina de estados até o recebimento, o ramo da pendência, carga direto para o aterro,
rejeito maior que a carga, integridade da semente, as três situações regulatórias e os painéis de cada
perfil — as mesmas garantias de sempre, agora como módulos TS
importáveis em vez de um script rodado num sandbox `vm`.

## Aviso importante

Organizações, pessoas, documentos, coordenadas e valores são fictícios ou demonstrativos. Os bairros de
Porto Velho são reais e usados apenas para demonstrar a experiência do produto; as coordenadas são
aproximadas e não vêm do geoportal. Os fatores de preço, de CO₂e e a tarifa de aterro são demonstrativos.

O protótipo não acessa sistemas oficiais, não movimenta dinheiro e não representa integração, contratação,
decisão administrativa ou procedimento homologado pela Prefeitura de Porto Velho.

## Publicação

O app antigo em `/legacy` continua publicado em <https://natanashi.github.io/samauma/> (arquivos estáticos,
sem build). A versão em Next.js precisa de um host com servidor Node (`npm run build && npm start`) — GitHub
Pages, por servir só estático, não roda esta versão como está. Escolher o provedor (Vercel ou outro) e
configurar o deploy é uma decisão em aberto, feita à parte desta migração.
