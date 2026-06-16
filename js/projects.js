async function loadAllProjects(){
  // نجيب المشاريع + الملخصات من الـ View مرة واحدة
  [allProjects,allEntries]=await Promise.all([
    sb('projects?order=created_at'),
    sb('entries?select=id,seq,project_id,type,amount,category,description,contractor,entry_date,created_at,advance_id&order=created_at.desc&limit=5000')
  ]);
  // استخدم seq كـ entry_no لو seq أكبر من 20260000
  allEntries.forEach(e=>{if(e.seq&&e.seq>20260000)e.seq=e.seq;});
  // نجيب الملخصات الجاهزة من الـ View
  let summariesData=[];
  try{ summariesData=await sb('project_summaries'); }catch(_){}
  // نبني الـ map بكل المشاريع (نشطة + مؤرشفة) قبل الفلتر
  allProjectsMap={};
  allProjects.forEach(p=>{allProjectsMap[p.id]=p;});
  // المشاريع النشطة بس (غير المؤرشفة)
  allProjects=allProjects.filter(p=>!p.archived);
  // نبني projSummaries من الـ View
  projSummaries={};
  allProjects.forEach(p=>{
    const sv=summariesData.find(s=>s.project_id===p.id);
    const inc=sv?parseFloat(sv.inc)||0:0;
    const exp=sv?parseFloat(sv.exp)||0:0;
    const expDirect=sv?parseFloat(sv.exp_direct)||0:0;
    const pe=allEntries.filter(e=>e.project_id===p.id&&e.type==='e'&&!e.advance_id);
    const cats=[...new Set(pe.map(e=>e.category).filter(Boolean))];
    projSummaries[p.id]={inc,exp,expDirect,bal:inc-exp,balDirect:inc-expDirect,cats,count:sv?parseInt(sv.total_count)||0:0};
  });
  // إظهار أزرار الأدمن
  if(uRole==='admin'){
    const archBtn=document.getElementById('sbi-archive');if(archBtn)archBtn.style.display='flex';
    const archPBtn=document.getElementById('archPBtn');if(archPBtn)archPBtn.style.display='';
    const auditBtn=document.getElementById('sbi-auditlog');if(auditBtn)auditBtn.style.display='flex';
    updateBackupDateDisplay();
  }
  populateAdvProjSel();
  buildSidebarProjects();
}
function populateAdvProjSel(){
  const sel=document.getElementById('advProjSel');
  if(!sel)return;
  sel.innerHTML='<option value="">اختار المشروع</option>';
  allProjects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}
