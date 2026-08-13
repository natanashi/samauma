/* Caso regulatório demonstrativo — nenhum dado ou decisão possui validade oficial. */
let REG_CASE,SEAL_PUBLIC_STATE='REGULAR · ATIVO';

function regularizationInitial(origem){return {
  origem:origem||null,
  stage:1,cnpj:'DEMO-PVH-0084',im:'IM-DEMO-4172',sei:'00000.004172/2026-84',
  responsible:'Marina Nogueira · responsável fictícia',volume:820,operator:'Operador demonstrativo',
  contract:false,pgrs:false,sent:false,pending:false,complement:false,approved:false,published:false,
  // trilho de adesão: a prova nasce da operação, não da estimativa
  contratado:false,coletas:[],destinacao:false,dossie:false,
  events:[]
};}

/* Duas portas de entrada.
   ADESÃO  — o estabelecimento procura o município. Nenhuma estimativa é usada:
             a massa é medida na balança e a destinação é comprovada.
   OFÍCIO  — o município identifica por cruzamento e estimativa, e notifica.
             Continua existindo porque nem todo gerador procura o município. */
const REG_ORIGENS={
  adesao:{rot:'ADESÃO VOLUNTÁRIA',nome:'O estabelecimento procurou o município',
    dado:'medido',cor:'#176343',
    desc:'Sem estimativa no caminho crítico. A massa vem da balança e a destinação é comprovada pelo operador.'},
  oficio:{rot:'IDENTIFICAÇÃO FISCAL',nome:'O município identificou e notificou',
    dado:'estimado',cor:'#b07c18',
    desc:'Parte de estimativa por coeficiente. A estimativa prioriza inspeção e pode ser contestada; não é prova.'}
};
function regEscolherOrigem(o){
  REG_CASE=regularizationInitial(o);
  if(o==='adesao')regEvent('Manifestação de interesse recebida','Iniciativa do próprio estabelecimento. Nenhuma estimativa foi aplicada ao caso.','ADE-DEMO-0084');
  else regEvent('Caso incluído na fila técnica','Origem: cruzamento demonstrativo SEMEC + cadastro SAMAÚMA. Volume estimado por coeficiente.','CAD-DEMO-0084');
  renderRegularization();
  toast(o==='adesao'?'Trilho de adesão aberto · prova pela operação':'Trilho de ofício aberto · estimativa sujeita a contestação');
}

function resetRegularization(){REG_CASE=regularizationInitial(null);renderRegularization();updateCircularOpportunity();toast('Caso regulatório reiniciado · nenhum registro oficial foi alterado');}
function prepareRegularizationForProfile(profile){
  if(!REG_CASE)REG_CASE=regularizationInitial();
  if(profile==='gestao'&&!REG_CASE.sent){Object.assign(REG_CASE,{contract:true,pgrs:true,sent:true,complement:true});REG_CASE.events.unshift({title:'Complementação recebida',detail:'Grande gerador · licença atualizada pronta para análise.','id':'COMP-DEMO-0084-R1'});}
  if(profile==='cooperativa'&&!REG_CASE.published){Object.assign(REG_CASE,{contract:true,pgrs:true,sent:true,complement:true,approved:true,published:true});}
  renderRegularization();updateCircularOpportunity();
}
function regEvent(title,detail,id){REG_CASE.events.unshift({title,detail,id});}
function regAllowed(...profiles){return profiles.includes(currentSystemProfile)||currentSystemProfile==='banca';}

