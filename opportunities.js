/* Camada operacional de oportunidades — pontos, organizações e valores fictícios. */
let oppMapObj=null;
let fieldAppStep=0;
let fieldMode='shared';
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
  shared:{device:'Navegador · aparelho da cooperativa',side:'Fila do aparelho compartilhado',desc:'A sessão pertence à rota, não à pessoa ou ao aparelho.',note:'Sessão da rota — não vinculada ao aparelho pessoal.',net:'navegador offline'},
  personal:{device:'Navegador · celular pessoal opcional',side:'Minha rota no navegador',desc:'Canal disponível somente para quem desejar usar o próprio aparelho.',note:'Uso voluntário — a mesma tarefa pode ser feita por outro canal.',net:'acesso opcional'},
  terminal:{device:'Navegador · terminal do galpão',side:'Registro posterior no galpão',desc:'O encarregado digita a ficha numerada e relaciona as evidências.',note:'Ficha COL-PAPEL-0148 pronta para conferência assistida.',net:'terminal conectado'},
  assisted:{device:'Navegador · registro assistido',side:'Atendimento pelo encarregado',desc:'Uma pessoa autorizada registra a ação junto com quem realizou a coleta.',note:'Responsável pela coleta e responsável pela digitação ficam separados.',net:'operação assistida'}
};

function fieldSetMode(mode){
  fieldMode=mode;fieldAppStep=0;const cfg=FIELD_MODES[mode];
  document.querySelectorAll('[data-field-mode]').forEach(b=>b.classList.toggle('on',b.dataset.fieldMode===mode));
  document.getElementById('fieldDeviceTitle').textContent=cfg.device;document.getElementById('fieldSideTitle').textContent=cfg.side;document.getElementById('fieldSideDesc').textContent=cfg.desc;document.getElementById('fieldNote').textContent=cfg.note;document.getElementById('fieldNet').textContent=cfg.net;
  document.getElementById('fieldProgress').style.width='12%';document.getElementById('fieldEyebrow').textContent=mode==='terminal'?'FICHA NUMERADA · AGUARDANDO DIGITAÇÃO':'ROTA 07 · PRÓXIMA PARADA';document.getElementById('fieldTitle').textContent=mode==='terminal'?'COL-PAPEL-0148':'Mercado Ipê Roxo';document.getElementById('fieldDesc').textContent=mode==='terminal'?'Conferir responsável, horário, massa e justificativa.':'Nova Porto Velho · 7,8 km · recicláveis secos';document.getElementById('fieldActionBtn').textContent=mode==='terminal'?'Iniciar digitação assistida':'Iniciar rota';
  document.querySelectorAll('#fieldChecks span').forEach((el,i)=>{el.classList.remove('done');el.textContent='○ '+['QR da oportunidade','foto do material','massa observada'][i];});
  toast('Canal selecionado: '+{shared:'aparelho compartilhado',personal:'celular pessoal opcional',terminal:'terminal do galpão',assisted:'registro assistido'}[mode]);
}

function fieldAdvance(){
  fieldAppStep=(fieldAppStep+1)%5;
  const configs=[
    ['12%','ROTA 07 · PRÓXIMA PARADA','Mercado Ipê Roxo','Nova Porto Velho · 7,8 km · recicláveis secos','Iniciar rota',FIELD_MODES[fieldMode].note],
    ['32%',fieldMode==='terminal'?'DIGITAÇÃO ASSISTIDA':'ROTA EM ANDAMENTO',fieldMode==='terminal'?'Ficha identificada':'Chegada registrada',fieldMode==='terminal'?'Código único impede lançamento duplicado.':'Localização usada somente para comprovar esta parada.',fieldMode==='terminal'?'Conferir QR impresso':'Ler QR da oportunidade',fieldMode==='terminal'?'Digitado no terminal web':'14h29 · salvo no navegador'],
    ['55%','ATENDIMENTO CONFIRMADO','Registrar evidências','QR confirmado. Fotografe o material e informe a massa.','Salvar coleta offline','Sem conexão · nenhum dado será perdido'],
    ['78%','SALVO NO DISPOSITIVO','785 kg registrados','Foto, QR e horário aguardam conexão para envio.','Sincronizar agora','1 evento pendente · identificador COL-DEMO-0148'],
    ['100%','SINCRONIZAÇÃO CONCLUÍDA','Coleta enviada com sucesso','A pesagem foi liberada para a cooperativa no galpão.','Preparar próxima parada','14h37 · evento recebido pelo SAMAÚMA']
  ],c=configs[fieldAppStep];
  document.getElementById('fieldProgress').style.width=c[0];document.getElementById('fieldEyebrow').textContent=c[1];document.getElementById('fieldTitle').textContent=c[2];document.getElementById('fieldDesc').textContent=c[3];document.getElementById('fieldActionBtn').textContent=c[4];document.getElementById('fieldNote').textContent=c[5];
  const checks=document.querySelectorAll('#fieldChecks span');checks.forEach((el,i)=>{el.classList.toggle('done',fieldAppStep>=Math.min(3,i+1));el.textContent=(el.classList.contains('done')?'✓':'○')+' '+['QR da oportunidade','foto do material','massa observada'][i];});
  const pending=document.getElementById('fieldPending'),badge=document.getElementById('fieldSyncBadge'),net=document.getElementById('fieldNet');
  if(fieldAppStep>=3){pending.querySelector('b').textContent=fieldAppStep===4?'Coleta sincronizada':'Coleta salva no dispositivo';pending.querySelector('p').textContent=fieldAppStep===4?'Evento recebido sem duplicidade.':'Foto, QR, massa e horário aguardando rede.';document.getElementById('fieldEventTime').textContent=fieldAppStep===4?'14:37':'local';}
  badge.textContent=fieldAppStep===4?'fila vazia':'1 pendente';badge.className='st np '+(fieldAppStep===4?'s-reg':'s-not');net.textContent=fieldAppStep===4?'sincronizado':FIELD_MODES[fieldMode].net;
  toast(fieldAppStep===4?'Coleta sincronizada com segurança':'Etapa salva no dispositivo');
}

function fieldContingency(){
  const html=`<!doctype html><meta charset="utf-8"><title>Ficha de contingência SAMAÚMA</title><style>body{font:14px Arial;max-width:760px;margin:35px auto;color:#24382e}h1{color:#174e37;border-bottom:4px solid #d1a43c;padding-bottom:9px}.row{display:grid;grid-template-columns:1fr 1fr;border:1px solid #777}.row div{min-height:54px;padding:9px;border:1px solid #bbb}.full{grid-column:1/-1}.note{margin-top:16px;padding:12px;background:#f1f4f2}</style><h1>SAMAÚMA · Ficha de contingência</h1><p><b>Ficha:</b> COL-PAPEL-0148 &nbsp; <b>Oportunidade:</b> OP-PVH-2026-014</p><div class="row"><div>Responsável pela coleta:</div><div>Data e horário:</div><div>Estabelecimento:</div><div>Rota / veículo:</div><div>Massa observada:</div><div>Material:</div><div class="full">Ocorrência ou justificativa:</div><div>Assinatura de quem coletou:</div><div>Assinatura de quem digitou:</div></div><div class="note"><b>Controle:</b> esta ficha deve ser digitada no sistema web pelo terminal do galpão. O original é relacionado ao evento digital e guardado conforme a regra de retenção do piloto. Documento demonstrativo.</div>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ficha-contingencia-samauma.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Ficha de contingência baixada');
}

window.addEventListener('load',()=>{setTimeout(initOpportunityMap,120);if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});});