async function loadProjects(){
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(uRole==='admin'||uRole==='viewer'){projects=allProjects;}
    else{const acc=await sb('project_access?user_id=eq.'+uid);if(!acc.length){projects=[];}else{const ids=acc.map(a=>a.project_id);projects=allProjects.filter(p=>ids.includes(p.id));}}
    if(!projects.length&&uRole==='admin'){const p=await sb('projects','POST',{name:'مشروع جديد',start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects=allProjects;}
    if(projects.length){curPid=projects[0].id;await loadEntries();}
    setSav('☁️ متصل — بياناتك محفوظة','ok');if(curScreen==='proj'||!curScreen)rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}
async function loadEntries(){if(!curPid)return;entries=await sbAll('entries?project_id=eq.'+curPid+'&order=created_at');entries.forEach(e=>{if(e.seq&&e.seq>20260000)e.seq=e.seq;});}

function _clearErr(inputId, errId){
  const el=document.getElementById(inputId);
  const er=document.getElementById(errId);
  if(el){el.classList.remove('input-err');if(el.value.trim())el.classList.add('input-ok');else el.classList.remove('input-ok');}
  if(er)er.classList.remove('show');
}
let _periodLocksCache=null;
async function _getPeriodLocks(){
  if(_periodLocksCache===null){
    try{_periodLocksCache=await sb('period_locks?order=year.desc,month.desc&limit=50')||[];}
    catch(e){_periodLocksCache=[];}
  }
  return _periodLocksCache;
}
function _clearPeriodLocksCache(){_periodLocksCache=null;}
async function ae(){
  const a=parseFloat(document.getElementById('ia').value);
  const c=document.getElementById('ic').value.trim();
  const d=document.getElementById('id_').value.trim();
  const dt=fd(document.getElementById('idt').value);
  const m=document.getElementById('iq').value.trim();
  // التحقق من الحقول الإلزامية مع تمييز بصري
  let _hasErr=false;
  const _mark=(id,errId,cond)=>{
    const el=document.getElementById(id);const er=document.getElementById(errId);
    if(el){el.classList.toggle('input-err',cond);}
    if(er){er.classList.toggle('show',cond);}
    if(cond)_hasErr=true;
  };
  _mark('ia','err-ia',isNaN(a)||a===0);
  _mark('idt','err-idt',!document.getElementById('idt').value.trim());
  _mark('ic','err-ic',cT==='e'&&!c);
  _mark('id_','err-id_',!d);
  if(_hasErr){notify('❌ اكمل الحقول الإلزامية','err');return;}
  // تحويل التاريخ dd/mm/yyyy لـ Date object
  function _parseDate(s){if(!s)return null;const p=s.split('/');if(p.length===3)return new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0]));return null;}
  // تحذير لو التاريخ في المستقبل
  if(dt){
    const entDt=_parseDate(dt);const today=new Date();today.setHours(0,0,0,0);
    if(entDt&&entDt>today){
      const go=await new Promise(res=>showConfirm({icon:'⚠️',title:'تاريخ في المستقبل',msg:'التاريخ المدخل ('+dt+') في المستقبل. متأكد؟',okLabel:'نعم، حفظ',okType:'warn',onOk:()=>res(true),onCancel:()=>res(false)}));
      if(!go)return;
    }
  }
  // تحقق من إقفال الفترة المحاسبية (من الكاش)
  if(dt){
    const _p=dt.split('/');
    if(_p.length===3){
      const _yr=parseInt(_p[2]);const _mo=parseInt(_p[1]);
      const _locks=await _getPeriodLocks();
      const _locked=_locks.find(l=>l.year===_yr&&l.month===_mo);
      if(_locked){notify('❌ هذا الشهر ('+_mo+'/'+_yr+') مقفول — لا يمكن إضافة قيود فيه','err');return;}
    }
  }
  // تحقق من قيد مكرر (نفس البيان + المبلغ + التاريخ في نفس المشروع)
  const _dup=entries.find(e=>e.description===d&&parseFloat(e.amount)===a&&e.entry_date===dt&&e.type===cT);
  if(_dup){
    const go=await new Promise(res=>showConfirm({icon:'⚠️',title:'قيد مشابه موجود',msg:'يوجد قيد بنفس البيان والمبلغ والتاريخ (#'+(_dup.seq||'؟')+')\nمتأكد إنه مش مكرر؟',okLabel:'نعم، حفظ',okType:'warn',onOk:()=>res(true),onCancel:()=>res(false)}));
    if(!go)return;
  }
  // snapshot الـ pid واسم المشروع وقت الضغط على حفظ — مش بنعتمد على curPid اللي ممكن يتغير
  const savedPid=curPid;
  const savedProjName=allProjectsMap[savedPid]?.name||'المشروع';
  // seq بيتولد تلقائياً من Supabase sequence — مش محتاج نحسبه هنا
  const entry={id:uid_(),project_id:savedPid,type:cT,amount:a,description:d,entry_date:dt,category:cT==='e'?c:'',contractor:cT==='e'?m:'',entry_type:cT==='e'&&m?curEtype:null,created_by:uid};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      entries.push(entry);
      allEntries=allEntries.filter(e=>e.project_id!==savedPid).concat(entries);
      refreshProjSummary(savedPid);
      setSav('✅ تم الحفظ','ok');
      notify(`✅ تم حفظ القيد في مشروع: ${savedProjName}`,'ok');
      auditLog('إضافة قيد','entries',entry.id,{project:savedProjName,amount:entry.amount,category:entry.category,type:entry.type});
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
      notify(`⏳ تم إرسال القيد للموافقة — مشروع: ${savedProjName}`,'warn');
    }
    document.getElementById('ia').value='';document.getElementById('id_').value='';document.getElementById('iq').value='';
    ['ia','id_','ic','idt'].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.remove('input-err','input-ok');}});
    ['err-ia','err-id_','err-ic','err-idt'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('show');});
    if(cT==='e'&&!['s','i','j','m'].includes(cTab))cTab=c;
    rp();
  }catch(e){
    const _em=friendlyError(e);
    setSav('❌ '+_em,'er');
    notify('❌ فشل الحفظ — '+_em,'err');
  }
}
// ██ PASSWORD CONFIRMATION MODAL ══════════════════
function confirmWithPassword(actionLabel, actionIcon, onConfirmed){
  let ov=document.getElementById('pwConfirmModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='pwConfirmModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`
    <div class="modal-box">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:32px;margin-bottom:8px">${actionIcon}</div>
        <div class="title-md">${actionLabel}</div>
        <div class="txt-muted">أدخل كلمة المرور للتأكيد</div>
      </div>
      <div style="position:relative;margin-bottom:8px">
        <input id="pwcInput" type="password" placeholder="كلمة المرور"
          class="inp-lg"
          onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter')submitPwConfirm()">
      </div>
      <div id="pwcMsg" class="modal-msg-err"></div>
      <div class="modal-btns">
        <button id="pwcOkBtn" onclick="submitPwConfirm()" class="btn-primary">✔ تأكيد</button>
        <button onclick="document.getElementById('pwConfirmModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>document.getElementById('pwcInput')?.focus(),100);
  // store callback
  window._pwcCallback=onConfirmed;
}

async function submitPwConfirm(){
  const pw=document.getElementById('pwcInput').value;
  const msg=document.getElementById('pwcMsg');
  const btn=document.getElementById('pwcOkBtn');
  if(!pw){msg.textContent='❌ أدخل كلمة المرور';return;}
  btn.disabled=true;btn.textContent='⏳ جاري التحقق...';
  try{
    // تحقق من الباسورد عبر Supabase
    let email=uEmail;
    if(!email){
      const ur=await fetch(SB+'/auth/v1/user',{headers:{'apikey':AK,'Authorization':'Bearer '+token}});
      const ud=await ur.json();email=ud.email||'';
    }
    if(!email)throw new Error('تعذّر التحقق — سجّل خروجاً ودخولاً مجدداً');
    const r=await fetch(SB+'/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'apikey':AK,'Content-Type':'application/json'},
      body:JSON.stringify({email,password:pw})
    });
    if(!r.ok)throw new Error('كلمة المرور غلط');
    document.getElementById('pwConfirmModal')?.remove();
    if(window._pwcCallback)window._pwcCallback();
  }catch(e){
    msg.textContent='❌ '+e.message;
    btn.disabled=false;btn.textContent='✔ تأكيد';
    document.getElementById('pwcInput').value='';
    document.getElementById('pwcInput').focus();
  }
}

async function de(id){
  const delEntry=allEntries.find(e=>e.id===id);
  // تحقق من إقفال الفترة قبل الحذف (من الكاش)
  if(delEntry&&delEntry.entry_date){
    const _p=delEntry.entry_date.split('/');
    if(_p.length===3){
      const _locks=await _getPeriodLocks();
      const _locked=_locks.find(l=>l.year===parseInt(_p[2])&&l.month===parseInt(_p[1]));
      if(_locked){notify('❌ هذا الشهر مقفول — لا يمكن حذف قيود فيه','err');return;}
    }
  }
  // منع حذف قيد معتمد
  if(delEntry&&delEntry.status==='approved'){
    notify('❌ القيد معتمد — لا يمكن حذفه','err');return;
  }
  // منع حذف قيد أقدم من 7 أيام — إلا الأدمن
  if(uRole!=='admin'&&delEntry){
    const entryDate=new Date(delEntry.created_at||delEntry.entry_date);
    const diffDays=Math.floor((Date.now()-entryDate.getTime())/(1000*60*60*24));
    if(diffDays>7){notify('❌ لا يمكن حذف قيد أقدم من 7 أيام — تواصل مع الأدمن','err');return;}
  }
  confirmWithPassword('تأكيد حذف القيد','🗑️',async()=>{
    setSav('💾 جاري الحذف...','ng');
    try{
      const delEntry=allEntries.find(e=>e.id===id);
      await sb('entries?id=eq.'+id,'DELETE');
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
      setSav('✅ تم الحذف','ok');
      auditLog('حذف قيد','entries',id,{project:allProjects.find(p=>p.id===curPid)?.name,amount:delEntry?.amount,category:delEntry?.category});
      rp();
    }catch(e){setSav('❌ '+friendlyError(e),'er');}
  });
}

async function sed(){
  if(!edId)return;
  const a=parseFloat(document.getElementById('eA').value);
  if(isNaN(a)){notify('ادخل المبلغ','err');return;}
  confirmWithPassword('تأكيد حفظ التعديل','✏️',async()=>{
    const newPid=document.getElementById('ePrj').value;
    const u={amount:a,description:document.getElementById('eD').value.trim(),entry_date:fd(document.getElementById('eDt').value),project_id:newPid};
    if(edType==='e'){
      const nc=document.getElementById('eC').value.trim();
      if(!nc){notify('ادخل البند','err');return;}
      u.category=nc;
      const mq=document.getElementById('eM').value.trim();
      u.contractor=mq;u.entry_type=mq&&curEditEtype?curEditEtype:null;
    }
    setSav('💾 جاري الحفظ...','ng');
    try{
      await sb('entries?id=eq.'+edId,'PATCH',u);
      if(newPid!==curPid){
        entries=entries.filter(e=>e.id!==edId);
        allEntries=allEntries.map(e=>e.id===edId?{...e,...u}:e);
        setSav('✅ تم النقل للمشروع الجديد','ok');
      }else{
        await loadEntries();
        allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
        setSav('✅ تم التعديل','ok');
      }
      cep();rp();
    }catch(e){setSav('❌ '+friendlyError(e),'er');}
  });
}

// ══ إيصال PDF ═══════════════════════════════════════════
async function printReceipt(id){
  const e=allEntries.find(x=>x.id===id)||entries.find(x=>x.id===id);
  if(!e){notify('لم يتم العثور على القيد','err');return;}
  const proj=allProjectsMap[e.project_id]?.name||'—';
  let _creatorName='Legacy';
  try{
    if(e.created_by){
      const _prof=await sb('profiles?id=eq.'+e.created_by+'&select=name');
      if(_prof&&_prof.length)_creatorName=_prof[0].name||'Legacy';
    }
  }catch(err){}
  const payType=e.entry_type==='payment'?'دفعة نقدية/تحويل':e.entry_type==='work'?'أعمال':e.entry_type==='material'?'مصنعيات':'—';
  const isExp=e.type==='e';
  const isInc=e.type==='i';
  const typeLbl=isExp?'دفعة مقاول':'وارد عميل';
  const fn2=n=>Number(n).toLocaleString('en-EG');
  const w=window.open('','_blank');
  const hdrBg=isExp?'#1C3A1C':'#0C447C';
  const hdrClr=isExp?'#C0DD97':'#B5D4F4';
  const amtBg=isExp?'#1C3A1C':'#0C447C';
  const heroBg=isExp?'#EAF3DE':'#E6F1FB';
  const heroClr=isExp?'#27500A':'#0C447C';
  const heroSub=isExp?'#3B6D11':'#185FA5';
  const heroBorder=isExp?'#C0DD97':'#B5D4F4';
  const confirmBg=isExp?'#EAF3DE':'#E6F1FB';
  const confirmClr=isExp?'#27500A':'#0C447C';
  const confirmBorder=isExp?'#C0DD97':'#B5D4F4';
  const footBg=isExp?'#EAF3DE':'#E6F1FB';
  const footClr=isExp?'#3B6D11':'#378ADD';
  w.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>إيصال رقم ${e.seq||'—'}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Cairo','Segoe UI',sans-serif;background:#fff;color:#111;direction:rtl;max-width:580px;margin:0 auto}
  .rcpt-head{background:${hdrBg};padding:22px 24px;display:flex;align-items:center;justify-content:space-between}
  .rcpt-brand{color:${hdrClr};font-size:18px;font-weight:600}
  .rcpt-badge{font-size:11px;font-weight:600;padding:3px 12px;border-radius:4px;background:rgba(255,255,255,0.12);color:${hdrClr};border:1px solid rgba(255,255,255,0.2)}
  .rcpt-hero{background:${heroBg};padding:22px 24px;text-align:center;border-bottom:1px solid ${heroBorder}}
  .rcpt-hero-num{font-size:12px;color:${heroSub};margin-bottom:6px;letter-spacing:.5px}
  .rcpt-hero-seq{font-size:20px;font-weight:700;color:${heroClr};margin-bottom:2px}
  .rcpt-hero-date{font-size:11px;color:${heroSub}}
  .rcpt-amount{margin:20px 24px;background:${amtBg};border-radius:10px;padding:18px;text-align:center}
  .rcpt-amount-lbl{font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px}
  .rcpt-amount-val{font-size:34px;font-weight:700;color:#fff}
  .rcpt-amount-unit{font-size:15px;color:rgba(255,255,255,0.6);margin-right:4px}
  .rcpt-sec-lbl{font-size:10px;font-weight:600;color:#999;letter-spacing:.5px;padding:0 24px;margin-bottom:6px;text-transform:uppercase}
  .rcpt-table{width:calc(100% - 48px);margin:0 24px 16px;border-collapse:collapse}
  .rcpt-table tr{border-bottom:1px solid #eee}
  .rcpt-table tr:last-child{border:none}
  .rcpt-table td{padding:9px 4px;font-size:13px}
  .rcpt-table td:first-child{color:#888;width:130px}
  .rcpt-table td:last-child{font-weight:600;color:#111;text-align:left}
  .rcpt-confirm{margin:0 24px 20px;background:${confirmBg};border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px;border:1px solid ${confirmBorder}}
  .rcpt-confirm-text{font-size:12px;color:${confirmClr};font-weight:500}
  .rcpt-sigs{display:flex;border-top:1px solid #eee}
  .rcpt-sig{flex:1;padding:20px 12px 16px;text-align:center;border-right:1px solid #eee}
  .rcpt-sig:last-child{border:none}
  .rcpt-sig-line{border-top:1px solid #bbb;margin-bottom:8px;margin-top:36px}
  .rcpt-sig-lbl{font-size:11px;color:#999}
  .rcpt-footer{background:${footBg};padding:10px 24px;text-align:center;font-size:10px;color:${footClr};border-top:1px solid ${heroBorder}}
  @media print{body{max-width:100%}}
</style>
</head>
<body>
<div class="rcpt-head">
  <div class="rcpt-brand">Legacy Fine Touch</div>
  <div class="rcpt-badge">${typeLbl}</div>
</div>
<div class="rcpt-hero">
  <div class="rcpt-hero-num">إيصال رقم</div>
  <div class="rcpt-hero-seq">${e.seq||'—'}</div>
  <div class="rcpt-hero-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
</div>
<div class="rcpt-amount">
  <div class="rcpt-amount-lbl">${isExp?'المبلغ المدفوع':'المبلغ المستلم'}</div>
  <div class="rcpt-amount-val">${fn2(Math.abs(e.amount))}<span class="rcpt-amount-unit"> ج</span></div>
</div>
<div class="rcpt-sec-lbl">تفاصيل الإيصال</div>
<table class="rcpt-table">
  <tr><td>المشروع</td><td>${proj}</td></tr>
  <tr><td>البيان</td><td>${e.description||'—'}</td></tr>
  <tr><td>التاريخ</td><td>${e.entry_date||'—'}</td></tr>
  ${isExp&&e.contractor?`<tr><td>المقاول</td><td>${e.contractor}</td></tr>`:''}
  ${isExp&&e.entry_type?`<tr><td>طريقة الدفع</td><td>${payType}</td></tr>`:''}
  ${isExp?`<tr><td>البند</td><td>${e.category||'—'}</td></tr>`:''}
  <tr><td>رقم القيد</td><td>${e.seq||'—'}</td></tr>
  <tr><td>أدخله</td><td>${_creatorName}</td></tr>
</table>
<div class="rcpt-confirm">
  <div class="rcpt-confirm-text">&#10003; ${isExp?'تم صرف المبلغ وقيده في النظام':'تم استلام المبلغ وقيده في النظام'}</div>
</div>
<div class="rcpt-sigs">
  <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">${isExp?'المقاول / المستلم':'العميل / الدافع'}</div></div>
  <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">المحاسب</div></div>
  <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">المهندس</div></div>
</div>
<div class="rcpt-footer">Legacy Fine Touch — نظام الإدارة المالية — ${new Date().getFullYear()}</div>
<script>window.onload=()=>window.print();<\/script>
</body></html>`);
  w.document.close();
}