function renderRegularization(){
  if(!REG_CASE)REG_CASE=regularizationInitial();
  const jo=document.getElementById('regJourney');
  const ADE=[['01 · GERADOR','Manifestação'],['02 · CONTRATO','Operador contratado'],['03 · CAMPO','Coleta pesada'],
             ['04 · DESTINO','Destinação comprovada'],['05 · MUNICÍPIO','Selo e dossiê']];
  const OFI=[['01 · GERADOR','Autodeclaração'],['02 · PROTOCOLO','Documentos enviados'],['03 · SEMA','Análise e pendência'],
             ['04 · DECISÃO','Selo emitido'],['05 · CIRCULAR','Oportunidade autorizada']];
  if(jo&&REG_CASE.origem){
    const L=REG_CASE.origem==='adesao'?ADE:OFI;
    jo.innerHTML=L.map(([a,b])=>`<div class="reg-step"><span>${a}</span><b>${b}</b></div>`).join('');
  }
  const steps=document.querySelectorAll('#regJourney .reg-step');
  const visualStage=REG_CASE.origem==='adesao'
    ? (REG_CASE.dossie?5:REG_CASE.destinacao?4:REG_CASE.coletas.length?3:REG_CASE.contratado?2:1)
    : (REG_CASE.published?5:REG_CASE.approved?4:REG_CASE.complement?3:REG_CASE.sent?2:1);
  const fim=REG_CASE.origem==='adesao'?REG_CASE.dossie:REG_CASE.published;
  steps.forEach((el,i)=>{const n=i+1;el.classList.toggle('done',n<visualStage||fim&&n===5);el.classList.toggle('active',n===visualStage&&!fim);});
  const w=document.getElementById('regWorkspace');if(!w)return;
  const holder=currentSystemProfile==='gerador';
  const management=currentSystemProfile==='gestao';
  const role=holder?'GRANDE GERADOR':management?'GESTÃO MUNICIPAL':'MODO BANCA · RESPONSABILIDADES VISÍVEIS';
  const O=REG_CASE.origem?REG_ORIGENS[REG_CASE.origem]:null;
  const selo=O?`<span class="permission" style="background:color-mix(in srgb,${O.cor} 13%,white);color:${O.cor};border-color:transparent">${O.rot} · DADO ${O.dado.toUpperCase()}</span>`:'';
  w.innerHTML=`<div class="reg-layout"><div class="reg-card"><header><div><h3>Área de trabalho · ${role}</h3><p>Mercado Ipê Roxo · caso fictício · processo ${REG_CASE.sei}</p></div>${selo}<span class="permission">${holder?'DECLARAR E ACOMPANHAR':management?'ANALISAR E DECIDIR':'FLUXO COMPLETO'}</span></header><div class="reg-body">${regularizationMain()}</div></div><aside><div class="reg-card"><header><div><h3>Trilha do processo</h3><p>Eventos incrementais e atribuídos</p></div></header><div class="reg-body">${REG_CASE.events.map(e=>`<div class="reg-event"><b>${e.title}</b><p>${e.detail}</p><code>${e.id}</code></div>`).join('')}</div></div></aside></div>`;
}

