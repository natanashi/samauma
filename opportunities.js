/* Camada operacional de oportunidades — pontos, organizações e valores fictícios. */
let oppMapObj=null;
let fieldAppStep=0;
let fieldMode='shared';
let fieldRecord;
const OPP_POINTS=[
  {name:'Mercado Ipê Roxo',bairro:'Nova Porto Velho',lat:-8.7586,lng:-63.8894,kg:820,score:92,best:true},
  {name:'Hotel Horizonte Norte',bairro:'Embratel',lat:-8.7508,lng:-63.8792,kg:410,score:88},
  {name:'Padaria Brisa do Madeira',bairro:'Flodoaldo Pontes Pinto',lat:-8.7432,lng:-63.8710,kg:230,score:84},
  {name:'Atacado Rio Verde',bairro:'Agenor de Carvalho',lat:-8.7678,lng:-63.8688,kg:690,score:79}
];

function initOpportunityMap(){
  const el=document.getElementById('oppMap');if(!el||oppMapObj||typeof L==='undefined')return;
  oppMapObj=L.map(el,{zoomControl:true,attributionControl:false,scrollWheelZoom:false}).setView([-8.756,-63.879],13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(oppMapObj);
  const route=[];
  OPP_POINTS.forEach((p,i)=>{
    const icon=L.divIcon({className:'',html:`<div class="opp-pin ${p.best?'best':''}">${p.score}%</div>`,iconSize:p.best?[38,38]:[30,30],iconAnchor:p.best?[19,19]:[15,15]});
    L.marker([p.lat,p.lng],{icon}).addTo(oppMapObj).bindPopup(`<div class="opp-popup"><b>${p.name}</b><span>${p.bairro} · ${p.kg} kg estimados</span><span>${p.score}% compatível · dado fictício</span></div>`);if(i<3)route.push([p.lat,p.lng]);
  });
  L.polyline(route,{color:'#b8891a',weight:4,opacity:.8,dashArray:'8 7'}).addTo(oppMapObj);
  L.circleMarker([-8.769,-63.896],{radius:7,color:'#174e37',fillColor:'#174e37',fillOpacity:1}).addTo(oppMapObj).bindTooltip('Coopera Amazônia · galpão fictício');
}

function abrirOportunidade(){
  CASE_DEMO=demoInitial();demoPublish();irPara('demo');toast('Melhor oportunidade aberta · avalie como cooperativa');
}

function selectAudience(audience){
  const nav=document.querySelector('.nav');nav.classList.remove('audience-coop','audience-gov');nav.classList.add('audience-'+audience);
  irPara(audience==='coop'?'oper':'cad');
  toast(audience==='coop'?'Área de catadores e cooperativas destacada':'Área de gestão de grandes geradores destacada');
}

const FIELD_MODES={
  shared:{device:'SISTEMA WEB · ACESSO COMPARTILHADO',side:'Fila do acesso compartilhado',desc:'A sessão pertence à rota, não à pessoa nem ao equipamento.',net:'navegador offline'},
  personal:{device:'SISTEMA WEB · ACESSO PESSOAL OPCIONAL',side:'Minha rota no navegador',desc:'Canal disponível somente para quem desejar usar o próprio equipamento.',net:'acesso opcional'},
  terminal:{device:'SISTEMA WEB · TERMINAL DO GALPÃO',side:'Registro posterior no galpão',desc:'O encarregado digita a ficha numerada e relaciona as evidências.',net:'terminal conectado'},
  assisted:{device:'SISTEMA WEB · REGISTRO ASSISTIDO',side:'Atendimento pelo encarregado',desc:'Quem executou e quem digitou permanecem identificados separadamente.',net:'operação assistida'}
};

function fieldInitial(){return {arrived:false,qr:false,photo:false,kg:785,material:'Papel, papelão e plásticos',quality:'Segregado e seco',occurrence:'Sem ocorrência',collector:'Pessoa cooperada 07',vehicle:'NXR-2A14 · demonstrativo',saved:false,synced:false};}

function fieldSetMode(mode){
  fieldMode=mode;fieldAppStep=0;fieldRecord=fieldInitial();const cfg=FIELD_MODES[mode];
  document.querySelectorAll('[data-field-mode]').forEach(b=>b.classList.toggle('on',b.dataset.fieldMode===mode));
  document.getElementById('fieldDeviceTitle').textContent=cfg.device;document.getElementById('fieldSideTitle').textContent=cfg.side;document.getElementById('fieldSideDesc').textContent=cfg.desc;document.getElementById('fieldNet').textContent=cfg.net;
  renderFieldWorkspace();fieldUpdateQueue();
  toast('Canal selecionado: '+{shared:'aparelho compartilhado',personal:'celular pessoal opcional',terminal:'terminal do galpão',assisted:'registro assistido'}[mode]);
}

function fieldStepsVisual(){
  const active=fieldAppStep<=1?1:fieldAppStep===2?2:fieldAppStep===3?3:fieldAppStep===4?4:5;
  document.querySelectorAll('#fieldStepper>div').forEach((el,i)=>{const n=i+1;el.classList.toggle('done',n<active||fieldRecord?.synced&&n===5);el.classList.toggle('active',n===active&&!fieldRecord?.synced);});
}

function renderFieldWorkspace(){
  if(!fieldRecord)fieldRecord=fieldInitial();fieldStepsVisual();
  const w=document.getElementById('fieldWorkspace');if(!w)return;
  if(fieldAppStep===0){w.innerHTML=`<div class="field-section-title"><span>ROTA PRONTA PARA EXECUÇÃO</span><h3>Confira a parada antes de começar</h3><p>O sistema registra somente a localização no momento da confirmação. Não existe rastreamento contínuo da equipe.</p></div><div class="field-action-grid"><div class="field-action-card"><span>ACESSO</span><b>${FIELD_MODES[fieldMode].side}</b><p>${FIELD_MODES[fieldMode].desc}</p></div><div class="field-action-card"><span>EVIDÊNCIAS NECESSÁRIAS</span><b>Chegada, QR, foto e massa</b><p>Todos os dados podem ser salvos sem internet e sincronizados depois.</p></div></div><div class="field-web-actions"><button class="btn" onclick="fieldStart()">Iniciar atendimento</button><span class="hint">Sessão vinculada à rota 07</span></div>`;return;}
  if(fieldAppStep===1){w.innerHTML=`<div class="field-section-title"><span>ETAPA 1 DE 5 · CHEGADA</span><h3>Confirme que a equipe está no local</h3><p>Data, horário e coordenada da parada são registrados somente nesta ação.</p></div><div class="field-action-card ${fieldRecord.arrived?'done':''}"><span>LOCALIZAÇÃO DA PARADA</span><b>${fieldRecord.arrived?'Chegada confirmada às 14h29':'Aguardando confirmação'}</b><p>${fieldRecord.arrived?'Coordenada demonstrativa -8.7586, -63.8894 · precisão 18 m':'Mercado Ipê Roxo · Nova Porto Velho'}</p><button class="btn ${fieldRecord.arrived?'sec':''}" onclick="fieldConfirmArrival()">${fieldRecord.arrived?'✓ Chegada registrada':'Confirmar chegada'}</button></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldNextArrival()">Continuar</button><span class="hint">A localização não fica ativa depois</span></div>`;return;}
  if(fieldAppStep===2){w.innerHTML=`<div class="field-section-title"><span>ETAPA 2 DE 5 · IDENTIFICAÇÃO</span><h3>Relacione a coleta à oportunidade</h3><p>Leia o QR ou informe o código impresso. O sistema confere estabelecimento, rota e janela.</p></div><div class="field-form-grid"><div class="field-input"><label>Código da oportunidade</label><input id="fieldQrCode" value="OP-PVH-2026-014"></div><div class="field-input"><label>Resultado</label><input value="${fieldRecord.qr?'Válido · Mercado Ipê Roxo':'Aguardando conferência'}" readonly></div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldConfirmQr()">${fieldRecord.qr?'Continuar':'Conferir código'}</button><span class="hint">Leitura simulada no protótipo</span></div>`;return;}
  if(fieldAppStep===3){w.innerHTML=`<div class="field-section-title"><span>ETAPA 3 DE 5 · EVIDÊNCIAS</span><h3>Registre o que foi realmente coletado</h3><p>A estimativa de 820 kg não preenche a massa observada automaticamente.</p></div><div class="field-form-grid"><div class="field-input"><label>Material predominante</label><select id="fieldMaterial"><option>Papel, papelão e plásticos</option><option>Metais e plásticos</option><option>Vidro segregado</option></select></div><div class="field-input"><label>Condição do material</label><select id="fieldQuality"><option>Segregado e seco</option><option>Contaminação leve</option><option>Contaminação elevada</option></select></div><div class="field-input"><label>Massa observada (kg)</label><input id="fieldKg" type="number" min="1" value="${fieldRecord.kg}"></div><div class="field-input"><label>Ocorrência</label><select id="fieldOccurrence"><option>Sem ocorrência</option><option>Material divergente</option><option>Estabelecimento fechado</option><option>Coleta recusada</option><option>Risco de segurança</option></select></div><div class="field-input"><label>Responsável pela coleta</label><input id="fieldCollector" value="${fieldRecord.collector}"></div><div class="field-input"><label>Veículo</label><input id="fieldVehicle" value="${fieldRecord.vehicle}"></div><div class="full">${fieldRecord.photo?`<div class="field-photo-preview"><i>✓</i><div><b>Foto demonstrativa registrada</b><p>EVID-FOTO-0148 · 14h32 · arquivo preservado no evento local</p></div></div>`:`<div class="field-action-card"><span>EVIDÊNCIA FOTOGRÁFICA</span><b>Nenhuma foto registrada</b><p>No sistema real, o navegador abre câmera ou seletor de arquivo conforme o equipamento.</p><button class="btn sec" onclick="fieldAddPhoto()">Registrar foto demonstrativa</button></div>`}</div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldReview()">Revisar coleta</button><span class="hint">Os campos permanecem editáveis até salvar</span></div>`;return;}
  if(fieldAppStep===4){w.innerHTML=`<div class="field-section-title"><span>ETAPA 4 DE 5 · REVISÃO</span><h3>Confira antes de salvar no navegador</h3><p>Depois de salvo, qualquer correção será registrada como novo evento.</p></div><div class="field-review"><div><small>OPORTUNIDADE</small><b>OP-PVH-2026-014</b></div><div><small>CHEGADA</small><b>14h29 · confirmada</b></div><div><small>MATERIAL</small><b>${fieldRecord.material}</b></div><div><small>MASSA OBSERVADA</small><b>${fieldRecord.kg} kg</b></div><div><small>CONDIÇÃO</small><b>${fieldRecord.quality}</b></div><div><small>OCORRÊNCIA</small><b>${fieldRecord.occurrence}</b></div><div><small>RESPONSÁVEL</small><b>${fieldRecord.collector}</b></div><div><small>EVIDÊNCIAS</small><b>QR + foto + horário</b></div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Corrigir</button><button class="btn" onclick="fieldSaveOffline()">Salvar coleta no navegador</button><span class="hint">Funciona mesmo sem conexão</span></div>`;return;}
  if(fieldAppStep===5){w.innerHTML=`<div class="field-section-title"><span>ETAPA 5 DE 5 · FILA OFFLINE</span><h3>Coleta salva com segurança</h3><p>O evento recebeu identificador local e não será duplicado quando a conexão voltar.</p></div><div class="case-alert"><b>COL-DEMO-0148 aguarda sincronização</b><p>${fieldRecord.kg} kg · QR, foto e chegada preservados neste navegador · hash demonstrativo 7E4A-0148.</p></div><div class="field-web-actions"><button class="btn sec" onclick="fieldReceipt()">Ver registro local</button><button class="btn" onclick="fieldSync()">Sincronizar agora</button><span class="hint">1 evento na fila</span></div>`;return;}
  w.innerHTML=`<div class="field-success"><i>✓</i><h3>Coleta sincronizada</h3><p>O registro foi recebido sem duplicidade. A pesagem da cooperativa está liberada e será conciliada com os ${fieldRecord.kg} kg observados.</p><div class="field-proof"><div><small>IDENTIFICADOR</small><b>COL-DEMO-0148</b></div><div><small>SINCRONIZADO</small><b>14h37</b></div><div><small>EVIDÊNCIAS</small><b>4 relacionadas</b></div></div><div class="field-web-actions" style="justify-content:center"><button class="btn sec" onclick="fieldReceipt()">Emitir comprovante</button><button class="btn" onclick="fieldNextStop()">Ir para próxima parada</button></div></div>`;
}

function fieldStart(){fieldAppStep=1;renderFieldWorkspace();toast('Atendimento iniciado · localização ainda não registrada');}
function fieldConfirmArrival(){fieldRecord.arrived=true;renderFieldWorkspace();toast('Chegada registrada somente nesta parada');}
function fieldNextArrival(){if(!fieldRecord.arrived){toast('Confirme a chegada antes de continuar');return;}fieldAppStep=2;renderFieldWorkspace();}
function fieldConfirmQr(){const code=document.getElementById('fieldQrCode')?.value.trim().toUpperCase();if(code!=='OP-PVH-2026-014'){toast('Código não corresponde à parada atual');return;}if(fieldRecord.qr){fieldAppStep=3;}else{fieldRecord.qr=true;}renderFieldWorkspace();toast(fieldAppStep===3?'Oportunidade identificada':'Código válido · confira e continue');}
function fieldAddPhoto(){fieldRecord.photo=true;renderFieldWorkspace();toast('Foto demonstrativa relacionada ao evento');}
function fieldReview(){const kg=+document.getElementById('fieldKg')?.value||0;if(!fieldRecord.photo){toast('Registre a foto demonstrativa do material');return;}if(kg<=0){toast('Informe uma massa observada válida');return;}fieldRecord.kg=kg;fieldRecord.material=document.getElementById('fieldMaterial').value;fieldRecord.quality=document.getElementById('fieldQuality').value;fieldRecord.occurrence=document.getElementById('fieldOccurrence').value;fieldRecord.collector=document.getElementById('fieldCollector').value.trim()||'Não informado';fieldRecord.vehicle=document.getElementById('fieldVehicle').value.trim()||'Não informado';fieldAppStep=4;renderFieldWorkspace();}
function fieldBack(){fieldAppStep=Math.max(0,fieldAppStep-1);renderFieldWorkspace();}
function fieldSaveOffline(){fieldRecord.saved=true;fieldAppStep=5;renderFieldWorkspace();fieldUpdateQueue();toast('Coleta salva no navegador · pronta para sincronizar');}
function fieldSync(){fieldRecord.synced=true;fieldAppStep=6;renderFieldWorkspace();fieldUpdateQueue();toast('Coleta sincronizada sem duplicidade');}
function fieldNextStop(){fieldAppStep=0;fieldRecord=fieldInitial();renderFieldWorkspace();fieldUpdateQueue();toast('Próxima parada preparada · Hotel Horizonte Norte');}
function fieldUpdateQueue(){
  const pending=document.getElementById('fieldPending'),badge=document.getElementById('fieldSyncBadge'),net=document.getElementById('fieldNet');
  if(!pending)return;pending.querySelector('b').textContent=fieldRecord?.synced?'Coleta sincronizada':fieldRecord?.saved?'Coleta salva no navegador':'Coleta aguardando execução';pending.querySelector('p').textContent=fieldRecord?.synced?'Evento recebido sem duplicidade.':fieldRecord?.saved?'QR, foto, massa e horário aguardam conexão.':'Foto, QR e massa serão salvos localmente.';document.getElementById('fieldEventTime').textContent=fieldRecord?.synced?'14:37':fieldRecord?.saved?'local':'—';badge.textContent=fieldRecord?.synced?'fila vazia':'1 pendente';badge.className='st np '+(fieldRecord?.synced?'s-reg':'s-not');net.textContent=fieldRecord?.synced?'sincronizado':FIELD_MODES[fieldMode].net;
}
function fieldReceipt(){
  const html=`<!doctype html><meta charset="utf-8"><title>Comprovante de coleta</title><style>body{font:14px Arial;max-width:720px;margin:40px auto;color:#24382e}h1{color:#174e37;border-bottom:4px solid #d1a43c;padding-bottom:10px}table{width:100%;border-collapse:collapse}td{padding:9px;border:1px solid #cbd4cf}.note{margin-top:16px;padding:12px;background:#fff5dc}</style><h1>SAMAÚMA · Registro demonstrativo de coleta</h1><table><tr><td>Identificador</td><td><b>COL-DEMO-0148</b></td></tr><tr><td>Oportunidade</td><td>OP-PVH-2026-014</td></tr><tr><td>Estabelecimento fictício</td><td>Mercado Ipê Roxo</td></tr><tr><td>Massa observada</td><td>${fieldRecord.kg} kg</td></tr><tr><td>Material</td><td>${fieldRecord.material}</td></tr><tr><td>Evidências</td><td>Chegada, QR, foto e horário</td></tr><tr><td>Situação</td><td>${fieldRecord.synced?'Sincronizado às 14h37':'Salvo localmente'}</td></tr></table><div class="note">Documento demonstrativo sem validade fiscal ou oficial.</div>`;const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='comprovante-coleta-demonstrativo.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Comprovante demonstrativo gerado');
}

