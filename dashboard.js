/* Central analítica demonstrativa. Não consome dados oficiais. */
let biTrendChart,biCompositionChart;

function biFiltered(){
  const branch=document.getElementById('biBranch')?.value||'all';
  const evidence=document.getElementById('biEvidence')?.value||'all';
  return ESTAB.filter(e=>{
    if(branch!=='all'&&e.tipo!==branch)return false;
    const verified=e.status==='regular'&&(e.comprov>0||e.massaDest>0);
    if(evidence==='verified'&&!verified)return false;
    if(evidence==='field'&&!e.verif)return false;
    if(evidence==='estimated'&&(e.verif||verified))return false;
    return true;
  });
}

function biResetFilters(){
  document.getElementById('biPeriod').value='12';
  document.getElementById('biBranch').value='all';
  document.getElementById('biEvidence').value='all';
  renderBI();toast('Filtros do painel removidos');
}

function biMonths(count){
  const out=[],today=new Date();
  for(let i=count-1;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1);out.push(d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''));}
  return out;
}

function biSeries(end,count,startRatio){
  return Array.from({length:count},(_,i)=>Math.max(0,Math.round(end*(startRatio+(1-startRatio)*(i/(count-1||1))))));
}

function biUpdateKpis(data){
  const reg=data.filter(e=>e.status==='regular'),not=data.filter(e=>e.status==='notificado'),irr=data.filter(e=>e.status==='irregular');
  const field=data.filter(e=>e.verif),outside=irr.concat(not).filter(e=>e.faixa==='solucao_propria');
  const regularSolution=reg.filter(e=>e.faixa==='solucao_propria');
  const massOutside=outside.reduce((s,e)=>s+e.ton,0),massRegular=regularSolution.reduce((s,e)=>s+e.ton,0);
  const massOutsideMin=outside.reduce((s,e)=>s+e.tonMin,0),massOutsideMax=outside.reduce((s,e)=>s+e.tonMax,0);
  const totalMass=data.reduce((s,e)=>s+e.ton,0),recMass=data.reduce((s,e)=>s+e.recTon,0);
  const coop=reg.filter(e=>e.operador==='coop'),coopRec=coop.reduce((s,e)=>s+e.recTon,0);
  const regRate=data.length?reg.length/data.length*100:0,fieldRate=data.length?field.length/data.length*100:0;
  const verified=reg.filter(e=>e.comprov>0||e.massaDest>0).length;
  const quality=Math.min(97,Math.round(58+regRate*.22+fieldRate*.12+(data.length?verified/data.length*100:0)*.17));
  const income=975+(coopRec*430+field.length*VAL_VERIF)/53;

  document.getElementById('biFilterCount').textContent=data.length.toLocaleString('pt-BR');
  document.getElementById('k1').textContent=data.length.toLocaleString('pt-BR');
  document.getElementById('kv').textContent=field.length.toLocaleString('pt-BR');
  document.getElementById('kvs').textContent=NUM(fieldRate,1)+'%';
  document.getElementById('k2').textContent=reg.length+' registros';
  document.getElementById('k2s').textContent='regularizados no recorte';
  document.getElementById('biRegRate').textContent=NUM(regRate,1)+'%';
  document.getElementById('k3').textContent=NUM(massOutside,0);
  document.getElementById('biQuality').textContent=quality+'/100';
  document.getElementById('biSavings').textContent=BRL(massRegular*CT());
  document.getElementById('biRecyclable').textContent=NUM(recMass,1)+' t';
  document.getElementById('biRecShare').textContent=totalMass?NUM(recMass/totalMass*100,1)+'%':'0%';
  document.getElementById('biIncome').textContent=BRL(income);

  document.getElementById('d1').textContent=coop.length;
  document.getElementById('d2').textContent=reg.length?Math.round(coop.length/reg.length*100)+'%':'0%';
  document.getElementById('d3').textContent=NUM(coopRec)+' t/mês';
  document.getElementById('d4').textContent=coop.length?53:0;
  document.getElementById('d5').textContent=BRL(income);
  document.getElementById('d6').textContent=field.length;
  document.getElementById('f1').textContent=BRL(CT())+' /t';
  document.getElementById('f2').textContent=NUM(massOutside,0)+' t/mês';
  document.getElementById('f2r').textContent='faixa: '+NUM(massOutsideMin,0)+' a '+NUM(massOutsideMax,0)+' t/mês';
  document.getElementById('f3').textContent=BRL(massOutside*CT())+' /mês';
  document.getElementById('f3r').textContent='faixa: '+BRL(massOutsideMin*CT())+' a '+BRL(massOutsideMax*CT());
  document.getElementById('f4').textContent=BRL(massRegular*CT())+' /mês';
  document.getElementById('f6').textContent=BRL(field.length*VAL_VERIF)+' /mês';
  return {reg,not,irr,field,outside,verified,regRate,fieldRate,massOutside,massRegular,totalMass,recMass,quality};
}