function regularizationMain(){
  /* ---------- porta de entrada: nenhum trilho escolhido ---------- */
  if(!REG_CASE.origem)return `<div class="reg-status"><span>COMO O CASO COMEÇA</span><h3>Escolha a porta de entrada</h3>
    <p>O mesmo caso pode nascer de duas formas. A diferença não é burocrática: muda o que serve de prova e o risco de erro sobre o estabelecimento.</p></div>
    <div class="reg-origin-grid">
      ${Object.entries(REG_ORIGENS).map(([k,o])=>`<button class="reg-origin" style="--o:${o.cor}" onclick="regEscolherOrigem('${k}')">
        <span class="tag">${o.rot}</span><b>${o.nome}</b><p>${o.desc}</p>
        <span class="dado ${o.dado}">Prova: dado ${o.dado}</span></button>`).join('')}
    </div>
    <div class="case-alert" style="margin-top:12px"><b>Por que manter os dois</b>
      <p>A adesão é o trilho preferencial porque dispensa estimativa. Mas nem todo estabelecimento procura o município — para esses, a identificação por cruzamento continua sendo o único caminho, com estimativa declarada como indício e sujeita a contestação.</p></div>`;

  /* ---------- TRILHO DE ADESÃO: a prova nasce da operação ---------- */
  if(REG_CASE.origem==='adesao'){
    if(!REG_CASE.contratado)return `<div class="reg-status"><span>ETAPA 1 · MANIFESTAÇÃO</span><h3>O estabelecimento procurou o município</h3>
      <p>Nenhuma estimativa é aplicada. A massa não é declarada por coeficiente: será medida na balança a cada coleta.</p></div>
      <div class="reg-grid"><div class="reg-field"><label>CNPJ demonstrativo</label><input value="${REG_CASE.cnpj}" readonly></div>
      <div class="reg-field"><label>Inscrição Mobiliária</label><input value="${REG_CASE.im}" readonly></div>
      <div class="reg-field full"><label>Responsável e contato</label><input value="${REG_CASE.responsible}" readonly></div>
      <div class="reg-field"><label>Massa mensal</label><input value="a medir na primeira coleta" readonly></div>
      <div class="reg-field"><label>Operador escolhido</label><select><option>Coopera Amazônia · cooperativa</option><option>Operador privado licenciado</option></select></div></div>
      <div class="case-alert"><b>A escolha do operador é livre</b><p>O município não impõe fornecedor. A cooperativa aparece na relação de credenciados em igualdade com os demais.</p></div>
      ${regAllowed('gerador')?`<div class="reg-actions"><button class="btn" onclick="regContratar()">Registrar contratação do operador</button></div>`
        :`<div class="empty-action"><b>Aguardando o estabelecimento</b><p>Somente o interessado registra a contratação do próprio operador.</p></div>`}`;

    if(!REG_CASE.coletas.length)return `<div class="reg-status ok"><span>ETAPA 2 · OPERADOR CONTRATADO</span><h3>Contrato ativo · aguardando a primeira coleta</h3>
      <p>A regularidade não é reconhecida por promessa. Ela passa a existir quando a primeira coleta é pesada e a destinação é comprovada.</p></div>
      <div class="decision-facts"><div><small>OPERADOR</small><b>Coopera Amazônia</b></div><div><small>CONTRATO</small><b>Ativo · fictício</b></div>
        <div><small>MASSA</small><b>Ainda não medida</b></div><div><small>SITUAÇÃO</small><b>Em adesão</b></div></div>
      ${regAllowed('operador','cooperativa')?`<div class="reg-actions"><button class="btn" onclick="regColeta()">Registrar coleta pesada</button></div>`
        :`<div class="empty-action"><b>Aguardando o operador</b><p>O registro de coleta e a pesagem pertencem a quem executa o serviço.</p></div>`}`;

    if(!REG_CASE.destinacao)return `<div class="reg-status ok"><span>ETAPA 3 · COLETA PESADA</span><h3>${REG_CASE.coletas.length} coleta(s) registrada(s)</h3>
      <p>Massa aferida na balança, não estimada. Falta a confirmação da unidade de destino para fechar a cadeia.</p></div>
      <div class="seal-checklist">${REG_CASE.coletas.map(c=>`<div><i>✓</i><b>${c.kg} kg · ${c.data}</b><span>${c.operador} · ${c.doc}</span></div>`).join('')}</div>
      <div class="case-alert"><b>Ainda falta a terceira declaração</b><p>Gerador e operador já declararam. A cadeia só fecha quando a balança do destino confirmar a massa recebida.</p></div>
      ${regAllowed('operador','gestao')?`<div class="reg-actions"><button class="btn" onclick="regDestino()">Confirmar pesagem no destino</button><button class="btn sec" onclick="regColeta()">Registrar outra coleta</button></div>`
        :`<div class="empty-action"><b>Aguardando a unidade de destino</b><p>A confirmação vem da balança da unidade receptora.</p></div>`}`;

    if(!REG_CASE.dossie){const t=REG_CASE.coletas.reduce((a,c)=>a+c.kg,0);
      return `<div class="reg-status ok"><span>ETAPA 4 · DESTINAÇÃO COMPROVADA</span><h3>Cadeia fechada com dado medido</h3>
      <p>As três declarações fecham dentro da tolerância. A massa deste caso deixou de ser estimativa e passou a ser medição.</p></div>
      <div class="decision-facts"><div><small>DECLARADO</small><b>${t} kg</b></div><div><small>REPORTADO</small><b>${t} kg</b></div>
        <div><small>PESADO NO DESTINO</small><b>${Math.round(t*0.98)} kg</b></div><div><small>DIVERGÊNCIA</small><b>2% · dentro</b></div></div>
      <div class="circular-callout" style="margin-top:12px"><span class="data-origin calculated">EFEITO NO MODELO</span>
        <h3>Esta medição recalibra o coeficiente do ramo</h3>
        <p>Cada adesão substitui um palpite por um número aferido. Quanto mais estabelecimentos aderem, mais justa fica a estimativa aplicada a quem ainda não aderiu.</p></div>
      ${regAllowed('gestao')?`<div class="reg-actions"><button class="btn" onclick="regDossie()">Reconhecer regularidade e gerar dossiê</button></div>`
        :`<div class="empty-action"><b>Aguardando decisão da SEMA</b><p>Somente a unidade municipal reconhece a regularidade.</p></div>`}`;}

    const t=REG_CASE.coletas.reduce((a,c)=>a+c.kg,0);
    return `<div class="reg-status ok"><span>ETAPA 5 · REGULARIDADE RECONHECIDA</span><h3>Selo PVH-DEMO-0084 · dossiê disponível</h3>
      <p>O estabelecimento regularizou-se sem nunca ter sido notificado, e o município passou a ter dado medido em vez de estimado.</p></div>
      <div class="decision-facts"><div><small>ORIGEM</small><b>Adesão voluntária</b></div><div><small>MASSA</small><b>${t} kg · medida</b></div>
        <div><small>COMPROVANTES</small><b>${REG_CASE.coletas.length}</b></div><div><small>NOTIFICAÇÕES</small><b>Nenhuma</b></div></div>
      <div class="circular-callout" style="margin-top:12px"><span class="data-origin declared">DOSSIÊ DE PROVAS</span>
        <h3>O que o estabelecimento leva consigo</h3>
        <p>Contrato do operador, comprovantes de coleta com massa aferida, confirmação de pesagem no destino e o selo com verificação pública. É o conjunto que ele apresenta a qualquer fiscalização.</p>
        <div class="reg-actions"><button class="btn" onclick="toast('Dossiê demonstrativo gerado em PDF')">Baixar dossiê</button>
          <button class="btn sec" onclick="openPublicSeal('PVH-DEMO-0084')">Verificar selo publicamente</button>
          <button class="btn sec" onclick="regPublishOpportunity()">Publicar oportunidade circular</button></div></div>`;
  }

  /* ---------- TRILHO DE OFÍCIO: o padrão anterior, preservado ---------- */
  if(!REG_CASE.sent)return `<div class="reg-status"><span>ETAPA 1 · AUTODECLARAÇÃO</span><h3>Complete o cadastro técnico</h3><p>O estabelecimento confirma seus dados e apresenta a solução de gerenciamento. Esses valores continuam declarados até serem conciliados.</p></div>
    <div class="reg-grid"><div class="reg-field"><label>CNPJ demonstrativo</label><input value="${REG_CASE.cnpj}" readonly></div><div class="reg-field"><label>Inscrição Mobiliária</label><input value="${REG_CASE.im}" readonly></div><div class="reg-field full"><label>Responsável e contato</label><input value="${REG_CASE.responsible}" readonly></div><div class="reg-field"><label>Geração declarada</label><input value="${REG_CASE.volume} kg/mês" readonly></div><div class="reg-field"><label>Operador informado</label><select><option>${REG_CASE.operator}</option></select></div></div>
    <div class="reg-docs"><button class="reg-doc ${REG_CASE.contract?'on':''}" onclick="regToggleDoc('contract')"><i>${REG_CASE.contract?'✓':'+'}</i><span><b>Contrato do operador</b><small>Documento fictício · PDF demonstrativo</small></span><span class="st ${REG_CASE.contract?'s-reg':'s-not'}">${REG_CASE.contract?'ANEXADO':'PENDENTE'}</span></button><button class="reg-doc ${REG_CASE.pgrs?'on':''}" onclick="regToggleDoc('pgrs')"><i>${REG_CASE.pgrs?'✓':'+'}</i><span><b>PGRS demonstrativo</b><small>Plano e responsável técnico fictícios</small></span><span class="st ${REG_CASE.pgrs?'s-reg':'s-not'}">${REG_CASE.pgrs?'ANEXADO':'PENDENTE'}</span></button></div>
    <div class="reg-actions"><button class="btn" onclick="regSubmit()">Protocolar autodeclaração</button><button class="btn sec" onclick="toast('Rascunho salvo somente nesta demonstração')">Salvar rascunho</button></div>`;

  if(REG_CASE.sent&&!REG_CASE.pending&&!REG_CASE.complement&&!REG_CASE.approved)return `<div class="reg-status"><span>ETAPA 2 · ANÁLISE MUNICIPAL</span><h3>Protocolo recebido e preservado</h3><p>Contrato, PGRS e dados declarados foram relacionados ao processo. O sistema aponta requisitos; a decisão continua humana.</p></div>
    <div class="decision-facts"><div><small>CNPJ + IM</small><b>Conciliados</b></div><div><small>CONTRATO</small><b>Recebido</b></div><div><small>PGRS</small><b>Recebido</b></div><div><small>OPERADOR</small><b>A conferir</b></div></div>
    ${regAllowed('gestao')?`<div class="case-alert"><b>Inconsistência documental encontrada</b><p>A validade informada da licença do operador não coincide com o documento anexado. Solicite complemento sem apagar a declaração original.</p></div><div class="reg-actions"><button class="btn" onclick="regRequestComplement()">Solicitar complementação</button><button class="btn sec" onclick="regApprove()">Aprovar sem pendência</button></div>`:`<div class="empty-action"><b>Aguardando análise da SEMA</b><p>O grande gerador acompanha o prazo e receberá aqui qualquer solicitação de complemento.</p></div>`}`;

  if(REG_CASE.pending&&!REG_CASE.complement)return `<div class="reg-status danger"><span>ETAPA 3 · PENDÊNCIA</span><h3>Complementação solicitada</h3><p>A Prefeitura pediu licença atualizada do operador. A declaração original foi preservada e a pendência não suspende automaticamente serviço público.</p></div><div class="reg-docs"><div class="reg-doc"><i>!</i><span><b>Licença do operador</b><small>Atualizar validade e anexar documento correspondente</small></span><span class="st s-irr">PENDENTE</span></div></div>
    ${regAllowed('gerador')?`<div class="reg-actions"><button class="btn" onclick="regSendComplement()">Enviar licença atualizada</button><button class="btn sec" onclick="toast('Canal de contestação demonstrativo aberto')">Contestar solicitação</button></div>`:`<div class="empty-action"><b>Aguardando resposta do interessado</b><p>O servidor acompanha o prazo, mas não pode preencher o documento em nome do gerador.</p></div>`}`;

  if(REG_CASE.complement&&!REG_CASE.approved)return `<div class="reg-status ok"><span>ETAPA 4 · PRONTO PARA DECISÃO</span><h3>Complementação recebida</h3><p>A nova licença entrou como evento separado. Cadastro, PGRS, contrato e operador estão consistentes no cenário demonstrativo.</p></div><div class="seal-checklist"><div><i>✓</i><b>CNPJ e Inscrição Mobiliária conciliados</b><span>SEMEC · cenário</span></div><div><i>✓</i><b>Contrato e PGRS recebidos</b><span>documentos fictícios</span></div><div><i>✓</i><b>Licença atualizada conferida</b><span>complementação</span></div><div><i>✓</i><b>Processo SEI relacionado</b><span>${REG_CASE.sei}</span></div></div>
    ${regAllowed('gestao')?`<div class="reg-actions"><button class="btn" onclick="regApprove()">Aprovar e liberar emissão</button><button class="btn sec" onclick="regRequestComplement()">Nova pendência</button></div>`:`<div class="empty-action"><b>Aguardando decisão da SEMA</b><p>Somente a unidade municipal competente pode reconhecer a regularidade.</p></div>`}`;

  if(REG_CASE.approved&&!REG_CASE.published)return `<div class="reg-status ok"><span>ETAPA 5 · REGULARIDADE RECONHECIDA</span><h3>Selo PVH-DEMO-0084 emitido</h3><p>A decisão foi atribuída à gestão municipal e pode ser consultada publicamente. O gerador não emitiu o próprio selo.</p></div><div class="decision-facts"><div><small>SITUAÇÃO</small><b>Regular · ativo</b></div><div><small>VALIDADE</small><b>12/08/2027</b></div><div><small>RECICLÁVEIS</small><b>820 kg/mês</b></div><div><small>COMPATIBILIDADE</small><b>92% · cooperativa</b></div></div>
    <div class="circular-callout" style="margin-top:12px"><span class="data-origin calculated">RECOMENDAÇÃO EXPLICÁVEL</span><h3>Há uma oportunidade circular possível</h3><p>Papel, papelão e plástico segregados são compatíveis com a capacidade demonstrativa da Coopera Amazônia. A Prefeitura não impõe fornecedor: o gerador decide se deseja publicar a demanda.</p><div class="reg-actions">${currentSystemProfile==='gestao'?`<button class="btn" disabled>Aguardando autorização do gerador</button>`:`<button class="btn" onclick="regPublishOpportunity()">Autorizar publicação da oportunidade</button>`}<button class="btn sec" onclick="openPublicSeal('PVH-DEMO-0084')">Verificar selo publicamente</button></div></div>`;

  return `<div class="reg-status ok"><span>CASO CONCLUÍDO</span><h3>Regularização virou oportunidade qualificada</h3><p>A situação administrativa permanece no núcleo regulatório; somente os dados necessários da fração reciclável foram encaminhados ao núcleo circular.</p></div><div class="circular-callout"><span class="data-origin declared">AUTORIZADO PELO GERADOR</span><h3>Oportunidade OP-REG-0084 publicada</h3><p>820 kg/mês de recicláveis secos · Nova Porto Velho · compatibilidade 92% · escolha e contratação permanecem voluntárias.</p><div class="reg-actions"><button class="btn" onclick="openCircularOpportunity()">Abrir na área da cooperativa</button><button class="btn sec" onclick="openPublicSeal('PVH-DEMO-0084')">Consultar selo</button></div></div>`;
}

