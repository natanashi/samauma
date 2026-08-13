/* Camada operacional de oportunidades — pontos, organizações e valores fictícios. */
let oppMapObj=null;
let oppMapMarkers=[];
let oppCurrentView='list';
let oppSelectedId=null;
let fieldAppStep=0;
let fieldMode='shared';
let fieldRecord;
let fieldActiveOpportunity=null;
const OPP_POINTS=[
  {id:'OP-PVH-2026-021',name:'Empório Jatobá',bairro:'Nova Porto Velho',lat:-8.7586,lng:-63.8894,kg:540,score:94,best:true,km:4.8,pay:118,window:'14h–16h',period:'afternoon',material:'secos',materialLabel:'papelão, plásticos e metais segregados',quality:'Material seco e separado na origem',reason:'Está perto, cabe na capacidade da equipe e combina com a rota de hoje.'},
  {id:'OP-PVH-2026-022',name:'Hotel Horizonte Norte',bairro:'Embratel',lat:-8.7508,lng:-63.8792,kg:410,score:88,km:6.2,pay:104,window:'15h–17h',period:'afternoon',material:'vidro',materialLabel:'vidro e embalagens segregadas',quality:'Vidro acondicionado em caixas',reason:'Boa remuneração por quilômetro e janela compatível com o turno.'},
  {id:'OP-PVH-2026-023',name:'Padaria Brisa do Madeira',bairro:'Flodoaldo Pontes Pinto',lat:-8.7432,lng:-63.8710,kg:230,score:84,km:3.6,pay:72,window:'9h–11h',period:'morning',material:'papelao',materialLabel:'papel e papelão limpos',quality:'Baixo risco de contaminação declarado',reason:'É a demanda mais próxima e exige pouca capacidade do veículo.'},
  {id:'OP-PVH-2026-024',name:'Atacado Rio Verde',bairro:'Agenor de Carvalho',lat:-8.7678,lng:-63.8688,kg:690,score:79,km:9.4,pay:156,window:'13h–16h',period:'afternoon',material:'plastico',materialLabel:'filme plástico e papelão prensado',quality:'Exige conferência do acondicionamento',reason:'Maior remuneração, mas ocupa mais capacidade e aumenta o percurso.'}
];
const FIELD_DEFAULT_OPPORTUNITY={id:'OP-PVH-2026-014',short:'OP-014',route:'Rota 07',name:'Mercado Ipê Roxo',bairro:'Nova Porto Velho',kg:820,km:7.8,pay:96,window:'até 16h',materialLabel:'recicláveis secos segregados',origin:'assigned'};
const OPP_ASSIGNED_ROUTE={...FIELD_DEFAULT_OPPORTUNITY,status:'Pronta para iniciar',assignedBy:'Coopera Amazônia · organização fictícia'};
const oppAccepted=[];

