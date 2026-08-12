/* Tutorial contextual: explica somente o módulo que já está aberto. */
const CONTEXT_TOURS={
  pan:[
    {sel:'.hero',t:'A proposta em uma frase',d:'Esta abertura resume o objetivo do SAMAÚMA: retirar grandes geradores do fluxo inadequado, melhorar a rastreabilidade e ampliar trabalho digno para catadores.',w:'O júri entende o problema, a solução e os beneficiários antes de ver detalhes técnicos.'},
    {sel:'.ofc',t:'Números de referência',d:'Esta faixa reúne parâmetros externos e regras utilizadas pelo protótipo. Ela separa referências públicas dos resultados calculados no cenário.',w:'Evita apresentar uma projeção como se fosse resultado já realizado pelo Município.'},
    {sel:'.grp',index:0,t:'Gestão dos grandes geradores',d:'Estes módulos cobrem descoberta, cadastro, notificação, conformidade, base contratual e a jornada demonstrativa completa.',w:'É a frente que organiza o trabalho da Prefeitura e reduz o custo público potencialmente absorvido.'},
    {sel:'.grp',index:1,t:'Inclusão produtiva',d:'A segunda frente transforma demanda regularizada em coleta, triagem, serviço remunerado e renda rastreável para organizações de catadores.',w:'O impacto social não aparece como efeito colateral; ele está integrado ao desenho operacional.'},
    {sel:'.grp',index:2,t:'Indicadores e governança',d:'A camada transversal explica os resultados, as fontes, os limites e o caminho de integração com sistemas oficiais.',w:'Mostra que o protótipo foi pensado para evoluir sem inventar acesso a bases governamentais.'}
  ],
  demo:[
    {sel:'.case-head',t:'Um caso de ponta a ponta',d:'A demonstração acompanha um estabelecimento fictício desde o cadastro técnico até a decisão de regularização.',w:'Em poucos minutos é possível provar o núcleo funcional do sistema para o júri.'},
    {sel:'.rolebar',t:'Separação de responsabilidades',d:'Servidor, operador, destino e auditoria possuem visões e ações diferentes. Quem produz a evidência não valida a própria informação.',w:'Essa separação reduz conflito de interesse e aproxima o protótipo de um sistema público real.'},
    {sel:'.journey',t:'Sete etapas encadeadas',d:'Cadastro, SEI, autodeclaração, coleta, pesagem, conciliação e decisão formam uma cadeia única. A etapa dourada indica onde o caso está.',w:'O fluxo impede que uma decisão apareça sem os documentos e eventos que a sustentam.'},
    {sel:'.case-panel',index:0,t:'Área de trabalho do perfil',d:'O conteúdo muda conforme a etapa e o perfil ativo. Formulários e decisões aparecem apenas para quem tem a responsabilidade correspondente.',w:'Demonstra controle de acesso e experiência orientada à tarefa, sem exigir autenticação real no hackathon.'},
    {sel:'.case-panel',index:1,t:'Resumo probatório',d:'Declaração, coleta, pesagem e divergência ficam lado a lado, cada uma com seu identificador e sua origem.',w:'Permite explicar rapidamente por que o sistema abriu um alerta e qual prova precisa ser corrigida.'},
    {sel:'.case-panel',index:2,t:'Trilha que não apaga o passado',d:'Cada ação cria um novo evento com horário, responsável e código. Retificações entram como novos registros, preservando os originais.',w:'A auditoria consegue reconstruir tudo o que aconteceu sem depender da memória dos usuários.'}
  ],
  ind:[
    {sel:'.bi-toolbar',t:'Filtros que governam todo o painel',d:'Período, ramo e natureza da evidência alteram o mesmo recorte analítico. O contador à direita confirma quantos registros estão sendo analisados.',w:'Evita comparar indicadores calculados sobre universos diferentes.'},
    {sel:'.bi-kpis',t:'Oito indicadores executivos',d:'Os cartões resumem universo, campo, regularização, massa, qualidade, economia, recicláveis e renda. Cada um informa se o valor é estimado, verificado ou calculado.',w:'Uma reunião de gestão começa pelas decisões essenciais, sem exigir leitura de tabelas extensas.'},
    {sel:'.bi-grid-main',index:0,t:'Tendência e conversão',d:'A série mostra a evolução demonstrativa ao longo do tempo; o funil revela onde os casos deixam de avançar até a comprovação final.',w:'Ajuda a diferenciar crescimento do cadastro de melhoria efetiva na regularização.'},
    {sel:'.bi-grid-three',t:'Três leituras complementares',d:'Situação cadastral responde “quantos”; massa por ramo responde “onde está o volume”; composição responde “qual rota de tratamento faz sentido”.',w:'Quantidade de estabelecimentos e massa de resíduos são problemas diferentes e não devem ser confundidos.'},
    {sel:'.bi-grid-main',index:1,t:'Territórios e insights',d:'O ranking territorial prioriza bairros por massa estimada. Ao lado, o sistema traduz os gráficos em mensagens objetivas para a equipe.',w:'Transforma visualização em pauta concreta de fiscalização, educação ambiental e capacidade operacional.'},
    {sel:'.bi-detail-title',t:'Detalhamento auditável',d:'As tabelas finais abrem os indicadores sociais e financeiros usados nos cartões, incluindo linha de base e parâmetros de custo.',w:'O gestor consegue sair do resumo executivo e conferir como a projeção foi composta.'}
  ],
  cad:[
    {sel:'.demo-banner',t:'Privacidade explícita',d:'O aviso confirma que nomes, documentos, portes e situações são fictícios; somente mapa e bairros representam a geografia real.',w:'Protege organizações reais e mantém o protótipo seguro para apresentação pública.'},
    {sel:'.tb',t:'Filtros operacionais',d:'A equipe pode separar situação cadastral, presença de evidência de campo e busca por nome ou bairro.',w:'Em produção, o servidor trabalha uma fila priorizada em vez de consultar centenas de registros manualmente.'},
    {sel:'#map',t:'Distribuição territorial',d:'Cada ponto representa um estabelecimento fictício classificado por situação. O mapa permite enxergar concentração e organizar deslocamentos.',w:'Planejamento territorial reduz visitas dispersas e melhora o uso da equipe de campo.'},
    {sel:'#rank',closest:'.box',t:'Fila de priorização',d:'O ranking combina porte estimado, situação e evidência disponível. Clicar numa linha abre a ficha técnica do caso.',w:'O algoritmo apenas orienta a ordem de análise; não substitui a decisão do servidor.'}
  ],
  selo:[
    {sel:'.demo-banner',t:'Instrumento proposto, não vigente',d:'O aviso impede que o selo demonstrativo seja confundido com procedimento oficial já adotado por Porto Velho.',w:'Transparência sobre o estágio da proposta aumenta a credibilidade da apresentação.'},
    {sel:'.row.c12 .box',index:0,t:'Validação antes da emissão',d:'A seleção relaciona estabelecimento e operador compatível. A cooperativa só aparece quando a fração reciclável e a capacidade permitem.',w:'O selo não pode ser apenas uma imagem; ele precisa decorrer de regras verificáveis.'},
    {sel:'.row.c12 .box',index:1,t:'Registro verificável',d:'Após a emissão, a área reúne identificação, validade, operador e QR demonstrativo para consulta do estado do registro.',w:'Em produção, o QR apontaria para uma página pública oficial, sem expor pendências internas.'}
  ],
  conf:[
    {sel:'.row.c3',t:'Resumo da conformidade',d:'Os cartões mostram alertas, operadores que devem reportar e percentual de destinação comprovada.',w:'A Prefeitura consegue acompanhar o sistema por exceção, concentrando esforço onde há ausência ou divergência.'},
    {sel:'.box',index:0,t:'Operadores credenciados',d:'Esta tabela consolida contratos, massa e regularidade de reporte. Controlar poucos operadores é mais viável que cobrar milhares de geradores individualmente.',w:'O desenho cria escala administrativa e atribui responsabilidade a quem executa a coleta.'},
    {sel:'.box',index:1,t:'Conciliação de três fontes',d:'Gerador declara, operador reporta e destino pesa. Os três valores são comparados dentro de uma tolerância definida.',w:'Uma única declaração não comprova a destinação; a confiança nasce do fechamento entre fontes independentes.'},
    {sel:'.box',index:2,t:'Alertas para análise humana',d:'Regras detectam selo sem movimentação, diferença de massa e operador divergente. O alerta informa o encaminhamento adequado.',w:'Alerta automático prioriza trabalho, mas não é autuação nem decisão administrativa.'}
  ],
  base:[
    {sel:'.row.c2 .box',index:0,t:'Hipóteses editáveis',d:'Custo por tonelada, prazo e taxa de regularização são parâmetros de cenário, não valores de contrato vigente.',w:'O júri pode testar a lógica sem que o protótipo apresente uma hipótese como compromisso financeiro do Município.'},
    {sel:'.row.c2 .box',index:1,t:'Efeito sobre a base de cálculo',d:'A projeção converte a taxa escolhida em massa retirada da coleta pública e redução financeira potencial.',w:'Mostra por que identificar grandes geradores antes de modelar contratos pode evitar distorções de longo prazo.'},
    {sel:'.bars',t:'Massa corrigida e remanescente',d:'A barra divide o que seria retirado da base pública e o que ainda permaneceria no cenário.',w:'Traduz uma porcentagem abstrata em consequência operacional mensurável.'},
    {sel:'.calc',t:'Escalas mensal, anual e contratual',d:'Os resultados aparecem em diferentes horizontes para permitir comparação e discussão de sensibilidade.',w:'O acumulado não é economia realizada; é uma projeção que precisa ser substituída pela regra oficial.'}
  ],
  pilot:[
    {sel:'.hero',t:'Provar antes de escalar',d:'O piloto de 90 dias começa sem autuação automática e mede precisão, custo, aceitação e capacidade operacional.',w:'Reduz o risco de implantar tecnologia antes de validar processo, competência e comportamento dos usuários.'},
    {sel:'.row.c4',t:'Escopo controlado',d:'Duração, amostra, ramos e regra de segurança delimitam exatamente o que será testado.',w:'Um piloto bem definido produz evidência comparável e evita prometer implantação municipal imediata.'},
    {sel:'.pilot-steps',t:'Três ciclos de aprendizagem',d:'Primeiro mede a linha de base, depois opera o fluxo assistido e, por fim, avalia se deve ajustar, escalar ou encerrar.',w:'Cada ciclo possui decisão e entrega, em vez de apenas uma lista de atividades.'},
    {sel:'.row.c21 .box',index:1,t:'Governança mínima',d:'SEMA, SMTI, ARDPV, SEINFRA, cooperativa e PGM possuem responsabilidades distintas no piloto.',w:'Tecnologia sozinha não resolve um processo que atravessa competências administrativas diferentes.'},
    {sel:'.box',index:3,t:'Critérios de sucesso e parada',d:'Precisão, tempo, rastreabilidade, qualidade, segurança jurídica e aceitação definem se o piloto pode avançar.',w:'A regra de parada mostra responsabilidade: risco ambiental ou vazamento interrompem o fluxo afetado.'}
  ],
  verif:[
    {sel:'.row.c4',t:'Carga e custo do ciclo',d:'Os cartões resumem tarefas atribuídas, concluídas, valor unitário e custo total da rodada de campo.',w:'A equipe conhece esforço e orçamento antes de distribuir novas visitas.'},
    {sel:'#taskList',closest:'.box',t:'Tarefas de campo',d:'Cada endereço é atribuído sem revelar a classificação estimada. O agente registra apenas se observou volume alto ou baixo.',w:'O modo cego reduz viés de confirmação e preserva a competência do fiscal.'},
    {sel:'.blind',closest:'.box',t:'Salvaguardas',d:'Impedimento por conflito, limite probatório e regra de remuneração ficam visíveis junto da operação.',w:'Inclusão produtiva não pode transferir poder de polícia nem criar incentivo para confirmar suspeitas.'},
    {sel:'.row.c21 .box',index:2,t:'Aprendizado do modelo',d:'O sistema compara observações com as estimativas e registra quantas confirmaram o porte previsto.',w:'A verificação serve também para recalibrar coeficientes e reduzir erros futuros.'}
  ],
  cart:[
    {sel:'.wal',t:'Extrato individual',d:'O resumo mostra recebimento, coletas, massa e verificações para uma pessoa cooperada fictícia.',w:'Histórico compreensível ajuda o trabalhador a acompanhar o rateio e comprovar renda.'},
    {sel:'.box',index:0,t:'Composição da renda',d:'Serviço de coleta, verificação de campo e comercialização de material aparecem separadamente.',w:'A renda não depende somente do preço volátil dos recicláveis; serviços ambientais também podem ser remunerados.'},
    {sel:'.box',index:1,t:'Lançamentos rastreáveis',d:'Coleta na porta e pesagem no galpão são eventos diferentes, cada um com data, referência, massa e valor.',w:'Separar eventos evita pagar por massa não recebida e facilita contestação.'},
    {sel:'.row.c4',t:'Visão da organização',d:'Massa processada, pessoas ativas, verificações e renda média resumem o desempenho coletivo.',w:'Permite avaliar inclusão produtiva junto com capacidade operacional.'},
    {sel:'.box',index:2,t:'Rateio aberto',d:'A tabela detalha massa, serviços, material e total por pessoa cooperada.',w:'Transparência da regra reduz conflito interno e gera histórico para editais e crédito.'}
  ],
  oper:[
    {sel:'.row.c4',t:'Capacidade antes da oferta',d:'A faixa superior mostra capacidade instalada, massa comprometida, receita potencial e janelas de contratação.',w:'O sistema não encaminha mais material do que a organização consegue receber com segurança.'},
    {sel:'#leads',closest:'.box',t:'Demanda compatível',d:'A lista exibe somente recicláveis segregados, dentro do raio e compatíveis com a licença e a capacidade.',w:'A cooperativa não recebe massa total, orgânicos, rejeitos ou resíduos de saúde.'},
    {sel:'.row.c21 .box',index:1,t:'Ordem de encaminhamento',d:'Resíduo municipal e gerador privado seguem fundamentos diferentes. Para privados, a escolha do fornecedor continua livre.',w:'O benefício social precisa respeitar contratação pública e liberdade econômica.'},
    {sel:'.row.c21 .box',index:2,t:'Preço com memória de cálculo',d:'Frequência e distância alimentam combustível, mão de obra, desgaste, equilíbrio e preço sugerido.',w:'A proposta deixa de ser um valor arbitrário e pode ser discutida com transparência.'}
  ],
  int:[
    {sel:'.hero',t:'Conectar sem substituir',d:'O SAMAÚMA é apresentado como cadastro técnico operacional; sistemas oficiais continuam donos dos processos e atos administrativos.',w:'Evita criar uma segunda verdade paralela dentro da Prefeitura.'},
    {sel:'.origin-legend',t:'Natureza de cada entrada',d:'As etiquetas distinguem dado existente, declarado, medido, calculado e condicionado a acordo.',w:'A interface deixa claro o grau de autoridade de cada informação.'},
    {sel:'.source-grid',t:'Cadeia de entrada e prova',d:'Cadastro econômico, processo, coleta e destino chegam por responsáveis distintos antes da conciliação.',w:'Mostra como o dado chegaria ao governo sem fingir integração automática.'},
    {sel:'.row.c21 .box',index:0,t:'Matriz de autoridade',d:'A tabela define sistema oficial, forma de entrada e estágio de prontidão para cada domínio.',w:'Permite transformar uma ideia de hackathon em plano institucional verificável.'},
    {sel:'.control-list',closest:'.box',t:'Controles de produção',d:'Acesso por função, trilha, proveniência, qualidade, LGPD e continuidade formam o mínimo para operação real.',w:'Esses controles não precisam estar todos programados no protótipo, mas precisam estar previstos.'},
    {sel:'.phase-line',t:'Implantação progressiva',d:'O fluxo começa assistido, prioriza integrações e só depois automatiza APIs e portais.',w:'A Prefeitura consegue testar valor sem depender de uma transformação tecnológica completa.'},
    {sel:'.official-links',closest:'.box',t:'Evidências locais',d:'Os links apontam para canais e estruturas reais de Porto Velho que sustentam o desenho.',w:'A proposta está conectada ao contexto municipal e não a um governo genérico.'}
  ],
  met:[
    {sel:'.box',index:0,t:'Parâmetros e fontes',d:'A primeira tabela reúne limites, referências e premissas usadas pelo sistema, incluindo alertas sobre valores demonstrativos.',w:'Toda afirmação importante pode ser rastreada até uma regra, fonte ou limitação.'},
    {sel:'#coefT',closest:'.box',t:'Coeficientes de geração',d:'Cada ramo possui base de cálculo, faixa mínima, melhor estimativa, máxima e situação da referência.',w:'Faixas de incerteza são mais honestas que um número único tratado como verdade.'},
    {sel:'.row.c2 .box',index:0,t:'Conversão entre volume e massa',d:'O peso específico transforma litros em quilogramas para permitir comparação operacional.',w:'A conversão varia conforme composição e precisa ser recalibrada com pesagens locais.'},
    {sel:'.row.c2 .box',index:1,t:'Protocolo de validação',d:'Amostra, medição, cálculo de erro, recalibração e reavaliação explicam como os parâmetros deixam de ser arbitrados.',w:'O modelo aprende com Porto Velho em vez de perpetuar coeficientes genéricos.'},
    {sel:'.box',index:4,t:'Governança do indicador',d:'Natureza do dado, competência, publicidade, conflito de interesse e trilha são regras aplicadas a toda a plataforma.',w:'Metodologia não é apenas matemática; também define uso legítimo e limites administrativos.'},
    {sel:'.box',index:5,t:'Fundamentação normativa',d:'A base legal diferencia cadastro, solução própria, contratação de cooperativas e proteção de dados.',w:'A tecnologia demonstra aderência ao processo público, sem transformar uma hipótese em obrigação vigente.'}
  ]
};

