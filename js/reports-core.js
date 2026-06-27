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

function loadRepScreen(){
  document.getElementById('repHub').style.display='block';
  document.getElementById('repView').style.display='none';
  _curReport=null;
  // لو الداتا مش محملة، حملها الأول
  if(!allEntries.length||!allProjects.length){
    loadAllProjects().then(()=>{
      _populateRepSelectors();
    }).catch(()=>{});
  } else {
    _populateRepSelectors();
  }
}
function _populateRepSelectors(){
  const ps=document.getElementById('rProjSel');
  if(ps){
    ps.innerHTML='<option value="all">كل المشاريع</option>';
    allProjects.forEach(p=>{ps.innerHTML+=`<option value="${p.id}">${esc(p.name)}</option>`;});
  }
  // Populate advances selector
  const as=document.getElementById('rAdvSel');
  if(as){
    as.innerHTML='<option value="all">كل العهد</option>';
    sb('advances?order=person_name').then(advs=>{
      (advs||[]).forEach(a=>{as.innerHTML+=`<option value="${a.id}">${esc(a.person_name)}</option>`;});
    }).catch(()=>{});
  }
}

function switchRepTab(tab){
  repTab=tab;
  document.getElementById('repProjPanel').style.display=tab==='proj'?'block':'none';
  document.getElementById('repAdvPanel').style.display=tab==='adv'?'block':'none';
  document.getElementById('repTabProj').className='filter-btn'+(tab==='proj'?'':' sec');
  document.getElementById('repTabAdv').className='filter-btn'+(tab==='adv'?'':' sec');
}

// ── PROJECT FILTER ──
function runRepFilter(){
  const projId=document.getElementById('rProjSel').value;
  const fromStr=document.getElementById('rDateFrom').value;
  const toStr=document.getElementById('rDateTo').value;

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  let filtered=allEntries;
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

  const inc=filtered.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=filtered.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  const bal=inc-exp;
  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  const sorted=[...filtered].sort((a,b)=>(parseDt(b.entry_date)||0)-(parseDt(a.entry_date)||0));

  _repFilterData={projName,period,filtered:sorted,inc,exp,bal,projId,fromStr,toStr};

  // بار chart data — مجمّع بالشهر
  const buckets={};
  sorted.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0,exp:0};
    if(e.type==='i')buckets[k].inc+=e.amount;else buckets[k].exp+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>Math.max(r.inc,r.exp)),1);

  document.getElementById('repResult').innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(inc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(exp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">الرصيد</div><div class="cf-kpi-val" style="color:${bal>=0?'var(--info-sky)':'var(--danger-soft)'}">${bal>=0?'+':''}${fn(bal)} ج</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="projRepChart"></canvas></div>`:''}
    <div class="cf-bars">
      ${bRows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        const ew=Math.round(r.exp/maxAmt*100);
        const rn=r.inc-r.exp;
        return `<div class="cf-row">
          <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:${rn>=0?'var(--success-soft)':'var(--danger-soft)'}">${rn>=0?'+':''}${fn(rn)} ج</div></div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
            <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">-${fn(r.exp)} ج</div></div>
          </div></div>`;
      }).join('')}
    </div>
    <div class="rep-entries-list">
      <button class="filter-btn" onclick="repExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
      <button class="filter-btn is46" onclick="repExportPDF()">📕 PDF</button>
      <span class="filter-count-badge">${sorted.length} قيد</span>
    </div>
    <div id="repProjPag_pag"></div>`;
  _pagInit('repProjPag', sorted, projId==='all');
  if(bRows.length>1)_renderBarChart('projRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [
      {label:'وارد',data:bRows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'},
      {label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}
    ]
  );
}

function clearRepFilter(){
  document.getElementById('rDateFrom').value='';
  document.getElementById('rDateTo').value='';
  document.getElementById('rProjSel').value='all';
  document.getElementById('repResult').innerHTML='';
  _repFilterData=null;
}

// ── ADVANCE FILTER ──
async function runRepAdvFilter(){
  const advId=document.getElementById('rAdvSel').value;
  const fromStr=document.getElementById('rAdvDateFrom').value;
  const toStr=document.getElementById('rAdvDateTo').value;

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  setSav('⏳ جاري التحميل...','ng');
  try{
    const query=advId==='all'
      ?'entries?advance_id=not.is.null&order=created_at'
      :'entries?advance_id=eq.'+advId+'&order=created_at';
    let entries=await sb(query);
    if(from)entries=entries.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
    if(to)entries=entries.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

    const total=entries.reduce((s,e)=>s+e.amount,0);
    const advName=advId==='all'?'كل العهد':document.getElementById('rAdvSel').selectedOptions[0]?.text||'—';
    const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
    const sorted=[...entries].sort((a,b)=>(parseDt(b.entry_date)||0)-(parseDt(a.entry_date)||0));

    _repAdvData={advName,period,entries:sorted,total,advId,fromStr,toStr};
    setSav('✅ تم','ok');

    // bars by month
    const buckets={};
    sorted.forEach(e=>{
      const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
      const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
      if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),exp:0};
      buckets[k].exp+=e.amount;
    });
    const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
    const maxAmt=Math.max(...bRows.map(r=>r.exp),1);

    document.getElementById('repAdvResult').innerHTML=`
      <div class="cf-kpi-row">
        <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصروف</div><div class="cf-kpi-val" style="color:#C86060">▼ ${fn(total)} ج</div></div>
        <div class="cf-kpi"><div class="cf-kpi-lbl">عدد القيود</div><div class="cf-kpi-val" style="color:#7BB8C8">${sorted.length}</div></div>
      </div>
      ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="advRepChart"></canvas></div>`:''}
      <div class="cf-bars">
        ${bRows.map(r=>{
          const ew=Math.round(r.exp/maxAmt*100);
          return `<div class="cf-row">
            <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:#C86060">▼ ${fn(r.exp)} ج</div></div>
            <div class="cf-bar-wrap">
              <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">▼ ${fn(r.exp)} ج</div></div>
            </div></div>`;
        }).join('')}
      </div>
      <div class="rep-entries-list">
        <button class="filter-btn" onclick="repAdvExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
        <button class="filter-btn is46" onclick="repAdvExportPDF()">📕 PDF</button>
      </div>
      <div id="repAdvPag_pag"></div>`;
    _pagInit('repAdvPag', sorted, false);
    if(bRows.length>1)_renderBarChart('advRepChart',
      bRows.map(r=>_monthLabel(r.y,r.m)),
      [{label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}]
    );
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function clearRepAdvFilter(){
  document.getElementById('rAdvDateFrom').value='';
  document.getElementById('rAdvDateTo').value='';
  document.getElementById('rAdvSel').value='all';
  document.getElementById('repAdvResult').innerHTML='';
  _repAdvData=null;
}