function initOpportunityMap(){
  const el=document.getElementById('oppMap');if(!el||oppMapObj||typeof L==='undefined')return;
  oppMapObj=L.map(el,{zoomControl:true,attributionControl:false,scrollWheelZoom:false}).setView([-8.756,-63.879],13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(oppMapObj);
  const route=[];
  OPP_POINTS.forEach((p,i)=>{
    const icon=L.divIcon({className:'',html:`<div class="opp-pin ${p.best?'best':''}">${p.score}%</div>`,iconSize:p.best?[38,38]:[30,30],iconAnchor:p.best?[19,19]:[15,15]});
    const marker=L.marker([p.lat,p.lng],{icon}).addTo(oppMapObj).bindPopup(`<div class="opp-popup"><b>${p.name}</b><span>${p.bairro} · ${p.kg} kg estimados</span><span>${p.score}% compatível · dado fictício</span></div>`);
    marker.on('click',()=>selectOpportunityOnMap(p.id));oppMapMarkers.push({id:p.id,marker});if(i<3)route.push([p.lat,p.lng]);
  });
  L.polyline(route,{color:'#b8891a',weight:4,opacity:.8,dashArray:'8 7'}).addTo(oppMapObj);
  L.circleMarker([-8.769,-63.896],{radius:7,color:'#174e37',fillColor:'#174e37',fillOpacity:1}).addTo(oppMapObj).bindTooltip('Coopera Amazônia · galpão fictício');
}

function getVisibleOpportunities(){
  const material=document.getElementById('oppMaterialFilter')?.value||'all';
  const distance=+(document.getElementById('oppDistanceFilter')?.value||99);
  const period=document.getElementById('oppWindowFilter')?.value||'all';
  return OPP_POINTS.filter(p=>(material==='all'||p.material===material||material==='secos'&&['secos','papelao','plastico'].includes(p.material))&&p.km<=distance&&(period==='all'||p.period===period)&&!oppAccepted.some(a=>a.id===p.id));
}

function setOppView(view){
  oppCurrentView=view;
  const views={list:'oppListView',map:'oppMapView',routes:'oppRoutesView'};
  Object.entries(views).forEach(([key,id])=>document.getElementById(id)?.classList.toggle('on',key===view));
  [['list','oppTabList'],['map','oppTabMap'],['routes','oppTabRoutes']].forEach(([key,id])=>{const b=document.getElementById(id);if(!b)return;b.classList.toggle('on',key===view);b.setAttribute('aria-selected',String(key===view));});
  const filters=document.getElementById('oppFilters');if(filters)filters.style.display=view==='routes'?'none':'';
  renderOpportunityChooser();
  if(view==='map'){setTimeout(()=>{initOpportunityMap();oppMapObj?.invalidateSize();},60);}
}

function clearOppFilters(){
  ['oppMaterialFilter','oppWindowFilter'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='all';});
  const d=document.getElementById('oppDistanceFilter');if(d)d.value='99';renderOpportunityChooser();toast('Filtros removidos');
}

function opportunityCard(p){
  return `<article class="opportunity-card ${p.best?'recommended':''}">
    <div class="opportunity-card-top"><div>${p.best?'<span class="opportunity-card-tag">RECOMENDADA PARA VOCÊ</span>':'<span class="data-origin declared">DEMANDA ABERTA</span>'}</div><span class="opportunity-card-code">${p.id}</span></div>
    <h3>${p.name}</h3><p class="place">${p.bairro} · endereço exibido após o aceite</p>
    <div class="opportunity-card-metrics"><div><span>Distância</span><b>${String(p.km).replace('.',',')} km</b></div><div><span>Massa estimada</span><b>${p.kg} kg</b></div><div><span>Serviço</span><b>R$ ${p.pay}</b></div><div><span>Janela</span><b>${p.window}</b></div></div>
    <p class="opportunity-material"><b>Material:</b> ${p.materialLabel}</p>
    <div class="opportunity-card-actions"><button class="btn sec" onclick="openOpportunityDetail('${p.id}')">Ver detalhes</button><button class="btn" onclick="beginOpportunityAcceptance('${p.id}')">Aceitar oportunidade</button><span class="reason"><b>${p.score}% compatível</b>${p.best?'Melhor combinação agora':'Cálculo transparente'}</span></div>
  </article>`;
}

function renderOpportunityChooser(){
  const list=document.getElementById('oppCardList');if(!list)return;
  const visible=getVisibleOpportunities();
  list.innerHTML=visible.length?visible.map(opportunityCard).join(''):'<div class="empty" style="grid-column:1/-1"><div class="ei">⌕</div>Nenhuma oportunidade corresponde aos filtros.<br>Altere distância, material ou período.</div>';
  const title=document.getElementById('oppResultTitle');if(title)title.textContent=`${visible.length} ${visible.length===1?'oportunidade encontrada':'oportunidades encontradas'}`;
  const count=document.getElementById('oppListCount');if(count)count.textContent=visible.length;
  const mapList=document.getElementById('oppMapList');if(mapList)mapList.innerHTML=visible.map(p=>`<button class="opportunity-map-item ${oppSelectedId===p.id?'on':''}" onclick="selectOpportunityOnMap('${p.id}')"><span>${p.score}% COMPATÍVEL · ${String(p.km).replace('.',',')} KM</span><b>${p.name}</b><small>${p.kg} kg · R$ ${p.pay} · ${p.window}</small></button>`).join('');
  oppMapMarkers.forEach(({id,marker})=>marker.setOpacity(visible.some(p=>p.id===id)?1:.2));
  renderMyRoutes();
}

