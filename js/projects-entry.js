// ══ CATEGORY FIELD ════════════════════════════════
const _CATS = [
  'اشراف هندسي','اعمال حدادة','اعمال معدنية','اكرامبه','السلاب',
  'الوارد','الوميتال','الوميتال&سوكريت','ايجار','ايرا سيستم',
  'بنا','بنود يتحملها المكتب','تجهيزات','تجهيزات موقع','تشوينات',
  'تصوير','تكسيات','تكييفات','تلفيات مصعد','تيار خفيف',
  'جبس','جبس بورد','حدادة','حديد','حمام سباحة','خرسانات','خرسانه',
  'رتش','رخام','زراعة','زراعه','ساوند سيستم','سباكة','سباكه',
  'شخصي','شفاط','صاج','طاقه مصر','طوله الالف','عزل','عزل صوتي',
  'عمالة','عماله','فرش','قرميد','كهربا','مباني&خرسانات','محارة',
  'مرتبات','مطبخ','نثريات','نجارة'
];

let _catOpen = false;

function _getAllCats() {
  const extra = (allEntries||[]).map(e=>e.category).filter(Boolean);
  return [...new Set([..._CATS, ...extra])].sort();
}

function _renderCatList(q) {
  const list = document.getElementById('_catList');
  if (!list) return;
  const all = _getAllCats();
  const filtered = q ? all.filter(c => c.includes(q)) : all;
  if (!filtered.length) {
    list.innerHTML = `<div style="padding:10px 14px;color:var(--text-muted);font-size:12px">لا يوجد — اضغط حفظ لإضافة "${q}"</div>`;
    return;
  }
  list.innerHTML = filtered.map(c => `<div
    onmousedown="event.preventDefault();_selectCat('${c.replace(/'/g,"\'")}')"
    style="padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border-faint,#eee);color:var(--text-main)"
    onmouseenter="this.style.background='var(--bg-ivory,#f5f0e8)'"
    onmouseleave="this.style.background=''">
    ${c}
  </div>`).join('');
}

function _openCatDD() {
  const dd = document.getElementById('_catDD');
  if (!dd) return;
  _catOpen = true;
  dd.style.display = 'block';
  _renderCatList(document.getElementById('ic')?.value || '');
}

function _closeCatDD() {
  _catOpen = false;
  const dd = document.getElementById('_catDD');
  if (dd) dd.style.display = 'none';
}

function _selectCat(val) {
  const inp = document.getElementById('ic');
  if (inp) { inp.value = val; _clearErr('ic','err-ic'); }
  _closeCatDD();
}

function _onCatInput(val) {
  _clearErr('ic','err-ic');
  if (!val) { _closeCatDD(); return; }
  if (!_catOpen) _openCatDD();
  _renderCatList(val);
}

function _onCatFocus() { _openCatDD(); }

function _onCatBlur() {
  setTimeout(_closeCatDD, 150);
}
// ═══════════════════════════════════════════════════

// ══ ENTRY FORM — بحث المشروع ══════════════════
let _entProjDDOpen=false;

function toggleEntProjDD(){
  const dd=document.getElementById('entryProjDD');
  const arrow=document.getElementById('entryProjArrow');
  if(!dd)return;
  if(_entProjDDOpen){
    dd.style.display='none';
    if(arrow)arrow.style.transform='translateY(-50%) rotate(0deg)';
    _entProjDDOpen=false;
    return;
  }
  dd.style.display='block';
  if(arrow)arrow.style.transform='translateY(-50%) rotate(180deg)';
  _entProjDDOpen=true;
  entProjSearch('');
  setTimeout(()=>document.getElementById('entryProjSrch')?.focus(),50);
  setTimeout(()=>{
    document.addEventListener('click',function _c(e){
      const wrap=document.getElementById('entryProjInput')?.parentElement;
      if(wrap&&!wrap.contains(e.target)){
        dd.style.display='none';
        if(arrow)arrow.style.transform='translateY(-50%) rotate(0deg)';
        _entProjDDOpen=false;
      }
      document.removeEventListener('click',_c);
    });
  },100);
}