// ── EXCEL EXPORT ──
async function loadExcelJS(){
  if(typeof ExcelJS!=='undefined')return;
  await new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';
    s.onload=res;s.onerror=rej;
    document.head.appendChild(s);
  });
}

async function repExportExcel(){
  const d=_repFilterData;
  if(!d||!d.filtered.length){notify('لا يوجد بيانات','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    await loadExcelJS();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير المشاريع',{views:[{rightToLeft:true}]});
    const COLS=7;ws.columns=[{width:14},{width:12},{width:20},{width:16},{width:26},{width:18},{width:16}];
    _xlHeader(ws,'📁 تقرير مشروع: '+d.projName,d.period+'  |  وارد: '+fn(d.inc)+' ج  |  مصاريف: '+fn(d.exp)+' ج  |  رصيد: '+fn(d.bal)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','النوع','المشروع','البند','البيان','المقاول','المبلغ (ج)'],COLS);
    d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const isI=e.type==='i';
      _xlDataRow(ws,[cleanDate(e.entry_date)||'',isI?'▲ وارد':'▼ مصروف',proj?.name||'',e.category||'',e.description||'',e.contractor||'',e.amount],i,[null,isI?_XC.PS:_XC.RD,null,null,null,_XC.MQ,isI?_XC.PS:_XC.RD]);
    });
    _xlTotRow(ws,['','▲ وارد','','','','',d.inc],COLS);
    _xlTotRow(ws,['','▼ مصروف','','','','',d.exp],COLS);
    _xlTotRow(ws,['','الرصيد','','','','',d.bal],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='تقرير_'+d.projName+'_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
    setSav('✅ تم تحميل Excel','ok');
  }catch(e){setSav('❌ '+e.message,'er');}
}

async function repAdvExportExcel(){
  const d=_repAdvData;
  if(!d||!d.entries.length){notify('لا يوجد بيانات','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    await loadExcelJS();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير العهدة',{views:[{rightToLeft:true}]});
    const COLS=6;ws.columns=[{width:14},{width:14},{width:22},{width:18},{width:16},{width:14}];
    _xlHeader(ws,'💼 تقرير عهدة: '+d.advName,d.period+'  |  إجمالي: '+fn(d.total)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','البند','البيان','المشروع','المقاول','المبلغ (ج)'],COLS);
    d.entries.forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      _xlDataRow(ws,[e.entry_date||'',e.category||'',e.description||'',proj?.name||'',e.contractor||'',e.amount],i,[null,null,null,null,_XC.MQ,_XC.RD]);
    });
    _xlTotRow(ws,['إجمالي الصرف','','','','',d.total],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='عهدة_'+d.advName+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم تحميل Excel','ok');
  }catch(e){setSav('❌ '+e.message,'er');}
}