function selectOpportunityOnMap(id){
  const p=OPP_POINTS.find(item=>item.id===id);if(!p)return;oppSelectedId=id;renderOpportunityChooser();
  const entry=oppMapMarkers.find(item=>item.id===id);entry?.marker.openPopup();oppMapObj?.panTo([p.lat,p.lng]);
  if(window.innerWidth<=700)openOpportunityDetail(id);
}

function opportunityDetailMarkup(p){
  return `<div class="opportunity-detail-head"><button aria-label="Fechar detalhes" onclick="closeOpportunityDetail()">×</button><span>${p.best?'RECOMENDADA PARA VOCÊ':'OPORTUNIDADE DISPONÍVEL'} · ${p.score}%</span><h2>${p.name}</h2><p>${p.bairro} · dados demonstrativos</p></div><div class="opportunity-detail-body">
    <div class="opportunity-detail-status"><b>Você decide se quer aceitar</b><p>A recomendação não reserva nem atribui a coleta automaticamente.</p></div>
    <div class="opportunity-detail-grid"><div><span>MATERIAL</span><b>${p.materialLabel}</b></div><div><span>MASSA ESTIMADA</span><b>${p.kg} kg</b></div><div><span>DISTÂNCIA</span><b>${String(p.km).replace('.',',')} km</b></div><div><span>REMUNERAÇÃO DO SERVIÇO</span><b>R$ ${p.pay}</b></div><div><span>JANELA DE COLETA</span><b>${p.window}</b></div><div><span>ACONDICIONAMENTO</span><b>${p.quality}</b></div></div>
    <div class="opportunity-explanation"><h3>Por que o sistema mostrou esta oportunidade?</h3><p class="opportunity-accept-note">${p.reason}</p>${[['Material',30],['Capacidade',25],['Distância',20],['Horário',15],['Qualidade',10]].map(([name,value])=>`<div class="opportunity-score-row"><span>${name}</span><div class="opportunity-score-track"><i style="width:${Math.min(100,value*3.2)}%"></i></div><b>${value}%</b></div>`).join('')}</div>
    <p class="opportunity-accept-note"><b>Ao aceitar:</b> a oportunidade fica reservada por dez minutos para sua confirmação. O endereço completo é liberado e a coleta entra em “Minhas rotas”.</p>
  </div><div class="opportunity-detail-actions"><button class="btn sec" onclick="closeOpportunityDetail()">Agora não</button><button class="btn" onclick="beginOpportunityAcceptance('${p.id}')">Aceitar oportunidade</button></div>`;
}

function openOpportunityDetail(id){const p=OPP_POINTS.find(item=>item.id===id),drawer=document.getElementById('oppDetail');if(!p||!drawer)return;oppSelectedId=id;drawer.innerHTML=opportunityDetailMarkup(p);drawer.hidden=false;drawer.querySelector('button')?.focus();}
function closeOpportunityDetail(){const drawer=document.getElementById('oppDetail');if(drawer)drawer.hidden=true;}
function beginOpportunityAcceptance(id){
  const p=OPP_POINTS.find(item=>item.id===id),drawer=document.getElementById('oppDetail');if(!p||!drawer)return;
  drawer.hidden=false;drawer.innerHTML=`<div class="opportunity-detail-head"><button aria-label="Fechar confirmação" onclick="closeOpportunityDetail()">×</button><span>CONFIRMAÇÃO DE ESCOLHA</span><h2>${p.name}</h2><p>${p.bairro} · ${p.window}</p></div><div class="reservation-card"><i>✓</i><h2>Deseja reservar esta oportunidade?</h2><p>A demanda ficará reservada para sua confirmação e poderá ser devolvida sem penalidade antes do início.</p><span class="reservation-clock">RESERVA DEMONSTRATIVA · 10:00</span><div class="opportunity-detail-grid"><div><span>SERVIÇO</span><b>R$ ${p.pay}</b></div><div><span>MASSA ESTIMADA</span><b>${p.kg} kg</b></div><div><span>DISTÂNCIA</span><b>${String(p.km).replace('.',',')} km</b></div><div><span>JANELA</span><b>${p.window}</b></div></div></div><div class="opportunity-detail-actions"><button class="btn sec" onclick="openOpportunityDetail('${p.id}')">Revisar detalhes</button><button class="btn" onclick="confirmOpportunityAcceptance('${p.id}')">Confirmar e incluir na rota</button></div>`;drawer.querySelector('button')?.focus();
}