function regContratar(){if(!regAllowed('gerador')){toast('Somente o estabelecimento registra a própria contratação');return;}
  REG_CASE.contratado=true;regEvent('Operador contratado','Contratação registrada pelo estabelecimento. Escolha livre entre credenciados.','CTR-DEMO-0084');
  renderRegularization();toast('Contratação registrada · aguardando primeira coleta');}
function regColeta(){if(!regAllowed('operador','cooperativa')){toast('O registro de coleta pertence a quem executa o serviço');return;}
  const kg=[812,796,834,805][REG_CASE.coletas.length%4];
  const d=new Date();d.setDate(d.getDate()-(3-REG_CASE.coletas.length)*7);
  REG_CASE.coletas.push({kg,data:d.toLocaleDateString('pt-BR'),operador:'Coopera Amazônia',doc:'COL-DEMO-'+(1084+REG_CASE.coletas.length)});
  regEvent('Coleta pesada registrada',kg+' kg aferidos na balança da cooperativa. Massa medida, não estimada.','COL-DEMO-'+(1083+REG_CASE.coletas.length));
  renderRegularization();toast(kg+' kg registrados com pesagem');}
function regDestino(){if(!regAllowed('operador','gestao')){toast('A confirmação vem da unidade de destino');return;}
  REG_CASE.destinacao=true;regEvent('Destinação comprovada','Balança da unidade receptora confirmou a massa. Três declarações reconciliadas.','DEST-DEMO-0084');
  renderRegularization();toast('Cadeia fechada · gerador, operador e destino conferem');}
