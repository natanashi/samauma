/* Jornada demonstrativa integrada do SAMAÚMA. Todos os dados são fictícios. */
const DEMO_ROLES={
  servidor:{name:'Servidor SEMA',desc:'Instrui o processo, analisa as evidências e registra a decisão administrativa.',perm:'ANÁLISE E DECISÃO'},
  operador:{name:'Operador de coleta',desc:'Registra somente o evento de coleta sob sua responsabilidade.',perm:'REGISTRO OPERACIONAL'},
  cooperativa:{name:'Cooperativa / destino',desc:'Confirma o recebimento e a massa aferida na balança.',perm:'PESAGEM E RECEBIMENTO'},
  auditoria:{name:'Auditoria',desc:'Consulta a cadeia de evidências sem alterar o processo.',perm:'SOMENTE LEITURA'}
};
let CASE_DEMO;

function demoInitial(){return {
  stage:1,role:'servidor',sei:null,declared:null,collected:null,gross:null,tare:null,weighed:null,
  reconciled:false,resolved:false,acceptedDeclared:null,acceptedCollected:null,acceptedWeighed:null,
  events:[{time:'08:42',title:'Cadastro técnico constituído',detail:'SEMEC · identidade econômica conciliada por CNPJ demonstrativo e IM.',id:'CAD-DEMO-0084'}]
};}
function demoReset(){CASE_DEMO=demoInitial();renderDemo();toast('Caso demonstrativo reiniciado · nenhum dado oficial foi alterado');}
function demoSetRole(role){CASE_DEMO.role=role;renderDemo();}
function demoEvent(time,title,detail,id){CASE_DEMO.events.push({time,title,detail,id});}
function demoHeader(title,desc){const r=DEMO_ROLES[CASE_DEMO.role];return `<div class="work-intro"><div><div class="role-name">${r.name}</div><h4>${title}</h4><p>${desc}</p></div><span class="permission">${r.perm}</span></div>`;}
function demoUnavailable(expected){return `<div class="empty-action"><b>Esta ação pertence a ${expected}</b><p>Alterne o perfil para executar a próxima etapa. A separação de funções evita que uma mesma pessoa produza e valide a própria evidência.</p></div>`;}
function demoActiveValues(){return CASE_DEMO.resolved?
  {declared:CASE_DEMO.acceptedDeclared,collected:CASE_DEMO.acceptedCollected,weighed:CASE_DEMO.acceptedWeighed,ret:true}:
  {declared:CASE_DEMO.declared,collected:CASE_DEMO.collected,weighed:CASE_DEMO.weighed,ret:false};}
function demoKg(value,ret=false){return value==null?'—':value.toLocaleString('pt-BR')+' kg'+(ret?' · retificado':'');}

function renderDemo(){
  if(!CASE_DEMO)CASE_DEMO=demoInitial();
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('on',b.dataset.role===CASE_DEMO.role));
  document.querySelectorAll('#demoJourney .jstep').forEach(el=>{
    const n=+el.dataset.stage;
    el.classList.toggle('done',n<CASE_DEMO.stage||CASE_DEMO.stage===7&&n===7);
    el.classList.toggle('current',n===CASE_DEMO.stage&&CASE_DEMO.stage<7);
  });
  const status=document.getElementById('demoStatus'),statusText=document.getElementById('demoStatusText');
  status.className='st np '+(CASE_DEMO.resolved?'s-reg':CASE_DEMO.reconciled?'s-irr':'s-not');
  status.textContent=CASE_DEMO.resolved?'REGULARIZADO':CASE_DEMO.reconciled?'DIVERGÊNCIA ABERTA':'EM INSTRUÇÃO';
  statusText.textContent=CASE_DEMO.resolved?'Decisão registrada com evidências conciliadas':CASE_DEMO.reconciled?'Aguardando retificação dos responsáveis':'Etapa '+CASE_DEMO.stage+' de 7 · fluxo demonstrativo';
  document.getElementById('demoSei').textContent=CASE_DEMO.sei||'Não vinculado';
  const seiOrigin=document.getElementById('demoSeiOrigin');seiOrigin.textContent=CASE_DEMO.sei?'SEI · referência':'aguardando';
  const v=demoActiveValues();
  document.getElementById('demoSumDeclared').textContent=demoKg(v.declared,v.ret);
  document.getElementById('demoSumCollected').textContent=demoKg(v.collected,v.ret);
  document.getElementById('demoSumWeighed').textContent=demoKg(v.weighed,v.ret);
  const diff=v.declared&&v.weighed?Math.abs(v.weighed-v.declared)/v.declared*100:null;
  document.getElementById('demoSumDiff').textContent=diff==null?'—':NUM(diff,1)+'%'+(v.ret?' · aceita':'');
  renderDemoWorkspace();renderDemoEvidence();renderDemoTimeline();renderDemoGuide();
}
function renderDemoGuide(){
  const labels=['','Vincular processo SEI','Receber autodeclaração','Entrar como operador','Entrar como destino','Executar conciliação','Validar retificação','Reiniciar demonstração'];
  document.getElementById('demoGuideBtn').textContent=labels[CASE_DEMO.stage];
}
function demoGuide(){
  if(CASE_DEMO.stage===1){demoSetRole('servidor');demoLinkSei();}
  else if(CASE_DEMO.stage===2){demoSetRole('servidor');demoReceiveDeclaration();}
  else if(CASE_DEMO.stage===3){demoSetRole('operador');toast('Perfil Operador ativo · registre a coleta no formulário');}
  else if(CASE_DEMO.stage===4){demoSetRole('cooperativa');toast('Perfil Destino ativo · informe os valores da balança');}
  else if(CASE_DEMO.stage===5){demoSetRole('servidor');demoReconcile();}
  else if(CASE_DEMO.stage===6){demoSetRole('servidor');demoRegularize();}
  else demoReset();
}