function confirmOpportunityAcceptance(id){
  const p=OPP_POINTS.find(item=>item.id===id);if(!p||oppAccepted.some(item=>item.id===id))return;
  oppAccepted.push({...p,origin:'chosen',route:`Rota escolhida ${String(oppAccepted.length+1).padStart(2,'0')}`,status:'Reservada por você'});closeOpportunityDetail();renderOpportunityChooser();setOppView('routes');toast('Oportunidade aceita · incluída em Minhas rotas');
}

function renderMyRoutes(){
  const target=document.getElementById('oppMyRoutes');if(!target)return;const routes=[OPP_ASSIGNED_ROUTE,...oppAccepted];
  const count=document.getElementById('oppRouteCount');if(count)count.textContent=routes.length;
  target.innerHTML=routes.map(r=>`<article class="my-route-card ${r.origin==='assigned'?'assigned':''}"><header><span class="route-origin ${r.origin==='assigned'?'assigned':'chosen'}">${r.origin==='assigned'?'ATRIBUÍDA PELA COOPERATIVA':'ESCOLHIDA POR VOCÊ'}</span><span class="st s-reg np">${r.status}</span></header><h3>${r.name}</h3><p>${r.bairro} · ${r.materialLabel}</p><div class="my-route-stats"><div><span>MASSA</span><b>${r.kg} kg</b></div><div><span>SERVIÇO</span><b>R$ ${r.pay}</b></div><div><span>JANELA</span><b>${r.window}</b></div></div>${r.origin==='assigned'?`<p><b>Origem:</b> ${r.assignedBy}. Você pode informar indisponibilidade antes de iniciar.</p>`:'<p><b>Reserva:</b> confirmada no protótipo. Endereço completo liberado para a execução.</p>'}<div class="opportunity-card-actions" style="margin-top:10px"><button class="btn" onclick="startAcceptedRoute('${r.id}')">Abrir rota</button>${r.origin==='assigned'?'<button class="btn sec" onclick="toast(\'Indisponibilidade registrada · a cooperativa será avisada\')">Não posso atender</button>':''}</div></article>`).join('');
}