function biUpdateExistingCharts(data,metrics){
  const status=[metrics.irr.length,metrics.not.length,metrics.reg.length];
  if(ch1){ch1.data.datasets[0].data=status;ch1.data.datasets[0].backgroundColor=['#a74b43','#b8891a','#26815a'];ch1.data.datasets[0].borderRadius=2;ch1.update('none');}
  const types=Object.keys(COEF).filter(t=>data.some(e=>e.tipo===t));
  if(ch2){ch2.data.labels=types.map(t=>RAMO[t]);ch2.data.datasets[0].data=types.map(t=>data.filter(e=>e.tipo===t).reduce((s,e)=>s+e.ton,0));ch2.data.datasets[0].backgroundColor=['#174e37','#2a7051','#4c8e6d','#82aa92','#c29a3b','#708390'];ch2.options.cutout='66%';ch2.update('none');}
}

function biUpdateTrend(data,metrics){
  const count=+(document.getElementById('biPeriod')?.value||12),labels=biMonths(count);
  const total=biSeries(data.length,count,.72),field=biSeries(metrics.field.length,count,.18),reg=biSeries(metrics.reg.length,count,.31);
  const el=document.getElementById('chTrend');if(!el)return;
  const chartData={labels,datasets:[
    {label:'Acompanhados',data:total,borderColor:'#365f79',backgroundColor:'rgba(54,95,121,.08)',fill:true,tension:.32,borderWidth:2,pointRadius:2},
    {label:'Campo',data:field,borderColor:'#b8891a',backgroundColor:'transparent',tension:.32,borderWidth:2,pointRadius:2},
    {label:'Regularizados',data:reg,borderColor:'#17804a',backgroundColor:'transparent',tension:.32,borderWidth:2,pointRadius:2}
  ]};
  const options={responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},tooltip:{backgroundColor:'#263d33',titleFont:{size:10},bodyFont:{size:10},padding:9}},scales:{x:{grid:{display:false},ticks:{color:'#75827b',font:{size:9}}},y:{beginAtZero:true,grid:{color:'#edf1ef'},ticks:{color:'#75827b',font:{size:9},precision:0}}}};
  if(!biTrendChart)biTrendChart=new Chart(el,{type:'line',data:chartData,options});else{biTrendChart.data=chartData;biTrendChart.options=options;biTrendChart.update('none');}
}

