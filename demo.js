/* Operação integrada SAMAÚMA — todos os nomes, documentos e valores são demonstrativos. */
const DEMO_ROLES={
  gerador:{name:'Gerador responsável',desc:'Publica a demanda e responde pelos dados declarados.',perm:'PUBLICAR DEMANDA'},
  cooperativa:{name:'Cooperativa',desc:'Avalia a viabilidade, recebe a pesagem e presta contas do rateio.',perm:'ACEITE, DESTINO E RENDA'},
  catador:{name:'Catador · operação de campo',desc:'Executa a rota e registra somente o que observou, inclusive sem internet.',perm:'COLETA EM CAMPO'},
  servidor:{name:'Servidor municipal',desc:'Analisa divergências e acompanha resultados agregados sem substituir o processo oficial.',perm:'CONCILIAÇÃO E CONTROLE'}
};

let CASE_DEMO,judgeStep=0,judgeStarted=0,judgeTimer=null;
const DEMO_TOTAL=268,DEMO_SERVICE=96,DEMO_MATERIAL=148,DEMO_TRACE=24;

function demoInitial(){return {
  stage:1,role:'gerador',sei:'00000.004172/2026-84',declared:null,collected:null,gross:null,tare:null,weighed:null,
  acceptedWeighed:null,reconciled:false,resolved:false,paid:false,synced:false,
  events:[{time:'08:42',title:'Cadastro técnico conciliado',detail:'SEMEC · CNPJ e Inscrição Mobiliária demonstrativos vinculados ao processo SEI fictício.','id':'CAD-DEMO-0084'}]
};}
function demoReset(){CASE_DEMO=demoInitial();renderDemo();toast('Operação reiniciada · nenhum dado oficial foi alterado');}
function demoSetRole(role){CASE_DEMO.role=role;renderDemo();}
function demoEvent(time,title,detail,id){CASE_DEMO.events.push({time,title,detail,id});}
function demoHeader(title,desc){const r=DEMO_ROLES[CASE_DEMO.role];return `<div class="work-intro"><div><div class="role-name">${r.name}</div><h4>${title}</h4><p>${desc}</p></div><span class="permission">${r.perm}</span></div>`;}
function demoUnavailable(expected){return `<div class="empty-action"><b>Esta ação pertence a ${expected}</b><p>Alterne o perfil responsável. Separar quem declara, executa e valida torna a evidência confiável.</p></div>`;}
function demoKg(value,note=''){return value==null?'—':value.toLocaleString('pt-BR')+' kg'+(note?' · '+note:'');}

function renderDemo(){
  if(!CASE_DEMO)CASE_DEMO=demoInitial();
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.toggle('on',b.dataset.role===CASE_DEMO.role));
  document.querySelectorAll('#demoJourney .jstep').forEach(el=>{const n=+el.dataset.stage;el.classList.toggle('done',n<CASE_DEMO.stage||CASE_DEMO.stage===8&&n===8);el.classList.toggle('current',n===CASE_DEMO.stage&&CASE_DEMO.stage<8);});
  const status=document.getElementById('demoStatus'),statusText=document.getElementById('demoStatusText');
  const state=CASE_DEMO.paid?'COMPROVADO':CASE_DEMO.resolved?'PRONTO PARA PAGAR':CASE_DEMO.reconciled?'DIVERGÊNCIA ABERTA':CASE_DEMO.stage>1?'EM EXECUÇÃO':'RASCUNHO';
  status.className='st np '+(CASE_DEMO.paid?'s-reg':CASE_DEMO.reconciled&&!CASE_DEMO.resolved?'s-irr':'s-not');status.textContent=state;
  statusText.textContent=CASE_DEMO.paid?'Coleta, destino e renda comprovados':CASE_DEMO.reconciled&&!CASE_DEMO.resolved?'Correção necessária antes do pagamento':'Etapa '+CASE_DEMO.stage+' de 8 · operação demonstrativa';
  document.getElementById('demoSei').textContent=CASE_DEMO.sei;document.getElementById('demoSeiOrigin').textContent='referência fictícia';
  const weight=CASE_DEMO.acceptedWeighed??CASE_DEMO.weighed;
  document.getElementById('demoSumDeclared').textContent=demoKg(CASE_DEMO.declared);
  document.getElementById('demoSumCollected').textContent=demoKg(CASE_DEMO.collected,CASE_DEMO.synced?'sincronizado':'');
  document.getElementById('demoSumWeighed').textContent=demoKg(weight,CASE_DEMO.resolved?'retificado':'');
  const diff=CASE_DEMO.collected&&weight?Math.abs(weight-CASE_DEMO.collected)/CASE_DEMO.collected*100:null;
  document.getElementById('demoSumDiff').textContent=diff==null?'—':NUM(diff,1)+'%'+(CASE_DEMO.resolved?' · aceita':'');
  renderDemoWorkspace();renderDemoEvidence();renderDemoTimeline();renderDemoGuide();
}

