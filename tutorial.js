/* Tutorial contextual: explica somente o módulo que já está aberto. */
const CONTEXT_TOURS={
  pan:[
    {sel:'.winning-hero',t:'A proposta em uma frase',d:'O SAMAÚMA transforma material disponível em oportunidade rastreável de trabalho, renda e destinação correta.',w:'A banca entende imediatamente o beneficiário e o resultado, antes de ver detalhes administrativos.'},
    {sel:'.ecosystem-bridge',t:'Dois núcleos, uma mesma cadeia',d:'O SAMAÚMA Regula organiza grandes geradores; o SAMAÚMA Circular transforma somente a fração reciclável autorizada em oportunidade para cooperativas.',w:'A fiscalização não compete com a inclusão produtiva: uma alimenta a outra com responsabilidades separadas.'},
    {sel:'.impact-snapshot',t:'Resultados com natureza declarada',d:'Os cartões diferenciam dado declarado, projeção, cenário e resultado verificado. Os números continuam explicitamente demonstrativos.',w:'Essa transparência evita promessas disfarçadas de resultados oficiais.'},
    {sel:'.audience-gates',t:'Dois caminhos de aprendizagem',d:'Quem atua na cooperativa encontra oportunidades, campo e renda; quem está na Prefeitura encontra cadastro, conformidade e cenários.',w:'A separação por público explica o sistema sem quebrar a jornada integrada.'},
    {sel:'.actor-grid',t:'Catador no centro da operação',d:'Gerador publica, cooperativa decide, catador executa e Município acompanha sem concentrar todas as ações num único perfil.',w:'O protagonismo deixa de ser apenas discurso e aparece na divisão real do trabalho.'},
    {sel:'.pilot-brief',t:'Um primeiro passo possível',d:'O piloto propõe uma cooperativa, dez catadores, trinta geradores e dois corredores durante noventa dias.',w:'A proposta cabe numa decisão concreta e pode ser testada sem substituir os sistemas oficiais.'}
  ],
  demo:[
    {sel:'.case-head',t:'Uma operação, não uma apresentação',d:'A banca pode executar uma coleta fictícia da publicação ao rateio e ao dossiê final.',w:'Interação de ponta a ponta prova que a proposta possui lógica operacional.'},
    {sel:'.rolebar',t:'Quatro responsabilidades reais',d:'Gerador, cooperativa, catador e servidor acessam somente as ações pelas quais respondem.',w:'Quem produz a evidência não valida sozinho a própria informação.'},
    {sel:'.journey',t:'Oito etapas até renda e impacto',d:'Demanda, aceite, coleta offline, pesagem, divergência, correção, liquidação e impacto formam uma cadeia única.',w:'A história não termina na fiscalização; termina em trabalho pago e resultado comprovável.'},
    {sel:'.case-panel',index:0,t:'Área de trabalho do perfil',d:'O conteúdo muda conforme a etapa e o perfil ativo. Formulários e decisões aparecem apenas para quem tem a responsabilidade correspondente.',w:'Demonstra controle de acesso e experiência orientada à tarefa, sem exigir autenticação real no hackathon.'},
    {sel:'.case-panel',index:1,t:'Resumo operacional',d:'Declaração, coleta, pesagem e diferença ficam lado a lado, preservando sua origem.',w:'Permite descobrir rapidamente onde surgiu a inconsistência.'},
    {sel:'.case-panel',index:2,t:'Trilha que não apaga o passado',d:'Cada ação cria um novo evento com horário, responsável e código. Retificações entram como novos registros, preservando os originais.',w:'A auditoria consegue reconstruir tudo o que aconteceu sem depender da memória dos usuários.'}
  ],
  ind:[
    {sel:'.impact-decision',t:'A decisão que o painel precisa apoiar',d:'Antes dos gráficos, o sistema explicita hipótese, metas e prazo do piloto.',w:'Indicador só é útil quando muda uma decisão — escalar, ajustar ou interromper.'},
    {sel:'.bi-toolbar',t:'Filtros que governam todo o painel',d:'Período, ramo e natureza da evidência alteram o mesmo recorte analítico. O contador à direita confirma quantos registros estão sendo analisados.',w:'Evita comparar indicadores calculados sobre universos diferentes.'},
    {sel:'.bi-kpis',t:'Oito indicadores de impacto',d:'Os cartões resumem oportunidades, campo, fluxos comprovados, massa, qualidade, eficiência, recicláveis e renda. Cada valor informa sua natureza.',w:'A gestão enxerga impacto social e capacidade operacional junto da conformidade.'},
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
    {sel:'.seal-management-note',t:'Competência exclusiva da gestão',d:'O interessado declara e acompanha; o servidor municipal verifica os requisitos e pratica o ato demonstrativo.',w:'Separar interessado e autoridade impede autorregularização e torna a decisão auditável.'},
    {sel:'.seal-management-view .row.c12 .box',index:0,t:'Análise antes da emissão',d:'Cadastro, processo, coleta, pesagem e destino precisam estar conciliados. O servidor pode emitir ou registrar uma pendência.',w:'O selo decorre de evidências e decisão humana, não de um botão automático.'},
    {sel:'.seal-management-view .row.c12 .box',index:1,t:'Resultado atribuído',d:'Emissão, suspensão e demais decisões registram a autoridade responsável e preservam os atos anteriores.',w:'O histórico permite comprovar quem decidiu, quando e com base em quais evidências.'},
    {sel:'.seal-authority',t:'Quatro responsabilidades separadas',d:'Gerador declara, operador comprova, sistema concilia e SEMA decide.',w:'Cada participante atua somente dentro de sua competência.'}
  ],
  reg:[
    {sel:'.demo-banner',t:'Caso seguro para demonstração',d:'CNPJ, inscrição, documentos, estabelecimento e processo são fictícios. O SEI continua indicado como sistema oficial da decisão.',w:'A banca consegue testar o produto sem confundir a simulação com cadastro ou ato vigente.'},
    {sel:'.reg-journey',t:'O ciclo regulatório completo',d:'Autodeclaração, protocolo, análise, decisão e conexão circular aparecem como etapas distintas e verificáveis.',w:'Isso recupera o núcleo original de gestão de grandes geradores sem transformar a tela em apresentação.'},
    {sel:'.reg-card',index:0,t:'Uma tarefa por responsabilidade',d:'O gerador envia e responde; a gestão analisa e decide. O conteúdo muda conforme o perfil e a situação do processo.',w:'O interessado nunca regulariza ou emite o próprio selo.'},
    {sel:'.reg-card',index:1,t:'Histórico que preserva o original',d:'Protocolo, pendência, complemento e decisão entram como eventos separados com identificadores demonstrativos.',w:'Corrigir uma informação não apaga o que foi declarado anteriormente.'},
    {sel:'.circular-callout',t:'A ponte para trabalho e renda',d:'Depois da regularização, o sistema explica a compatibilidade do reciclável. A demanda só é publicada quando o gerador privado autoriza.',w:'Esse é o diferencial: melhorar a gestão municipal e criar oportunidade sem impor contratação privada.'}
  ],
  selo_holder:[
    {sel:'.demo-banner',t:'Instrumento proposto, não vigente',d:'O aviso confirma que este registro é demonstrativo e ainda depende de regulamentação municipal.',w:'O grande gerador não pode confundir a simulação com um ato oficial vigente.'},
    {sel:'.seal-holder-status',t:'Situação reconhecida pela Prefeitura',d:'O interessado acompanha o estado, o processo relacionado, a data da decisão e a validade.',w:'A situação vem da unidade municipal competente; a empresa apenas consulta.'},
    {sel:'.seal-holder-view .row.c12 .box',index:0,t:'Selo somente para consulta',d:'O gerador pode baixar o registro e abrir a verificação pública, sem emitir, renovar, suspender ou cancelar.',w:'A interface reflete a separação real de permissões.'},
    {sel:'.seal-holder-view .row.c12 .box',index:1,t:'Provas relacionadas',d:'Processo, última coleta, destino e situação do selo ficam reunidos para acompanhamento.',w:'O interessado enxerga o que comprova sua situação sem alterar a decisão administrativa.'}
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
    {sel:'.row.c4',t:'Escopo e acesso controlados',d:'Duração, participantes, quatro canais de acesso e regra de segurança delimitam o teste.',w:'Ninguém fica fora por não possuir celular ou pacote de dados.'},
    {sel:'.pilot-steps',t:'Três ciclos de aprendizagem',d:'Primeiro mede a linha de base, depois opera o fluxo assistido e, por fim, avalia se deve ajustar, escalar ou encerrar.',w:'Cada ciclo possui decisão e entrega, em vez de apenas uma lista de atividades.'},
    {sel:'.row.c21 .box',index:1,t:'Governança mínima',d:'SEMA, SMTI, ARDPV, SEINFRA, cooperativa e PGM possuem responsabilidades distintas no piloto.',w:'Tecnologia sozinha não resolve um processo que atravessa competências administrativas diferentes.'},
    {sel:'.box',index:3,t:'Critérios de sucesso e parada',d:'Precisão, tempo, rastreabilidade, qualidade, segurança jurídica e aceitação definem se o piloto pode avançar.',w:'A regra de parada mostra responsabilidade: risco ambiental ou vazamento interrompem o fluxo afetado.'}
  ],
  verif:[
    {sel:'.field-head',t:'Um sistema web, vários aparelhos',d:'O mesmo endereço funciona no navegador do celular, tablet ou computador e não exige instalação.',w:'A implantação mantém uma única tecnologia para campo e galpão.'},
    {sel:'.digital-inclusion-note',t:'Celular pessoal não é requisito',d:'A ampla presença nacional de celular não comprova acesso individual, pacote de dados ou facilidade de uso entre catadores de Porto Velho.',w:'O piloto mede a realidade local antes de escolher e distribuir equipamentos.'},
    {sel:'.field-channel-bar',t:'Quatro canais equivalentes',d:'Aparelho compartilhado, celular pessoal opcional, terminal do galpão e registro assistido produzem o mesmo evento rastreável.',w:'O acesso à renda não pode depender da posse de tecnologia.'},
    {sel:'.field-web-workspace',t:'O sistema web se adapta ao aparelho',d:'Este é o próprio módulo operacional, não um celular desenhado. No computador ele usa a área disponível; no celular reorganiza os mesmos campos automaticamente.',w:'Uma única interface reduz custo, evita aplicativo separado e mantém o trabalho acessível em diferentes equipamentos.'},
    {sel:'.sync-event',index:1,t:'Fila offline visível',d:'O evento fica salvo no dispositivo, recebe identificador e sincroniza depois sem duplicidade.',w:'Perder sinal não pode significar perder trabalho ou remuneração.'},
    {sel:'.field-contingency',t:'Contingência sem exclusão',d:'Se não houver aparelho ou bateria, uma ficha numerada é digitada depois no terminal web, preservando autores e justificativa.',w:'Uma falha tecnológica não pode apagar trabalho realizado.'},
    {sel:'.field-advanced',t:'Fiscalização fora do caminho principal',d:'A verificação municipal complementar continua disponível, mas não compete com a jornada do catador.',w:'Mantém profundidade técnica sem sobrecarregar a demonstração principal.'}
  ],
  cart:[
    {sel:'.wal',t:'Extrato individual',d:'O resumo mostra recebimento, coletas, massa e verificações para uma pessoa cooperada fictícia.',w:'Histórico compreensível ajuda o trabalhador a acompanhar o rateio e comprovar renda.'},
    {sel:'.box',index:0,t:'Composição da renda',d:'Serviço de coleta, verificação de campo e comercialização de material aparecem separadamente.',w:'A renda não depende somente do preço volátil dos recicláveis; serviços ambientais também podem ser remunerados.'},
    {sel:'.box',index:1,t:'Lançamentos rastreáveis',d:'Coleta na porta e pesagem no galpão são eventos diferentes, cada um com data, referência, massa e valor.',w:'Separar eventos evita pagar por massa não recebida e facilita contestação.'},
    {sel:'.row.c4',t:'Visão da organização',d:'Massa processada, pessoas ativas, verificações e renda média resumem o desempenho coletivo.',w:'Permite avaliar inclusão produtiva junto com capacidade operacional.'},
    {sel:'.box',index:2,t:'Rateio aberto',d:'A tabela detalha massa, serviços, material e total por pessoa cooperada.',w:'Transparência da regra reduz conflito interno e gera histórico para editais e crédito.'}
  ],
  oper:[
    {sel:'.opportunity-head',t:'Responsabilidades separadas',d:'Para a cooperativa, a tela mostra demandas comerciais a avaliar. Para o catador, mostra somente trabalhos já aceitos e liberados pela organização.',w:'A cooperativa responde pelo contrato e pela capacidade; o catador responde por disponibilidade e execução.'},
    {sel:'.opportunity-tabs',t:'Descoberta e operação separadas',d:'Lista e mapa mostram o que pode ser avaliado ou confirmado. A terceira aba guarda apenas operações aceitas ou rotas do trabalhador.',w:'Separar decisão comercial de execução evita que o catador assuma uma responsabilidade que pertence à organização.'},
    {sel:'.opportunity-filters',t:'Filtros ligados à realidade operacional',d:'Material, distância e período ajudam a verificar capacidade, turno, veículo e segurança antes de qualquer confirmação.',w:'A melhor demanda precisa ser viável para a cooperativa e para a equipe que irá executá-la.'},
    {sel:'.opportunity-card-list',t:'Informação antes da decisão',d:'Cada cartão mostra massa estimada, remuneração, distância, janela e o motivo da recomendação.',w:'A cooperativa aceita com base operacional; o catador confirma disponibilidade sem contratar o gerador.'},
    {sel:'.opportunity-card',t:'Recomendação explicável',d:'A etiqueta destaca a melhor combinação e os detalhes revelam os critérios usados. O sistema nunca aceita ou escala alguém automaticamente.',w:'A decisão humana continua identificada e pode ser revista.'},
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

function contextualTourSteps(){const key=contextualTourKey==='selo'&&typeof currentSystemProfile!=='undefined'&&currentSystemProfile==='gerador'?'selo_holder':contextualTourKey;return CONTEXT_TOURS[key]||CONTEXT_TOURS.pan;}
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
