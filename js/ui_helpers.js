function checkBackupReminder(){
// ██ REMINDERS — BACKUP + NOTES ════════════════════
  const last=localStorage.getItem('lft_last_backup');
  const today=new Date().toDateString();
  const lastDay=last?new Date(last).toDateString():null;
  if(!last||lastDay!==today){
    const msg=!last?'لم تأخذ نسخة احتياطية حتى الآن!':
      'آخر نسخة: '+new Date(last).toLocaleDateString('ar-EG');
    setTimeout(()=>showBackupReminder(msg),2000);
  }
}

function showBackupReminder(msg){
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1D3C2A;color:#D4C49A;border:1px solid rgba(212,196,154,.3);border-radius:14px;padding:12px 20px;font-size:13px;font-weight:600;z-index:99999;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.3);white-space:nowrap;direction:rtl;font-family:inherit';
  const btnNow=document.createElement('button');
  btnNow.textContent='نسخة الآن';
  btnNow.style.cssText='background:#D4C49A;color:#1D3C2A;border:none;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
  btnNow.onclick=()=>{backupAll();toast.remove();};
  const btnClose=document.createElement('button');
  btnClose.textContent='×';
  btnClose.style.cssText='background:none;border:none;color:rgba(212,196,154,.5);cursor:pointer;font-size:16px;padding:0 4px';
  btnClose.onclick=()=>toast.remove();
  const icon=document.createElement('span');icon.textContent='💾';
  const txt=document.createElement('span');txt.textContent=msg;
  toast.appendChild(icon);toast.appendChild(txt);toast.appendChild(btnNow);toast.appendChild(btnClose);
  document.body.appendChild(toast);
  setTimeout(()=>{if(toast.parentNode)toast.remove();},10000);
}

async function checkNotesReminder(){
  setTimeout(async()=>{
    if(!_notesList.length){
      try{ await loadNotes(); }catch(e){} // صامت متعمد
    }
    const undone=_notesList.filter(n=>!n.done).length;
    if(undone>0){
      const msg='عندك '+undone+' '+(undone===1?'مهمة متبقية':'مهام متبقية');
      showNotesReminder(msg);
    }
  },4000);
}

function showNotesReminder(msg){
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:140px;left:50%;transform:translateX(-50%);background:#1D3C2A;color:#D4C49A;border:1px solid rgba(212,196,154,.3);border-radius:14px;padding:12px 20px;font-size:13px;font-weight:600;z-index:99999;display:flex;align-items:center;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,.3);white-space:nowrap;direction:rtl;font-family:inherit';
  const btnNow=document.createElement('button');
  btnNow.textContent='ملاحظاتي';
  btnNow.style.cssText='background:#D4C49A;color:#1D3C2A;border:none;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
  btnNow.onclick=()=>{goToNotes();toast.remove();};
  const btnClose=document.createElement('button');
  btnClose.textContent='×';
  btnClose.style.cssText='background:none;border:none;color:rgba(212,196,154,.5);cursor:pointer;font-size:16px;padding:0 4px';
  btnClose.onclick=()=>toast.remove();
  const icon=document.createElement('span');icon.textContent='📝';
  const txt=document.createElement('span');txt.textContent=msg;
  toast.appendChild(icon);toast.appendChild(txt);toast.appendChild(btnNow);toast.appendChild(btnClose);
  document.body.appendChild(toast);
  setTimeout(()=>{if(toast.parentNode)toast.remove();},10000);
}

function updateBackupDateDisplay(){
  const el=document.getElementById('sbBackupDate');
  if(!el)return;
  const last=localStorage.getItem('lft_last_backup');
  if(!last){el.textContent='لم تؤخذ نسخة بعد';el.style.color='rgba(235,87,87,.8)';return;}
  const d=new Date(last);
  const day=String(d.getDate()).padStart(2,'0');
  const mon=String(d.getMonth()+1).padStart(2,'0');
  const yr=d.getFullYear();
  const hr=String(d.getHours()).padStart(2,'0');
  const mn=String(d.getMinutes()).padStart(2,'0');
  el.textContent=day+'/'+mon+'/'+yr+' — '+hr+':'+mn;
  el.style.color='rgba(212,196,154,.45)';
}

