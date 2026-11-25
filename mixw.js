/* mix-charts: тональный баланс и динамика версий трека против нормы референсов (Chart.js 4).
   MIX(R, V): R — норма рефов {L:подписи полос, lo/hi:[29 границ нормы], dy:[{t,q:[25,50,75%],e:[мин,макс]}×4]} (передаётся вызывающим, в репо не хранится); V — список версий {n:имя, d:[29 отклонений от медианы рефов, дБ], p:[29 перцентилей], f:полный рендер?, m:[psr, громкость, макро, дроп-брейк], q:[их перцентили]}.
   Рисует в элемент #mix. Подсказки — через 1 с, дальше мгновенно между точками. */
(function(){
window.MIX=function(R,V){const el=document.getElementById('mix');
el.innerHTML='<div style="font-size:12px;color:var(--text-secondary)">Тональный баланс, дБ от медианы 44 рефов · серое — норма 25–75%</div><div style="position:relative;height:340px"><canvas></canvas></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;margin-top:14px"></div>';
const dk=matchMedia('(prefers-color-scheme: dark)').matches,M='#898781',G=dk?'#2c2c2a':'#e6e4dd',B=dk?'rgba(180,178,169,.25)':'rgba(180,178,169,.42)';
const C=['#3b82c4','#2a9d8f','#8e6cc9','#c9a227','#b5577a'],N=V.length,col=i=>i==N-1?'#e8622c':C[i%5],ax={ticks:{color:M},grid:{color:G}};
const tt={displayColors:false,padding:6,caretSize:4,bodyFont:{size:11},titleFont:{size:11}},arm=t=>t.chart._arm,sg=x=>(x>0?'+':'')+x;
const dl={id:'dl',afterEvent(c,a){const e=a.event,act=e.type=='mouseout'?[]:c.getElementsAtEventForMode(e,'nearest',{intersect:true},false).filter(x=>!c.data.datasets[x.datasetIndex]._n);
if(!act.length){clearTimeout(c._t);c._t=null;if(c._arm){clearTimeout(c._g);c._g=setTimeout(()=>{c._arm=false},500)}return}
clearTimeout(c._g);c._last=act;if(!c._arm&&!c._t)c._t=setTimeout(()=>{c._t=null;c._arm=true;c.tooltip.setActiveElements(c._last,{x:e.x,y:e.y});c.update('none')},1000)}};
new Chart(el.querySelector('canvas'),{type:'line',plugins:[dl],data:{labels:R.L,datasets:[{_n:1,data:R.hi,borderWidth:0,pointRadius:0,fill:'+1',backgroundColor:B},{_n:1,data:R.lo,borderWidth:0,pointRadius:0},
...V.map((v,i)=>({label:v.n,data:v.d,borderColor:col(i),backgroundColor:col(i),borderWidth:i==N-1?3:1.6,pointRadius:i==N-1?3:1.5,pointHitRadius:7,tension:.25}))]},
options:{maintainAspectRatio:false,interaction:{mode:'nearest',intersect:true},plugins:{legend:{labels:{color:M,filter:l=>l.text}},
tooltip:{...tt,filter:t=>arm(t)&&t.datasetIndex>1,callbacks:{title:t=>t[0].label+' Гц · норма '+R.lo[t[0].dataIndex]+'…+'+R.hi[t[0].dataIndex],label:t=>{const v=V[t.datasetIndex-2];return v.n+': '+sg(t.raw)+' дБ (больше, чем у '+v.p[t.dataIndex]+'% рефов)'}}}},
scales:{x:{...ax,grid:{display:false}},y:{...ax,min:-6,max:6}}}});
const g=el.lastChild;R.dy.forEach((d,k)=>{const vv=V.map((v,i)=>[v,i]).filter(([v])=>v.m&&v.m[k]!=null&&(v.f||k<(R.est||2)));if(!vv.length)return;
const w=document.createElement('div');w.innerHTML='<div style="font-size:12px;color:var(--text-secondary)">'+d.t+' · серое — рефы 25–75%, черта — медиана ('+d.q.join(' / ')+')</div><div style="position:relative;height:110px"><canvas></canvas></div>';g.appendChild(w);
new Chart(w.querySelector('canvas'),{type:'scatter',data:{datasets:vv.map(([v,i])=>({label:v.n,_v:v,data:[{x:v.m[k],y:0}],pointStyle:'triangle',rotation:180,pointRadius:i==N-1?10:7,backgroundColor:col(i)}))},
options:{maintainAspectRatio:false,interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:false},tooltip:{...tt,filter:arm,callbacks:{title:()=>'',label:t=>t.dataset.label+': '+t.raw.x+' (больше, чем у '+t.dataset._v.q[k]+'% рефов)'}}},
scales:{y:{display:false,min:-1,max:1},x:{...ax,min:d.e[0],max:d.e[1]}}},plugins:[dl,{id:'q',beforeDatasetsDraw(c){const x=c.scales.x,y=c.chartArea;c.ctx.fillStyle=B;c.ctx.fillRect(x.getPixelForValue(d.q[0]),y.top+20,x.getPixelForValue(d.q[2])-x.getPixelForValue(d.q[0]),y.height-40);c.ctx.fillStyle=M;c.ctx.fillRect(x.getPixelForValue(d.q[1])-1,y.top+14,2,y.height-28)}}]})})}})();