function entProjSearch(q){
  const list=document.getElementById('entryProjList');
  if(!list)return;
  const filtered=(allProjects||[]).filter(p=>!q.trim()||p.name.includes(q.trim()));
  if(!filtered.length){list.innerHTML='<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px">لا توجد نتائج</div>';return;}
  list.innerHTML=filtered.map(p=>`
    <div onclick="entProjSelect('${p.id}','${p.name.replace(/'/g,"\'")}')"
      style="padding:10px 14px;cursor:pointer;font-size:13px;font-weight:600;border-bottom:1px solid var(--border-faint,#f5f0e8);display:flex;align-items:center;gap:8px"
      onmouseenter="this.style.background='var(--bg-ivory,#f5f0e8)'"
      onmouseleave="this.style.background=''">
      <span style="font-size:11px;color:var(--text-muted)">📁</span>${p.name}
    </div>`).join('');
}

function entProjSelect(id,name){
  document.getElementById('entryProjId').value=id;
  document.getElementById('entryProjInput').value=name;
  const dd=document.getElementById('entryProjDD');
  const arrow=document.getElementById('entryProjArrow');
  if(dd)dd.style.display='none';
  if(arrow)arrow.style.transform='translateY(-50%) rotate(0deg)';
  _entProjDDOpen=false;
  if(id!==curPid)goToProject(id);
}

function _showEntryConfirm(msg, color){
  const ex=document.getElementById('_entConfirmMsg');
  if(ex)ex.remove();
  // حطها فوق فورم الإدخال
  const form=document.getElementById('entryForm');
  if(!form)return;
  const el=document.createElement('div');
  el.id='_entConfirmMsg';
  el.style.cssText=`background:${color};color:#fff;padding:10px 16px;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;text-align:center;margin-bottom:10px;animation:fadeIn .2s ease`;
  el.textContent=msg;
  form.insertBefore(el, form.firstChild);
  setTimeout(()=>el.remove(), 3000);
}

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
function onEditPmtChange(v){
  const other=document.getElementById('ePmtOther');
  if(other)other.style.display=v==='أخرى'?'block':'none';
}

function onPmtChange(v){
  const other=document.getElementById('iPmtOther');
  if(other)other.style.display=v==='أخرى'?'block':'none';
}