// ██ NETWORK STATUS ══════════════════════════════
function initNetworkStatus(){
  function _isLoggedIn(){return document.getElementById('mainApp')?.style.display==='flex';}
  function onOffline(){
    setSav('⚠️ أنت offline — التعديلات لن تُحفظ حتى تعود الشبكة','er');
    if(!_isLoggedIn())return;
    const prev=document.getElementById('_offlineToast');
    if(prev)prev.remove();
    const toast=document.createElement('div');
    toast.id='_offlineToast';
    toast.style.cssText='position:fixed;top:140px;left:50%;transform:translateX(-50%);background:#7a1f1f;color:#ffcdd2;border:1px solid rgba(231,76,60,.5);border-radius:14px;padding:13px 22px;font-size:13px;font-weight:700;z-index:999999;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5);white-space:nowrap;direction:rtl;font-family:inherit';
    toast.innerHTML='<span style="font-size:18px">📵</span><span>انقطع الاتصال — التعديلات لن تُحفظ</span>';
    document.body.appendChild(toast);
  }
  function onOnline(){
    setSav('✅ عادت الشبكة — متصل','ok');
    const prev=document.getElementById('_offlineToast');
    if(prev)prev.remove();
    if(!_isLoggedIn())return;
    const prev2=document.getElementById('_onlineToast');
    if(prev2)prev2.remove();
    const toast=document.createElement('div');
    toast.id='_onlineToast';
    toast.style.cssText='position:fixed;top:140px;left:50%;transform:translateX(-50%);background:#1D3C2A;color:#D4C49A;border:1px solid rgba(39,174,96,.4);border-radius:14px;padding:13px 22px;font-size:13px;font-weight:700;z-index:999999;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.4);white-space:nowrap;direction:rtl;font-family:inherit';
    toast.innerHTML='<span style="font-size:18px">✅</span><span>عادت الشبكة — بياناتك محفوظة</span>';
    document.body.appendChild(toast);
    setTimeout(()=>{if(toast.parentNode)toast.remove();setSav('☁️ متصل — بياناتك محفوظة','ok');},4000);
  }
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  if(!navigator.onLine) onOffline();
  // polling كل ١٠ ثواني عشان Android
  let _wasOnline=navigator.onLine;
  setInterval(async()=>{
    let isOnline=false;
    try{
      await fetch('https://1.1.1.1',{method:'HEAD',mode:'no-cors',cache:'no-store',signal:AbortSignal.timeout(4000)});
      isOnline=true;
    }catch(_){isOnline=false;}
    if(isOnline&&!_wasOnline){_wasOnline=true;onOnline();}
    else if(!isOnline&&_wasOnline){_wasOnline=false;onOffline();}
  },10000);
}

async function autoOpenViewerAdv(){
  try{
    const myAdvs=advances.filter(a=>a.user_id===uid);
    if(myAdvs.length===1)openAdv(myAdvs[0].id);
  }catch(e){console.warn('autoOpenViewerAdv:',e);} // صامت متعمد
}