function fieldContingency(){
  const html=`<!doctype html><meta charset="utf-8"><title>Ficha de contingência SAMAÚMA</title><style>body{font:14px Arial;max-width:760px;margin:35px auto;color:#24382e}h1{color:#174e37;border-bottom:4px solid #d1a43c;padding-bottom:9px}.row{display:grid;grid-template-columns:1fr 1fr;border:1px solid #777}.row div{min-height:54px;padding:9px;border:1px solid #bbb}.full{grid-column:1/-1}.note{margin-top:16px;padding:12px;background:#f1f4f2}</style><h1>SAMAÚMA · Ficha de contingência</h1><p><b>Ficha:</b> COL-PAPEL-0148 &nbsp; <b>Oportunidade:</b> OP-PVH-2026-014</p><div class="row"><div>Responsável pela coleta:</div><div>Data e horário:</div><div>Estabelecimento:</div><div>Rota / veículo:</div><div>Massa observada:</div><div>Material:</div><div class="full">Ocorrência ou justificativa:</div><div>Assinatura de quem coletou:</div><div>Assinatura de quem digitou:</div></div><div class="note"><b>Controle:</b> esta ficha deve ser digitada no sistema web pelo terminal do galpão. O original é relacionado ao evento digital e guardado conforme a regra de retenção do piloto. Documento demonstrativo.</div>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ficha-contingencia-samauma.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Ficha de contingência baixada');
}

window.addEventListener('load',()=>{fieldRecord=fieldInitial();renderFieldWorkspace();fieldUpdateQueue();setTimeout(initOpportunityMap,120);if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});});