function biUpdateComposition(data){
  const values=[data.reduce((s,e)=>s+e.recTon,0),data.reduce((s,e)=>s+e.orgTon,0),data.reduce((s,e)=>s+e.rejTon,0),data.reduce((s,e)=>s+e.espTon,0)];
  const el=document.getElementById('chComposition');if(!el)return;
  const chartData={labels:['Recicláveis','Orgânicos','Rejeitos','Especiais'],datasets:[{data:values,backgroundColor:['#2d8060','#b8891a','#6d7c75','#a44e46'],borderWidth:0}]};
  const options={responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom',labels:{color:'#66756d',font:{size:9},boxWidth:8,padding:9}},tooltip:{callbacks:{label:c=>c.label+': '+NUM(c.raw,1)+' t/mês'}}}};
  if(!biCompositionChart)biCompositionChart=new Chart(el,{type:'doughnut',data:chartData,options});else{biCompositionChart.data=chartData;biCompositionChart.options=options;biCompositionChart.update('none');}
}

function biUpdateFunnel(data,metrics){
  const solution=data.filter(e=>e.faixa==='solucao_propria').length;
  const instructed=metrics.not.length+metrics.reg.length;
  const verified=metrics.verified;
  const steps=[['Acompanhados',data.length],['Acima de 200 L/dia',solution],['Instruídos',instructed],['Regularizados',metrics.reg.length],['Com comprovante',verified]];
  const max=Math.max(data.length,1);
  document.getElementById('biFunnel').innerHTML=steps.map(([label,value])=>`<div class="bi-funnel-row"><span>${label}</span><div class="bi-funnel-track"><div class="bi-funnel-fill" style="width:${Math.max(2,value/max*100)}%"></div></div><b>${value}</b></div>`).join('');
  const conversion=data.length?metrics.reg.length/data.length*100:0;
  document.getElementById('biFunnelNote').textContent='Conversão até regularização: '+NUM(conversion,1)+'% · comprovantes validados: '+verified+'.';
}

function biUpdateTerritories(data){
  const grouped={};data.forEach(e=>{grouped[e.bairro]??={mass:0,count:0,open:0};grouped[e.bairro].mass+=e.ton;grouped[e.bairro].count++;if(e.status!=='regular')grouped[e.bairro].open++;});
  const rows=Object.entries(grouped).sort((a,b)=>b[1].mass-a[1].mass).slice(0,7),max=rows[0]?.[1].mass||1;
  document.getElementById('biTerritories').innerHTML=`<div class="bi-ter-head"><span>#</span><span>Bairro</span><span>Participação</span><span>Massa</span><span>Pendência</span></div>`+rows.map(([name,v],i)=>`<div class="bi-ter-row"><span class="rank">${String(i+1).padStart(2,'0')}</span><b>${name}</b><div class="bar"><i style="width:${v.mass/max*100}%"></i></div><span class="metric">${NUM(v.mass,1)} t</span><span class="risk">${v.open} abertos</span></div>`).join('');
}

function biUpdateInsights(data,metrics){
  const byType=Object.keys(COEF).map(t=>({t,m:data.filter(e=>e.tipo===t&&e.status!=='regular').reduce((s,e)=>s+e.ton,0)})).sort((a,b)=>b.m-a.m)[0];
  const byDistrict={};data.forEach(e=>byDistrict[e.bairro]=(byDistrict[e.bairro]||0)+(e.status!=='regular'?e.ton:0));
  const topDistrict=Object.entries(byDistrict).sort((a,b)=>b[1]-a[1])[0];
  const evidenceGap=data.length-metrics.field.length,coopUsed=ESTAB.filter(e=>e.status==='regular'&&e.operador==='coop').reduce((s,e)=>s+e.recTon,0);
  const insights=[
    ['!',byType&&byType.m>0?'Maior pressão por ramo':'Recorte sem pressão aberta',byType&&byType.m>0?RAMO[byType.t]+' concentra '+NUM(byType.m,1)+' t/mês ainda não regularizadas.':'Nenhuma massa aberta neste filtro.','warn'],
    ['⌖',topDistrict?'Prioridade territorial':'Sem território no recorte',topDistrict?topDistrict[0]+' lidera a massa pendente, com '+NUM(topDistrict[1],1)+' t/mês.':'Altere os filtros para ampliar o recorte.',''],
    ['✓','Cobertura da evidência',evidenceGap+' registros ainda dependem apenas de estimativa, sem verificação em campo.',''],
    ['↗','Capacidade cooperativa',NUM(coopUsed,1)+' de '+CAP+' t/mês estão comprometidas no cenário demonstrativo.','']
  ];
  document.getElementById('biInsights').innerHTML=insights.map(x=>`<div class="bi-insight ${x[3]}"><i>${x[0]}</i><div><b>${x[1]}</b><p>${x[2]}</p></div></div>`).join('');
}

function renderBI(){
  if(!document.getElementById('biFilterCount')||typeof Chart==='undefined')return;
  const data=biFiltered(),metrics=biUpdateKpis(data);
  biUpdateExistingCharts(data,metrics);biUpdateTrend(data,metrics);biUpdateComposition(data);
  biUpdateFunnel(data,metrics);biUpdateTerritories(data);biUpdateInsights(data,metrics);
}

window.addEventListener('load',()=>setTimeout(renderBI,30));
