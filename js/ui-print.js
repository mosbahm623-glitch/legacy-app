function openPrintWindow(html){
  // inject html2pdf script + download button into the html
  const withPdf=html.replace('</head>',
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script></head>`
  ).replace('<body',
    `<body`
  ).replace(
    /(<button[^>]*onclick="window\.close[^"]*"[^>]*>.*?<\/button>)/,
    `$1 <button onclick="downloadAsPdf()" style="padding:8px 18px;background:#1D3C2A;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:700;">⬇ تحميل PDF</button>`
  );
  const w=window.open('','_blank');
  if(w){
    w.document.open();
    w.document.write(withPdf);
    w.document.write(`<script>
      function downloadAsPdf(){
        const btn=document.querySelector('[onclick="downloadAsPdf()"]');
        if(btn)btn.style.display='none';
        const title=document.title||'تقرير';
        html2pdf().set({
          margin:8,
          filename:title+'.pdf',
          image:{type:'jpeg',quality:0.98},
          html2canvas:{scale:2,useCORS:true,direction:'rtl'},
          jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
        }).from(document.body).save().then(()=>{
          if(btn)btn.style.display='';
        });
      }
    <\/script>`);
    w.document.close();
  } else {
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='report.html';
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
}

async function downloadDashPDF(){try{
  const d=window._lastFilterData;
  if(!d){notify('شغّل الفلتر أولاً','warn');return;}
  // Simple HTML print to PDF
  const rows=d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).map(e=>{
    const proj=allProjectsMap[e.project_id];
    const color=e.type==='i'?'var(--primary-btn)':'var(--danger)';
    return `<tr>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
      <td>${cleanDate(e.entry_date)}</td>
      <td style="color:${color};font-weight:700">${e.type==='i'?'وارد':'مصروف'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||''}</td>
      <td style="color:${color};font-weight:700;text-align:left">${e.type==='i'?'▲':'▼'} ${fn(e.amount)} ج</td>
      <td>${proj?.name||''}</td>
    </tr>`;
  }).join('');
  const html=_pdfOpen('تقرير')+
    _pdfHeader('📁 '+d.projName,'📅 '+d.period)+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.exp)} ج</div></div>
      <div class="kpi ${d.bal>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي الرصيد</div><div class="kpi-val">${d.bal>=0?'▲':'▼'} ${fn(Math.abs(d.bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>البند</th><th>البيان</th><th>المبلغ</th><th>المشروع</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}catch(_e){notify('⚠️ خطأ في تصدير PDF','er');}}

// ══════════════════════════════════════════
// ██ EXCEL HELPERS ══════════════════════════════════
//  ADVANCE DATE FILTER
// ══════════════════════════════════════════
let _advFilteredEntries=null;

function runAdvFilter(){
  const fromStr=document.getElementById('advFDateFrom').value;
  const toStr=document.getElementById('advFDateTo').value;
  if(!fromStr&&!toStr){clearAdvFilter();return;}

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;

  const allE=window._curAdvEntries||[];
  let filtered=allE;
  if(from)filtered=filtered.filter(e=>{const d=pdt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=pdt(e.entry_date);return d&&d<=to;});

  _advFilteredEntries=filtered;
  const total=filtered.reduce((s,e)=>s+e.amount,0);

  const ae=document.getElementById('advEntries');
  ae.innerHTML=`<div class="report-adv-section">
    <span>📅 ${fromStr||'البداية'} → ${toStr||'اليوم'} · ${filtered.length} قيد</span>
    <span style="font-weight:700;color:#C86060">▼ ${fn(total)} ج</span>
  </div>
  ${filtered.length===0?'<div class="emp">لا يوجد مصروفات في هذه الفترة</div>':
    filtered.map(e=>`<div class="rw">
      <span>${e.entry_date||'—'}</span>
      <span>${e.category||'—'}</span>
      <span style="color:#aaa">${e.description||''}</span>
      <span style="color:var(--danger-soft);font-weight:700">▼ ${fn(e.amount)} ج</span>
    </div>`).join('')}`;
}

function clearAdvFilter(){
  document.getElementById('advFDateFrom').value='';
  document.getElementById('advFDateTo').value='';
  _advFilteredEntries=null;
  loadAdvDetail();
}

async function downloadAdvReport(){
  const entries=_advFilteredEntries||window._curAdvEntries||[];
  if(!entries.length){notify('لا يوجد بيانات للتحميل','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(typeof ExcelJS==='undefined'){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    let installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}catch(e2){}
    const totalGiven=installs.reduce((s,i)=>s+i.amount,0);
    const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
    const remaining=totalGiven-totalSpent;
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('العهدة',{views:[{rightToLeft:true}]});
    const COLS=5;ws.columns=[{width:14},{width:18},{width:28},{width:22},{width:16}];
    _xlHeader(ws,'💼 تقرير عهدة: '+(curAdv?.person_name||'—'),'دفعات: '+fn(totalGiven)+' ج  |  صرف: '+fn(totalSpent)+' ج  |  متبقي: '+fn(remaining)+' ج',COLS);
    // KPI row
    ws.addRow([]);ws.lastRow.height=6;
    const kpiR=ws.rowCount+1;
    ws.addRow(['إجمالي الدفعات: '+fn(totalGiven)+' ج','','إجمالي الصرف: '+fn(totalSpent)+' ج','','المتبقي: '+fn(remaining)+' ج']);
    ws.mergeCells('A'+kpiR+':B'+kpiR);ws.mergeCells('C'+kpiR+':D'+kpiR);
    [[1,_XC.INFOL,_XC.BL],[3,_XC.LR,_XC.RD],[5,remaining>=0?_XC.LP:_XC.LR,remaining>=0?_XC.PS:_XC.RD]].forEach(([col,bg,fg])=>{
      const c=ws.getCell(kpiR,col);_xF(c,bg);_xT(c,fg,11,true);_xA(c,'center');
      c.border={bottom:{style:'medium',color:{argb:_XC.G1}}};
    });
    ws.getRow(kpiR).height=26;
    ws.addRow([]);ws.lastRow.height=6;
    _xlHdrRow(ws,['التاريخ','البند','البيان','المشروع','المبلغ (ج)'],COLS);
    const sorted=[...entries].sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
    sorted.forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      _xlDataRow(ws,[e.entry_date||'—',e.category||'—',e.description||'—',proj?.name||'—',e.amount],i,[null,null,null,null,_XC.RD]);
    });
    _xlTotRow(ws,['إجمالي المصروفات','','','',totalSpent],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='عهدة_'+(curAdv?.person_name||'report')+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم التحميل','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function downloadAdvPDF(){
  const entries=_advFilteredEntries||window._curAdvEntries||[];
  if(!entries.length){notify('لا يوجد بيانات للتحميل','warn');return;}
  setSav('⏳ جاري تجهيز PDF...','ng');
  try{
    let installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}catch(e2){console.warn('installs PDF:',e2);} // صامت متعمد
    const totalGiven=installs.reduce((s,i)=>s+i.amount,0);
    const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
    const remaining=totalGiven-totalSpent;
    const sorted=[...entries].sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
    const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
    const rows=sorted.map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      return `<tr>
        <td style="text-align:center;color:#888">${i+1}</td>
        <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
        <td style="font-size:10px">${cleanDate(e.entry_date)}</td>
        <td style="font-weight:700;color:#922B21">${e.category||'—'}</td>
        <td style="color:#555">${e.description||'—'}</td>
        <td style="color:var(--text-soft);font-size:10px">${proj?.name||'—'}</td>
        <td class="amt neg">${Number(e.amount).toLocaleString('en-US')} ج</td>
      </tr>`;
    }).join('');
    const instRows=installs.map(i=>`<tr>
      <td>${i.note||'دفعة'}</td>
      <td>${i.inst_date||'—'}</td>
      <td class="amt pos">${Number(i.amount).toLocaleString('en-US')} ج</td>
    </tr>`).join('');
    const html=_pdfOpen('تقرير عهدة - '+curAdv?.person_name)+
      _pdfHeader('💼 تقرير عهدة: '+(curAdv?.person_name||'—'),'🗓 '+now+' · '+sorted.length+' قيد مصروف · Legacy Fine Touch')+
      `<div class="kpis kpis-3">
        <div class="kpi kpi-adv"><div class="kpi-lbl">إجمالي الدفعات</div><div class="kpi-val">${Number(totalGiven).toLocaleString('en-US')} ج</div></div>
        <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي الصرف</div><div class="kpi-val">${Number(totalSpent).toLocaleString('en-US')} ج</div></div>
        <div class="kpi ${remaining>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">الرصيد المتبقي</div><div class="kpi-val">${Number(remaining).toLocaleString('en-US')} ج</div></div>
      </div>
      <div class="sec-ttl">💸 مصروفات العهدة (${sorted.length} قيد)</div>
      <table>
        <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>البند</th><th>البيان</th><th>المشروع</th><th>المبلغ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt neg">${Number(totalSpent).toLocaleString('en-US')} ج</td></tr></tfoot>
      </table>
      ${installs.length?`<div class="sec-ttl">💰 الدفعات (${installs.length} دفعة)</div>
      <table>
        <thead><tr><th>البيان</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
        <tbody>${instRows}</tbody>
        <tfoot><tr><td colspan="2">الإجمالي</td><td class="amt pos">${Number(totalGiven).toLocaleString('en-US')} ج</td></tr></tfoot>
      </table>`:''}`+
      _pdfFooter()+_pdfClose();
    openPrintWindow(html);
    setSav('✅ تم فتح التقرير','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  REPORTS SCREEN
// ══════════════════════════════════════════
let repTab='proj', _repFilterData=null, _repAdvData=null, _curReport=null;

// ── REPORTS HUB ────────────────────────────────
