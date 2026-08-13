/* Camada operacional de oportunidades — pontos, organizações e valores fictícios. */
let oppMapObj=null;
let fieldAppStep=0;
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

function fieldAdvance(){
  fieldAppStep=(fieldAppStep+1)%5;
  const configs=[
    ['12%','ROTA 07 · PRÓXIMA PARADA','Mercado Ipê Roxo','Nova Porto Velho · 7,8 km · recicláveis secos','Iniciar rota','Os dados necessários já estão disponíveis no dispositivo.'],
    ['32%','ROTA EM ANDAMENTO','Chegada registrada','Localização usada somente para comprovar esta parada.','Ler QR da oportunidade','14h29 · salvo no dispositivo'],
    ['55%','ATENDIMENTO CONFIRMADO','Registrar evidências','QR confirmado. Fotografe o material e informe a massa.','Salvar coleta offline','Sem conexão · nenhum dado será perdido'],
    ['78%','SALVO NO DISPOSITIVO','785 kg registrados','Foto, QR e horário aguardam conexão para envio.','Sincronizar agora','1 evento pendente · identificador COL-DEMO-0148'],
    ['100%','SINCRONIZAÇÃO CONCLUÍDA','Coleta enviada com sucesso','A pesagem foi liberada para a cooperativa no galpão.','Preparar próxima parada','14h37 · evento recebido pelo SAMAÚMA']
  ],c=configs[fieldAppStep];
  document.getElementById('fieldProgress').style.width=c[0];document.getElementById('fieldEyebrow').textContent=c[1];document.getElementById('fieldTitle').textContent=c[2];document.getElementById('fieldDesc').textContent=c[3];document.getElementById('fieldActionBtn').textContent=c[4];document.getElementById('fieldNote').textContent=c[5];
  const checks=document.querySelectorAll('#fieldChecks span');checks.forEach((el,i)=>{el.classList.toggle('done',fieldAppStep>=Math.min(3,i+1));el.textContent=(el.classList.contains('done')?'✓':'○')+' '+['QR da oportunidade','foto do material','massa observada'][i];});
  const pending=document.getElementById('fieldPending'),badge=document.getElementById('fieldSyncBadge'),net=document.getElementById('fieldNet');
  if(fieldAppStep>=3){pending.querySelector('b').textContent=fieldAppStep===4?'Coleta sincronizada':'Coleta salva no dispositivo';pending.querySelector('p').textContent=fieldAppStep===4?'Evento recebido sem duplicidade.':'Foto, QR, massa e horário aguardando rede.';document.getElementById('fieldEventTime').textContent=fieldAppStep===4?'14:37':'local';}
  badge.textContent=fieldAppStep===4?'fila vazia':'1 pendente';badge.className='st np '+(fieldAppStep===4?'s-reg':'s-not');net.textContent=fieldAppStep===4?'sincronizado':'conexão instável';
  toast(fieldAppStep===4?'Coleta sincronizada com segurança':'Etapa salva no dispositivo');
}

window.addEventListener('load',()=>{setTimeout(initOpportunityMap,120);if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});});
