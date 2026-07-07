function runClientReport(){
  const projId=document.getElementById('rClientProj').value;
  const fromStr=document.getElementById('rClientFrom').value;
  const toStr=document.getElementById('rClientTo').value;
  const el=document.getElementById('repClientResult');
  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;
  let filtered=allEntries.filter(e=>e.type==='i');
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});
  filtered.sort((a,b)=>(parseDt(a.entry_date)||0)-(parseDt(b.entry_date)||0));
  const total=filtered.reduce((s,e)=>s+e.amount,0);
  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  if(!filtered.length){el.innerHTML='<div class="rep-empty">لا توجد مدفوعات في الفترة المحددة</div>';return;}
  const buckets={};
  filtered.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0};
    buckets[k].inc+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>r.inc),1);
  el.innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">▲ ${fn(total)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">عدد الدفعات</div><div class="cf-kpi-val" style="color:#7BB8C8">${filtered.length}</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="clientRepChart"></canvas></div>`:''}
    <div class="cf-bars">
      ${bRows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        return `<div class="cf-row">
          <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:#7DBFA0">▲ ${fn(r.inc)} ج</div></div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
          </div></div>`;
      }).join('')}
    </div>
    <div class="rep-entries-list" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="filter-btn is46" onclick="clientExportPDF()">📕 PDF</button>
      <button class="filter-btn" style="background:#25D366;color:#fff;border-color:#25D366" onclick="shareClientReport()">📤 شارك مع العميل</button>
    </div>`;
  _repClientData={projName,period,filtered,total,projId};
  if(bRows.length>1)_renderBarChart('clientRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [{label:'وارد',data:bRows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'}]
  );
}

function shareClientReport(){
  const d=_repClientData;
  if(!d||!d.projId||d.projId==='all'){notify('اختار مشروع محدد عشان تشارك','err');return;}
  showShareLinkPopup(d.projId, d.projName);
}

