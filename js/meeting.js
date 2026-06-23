// ══════════════════════════════════════════
// ██ MEETING VIEW — عرض الاجتماع
// ══════════════════════════════════════════

function fn2(n){return Number(n||0).toLocaleString('en-US');}

function fmtD(s){
  if(!s)return'—';
  const str=String(s).trim();
  if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str))return str;
  if(/^\d{4}-\d{2}-\d{2}/.test(str)){const p=str.substring(0,10).split('-');return p[2]+'/'+p[1]+'/'+p[0];}
  try{const d=new Date(str);if(!isNaN(d))return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();}catch(_){}
  return str;
}

function openMeetingView(){
  const p = curP();
  if(!p){notify('اختار مشروع أولاً','err');return;}

  const inc = pInc();
  const exp = pExp();
  const tInc = inc.reduce((s,e)=>s+e.amount,0);
  const tExp = exp.reduce((s,e)=>s+e.amount,0);
  const bal  = tInc - tExp;
  const pct  = tInc>0?Math.min(100,Math.round(tExp/tInc*100)):0;
  const barColor = pct>90?'#e74c3c':pct>70?'#f39c12':'#1D9E75';

  // تجميع المصاريف بالبنود
  const cats={};
  exp.forEach(e=>{
    const c=e.category||'غير مصنف';
    if(!cats[c])cats[c]=0;
    cats[c]+=e.amount;
  });
  const catsSorted=Object.entries(cats).sort((a,b)=>b[1]-a[1]);

  // آخر 5 حركات
  const last5=[...entries]
    .sort((a,b)=>{
      const da=new Date(a.entry_date||0),db=new Date(b.entry_date||0);
      return db-da||(b.seq||0)-(a.seq||0);
    }).slice(0,5);

  // header
  document.getElementById('mvProjName').textContent='📋 '+p.name;
  document.getElementById('mvDate').textContent='عرض بتاريخ: '+new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});

  // تجميع القيود لكل بند
  const catItems={};
  exp.forEach(e=>{
    const c=e.category||'غير مصنف';
    if(!catItems[c])catItems[c]=[];
    catItems[c].push(e);
  });

  let catIdx=0;
  const catsHtml = catsSorted.map(([cat,amt])=>{
    const p2=tExp>0?Math.round(amt/tExp*100):0;
    const idx=catIdx++;
    const items=(catItems[cat]||[]).map(e=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#fafaf8;border-radius:8px;margin-bottom:4px">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:#1a2e1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.description||cat}</div>
          <div style="font-size:10px;color:#aaa;margin-top:2px">${fmtD(e.entry_date)}</div>
        </div>
        <div style="font-size:13px;font-weight:800;color:#e74c3c;white-space:nowrap;padding-right:8px">▼ ${fn2(e.amount)} ج</div>
      </div>`).join('');

    return`<div style="border-bottom:1px solid #f0ede6;padding:10px 0">
      <div onclick="mvToggleCat(${idx})" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:#1a2e1a">${cat}</div>
          <div style="margin-top:5px;background:#f0ede6;border-radius:4px;height:4px;overflow:hidden">
            <div style="width:${p2}%;height:100%;background:linear-gradient(90deg,#e74c3c,#c0392b);border-radius:4px"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;padding-right:10px">
          <div style="text-align:left">
            <div style="font-size:13px;font-weight:800;color:#e74c3c">▼ ${fn2(amt)} ج</div>
            <div style="font-size:10px;color:#aaa;text-align:center">${p2}%</div>
          </div>
          <span id="mvCatArr${idx}" style="font-size:14px;color:#aaa;transition:transform .3s">⌄</span>
        </div>
      </div>
      <div id="mvCatBody${idx}" style="display:none;margin-top:8px">${items}</div>
    </div>`;
  }).join('');

  const last5Html = last5.map(e=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f0ede6">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:#1a2e1a">${e.description||e.category||'—'}</div>
        <div style="font-size:10px;color:#aaa;margin-top:2px">${fmtD(e.entry_date)}${e.category?' · '+e.category:''}</div>
      </div>
      <div style="font-size:14px;font-weight:800;color:${e.type==='i'?'#1D9E75':'#e74c3c'}">${e.type==='i'?'▲':'▼'} ${fn2(e.amount)} ج</div>
    </div>`).join('');

  document.getElementById('mvBody').innerHTML=`

    <!-- KPI الرئيسية -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="background:#e8f7f0;border:1.5px solid #a8dcc2;border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">📈 إجمالي الوارد</div>
        <div style="font-size:18px;font-weight:800;color:#1D9E75">▲ ${fn2(tInc)} ج</div>
      </div>
      <div style="background:#fef0f0;border:1.5px solid #f5c0c0;border-radius:14px;padding:16px;text-align:center">
        <div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">📉 إجمالي المصاريف</div>
        <div style="font-size:18px;font-weight:800;color:#e74c3c">▼ ${fn2(tExp)} ج</div>
      </div>
    </div>

    <!-- الرصيد -->
    <div style="background:#fff;border:1.5px solid #e0d8c8;border-radius:14px;padding:18px;text-align:center;margin-bottom:12px">
      <div style="font-size:12px;color:#888;font-weight:600;margin-bottom:8px">💰 صافي الرصيد</div>
      <div style="font-size:26px;font-weight:800;color:${bal>=0?'#1D9E75':'#e74c3c'}">${bal>=0?'▲':'▼'} ${fn2(Math.abs(bal))} ج</div>
    </div>

    <!-- Progress bar -->
    <div style="background:#fff;border-radius:14px;padding:16px;margin-bottom:12px;border:1px solid #e8e3da">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:12px;font-weight:700;color:#5a7a5a">نسبة الصرف من الوارد</span>
        <span style="font-size:14px;font-weight:800;color:${barColor}">${pct}%</span>
      </div>
      <div style="background:#f0ede6;border-radius:20px;height:14px;overflow:hidden">
        <div style="width:${pct}%;height:100%;border-radius:20px;background:linear-gradient(90deg,${barColor},${barColor}cc);transition:width .5s"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:10px;color:#aaa">
        <span>0%</span>
        <span style="color:#f39c12">70% تحذير</span>
        <span style="color:#e74c3c">90% خطر</span>
        <span>100%</span>
      </div>
    </div>

    <!-- معلومات المشروع -->
    <div style="background:#fff;border-radius:14px;padding:16px;margin-bottom:12px;border:1px solid #e8e3da">
      <div style="font-size:12px;font-weight:700;color:#5a7a5a;margin-bottom:10px">📋 معلومات المشروع</div>
      ${p.start_date?`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f2ec;font-size:13px"><span style="color:#888">تاريخ البداية</span><span style="font-weight:700">${fmtD(p.start_date)}</span></div>`:''}
      ${p.close_date?`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f2ec;font-size:13px"><span style="color:#888">تاريخ الإغلاق</span><span style="font-weight:700">${fmtD(p.close_date)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f2ec;font-size:13px"><span style="color:#888">دفعات واردة</span><span style="font-weight:700">${inc.length}</span></div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px"><span style="color:#888">بنود مصاريف</span><span style="font-weight:700">${exp.length}</span></div>
    </div>

    <!-- ملخص البنود -->
    ${catsSorted.length?`
    <div style="background:#fff;border-radius:14px;padding:16px;margin-bottom:12px;border:1px solid #e8e3da">
      <div onclick="mvToggleCats()" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
        <div style="font-size:12px;font-weight:700;color:#5a7a5a">📂 ملخص البنود (${catsSorted.length} بند)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:13px;font-weight:800;color:#e74c3c">▼ ${fn2(tExp)} ج</span>
          <span id="mvCatsArrow" style="font-size:16px;color:#5a7a5a;transition:transform .3s">⌄</span>
        </div>
      </div>
      <div id="mvCatsBody" style="display:none;margin-top:10px">${catsHtml}</div>
    </div>`:''}

    <!-- آخر الحركات -->
    ${last5.length?`
    <div style="background:#fff;border-radius:14px;padding:16px;margin-bottom:12px;border:1px solid #e8e3da">
      <div style="font-size:12px;font-weight:700;color:#5a7a5a;margin-bottom:10px">🕐 آخر الحركات</div>
      ${last5Html}
    </div>`:''}

    <!-- زرار مشاركة -->
    <a href="https://wa.me/?text=${encodeURIComponent('تقرير مشروع '+p.name+'\nhttps://mosbahm623-glitch.github.io/legacy-app/report.html?pid='+p.id)}" target="_blank"
       style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:#25D366;color:#fff;border:none;border-radius:12px;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;margin-bottom:10px">
      📤 مشاركة التقرير عبر واتساب
    </a>
  `;

  document.getElementById('meetingModal').style.display='block';
  document.body.style.overflow='hidden';
}

function closeMeetingView(){
  document.getElementById('meetingModal').style.display='none';
  document.body.style.overflow='';
}

function mvToggleCat(idx){
  const b=document.getElementById('mvCatBody'+idx);
  const a=document.getElementById('mvCatArr'+idx);
  if(!b)return;
  const open=b.style.display==='none';
  b.style.display=open?'block':'none';
  if(a)a.style.transform=open?'rotate(180deg)':'rotate(0)';
}
function mvToggleCats(){
  const b=document.getElementById('mvCatsBody');
  const a=document.getElementById('mvCatsArrow');
  if(!b)return;
  const open=b.style.display==='none';
  b.style.display=open?'block':'none';
  a.style.transform=open?'rotate(180deg)':'rotate(0)';
}