function regDossie(){if(!regAllowed('gestao')){toast('Somente a gestão municipal reconhece a regularidade');return;}
  REG_CASE.dossie=true;REG_CASE.approved=true;
  regEvent('Regularidade reconhecida por adesão','Selo emitido com base em massa medida. Nenhuma notificação foi necessária.','SELO-DEMO-0084');
  renderRegularization();toast('Regularidade reconhecida · dossiê de provas disponível');}

function regToggleDoc(key){if(!regAllowed('gerador')){toast('Somente o grande gerador pode anexar seus documentos');return;}REG_CASE[key]=!REG_CASE[key];renderRegularization();}
function regSubmit(){if(!regAllowed('gerador')){toast('Somente o interessado pode protocolar a autodeclaração');return;}if(!REG_CASE.contract||!REG_CASE.pgrs){toast('Anexe contrato e PGRS demonstrativos antes de protocolar');return;}REG_CASE.sent=true;regEvent('Autodeclaração protocolada','Grande gerador · contrato e PGRS demonstrativos recebidos.','PROT-DEMO-0084');renderRegularization();toast('Protocolo recebido · análise municipal aberta');}
function regRequestComplement(){if(!regAllowed('gestao')){toast('Somente a gestão municipal pode registrar pendência');return;}REG_CASE.pending=true;REG_CASE.complement=false;regEvent('Complementação solicitada','SEMA · licença do operador precisa de atualização.','PEND-DEMO-0084');renderRegularization();toast('Pendência enviada ao grande gerador');}
function regSendComplement(){if(!regAllowed('gerador')){toast('Somente o interessado pode responder à pendência');return;}REG_CASE.complement=true;REG_CASE.pending=false;regEvent('Licença atualizada recebida','Grande gerador · complemento preservado como novo evento.','COMP-DEMO-0084-R1');renderRegularization();toast('Complementação protocolada · pronta para decisão');}
function regApprove(){if(!regAllowed('gestao')){toast('Somente a gestão municipal pode reconhecer a regularidade');return;}REG_CASE.sent=true;REG_CASE.complement=true;REG_CASE.pending=false;REG_CASE.approved=true;regEvent('Regularidade reconhecida e selo emitido','SEMA · decisão demonstrativa vinculada ao processo.','SELO-PVH-DEMO-0084');renderRegularization();toast('Selo emitido pela gestão municipal');}
function regPublishOpportunity(){if(!regAllowed('gerador')){toast('A publicação depende de autorização do gerador privado');return;}REG_CASE.published=true;regEvent('Oportunidade circular autorizada','Grande gerador · apenas a fração reciclável compatível foi publicada.','OP-REG-0084');renderRegularization();updateCircularOpportunity();toast('Oportunidade publicada para avaliação da cooperativa');}
function updateCircularOpportunity(){const el=document.getElementById('regOpportunityBanner');if(!el)return;el.style.display=REG_CASE?.published?'block':'none';}
function openCircularOpportunity(){if(currentSystemProfile==='banca'||currentSystemProfile==='cooperativa')irPara('oper');else selectSystemProfile('cooperativa',{route:'oper'});setTimeout(()=>document.getElementById('regOpportunityBanner')?.scrollIntoView({behavior:'smooth',block:'center'}),120);}

