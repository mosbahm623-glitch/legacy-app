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