function renderDemoGuide(){
  const labels=['','Publicar oportunidade','Aceitar como cooperativa','Registrar coleta offline','Confirmar pesagem','Executar conciliação','Validar correção','Liquidar e ratear','Reiniciar operação'];
  document.getElementById('demoGuideBtn').textContent=labels[CASE_DEMO.stage];
}
function demoGuide(){
  if(CASE_DEMO.stage===1){demoSetRole('gerador');demoPublish();}
  else if(CASE_DEMO.stage===2){demoSetRole('cooperativa');demoAccept();}
  else if(CASE_DEMO.stage===3){demoSetRole('catador');demoRegisterCollection();}
  else if(CASE_DEMO.stage===4){demoSetRole('cooperativa');demoRegisterWeight();}
  else if(CASE_DEMO.stage===5){demoSetRole('servidor');demoReconcile();}
  else if(CASE_DEMO.stage===6){demoSetRole('servidor');demoCorrect();}
  else if(CASE_DEMO.stage===7){demoSetRole('cooperativa');demoSettle();}
  else demoReset();
}

function renderDemoWorkspace(){
  const w=document.getElementById('demoWorkspace'),s=CASE_DEMO.stage,r=CASE_DEMO.role;
  if(s===1){w.innerHTML=demoHeader('Publicar uma demanda de coleta','O estabelecimento informa material, quantidade estimada, janela e remuneração. A massa ainda é declarada — não é tratada como pesagem.')+(r==='gerador'?`<div class="work-form"><div><label>Material</label><select><option>Recicláveis secos segregados</option></select></div><div><label>Quantidade estimada</label><input value="820 kg" readonly></div><div><label>Janela de coleta</label><input value="Hoje · 14h às 16h" readonly></div><div><label>Serviço de coleta</label><input value="R$ 96,00 · cenário" readonly></div></div><div class="work-actions"><button class="btn" onclick="demoPublish()">Publicar oportunidade</button><span class="hint">Vinculada ao SEI fictício ${CASE_DEMO.sei}</span></div>`:demoUnavailable('o gerador responsável'));return;}
  if(s===2){w.innerHTML=demoHeader('Avaliar e aceitar a oportunidade','O motor de compatibilidade recomenda organizações com base em distância, licença, material e capacidade — a cooperativa decide.')+(r==='cooperativa'?`<div class="case-alert ok"><b>Compatibilidade de 92%</b><p>Coopera Amazônia · 7,8 km · papel, papelão e plástico aceitos · capacidade suficiente nesta semana.</p></div><div class="recon-grid"><div class="recon-item"><span>Volume estimado</span><b>820 kg</b><small>origem: gerador</small></div><div class="recon-item"><span>Receita projetada</span><b>R$ 268</b><small>serviço + material + prova</small></div><div class="recon-item"><span>Rota agrupada</span><b>3 pontos</b><small>12,4 km · cenário</small></div></div><div class="work-actions"><button class="btn" onclick="demoAccept()">Aceitar oportunidade</button><span class="hint">Aceite voluntário e demonstrativo</span></div>`:demoUnavailable('a cooperativa'));return;}
  if(s===3){w.innerHTML=demoHeader('Executar a coleta em campo','A tarefa cabe no celular e pode ser salva sem conexão. Localização identifica o atendimento, não rastreia permanentemente a pessoa.')+(r==='catador'?`<div class="phone-demo"><div class="phone-top"><b>SAMAÚMA Campo</b><span class="offline-chip">offline</span></div><div class="phone-body"><div class="phone-route"><small>ROTA 07 · PARADA 2 DE 3</small><b>Mercado Ipê Roxo</b><p>Nova Porto Velho · recicláveis secos · janela até 16h</p></div><div class="phone-stats"><div><b>7,8 km</b><span>DISTÂNCIA</span></div><div><b>820 kg</b><span>ESTIMADO</span></div><div><b>R$ 96</b><span>SERVIÇO</span></div></div><label style="display:block;font-size:8px;margin-bottom:4px">MASSA OBSERVADA</label><input id="demoCollected" type="number" value="785" style="width:100%;padding:9px;margin-bottom:7px;border:1px solid #bdc8c2"><button class="phone-btn" onclick="demoRegisterCollection()">Salvar coleta no dispositivo</button><div class="phone-note">Foto, QR e horário serão vinculados ao sincronizar</div></div></div>`:demoUnavailable('o catador responsável pela rota'));return;}
  if(s===4){w.innerHTML=demoHeader('Registrar a pesagem de recebimento','A cooperativa informa bruto e tara. O sistema calcula a massa líquida sem apagar o valor coletado em campo.')+(r==='cooperativa'?`<div class="case-alert ok"><b>Registro de campo sincronizado</b><p>785 kg · foto demonstrativa · QR OP-PVH-2026-014 · 14h37.</p></div><div class="work-form"><div><label for="demoGross">Peso bruto (kg)</label><input id="demoGross" type="number" value="3820" oninput="demoWeightPreview()"></div><div><label for="demoTare">Tara do veículo (kg)</label><input id="demoTare" type="number" value="3078" oninput="demoWeightPreview()"></div><div><label>Massa líquida calculada</label><input id="demoNet" value="742 kg" readonly></div><div><label>Tíquete</label><input value="BAL-DEMO-0917" readonly></div></div><div class="work-actions"><button class="btn" onclick="demoRegisterWeight()">Confirmar recebimento</button><span class="hint">Origem: balança do destino</span></div>`:demoUnavailable('a cooperativa responsável pelo destino'));return;}
  if(s===5){const d=Math.abs(CASE_DEMO.weighed-CASE_DEMO.collected)/CASE_DEMO.collected*100;w.innerHTML=demoHeader('Conciliar coleta e destino','A regra encontra inconsistências, mas não aplica penalidade. O servidor confirma se o caso precisa de correção.')+(r==='servidor'?`<div class="recon-grid"><div class="recon-item"><span>Declarado</span><b>${demoKg(CASE_DEMO.declared)}</b><small>gerador</small></div><div class="recon-item"><span>Coletado</span><b>${demoKg(CASE_DEMO.collected)}</b><small>campo</small></div><div class="recon-item"><span>Pesado</span><b>${demoKg(CASE_DEMO.weighed)}</b><small>balança</small></div></div><div class="case-alert"><b>Divergência de ${NUM(d,1)}%</b><p>Acima da tolerância demonstrativa de 5%. O tíquete precisa ser conferido antes de liberar o comprovante e o pagamento.</p></div><div class="work-actions"><button class="btn" onclick="demoReconcile()">Abrir fila de inconsistência</button><span class="hint">Não sobrescreve nenhum registro</span></div>`:demoUnavailable('um servidor municipal'));return;}
  if(s===6){w.innerHTML=demoHeader('Validar a correção recebida','A cooperativa identificou tara digitada incorretamente. O tíquete original continua na trilha e a correção entra como novo evento.')+(r==='servidor'?`<div class="case-alert"><b>Correção COOP-RET-0917 recebida</b><p>Nova massa líquida: 782 kg. Diferença para o campo: 0,4%, dentro da tolerância demonstrativa.</p></div><div class="recon-grid"><div class="recon-item"><span>Pesagem original</span><b>742 kg</b><small>preservada</small></div><div class="recon-item"><span>Pesagem corrigida</span><b>782 kg</b><small>novo evento</small></div><div class="recon-item"><span>Registros apagados</span><b>0</b><small>trilha íntegra</small></div></div><div class="work-actions"><button class="btn" onclick="demoCorrect()">Validar correção</button><span class="hint">Ato demonstrativo do perfil competente</span></div>`:demoUnavailable('um servidor municipal'));return;}
  if(s===7){w.innerHTML=demoHeader('Liquidar o serviço e registrar o rateio','A cooperativa separa remuneração do serviço, valor do material e incentivo pela evidência completa.')+(r==='cooperativa'?`<div class="case-income"><div><span>Serviço de coleta</span><b>R$ 96</b></div><div><span>Material recuperado</span><b>R$ 148</b></div><div><span>Prova completa</span><b>R$ 24</b></div><div><span>Total</span><b>R$ 268</b></div></div><div class="meta" style="margin-top:10px"><b>Rateio demonstrativo</b><br>20% para estrutura da cooperativa (R$ 53,60) e R$ 214,40 distribuídos entre quatro participantes conforme a regra aprovada.</div><div class="work-actions"><button class="btn" onclick="demoSettle()">Registrar liquidação e rateio</button><span class="hint">Não movimenta dinheiro real</span></div>`:demoUnavailable('a cooperativa'));return;}
  w.innerHTML=demoHeader('Operação comprovada de ponta a ponta','Material, serviço, destino e renda foram relacionados em uma única cadeia auditável.')+`<div class="case-alert ok"><b>Resultado disponível para o Município e para a cooperativa</b><p>782 kg recuperados, R$ 268 em receita demonstrativa e nove evidências relacionadas ao processo SEI fictício.</p></div><div class="case-income"><div><span>Massa recuperada</span><b>782 kg</b></div><div><span>Receita gerada</span><b>R$ 268</b></div><div><span>Diferença final</span><b>0,4%</b></div><div><span>Evidências</span><b>9</b></div></div><div class="work-actions"><button class="btn" onclick="demoDownloadDossier()">Baixar dossiê demonstrativo</button><button class="btn sec" onclick="irPara('ind')">Ver impacto agregado</button><button class="btn sec" onclick="demoReset()">Executar novamente</button></div>`;
}