function renderDemoWorkspace(){
  const w=document.getElementById('demoWorkspace'),s=CASE_DEMO.stage,r=CASE_DEMO.role;
  if(s===1){w.innerHTML=demoHeader('Vincular o cadastro ao processo oficial','O SAMAÚMA guarda a referência; pareceres e decisões continuam formalizados no SEI.')+(r==='servidor'?`<div class="case-alert ok"><b>Identidade cadastral conciliada</b><p>CNPJ demonstrativo e Inscrição Mobiliária apontam para o mesmo estabelecimento fictício.</p></div><div class="work-actions"><button class="btn" onclick="demoLinkSei()">Vincular processo SEI fictício</button><span class="hint">Não cria processo real</span></div>`:demoUnavailable('um servidor da SEMA'));return;}
  if(s===2){w.innerHTML=demoHeader('Receber autodeclaração e PGRS','O gerador declara sua produção e assume responsabilidade pela veracidade dos documentos.')+(r==='servidor'?`<div class="case-alert ok"><b>Processo SEI vinculado</b><p>${CASE_DEMO.sei} · referência demonstrativa pronta para receber a documentação.</p></div><div class="recon-grid"><div class="recon-item"><span>Volume declarado</span><b>880 kg</b><small>período de 7 dias</small></div><div class="recon-item"><span>Documento</span><b style="font-size:13px">PGRS-DEMO.pdf</b><small>arquivo fictício</small></div><div class="recon-item"><span>Responsável</span><b style="font-size:13px">Gerador</b><small>origem declarada</small></div></div><div class="work-actions"><button class="btn" onclick="demoReceiveDeclaration()">Receber documentação</button><span class="hint">Protocolo externo demonstrativo</span></div>`:demoUnavailable('um servidor da SEMA'));return;}
  if(s===3){w.innerHTML=demoHeader('Registrar a coleta realizada','O operador informa apenas o evento sob sua responsabilidade; a massa ainda será confirmada no destino.')+(r==='operador'?`<div class="work-form"><div><label for="demoCollected">Massa estimada na coleta (kg)</label><input id="demoCollected" type="number" min="1" value="812"></div><div><label for="demoMaterial">Material predominante</label><select id="demoMaterial"><option>Recicláveis secos segregados</option><option>Resíduo comercial misto</option></select></div><div><label for="demoVehicle">Veículo</label><input id="demoVehicle" value="FROTA-DEMO-07" readonly></div><div><label for="demoManifest">Manifesto</label><input id="demoManifest" value="MTR-DEMO-2026-041" readonly></div></div><div class="work-actions"><button class="btn" onclick="demoRegisterCollection()">Registrar coleta</button><span class="hint">Evento assinado pelo perfil Operador</span></div>`:demoUnavailable('o operador de coleta'));return;}
  if(s===4){w.innerHTML=demoHeader('Aferir a massa recebida','O destino registra bruto e tara. A massa líquida é calculada sem substituir o valor informado na coleta.')+(r==='cooperativa'?`<div class="work-form"><div><label for="demoGross">Peso bruto (kg)</label><input id="demoGross" type="number" min="1" value="3820" oninput="demoWeightPreview()"></div><div><label for="demoTare">Tara do veículo (kg)</label><input id="demoTare" type="number" min="1" value="3058" oninput="demoWeightPreview()"></div><div><label>Massa líquida calculada</label><input id="demoNet" value="762 kg" readonly></div><div><label>Tíquete de balança</label><input value="BAL-DEMO-0917" readonly></div></div><div class="work-actions"><button class="btn" onclick="demoRegisterWeight()">Confirmar recebimento e pesagem</button><span class="hint">Origem: balança do destino</span></div>`:demoUnavailable('a cooperativa ou unidade de destino'));return;}
  if(s===5){const d=Math.abs(CASE_DEMO.weighed-CASE_DEMO.declared)/CASE_DEMO.declared*100;w.innerHTML=demoHeader('Conciliar as três declarações','O motor compara as fontes, mas a abertura da ocorrência é confirmada por servidor competente.')+(r==='servidor'?`<div class="recon-grid"><div class="recon-item"><span>Gerador · declarado</span><b>${demoKg(CASE_DEMO.declared)}</b><small>AUT-DEMO-0084</small></div><div class="recon-item"><span>Operador · coletado</span><b>${demoKg(CASE_DEMO.collected)}</b><small>COL-DEMO-0148</small></div><div class="recon-item"><span>Destino · pesado</span><b>${demoKg(CASE_DEMO.weighed)}</b><small>BAL-DEMO-0917</small></div></div><div class="case-alert"><b>Divergência potencial de ${NUM(d,1)}%</b><p>Acima da tolerância demonstrativa de 10%. O alerta não é autuação e requer análise humana.</p></div><div class="work-actions"><button class="btn" onclick="demoReconcile()">Abrir ocorrência de conciliação</button><span class="hint">Regra versionada: CONC-01</span></div>`:demoUnavailable('um servidor da SEMA'));return;}
  if(s===6){w.innerHTML=demoHeader('Analisar a retificação recebida','Os eventos originais permanecem na trilha. A correção entra com novos identificadores e justificativa.')+(r==='servidor'?`<div class="case-alert"><b>Ocorrência INC-DEMO-0031 em análise</b><p>Gerador, operador e destino apresentaram pacote retificador. A nova diferença é de 1,0%, dentro da tolerância demonstrativa.</p></div><div class="recon-grid"><div class="recon-item"><span>Declaração retificada</span><b>790 kg</b><small>AUT-DEMO-0084-R1</small></div><div class="recon-item"><span>Coleta retificada</span><b>785 kg</b><small>COL-DEMO-0148-R1</small></div><div class="recon-item"><span>Pesagem retificada</span><b>782 kg</b><small>BAL-DEMO-0917-R1</small></div></div><div class="work-actions"><button class="btn" onclick="demoRegularize()">Validar retificação e regularizar</button><span class="hint">Decisão será referenciada no SEI</span></div>`:demoUnavailable('um servidor da SEMA'));return;}
  w.innerHTML=demoHeader('Caso regularizado com rastreabilidade','A decisão está vinculada ao processo, e todos os registros originais e retificadores permanecem disponíveis para auditoria.')+`<div class="case-alert ok"><b>Regularização concluída</b><p>Conciliação aceita com diferença de 1,0%. Decisão DEC-DEMO-0027 vinculada a ${CASE_DEMO.sei}.</p></div><div class="recon-grid"><div class="recon-item"><span>Resultado</span><b style="font-size:14px;color:#15803d">CONFORME</b><small>análise humana</small></div><div class="recon-item"><span>Provas relacionadas</span><b>9</b><small>originais + retificações</small></div><div class="recon-item"><span>Registros apagados</span><b>0</b><small>trilha preservada</small></div></div><div class="work-actions"><button class="btn sec" onclick="demoSetRole('auditoria')">Consultar como auditoria</button><button class="btn" onclick="demoReset()">Executar novamente</button></div>`;
}

