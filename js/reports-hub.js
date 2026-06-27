// ██ REPORTS — التقارير ══════════════════════════════
function renderCompareReport(){
  const div=document.getElementById('repCompareResult');
  if(!div)return;
  const sort=document.getElementById('cmpSort')?.value||'bal';
  const data=allProjects.map(p=>{
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0};
    return{name:p.name,inc:s.inc||0,exp:s.exp||0,bal:s.bal||0,count:s.count||0};
  });
  data.sort((a,b)=>{
    if(sort==='bal')return b.bal-a.bal;
    if(sort==='inc')return b.inc-a.inc;
    if(sort==='exp')return b.exp-a.exp;
    return a.name.localeCompare(b.name,'ar');
  });
  const maxInc=Math.max(...data.map(d=>d.inc),1);
  const maxExp=Math.max(...data.map(d=>d.exp),1);
  const totalInc=data.reduce((s,d)=>s+d.inc,0);
  const totalExp=data.reduce((s,d)=>s+d.exp,0);
  const totalBal=totalInc-totalExp;
  div.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
      <div class="kc"><div class="kl">إجمالي الوارد</div><div class="kv" style="color:var(--info)">${fn(totalInc)} ج</div></div>
      <div class="kc"><div class="kl">إجمالي المصروف</div><div class="kv" style="color:var(--danger)">${fn(totalExp)} ج</div></div>
      <div class="kc"><div class="kl">${totalBal>=0?'✅ الرصيد':'⚠️ عجز'}</div><div class="kv" style="color:${totalBal>=0?'var(--primary-btn)':'var(--danger)'}">${fn(totalBal)} ج</div></div>
    </div>
    ${data.map(d=>{
      const balClr=d.bal>=0?'var(--primary-btn)':'var(--danger)';
      const incPct=d.inc?Math.round(d.inc/maxInc*100):0;
      const expPct=d.exp?Math.round(d.exp/maxExp*100):0;
      return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-weight:700;color:var(--accent);font-size:14px">${d.name}</span>
          <span style="font-size:12px;color:${balClr};font-weight:700">${d.bal>=0?'+':''}${fn(d.bal)} ج</span>
        </div>
        <div style="margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:3px"><span>⬆ وارد</span><span>${fn(d.inc)} ج</span></div>
          <div style="background:var(--bg-page);border-radius:4px;height:8px;overflow:hidden"><div style="background:var(--info);height:100%;width:${incPct}%;border-radius:4px;transition:width .4s"></div></div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:3px"><span>⬇ مصروف</span><span>${fn(d.exp)} ج</span></div>
          <div style="background:var(--bg-page);border-radius:4px;height:8px;overflow:hidden"><div style="background:var(--danger);height:100%;width:${expPct}%;border-radius:4px;transition:width .4s"></div></div>
        </div>
      </div>`;
    }).join('')}`;
}
function openReport(type){
  _curReport=type;
  document.getElementById('repHub').style.display='none';
  document.getElementById('repView').style.display='block';
  const titles={cash:'💰 التدفق النقدي',summary:'📋 الملخص الدوري',proj:'🏗️ تقرير المشاريع',adv:'💼 تقرير العهد',dues:'⚠️ مستحقات المقاولين',contractor:'👷 تقرير المقاول',client:'📋 تقرير المشروع',compare:'⚖️ مقارنة المشاريع',seqrange:'🔢 تقرير نطاق القيود'};
  document.getElementById('repViewTitle').textContent=titles[type]||'';
  ['repCashPanel','repSummaryPanel','repProjPanel','repAdvPanel','repContractorPanel','repClientPanel','repComparePanel','repSeqRangePanel'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  if(type==='cash'){
    document.getElementById('repCashPanel').style.display='block';
    _populateRepProjSel('rCashProj');
  } else if(type==='summary'){
    document.getElementById('repSummaryPanel').style.display='block';
    _populateRepProjSel('rSumProj');
  } else if(type==='proj'){
    document.getElementById('repProjPanel').style.display='block';
    _populateRepProjSel('rProjSel');
  } else if(type==='adv'){
    document.getElementById('repAdvPanel').style.display='block';
    _populateAdvSel();
  } else if(type==='dues'){
    showScreen('dues');
  } else if(type==='contractor'){
    document.getElementById('repContractorPanel').style.display='block';
    _populateContrSel();
    setTimeout(()=>{
      const f=document.getElementById('rContrFrom');const t=document.getElementById('rContrTo');
      if(f)initDateInput(f);if(t)initDateInput(t);
    },0);
  } else if(type==='client'){
    document.getElementById('repClientPanel').style.display='block';
    _populateRepProjSel('rClientProj');
    setTimeout(()=>{
      const f=document.getElementById('rClientFrom');const t=document.getElementById('rClientTo');
      if(f)initDateInput(f);if(t)initDateInput(t);
    },0);
  } else if(type==='seqrange'){
    document.getElementById('repSeqRangePanel').style.display='block';
    _populateRepProjSel('rSeqProj');
  } else if(type==='compare'){
    document.getElementById('repComparePanel').style.display='block';
    renderCompareReport();
  }
}

function _populateContrSel(){
  const sel=document.getElementById('rContrSel');
  if(!sel)return;
  const contractors=[...new Set(allEntries.filter(e=>e.contractor).map(e=>e.contractor))].sort();
  sel.innerHTML='<option value="">-- اختار مقاول --</option><option value="__ALL__">📊 كل المقاولين</option>';
  contractors.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
}

function backToRepHub(){
  document.getElementById('repHub').style.display='block';
  document.getElementById('repView').style.display='none';
  _curReport=null;
}

// ── SHARED BAR CHART HELPER ──
function _renderBarChart(canvasId,labels,datasets,opts){
  _loadChartJs(()=>{
    const ctx=document.getElementById(canvasId);
    if(!ctx||!window.Chart)return;
    if(ctx._chartInst)ctx._chartInst.destroy();
    const isMob=window.innerWidth<768;
    // اختصار أسماء الشهور على الموبايل
    const shortLabels=isMob?labels.map(l=>l.replace(/يناير/,'يناير').replace(' 20','\'').replace(/([أابتثجحخدذرزسشصضطظعغفقكلمنهوي]+)\s(\d{4})/,(m,month,year)=>month+' '+year.slice(2))):labels;
    ctx._chartInst=new Chart(ctx,{
      type:'bar',
      data:{labels:shortLabels,datasets:datasets.map(d=>({...d,borderRadius:6,borderSkipped:false}))},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{display:datasets.length>1,position:'top',labels:{color:'rgba(212,196,154,.7)',font:{size:11},boxWidth:12}},
          tooltip:{callbacks:{label:c=>`${c.dataset.label||''}: ${fn(c.parsed.y)} ج`}}
        },
        scales:{
          x:{ticks:{color:'var(--text-soft)',font:{size:isMob?9:11},maxRotation:isMob?45:30,autoSkip:true,maxTicksLimit:isMob?8:12},grid:{display:false}},
          y:{ticks:{color:'var(--text-soft)',font:{size:isMob?9:10},callback:v=>v>=1000000?(v/1000000).toFixed(1)+'م':v>=1000?(v/1000).toFixed(0)+'ك':fn(v)},grid:{color:'rgba(255,255,255,.06)'}}
        },
        ...opts
      }
    });
  });
}
function _loadChartJs(cb){
  if(window.Chart){cb();return;}
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
  s.onload=cb;
  document.head.appendChild(s);
}

function _populateRepProjSel(selId){
  const sel=document.getElementById(selId);
  if(!sel)return;
  sel.innerHTML='<option value="all">كل المشاريع</option>';
  allProjects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}

function _populateAdvSel(){
  const sel=document.getElementById('rAdvSel');
  if(!sel)return;
  const seen=new Set();
  sel.innerHTML='<option value="all">كل العهد</option>';
  // use cached advances list if available
  sb('advances?order=person_name').then(advs=>{
    (advs||[]).forEach(a=>{
      if(seen.has(a.id))return;seen.add(a.id);
      const o=document.createElement('option');o.value=a.id;o.textContent=a.person_name||'عهدة';sel.appendChild(o);
    });
  }).catch(()=>{});
}

// ── CASH FLOW ──────────────────────────────────
function _parseEntryDate(s){return parseDt(s);}

function _monthLabel(y,m){
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return (months[m]||'')+' '+y;
}

function clearCashFlow(){
  document.getElementById('rCashFrom').value='';
  document.getElementById('rCashTo').value='';
  document.getElementById('repCashResult').innerHTML='';
}

function runCashFlow(){
  const fromVal=document.getElementById('rCashFrom').value;
  const toVal=document.getElementById('rCashTo').value;
  const projId=document.getElementById('rCashProj').value;

  let ents=[...allEntries];
  if(projId!=='all')ents=ents.filter(e=>e.project_id===projId);

  const fromD=fromVal?parseDt(fromVal):null;
  const toD=toVal?(()=>{const d=parseDt(toVal);if(d)d.setHours(23,59,59,999);return d;})():null;

  ents=ents.filter(e=>{
    const d=_parseEntryDate(e.entry_date);
    if(!d||isNaN(d))return false;
    if(fromD&&d<fromD)return false;
    if(toD&&d>toD)return false;
    return true;
  });

  if(!ents.length){
    document.getElementById('repCashResult').innerHTML='<div class="rep-no-data-msg">لا توجد بيانات في هذه الفترة</div>';
    return;
  }

  // group by month
  const buckets={};
  ents.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0,exp:0};
    if(e.type==='i')buckets[k].inc+=e.amount;
    else buckets[k].exp+=e.amount;
  });

  const rows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  window._cashRows=rows;
  const maxAmt=Math.max(...rows.map(r=>Math.max(r.inc,r.exp)),1);
  const totalInc=rows.reduce((s,r)=>s+r.inc,0);
  const totalExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totalInc-totalExp;

  document.getElementById('repCashResult').innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(totalInc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(totalExp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">صافي التدفق</div><div class="cf-kpi-val" style="color:${net>=0?'var(--info-sky)':'var(--danger-soft)'}">${net>=0?'+':''}${fn(net)} ج</div></div>
    </div>
    <div class="rep-chart-wrap"><canvas id="cashChart" role="img" aria-label="مخطط التدفق النقدي الشهري"></canvas></div>
    <div class="cf-bars">
      ${rows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        const ew=Math.round(r.exp/maxAmt*100);
        const rn=r.inc-r.exp;
        return `<div class="cf-row">
          <div class="cf-row-hdr">
            <div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div>
            <div class="cf-row-net" style="color:${rn>=0?'var(--success-soft)':'var(--danger-soft)'}">${rn>=0?'+':''}${fn(rn)} ج</div>
          </div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
            <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">-${fn(r.exp)} ج</div></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  // Load Chart.js and render
  _renderBarChart('cashChart',
    rows.map(r=>_monthLabel(r.y,r.m)),
    [
      {label:'وارد',data:rows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'},
      {label:'مصروف',data:rows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}
    ]
  );
}

// ── PERIODIC SUMMARY ───────────────────────────
function clearSummary(){
  document.getElementById('rSumFrom').value='';
  document.getElementById('rSumTo').value='';
  document.getElementById('repSummaryResult').innerHTML='';
}

function runSummary(){
  const fromVal=document.getElementById('rSumFrom').value;
  const toVal=document.getElementById('rSumTo').value;
  const projId=document.getElementById('rSumProj').value;

  const fromD=fromVal?parseDt(fromVal):null;
  const toD=toVal?(()=>{const d=parseDt(toVal);if(d)d.setHours(23,59,59,999);return d;})():null;

  let projects=projId==='all'?allProjects:allProjects.filter(p=>p.id===projId);

  const rows=projects.map(p=>{
    let ents=allEntries.filter(e=>e.project_id===p.id);
    if(fromD)ents=ents.filter(e=>{const d=_parseEntryDate(e.entry_date);return d&&d>=fromD;});
    if(toD)ents=ents.filter(e=>{const d=_parseEntryDate(e.entry_date);return d&&d<=toD;});
    const inc=ents.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
    const exp=ents.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
    return {name:p.name,inc,exp,net:inc-exp,count:ents.length};
  }).filter(r=>r.count>0);
  window._summaryRows=rows;

  if(!rows.length){
    document.getElementById('repSummaryResult').innerHTML='<div class="rep-no-data-msg">لا توجد بيانات في هذه الفترة</div>';
    return;
  }

  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const period=(fromVal||toVal)?((fromVal?'من '+fromVal:'')+(toVal?' لحد '+toVal:'')):'كل الفترات';

  document.getElementById('repSummaryResult').innerHTML=`
    <div class="rep-period-label">${period}</div>
    <div class="cf-kpi-row" style="margin-bottom:20px">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(totInc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(totExp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">الصافي</div><div class="cf-kpi-val" style="color:${totNet>=0?'var(--info-sky)':'var(--danger-soft)'}">${totNet>=0?'+':''}${fn(totNet)} ج</div></div>
    </div>
    <div class="rep-chart-wrap"><canvas id="summaryChart" role="img" aria-label="مخطط المشاريع المقارنة"></canvas></div>
    ${rows.sort((a,b)=>b.net-a.net).map(r=>`
      <div class="sum-proj-card">
        <div class="sum-proj-name">${r.name}</div>
        <div class="sum-proj-row"><span class="sum-row-lbl">الوارد</span><span class="sum-row-val" style="color:#7DBFA0">+${fn(r.inc)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">المصاريف</span><span class="sum-row-val" style="color:#C86060">-${fn(r.exp)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">الصافي</span><span class="sum-row-val" style="color:${r.net>=0?'var(--success-soft)':'var(--danger-soft)'};font-size:15px">${r.net>=0?'+':''}${fn(r.net)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">عدد القيود</span><span class="sum-row-val" style="color:rgba(212,196,154,.7)">${r.count} قيد</span></div>
      </div>`).join('')}`;

  _loadChartJs(()=>{
    const ctx=document.getElementById('summaryChart');
    if(!ctx||!window.Chart)return;
    if(ctx._chartInst)ctx._chartInst.destroy();
    const sorted=[...rows].sort((a,b)=>b.net-a.net);
    const shortName=n=>n.length>20?n.substring(0,20)+'…':n;
    // ارتفاع ديناميكي حسب عدد المشاريع
    const h=Math.max(260,sorted.length*38);
    ctx.parentElement.style.height=h+'px';
    ctx._chartInst=new Chart(ctx,{
      type:'bar',
      data:{
        labels:sorted.map(r=>shortName(r.name)),
        datasets:[
          {label:'وارد',data:sorted.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.75)',borderRadius:4,borderSkipped:false},
          {label:'مصروف',data:sorted.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.75)',borderRadius:4,borderSkipped:false}
        ]
      },
      options:{
        indexAxis:'y',
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{display:true,position:'top',labels:{color:'rgba(212,196,154,.7)',font:{size:11},boxWidth:12}},
          tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fn(c.parsed.x)} ج`}}
        },
        scales:{
          x:{ticks:{color:'var(--text-soft)',font:{size:10},callback:v=>fn(v)},grid:{color:'rgba(255,255,255,.05)'}},
          y:{ticks:{color:'var(--text-soft)',font:{size:11,family:'Cairo,sans-serif'}},grid:{display:false}}
        }
      }
    });
  });
}