function showScreen(s){
// ██ UI NAVIGATION — SCREENS + SIDEBAR ════════════
  // Viewer مش يقدر يدخل على حاجة غير العهدة والرسائل
  if(uRole==='viewer'&&s!=='adv')return;
  curScreen=s;
  ['dash','daily','proj','projList','adv','admin','rep','search','approvals','timeline','archive','dues','notes','auditlog','daf3ati','owner'].forEach(x=>{
    const el=document.getElementById(x+'Screen');
    if(el)el.style.display=x===s?'block':'none';
  });
  if(s==='projList'){buildProjListScreen();}
  if(s==='owner'){try{loadOwnerScreen();}catch(ex){console.error('ownerScreen error:',ex);notify('خطأ في شاشة الأونر: '+ex.message,'err');}}
  document.getElementById('advDetail').style.display='none';
  // Sidebar active state
  ['dash','adv','daily','admin','rep','search','approvals','archive','auditlog','daf3ati'].forEach(x=>{
    const el=document.getElementById('sbi-'+x);
    if(el)el.classList.toggle('on',x===s);
  });
  const projActive=s==='proj'||s==='timeline';
  document.getElementById('sbi-proj-hdr').classList.toggle('on',projActive);
  if(projActive){const sub=document.getElementById('sbs-proj');if(sub)sub.classList.add('open');const arr=document.getElementById('sba-proj');if(arr)arr.classList.add('open');}
  const tli=document.getElementById('sbi-timeline');if(tli)tli.classList.toggle('on',s==='timeline');
  if(s==='search'){
    const sel=document.getElementById('srch-proj-filter');
    if(sel&&allProjects.length){
      sel.innerHTML='<option value="">كل المشاريع</option>'+allProjects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');
    }
    getProfileMap().then(profMap=>{
      const uSel=document.getElementById('srch-user-filter');
      const uSelAdv=document.getElementById('srch-adv-user');
      if(uSel)uSel.innerHTML='<option value="">الكل</option>'+Object.entries(profMap).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
      if(uSelAdv)uSelAdv.innerHTML='<option value="">الكل</option>'+Object.entries(profMap).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
    });
    setTimeout(()=>{
      const df=document.getElementById('srch-date-from');
      const dt=document.getElementById('srch-date-to');
      if(df&&!df._dpInit)initDateInput(df);
      if(dt&&!dt._dpInit)initDateInput(dt);
    },100);
  }
  if(s==='daily')loadDailyLog();
  if(s==='daf3ati')loadDaf3ati();
  if(s==='dash')loadDashboard();
  if(s==='adv')loadAdvList();
  if(s==='admin')loadAdminPanel();
  if(s==='rep')loadRepScreen();
  if(s==='approvals'){
    loadApprovals();
    if(_approvalsInterval){clearInterval(_approvalsInterval);_approvalsInterval=null;}
  }else{
    if(_approvalsInterval){clearInterval(_approvalsInterval);_approvalsInterval=null;}
  }
  if(s==='timeline')loadTimeline();
  if(s==='archive')loadArchivedProjects();
  if(s==='dues')loadDuesScreen();
  if(s==='notes')loadNotesScreen();
  if(s==='auditlog')loadAuditLog();
  closeSidebar();
  setTimeout(()=>renderBreadcrumb(s),50);
}

function renderBreadcrumb(s){
  const map={
    projList:['الرئيسية','المشاريع'],
    owner:['الرئيسية','قيد جديد'],
    proj:['الرئيسية','المشاريع',null],
    adv:['الرئيسية','العهد'],
    rep:['الرئيسية','التقارير'],
    approvals:['الرئيسية','الموافقات'],
    search:['الرئيسية','بحث برقم القيد'],
    notes:['الرئيسية','ملاحظاتي'],
    dues:['الرئيسية','مستحقات المقاولين'],
    archive:['الرئيسية','الأرشيف'],
    timeline:['الرئيسية','آخر التحركات'],
    daily:['الرئيسية','اليومية'],
  };
  const crumbs=map[s];
  if(!crumbs)return;
  const targetEl=document.getElementById(s+'Screen');
  if(!targetEl)return;
  const existing=targetEl.querySelector('.bc-wrap');
  if(existing)existing.remove();
  const bc=document.createElement('div');
  bc.className='bc-wrap';
  bc.style.cssText='display:flex;align-items:center;gap:5px;font-size:11px;padding:6px 0 8px;flex-wrap:wrap;opacity:.85';
  const actions={
    'الرئيسية':()=>showScreen('dash'),
    'المشاريع':()=>showScreen('projList'),
  };
  crumbs.forEach((c,i)=>{
    if(i>0){
      const sep=document.createElement('span');
      sep.textContent='←';
      sep.style.cssText='color:var(--text-hint);font-size:10px;opacity:.5';
      bc.appendChild(sep);
    }
    if(c===null){
      const projName=allProjects.find(p=>p.id===curPid)?.name||'—';
      const span=document.createElement('span');
      span.textContent=projName;
      span.style.cssText='color:var(--text-main);font-weight:500';
      bc.appendChild(span);
    }else if(i<crumbs.length-1){
      const span=document.createElement('span');
      span.textContent=c;
      span.style.cssText='color:#185FA5;cursor:pointer';
      span.onclick=actions[c]||null;
      bc.appendChild(span);
    }else{
      const span=document.createElement('span');
      span.textContent=c;
      span.style.cssText='color:var(--text-hint)';
      bc.appendChild(span);
    }
  });
  targetEl.insertBefore(bc,targetEl.firstChild);
}

