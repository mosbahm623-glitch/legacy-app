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
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Cairo',Arial,sans-serif;direction:rtl;background:#E8E4DC;color:#1a1a1a}
  .page{background:#fff;max-width:900px;margin:0 auto;position:relative;overflow:hidden}
  @media print{.no-print{display:none!important}body{background:#fff}.page{max-width:100%}}
  /* ── COVER ── */
  .cover{background:#1D3C2A;padding:44px 48px 36px;position:relative;overflow:hidden}
  .cover::before{content:'';position:absolute;top:-60px;left:-60px;width:340px;height:340px;border-radius:50%;background:rgba(200,169,110,.08)}
  .cover::after{content:'';position:absolute;bottom:-40px;right:-40px;width:220px;height:220px;border-radius:50%;background:rgba(200,169,110,.06)}
  .cover-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
  .brand{display:flex;align-items:center;gap:12px}
  .brand-icon{width:48px;height:48px;background:#C8A96E;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px}
  .brand-text h2{font-size:20px;font-weight:900;color:#fff;line-height:1.1}
  .brand-text p{font-size:11px;color:rgba(255,255,255,.55);margin-top:2px}
  .cover-date{text-align:left;color:rgba(255,255,255,.6);font-size:11px;line-height:1.7}
  .cover-main{position:relative;z-index:1}
  .cover-label{font-size:11px;font-weight:600;color:#C8A96E;letter-spacing:2px;margin-bottom:8px}
  .cover-title{font-size:34px;font-weight:900;color:#fff;line-height:1.15;margin-bottom:14px}
  .cover-title span{color:#C8A96E}
  .cover-meta{display:flex;gap:20px;flex-wrap:wrap}
  .cover-meta-item{display:flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.75)}
  .gold-bar{height:5px;background:linear-gradient(90deg,#C8A96E,#E8D5A8,#C8A96E)}
  /* ── BODY ── */
  .body{padding:36px 48px}
  /* ── KPI CARDS ── */
  .kpis{display:grid;gap:14px;margin-bottom:36px}
  .kpis-3{grid-template-columns:1fr 1fr 1fr}
  .kpis-2{grid-template-columns:1fr 1fr}
  .kpis-4{grid-template-columns:1fr 1fr 1fr 1fr}
  .kpi{border-radius:12px;padding:18px 20px;position:relative;overflow:hidden}
  .kpi::after{content:'';position:absolute;bottom:-16px;left:-16px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.1)}
  .kpi-lbl{font-size:10px;font-weight:600;opacity:.8;letter-spacing:1px;margin-bottom:6px}
  .kpi-val{font-size:20px;font-weight:900;line-height:1.1}
  .kpi-inc{background:#1D3C2A;color:#fff}
  .kpi-exp{background:#C0392B;color:#fff}
  .kpi-adv{background:#1A5276;color:#fff}
  .kpi-net-pos{background:#1D3C2A;color:#fff}
  .kpi-net-neg{background:#C0392B;color:#fff}
  .kpi-neutral{background:#f5f0e8;border:1px solid #ddd8ce;color:#333}
  /* ── SECTION HEADER ── */
  .sec-ttl{display:flex;align-items:center;gap:10px;margin-bottom:14px;margin-top:32px;font-size:14px;font-weight:800;color:#1D3C2A;padding-bottom:8px;border-bottom:2px solid #ddd8ce}
  .sec-ttl::before{content:'';display:block;width:4px;height:22px;background:#C8A96E;border-radius:2px;flex-shrink:0}
  .sec-ttl-bar{width:4px;height:22px;background:#C8A96E;border-radius:2px;flex-shrink:0}
  .sec-ttl h3{font-size:14px;font-weight:800;color:#1D3C2A}
  .sec-ttl .cnt{font-size:11px;background:#1D3C2A;color:#fff;padding:2px 8px;border-radius:20px;margin-right:auto}
  /* ── TABLE ── */
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px}
  thead tr{background:#1D3C2A}
  th{color:#C8A96E;padding:10px 12px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.3px}
  td{padding:9px 12px;border-bottom:1px solid #ddd8ce;vertical-align:middle;color:#1a1a1a}
  tr:nth-child(even) td{background:#f8f6f1}
  tfoot tr{background:#1D3C2A}
  tfoot td{padding:10px 12px;font-weight:800;font-size:12px;border:none;color:#C8A96E}
  /* ── BADGES ── */
  .b{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}
  .b-i{background:#e8f5e9;color:#2D5A3D}
  .b-e{background:#fdecea;color:#C0392B}
  .b-pay{background:#e8f5e9;color:#2D5A3D}
  .b-work{background:#eaf2fb;color:#1A5276}
  .b-mat{background:#fff8e1;color:#E65100}
  /* ── AMOUNTS ── */
  .amt{white-space:nowrap;font-weight:700}
  .pos{color:#2D5A3D}.neg{color:#C0392B}
  /* ── BAR ── */
  .bar-wrap{display:flex;align-items:center;gap:6px}
  .bar-track{flex:1;height:6px;background:#eae6dc;border-radius:3px;overflow:hidden}
  .bar-fill{height:100%;background:linear-gradient(90deg,#C0392B,#E74C3C);border-radius:3px}
  .bar-pct{font-size:10px;color:#888;min-width:32px;text-align:left}
  /* ── WATERMARK ── */
  .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(29,60,42,.04);pointer-events:none;letter-spacing:4px;z-index:0;white-space:nowrap}
  /* ── CHART ── */
  .chart-wrap{width:100%;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #eee}
  .chart-wrap img{width:100%;max-height:240px;object-fit:contain;display:block}
  /* ── FOOTER ── */
  .ftr{margin-top:32px;padding-top:16px;border-top:2px solid #ddd8ce;display:flex;justify-content:space-between;align-items:center}
  .ftr-brand{font-size:12px;font-weight:800;color:#1D3C2A;margin-bottom:3px}
  .ftr-sub{font-size:10px;color:#777}
  .ftr-stamp{background:#1D3C2A;color:#C8A96E;padding:4px 14px;border-radius:6px;font-size:11px;font-weight:700}
`;

function _pdfHeader(title,subtitle){
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  // extract project name from title (e.g. "📁 مشروع هشام" -> "هشام")
  const cleanTitle=title.replace(/^[^\u0600-\u06FF]*/,'').trim();
  return `<div class="cover">
    <div class="cover-top">
      <div class="brand">
        <div class="brand-icon">🏗️</div>
        <div class="brand-text">
          <h2>Legacy Fine Touch</h2>
          <p>نظام إدارة المشاريع الإنشائية</p>
        </div>
      </div>
      <div class="cover-date">تاريخ الإصدار: ${now}</div>
    </div>
    <div class="cover-main">
      <div class="cover-label">تقرير</div>
      <div class="cover-title"><span>${cleanTitle}</span></div>
      <div class="cover-meta">
        <div class="cover-meta-item">👷 المهندس محمد شكري — 01099808939</div>
        <div class="cover-meta-item">🧾 محاسب: محمود مصباح — 01114892670</div>
        ${subtitle?`<div class="cover-meta-item">📅 ${subtitle}</div>`:''}
      </div>
    </div>
  </div>
  <div class="gold-bar"></div>
  <div class="body">`;
}
function _pdfFooter(){
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  return `<div class="ftr">
    <div>
      <div class="ftr-brand">Legacy Fine Touch</div>
      <div class="ftr-sub">تم الإنشاء: ${now} — هذا التقرير سري وخاص بالمشروع</div>
    </div>
    <div class="ftr-stamp">✓ معتمد</div>
  </div>
  </div>`; // close .body
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

