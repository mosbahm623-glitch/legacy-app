async function downloadDashReport(){
  const d=window._lastFilterData;
  if(!d){notify('شغّل الفلتر أولاً','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(typeof ExcelJS==='undefined'){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير',{views:[{rightToLeft:true}]});
    const COLS=6;ws.columns=[{width:14},{width:12},{width:16},{width:26},{width:16},{width:20}];
    _xlHeader(ws,'📊 تقرير: '+d.projName,'الفترة: '+d.period+'  |  وارد: '+fn(d.inc)+' ج  |  مصاريف: '+fn(d.exp)+' ج  |  رصيد: '+fn(d.bal)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','النوع','البند','البيان','المبلغ (ج)','المشروع'],COLS);
    d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const isI=e.type==='i';
      _xlDataRow(ws,[e.entry_date||'',isI?'▲ وارد':'▼ مصروف',e.category||'',e.description||'',e.amount,proj?.name||''],i,[null,isI?_XC.PS:_XC.RD,null,null,isI?_XC.PS:_XC.RD,null]);
    });
    _xlTotRow(ws,['','','','الرصيد',d.bal,''],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='تقرير_'+d.projName+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم التحميل','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ██ PDF HELPERS ════════════════════════════════════
// ═══════════════════════════════════════════════════
//  UNIFIED REPORT TEMPLATE HELPERS
// ═══════════════════════════════════════════════════
const _PDF_CSS=`
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;direction:rtl;background:var(--bg-gray);color:#1a1a1a}
  .page{background:var(--bg-pure);max-width:960px;margin:0 auto;padding:36px 40px;min-height:100vh}
  @media print{.no-print{display:none!important}}
  /* ── HEADER ── */
  .hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:4px solid #1D3C2A;margin-bottom:24px}
  .hdr-left h1{font-size:24px;font-weight:900;color:var(--primary);margin-bottom:3px}
  .hdr-left .sub{font-size:12px;color:var(--text-soft);line-height:1.6}
  .hdr-badges{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .hdr-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block}
  .hdr-badge.owner{background:var(--success-glow);color:var(--primary-btn);border:1px solid #C8E6C9}
  .hdr-badge.acct{background:var(--info-bg);color:var(--info);border:1px solid #BBDEFB}
  .hdr-logo{height:64px;object-fit:contain}
  /* ── KPI CARDS ── */
  .kpis{display:grid;gap:12px;margin-bottom:24px}
  .kpis-3{grid-template-columns:1fr 1fr 1fr}
  .kpis-2{grid-template-columns:1fr 1fr}
  .kpis-4{grid-template-columns:1fr 1fr 1fr 1fr}
  .kpi{border-radius:10px;padding:14px 16px;text-align:center;border:1px solid}
  .kpi-lbl{font-size:10px;font-weight:700;margin-bottom:7px;letter-spacing:.4px;text-transform:uppercase}
  .kpi-val{font-size:22px;font-weight:900;font-family:Arial,sans-serif}
  .kpi-inc{background:var(--success-glow);border-color:var(--success-muted);color:#1E6B3A}
  .kpi-exp{background:var(--danger-pale);border-color:var(--danger-tint);color:#922B21}
  .kpi-adv{background:var(--info-bg);border-color:var(--info-muted);color:#185FA5}
  .kpi-net-pos{background:var(--success-glow);border-color:var(--success-muted);color:#1E6B3A}
  .kpi-net-neg{background:var(--danger-pale);border-color:var(--danger-tint);color:#922B21}
  .kpi-neutral{background:var(--bg-pure);border-color:var(--border-light);color:#555}
  /* ── SECTION TITLE ── */
  .sec-ttl{font-size:13px;font-weight:800;color:var(--primary);padding:10px 0;border-bottom:2px solid #e0e0e0;margin-bottom:0;display:flex;align-items:center;gap:6px}
  /* ── TABLE ── */
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px}
  thead tr{background:#1D3C2A}
  th{color:var(--accent);padding:10px 8px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.3px}
  th:last-child{text-align:center}
  td{padding:8px 8px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
  tr:nth-child(even) td{background:#fafaf8}
  tr:last-child td{border-bottom:none}
  tfoot tr{background:#f5f0e8}
  tfoot td{padding:9px 8px;font-weight:800;border-top:2px solid #1D3C2A}
  /* ── BADGES ── */
  .b{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}
  .b-i{background:var(--success-glow);color:#1E6B3A}.b-e{background:var(--danger-pale);color:#922B21}
  .b-pay{background:var(--success-glow);color:#1E6B3A}.b-work{background:var(--info-bg);color:#185FA5}.b-mat{background:var(--warning-pale);color:#E65100}
  /* ── AMOUNTS ── */
  .amt{white-space:nowrap;font-weight:700}
  .pos{color:#1E6B3A}.neg{color:#922B21}
  /* ── WATERMARK ── */
  .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(29,60,42,.04);pointer-events:none;letter-spacing:4px;z-index:0;white-space:nowrap}
  /* ── CHART ── */
  .chart-wrap{width:100%;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #eee}
  .chart-wrap img{width:100%;max-height:240px;object-fit:contain;display:block}
  /* ── FOOTER ── */
  .ftr{margin-top:28px;padding-top:16px;border-top:2px solid #eeeeee;display:flex;justify-content:space-between;align-items:center;gap:16px}
  .ftr-logo{height:36px;opacity:.4;flex-shrink:0}
  .ftr-mid{text-align:center;flex:1}
  .ftr-company{font-size:12px;font-weight:800;color:var(--primary);margin-bottom:4px}
  .ftr-owner{font-size:10px;color:var(--primary-btn);font-weight:600;margin-bottom:2px}
  .ftr-acct{font-size:10px;color:var(--info);font-weight:600;background:var(--info-bg);display:inline-block;padding:2px 10px;border-radius:20px;margin-bottom:3px}
  .ftr-date{font-size:9px;color:var(--text-faint);margin-top:2px}
  .ftr-conf{font-size:9px;color:var(--border-mid);text-align:left;line-height:1.5;flex-shrink:0}
  @media print{body{background:#fff}.page{padding:20px;max-width:100%}button{display:none}.wm{display:block}}
`;

function _pdfHeader(title,subtitle){
  return `<div class="hdr">
    <div class="hdr-left">
      <h1>${title}</h1>
      <div class="sub">${subtitle}</div>
      <div class="hdr-badges">
        <span class="hdr-badge owner">🏗 المهندس محمد شكري &nbsp;|&nbsp; 📞 01099808939</span>
        <span class="hdr-badge acct">✍ محاسب: محمود مصباح &nbsp;|&nbsp; 📞 01114892670</span>
      </div>
    </div>
    <img src="logo.jpg" class="hdr-logo">
  </div>`;
}
function _pdfFooter(){
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  return `<div class="ftr">
    <img src="logo.jpg" class="ftr-logo">
    <div class="ftr-mid">
      <div class="ftr-company">Legacy Fine Touch</div>
      <div class="ftr-owner">🏗 المهندس محمد شكري &nbsp;|&nbsp; 📞 01099808939</div>
      <div class="ftr-acct">✍ محاسب: محمود مصباح &nbsp;|&nbsp; 📞 01114892670</div>
      <div class="ftr-date">تم الإنشاء: ${now}</div>
    </div>
    <div class="ftr-conf">سري وخاص<br>بالشركة</div>
  </div>`;
}
function _pdfOpen(title){
  return `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${title}</title><style>${_PDF_CSS}</style></head><body><div class="wm">LEGACY</div><div class="page">`;
}
function _pdfClose(){
  return `</div><div style="position:fixed;top:10px;left:10px;z-index:9999;print-color-adjust:exact" class="no-print"><button onclick="window.close()" style="background:#1D3C2A;color:#D4C49A;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Cairo,sans-serif">✕ إغلاق</button><button onclick="window.print()" style="background:#D4C49A;color:#1D3C2A;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;margin-right:6px;font-family:Cairo,sans-serif">🖨 طباعة</button></div><script>window.onload=()=>{};<\/script></body></html>`;
}

// ═══════════════════════════════════════════════════════════════
//  UNIFIED EXCEL STYLE — mirrors PDF template
// ═══════════════════════════════════════════════════════════════
const _XC={
  G1:'FF1D3C2A', G2:'FF2A5C38', G5:'FFEDF5EE', G6:'FFF4F8F5',
  BEIGE:'FFD4C49A', BEIGE2:'FFE8D8B0', BEIGE3:'FFF5EDDB', BEIGE4:'FFFAF5EC',
  BL:'FF1A3A5C', LB:'FFD6E8F7',
  RD:'FF922B21', DR:'FF6E1C1C', LR:'FFFAE5E5',
  PS:'FF1E6B3A', LP:'FFE2F5EA',
  MQ:'FFA05F1A', LM:'FFFDE8C8',
  WH:'FFFFFFFF', GR:'FF888888', GR2:'FFF5F5F5', GR3:'FFFAFAF8',
  INFO:'FF185FA5', INFOL:'FFE3F0FF',
};
function _xF(c,argb){c.fill={type:'pattern',pattern:'solid',fgColor:{argb:argb}};}
function _xT(c,argb,size,bold,italic){c.font={color:{argb:argb},size:size||10,bold:!!bold,italic:!!italic,name:'Cairo'};}
function _xA(c,h,v){c.alignment={horizontal:h||'right',vertical:v||'middle',readingOrder:'rightToLeft',wrapText:false};}
function _xB(c,style,argb){const b={style:style||'thin',color:{argb:argb||'FFE0E0E0'}};c.border={top:b,bottom:b,left:b,right:b};}
function _xN(c,fmt){c.numFmt=fmt||'#,##0';}

// ── كامل Header (Title + Subtitle bar + empty separator) ──
function _xlHeader(ws,title,subtitle,cols){
  const L=String.fromCharCode(64+cols);
  // R1 — title
  ws.addRow([title]);ws.mergeCells('A1:'+L+'1');
  const r1=ws.getCell('A1');
  _xF(r1,_XC.G1);_xT(r1,_XC.BEIGE,14,true);_xA(r1,'right');
  ws.getRow(1).height=34;
  // R2 — info bar
  const info='✍ محاسب: محمود مصباح  |  📞 01114892670     🏗 المهندس محمد شكري  |  📞 01099808939     📅 '+new Date().toLocaleDateString('ar-EG')+(subtitle?'     |     '+subtitle:'');
  ws.addRow([info]);ws.mergeCells('A2:'+L+'2');
  const r2=ws.getCell('A2');
  _xF(r2,_XC.G5);_xT(r2,_XC.G2,10,true);_xA(r2,'right');
  r2.border={bottom:{style:'medium',color:{argb:_XC.G1}}};
  ws.getRow(2).height=22;
  // R3 — separator
  ws.addRow([]);ws.getRow(3).height=6;
}

// ── Header Row للجدول ──
function _xlHdrRow(ws,headers,cols){
  ws.addRow(headers);
  const r=ws.lastRow;r.height=26;
  for(let i=1;i<=cols;i++){
    const c=r.getCell(i);
    _xF(c,_XC.G2);_xT(c,_XC.WH,10,true);_xA(c,'center');
    c.border={bottom:{style:'medium',color:{argb:_XC.BEIGE}},top:{style:'thin',color:{argb:_XC.G1}},left:{style:'thin',color:{argb:_XC.G1}},right:{style:'thin',color:{argb:_XC.G1}}};
  }
}

// ── Data Row ──
function _xlDataRow(ws,values,idx,colorOverrides){
  ws.addRow(values);
  const r=ws.lastRow;r.height=21;
  const bg=idx%2===0?_XC.WH:_XC.GR3;
  values.forEach((_,i)=>{
    const c=r.getCell(i+1);
    _xF(c,bg);_xT(c,'FF1A1A1A',10);_xA(c,'right');
    c.border={bottom:{style:'thin',color:{argb:'FFF0F0F0'}},right:{style:'thin',color:{argb:'FFF5F5F5'}}};
    if(typeof values[i]==='number'){_xN(c);_xT(c,_XC.G1,10,true);}
    if(colorOverrides&&colorOverrides[i])_xT(c,colorOverrides[i],10,true);
  });
}

// ── Totals Row ──
function _xlTotRow(ws,values,cols){
  ws.addRow(values);
  const r=ws.lastRow;r.height=28;
  for(let i=1;i<=cols;i++){
    const c=r.getCell(i);
    _xF(c,_XC.G1);_xT(c,_XC.BEIGE,11,true);_xA(c,i===1?'right':'center');
    c.border={top:{style:'medium',color:{argb:_XC.BEIGE}},bottom:{style:'medium',color:{argb:_XC.BEIGE}}};
    if(typeof values[i-1]==='number'){_xN(c);}
  }
}

// ── KPI bar (صف ملون تحت الهيدر يعرض الأرقام الرئيسية) ──
function _xlKpiRow(ws,kpis,cols){
  // kpis = [{label,value,color}]
  const L=String.fromCharCode(64+cols);
  const perCell=Math.floor(cols/kpis.length);
  let col=1;
  kpis.forEach((k,i)=>{
    const endCol=i===kpis.length-1?cols:col+perCell-1;
    const startLetter=String.fromCharCode(64+col);
    const endLetter=String.fromCharCode(64+endCol);
    if(startLetter!==endLetter){try{ws.mergeCells(startLetter+ws.rowCount+':'+endLetter+ws.rowCount);}catch(e){}}
    const c=ws.getCell(startLetter+(ws.rowCount));
    c.value=k.label+': '+Number(k.value).toLocaleString('en-US')+' ج';
    _xF(c,k.bgColor||_XC.G5);_xT(c,k.color||_XC.G1,11,true);_xA(c,'center');
    c.border={bottom:{style:'medium',color:{argb:_XC.G2}}};
    col=endCol+1;
  });
}

// ── Footer ──
function _xlFooter(ws,cols){
  ws.addRow([]);ws.lastRow.height=6;
  const L=String.fromCharCode(64+cols);
  ws.addRow(['Legacy Fine Touch  ·  المهندس محمد شكري  |  01099808939  ·  محاسب: محمود مصباح  |  01114892670  ·  سري وخاص بالشركة']);
  ws.mergeCells('A'+ws.rowCount+':'+L+ws.rowCount);
  const f=ws.getCell('A'+ws.rowCount);
  _xF(f,_XC.BEIGE4);_xT(f,_XC.GR,9,false,true);_xA(f,'center');
  ws.lastRow.height=18;
}

// backward-compat wrappers
function _xlAddTitle(ws,title,cols,summary){_xlHeader(ws,title,summary,cols);}
function _xlAddFooter(ws,cols){_xlFooter(ws,cols);}