let contextualTourKey='pan',contextualTourIndex=0,contextualTourFocus=null;

function contextualTourSteps(){return CONTEXT_TOURS[contextualTourKey]||CONTEXT_TOURS.pan;}
function contextualTourView(){return document.getElementById('v-'+contextualTourKey);}
function contextualFind(step){
  const view=contextualTourView();if(!view)return null;
  let nodes=[];try{nodes=[...view.querySelectorAll(step.sel)];}catch(_){return view;}
  let node=nodes[step.index||0]||view;
  if(step.closest&&node!==view)node=node.closest(step.closest)||node;
  return node;
}
function contextualClearFocus(){if(contextualTourFocus){contextualTourFocus.classList.remove('tour-focus');contextualTourFocus=null;}document.querySelectorAll('.tour-focus').forEach(el=>el.classList.remove('tour-focus'));}

function tourIni(){
  const active=document.querySelector('.view.on');
  contextualTourKey=active?.id?.replace('v-','')||'pan';
  contextualTourIndex=0;
  document.body.classList.add('touring');
  const tour=document.getElementById('tour');tour.classList.add('on');tour.tabIndex=-1;tour.focus({preventScroll:true});
  tourGo();
}
function tourGo(){
  contextualClearFocus();
  const steps=contextualTourSteps(),step=steps[contextualTourIndex],module=T[contextualTourKey]?.[0]||'SAMAÚMA';
  document.getElementById('tMod').textContent=module;
  document.getElementById('tStp').textContent=(contextualTourIndex+1)+' / '+steps.length;
  document.getElementById('tTit').textContent=step.t;
  document.getElementById('tDsc').textContent=step.d;
  document.getElementById('tWhy').textContent=step.w;
  document.getElementById('tPrev').disabled=contextualTourIndex===0;
  document.getElementById('tNext').textContent=contextualTourIndex===steps.length-1?'Concluir':'Próximo';
  contextualTourFocus=contextualFind(step);
  if(contextualTourFocus){contextualTourFocus.classList.add('tour-focus');setTimeout(()=>contextualTourFocus?.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'}),40);}
}
function tourProx(){const steps=contextualTourSteps();if(contextualTourIndex>=steps.length-1){tourFim();return;}contextualTourIndex++;tourGo();}
function tourAnt(){if(contextualTourIndex>0){contextualTourIndex--;tourGo();}}
function tourFim(){contextualClearFocus();document.body.classList.remove('touring');document.getElementById('tour').classList.remove('on');}

document.addEventListener('keydown',event=>{
  if(!document.getElementById('tour')?.classList.contains('on'))return;
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  if(event.key==='Escape'){event.preventDefault();tourFim();}
  if(event.key==='ArrowRight'){event.preventDefault();tourProx();}
  if(event.key==='ArrowLeft'){event.preventDefault();tourAnt();}
});