// SIDEBAR FUNCTIONS
function mobNavActive(id){
  document.querySelectorAll('.mob-nav-it').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById(id);
  if(el)el.classList.add('active');
}
let sidebarMini=false;
function toggleMini(){
  sidebarMini=!sidebarMini;
  document.getElementById('sidebar').classList.toggle('mini',sidebarMini);
  document.getElementById('miniBtn').textContent=sidebarMini?'▶▶':'◀◀';
}
function toggleSidebar(){
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('sbOverlay');
  sb.classList.toggle('sb-open');
  ov.classList.toggle('show',sb.classList.contains('sb-open'));
}
function closeSidebar(){
  if(window.innerWidth<768){
    document.getElementById('sidebar').classList.remove('sb-open');
    document.getElementById('sbOverlay').classList.remove('show');
  }
}
function toggleSbSub(key){
  const sub=document.getElementById('sbs-'+key);
  const arr=document.getElementById('sba-'+key);
  if(!sub)return;
  sub.classList.toggle('open');
  if(arr)arr.classList.toggle('open',sub.classList.contains('open'));
  // projList يتحكم فيها الزرار الرئيسي مباشرة
}
function buildSidebarProjects(){
  const container=document.getElementById('sb-proj-list');
  if(!container)return;
  container.innerHTML='';
}
function buildProjListScreen(){
  const grid=document.getElementById('projCardsGrid');
  if(!grid)return;
  if(!projects.length){grid.innerHTML='<div class="emp">لا توجد مشاريع</div>';return;}
  const projColors=['var(--success-soft)','var(--info-sky)','var(--accent-gold)','var(--purple-soft)','var(--danger-peach)','var(--danger-blush)','var(--info-soft)','var(--danger-warm)'];
  grid.className='d-proj-grid';
  grid.innerHTML=[...projects].sort((a,b)=>{
    const sa=projSummaries[a.id]||{bal:0};
    const sb_=projSummaries[b.id]||{bal:0};
    return (sa.bal||0)-(sb_.bal||0);
  }).map((p,idx)=>{
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0,count:0,cats:[]};
    const pI=s.inc,pE=s.exp,pB=s.bal;
    const balCls=pB>0?'pos':pB<0?'neg':'zero';
    const pct=pI>0?Math.min(100,Math.round(pE/pI*100)):0;
    const badgeTxt=pB>0?'✦ مستقر':pB<0?'⚠ عجز':'◌ صفر';
    const color=projColors[idx%projColors.length];
    return `<div class="d-pcard" onclick="goToProject('${p.id}')" style="animation-delay:${idx*0.04}s">
      <div class="d-pcard-head">
        <div class="d-pcard-name">${p.name}</div>
        <span class="d-pcard-badge ${balCls}">${badgeTxt}</span>
      </div>
      <div class="d-pcard-stats">
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">وارد</div><div class="d-pcard-stat-val inc">+${fn(pI)}</div></div>
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">مصروف</div><div class="d-pcard-stat-val exp">-${fn(pE)}</div></div>
      </div>
      <div class="d-pcard-progress">
        <div class="d-pcard-progress-info"><span class="d-pcard-meta">${s.count} قيد · ${s.cats.length} بند</span><span class="d-pcard-pct">${pct}%</span></div>
        <div class="d-pcard-progress-bar"><div class="d-pcard-progress-fill" style="width:${pct}%;background:${pct>90?'var(--danger)':pct>70?'var(--warning)':color}"></div></div>
      </div>
      <div class="d-pcard-footer"><div class="d-pcard-bal ${balCls}">${pB>=0?'+':''}${fn(pB)} ج</div></div>
    </div>`;
  }).join('');
}
function filterProjCards(q){
  const cards=document.querySelectorAll('#projCardsGrid .d-pcard');
  const term=q.trim().toLowerCase();
  cards.forEach(card=>{
    const name=card.querySelector('.d-pcard-name')?.textContent?.toLowerCase()||'';
    card.style.display=(!term||name.includes(term))?'':'none';
  });
}

function goToProject(pid){
  curPid=pid;
  showScreen('proj');
  const projScr=document.getElementById('projScreen');
  if(projScr&&!document.getElementById('backToProjList')){
    const backBtn=document.createElement('button');
    backBtn.id='backToProjList';
    backBtn.className='back-btn';
    backBtn.innerHTML='→ المشاريع';
    backBtn.onclick=()=>showScreen('projList');
    projScr.insertBefore(backBtn,projScr.firstChild);
  }
  setTimeout(()=>{const ps=document.getElementById('ps');if(ps)ps.value=pid;sw(pid);},80);
}