function _resetSaveBtn(){
  window._savingEntry=false;
  const _rb=document.getElementById('addEntryBtn');
  if(_rb){_rb.disabled=false;_rb.textContent='+ إضافة القيد';}
}
async function ae(){
  // منع الضغط المزدوج
  if(window._savingEntry)return;
  window._savingEntry=true;
  const _addBtn=document.getElementById('addEntryBtn');
  if(_addBtn){_addBtn.disabled=true;_addBtn.textContent='⏳ جاري الحفظ...';}
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
  _mark('idt','err-idt',!dt);
  if(_hasErr){notify('❌ اكمل الحقول الإلزامية — البيان والبند والتاريخ مطلوبين','err');_resetSaveBtn();return;}
  // تحويل التاريخ dd/mm/yyyy لـ Date object
  function _parseDate(s){if(!s)return null;const p=s.split('/');if(p.length===3)return new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0]));return null;}
  // تحذير لو التاريخ في المستقبل
  if(dt){
    const entDt=_parseDate(dt);const today=new Date();today.setHours(0,0,0,0);
    if(entDt&&entDt>today){
      const go=await new Promise(res=>showConfirm({icon:'⚠️',title:'تاريخ في المستقبل',msg:'التاريخ المدخل ('+dt+') في المستقبل. متأكد؟',okLabel:'نعم، حفظ',okType:'warn',onOk:()=>res(true),onCancel:()=>res(false)}));
      if(!go){_resetSaveBtn();return;}
    }
  }
  // تحقق من إقفال الفترة المحاسبية (من الكاش)
  if(dt){
    const _p=dt.split('/');
    if(_p.length===3){
      const _yr=parseInt(_p[2]);const _mo=parseInt(_p[1]);
      const _locks=await _getPeriodLocks();
      const _locked=_locks.find(l=>l.year===_yr&&l.month===_mo);
      if(_locked){notify('⚠️ هذا الشهر ('+_mo+'/'+_yr+') مقفول — تم الإضافة مع التنبيه','warn');}
    }
  }
  // تحقق من قيد مكرر (نفس البيان + المبلغ + التاريخ في نفس المشروع)
  const _dup=entries.find(e=>e.description===d&&parseFloat(e.amount)===a&&e.entry_date===dt&&e.type===cT);
  if(_dup){
    const go=await new Promise(res=>showConfirm({icon:'⚠️',title:'قيد مشابه موجود',msg:'يوجد قيد بنفس البيان والمبلغ والتاريخ (#'+(_dup.seq||'؟')+')\nمتأكد إنه مش مكرر؟',okLabel:'نعم، حفظ',okType:'warn',onOk:()=>res(true),onCancel:()=>res(false)}));
    if(!go){_resetSaveBtn();return;}
  }
  // snapshot الـ pid واسم المشروع وقت الضغط على حفظ — مش بنعتمد على curPid اللي ممكن يتغير
  const savedPid=curPid;
  const savedProjName=allProjectsMap[savedPid]?.name||'المشروع';
  // seq بيتولد تلقائياً من Supabase sequence — مش محتاج نحسبه هنا
  const _pmtSel=document.getElementById('iPmt');
  const _pmtOther=document.getElementById('iPmtOther');
  const _pmt=_pmtSel?(_pmtSel.value==='أخرى'?(_pmtOther?_pmtOther.value.trim():''):_pmtSel.value):'';
  if(!_pmt){notify('اختر طريقة الدفع','err');if(_pmtSel)_pmtSel.style.borderColor='#E74C3C';_resetSaveBtn();return;}
  const entry={id:uid_(),project_id:savedPid,type:cT,amount:a,description:d,entry_date:dt,category:cT==='e'?c:'',contractor:cT==='e'?m:'',entry_type:cT==='e'&&m?curEtype:null,created_by:uid,payment_method:_pmt,img_url:null};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'||uRole==='super_admin'||uRole==='editor'){
      await sb('entries','POST',entry);
      if(window._projInvFile){await projInvUpload(entry.id,'entries');}
      entries.push(entry);
      allEntries=allEntries.filter(e=>e.project_id!==savedPid).concat(entries);
      refreshProjSummary(savedPid);
      setSav('✅ تم الحفظ','ok');
      notify(`✅ تم حفظ القيد في مشروع: ${savedProjName}`,'ok');
      _showEntryConfirm('✅ تم إضافة القيد بنجاح','#1D9E75');
      efResetSteps();
      auditLog('إضافة قيد','entries',entry.id,{project:savedProjName,amount:entry.amount,category:entry.category,type:entry.type});
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      window._blockRtRefresh=true;
      setTimeout(()=>{window._blockRtRefresh=false;},2000);
      await sb('pending_entries','POST',pending);
      if(window._projInvFile){await projInvUpload(entry.id,'pending_entries');}
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
      notify(`⏳ تم إرسال القيد للموافقة — مشروع: ${savedProjName}`,'warn');
      _showEntryConfirm('⏳ تم الإرسال للأدمن — في انتظار الموافقة','#C9A84C');
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
  window._savingEntry=false;
  const _rb=document.getElementById('addEntryBtn');
  if(_rb){_rb.disabled=false;_rb.textContent='+ إضافة القيد';}
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
      if(_locked){notify('⚠️ هذا الشهر مقفول — تم الحذف مع التنبيه','warn');}
    }
  }
  // منع حذف قيد معتمد — إلا السوبر أدمن
  if(delEntry&&delEntry.status==='approved'&&uRole!=='super_admin'&&uRole!=='admin'){
    notify('❌ القيد معتمد — لا يمكن حذفه','err');return;
  }
  // منع حذف قيد أقدم من 7 أيام — إلا الأدمن
  if(uRole!=='admin'&&uRole!=='super_admin'&&delEntry){
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
    const _selPid=document.getElementById('ePrj').value;
    const _selProj=allProjects.find(p=>p.id===_selPid)||allProjectsMap[_selPid];
    const newPid=(_selProj&&_selProj.archived)||!_selPid?curPid:_selPid;
    const u={amount:a,description:document.getElementById('eD').value.trim(),entry_date:fd(document.getElementById('eDt').value),project_id:newPid};
    if(edType==='e'){
      const nc=document.getElementById('eC').value.trim();
      if(!nc){notify('ادخل البند','err');return;}
      u.category=nc;
      const mq=document.getElementById('eM').value.trim();
      u.contractor=mq;u.entry_type=mq&&curEditEtype?curEditEtype:null;
      const _ePmtSel=document.getElementById('ePmt');
      const _ePmtOther=document.getElementById('ePmtOther');
      const _ePmt=_ePmtSel?(_ePmtSel.value==='أخرى'?(_ePmtOther?_ePmtOther.value.trim():''):_ePmtSel.value):'';
      if(_ePmt)u.payment_method=_ePmt;
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
  }catch(err){console.warn('creator lookup failed:',err);}
  const payType=e.entry_type==='payment'?'دفعة نقدية/تحويل':e.entry_type==='work'?'أعمال':e.entry_type==='material'?'مصنعيات':'—';
  const isExp=e.type==='e';
  const isInc=e.type==='i';
  const typeLbl=isExp?'دفعة مقاول':'وارد عميل';
  const fn2=n=>Number(n).toLocaleString('en-EG');
  const _sw=Math.min(400,window.screen.width-20);
  const _sh=Math.min(700,window.screen.height-40);
  const _sl=Math.round((window.screen.width-_sw)/2);
  const _st=Math.round((window.screen.height-_sh)/2);
  const w=window.open('','_blank',`width=${_sw},height=${_sh},left=${_sl},top=${_st},scrollbars=yes`);
  const topBg1=isExp?'#1D3C2A':'#5C3A00';
  const topBg2=isExp?'#2D5A3E':'#8B6914';
  const circleBg=isExp?'rgba(212,196,154,.12)':'rgba(245,217,139,.12)';
  const circleBorder=isExp?'rgba(212,196,154,.25)':'rgba(245,217,139,.25)';
  const circleIcon=isExp?'💸':'💵';
  const typeBadgeBg=isExp?'#EAF3DE':'#FFF8E7';
  const typeBadgeClr=isExp?'#3B6D11':'#7A5500';
  const confirmBg=isExp?'#F5FAF0':'#FFF8E7';
  const confirmBorder=isExp?'#C0DD97':'#F0C040';
  const confirmClr=isExp?'#3B6D11':'#7A5500';
  const divClr=isExp?'#C4B99A':'#C4A84A';
  const rowBorder=isExp?'#F8F4EE':'#FDF6E3';
  const sigLine=isExp?'#EDE8E0':'#F0E8C8';
  const footerBorder=isExp?'#EDE8E0':'#F0E8C8';
  w.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>إيصال رقم ${e.seq&&e.seq!==0?e.seq:'—'}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Cairo','Segoe UI',sans-serif;background:#f0ede8;color:#111;direction:rtl;max-width:400px;margin:20px auto}
  .rcpt{background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.12)}
  .rcpt-top{background:linear-gradient(160deg,${topBg1},${topBg2});padding:22px 20px 0;text-align:center}
  .rcpt-logo{font-size:9px;letter-spacing:4px;color:rgba(255,255,255,.45);margin-bottom:18px}
  .rcpt-circle{width:66px;height:66px;border-radius:50%;background:${circleBg};border:1.5px solid ${circleBorder};display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:28px;line-height:1}
  .rcpt-amt{font-size:36px;font-weight:700;color:#fff}
  .rcpt-cur{font-size:12px;color:rgba(255,255,255,.55);margin-top:4px;margin-bottom:20px}
  .rcpt-wave{height:28px;background:#fff;border-radius:50% 50% 0 0/100% 100% 0 0}
  .rcpt-body{padding:6px 20px 18px}
  .rcpt-num{text-align:center;font-size:10px;color:#B0A898;margin-bottom:8px}
  .rcpt-type{text-align:center;margin-bottom:14px}
  .rcpt-type span{display:inline-block;padding:4px 18px;border-radius:20px;font-size:10px;font-weight:700;background:${typeBadgeBg};color:${typeBadgeClr}}
  .rcpt-div{display:flex;align-items:center;gap:8px;margin:10px 0 8px}
  .rcpt-div::before,.rcpt-div::after{content:'';flex:1;height:1px;background:${rowBorder}}
  .rcpt-div span{font-size:9px;color:${divClr};letter-spacing:2px}
  .rcpt-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid ${rowBorder}}
  .rcpt-row:last-child{border:none}
  .rcpt-key{font-size:11px;color:#A09080}
  .rcpt-val{font-size:12px;font-weight:600;color:#2C2416}
  .rcpt-confirm{background:${confirmBg};border:1px solid ${confirmBorder};border-radius:8px;padding:9px;text-align:center;font-size:11px;color:${confirmClr};font-weight:700;margin:12px 0}
  .rcpt-sigs{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:6px}
  .rcpt-sig{text-align:center}
  .rcpt-sig-line{height:1px;background:${sigLine};margin-bottom:6px}
  .rcpt-sig-lbl{font-size:9px;color:#B0A898}
  .rcpt-footer{text-align:center;padding:12px 20px;font-size:9px;color:#C4B99A;border-top:1px dashed ${footerBorder};margin-top:12px}
  @media print{body{background:#fff;max-width:100%;margin:0}.rcpt{border-radius:0;box-shadow:none}}
</style>
</head>
<body>
<div class="rcpt">
<div class="rcpt-top">
  <div class="rcpt-logo">LEGACY FINE TOUCH</div>
  <div class="rcpt-circle">${circleIcon}</div>
  <div class="rcpt-amt">${fn(Math.abs(e.amount))}</div>
  <div class="rcpt-cur">جنيه مصري</div>
  <div class="rcpt-wave"></div>
</div>
<div class="rcpt-body">
  <div class="rcpt-num">إيصال رقم ${e.seq&&e.seq!==0?e.seq:'—'} · ${new Date().toLocaleDateString('ar-EG')}</div>
  <div class="rcpt-type"><span>${isExp?'💰 دفعة مقاول':'▲ وارد عميل'}</span></div>
  <div class="rcpt-div"><span>تفاصيل الإيصال</span></div>
  <div class="rcpt-row"><span class="rcpt-key">المشروع</span><span class="rcpt-val">${proj}</span></div>
  <div class="rcpt-row"><span class="rcpt-key">البيان</span><span class="rcpt-val">${e.description||'—'}</span></div>
  <div class="rcpt-row"><span class="rcpt-key">التاريخ</span><span class="rcpt-val">${e.entry_date||'—'}</span></div>
  ${isExp&&e.contractor?`<div class="rcpt-row"><span class="rcpt-key">المقاول</span><span class="rcpt-val">${e.contractor}</span></div>`:''}
  ${isExp&&e.entry_type?`<div class="rcpt-row"><span class="rcpt-key">طريقة الدفع</span><span class="rcpt-val">${payType}</span></div>`:''}
  ${isExp?`<div class="rcpt-row"><span class="rcpt-key">البند</span><span class="rcpt-val">${e.category||'—'}</span></div>`:''}
  <div class="rcpt-row"><span class="rcpt-key">رقم القيد</span><span class="rcpt-val">${e.seq&&e.seq!==0?e.seq:'—'}</span></div>
  <div class="rcpt-row"><span class="rcpt-key">أدخله</span><span class="rcpt-val">${_creatorName}</span></div>
  <div class="rcpt-confirm">&#10003; ${isExp?'تم صرف المبلغ وقيده في النظام':'تم استلام المبلغ وقيده في النظام'}</div>
${(()=>{
  const _pd=allProjectsMap[e.project_id];
  if(isExp||!_pd)return '';
  const _txt=encodeURIComponent('مرحباً، نفيدكم باستلام مبلغ '+fn(Math.abs(e.amount))+' ج'+String.fromCharCode(10)+'المشروع: '+proj+String.fromCharCode(10)+'رقم الإيصال: '+(e.seq||''));
  const _btns=[];
  if(_pd.client_phone)_btns.push(`<a href="https://wa.me/${_pd.client_phone}?text=${_txt}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500">إرسال 1</a>`);
  if(_pd.client_phone2)_btns.push(`<a href="https://wa.me/${_pd.client_phone2}?text=${_txt}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#128C7E;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500">إرسال 2</a>`);
  return _btns.length?`<div style="margin:0 24px 16px;display:flex;gap:8px;justify-content:center">${_btns.join('')}</div>`:'';
})()}
${isExp&&e.contractor&&allProjectsMap[e.project_id]?.contractor_phones?.[e.contractor]?`<div style="margin:0 24px 16px;text-align:center"><a href="https://wa.me/${allProjectsMap[e.project_id].contractor_phones[e.contractor]}?text=${encodeURIComponent('مرحباً '+e.contractor+'، نفيدكم بصرف مبلغ '+fn(Math.abs(e.amount))+' ج'+String.fromCharCode(10)+'المشروع: '+proj+String.fromCharCode(10)+'رقم الإيصال: '+(e.seq||''))}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500">إرسال واتساب للمقاول</a></div>`:''}
  <div class="rcpt-sigs">
    <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">${isExp?'المقاول / المستلم':'العميل / الدافع'}</div></div>
    <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">المحاسب</div></div>
    <div class="rcpt-sig"><div class="rcpt-sig-line"></div><div class="rcpt-sig-lbl">المهندس</div></div>
  </div>
  <div class="rcpt-footer">LEGACY FINE TOUCH — نظام الإدارة المالية — ${new Date().getFullYear()}</div>
</div>
<div style="display:flex;gap:10px;padding:16px;max-width:400px;margin:0 auto">
  <button onclick="window.print()" style="flex:1;padding:12px;background:#1D3C2A;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">🖨 طباعة</button>
  <button onclick="window.close()" style="padding:12px 20px;background:#f5f5f5;color:#555;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">✕ إغلاق</button>
</div>
<script>window.onload=function(){}<\/script>
</body></html>`);
  w.document.close();
}

function _updateEntryBanner(){
  const el=document.getElementById('entryProjName');
  if(el)el.textContent=allProjectsMap[curPid]?.name||'—';
  // حدّث الـ search input كمان
  const inp=document.getElementById('entryProjInput');
  const hid=document.getElementById('entryProjId');
  if(inp&&curPid)inp.value=allProjectsMap[curPid]?.name||'';
  if(hid&&curPid)hid.value=curPid;
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
  // تفعيل تنبيه الإشراف الهندسي
  const descInp=document.getElementById('id_');
  if(descInp&&!descInp._supBound){
    descInp._supBound=true;
    descInp.addEventListener('input',function(){onDescInput(this.value);});
  }
  rp();
}

// ── Invoice functions for project entry ──
function projInvSelect(input){
  const file=input.files[0];if(!file)return;
  if(file.size>20*1024*1024){notify('الحجم أكبر من 20MB','err');return;}
  window._projInvFile=file;
  const name=file.name.length>34?file.name.substring(0,32)+'…':file.name;
  const size=file.size<1024*1024?(file.size/1024).toFixed(0)+' KB':(file.size/1024/1024).toFixed(1)+' MB';
  document.getElementById('projInvName').textContent=name;
  document.getElementById('projInvSize').textContent=size;
  const thumb=document.getElementById('projInvThumb');
  const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
  if(!isPdf){
    const reader=new FileReader();
    reader.onload=e=>{thumb.innerHTML='<img src="'+e.target.result+'" style="width:100%;height:100%;object-fit:cover">';};
    reader.readAsDataURL(file);
  }
  document.getElementById('projInvEmpty').style.display='none';
  document.getElementById('projInvFilled').style.display='flex';
  document.getElementById('projInvArea').style.borderColor='#81c784';
  document.getElementById('projInvArea').style.borderStyle='solid';
  input.value='';
}
function projInvRemove(){
  window._projInvFile=null;
  const e=document.getElementById('projInvEmpty');
  const f=document.getElementById('projInvFilled');
  const a=document.getElementById('projInvArea');
  const inp=document.getElementById('projInvFile');
  if(e)e.style.display='flex';
  if(f)f.style.display='none';
  if(a){a.style.borderColor='#ccc';a.style.borderStyle='dashed';}
  if(inp)inp.value='';
}
async function projInvUpload(entryId, table){
  const file=window._projInvFile;
  if(!file||!entryId)return;
  try{
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    let uploadFile=file;
    if(!isPdf){
      uploadFile=await new Promise(res=>{
        const reader=new FileReader();
        reader.onload=e=>{
          const img=new Image();
          img.onload=()=>{
            const MAX=1400;let w=img.width,h=img.height;
            if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
            const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            canvas.toBlob(blob=>res(blob),'image/jpeg',0.80);
          };img.src=e.target.result;
        };reader.readAsDataURL(file);
      });
    }
    const ext=isPdf?'pdf':'jpg';
    const path=`${entryId}/invoice_${Date.now()}.${ext}`;
    const AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
    const r=await fetch(`${SB}/storage/v1/object/invoices/${path}`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+(token||AK),'apikey':AK,'Content-Type':isPdf?'application/pdf':'image/jpeg','x-upsert':'true'},
      body:uploadFile
    });
    if(r.ok){
      const pub=`${SB}/storage/v1/object/public/invoices/${path}`;
      await sb(`${table}?id=eq.`+entryId,'PATCH',{img_url:pub});
    }else{
      const err=await r.text();
      console.error('projInvUpload failed:',r.status,err);
      notify('⚠️ فشل رفع الفاتورة: '+r.status,'warn');
    }
  }catch(e){console.warn('projInvUpload error:',e);}
  window._projInvFile=null;
  projInvRemove();
}

// ══ Entry Form Steps Navigation ══════════════════════
function efGoTo(step){
  const total=4;
  for(let i=1;i<=total;i++){
    const panel=document.getElementById('ef-sp-'+i);
    const si=document.getElementById('ef-si-'+i);
    if(!panel||!si)continue;
    panel.classList.toggle('active',i===step);
    si.classList.remove('active','done');
    if(i<step)si.classList.add('done');
    else if(i===step)si.classList.add('active');
  }
  window._efCurStep=step;
  // scroll to top of form
  const ef=document.getElementById('entryForm');
  if(ef)ef.scrollIntoView({behavior:'smooth',block:'start'});
}

function efGoNext(from){
  if(from===1){
    const pid=document.getElementById('entryProjId').value;
    if(!pid){notify('اختر مشروع أولاً','err');return;}
  }
  if(from===2){
    const desc=document.getElementById('id_').value.trim();
    const amt=document.getElementById('ia').value;
    const cat=document.getElementById('ic').value.trim();
    const dt=document.getElementById('idt').value.trim();
    if(!desc){notify('ادخل البيان','err');_showErr('id_','err-id_');return;}
    if(!amt){notify('ادخل المبلغ','err');_showErr('ia','err-ia');return;}
    if(!dt){notify('ادخل التاريخ','err');_showErr('idt','err-idt');return;}
    const cT=document.getElementById('tx').classList.contains('on')?'e':'i';
    if(cT==='e'&&!cat){notify('ادخل البند','err');_showErr('ic','err-ic');return;}
  }
  if(from===3){
    const pmt=document.getElementById('iPmt').value;
    if(!pmt){notify('اختر طريقة الدفع','err');return;}
    efBuildSummary();
  }
  efGoTo(from+1);
}

function efGoBack(from){
  efGoTo(from-1);
}

function efResetSteps(){
  efGoTo(1);
}

function efBuildSummary(){
  const projName=document.getElementById('entryProjInput').value||'—';
  const cT=document.getElementById('tx').classList.contains('on')?'e':'i';
  const amt=parseFloat(document.getElementById('ia').value)||0;
  const desc=document.getElementById('id_').value||'—';
  const cat=document.getElementById('ic').value||'—';
  const pmt=document.getElementById('iPmt').value||'—';
  const dt=document.getElementById('idt').value||'—';
  const projEl=document.getElementById('efSumProj');if(projEl)projEl.textContent=projName;
  const typeEl=document.getElementById('efSumType');if(typeEl)typeEl.textContent=cT==='e'?'📥 مصروف':'📤 وارد';
  const descEl=document.getElementById('efSumDesc');if(descEl)descEl.textContent=desc;
  const catEl=document.getElementById('efSumCat');if(catEl)catEl.textContent=cat;
  const pmtEl=document.getElementById('efSumPmt');if(pmtEl)pmtEl.textContent=pmt;
  const dtEl=document.getElementById('efSumDate');if(dtEl)dtEl.textContent=dt;
  const amtEl=document.getElementById('efSumAmt');
  if(amtEl){amtEl.textContent=amt.toLocaleString()+' ج';amtEl.className='ef-sum-amt'+(cT==='i'?' income':'');}
  // فاتورة
  const invRow=document.getElementById('efSumInv');
  if(invRow){
    if(window._projInvFile){
      invRow.style.display='flex';
      const nameEl=document.getElementById('efSumInvName');
      if(nameEl)nameEl.textContent=window._projInvFile.name;
    }else{
      invRow.style.display='none';
    }
  }
}

function _showErr(inputId,errId){
  const inp=document.getElementById(inputId);
  const err=document.getElementById(errId);
  if(inp)inp.style.borderColor='#E74C3C';
  if(err)err.style.display='block';
}

// تنبيه الإشراف الهندسي
let _supAlertShown=false;
function onDescInput(val){
  const v=(val||'').trim();
  if(v.includes('إشراف هندسي')||v.includes('اشراف هندسي')){
    const amtEl=document.getElementById('ia');
    const amt=parseFloat(amtEl?amtEl.value:0)||0;
    _showSupervisionAlert(amt);
  } else {
    _supAlertShown=false;
  }
}

function _showSupervisionAlert(amt){
  if(document.getElementById('_supAlert'))return;
  _supAlertShown=true;
  const pct=amt>0?(amt*0.07):0;
  const fmt=n=>n>0?n.toLocaleString('ar-EG',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';

  const ov=document.createElement('div');
  ov.id='_supAlert';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl';

  ov.innerHTML=`
  <div style="background:#fff;border-radius:16px;max-width:400px;width:100%;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.18)">
    <div style="background:#FAEEDA;padding:1rem 1.25rem;display:flex;align-items:center;gap:12px;border-bottom:1px solid #FAC775">
      <div style="width:38px;height:38px;border-radius:50%;background:#EF9F27;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px">⚠️</div>
      <div>
        <p style="margin:0;font-size:14px;font-weight:600;color:#412402">تنبيه — إشراف هندسي</p>
        <p style="margin:0;font-size:12px;color:#854F0B">تم رصد بند إشراف هندسي في هذا القيد</p>
      </div>
    </div>
    <div style="padding:1.25rem">
      <p style="margin:0 0 1rem;font-size:14px;color:#222;line-height:1.7">
        ${amt>0?`قيمة القيد <strong>${fmt(amt)} ج.م</strong> — يستلزم ذلك تسجيل قيد إشراف هندسي بقيمة:`:'أدخل قيمة القيد لحساب نسبة الإشراف الهندسي.'}
      </p>
      ${amt>0?`
      <div style="background:#FAEEDA;border:1px solid #FAC775;border-radius:8px;padding:1rem 1.25rem;margin-bottom:1.25rem;text-align:center">
        <p style="margin:0 0 4px;font-size:12px;color:#854F0B">نسبة الإشراف الهندسي (7%)</p>
        <p style="margin:0;font-size:26px;font-weight:600;color:#412402">${fmt(pct)} ج.م</p>
      </div>`:''}
      <div style="background:#f9f6f1;border-radius:8px;border:1px solid #e8e0d4;padding:10px 14px;margin-bottom:1.25rem">
        <p style="margin:0;font-size:13px;color:#555;line-height:1.6">
          ℹ️ لا تنسَ تسجيل قيد مستقل باسم <strong>إشراف هندسي</strong>${amt>0?` بقيمة ${fmt(pct)} ج.م`:''} بعد حفظ هذا القيد.
        </p>
      </div>
      <div style="display:flex;gap:8px">
        <button onclick="document.getElementById('_supAlert').remove()" 
          style="flex:1;padding:9px;border-radius:8px;font-size:13px;cursor:pointer;background:#FAEEDA;color:#412402;border:1px solid #FAC775;font-weight:500">
          ✓ علمت بذلك
        </button>
      </div>
    </div>
  </div>`;

  // لو غيّر المبلغ وهو داخل الـ modal — بنحدث المبلغ
  const amtEl=document.getElementById('ia');
  if(amtEl){
    amtEl.addEventListener('input',function(){
      const existing=document.getElementById('_supAlert');
      if(existing){existing.remove();}
      const descEl=document.getElementById('id_');
      const desc=(descEl?descEl.value:'').trim();
      if(desc.includes('إشراف هندسي')||desc.includes('اشراف هندسي')){
        _showSupervisionAlert(parseFloat(this.value)||0);
      }
    },{once:true});
  }

  document.body.appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)ov.remove();});
}