function showShareLinkPopup(projId, projName){
  const link='https://mosbahm623-glitch.github.io/legacy-app/report.html?pid='+projId;
  const msg='📋 تقرير مشروع: '+(projName||'المشروع')+'\n🔗 '+link;
  // إزالة أي popup قديم
  document.getElementById('shareLinkPopup')?.remove();
  const overlay=document.createElement('div');
  overlay.id='shareLinkPopup';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  overlay.innerHTML=`
    <div style="background:#fff;border-radius:24px 24px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;animation:slideUp .3s ease">
      <div style="width:40px;height:4px;background:#ddd;border-radius:4px;margin:0 auto 20px"></div>
      <div style="font-size:15px;font-weight:800;color:#1D3C2A;margin-bottom:4px">🔗 رابط تقرير العميل</div>
      <div style="font-size:12px;color:#999;margin-bottom:16px">${projName||'المشروع'}</div>
      <div style="background:#f0faf0;border:1.5px solid #c8e6c9;border-radius:12px;padding:12px 14px;margin-bottom:16px;word-break:break-all;font-size:12px;color:#1D3C2A;font-weight:600">${link}</div>
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <button onclick="(function(){
          if(navigator.clipboard){navigator.clipboard.writeText('${link}').then(()=>notify('✅ تم نسخ الرابط','ok'));}
          else{var t=document.createElement('textarea');t.value='${link}';document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);notify('✅ تم نسخ الرابط','ok');}
        })()" style="flex:1;padding:12px;background:#1D3C2A;color:#D4C49A;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer">📋 نسخ الرابط</button>
        <a href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank"
          style="flex:1;padding:12px;background:#25D366;color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px">
          📤 واتساب
        </a>
      </div>
      <button onclick="document.getElementById('shareLinkPopup').remove()" style="width:100%;padding:11px;background:#f5f5f5;color:#888;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">إلغاء</button>
    </div>`;
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
}
function clearClientReport(){
  document.getElementById('rClientProj').value='all';
  document.getElementById('rClientFrom').value='';
  document.getElementById('rClientTo').value='';
  document.getElementById('repClientResult').innerHTML='';
  _repClientData=null;
}
function clientExportPDF(){
  if(!_repClientData){runClientReport();if(!_repClientData)return;}
  const d=_repClientData;
  const canvas=document.getElementById('clientRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const rows=d.filtered.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${allProjectsMap[e.project_id]?.name||'—'}</td>
    <td>${e.description||'—'}</td>
    <td class="amt pos">▲ ${fn(e.amount)} ج</td>
  </tr>`).join('');
  const html=_pdfOpen('تقرير مشروع — '+d.projName)+
    _pdfHeader('📋 تقرير مشروع','المشروع: '+d.projName+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد الدفعات</div><div class="kpi-val">${d.filtered.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المدفوعات</div>
    <table>
      <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>المشروع</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt pos">▲ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

function loadDuesReport(){
  const map={};
  allEntries.filter(e=>e.type==='e'&&e.contractor&&e.entry_type).forEach(e=>{
    const key=e.project_id+'__'+e.contractor;
    if(!map[key])map[key]={proj:allProjectsMap[e.project_id]?.name||'—',mq:e.contractor,pay:0,work:0,mat:0};
    if(e.entry_type==='payment')map[key].pay+=e.amount;
    else if(e.entry_type==='work')map[key].work+=e.amount;
    else if(e.entry_type==='material')map[key].mat+=e.amount;
  });
  const rows=Object.values(map).map(r=>({...r,due:r.work+r.mat-r.pay})).filter(r=>r.due>0);
  rows.sort((a,b)=>b.due-a.due);
  const total=rows.reduce((s,r)=>s+r.due,0);
  if(!rows.length){document.getElementById('duesBody').innerHTML='<div class="emp empty-state">✅ لا توجد مستحقات</div>';return;}
  document.getElementById('duesBody').innerHTML=`
    <div class="rep-dues-wrap">
      <table class="rep-dues-table">
        <thead>
          <tr style="background:#1D3C2A">
            <th class="rep-dues-th">المشروع</th>
            <th class="rep-dues-th">المقاول</th>
            <th class="section-hdr-cell">🔨 أعمال + 🔩 مصنعيات</th>
            <th class="section-hdr-cell">💰 مدفوع</th>
            <th class="section-hdr-cell">⚠️ المستحق</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r,i)=>`<tr style="background:${i%2===0?'var(--bg-pure)':'var(--bg-faint)'};border-bottom:1px solid #f0ebe0">
            <td class="rep-dues-proj-cell">${r.proj}</td>
            <td style="padding:9px 12px">👷 ${r.mq}</td>
            <td class="rep-dues-work-cell">${fn(r.work+r.mat)} ج</td>
            <td class="rep-dues-pay-cell">${fn(r.pay)} ج</td>
            <td class="rep-dues-due-cell">${fn(r.due)} ج</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f5f0e8">
            <td colspan="4" class="rep-dues-total-label">إجمالي المستحقات</td>
            <td class="rep-dues-total-val">${fn(total)} ج</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
  window._duesRows=rows;window._duesTotal=total;
}

// ── CASH FLOW EXPORTS ───────────────────────────
function cashExportPDF(){
  const rows=window._cashRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  const canvas=document.getElementById('cashChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totInc-totExp;
  const html=_pdfOpen('التدفق النقدي')+
    _pdfHeader('💰 تقرير التدفق النقدي','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">+${fn(totInc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصاريف</div><div class="kpi-val">-${fn(totExp)} ج</div></div>
      <div class="kpi ${net>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي التدفق</div><div class="kpi-val">${net>=0?'+':''}${fn(net)} ج</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📊 التفاصيل الشهرية</div>
    <table>
      <thead><tr><th>الشهر</th><th>الوارد</th><th>المصاريف</th><th>الصافي</th></tr></thead>
      <tbody>${rows.map(r=>{const n=r.inc-r.exp;return`<tr><td>${_monthLabel(r.y,r.m)}</td><td class="amt pos">+${fn(r.inc)} ج</td><td class="amt neg">-${fn(r.exp)} ج</td><td class="amt ${n>=0?'pos':'neg'}">${n>=0?'+':''}${fn(n)} ج</td></tr>`;}).join('')}</tbody>
      <tfoot><tr><td>الإجمالي</td><td class="amt pos">+${fn(totInc)} ج</td><td class="amt neg">-${fn(totExp)} ج</td><td class="amt ${net>=0?'pos':'neg'}">${net>=0?'+':''}${fn(net)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function cashExportExcel(){try{
  const rows=window._cashRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  if(!window.ExcelJS){const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r);}
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totInc-totExp;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('التدفق النقدي',{views:[{rightToLeft:true}]});
  const COLS=4;ws.columns=[{width:24},{width:20},{width:20},{width:20}];
  _xlHeader(ws,'💰 تقرير التدفق النقدي','وارد: '+fn(totInc)+' ج  |  مصاريف: '+fn(totExp)+' ج  |  صافي: '+fn(net)+' ج',COLS);
  _xlHdrRow(ws,['الشهر','الوارد (ج)','المصاريف (ج)','الصافي (ج)'],COLS);
  rows.forEach((r,i)=>{
    const n=r.inc-r.exp;
    _xlDataRow(ws,[_monthLabel(r.y,r.m),r.inc,r.exp,n],i,[null,_XC.PS,_XC.RD,n>=0?_XC.PS:_XC.RD]);
  });
  _xlTotRow(ws,['الإجمالي',totInc,totExp,net],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='تدفق_نقدي_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

// ── SUMMARY EXPORTS ───────────────────────────
function summaryExportPDF(){
  const rows=window._summaryRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  const canvas=document.getElementById('summaryChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const html=_pdfOpen('الملخص الدوري')+
    _pdfHeader('📋 الملخص الدوري للمشاريع','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">+${fn(totInc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصاريف</div><div class="kpi-val">-${fn(totExp)} ج</div></div>
      <div class="kpi ${totNet>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">الصافي</div><div class="kpi-val">${totNet>=0?'+':''}${fn(totNet)} ج</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📁 تفاصيل المشاريع</div>
    <table>
      <thead><tr><th>المشروع</th><th>الوارد</th><th>المصاريف</th><th>الصافي</th><th>القيود</th></tr></thead>
      <tbody>${rows.sort((a,b)=>b.net-a.net).map(r=>`<tr>
        <td style="font-weight:700">${r.name}</td>
        <td class="amt pos">+${fn(r.inc)} ج</td>
        <td class="amt neg">-${fn(r.exp)} ج</td>
        <td class="amt ${r.net>=0?'pos':'neg'}">${r.net>=0?'+':''}${fn(r.net)} ج</td>
        <td style="text-align:center">${r.count}</td>
      </tr>`).join('')}</tbody>
      <tfoot><tr>
        <td>الإجمالي</td>
        <td class="amt pos">+${fn(totInc)} ج</td>
        <td class="amt neg">-${fn(totExp)} ج</td>
        <td class="amt ${totNet>=0?'pos':'neg'}">${totNet>=0?'+':''}${fn(totNet)} ج</td>
        <td style="text-align:center">${rows.reduce((s,r)=>s+r.count,0)}</td>
      </tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function summaryExportExcel(){try{
  const rows=window._summaryRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  await loadExcelJSLib();
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('الملخص الدوري',{views:[{rightToLeft:true}]});
  const COLS=5;ws.columns=[{width:28},{width:18},{width:18},{width:18},{width:12}];
  _xlHeader(ws,'📋 الملخص الدوري للمشاريع','وارد: '+fn(totInc)+' ج  |  مصاريف: '+fn(totExp)+' ج  |  صافي: '+fn(totNet)+' ج',COLS);
  _xlHdrRow(ws,['المشروع','الوارد (ج)','المصاريف (ج)','الصافي (ج)','القيود'],COLS);
  rows.sort((a,b)=>b.net-a.net).forEach((r,i)=>{
    _xlDataRow(ws,[r.name,r.inc,r.exp,r.net,r.count],i,[null,_XC.PS,_XC.RD,r.net>=0?_XC.PS:_XC.RD,null]);
  });
  _xlTotRow(ws,['الإجمالي',totInc,totExp,totNet,rows.reduce((s,r)=>s+r.count,0)],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='ملخص_دوري_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