function _updateEntryBanner(){
  const el=document.getElementById('entryProjName');
  if(el)el.textContent=allProjectsMap[curPid]?.name||'—';
}
async function sw(pid){
  curPid=pid;cTab='s';window._rpPage=0;setSav('⏳ جاري تحميل المشروع...','ng');
  _updateEntryBanner();
  const addBtn=document.getElementById('addEntryBtn');
  if(addBtn){addBtn.disabled=true;addBtn.style.opacity='0.5';addBtn.textContent='⏳ جاري التحميل...';}
  cep();
  await loadEntries();setSav('☁️ متصل','ok');
  if(addBtn){addBtn.disabled=false;addBtn.style.opacity='';addBtn.textContent='+ إضافة القيد';}
  const idt=document.getElementById('idt');
  if(idt&&!idt.value)idt.value=ts();
  rp();
}
async function np(){const n=prompt('اسم المشروع الجديد:');if(!n||!n.trim())return;try{const p=await sb('projects','POST',{name:n.trim(),start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects.push(p[0]);curPid=p[0].id;entries=[];cTab='s';populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function dp(){if(projects.length<=1){notify('لا يمكن حذف المشروع الوحيد','warn');return;}showConfirm({icon:'🗑️',title:'حذف المشروع',msg:'هيتحذف مشروع "'+curP().name+'" بالكامل مع كل قيوده. متأكد؟',okLabel:'حذف',okType:'danger',onOk:async()=>{try{await sb('projects?id=eq.'+curPid,'DELETE');allProjects=allProjects.filter(p=>p.id!==curPid);projects=projects.filter(p=>p.id!==curPid);curPid=projects[0].id;cTab='s';await loadEntries();populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}});}

// ██ ARCHIVE — أرشيف المشاريع ══════════════════════
async function archiveProject(){
  if(!curPid)return;
  const p=curP();
  await new Promise(res=>showConfirm({icon:'📦',title:'أرشفة المشروع',msg:'مشروع "'+p.name+'" هيختفي من القائمة الرئيسية. تقدر تستعيده من الأرشيف.',okLabel:'أرشفة',okType:'warning',onOk:res}));
  try{
    await sb('projects?id=eq.'+curPid,'PATCH',{archived:true});
    allProjects=allProjects.filter(x=>x.id!==curPid);
    projects=projects.filter(x=>x.id!==curPid);
    notify('📦 تم أرشفة "'+p.name+'"','ok');
    if(projects.length>0){curPid=projects[0].id;cTab='s';await loadEntries();rp();}
    else{showScreen('dash');}
    populateAdvProjSel();
    buildSidebarProjects();
  }catch(e){notify('❌ '+friendlyError(e),'err');}
}

let _archiveData=[];

async function loadAuditLog(){
  const el=document.getElementById('auditLogList');
  if(!el)return;
  el.innerHTML='<div class="emp">⏳ جاري التحميل...</div>';
  try{
    const rows=await sb('audit_log?order=created_at.desc&limit=200');
    if(!rows||!rows.length){el.innerHTML='<div class="emp">لا يوجد سجلات بعد</div>';return;}
    const actionColor={
      'إضافة قيد':'var(--success)','موافقة على قيد':'var(--success)',
      'حذف قيد':'var(--danger)','رفض قيد':'var(--danger)',
    };
    el.innerHTML=rows.map(r=>{
      const dt=new Date(r.created_at);
      const dateStr=String(dt.getDate()).padStart(2,'0')+'/'+String(dt.getMonth()+1).padStart(2,'0')+'/'+dt.getFullYear()+' '+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
      const color=actionColor[r.action]||'var(--text-hint)';
      const details=r.details?Object.entries(r.details).filter(([k,v])=>v).map(([k,v])=>k+': '+v).join(' · '):'';
      return `<div class="rw" style="margin-bottom:6px">
        <div class="ri">
          <div class="rd"><span style="color:${color};font-weight:600">${r.action}</span> ${details?'<span style="color:var(--text-hint);font-size:11px">· '+details+'</span>':''}</div>
          <div class="rm">👤 ${r.user_name||'—'} · 📅 ${dateStr}</div>
        </div>
      </div>`;
    }).join('');
  }catch(e){el.innerHTML='<div style="color:var(--danger);padding:20px">❌ '+e.message+'</div>';}
}

async function loadArchivedProjects(){
  const div=document.getElementById('archivedProjList');
  const countEl=document.getElementById('archCount');
  if(!div)return;
  div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">⏳</div><div class="arch-empty-txt">جاري التحميل...</div></div>';
  try{
    const archived=await sb('projects?archived=eq.true&order=created_at.desc&limit=1000');
    if(!archived||!archived.length){
      div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">📦</div><div class="arch-empty-txt">لا توجد مشاريع مؤرشفة</div><div class="arch-empty-sub">بعد أرشفة أي مشروع سيظهر هنا</div></div>';
      if(countEl)countEl.textContent='لا توجد مشاريع';
      return;
    }
    const pids=archived.map(p=>p.id);
    let archEntries=[];
    try{archEntries=await sbAll('entries?project_id=in.('+pids.join(',')+')&select=id,project_id,type,amount,category,advance_id');}catch(_){}
    _archiveData=archived.map(p=>{
      const pe=(archEntries||[]).filter(e=>e.project_id===p.id);
      const inc=pe.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
      const expDirect=pe.filter(e=>e.type==='e'&&!e.advance_id).reduce((s,e)=>s+e.amount,0);
      const bal=inc-expDirect;
      const cats=[...new Set(pe.filter(e=>e.type==='e'&&!e.advance_id).map(e=>e.category).filter(Boolean))];
      return{...p,_inc:inc,_exp:expDirect,_bal:bal,_cats:cats,_count:pe.length};
    });
    if(countEl)countEl.textContent=_archiveData.length+' مشروع مؤرشف';
    renderArchiveCards(_archiveData,div);
  }catch(e){div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">❌</div><div class="arch-empty-txt">خطأ في التحميل</div><div class="arch-empty-sub">'+e.message+'</div></div>';}
}

function renderArchiveCards(data,div){
  if(!data.length){div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">🔍</div><div class="arch-empty-txt">لا نتائج للبحث</div></div>';return;}
  div.innerHTML=data.map(p=>{
    const bal=p._bal||0;
    const balClass=bal>0?'pos':bal<0?'neg':'neu';
    const balLabel=bal<0?'⚠ عجز':bal>0?'✅ رصيد':'—';
    const catsHtml=p._cats&&p._cats.length?p._cats.slice(0,6).map(c=>`<span class="arch-cat-tag">${c}</span>`).join('')+(p._cats.length>6?`<span class="arch-cat-tag">+${p._cats.length-6}</span>`:''): '<span class="arch-cat-tag" style="color:var(--text-pale)">لا توجد بنود</span>';
    const safeName=p.name.replace(/'/g,"\'").replace(/"/g,'&quot;');
    return `<div class="arch-card">
      <div class="arch-card-top">
        <div class="arch-card-name">${p.name}</div>
        <div class="arch-card-badge">${p._count} قيد</div>
      </div>
      <div class="arch-card-body">
        <div class="arch-card-dates"><span>📅 البداية: ${p.start_date||'—'}</span><span>🏁 الإغلاق: ${p.close_date||'جارٍ'}</span></div>
        <div class="arch-stats">
          <div class="arch-stat"><div class="arch-stat-lbl">الوارد</div><div class="arch-stat-val pos">${fn(p._inc)}</div></div>
          <div class="arch-stat"><div class="arch-stat-lbl">المصروف</div><div class="arch-stat-val neg">${fn(p._exp)}</div></div>
          <div class="arch-stat"><div class="arch-stat-lbl">${balLabel}</div><div class="arch-stat-val ${balClass}">${fn(Math.abs(bal))}</div></div>
        </div>
        <div class="arch-cats">${catsHtml}</div>
        <div class="arch-card-footer">
          <div class="arch-entries-count">📋 ${p._count} قيد محاسبي</div>
          <div style="display:flex;gap:6px">
            <button class="arch-edit-btn" onclick="openArchivedEntries('${p.id}')">📋 القيود</button>
            <button class="arch-edit-btn" onclick="editArchivedProject('${p.id}')">✏️ تعديل</button>
            <button class="arch-restore-btn" onclick="restoreProject('${p.id}','${safeName}')">↩ استعادة</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterArchive(q){
  if(!_archiveData.length)return;
  const div=document.getElementById('archivedProjList');
  const filtered=q.trim()?_archiveData.filter(p=>p.name.includes(q.trim())):_archiveData;
  renderArchiveCards(filtered,div);
}

async function openArchivedEntries(pid){
  const archProj=_archiveData.find(p=>p.id===pid);
  if(!archProj)return;
  // نضيفه مؤقتاً في allProjects و projects عشان rp() تشتغل صح
  if(!allProjects.find(p=>p.id===pid)){
    allProjects.push(archProj);
    allProjectsMap[pid]=archProj;
  }
  if(!projects.find(p=>p.id===pid)){
    projects.push(archProj);
  }
  showScreen('proj');
  await sw(pid);
  setSav('📦 مشروع مؤرشف — يمكن التعديل على قيوده','ok');
}

function editArchivedProject(pid){
  const p=_archiveData.find(x=>x.id===pid);
  if(!p)return;
  let ov=document.getElementById('editProjModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='editProjModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div class="modal-box-lg">
      <div class="modal-hdr">
        <div class="title-lg">✏️ تعديل المشروع المؤرشف</div>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-close-sm">✕</button>
      </div>
      <label class="lbl-lg">اسم المشروع</label>
      <input id="epName" type="text" value="${(p.name||'').replace(/"/g,'&quot;')}" class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div class="proj-edit-dates-row">
        <div>
          <label class="lbl-lg">📅 تاريخ البداية</label>
          <input id="epStart" type="text" value="${p.start_date||''}" placeholder="dd/mm/yyyy" class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div>
          <label class="lbl-lg">📅 تاريخ الإغلاق</label>
          <input id="epClose" type="text" value="${p.close_date||''}" placeholder="dd/mm/yyyy" class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
      </div>
      <div id="epMsg" class="proj-edit-msg"></div>
      <div class="modal-btns">
        <button onclick="saveArchivedProjectEdit('${pid}')" class="btn-primary">💾 حفظ التعديلات</button>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById('epName').focus();
  setTimeout(()=>{initDateInput(document.getElementById('epStart'));initDateInput(document.getElementById('epClose'));},0);
}

async function saveArchivedProjectEdit(pid){
  const name=document.getElementById('epName').value.trim();
  const start=document.getElementById('epStart').value.trim();
  const close=document.getElementById('epClose').value.trim();
  const msg=document.getElementById('epMsg');
  if(!name){msg.style.color='var(--danger)';msg.textContent='❌ الاسم مطلوب';return;}
  msg.style.color='var(--warning-text)';msg.textContent='⏳ جاري الحفظ...';
  try{
    const upd={name,start_date:start||null,close_date:close||null};
    await sb('projects?id=eq.'+pid,'PATCH',upd);
    const idx=_archiveData.findIndex(p=>p.id===pid);
    if(idx>=0){_archiveData[idx]={..._archiveData[idx],...upd};}
    msg.style.color='var(--primary-btn)';msg.textContent='✅ تم الحفظ';
    setSav('✅ تم تعديل المشروع المؤرشف','ok');
    setTimeout(()=>{document.getElementById('editProjModal')?.remove();loadArchivedProjects();},700);
  }catch(e){msg.style.color='var(--danger)';msg.textContent='❌ خطأ: '+e.message;}
}

async function restoreProject(pid,name){
  await new Promise(res=>showConfirm({icon:'↩️',title:'استعادة المشروع',msg:'مشروع "'+name+'" هيظهر تاني في القائمة الرئيسية.',okLabel:'استعادة',okType:'success',onOk:res}));
  try{
    await sb('projects?id=eq.'+pid,'PATCH',{archived:false});
    notify('✅ تم استعادة "'+name+'"','ok');
    await loadAllProjects();
    await loadProjects();
    loadArchivedProjects();
  }catch(e){notify('❌ '+friendlyError(e),'err');}
}

function editProject(){
  const p=curP();
  if(!p)return;
  let ov=document.getElementById('editProjModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='editProjModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div class="modal-box-lg">
      <div class="modal-hdr">
        <div class="title-lg">✏️ تعديل المشروع</div>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-close-sm">✕</button>
      </div>
      <label class="lbl-lg">اسم المشروع</label>
      <input id="epName" type="text" value="${(p.name||'').replace(/"/g,'&quot;')}"
        class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div class="proj-edit-dates-row">
        <div>
          <label class="lbl-lg">📅 تاريخ البداية</label>
          <input id="epStart" type="text" value="${p.start_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div>
          <label class="lbl-lg">📅 تاريخ الإغلاق</label>
          <input id="epClose" type="text" value="${p.close_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
      </div>
      <div id="epMsg" class="proj-edit-msg"></div>
      <div class="modal-btns">
        <button onclick="saveProjectEdit()" class="btn-primary">💾 حفظ التعديلات</button>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.getElementById('epName').focus();
  setTimeout(()=>{initDateInput(document.getElementById('epStart'));initDateInput(document.getElementById('epClose'));},0);
}

async function saveProjectEdit(){
  const name=document.getElementById('epName').value.trim();
  const start=document.getElementById('epStart').value.trim();
  const close=document.getElementById('epClose').value.trim();
  const msg=document.getElementById('epMsg');
  if(!name){msg.style.color='var(--danger)';msg.textContent='❌ الاسم مطلوب';return;}
  msg.style.color='var(--warning-text)';msg.textContent='⏳ جاري الحفظ...';
  try{
    const upd={name,start_date:start||null,close_date:close||null};
    await sb('projects?id=eq.'+curPid,'PATCH',upd);
    // حدّث الذاكرة
    const idx=allProjects.findIndex(p=>p.id===curPid);
    if(idx>=0){allProjects[idx]={...allProjects[idx],...upd};}
    const idx2=projects.findIndex(p=>p.id===curPid);
    if(idx2>=0){projects[idx2]={...projects[idx2],...upd};}
    // حدّث الـ select
    const sel=document.getElementById('ps');
    if(sel){const opt=[...sel.options].find(o=>o.value===curPid);if(opt)opt.textContent=name;}
    // حدّث حقول التواريخ في الشاشة
    const dstEl=document.getElementById('dst');
    const dclEl=document.getElementById('dcl');
    if(dstEl)dstEl.value=start||'';
    if(dclEl)dclEl.value=close||'';
    msg.style.color='var(--primary-btn)';msg.textContent='✅ تم الحفظ';
    setSav('✅ تم تعديل المشروع','ok');
    setTimeout(()=>document.getElementById('editProjModal')?.remove(),700);
  }catch(e){msg.style.color='var(--danger)';msg.textContent='❌ خطأ: '+e.message;}
}
async function upm(k,v){const u=k==='s'?{start_date:v}:{close_date:v};try{await sb('projects?id=eq.'+curPid,'PATCH',u);}catch(e){setSav('❌ '+friendlyError(e),'er');}}
function oe(id){
  if(uRole==='viewer')return;
  const e=entries.find(x=>x.id===id);if(!e)return;
  // منع تعديل قيد معتمد
  if(e.status==='approved'){notify('❌ القيد معتمد — لا يمكن تعديله','err');return;}
  edId=id;edType=e.type;
  document.getElementById('ep-t').textContent='تعديل القيد '+(e.seq||'?');
  // populate project dropdown
  const ePrj=document.getElementById('ePrj');
  ePrj.innerHTML=allProjects.map(p=>'<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>').join('');
  document.getElementById('eA').value=e.amount;
  document.getElementById('eC').value=e.category||'';document.getElementById('eC').style.display=e.type==='e'?'block':'none';
  document.getElementById('eD').value=e.description||'';
  document.getElementById('eM').value=e.contractor||'';document.getElementById('eM').style.display=e.type==='e'?'block':'none';
  if(e.entry_date&&e.entry_date!=='—'){const p=e.entry_date.split('/');if(p.length===3)document.getElementById('eDt').value=p[2]+'-'+p[1]+'-'+p[0];}else document.getElementById('eDt').value='';
  // entry_type buttons
  const wrap=document.getElementById('editEtypeWrap');
  if(e.type==='e'&&e.contractor){
    wrap.classList.add('show');
    curEditEtype=e.entry_type||'payment';
    ['payment','work','material'].forEach(t=>{
      const btn=document.getElementById('eEt-'+t);
      btn.classList.toggle('on',t===curEditEtype);
    });
  }else{wrap.classList.remove('show');curEditEtype=null;}
  document.getElementById('ep').style.display='block';
}
function cep(){document.getElementById('ep').style.display='none';edId=null;edType=null;}
function st(t){cT=t;document.getElementById('tx').classList.toggle('on',t==='e');document.getElementById('ti').classList.toggle('on',t==='i');document.getElementById('ic').style.display=t==='e'?'block':'none';document.getElementById('iq').style.display=t==='e'?'block':'none';}
function setCTab(t){stab(t);}
function stab(t){
  cTab=t;window._rpPage=0;
  const fb=document.getElementById('entryFilterBar');
  if(fb)fb.style.display=t==='j'?'flex':'none';
  if(t==='j'){
    setTimeout(()=>{
      const ff=document.getElementById('entFltFrom');
      const ft=document.getElementById('entFltTo');
      if(ff&&!ff._dpInit)initDateInput(ff);
      if(ft&&!ft._dpInit)initDateInput(ft);
    },100);
  }
  rp();
}
let _entFltActive=false;
// ██ ENTRIES FILTER ══════════════════════════════════
function applyEntryFilter(){
  _entFltActive=true;
  window._rpPage=0;
  re();
}
function clearEntryFilter(){
  document.getElementById('entFltText').value='';
  document.getElementById('entFltType').value='';
  document.getElementById('entFltFrom').value='';
  document.getElementById('entFltTo').value='';
  _entFltActive=false;
  window._rpPage=0;
  re();
}
function getFilteredEntries(){
  if(!_entFltActive)return null;
  const q=(document.getElementById('entFltText')?.value||'').toLowerCase().trim();
  const type=document.getElementById('entFltType')?.value||'';
  const fromRaw=document.getElementById('entFltFrom')?.value||'';
  const toRaw=document.getElementById('entFltTo')?.value||'';
  const parseD=s=>{if(!s)return null;const[d,m,y]=s.split('/');return new Date(+y,+m-1,+d);};
  const from=parseD(fromRaw);const to=parseD(toRaw);
  return entries.filter(e=>{
    if(type&&e.type!==type)return false;
    if(q&&!(e.description||'').toLowerCase().includes(q)&&!(e.contractor||'').toLowerCase().includes(q)&&!(e.category||'').toLowerCase().includes(q))return false;
    if(from||to){
      let ed=null;
      if(e.entry_date){const p=e.entry_date.includes('/')?e.entry_date.split('/'):null;ed=p?new Date(+p[2],+p[1]-1,+p[0]):new Date(e.entry_date);}
      if(ed){if(from&&ed<from)return false;if(to){const t=new Date(to);t.setHours(23,59,59);if(ed>t)return false;}}
    }
    return true;
  });
}

// ══════════════════════════════════════════
//  CONTRACTOR DUES TAB
// ══════════════════════════════════════════
let _duesList=[];
// ██ DUES — المستحقات ══════════════════════════════

async function loadDuesTab(el){
  el.innerHTML='<div class="emp">⏳ جاري التحميل...</div>';
  try{
    const data=await sb('contractor_dues?project_id=eq.'+curPid+'&order=created_at.desc');
    _duesList=data||[];
    renderDuesTab(el);
  }catch(e){el.innerHTML='<div class="emp">❌ خطأ في تحميل البيانات</div>';}
}

function renderDuesTab(el){
  const canEdit=uRole!=='viewer'&&uRole!=='owner';
  const total=_duesList.reduce((s,d)=>s+d.amount,0);
  const unpaid=_duesList.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_duesList.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  let html=`
    <div class="kp" style="margin-bottom:12px">
      <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>
    </div>`;

  if(canEdit){
    html+=`<div style="display:flex;justify-content:flex-end;margin-bottom:10px">
      <button onclick="showAddDueForm()" class="gsm">+ إضافة مستحق</button>
    </div>`;
  }

  if(!_duesList.length){
    html+='<div class="emp">لا توجد مستحقات</div>';
  } else {
    html+=`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">المقاول</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البيان</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">التاريخ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">المبلغ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">الحالة</th>
        ${canEdit?'<th style="color:#D4C49A;padding:8px 10px"></th>':''}
      </tr></thead>
      <tbody>
      ${_duesList.map((d,i)=>{
        const isPaid=d.status==='paid';
        const rowBg=i%2===0?'#fff':'#f7f7f5';
        return `<tr style="background:${rowBg};border-bottom:0.5px solid #e8e8e4;opacity:${isPaid?0.7:1}" onmouseover="this.style.background='#eef4ee'" onmouseout="this.style.background='${rowBg}'">
          <td style="padding:7px 10px;color:#999;font-size:11px">${i+1}</td>
          <td style="padding:7px 10px;font-weight:500;color:#222">${d.contractor||'—'}</td>
          <td style="padding:7px 10px;color:#555">${d.description||'—'}</td>
          <td style="padding:7px 10px;color:#888;font-size:11px;white-space:nowrap">${d.due_date||'—'}</td>
          <td style="padding:7px 10px;font-weight:500;color:${isPaid?'#27AE60':'#E74C3C'};white-space:nowrap">${isPaid?'✅':' ▼'} ${fn(d.amount)} ج</td>
          <td style="padding:7px 10px"><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${isPaid?'#e8f8f0':'#fef0f0'};color:${isPaid?'#27AE60':'#E74C3C'}">${isPaid?'مدفوع':'غير مدفوع'}</span></td>
          ${canEdit?`<td style="padding:4px 8px;white-space:nowrap">
            <button onclick="toggleDue('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'#E74C3C':'#27AE60'};background:transparent;color:${isPaid?'#E74C3C':'#27AE60'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
            <button onclick="editDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #aaa;background:transparent;color:#555;cursor:pointer">✏️</button>
            <button onclick="deleteDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #ccc;background:transparent;color:#999;cursor:pointer">🗑</button>
          </td>`:''}
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
  }
  el.innerHTML=html;
  // تفعيل date picker على حقل التاريخ
  const dtEl=document.getElementById('dueDate');
  if(dtEl)initDateInput(dtEl);
}

function showAddDueForm(){
  const ex=document.getElementById('_addDueModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_addDueModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:360px;width:100%">
    <div style="text-align:center;margin-bottom:14px"><div style="font-size:26px">💰</div><div class="title-md">إضافة مستحق</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="dueContr" placeholder="اسم المقاول" class="inp-lg">
      <input id="dueAmt" type="number" placeholder="المبلغ (ج)" step="any" class="inp-lg">
      <input id="dueDesc" placeholder="البيان" class="inp-lg">
      <input id="dueDate" placeholder="📅 التاريخ dd/mm/yyyy" class="inp-lg" maxlength="10" autocomplete="off">
    </div>
    <div class="modal-btns" style="margin-top:14px">
      <button onclick="addDue()" class="btn-primary">+ إضافة</button>
      <button onclick="document.getElementById('_addDueModal').remove()" class="btn-cancel">إلغاء</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>{const el=document.getElementById('dueDate');if(el)initDateInput(el);},100);
  setTimeout(()=>document.getElementById('dueContr')?.focus(),150);
}

async function addDue(){
  const contractor=document.getElementById('dueContr')?.value?.trim();
  const amount=parseFloat(document.getElementById('dueAmt')?.value);
  const description=document.getElementById('dueDesc')?.value?.trim();
  const due_date=document.getElementById('dueDate')?.value?.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    const res=await sb('contractor_dues','POST',{
      project_id:curPid,
      contractor,
      amount,
      description:description||null,
      due_date:due_date||null,
      status:'unpaid',
      created_by:uid
    });
    _duesList.unshift(res[0]);
    notify('✅ تم الإضافة','ok');
    document.getElementById('_addDueModal')?.remove();
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleDue(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _duesList=_duesList.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  DUES SCREEN (شاشة المستحقات الشاملة)
// ══════════════════════════════════════════
let _allDues=[];
let _duesFilter='all';

function goToNotes(){showScreen('notes');}

// ══════════════════════════════════════════
//  NOTES SCREEN
// ══════════════════════════════════════════
let _notesFilter='all';
// ██ NOTES — الملاحظات والمهام ══════════════════════
const _noteColors=[
  {bg:'#E8F5E9',txt:'#1D6A3E',lbl:'عمل'},
  {bg:'#FFF8E1',txt:'#854F0B',lbl:'متابعة'},
  {bg:'#E3F2FD',txt:'#0C447C',lbl:'مالي'},
  {bg:'#FCE4EC',txt:'#72243E',lbl:'عاجل'},
];

function loadNotesScreen(){
  const dateEl=document.getElementById('notesScreenDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  loadNotes().then(()=>renderNotesScreen());
}

function renderNotesScreen(){
  const undone=_notesList.filter(n=>!n.done).length;
  const done=_notesList.filter(n=>n.done).length;
  const stats=document.getElementById('notesScreenStats');
  if(stats)stats.innerHTML=`
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#1D3C2A">${_notesList.length}</div>
      <div style="font-size:11px;color:var(--text-hint)">إجمالي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#C86060">${undone}</div>
      <div style="font-size:11px;color:var(--text-hint)">متبقي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#1D6A3E">${done}</div>
      <div style="font-size:11px;color:var(--text-hint)">منتهي</div>
    </div>`;

  const el=document.getElementById('notesScreenList');
  if(!el)return;
  const list=_notesFilter==='all'?_notesList:_notesFilter==='done'?_notesList.filter(n=>n.done):_notesList.filter(n=>!n.done);
  if(!list.length){el.innerHTML='<div class="emp">لا توجد ملاحظات</div>';return;}
  el.innerHTML=list.map((n,i)=>{
    const c=_noteColors[i%_noteColors.length];
    return`<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;margin-bottom:8px;border:0.5px solid var(--border-color);background:var(--bg-pure);transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='var(--bg-pure)'">
      <div onclick="toggleNoteScreen('${n.id}',${!n.done})" style="width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:12px">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span style="font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;background:${c.bg};color:${c.txt}">${c.lbl}</span>
      ${!n.done?`<span onclick="toggleNoteScreen('${n.id}',true)" style="font-size:11px;color:#1D6A3E;cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid #1D6A3E">✅ إنجاز</span>`:'<span style="font-size:11px;color:var(--text-hint);padding:3px 8px">منتهي</span>'}
      <span onclick="deleteNoteScreen('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`;
  }).join('');
}

function setNotesFilter(f,btn){
  _notesFilter=f;
  ['nfAll','nfUndone','nfDone'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.style.background='';b.style.color='';}
  });
  btn.style.background='var(--primary)';btn.style.color='#fff';
  renderNotesScreen();
}

async function addNoteFromScreen(){
  const input=document.getElementById('notesScreenInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNoteScreen(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNoteScreen(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  NOTES / TODO
// ══════════════════════════════════════════
let _notesList=[];

async function loadNotes(){
  try{
    _notesList=await sb('notes?user_id=eq.'+uid+'&order=created_at.desc');
    renderNotes();
  }catch(e){const el=document.getElementById('notesList');if(el)el.innerHTML='<div class="d-empty">—</div>';}
}

function renderNotes(){
  const el=document.getElementById('notesList');
  if(!el)return;
  const cnt=document.getElementById('notesCount');
  const undone=_notesList.filter(n=>!n.done).length;
  if(cnt)cnt.textContent=undone?`${undone} متبقي`:'✅ كل شيء تمام';
  if(!_notesList.length){el.innerHTML='<div class="d-empty">لا توجد ملاحظات بعد</div>';return;}
  el.innerHTML=_notesList.map(n=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:4px;transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='transparent'">
      <div onclick="toggleNote('${n.id}',${!n.done})" style="width:18px;height:18px;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:11px;transition:all .15s">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span onclick="deleteNote('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`).join('');
}

async function addNote(){
  const input=document.getElementById('noteInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNote(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNote(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function duesExportPDF(){
  notify('⏳ جاري التحضير...','ok');
  let dues=[];
  try{
    const res=await sb('contractor_dues?order=created_at.desc&limit=1000');
    dues=res||[];
    notify('✅ جاب '+dues.length+' مستحق','ok');
  }catch(e){notify('❌ خطأ: '+e.message,'er');return;}
  if(!dues.length){notify('لا توجد مستحقات في الجدول','warn');return;}
  _allDues=dues;
  const unpaid=_allDues.filter(d=>d.status==='unpaid');
  const paid=_allDues.filter(d=>d.status==='paid');
  const totalUnpaid=unpaid.reduce((s,d)=>s+d.amount,0);
  const totalPaid=paid.reduce((s,d)=>s+d.amount,0);
  const total=totalUnpaid+totalPaid;
  const html=_pdfOpen('مستحقات المقاولين')+
    _pdfHeader('💰 مستحقات المقاولين','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المستحقات</div><div class="kpi-val">▼ ${fn(total)} ج</div></div>
      <div class="kpi kpi-net-neg"><div class="kpi-lbl">غير مدفوع</div><div class="kpi-val">▼ ${fn(totalUnpaid)} ج</div></div>
      <div class="kpi kpi-net-pos"><div class="kpi-lbl">مدفوع</div><div class="kpi-val">✅ ${fn(totalPaid)} ج</div></div>
    </div>
    <div class="sec-ttl">📋 تفاصيل المستحقات</div>
    <table>
      <thead><tr><th>#</th><th>المقاول</th><th>المشروع</th><th>البيان</th><th>التاريخ</th><th>الحالة</th><th>المبلغ</th></tr></thead>
      <tbody>${_allDues.map((d,i)=>{
        const proj=allProjectsMap[d.project_id];
        const isPaid=d.status==='paid';
        return`<tr><td class="rep-table-num">${i+1}</td><td>${d.contractor}</td><td>${proj?.name||'—'}</td><td>${d.description||'—'}</td><td>${d.due_date||'—'}</td><td style="color:${isPaid?'#1D6A3E':'#C86060'};font-weight:700">${isPaid?'✅ مدفوع':'⏳ غير مدفوع'}</td><td class="amt ${isPaid?'pos':'neg'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</td></tr>`;
      }).join('')}</tbody>
      <tfoot><tr><td colspan="6">إجمالي المستحقات</td><td class="amt neg">▼ ${fn(total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function duesExportExcel(){try{
  if(!_allDues||!_allDues.length){
    _allDues=await sb('contractor_dues?order=created_at.desc');
    if(!_allDues||!_allDues.length){notify('لا توجد بيانات','warn');return;}
  }
  if(!window.ExcelJS){const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r);}
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);
  const total=unpaid+paid;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('مستحقات المقاولين',{views:[{rightToLeft:true}]});
  const COLS=7;ws.columns=[{width:8},{width:22},{width:20},{width:25},{width:16},{width:16},{width:18}];
  _xlHeader(ws,'💰 مستحقات المقاولين','إجمالي: '+fn(total)+' ج  |  غير مدفوع: '+fn(unpaid)+' ج  |  مدفوع: '+fn(paid)+' ج',COLS);
  _xlHdrRow(ws,['#','المقاول','المشروع','البيان','التاريخ','الحالة','المبلغ (ج)'],COLS);
  _allDues.forEach((d,i)=>{
    const proj=allProjectsMap[d.project_id];
    const isPaid=d.status==='paid';
    _xlDataRow(ws,[i+1,d.contractor,proj?.name||'—',d.description||'—',d.due_date||'—',isPaid?'✅ مدفوع':'⏳ غير مدفوع',d.amount],i,[null,null,null,null,null,null,isPaid?_XC.PS:_XC.RD]);
  });
  _xlTotRow(ws,['','','','','','إجمالي',total],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='مستحقات_المقاولين_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

async function loadDuesScreen(){
  const sel=document.getElementById('duesProjectFilter');
  if(sel&&allProjects.length){
    sel.innerHTML='<option value="all">كل المشاريع</option>';
    allProjects.forEach(p=>{
      sel.innerHTML+=`<option value="${p.id}">${esc(p.name)}</option>`;
    });
  }
  // إخفاء النتائج والأزرار في البداية
  _allDues=[];
  document.getElementById('duesScreenList').innerHTML='';
  document.getElementById('duesScreenKpi').innerHTML='';
  const filtersEl=document.getElementById('duesScreenFilters');
  if(filtersEl)filtersEl.style.display='none';
  document.getElementById('duesScreenSub').textContent='اختار مشروع واضغط بحث';
}

async function searchDues(){
  const projId=document.getElementById('duesProjectFilter')?.value;
  document.getElementById('duesScreenList').innerHTML='<div class="emp">⏳ جاري البحث...</div>';
  notify('⏳ جاري البحث...','ok');
  try{
    let query='contractor_dues?order=created_at.desc&limit=1000';
    if(projId&&projId!=='all') query+=`&project_id=eq.${projId}`;
    _allDues=await sb(query);
    _duesFilter='all';
    // إظهار أزرار الفلتر
    const filtersEl=document.getElementById('duesScreenFilters');
    if(filtersEl)filtersEl.style.display='flex';
    renderDuesScreen();
  }catch(e){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">❌ خطأ في البحث</div>';
  }
}

function filterDuesScreen(f){
  _duesFilter=f;
  ['all','unpaid','paid'].forEach(x=>{
    const btn=document.getElementById('duesFilter'+x.charAt(0).toUpperCase()+x.slice(1));
    if(btn){btn.style.background=x===f?'var(--primary)':'';btn.style.color=x===f?'#fff':'';}
  });
  renderDuesScreen();
}

function renderDuesScreen(){
  const filtered=_duesFilter==='all'?_allDues:_allDues.filter(d=>d.status===_duesFilter);
  const total=_allDues.reduce((s,d)=>s+d.amount,0);
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  document.getElementById('duesScreenSub').textContent=`${_allDues.length} مستحق`;
  document.getElementById('duesScreenKpi').innerHTML=`
    <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>`;

  if(!filtered.length){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">لا توجد مستحقات</div>';
    return;
  }

  const html=filtered.map(d=>{
    const isPaid=d.status==='paid';
    const proj=allProjectsMap[d.project_id];
    return `<div class="rw">
      <div class="ri">
        <div class="rd" style="font-weight:700">${d.contractor}</div>
        <div class="rm" style="color:#888;font-size:11px">${proj?.name||'—'} · ${d.description||'—'} ${d.due_date?'· '+d.due_date:''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="ra" style="color:${isPaid?'var(--success)':'var(--danger)'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</div>
        <button onclick="toggleDueFromScreen('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'var(--danger)':'var(--success)'};background:transparent;color:${isPaid?'var(--danger)':'var(--success)'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('duesScreenList').innerHTML=html;
}

async function toggleDueFromScreen(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _allDues=_allDues.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesScreen();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteDue(id){await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المستحق',msg:'هيتحذف المستحق نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  try{
    await sb('contractor_dues?id=eq.'+id,'DELETE');
    _duesList=_duesList.filter(d=>d.id!==id);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

let _editDueId=null;

function editDue(id){
  const d=_duesList.find(x=>x.id===id);
  if(!d)return;
  _editDueId=id;
  document.getElementById('dueEpContr').value=d.contractor||'';
  document.getElementById('dueEpAmt').value=d.amount||'';
  document.getElementById('dueEpDesc').value=d.description||'';
  document.getElementById('dueEpDate').value=d.due_date||'';
  const dtEl=document.getElementById('dueEpDate');
  if(dtEl)initDateInput(dtEl);
  document.getElementById('dueEp').style.display='block';
}

async function saveDueEdit(){
  if(!_editDueId)return;
  const contractor=document.getElementById('dueEpContr').value.trim();
  const amount=parseFloat(document.getElementById('dueEpAmt').value);
  const description=document.getElementById('dueEpDesc').value.trim();
  const due_date=document.getElementById('dueEpDate').value.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    await sb('contractor_dues?id=eq.'+_editDueId,'PATCH',{contractor,amount,description:description||null,due_date:due_date||null});
    _duesList=_duesList.map(x=>x.id===_editDueId?{...x,contractor,amount,description:description||null,due_date:due_date||null}:x);
    document.getElementById('dueEp').style.display='none';
    _editDueId=null;
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function editDueDate(id,currentDate){
  const newDate=prompt('التاريخ الجديد (dd/mm/yyyy):',currentDate||'');
  if(newDate===null)return;
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{due_date:newDate.trim()||null});
    _duesList=_duesList.map(d=>d.id===id?{...d,due_date:newDate.trim()||null}:d);
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

function tim(){const im=document.getElementById('im');im.style.display=im.style.display==='block'?'none':'block';sit(cT);}
function sit(t){imType=t;const imE=document.getElementById('imE');const imI=document.getElementById('imI');const imH=document.getElementById('imH');if(imE)imE.classList.toggle('on',t==='e');if(imI)imI.classList.toggle('on',t==='i');if(imH)imH.textContent=t==='e'?'الترتيب: المبلغ ⇥ البند ⇥ البيان ⇥ التاريخ ⇥ المقاول':'الترتيب: المبلغ ⇥ البيان ⇥ التاريخ';}

function triggerImport(){sit(cT);document.getElementById('xlsxFileInput').click();}

// ██ IMPORT PREVIEW ════════════════════════════════
let _pendingImportEnts=null;
// ██ ENTRIES — إضافة + تعديل + حذف ══════════════

function showImportPreview(ents,sk){
  _pendingImportEnts=ents;
  const modal=document.getElementById('importPreviewModal');
  const sub=document.getElementById('impPreviewSub');
  const table=document.getElementById('impPreviewTable');
  if(!modal)return;
  sub.textContent=ents.length+' قيد جاهز للإضافة'+(sk?' · تم تخطي '+sk+' صف':'');
  const isExp=ents[0]?.type==='e';
  const headers=isExp
    ?['#','النوع','المبلغ','البند','البيان','التاريخ','المقاول','المشروع']
    :['#','النوع','المبلغ','البيان','التاريخ','المشروع'];
  table.innerHTML=`<thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${
    ents.slice(0,100).map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const typeCell=`<td><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:${e.type==='i'?'var(--success-glow)':'var(--danger-pale)'};color:${e.type==='i'?'var(--primary-btn)':'var(--danger)'}">${e.type==='i'?'▲ وارد':'▼ مصروف'}</span></td>`;
      const amtCell=`<td class="${e.type==='i'?'td-inc':'td-exp'}">${fn(e.amount)} ج</td>`;
      if(isExp)return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${esc(e.category)||'—'}</td><td>${esc(e.description)||'—'}</td><td>${e.entry_date||'—'}</td><td>${esc(e.contractor)||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
      return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${esc(e.description)||'—'}</td><td>${e.entry_date||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
    }).join('')
  }${ents.length>100?`<tr><td colspan="${headers.length}" style="text-align:center;padding:10px;color:var(--text-hint)">... و${ents.length-100} قيد آخر</td></tr>`:''}
  </tbody>`;
  modal.style.display='flex';
}

function closeImportPreview(){
  document.getElementById('importPreviewModal').style.display='none';
  _pendingImportEnts=null;
  const inp=document.getElementById('xlsxFileInput');
  if(inp)inp.value='';
}

async function confirmImport(){
  const ents=_pendingImportEnts;
  if(!ents||!ents.length)return;
  closeImportPreview();
  setSav('💾 جاري الاستيراد ('+ents.length+' قيد)...','ng');
  try{
    if(uRole==='admin'){
      const last=await sb('entries?select=seq&order=seq.desc&limit=1');
      let nextSeq=(last&&last.length?Number(last[0].seq||20260000):20260000);
      if(nextSeq<20260000)nextSeq=20260000;
      ents.forEach(e=>{nextSeq++;e.seq=nextSeq;e.created_by=uid;});
      await sb('entries','POST',ents);
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);
      refreshProjSummary(curPid);
      setSav('✅ تم استيراد '+ents.length+' قيد','ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    document.getElementById('imT')&&(document.getElementById('imT').value='');
    document.getElementById('im').style.display='none';
    rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function importFromXlsx(input){
  const file=input.files[0];
  if(!file)return;
  setSav('⏳ جاري قراءة الملف...','ng');
  if(!window.XLSX){
    await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  }
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheetName=imType==='e'?'مصروفات':'وارد';
    const ws=wb.Sheets[sheetName]||wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    const dataRows=rows.slice(3).filter(r=>r[0]&&!isNaN(parseFloat(String(r[0]).replace(/,/g,''))));
    if(!dataRows.length){setSav('⚠️ لا توجد بيانات في الملف','er');input.value='';return;}
    const ents=[];let sk=0;
    const projMap={};allProjects.forEach(p=>{projMap[p.name.trim().toLowerCase()]=p.id;});
    dataRows.forEach(r=>{
      const am=parseFloat(String(r[0]).replace(/,/g,''));
      if(isNaN(am)||am===0){sk++;return;}
      let dt='';
      if(r[3]){
        if(typeof r[3]==='number'){const d=XLSX.SSF.parse_date_code(r[3]);dt=`${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}`;}
        else{dt=String(r[3]).trim();}
      }
      let pid=curPid;
      if(r[5]){const pn=String(r[5]).trim().toLowerCase();if(projMap[pn])pid=projMap[pn];}
      if(imType==='e'){
        if(!r[1]){sk++;return;}
        ents.push({id:uid_(),project_id:pid,type:'e',amount:am,category:String(r[1]).trim(),description:String(r[2]||'').trim(),entry_date:pimd(dt)||dt,contractor:String(r[4]||'').trim()});
      }else{
        ents.push({id:uid_(),project_id:pid,type:'i',amount:am,description:String(r[1]||'دفعة').trim(),entry_date:pimd(dt)||dt,category:'',contractor:''});
      }
    });
    if(!ents.length){setSav('⚠️ لم يتم التعرف على أي قيد','er');input.value='';return;}
    input.value='';
    setSav('','ok');
    showImportPreview(ents,sk);
  }catch(e){setSav('❌ '+friendlyError(e),'er');input.value='';}
}


function rp(){
  // Rebuild sidebar project list
  const sc=document.getElementById('sb-proj-list');if(sc)sc.innerHTML='';
  buildSidebarProjects();
  const p=curP();
  const ps=document.getElementById('ps');ps.innerHTML='';
  if(!projects.length){ps.innerHTML='<option>لا توجد مشاريع</option>';document.getElementById('ent').innerHTML='<div class="emp">لا توجد مشاريع</div>';return;}
  projects.forEach(pr=>{const o=document.createElement('option');o.value=pr.id;o.textContent=pr.name;if(pr.id===curPid)o.selected=true;ps.appendChild(o);});
  if(p){document.getElementById('dst').value=p.start_date||'';document.getElementById('dcl').value=p.close_date||'';}
  const inc=pInc().reduce((s,e)=>s+e.amount,0),exp=pExp().reduce((s,e)=>s+e.amount,0),bal=inc-exp;
  const _pct=inc>0?Math.round((exp/inc)*100):0;
  const _pctCls=_pct<70?'kc-pct-ok':_pct<90?'kc-pct-warn':'kc-pct-danger';
  const _balCls=bal<0?'kc-neg':'kc-bal';
  const _balValCls=bal<0?'kv kv-neg':'kv kv-pos';
  const _balLbl=bal<0?'⚠ عجز':'الرصيد';
  (document.getElementById('kp')||{}).innerHTML=
    '<div class="kc kc-inc"><div class="kl">الوارد</div><div class="kv kv-inc">'+fn(inc)+'</div></div>'+
    '<div class="kc kc-exp"><div class="kl">المصروف <span class="kc-pct '+_pctCls+'">'+_pct+'%</span></div><div class="kv kv-exp">'+fn(exp)+'</div><div class="kc-bar"><div class="kc-bar-fill" style="width:'+Math.min(_pct,100)+'%"></div></div></div>'+
    '<div class="kc '+_balCls+'"><div class="kl">'+_balLbl+'</div><div class="'+_balValCls+'">'+fn(Math.abs(bal))+'</div></div>';
  // Old datalist (hidden but kept for compatibility)
  const _cl=document.getElementById('cl');if(_cl)_cl.innerHTML=[...new Set(pExp().map(e=>e.category))].filter(x=>x).map(c=>'<option value="'+c+'">').join('');
  // Refresh categories list with project categories
  const projCats=[...new Set(pExp().map(e=>e.category).filter(Boolean))];
  projCats.forEach(c=>{if(!allCategories.includes(c))allCategories.push(c);});
  allCategories.sort();
  renderCatOpts('');
  const _ql=document.getElementById('ql');if(_ql)_ql.innerHTML=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x).map(q=>'<option value="'+q+'">').join('');
  const cs=[...new Set(pExp().map(e=>e.category))].filter(x=>x);
  const mqs=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x);
  const tot=entries.length;
  const tabs=[['s','ملخص',0,''],['j','📒 يومية',tot,'jr'],['m','👷 مقاولين',mqs.length,'mq'],['dues','💰 مستحقات',0,''],['i','الوارد',pInc().length,'']];
  cs.forEach(c=>tabs.push([c,c,pExp().filter(e=>e.category===c).length,'']));
  (document.getElementById('tbs')||{}).innerHTML=tabs.map(t=>'<button class="tab'+(t[0]===cTab?' on':'')+(t[3]?' '+t[3]:'')+'" onclick="stab(\''+t[0].replace(/'/g,"\\'")+'\')">'+t[1]+(t[2]>0?'<span class="c">'+t[2]+'</span>':'')+'</button>').join('');
  re();
}
function re(){
  const el=document.getElementById('ent');
  const canEdit=uRole!=='viewer'&&uRole!=='owner';
  if(cTab==='s'){
    const cs={};pExp().forEach(e=>{const cat=e.category||'بدون بند';cs[cat]=(cs[cat]||0)+e.amount;});
    const ls=Object.entries(cs).sort((a,b)=>b[1]-a[1]);
    const tt=ls.reduce((s,c)=>s+c[1],0);
    if(!ls.length){el.innerHTML='<div class="emp">لا توجد بيانات</div>';return;}
    el.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البند</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">النسبة</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">الإجمالي</th>
      </tr></thead>
      <tbody>
      ${ls.map(([c,a],i)=>{
        const pct=tt?((a/tt)*100).toFixed(1):0;
        const rowBg=i%2===0?'#fff':'#f7f7f5';
        return `<tr style="background:${rowBg};border-bottom:0.5px solid #e8e8e4;cursor:pointer" onclick="setCTab('${c.replace(/'/g,"\\'")}');re()" onmouseover="this.style.background='#eef4ee'" onmouseout="this.style.background='${rowBg}'" title="اضغط لعرض قيود ${c}">
          <td style="padding:7px 10px;color:#999;font-size:11px">${i+1}</td>
          <td style="padding:7px 10px;font-weight:500;color:#222">${c}</td>
          <td style="padding:7px 10px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:#eee;border-radius:4px;height:6px">
                <div style="width:${pct}%;background:#1D3C2A;border-radius:4px;height:6px"></div>
              </div>
              <span style="color:#888;font-size:11px;min-width:35px">${pct}%</span>
            </div>
          </td>
          <td style="padding:7px 10px;font-weight:500;color:#E74C3C;white-space:nowrap">▼ ${fn(a)} ج</td>
        </tr>`;
      }).join('')}
      <tr style="background:#1D3C2A">
        <td colspan="3" style="padding:8px 10px;color:#D4C49A;font-weight:500;font-size:11px">الإجمالي الكلي</td>
        <td style="padding:8px 10px;color:#D4C49A;font-weight:500;white-space:nowrap">▼ ${fn(tt)} ج</td>
      </tr>
      </tbody>
    </table>`;
    return;
  }
  if(cTab==='j'){const flt=getFilteredEntries();const j=flt?[...flt].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)):gJ();if(!j.length){el.innerHTML='<div class="emp">لا توجد قيود'+(flt?' للفلتر الحالي':' بعد')+'</div>';return;}
    const PAGE=60;const totalPages=Math.ceil(j.length/PAGE);
    const cp=window._rpPage||0;const start=cp*PAGE;const slice=j.slice(start,start+PAGE);
    const pager=totalPages>1?`<div class="pg-bar">${cp>0?`<button class="pg-btn" onclick="window._rpPage=${cp-1};re()">‹ السابق</button>`:''}
      <span class="pg-info">صفحة ${cp+1} / ${totalPages} (${j.length} قيد)</span>
      ${cp<totalPages-1?`<button class="pg-btn" onclick="window._rpPage=${cp+1};re()">التالي ›</button>`:''}</div>`:'';
    const tblRows=slice.map((e,i)=>{
      const ii=e.type==='i';
      const ab=e.advance_id?'<span class="ab-badge">عهدة</span> ':'';
      const rcpt=`<td style="padding:4px 6px;text-align:center"><button onclick="event.stopPropagation();printReceipt('${e.id}')" title="إيصال" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500">إيصال</button></td>`;
      const del=canEdit?`<td style="padding:4px 6px;text-align:center"><button class="db" onclick="event.stopPropagation();de('${e.id}')">🗑</button></td>`:'';
      const rowBg=i%2===0?'#fff':'#f7f7f5';
      return `<tr style="background:${rowBg};border-bottom:0.5px solid #e8e8e4;cursor:pointer" onclick="oe('${e.id}')" onmouseover="this.style.background='#eef4ee'" onmouseout="this.style.background='${rowBg}'">
        <td class="mob-hide" style="padding:7px 10px;color:#999;font-size:11px">${i+1+start}</td>
        <td class="mob-hide" style="padding:7px 10px;white-space:nowrap"><span class="nb" style="font-size:10px">${e.seq||'?'}</span></td>
        <td style="padding:7px 10px;white-space:nowrap;color:#888;font-size:11px">${cleanDate(e.entry_date)||'—'}</td>
        <td style="padding:7px 10px"><span style="font-size:10px;background:#f0f0ec;border:0.5px solid #ddd;padding:2px 7px;border-radius:10px;color:#666">${ii?'وارد':esc(e.category)||'—'}</span></td>
        <td style="padding:7px 10px;color:#222">${ab}${esc(e.description)||'—'}</td>
        <td class="mob-hide" style="padding:7px 10px;color:#888;font-size:11px">${esc(e.contractor)||'—'}</td>
        <td style="padding:7px 10px;white-space:nowrap;font-weight:500;color:${ii?'#27AE60':'#E74C3C'}">${ii?'+':'-'}${fn(Math.abs(e.amount))} ج</td>
        <td class="mob-hide" style="padding:7px 10px;white-space:nowrap;color:${e.bal<0?'#E74C3C':e.bal>0?'#27AE60':'#888'};font-size:11px">${fn(e.bal)} ج</td>
        ${rcpt}${del}
      </tr>`;
    }).join('');
    el.innerHTML=pager+`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th class="mob-hide" style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th class="mob-hide" style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">رقم القيد</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">التاريخ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البند</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البيان</th>
        <th class="mob-hide" style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">المقاول</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">المبلغ</th>
        <th class="mob-hide" style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">الرصيد</th>
        ${canEdit?'<th></th>':''}
      </tr></thead>
      <tbody>${tblRows}</tbody>
    </table>`+pager;return;}
  if(cTab==='m'){
    const mqMap={};
    pExp().filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={n:e.contractor,pay:0,work:0,mat:0,other:0,rows:[]};
      const m=mqMap[e.contractor];
      if(e.entry_type==='payment')m.pay+=e.amount;
      else if(e.entry_type==='work')m.work+=e.amount;
      else if(e.entry_type==='material')m.mat+=e.amount;
      else m.other+=e.amount;
      m.rows.push(e);
    });
    const mqs=Object.values(mqMap).sort((a,b)=>(b.pay+b.work+b.mat+b.other)-(a.pay+a.work+a.mat+a.other));
    if(!mqs.length){el.innerHTML='<div class="emp">لا يوجد مقاولين بعد</div>';return;}
    window._mqList=mqs;
    el.innerHTML=mqs.map((m,idx)=>{
      const rem=m.pay-(m.work+m.mat);
      const hasTypes=m.rows.some(e=>e.entry_type);
      const addBtn=canEdit?`<button onclick="event.stopPropagation();mqAddByIdx(${idx})" class="mq-add-btn">+ قيد</button>`:'';
      const printBtn=`<button onclick="event.stopPropagation();mqPrintReport(${idx})" class="mq-print-btn">🖨️ تقرير</button>`;
      const rows=m.rows.sort((a,b)=>pdt(b.entry_date)-pdt(a.entry_date)).map(e=>{
        const etLbl={'payment':'\u{1F4B0} دفعة','work':'\u{1F528} أعمال','material':'\u{1F529} مصنعيات'};
        const etBg={'payment':'var(--success-pale)','work':'var(--info-bg)','material':'var(--warning-pale)'};
        const etC={'payment':'var(--primary-btn)','work':'var(--info)','material':'var(--warning-dark)'};
        const tag=e.entry_type?`<span style="background:${etBg[e.entry_type]};color:${etC[e.entry_type]};padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700">${etLbl[e.entry_type]||e.entry_type}</span>`:'';
        const del=canEdit?`<button class="db" onclick="event.stopPropagation();de('${e.id}')">\u{1F5D1}</button>`:'';
        return `<div class="rw${canEdit?' clk':''}" onclick="oe('${e.id}')"><div class="ri"><div class="rd">${tag} ${esc(e.description)||'—'} <span class="nb">${e.seq||'?'}</span></div><div class="rm">${e.entry_date||'—'} · ${esc(e.category)||'—'}</div></div><div class="flex-center-gap"><div class="ra">${fn(e.amount)} ج</div>${del}</div></div>`;
      }).join('');
      const kpis=hasTypes?`<div class="mq-kpi-grid"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">${fn(m.pay)}</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">${fn(m.work)}</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">${fn(m.mat)}</div></div><div style="background:${rem>=0?'var(--success-ghost)':'var(--danger-ghost)'};border-radius:8px;padding:8px;text-align:center"><div class="lbl-sm">${rem>=0?'الباقي معاه':'مستحق عليك'}</div><div style="font-weight:900;color:${rem>=0?'var(--primary)':'var(--danger)'};font-size:13px">${fn(Math.abs(rem))}</div></div></div>`:`<div class="mq-total-row"><span style="color:var(--text-soft);font-size:12px">إجمالي المسحوب</span><span style="font-weight:700;color:#1D3C2A">${fn(m.pay+m.work+m.mat+m.other)} ج</span></div>`;
      return `<div class="mq-contractor-card"><div class="mq-card-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'"><div class="mq-card-header-inner"><span class="mq-card-name">👷 ${m.n}</span><div style="display:flex;gap:6px;align-items:center">${printBtn}${addBtn}<span class="mq-card-count">${m.rows.length} قيد ▼</span></div></div></div><div style="padding:14px 16px">${kpis}<div>${rows}</div></div></div>`;
    }).join('');
    return;
  }
  if(cTab==='dues'){loadDuesTab(el);return;}
  let es=cTab==='i'?pInc():pExp().filter(e=>e.category===cTab);
  es=[...es].sort((a,b)=>(b.seq||0)-(a.seq||0));
  if(!es.length){el.innerHTML='<div class="emp">لا توجد قيود</div>';return;}
  const hasMqTypes=es.some(e=>e.contractor&&e.entry_type);
  const etypeLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
  let html='';
  if(hasMqTypes){
    html+=`<div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="setCatView('list',this)" class="cat-view-list-btn" id="cvList">📋 القيود</button>
      <button onclick="setCatView('mq',this)" class="cat-view-mq-btn" id="cvMq">👷 المقاولين</button>
    </div><div id="catListView">`;
  }
  html+=`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
    <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">#</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">رقم القيد</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">التاريخ</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">البند</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px">البيان</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">المقاول</th>
      <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-weight:500;font-size:11px;white-space:nowrap">المبلغ</th>
      ${canEdit?'<th style="color:#D4C49A;padding:8px 10px;text-align:center;font-weight:500;font-size:11px"></th>':''}
    </tr></thead>
    <tbody>
    ${es.map((e,i)=>{
      const ab=e.advance_id?'<span class="ab-badge">عهدة</span> ':'';
      const no=`<span class="nb" style="font-size:10px">${e.seq||'?'}</span>`;
      const rcpt=`<td style="padding:4px 6px;text-align:center"><button onclick="event.stopPropagation();printReceipt('${e.id}')" title="إيصال" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500">إيصال</button></td>`;
      const del=canEdit?`<td style="padding:4px 6px;text-align:center"><button class="db" onclick="event.stopPropagation();de('${e.id}')">🗑</button></td>`:'';
      const rowBg=i%2===0?'#fff':'#f7f7f5';
      return `<tr style="background:${rowBg};border-bottom:0.5px solid #e8e8e4;cursor:pointer" onclick="oe('${e.id}')" onmouseover="this.style.background='#eef4ee'" onmouseout="this.style.background='${rowBg}'">
        <td style="padding:7px 10px;color:#999;font-size:11px">${i+1}</td>
        <td style="padding:7px 10px;white-space:nowrap">${no}</td>
        <td style="padding:7px 10px;white-space:nowrap;color:#888;font-size:11px">${cleanDate(e.entry_date)||'—'}</td>
        <td style="padding:7px 10px;white-space:nowrap"><span style="font-size:10px;background:#f0f0ec;border:0.5px solid #ddd;padding:2px 7px;border-radius:10px;color:#666">${esc(e.category)||'—'}</span></td>
        <td style="padding:7px 10px;color:#222">${ab}${esc(e.description)||'—'}</td>
        <td style="padding:7px 10px;color:#888;font-size:11px">${esc(e.contractor)||'—'}</td>
        <td style="padding:7px 10px;white-space:nowrap;font-weight:500;color:${e.type==='i'?'#27AE60':'#E74C3C'}">${e.type==='i'?'+':'-'}${fn(Math.abs(e.amount))} ج</td>
        ${del}
      </tr>`;
    }).join('')}
    </tbody>
  </table>`;
  if(hasMqTypes){
    html+='</div><div id="catMqView" style="display:none">';
    const mqMap={};
    es.filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={pay:0,work:0,mat:0,rows:[]};
      if(e.entry_type==='payment')mqMap[e.contractor].pay+=e.amount;
      else if(e.entry_type==='work')mqMap[e.contractor].work+=e.amount;
      else if(e.entry_type==='material')mqMap[e.contractor].mat+=e.amount;
      mqMap[e.contractor].rows.push(e);
    });
    html+=Object.entries(mqMap).map(([name,d])=>{
      const rem=d.pay-(d.work+d.mat);
      const rows=d.rows.map(e=>{
        const et=etypeLbl[e.entry_type]||'—';
        const etC=e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':'var(--warning-dark)';
        const etBg=e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':'var(--warning-pale)';
        return '<div class="mq-entry-row"><span class="mq-entry-type">'+et+'</span><span style="flex:1;color:#444">'+(e.description||'—')+'</span><span style="font-weight:700;color:#555">'+fn(e.amount)+' ج</span></div>';
      }).join('');
      return '<div class="mq-grouped-card"><div class="mq-grouped-header"><span class="mq-grouped-name">👷 '+name+'</span></div><div style="padding:12px 14px"><div class="mq-grouped-kpis"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">'+fn(d.pay)+'</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">'+fn(d.work)+'</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">'+fn(d.mat)+'</div></div></div><div class="mq-grouped-balance"><span style="font-size:12px;color:#666">الباقي معاه</span><span class="mq-grouped-balance-val">'+fn(rem)+' ج</span></div>'+rows+'</div></div>';
    }).join('');
    html+='</div>';
  }
  el.innerHTML=html;
}

// ADVANCES