function demoLinkSei(){if(CASE_DEMO.stage!==1)return;CASE_DEMO.sei='00000.004172/2026-84';CASE_DEMO.stage=2;demoEvent('08:51','Processo SEI vinculado','Servidor SEMA · referência fictícia associada ao cadastro técnico.','SEI-DEMO-4172');renderDemo();toast('Processo SEI fictício vinculado');}
function demoReceiveDeclaration(){if(CASE_DEMO.stage!==2)return;CASE_DEMO.declared=880;CASE_DEMO.stage=3;demoEvent('09:07','Autodeclaração recebida','Gerador · 880 kg em 7 dias e PGRS demonstrativo protocolado.','AUT-DEMO-0084');CASE_DEMO.role='operador';renderDemo();toast('Documentação recebida · perfil Operador ativado');}
function demoRegisterCollection(){const el=document.getElementById('demoCollected'),kg=el?+el.value:0;if(CASE_DEMO.stage!==3||kg<=0){toast('Informe uma massa de coleta válida');return;}CASE_DEMO.collected=kg;CASE_DEMO.stage=4;demoEvent('10:18','Coleta registrada','Operador · '+kg+' kg estimados, veículo FROTA-DEMO-07.','COL-DEMO-0148');CASE_DEMO.role='cooperativa';renderDemo();toast('Coleta registrada · perfil Destino ativado');}
function demoWeightPreview(){const g=+document.getElementById('demoGross').value||0,t=+document.getElementById('demoTare').value||0,n=document.getElementById('demoNet');if(n)n.value=Math.max(0,g-t).toLocaleString('pt-BR')+' kg';}
function demoRegisterWeight(){const g=+document.getElementById('demoGross').value||0,t=+document.getElementById('demoTare').value||0;if(CASE_DEMO.stage!==4||g<=t){toast('O peso bruto deve ser maior que a tara');return;}CASE_DEMO.gross=g;CASE_DEMO.tare=t;CASE_DEMO.weighed=g-t;CASE_DEMO.stage=5;demoEvent('11:03','Pesagem confirmada','Destino · bruto '+g+' kg, tara '+t+' kg, líquido '+CASE_DEMO.weighed+' kg.','BAL-DEMO-0917');CASE_DEMO.role='servidor';renderDemo();toast('Pesagem confirmada · conciliação disponível');}
function demoReconcile(){if(CASE_DEMO.stage!==5)return;const d=Math.abs(CASE_DEMO.weighed-CASE_DEMO.declared)/CASE_DEMO.declared*100;CASE_DEMO.reconciled=true;CASE_DEMO.stage=6;demoEvent('11:06','Divergência aberta','SAMAÚMA sinalizou '+NUM(d,1)+'%; servidor confirmou a ocorrência para retificação.','INC-DEMO-0031');renderDemo();toast('Divergência confirmada · nenhuma autuação automática');}
function demoRegularize(){if(CASE_DEMO.stage!==6)return;CASE_DEMO.acceptedDeclared=790;CASE_DEMO.acceptedCollected=785;CASE_DEMO.acceptedWeighed=782;CASE_DEMO.resolved=true;CASE_DEMO.stage=7;demoEvent('14:32','Pacote retificador preservado','Gerador, operador e destino enviaram novos eventos; originais mantidos.','RET-DEMO-0031-R1');demoEvent('14:48','Regularização decidida','Servidor SEMA · diferença final de 1,0%, decisão referenciada no SEI.','DEC-DEMO-0027');renderDemo();toast('Caso regularizado · trilha completa preservada');}