function startAcceptedRoute(id){
  const selected=id===OPP_ASSIGNED_ROUTE.id?OPP_ASSIGNED_ROUTE:oppAccepted.find(item=>item.id===id);if(!selected)return;
  fieldActiveOpportunity=selected;fieldAppStep=0;fieldRecord=fieldInitial();updateFieldOpportunitySummary();irPara('verif');renderFieldWorkspace();fieldUpdateQueue();toast('Rota aberta · confira os dados antes de iniciar');
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

function activeFieldOpportunity(){return fieldActiveOpportunity||FIELD_DEFAULT_OPPORTUNITY;}
function updateFieldOpportunitySummary(){
  const p=activeFieldOpportunity(),short=p.short||p.id.replace('OP-PVH-2026-','OP-');
  const values={fieldRouteHeader:`Coleta COL-DEMO-0148 · ${p.route||'Rota escolhida'}`,fieldRouteWindow:`PARADA 1 DE 1 · JANELA ${String(p.window).toUpperCase()}`,fieldRouteName:p.name,fieldRoutePlace:`${p.bairro} · ${String(p.km).replace('.',',')} km · ${p.materialLabel}`,fieldRouteKg:`${p.kg} kg`,fieldRoutePay:`R$ ${p.pay}`,fieldRouteCode:short};
  Object.entries(values).forEach(([id,value])=>{const el=document.getElementById(id);if(el)el.textContent=value;});
}

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
  if(!fieldRecord)fieldRecord=fieldInitial();updateFieldOpportunitySummary();fieldStepsVisual();
  const opportunity=activeFieldOpportunity();
  const w=document.getElementById('fieldWorkspace');if(!w)return;
  if(fieldAppStep===0){w.innerHTML=`<div class="field-section-title"><span>${opportunity.origin==='assigned'?'ROTA ATRIBUÍDA PELA COOPERATIVA':'OPORTUNIDADE ESCOLHIDA POR VOCÊ'}</span><h3>Confira a parada antes de começar</h3><p>O sistema registra somente a localização no momento da confirmação. Não existe rastreamento contínuo da equipe.</p></div><div class="field-action-grid"><div class="field-action-card"><span>ACESSO</span><b>${FIELD_MODES[fieldMode].side}</b><p>${FIELD_MODES[fieldMode].desc}</p></div><div class="field-action-card"><span>EVIDÊNCIAS NECESSÁRIAS</span><b>Chegada, QR, foto e massa</b><p>Todos os dados podem ser salvos sem internet e sincronizados depois.</p></div></div><div class="field-web-actions"><button class="btn sec" onclick="irPara('oper');setOppView('routes')">Voltar às minhas rotas</button><button class="btn" onclick="fieldStart()">Iniciar atendimento</button><span class="hint">Sessão vinculada a ${opportunity.id}</span></div>`;return;}
  if(fieldAppStep===1){w.innerHTML=`<div class="field-section-title"><span>ETAPA 1 DE 5 · CHEGADA</span><h3>Confirme que a equipe está no local</h3><p>Data, horário e coordenada da parada são registrados somente nesta ação.</p></div><div class="field-action-card ${fieldRecord.arrived?'done':''}"><span>LOCALIZAÇÃO DA PARADA</span><b>${fieldRecord.arrived?'Chegada confirmada às 14h29':'Aguardando confirmação'}</b><p>${fieldRecord.arrived?'Coordenada demonstrativa registrada · precisão 18 m':opportunity.name+' · '+opportunity.bairro}</p><button class="btn ${fieldRecord.arrived?'sec':''}" onclick="fieldConfirmArrival()">${fieldRecord.arrived?'✓ Chegada registrada':'Confirmar chegada'}</button></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldNextArrival()">Continuar</button><span class="hint">A localização não fica ativa depois</span></div>`;return;}
  if(fieldAppStep===2){w.innerHTML=`<div class="field-section-title"><span>ETAPA 2 DE 5 · IDENTIFICAÇÃO</span><h3>Relacione a coleta à oportunidade</h3><p>Leia o QR ou informe o código impresso. O sistema confere estabelecimento, rota e janela.</p></div><div class="field-form-grid"><div class="field-input"><label>Código da oportunidade</label><input id="fieldQrCode" value="${opportunity.id}"></div><div class="field-input"><label>Resultado</label><input value="${fieldRecord.qr?'Válido · '+opportunity.name:'Aguardando conferência'}" readonly></div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldConfirmQr()">${fieldRecord.qr?'Continuar':'Conferir código'}</button><span class="hint">Leitura simulada no protótipo</span></div>`;return;}
  if(fieldAppStep===3){w.innerHTML=`<div class="field-section-title"><span>ETAPA 3 DE 5 · EVIDÊNCIAS</span><h3>Registre o que foi realmente coletado</h3><p>A estimativa de 820 kg não preenche a massa observada automaticamente.</p></div><div class="field-form-grid"><div class="field-input"><label>Material predominante</label><select id="fieldMaterial"><option>Papel, papelão e plásticos</option><option>Metais e plásticos</option><option>Vidro segregado</option></select></div><div class="field-input"><label>Condição do material</label><select id="fieldQuality"><option>Segregado e seco</option><option>Contaminação leve</option><option>Contaminação elevada</option></select></div><div class="field-input"><label>Massa observada (kg)</label><input id="fieldKg" type="number" min="1" value="${fieldRecord.kg}"></div><div class="field-input"><label>Ocorrência</label><select id="fieldOccurrence"><option>Sem ocorrência</option><option>Material divergente</option><option>Estabelecimento fechado</option><option>Coleta recusada</option><option>Risco de segurança</option></select></div><div class="field-input"><label>Responsável pela coleta</label><input id="fieldCollector" value="${fieldRecord.collector}"></div><div class="field-input"><label>Veículo</label><input id="fieldVehicle" value="${fieldRecord.vehicle}"></div><div class="full">${fieldRecord.photo?`<div class="field-photo-preview"><i>✓</i><div><b>Foto demonstrativa registrada</b><p>EVID-FOTO-0148 · 14h32 · arquivo preservado no evento local</p></div></div>`:`<div class="field-action-card"><span>EVIDÊNCIA FOTOGRÁFICA</span><b>Nenhuma foto registrada</b><p>No sistema real, o navegador abre câmera ou seletor de arquivo conforme o equipamento.</p><button class="btn sec" onclick="fieldAddPhoto()">Registrar foto demonstrativa</button></div>`}</div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Voltar</button><button class="btn" onclick="fieldReview()">Revisar coleta</button><span class="hint">Os campos permanecem editáveis até salvar</span></div>`;return;}
  if(fieldAppStep===4){w.innerHTML=`<div class="field-section-title"><span>ETAPA 4 DE 5 · REVISÃO</span><h3>Confira antes de salvar no navegador</h3><p>Depois de salvo, qualquer correção será registrada como novo evento.</p></div><div class="field-review"><div><small>OPORTUNIDADE</small><b>${opportunity.id}</b></div><div><small>CHEGADA</small><b>14h29 · confirmada</b></div><div><small>MATERIAL</small><b>${fieldRecord.material}</b></div><div><small>MASSA OBSERVADA</small><b>${fieldRecord.kg} kg</b></div><div><small>CONDIÇÃO</small><b>${fieldRecord.quality}</b></div><div><small>OCORRÊNCIA</small><b>${fieldRecord.occurrence}</b></div><div><small>RESPONSÁVEL</small><b>${fieldRecord.collector}</b></div><div><small>EVIDÊNCIAS</small><b>QR + foto + horário</b></div></div><div class="field-web-actions"><button class="btn sec" onclick="fieldBack()">Corrigir</button><button class="btn" onclick="fieldSaveOffline()">Salvar coleta no navegador</button><span class="hint">Funciona mesmo sem conexão</span></div>`;return;}
  if(fieldAppStep===5){w.innerHTML=`<div class="field-section-title"><span>ETAPA 5 DE 5 · FILA OFFLINE</span><h3>Coleta salva com segurança</h3><p>O evento recebeu identificador local e não será duplicado quando a conexão voltar.</p></div><div class="case-alert"><b>COL-DEMO-0148 aguarda sincronização</b><p>${fieldRecord.kg} kg · QR, foto e chegada preservados neste navegador · hash demonstrativo 7E4A-0148.</p></div><div class="field-web-actions"><button class="btn sec" onclick="fieldReceipt()">Ver registro local</button><button class="btn" onclick="fieldSync()">Sincronizar agora</button><span class="hint">1 evento na fila</span></div>`;return;}
  w.innerHTML=`<div class="field-success"><i>✓</i><h3>Coleta sincronizada</h3><p>O registro foi recebido sem duplicidade. A pesagem da cooperativa está liberada e será conciliada com os ${fieldRecord.kg} kg observados.</p><div class="field-proof"><div><small>IDENTIFICADOR</small><b>COL-DEMO-0148</b></div><div><small>SINCRONIZADO</small><b>14h37</b></div><div><small>EVIDÊNCIAS</small><b>4 relacionadas</b></div></div><div class="field-web-actions" style="justify-content:center"><button class="btn sec" onclick="fieldReceipt()">Emitir comprovante</button><button class="btn" onclick="fieldNextStop()">Ir para próxima parada</button></div></div>`;
}

function fieldStart(){fieldAppStep=1;renderFieldWorkspace();toast('Atendimento iniciado · localização ainda não registrada');}
function fieldConfirmArrival(){fieldRecord.arrived=true;renderFieldWorkspace();toast('Chegada registrada somente nesta parada');}
function fieldNextArrival(){if(!fieldRecord.arrived){toast('Confirme a chegada antes de continuar');return;}fieldAppStep=2;renderFieldWorkspace();}
function fieldConfirmQr(){const code=document.getElementById('fieldQrCode')?.value.trim().toUpperCase(),expected=activeFieldOpportunity().id;if(code!==expected){toast('Código não corresponde à parada atual');return;}if(fieldRecord.qr){fieldAppStep=3;}else{fieldRecord.qr=true;}renderFieldWorkspace();toast(fieldAppStep===3?'Oportunidade identificada':'Código válido · confira e continue');}
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

window.addEventListener('load',()=>{fieldRecord=fieldInitial();renderFieldWorkspace();fieldUpdateQueue();renderOpportunityChooser();setTimeout(()=>{initOpportunityMap();renderOpportunityChooser();},120);if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById('oppDetail')?.hidden)closeOpportunityDetail();});