function demoPublish(){if(CASE_DEMO.stage!==1)return;CASE_DEMO.declared=820;CASE_DEMO.stage=2;CASE_DEMO.role='cooperativa';demoEvent('09:03','Oportunidade publicada','Gerador · 820 kg estimados, janela 14h–16h e serviço de R$ 96.','OP-PVH-2026-014');renderDemo();toast('Oportunidade publicada · cooperativa recomendada');}
function demoAccept(){if(CASE_DEMO.stage!==2)return;CASE_DEMO.stage=3;CASE_DEMO.role='catador';demoEvent('09:16','Oportunidade aceita','Coopera Amazônia · compatibilidade 92%, rota agrupada em três pontos.','ACE-DEMO-0038');renderDemo();toast('Oportunidade aceita · rota enviada ao campo');}
function demoRegisterCollection(){const el=document.getElementById('demoCollected'),kg=el?+el.value:785;if(CASE_DEMO.stage!==3||kg<=0){toast('Informe uma massa válida');return;}CASE_DEMO.collected=kg;CASE_DEMO.synced=true;CASE_DEMO.stage=4;CASE_DEMO.role='cooperativa';demoEvent('14:37','Coleta salva offline e sincronizada','Catador · '+kg+' kg observados, foto, QR e horário relacionados.','COL-DEMO-0148');renderDemo();toast('Coleta sincronizada · pesagem liberada');}
function demoWeightPreview(){const g=+document.getElementById('demoGross').value||0,t=+document.getElementById('demoTare').value||0,n=document.getElementById('demoNet');if(n)n.value=Math.max(0,g-t).toLocaleString('pt-BR')+' kg';}
function demoRegisterWeight(){const g=+document.getElementById('demoGross')?.value||3820,t=+document.getElementById('demoTare')?.value||3078;if(CASE_DEMO.stage!==4||g<=t){toast('O peso bruto deve ser maior que a tara');return;}CASE_DEMO.gross=g;CASE_DEMO.tare=t;CASE_DEMO.weighed=g-t;CASE_DEMO.stage=5;CASE_DEMO.role='servidor';demoEvent('15:11','Pesagem registrada','Cooperativa · bruto '+g+' kg, tara '+t+' kg, líquido '+CASE_DEMO.weighed+' kg.','BAL-DEMO-0917');renderDemo();toast('Pesagem registrada · divergência encontrada');}
function demoReconcile(){if(CASE_DEMO.stage!==5)return;CASE_DEMO.reconciled=true;CASE_DEMO.stage=6;demoEvent('15:13','Inconsistência aberta','Regra CONC-01 · diferença de 5,5% confirmada para saneamento, sem penalidade automática.','INC-DEMO-0031');renderDemo();toast('Inconsistência aberta · registros originais preservados');}
function demoCorrect(){if(CASE_DEMO.stage!==6)return;CASE_DEMO.acceptedWeighed=782;CASE_DEMO.resolved=true;CASE_DEMO.stage=7;CASE_DEMO.role='cooperativa';demoEvent('15:29','Pesagem corrigida e conciliada','Servidor · 782 kg aceitos; diferença final de 0,4%.','RET-DEMO-0917-R1');renderDemo();toast('Correção validada · liquidação liberada');}
function demoSettle(){if(CASE_DEMO.stage!==7)return;CASE_DEMO.paid=true;CASE_DEMO.stage=8;CASE_DEMO.role='servidor';demoEvent('16:02','Serviço liquidado e rateado','Cooperativa · R$ 268 demonstrativos, regra de rateio registrada.','FIN-DEMO-0054');demoEvent('16:04','Dossiê de impacto concluído','SAMAÚMA · nove evidências relacionadas ao SEI fictício.','DOS-DEMO-0014');renderDemo();toast('Operação concluída · renda e impacto comprovados');}

