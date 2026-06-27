function mqAddByIdx(idx){
  const m=window._mqList&&window._mqList[idx];
  if(!m)return;
  mqAddPayment(m.n, m.rows[0]?.category||'');
}

function mqPrintReport(idx){
  const m=window._mqList&&window._mqList[idx];
  if(!m)return;
  const proj=allProjects?.find(p=>p.id===curPid);
  const projName=proj?.name||'—';
  const fn2=n=>Number(n).toLocaleString('en-US');
  const total=m.pay+m.work+m.mat+m.other;
  const rows=m.rows.sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
  const etLbl={'payment':'دفعة','work':'أعمال','material':'مصنعيات'};
  const today=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  const trs=rows.map((e,i)=>`
    <tr>
      <td style="text-align:center;color:#888">${i+1}</td>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
      <td style="text-align:center">${e.entry_date||'—'}</td>
      <td>${e.entry_type?etLbl[e.entry_type]||'—':'—'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||'—'}</td>
      <td class="rep-adv-amount-cell">${fn2(e.amount)} ج</td>
    </tr>`).join('');
  const html=_pdfOpen('تقرير مقاول - '+m.n)+
    _pdfHeader('👷 حساب المقاول: '+m.n,'📁 مشروع: '+projName+' · 🗓 '+today)+
    `<div class="kpis kpis-4">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المسحوب</div><div class="kpi-val">${fn2(total)} ج</div></div>
      <div class="kpi kpi-inc"><div class="kpi-lbl">💰 دفعات</div><div class="kpi-val">${fn2(m.pay)} ج</div></div>
      <div class="kpi kpi-adv"><div class="kpi-lbl">🔨 أعمال</div><div class="kpi-val">${fn2(m.work)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${rows.length}</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود</div>
    <table>
      <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>النوع</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>
        ${trs}
      </tbody>
      <tfoot><tr><td colspan="5">الإجمالي الكلي</td><td class="amt">${fn2(total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

// Quick payment from contractor tab
let _mqName='',_mqCat='';
function mqAddPayment(name,cat){
  _mqName=name;_mqCat=cat;
  document.getElementById('mqPayName').textContent='إضافة دفعة';
  const sub=document.getElementById('mqPaySubName');if(sub)sub.textContent=name;
  document.getElementById('mqPayAmt').value='';
  document.getElementById('mqPayDesc').value='دفعة';
  document.getElementById('mqPayDt').value=ts();
  document.getElementById('mqPayCat').value=cat||'';
  document.getElementById('mqPayEtype').value='payment';
  document.getElementById('mqPayMsg').textContent='';
  document.getElementById('mqPayModal').style.display='flex';
  setTimeout(()=>document.getElementById('mqPayAmt').focus(),100);
}
function closeMqPay(){document.getElementById('mqPayModal').style.display='none';}
async function saveMqPay(){
  const a=parseFloat(document.getElementById('mqPayAmt').value);
  const desc=document.getElementById('mqPayDesc').value.trim();
  const dt=fd(document.getElementById('mqPayDt').value);
  const cat=document.getElementById('mqPayCat').value.trim();
  const etype=document.getElementById('mqPayEtype').value;
  const msg=document.getElementById('mqPayMsg');
  if(isNaN(a)||a<=0){msg.textContent='⚠️ ادخل المبلغ';msg.style.color='var(--danger-alt)';return;}
  if(!cat){msg.textContent='⚠️ ادخل البند';msg.style.color='var(--danger-alt)';return;}
  msg.textContent='⏳ جاري الحفظ...';msg.style.color='var(--text-soft)';
  // جيب آخر seq من Supabase مباشرة عشان نضمن التفرد
  let nextSeq=20260001;
  try{
    const last=await sb('entries?select=seq&order=seq.desc&limit=1');
    const lastSeq=last&&last.length?Number(last[0].seq||20260000):20260000;
    nextSeq=lastSeq<20260000?20260001:lastSeq+1;
  }catch(e){console.warn('seq fetch:',e);} // صامت متعمد
  const entry={id:uid_(),project_id:curPid,type:'e',amount:a,description:desc||'دفعة',entry_date:dt,category:cat,contractor:_mqName,entry_type:etype,seq:uRole==='admin'?nextSeq:0,created_by:uid};
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
      msg.textContent='✅ تم الحفظ';msg.style.color='var(--primary-btn)';
      setTimeout(()=>{closeMqPay();rp();},800);
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      msg.textContent='⏳ في انتظار موافقة الأدمن';msg.style.color='var(--warning-text)';
      setTimeout(()=>closeMqPay(),1200);
    }
  }catch(e){setSav('❌ '+friendlyError(e),'er');msg.style.color='var(--danger-alt)';}
}

window.onload=()=>{
  const _nav=document.getElementById('mobBottomNav');
  if(_nav)_nav.style.display='none';
  checkSaved();
};

let curEditEtype=null;
function onEditMqInput(v){
  const wrap=document.getElementById('editEtypeWrap');
  if(v.trim()){wrap.classList.add('show');if(!curEditEtype)curEditEtype='payment';}
  else{wrap.classList.remove('show');curEditEtype=null;}
}
function setEditEtype(t,btn){
  curEditEtype=t;
  ['payment','work','material'].forEach(id=>{document.getElementById('eEt-'+id).classList.remove('on');});
  btn.classList.add('on');
}
function setCatView(v,btn){
  document.getElementById('catListView').style.display=v==='list'?'block':'none';
  document.getElementById('catMqView').style.display=v==='mq'?'block':'none';
  ['cvList','cvMq'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.style.background='var(--bg-pure)';b.style.color='var(--text-hint)';b.style.borderColor='var(--border-warm)';}
  });
  if(btn){btn.style.background='var(--info-bg)';btn.style.color='var(--info)';btn.style.borderColor='var(--info)';}
}
let curEtype='payment';
let descDDOpen=false;

function onDescInput(v){
  const dd=document.getElementById('descDD');
  if(!dd)return;
  const q=v.trim();
  if(!q){hideDDDesc();return;}
  // جيب البيانات من كل المشاريع مرتبة من الأكثر تكراراً
  const freq={};
  allEntries.filter(e=>e.description&&e.description.trim()).forEach(e=>{
    const d=e.description.trim();
    if(d.includes(q)||d.toLowerCase().includes(q.toLowerCase()))
      freq[d]=(freq[d]||0)+1;
  });
  const results=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!results.length){hideDDDesc();return;}
  dd.style.display='block';
  descDDOpen=true;
  document.getElementById('descList').innerHTML=results.map(([d,n])=>`
    <div class="cat-opt" onclick="selectDesc('${d.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">
      <span class="cat-icon">📝</span>
      <span style="flex:1">${d}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
}