// FAB
let fabOpen=false;
// ██ FAB — FLOATING ACTION BUTTON ══════════════════
function toggleFab(){
  fabOpen=!fabOpen;
  document.getElementById('fabMain').classList.toggle('open',fabOpen);
  document.getElementById('fabOpts').classList.toggle('open',fabOpen);
}
function fabAddExp(){toggleFab();showScreen('proj');}
function fabAddAdv(){toggleFab();showScreen('adv');}
function fabAddProj(){toggleFab();np();}
function fabAddNote(){toggleFab();showScreen('notes');}

// DAILY LOG
async function loadDailyLog(){
  const filterEl=document.getElementById('dailyDateFilter');
  const filterVal=filterEl?filterEl.value:'';
  const targetDate=filterVal||new Date().toISOString().split('T')[0];
  const d=filterVal?new Date(filterVal):new Date();
  const label=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  document.getElementById('dailyDateTitle').textContent='📋 Booking Journal — '+label;
  const container=document.getElementById('dailyList');
  let todayEntries=[];
  try{
    // تحويل yyyy-mm-dd لـ dd/mm/yyyy عشان يتطابق مع الداتابيز
    const _p=targetDate.split('-');
    const entryDateFmt=_p.length===3?_p[2]+'/'+_p[1]+'/'+_p[0]:targetDate;
    console.log('Booking Journal query date:', entryDateFmt);
    const res=await sb('entries?entry_date=eq.'+encodeURIComponent(entryDateFmt)+'&order=seq.desc');
    console.log('Booking Journal results:', res?.length);
    todayEntries=res||[];
  }catch(e){todayEntries=[];}
  if(!todayEntries.length){
    container.innerHTML='<div class="emp empty-state">لا توجد قيود مسجّلة اليوم</div>';
    return;
  }
  const projMap={};allProjects.forEach(p=>projMap[p.id]=p.name);
  let totalInc=0,totalExp=0;
  todayEntries.forEach(e=>{if(e.type==='i')totalInc+=e.amount;else totalExp+=e.amount;});
  container.innerHTML=`<div class="daily-kpi-grid">
    <div class="daily-kpi-inc"><div class="daily-kpi-lbl-inc">وارد اليوم</div><div class="daily-kpi-val-inc">+${fn(totalInc)} ج</div></div>
    <div class="daily-kpi-exp"><div class="daily-kpi-lbl-exp">مصروف اليوم</div><div class="daily-kpi-val-exp">-${fn(totalExp)} ج</div></div>
  </div>`+todayEntries.map(e=>{
    const isInc=e.type==='i';
    const proj=projMap[e.project_id]||'';
    return `<div class="daily-entry">
      <div class="daily-type ${isInc?'inc':'exp'}">${isInc?'📤':'📥'}</div>
      <div style="flex:1;min-width:0">
        <div class="entry-desc">${e.description||'—'}</div>
        <div class="daily-proj" style="display:flex;gap:6px;align-items:center">${proj}${e.category?' · '+e.category:''} ${e.seq&&e.seq!==0?'<span style="font-size:10px;background:#1C3A1C;color:#C0DD97;padding:1px 7px;border-radius:4px;font-weight:500">'+e.seq+'</span>':''}</div>
        <div class="daily-proj">${proj}${e.category?' · '+e.category:''}</div>
      </div>
      <div class="daily-amt ${isInc?'inc':'exp'}">${isInc?'+':'-'}${fn(Math.abs(e.amount))} ج</div>
      <button onclick="event.stopPropagation();printReceipt('${e.id}')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500;margin-right:4px;flex-shrink:0">إيصال</button>
    </div>`;
  }).join('');
}

// BACKUP

function toggleEntFullscreen(){
  const ent=document.getElementById('ent');
  const btn=document.getElementById('entExpandBtn');
  if(!ent)return;
  const isFs=ent.classList.contains('ent-fullscreen');
  if(isFs){
    ent.classList.remove('ent-fullscreen');
    document.body.classList.remove('ent-fs');
    if(btn)btn.innerHTML='⛶';
    if(btn)btn.title='تكبير الجدول';
  }else{
    ent.classList.add('ent-fullscreen');
    document.body.classList.add('ent-fs');
    if(btn)btn.innerHTML='✕';
    if(btn)btn.title='إغلاق التكبير';
    // ESC to close
    const esc=e=>{if(e.key==='Escape'){ent.classList.remove('ent-fullscreen');document.body.classList.remove('ent-fs');if(btn){btn.innerHTML='⛶';btn.title='تكبير الجدول';}document.removeEventListener('keydown',esc);}};
    document.addEventListener('keydown',esc);
  }
}