// ── PDF EXPORT ──
async function repExportPDF(){
  const d=_repFilterData;
  if(!d||!d.filtered.length){notify('شغّل الفلتر أولاً ثم اضغط عرض','warn');return;}
  // استخدم الـ cache الموجود من البحث أو اجيب الـ profiles
  let profileMap={};
  try{
    const profiles=await sb('profiles');
    if(profiles&&profiles.length)profiles.forEach(p=>{profileMap[p.id]=p.name||'—';});
    _profMapCache=profileMap;
  }catch(e){console.warn('profiles error:',e);}
  const rows=d.filtered.map((e,i)=>{
    const proj=allProjectsMap[e.project_id];
    const isI=e.type==='i';
    const c=isI?'var(--primary-btn)':'var(--danger)';
    const etLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
    const et=e.entry_type?`<span style="font-size:9px;padding:2px 6px;border-radius:8px;font-weight:700;background:${e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':'var(--warning-pale)'};color:${e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':'var(--warning-dark)'}">${etLbl[e.entry_type]}</span> `:'';
    const creator=e.created_by?(profileMap[e.created_by]||'—'):'غير مسجل';
    return `<tr><td class="rep-table-num">${i+1}</td><td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td><td style="font-size:10px">${cleanDate(e.entry_date)}</td><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${isI?'var(--success-pale)':'var(--danger-pale)'};color:${c}">${isI?'▲ وارد':'▼ مصروف'}</span></td><td style="font-size:10px;color:#555">${proj?.name||''}</td><td style="font-weight:600">${e.category||'—'}</td><td style="color:#555">${et}${e.description||''}</td><td style="font-size:10px;color:#555">${e.contractor||'—'}</td><td class="rep-creator-cell">${creator}</td><td style="color:${c};font-weight:700;white-space:nowrap">${isI?'▲':'▼'} ${fn(e.amount)} ج</td></tr>`;
  }).join('');
  // ملخص المقاولين
  const mqMap={};
  d.filtered.filter(e=>e.contractor&&e.entry_type).forEach(e=>{
    if(!mqMap[e.contractor])mqMap[e.contractor]={pay:0,work:0,mat:0};
    if(e.entry_type==='payment')mqMap[e.contractor].pay+=e.amount;
    else if(e.entry_type==='work')mqMap[e.contractor].work+=e.amount;
    else if(e.entry_type==='material')mqMap[e.contractor].mat+=e.amount;
  });
  const mqRows=Object.entries(mqMap).map(([name,m])=>{
    const rem=m.pay-(m.work+m.mat);
    return `<tr><td style="font-weight:700">👷 ${name}</td><td style="text-align:center;color:#1E6B3A">${fn(m.pay)} ج</td><td style="text-align:center;color:#185FA5">${fn(m.work)} ج</td><td style="text-align:center;color:#E65100">${fn(m.mat)} ج</td><td style="text-align:center;font-weight:900;color:${rem>=0?'var(--primary)':'var(--danger)'}">${rem>=0?'':'-'}${fn(Math.abs(rem))} ج</td></tr>`;
  }).join('');
  const mqSection=mqRows?`
    <h3 class="rep-contractors-title">👷 ملخص المقاولين</h3>
    <table><thead><tr><th>المقاول</th><th>💰 دفعات</th><th>🔨 أعمال</th><th>🔩 مصنعيات</th><th>الباقي / المستحق</th></tr></thead><tbody>${mqRows}</tbody></table>`:'';
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  const html=_pdfOpen('تقرير - '+d.projName)+
    _pdfHeader('📁 تقرير مشروع','📁 '+d.projName+' · 📅 '+d.period+' · 🗓 '+now)+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.exp)} ج</div></div>
      <div class="kpi ${d.bal>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي الرصيد</div><div class="kpi-val">${d.bal>=0?'▲':'▼'} ${fn(Math.abs(d.bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود <span style="font-size:11px;font-weight:400;color:#888">(${d.filtered.length} قيد)</span></div>
    <table>
      <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>النوع</th><th>المشروع</th><th>البند</th><th>البيان</th><th>المقاول</th><th>مدخل البيانات</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${mqSection}`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

function repAdvExportPDF(){
  const d=_repAdvData;
  if(!d||!d.entries.length){notify('لا يوجد بيانات','warn');return;}
  const canvas=document.getElementById('advRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const rows=d.entries.map((e,i)=>{
    const proj=allProjectsMap[e.project_id];
    return `<tr>
      <td class="rep-table-num">${i+1}</td>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
      <td>${cleanDate(e.entry_date)||'—'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||'—'}</td>
      <td>${proj?.name||'—'}</td>
      <td class="amt neg">▼ ${fn(e.amount)} ج</td>
    </tr>`;
  }).join('');
  const html=_pdfOpen('تقرير عهدة')+
    _pdfHeader('💼 تقرير العهدة','صاحب العهدة: '+d.advName+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${d.entries.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المصروفات</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البند</th><th>البيان</th><th>المشروع</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt neg">▼ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

// ── CONTRACTOR REPORT ──────────────────────────