function selectDesc(val){
  const inp=document.getElementById('id_');
  if(inp)inp.value=val;
  hideDDDesc();
}

function hideDDDesc(){
  descDDOpen=false;
  const dd=document.getElementById('descDD');
  if(dd)dd.style.display='none';
}

document.addEventListener('click',function(e){
  const dw=document.getElementById('descWrap');
  if(dw&&!dw.contains(e.target))hideDDDesc();
});

function getProjectMqs(q){
  const projEntries=allEntries.filter(e=>e.contractor);
  const freq={};
  projEntries.forEach(e=>{freq[e.contractor]=(freq[e.contractor]||0)+1;});
  let mqs=Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([c,n])=>({c,n}));
  if(q)mqs=mqs.filter(x=>x.c.includes(q)||x.c.toLowerCase().includes(q.toLowerCase()));
  return mqs;
}

function renderMqOpts(q){
  const list=document.getElementById('mqList');if(!list)return;
  const mqs=getProjectMqs(q);
  let html='';
  if(mqs.length){
    html+=mqs.map(({c,n})=>`<div class="cat-opt" onclick="selectMq('${c.replace(/'/g,"\\'")}')">
      <span class="cat-icon">👷</span>
      <span style="flex:1">${c}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
  }
  const typed=(document.getElementById('iq')?.value||'').trim();
  const exact=mqs.some(x=>x.c===typed);
  if(typed&&!exact){
    html+=`<div class="cat-opt cat-opt-new" onclick="selectMq('${typed.replace(/'/g,"\\'")}')">
      <span class="cat-icon">➕</span>
      <span>إضافة: <b>${typed}</b></span>
    </div>`;
  }
  if(!html)html='<div class="cat-empty-msg">لا يوجد مقاولين بعد</div>';
  list.innerHTML=html;
}

function toggleMqDD(){
  mqDDOpen=!mqDDOpen;
  const dd=document.getElementById('mqDD');if(!dd)return;
  dd.style.display=mqDDOpen?'block':'none';
  if(mqDDOpen)renderMqOpts('');
}

function hideMqDD(){
  mqDDOpen=false;
  const dd=document.getElementById('mqDD');if(dd)dd.style.display='none';
}

function selectMq(name){
  document.getElementById('iq').value=name;
  hideMqDD();
  // اظهر أزرار نوع العمل
  const w=document.getElementById('etypeWrap');
  if(w)w.classList.add('show');
}

function onMqInput(v){
  const w=document.getElementById('etypeWrap');
  if(v.trim()){
    w.classList.add('show');
    const dd=document.getElementById('mqDD');
    if(dd){dd.style.display='block';mqDDOpen=true;}
    renderMqOpts(v);
  }else{
    w.classList.remove('show');
    curEtype='payment';
    hideMqDD();
  }
}

document.addEventListener('click',function(e){
  const mw=document.getElementById('mqWrap');
  if(mw&&!mw.contains(e.target))hideMqDD();
});
function setEtype(t,btn){
  curEtype=t;
  document.querySelectorAll('.etype-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

function closeAdvImModal(){
  document.getElementById('advImModal').style.display='none';
  document.getElementById('advXlsFile').value='';
}

async function loadExcelJSLib(){
  if(typeof ExcelJS!=='undefined')return;
  await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
}

async function readAdvXls(input){
  const file=input.files[0];if(!file)return;
  setSav('⏳ جاري قراءة الملف...','ng');
  try{
    await loadExcelJSLib();
    const buf=await file.arrayBuffer();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    await wb.xlsx.load(buf);
    const ws=wb.worksheets[0];
    const rows=[];
    ws.eachRow((row,rn)=>{
      if(rn<=3)return;
      const v=row.values.slice(1);
      const amt=parseFloat(String(v[0]||'').replace(/,/g,''));
      if(isNaN(amt)||amt<=0)return;
      const cat=String(v[1]||'').trim();
      if(!cat)return;
      const desc=String(v[2]||'').trim();
      if(!desc)return;
      const dt=String(v[3]||'').trim();
      if(!dt)return;
      const mq=String(v[4]||'').trim();
      const projName=String(v[5]||'').trim();
      const matched=allProjects.find(p=>p.name.trim().toLowerCase()===projName.toLowerCase());
      rows.push({amt,cat,desc,dt,mq,projName,pid:matched?matched.id:''});
    });
    if(!rows.length){setSav('⚠️ مفيش بيانات في الملف','er');return;}
    advImRows=rows;
    showAdvImModal();
    setSav('☁️ متصل — بياناتك محفوظة','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function showAdvImModal(){
  const projOpts=allProjects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
  document.getElementById('advImBody').innerHTML=advImRows.map((r,i)=>{
    const opts=`<option value="">— اختر المشروع —</option>`+allProjects.map(p=>`<option value="${p.id}"${p.id===r.pid?' selected':''}>${esc(p.name)}</option>`).join('');
    const bg=i%2===0?'var(--bg-pure)':'var(--bg-warm2)';
    const hasPrj=!!r.pid;
    return `<tr style="background:${bg}">
      <td class="rep-client-num">${i+1}</td>
      <td class="rep-client-amount">${fn(r.amt)} ج</td>
      <td style="padding:8px 12px"><span class="rep-client-cat-badge">${r.cat||'—'}</span></td>
      <td class="rep-client-desc">${r.desc||'—'}</td>
      <td class="rep-client-date">${r.dt||'—'}</td>
      <td class="rep-client-contractor">${r.mq||'—'}</td>
      <td style="padding:8px 12px">
        <select data-idx="${i}" onchange="advImRows[this.dataset.idx].pid=this.value;this.style.borderColor=this.value?'var(--primary-mid)':'var(--warning-alt)';this.style.background=this.value?'var(--bg-pure)':'var(--warning-faint)'"
          style="width:100%;padding:6px 8px;border:1.5px solid ${hasPrj?'var(--primary-mid)':'var(--warning-alt)'};border-radius:6px;font-size:12px;font-family:inherit;background:${hasPrj?'var(--bg-pure)':'var(--warning-faint)'};color:#1D3C2A">
          ${opts}
        </select>
      </td>
    </tr>`;
  }).join('');
  const auto=advImRows.filter(r=>r.pid).length;
  document.getElementById('advImSubtitle').textContent=`${advImRows.length} صف — تم التعرف على ${auto} تلقائياً`;
  document.getElementById('advImCount').textContent=advImRows.length-auto>0?`⚠️ ${advImRows.length-auto} صف محتاج تحديد مشروع`:'✅ كل الصفوف جاهزة';
  document.getElementById('advImModal').style.display='block';
}

async function confirmAdvImport(){
  const valid=advImRows.filter(r=>r.pid);
  const skip=advImRows.length-valid.length;
  if(!valid.length){notify('لازم تحدد مشروع لصف واحد على الأقل','warn');return;}
  if(skip>0)await new Promise(res=>showConfirm({icon:'⚠️',title:'صفوف بدون مشروع',msg:skip+' صف بدون مشروع هيتخطى. تكمل؟',okLabel:'إكمال',okType:'warning',onOk:res}));
  const ents=valid.map(r=>({id:uid_(),project_id:r.pid,type:'e',amount:r.amt,description:r.desc||'',entry_date:r.dt||fd(ts()),category:r.cat,contractor:r.mq||'',advance_id:curAdv.id}));
  setSav('💾 جاري الاستيراد...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',ents);
      setSav('✅ تم استيراد '+ents.length+' قيد'+(skip?' (تخطي '+skip+')':''),'ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    closeAdvImModal();
    await loadAdvDetail();
    await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}


// ── SEQ RANGE REPORT ──────────────────────────────
let _seqRangeData = null;

function runSeqRangeReport(){
  const fromSeq = parseInt(document.getElementById('rSeqFrom').value)||0;
  const toSeq   = parseInt(document.getElementById('rSeqTo').value)||999999999;
  const projId  = document.getElementById('rSeqProj').value;
  const el      = document.getElementById('repSeqRangeResult');

  if(!fromSeq){el.innerHTML='<div class="rep-empty">ادخل رقم القيد الأول</div>';return;}

  let filtered = allEntries.filter(e => {
    const s = e.seq||0;
    return s >= fromSeq && s <= toSeq;
  });
  if(projId !== 'all') filtered = filtered.filter(e => e.project_id === projId);
  filtered.sort((a,b) => (a.seq||0)-(b.seq||0));

  if(!filtered.length){el.innerHTML='<div class="rep-empty">لا توجد قيود في هذا النطاق</div>';return;}

  const inc = filtered.filter(e=>e.type==='i');
  const exp = filtered.filter(e=>e.type==='e');
  const totalInc = inc.reduce((s,e)=>s+e.amount,0);
  const totalExp = exp.reduce((s,e)=>s+e.amount,0);
  const bal = totalInc - totalExp;
  const projName = projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';

  // pagination handles rendering — no inline mkRows needed
  const mkRows = () => '';

  el.innerHTML = `
    <div class="cf-kpi-row" style="margin-bottom:16px">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:var(--success)">▲ ${fn(totalInc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصروف</div><div class="cf-kpi-val" style="color:var(--danger)">▼ ${fn(totalExp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">الرصيد</div><div class="cf-kpi-val" style="color:${bal>=0?'var(--success)':'var(--danger)'}">${bal>=0?'+':''}${fn(bal)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">عدد القيود</div><div class="cf-kpi-val" style="color:var(--info)">${filtered.length}</div></div>
    </div>

    ${inc.length ? `<div style="margin-bottom:20px">
      <div class="rep-sec-title" style="margin-bottom:8px;font-weight:700;color:var(--success)">⬆ الوارد (${inc.length} قيد)</div>
      <div id="repSeqInc_pag"></div>
    </div>` : ''}
    ${exp.length ? `<div>
      <div class="rep-sec-title" style="margin-bottom:8px;font-weight:700;color:var(--danger)">⬇ المصروف (${exp.length} قيد)</div>
      <div id="repSeqExp_pag"></div>
    </div>` : ''}`;

  _seqRangeData = {filtered, inc, exp, totalInc, totalExp, bal, projName, fromSeq, toSeq};
  if(inc.length) _pagInit('repSeqInc', inc, projId!=='all');
  if(exp.length) _pagInit('repSeqExp', exp, projId!=='all');
}

function clearSeqRangeReport(){
  document.getElementById('rSeqFrom').value='';
  document.getElementById('rSeqTo').value='';
  document.getElementById('rSeqProj').value='all';
  document.getElementById('repSeqRangeResult').innerHTML='';
  _seqRangeData=null;
}

function seqRangeExportPDF(){
  if(!_seqRangeData){runSeqRangeReport();if(!_seqRangeData)return;}
  const d=_seqRangeData;
  const mkRows=(arr)=>arr.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${allProjectsMap[e.project_id]?.name||'—'}</td>
    <td>${e.category||'—'}</td>
    <td>${e.description||'—'}</td>
    <td class="amt ${e.type==='i'?'pos':'neg'}">${e.type==='i'?'▲':'▼'} ${fn(e.amount)} ج</td>
  </tr>`).join('');

  const html=_pdfOpen('تقرير نطاق القيود')+
    _pdfHeader('🔢 تقرير نطاق القيود','المشروع: '+d.projName+' · القيود: #'+d.fromSeq+' → #'+d.toSeq)+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.totalInc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.totalExp)} ج</div></div>
      <div class="kpi kpi-${d.bal>=0?'inc':'exp'}"><div class="kpi-lbl">الرصيد</div><div class="kpi-val">${fn(d.bal)} ج</div></div>
    </div>
    ${d.inc.length?`<div class="sec-ttl">⬆ الوارد (${d.inc.length} قيد)</div>
    <table><thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>المشروع</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead>
    <tbody>${mkRows(d.inc)}</tbody>
    <tfoot><tr><td colspan="6">الإجمالي</td><td class="amt pos">▲ ${fn(d.totalInc)} ج</td></tr></tfoot></table>`:''}
    ${d.exp.length?`<div class="sec-ttl" style="margin-top:20px">⬇ المصروف (${d.exp.length} قيد)</div>
    <table><thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>المشروع</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead>
    <tbody>${mkRows(d.exp)}</tbody>
    <tfoot><tr><td colspan="6">الإجمالي</td><td class="amt neg">▼ ${fn(d.totalExp)} ج</td></tr></tfoot></table>`:''}
    `+_pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

// ██ PAGINATION ENGINE ══════════════════════════════
const _PAG={};

function _pagPerPage(){return window.innerWidth<768?25:50;}

function _pagRowHtml(e,i,showProj){
  const isI=e.type==='i';
  const c=isI?'var(--success)':'var(--danger)';
  const proj=allProjectsMap[e.project_id];
  const projCell=showProj?`<td style="font-size:11px;color:var(--text-sub)">${proj?.name||'—'}</td>`:'';
  return `<tr>
    <td style="color:var(--text-sub);font-size:11px">${i+1}</td>
    <td><span style="background:var(--bg-faint);color:var(--primary-btn);padding:2px 6px;border-radius:5px;font-size:10px;font-weight:700">#${e.seq||'—'}</span></td>
    <td style="font-size:11px">${cleanDate(e.entry_date)||'—'}</td>
    ${projCell}
    <td style="font-size:11px;font-weight:600">${e.category||'—'}</td>
    <td style="font-size:11px;color:var(--text-sub)">${e.description||'—'}</td>
    <td style="font-weight:700;color:${c};white-space:nowrap">${isI?'▲':'▼'} ${fn(e.amount)} ج</td>
  </tr>`;
}

function _pagRender(id){
  const s=_PAG[id];if(!s)return;
  const pp=_pagPerPage();
  const total=s.rows.length;
  const totalPages=Math.max(1,Math.ceil(total/pp));
  if(s.page>totalPages)s.page=totalPages;
  const start=( s.page-1)*pp;
  const slice=s.rows.slice(start,start+pp);
  const showProj=s.showProj!==false;
  const projTh=showProj?`<th style="padding:6px 8px">المشروع</th>`:'';

  // أزرار الصفحات
  let pagBtns='';
  const maxBtns=5;
  let pFrom=Math.max(1,s.page-2);
  let pTo=Math.min(totalPages,pFrom+maxBtns-1);
  if(pTo-pFrom<maxBtns-1)pFrom=Math.max(1,pTo-maxBtns+1);
  if(pFrom>1)pagBtns+=`<button onclick="_pagGo('${id}',1)" style="${_pagBtnStyle(false)}">1</button><span style="padding:0 4px;color:var(--text-sub)">…</span>`;
  for(let p=pFrom;p<=pTo;p++){
    pagBtns+=`<button onclick="_pagGo('${id}',${p})" style="${_pagBtnStyle(p===s.page)}">${p}</button>`;
  }
  if(pTo<totalPages)pagBtns+=`<span style="padding:0 4px;color:var(--text-sub)">…</span><button onclick="_pagGo('${id}',${totalPages})" style="${_pagBtnStyle(false)}">${totalPages}</button>`;

  const el=document.getElementById(id+'_pag');
  if(!el)return;
  el.innerHTML=`
    <div style="margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;color:var(--text-sub)">عرض ${start+1}–${Math.min(start+pp,total)} من ${total} قيد</span>
        <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">${pagBtns}</div>
      </div>
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:var(--bg-faint)">
          <th style="padding:6px 8px;text-align:right">#</th>
          <th style="padding:6px 8px">رقم القيد</th>
          <th style="padding:6px 8px">التاريخ</th>
          ${projTh}
          <th style="padding:6px 8px">البند</th>
          <th style="padding:6px 8px">البيان</th>
          <th style="padding:6px 8px">المبلغ</th>
        </tr></thead>
        <tbody>${slice.map((e,i)=>_pagRowHtml(e,start+i,showProj)).join('')}</tbody>
      </table></div>
      ${totalPages>1?`<div style="display:flex;gap:4px;align-items:center;justify-content:center;margin-top:8px;flex-wrap:wrap">${pagBtns}</div>`:''}
    </div>`;
}

function _pagBtnStyle(active){
  return active
    ?'background:var(--primary);color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:700'
    :'background:var(--bg-faint);color:var(--text-main);border:1px solid var(--border-faint);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px';
}

function _pagGo(id,page){
  if(!_PAG[id])return;
  _PAG[id].page=page;
  _pagRender(id);
  // scroll لأول الجدول
  const el=document.getElementById(id+'_pag');
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

function _pagInit(id,rows,showProj){
  _PAG[id]={rows,page:1,showProj};
  _pagRender(id);
}
// ══════════════════════════════════════════════════════