function renderDemoEvidence(){
  const out=[];if(CASE_DEMO.sei)out.push(['Processo SEI',CASE_DEMO.sei,'referência']);
  if(CASE_DEMO.declared!=null)out.push(['Autodeclaração','AUT-DEMO-0084','declarado']);
  if(CASE_DEMO.collected!=null)out.push(['Evento de coleta','COL-DEMO-0148','operador']);
  if(CASE_DEMO.weighed!=null)out.push(['Tíquete de balança','BAL-DEMO-0917','verificado']);
  if(CASE_DEMO.reconciled)out.push(['Ocorrência','INC-DEMO-0031','calculado + validado']);
  if(CASE_DEMO.resolved)out.push(['Decisão','DEC-DEMO-0027','servidor']);
  document.getElementById('demoEvidence').innerHTML=out.length?out.map(x=>`<div class="dl"><span class="k">${x[0]}<small style="display:block;color:#7b8881">${x[2]}</small></span><span class="v mono">${x[1]}</span></div>`).join(''):`<div class="empty-action"><b>Nenhuma evidência operacional</b><p>Os comprovantes aparecerão conforme a jornada avançar.</p></div>`;
}
function renderDemoTimeline(){document.getElementById('demoTimeline').innerHTML=CASE_DEMO.events.slice().reverse().map(e=>`<div class="event"><span class="time">${e.time}</span><span class="pin"></span><div><b>${e.title}</b><p>${e.detail}</p><span class="eid">${e.id}</span></div></div>`).join('');}

window.addEventListener('load',()=>{CASE_DEMO=demoInitial();renderDemo();});