function renderDemoEvidence(){
  const out=[['Processo SEI',CASE_DEMO.sei,'referência']];
  if(CASE_DEMO.declared!=null)out.push(['Oportunidade','OP-PVH-2026-014','declarado']);
  if(CASE_DEMO.stage>=3)out.push(['Aceite cooperativa','ACE-DEMO-0038','decisão']);
  if(CASE_DEMO.collected!=null)out.push(['Coleta de campo','COL-DEMO-0148','campo']);
  if(CASE_DEMO.weighed!=null)out.push(['Tíquete de balança','BAL-DEMO-0917','medido']);
  if(CASE_DEMO.reconciled)out.push(['Inconsistência','INC-DEMO-0031','calculado']);
  if(CASE_DEMO.resolved)out.push(['Correção','RET-DEMO-0917-R1','validado']);
  if(CASE_DEMO.paid)out.push(['Liquidação','FIN-DEMO-0054','cooperativa'],['Dossiê','DOS-DEMO-0014','consolidado']);
  document.getElementById('demoEvidence').innerHTML=out.map(x=>`<div class="dl"><span class="k">${x[0]}<small style="display:block;color:#7b8881">${x[2]}</small></span><span class="v mono">${x[1]}</span></div>`).join('');
}
function renderDemoTimeline(){document.getElementById('demoTimeline').innerHTML=CASE_DEMO.events.slice().reverse().map(e=>`<div class="event"><span class="time">${e.time}</span><span class="pin"></span><div><b>${e.title}</b><p>${e.detail}</p><span class="eid">${e.id}</span></div></div>`).join('');}
function demoDownloadDossier(){
  const html=`<!doctype html><meta charset="utf-8"><title>Dossiê SAMAÚMA</title><style>body{font:15px Arial;max-width:780px;margin:40px auto;color:#24382e}h1{color:#174e37;border-bottom:4px solid #d1a43c;padding-bottom:10px}table{width:100%;border-collapse:collapse}td{padding:9px;border:1px solid #ccd5d0}.note{background:#edf5f0;padding:14px;margin-top:18px}</style><h1>SAMAÚMA · Dossiê demonstrativo</h1><p><b>Oportunidade:</b> OP-PVH-2026-014<br><b>Processo SEI fictício:</b> ${CASE_DEMO.sei}<br><b>Estabelecimento fictício:</b> Mercado Ipê Roxo</p><table><tr><td>Declarado</td><td>820 kg</td></tr><tr><td>Coletado em campo</td><td>785 kg</td></tr><tr><td>Pesagem validada</td><td>782 kg</td></tr><tr><td>Receita demonstrativa</td><td>R$ 268</td></tr><tr><td>Evidências relacionadas</td><td>9</td></tr></table><div class="note"><b>Aviso:</b> documento gerado por protótipo. Não representa registro, pagamento ou decisão oficial da Prefeitura de Porto Velho.</div>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='dossie-samauma-demonstrativo.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Dossiê demonstrativo baixado');
}

const JUDGE_STEPS=[
  ['pan','O problema em uma frase','Resíduo disponível ainda não vira oportunidade rastreável de trabalho e renda.'],
  ['oper','Onde está o material','O mapa operacional reúne demandas fictícias e mostra compatibilidade, distância, capacidade e receita.'],
  ['demo','Começa a operação','Agora a banca executa o fluxo — não apenas observa um painel.'],
  ['demo','O gerador publica','Material, janela, estimativa e remuneração entram com origem declarada.'],
  ['demo','A cooperativa decide','O sistema recomenda; a organização aceita somente se houver capacidade e viabilidade.'],
  ['demo','O catador trabalha offline','Foto, QR, horário e massa observada ficam salvos e sincronizam quando houver conexão.'],
  ['demo','O destino pesa','Bruto e tara produzem uma evidência independente da declaração e da coleta.'],
  ['demo','O sistema protege a confiança','A divergência vira fila de saneamento; nenhuma informação é apagada ou gera punição automática.'],
  ['demo','A correção é auditável','O original permanece e um novo evento validado libera a etapa financeira.'],
  ['demo','O ciclo termina em renda','Serviço, material e incentivo por evidência formam R$ 268 demonstrativos com rateio aberto.'],
  ['ind','Impacto que pode ser medido','Renda, massa recuperada, qualidade do dado e capacidade operacional orientam o piloto.'],
  ['pilot','Pedido objetivo à banca','Autorizar um piloto assistido de 90 dias com uma cooperativa, 30 geradores e critérios de parada.']
];
function ensureJudgeBar(){if(document.getElementById('judgebar'))return;document.body.insertAdjacentHTML('beforeend',`<aside class="judgebar" id="judgebar" aria-live="polite"><div class="judge-time"><small>MODO BANCA</small><b id="judgeClock">00:00</b></div><div class="judge-copy"><b id="judgeTitle"></b><p id="judgeDesc"></p></div><div class="judge-actions"><button class="btn sm sec" onclick="judgeModeClose()">Sair</button><button class="btn sm" id="judgeNext" onclick="judgeModeNext()">Próximo</button></div></aside>`);}
function judgeModeStart(){ensureJudgeBar();judgeStep=0;judgeStarted=Date.now();clearInterval(judgeTimer);judgeTimer=setInterval(judgeTick,1000);document.getElementById('judgebar').classList.add('on');demoReset();judgeRender();}
function judgeTick(){const sec=Math.floor((Date.now()-judgeStarted)/1000),m=String(Math.floor(sec/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0'),el=document.getElementById('judgeClock');if(el){el.textContent=m+':'+s;if(sec>=180)el.style.color='#ff9b88';}}
function judgeRender(){const step=JUDGE_STEPS[judgeStep];irPara(step[0]);document.getElementById('judgeTitle').textContent=step[1];document.getElementById('judgeDesc').textContent=step[2];document.getElementById('judgeNext').textContent=judgeStep===JUDGE_STEPS.length-1?'Concluir':'Próximo';}
function judgeModeNext(){
  if(judgeStep===JUDGE_STEPS.length-1){judgeModeClose();return;}judgeStep++;
  if(judgeStep===2)demoReset();if(judgeStep===3)demoPublish();if(judgeStep===4)demoAccept();if(judgeStep===5)demoRegisterCollection();if(judgeStep===6)demoRegisterWeight();if(judgeStep===7)demoReconcile();if(judgeStep===8)demoCorrect();if(judgeStep===9)demoSettle();judgeRender();
}
function judgeModeClose(){clearInterval(judgeTimer);document.getElementById('judgebar')?.classList.remove('on');}

window.addEventListener('load',()=>{CASE_DEMO=demoInitial();renderDemo();ensureJudgeBar();});