function openPublicSeal(code='PVH-DEMO-0084',options={}){document.getElementById('publicSealInput').value=code;searchPublicSeal();document.getElementById('publicSealPortal').classList.add('on');document.body.style.overflow='hidden';if(options.history!==false)saveNavigationState({screen:'public',code,profile:currentSystemProfile||'banca',route:document.querySelector('.view.on')?.id?.replace('v-','')||'selo',returnable:true});}
function closePublicSeal(options={}){document.getElementById('publicSealPortal').classList.remove('on');document.body.style.overflow='';if(options.history!==false&&history.state?.screen==='public'){if(history.state.returnable)history.back();else{selectSystemProfile('banca',{route:'selo',history:false,silent:true});saveNavigationState({screen:'app',profile:'banca',route:'selo'},true);}}}
function searchPublicSeal(){const input=document.getElementById('publicSealInput'),code=input.value.trim().toUpperCase(),valid=code==='PVH-DEMO-0084';const card=document.getElementById('publicSealCard');card.classList.toggle('invalid',!valid);document.getElementById('publicSealName').textContent=valid?'Mercado Ipê Roxo':'Registro não encontrado';document.getElementById('publicSealCode').textContent=valid?'Código PVH-DEMO-0084 · Porto Velho/RO':'Confira o código informado. Nenhum dado oficial foi consultado.';document.getElementById('publicSealState').textContent=valid?SEAL_PUBLIC_STATE:'NÃO LOCALIZADO';document.getElementById('publicSealUpdated').textContent=new Date().toLocaleString('pt-BR');}

window.addEventListener('load',()=>{if(!REG_CASE)REG_CASE=regularizationInitial();renderRegularization();updateCircularOpportunity();});
