let _repContrData=null,_repClientData=null;
function runContractorReport(){
  const mq=document.getElementById('rContrSel').value.trim();
  const fromStr=document.getElementById('rContrFrom').value;
  const toStr=document.getElementById('rContrTo').value;
  const incArchived=document.getElementById('rContrIncArchived')?.checked||false;
  const el=document.getElementById('repContractorResult');
  if(!mq){el.innerHTML='<div class="rep-empty">اختار مقاول الأول</div>';return;}
  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;
  let filtered=allEntries.filter(e=>{
    if(e.type!=='e')return false;
    if(mq==='__ALL__'?!e.contractor:e.contractor!==mq)return false;
    if(!incArchived){
      const proj=allProjectsMap[e.project_id];
      if(proj&&proj.archived)return false;
    }
    return true;
  });
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});
  filtered.sort((a,b)=>(parseDt(a.entry_date)||0)-(parseDt(b.entry_date)||0));
  const total=filtered.reduce((s,e)=>s+e.amount,0);
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  if(!filtered.length){el.innerHTML='<div class="rep-empty">لا توجد قيود لهذا المقاول في الفترة المحددة</div>';return;}
  // bars by month
  const buckets={};
  filtered.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),exp:0};
    buckets[k].exp+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>r.exp),1);
  el.innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المدفوعات</div><div class="cf-kpi-val" style="color:#C86060">▼ ${fn(total)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">عدد القيود</div><div class="cf-kpi-val" style="color:#7BB8C8">${filtered.length}</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="contrRepChart"></canvas></div>`:''}
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
      <button class="filter-btn" onclick="contractorExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
      <button class="filter-btn is46" onclick="contractorExportPDF()">📕 PDF</button>
    </div>
    <div id="repContrPag_pag"></div>`;
  _repContrData={mq,period,filtered,total};
  _pagInit('repContrPag', filtered, true);
  if(bRows.length>1)_renderBarChart('contrRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [{label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}]
  );
}
function onContrRepSearch(q){
  const dd=document.getElementById('rContrDD');
  if(!dd)return;
  const contractors=[...new Set(allEntries.filter(e=>e.type==='e'&&e.contractor).map(e=>e.contractor))].sort();
  const filtered=q?contractors.filter(c=>c.toLowerCase().includes(q.toLowerCase())):contractors;
  if(!filtered.length){dd.style.display='none';return;}
  dd.style.display='block';
  dd.innerHTML=filtered.map(c=>`<div onclick="selectContrRep('${c.replace(/'/g,"\\'")}')" style="padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:0.5px solid var(--border-faint)" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background=''">${c}</div>`).join('');
}
function selectContrRep(name){
  const inp=document.getElementById('rContrSel');
  const dd=document.getElementById('rContrDD');
  if(inp)inp.value=name;
  if(dd)dd.style.display='none';
  runContractorReport();
}
document.addEventListener('click',function(e){
  if(!e.target.closest('#rContrDD')&&e.target.id!=='rContrSel'){
    const dd=document.getElementById('rContrDD');
    if(dd)dd.style.display='none';
  }
});

function clearContractorReport(){
  document.getElementById('rContrSel').value='';
  document.getElementById('rContrFrom').value='';
  document.getElementById('rContrTo').value='';
  document.getElementById('repContractorResult').innerHTML='';
  _repContrData=null;
}
function contractorExportPDF(){
  if(!_repContrData){runContractorReport();if(!_repContrData)return;}
  const d=_repContrData;
  const canvas=document.getElementById('contrRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const projGroups={};
  d.filtered.forEach(e=>{
    const pid=e.project_id;
    if(!projGroups[pid])projGroups[pid]={name:allProjectsMap[pid]?.name||'—',entries:[],total:0};
    projGroups[pid].entries.push(e);
    projGroups[pid].total+=e.amount;
  });
  let rowNum=0;
  const rows=Object.values(projGroups).map(g=>{
    const entryRows=g.entries.map(e=>{
      rowNum++;
      return `<tr>
        <td class="rep-table-num">${rowNum}</td>
        <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
        <td>${cleanDate(e.entry_date)||'—'}</td>
        <td>${g.name}</td>
        <td>${e.category||'—'}</td>
        <td>${e.description||'—'}</td>
        <td class="amt neg">▼ ${fn(e.amount)} ج</td>
      </tr>`;
    }).join('');
    const subtotal=`<tr style="background:#1D3C2A !important;font-weight:700">
      <td colspan="6" style="text-align:right;padding:8px 10px;color:#D4C49A !important;font-size:12px;background:#1D3C2A !important">إجمالي ${g.name}</td>
      <td style="color:#D4C49A !important;font-weight:700;font-size:12px;padding:8px 6px;background:#1D3C2A !important">▼ ${fn(g.total)} ج</td>
    </tr>
    <tr style="height:6px"><td colspan="7"></td></tr>`;
    return entryRows+subtotal;
  }).join('');
  const html=_pdfOpen('تقرير المقاول — '+d.mq)+
    _pdfHeader('👷 تقرير المقاول','المقاول: '+d.mq+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المدفوعات</div><div class="kpi-val">▼ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${d.filtered.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المصروفات</div>
    <table>
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A"><th style="color:#D4C49A !important">#</th><th style="color:#D4C49A !important">رقم القيد</th><th style="color:#D4C49A !important">التاريخ</th><th style="color:#D4C49A !important">المشروع</th><th style="color:#D4C49A !important">البند</th><th style="color:#D4C49A !important">البيان</th><th style="color:#D4C49A !important">المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="6">الإجمالي الكلي</td><td class="amt neg">▼ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}
function contractorExportExcel(){
  if(!_repContrData){runContractorReport();if(!_repContrData)return;}
  notify('جاري التحميل...','info');
  const d=_repContrData;
  _loadExcelJs(async()=>{
    const wb=new ExcelJS.Workbook();
    const ws=wb.addWorksheet('تقرير المقاول');
    ws.addRow(['م','التاريخ','المشروع','البند','البيان','المبلغ']);
    d.filtered.forEach((e,i)=>ws.addRow([i+1,e.entry_date||'',allProjectsMap[e.project_id]?.name||'',e.category||'',e.description||'',e.amount]));
    ws.addRow(['','','','','الإجمالي',d.total]);
    const buf=await wb.xlsx.writeBuffer();
    const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='مقاول_'+d.mq+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    notify('تم التحميل ✅','ok');
  });
}

// ── CLIENT REPORT ──────────────────────────────
