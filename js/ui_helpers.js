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
  ['dash','daily','proj','projList','adv','admin','rep','search','approvals','projStatus','timeline','archive','dues','notes','auditlog'].forEach(x=>{
    const el=document.getElementById(x+'Screen');
    if(el)el.style.display=x===s?'block':'none';
  });
  if(s==='projList'){buildProjListScreen();}
  document.getElementById('advDetail').style.display='none';
  // Sidebar active state
  ['dash','adv','daily','admin','rep','search','approvals','archive','auditlog'].forEach(x=>{
    const el=document.getElementById('sbi-'+x);
    if(el)el.classList.toggle('on',x===s);
  });
  const projActive=s==='proj'||s==='projStatus'||s==='timeline';
  document.getElementById('sbi-proj-hdr').classList.toggle('on',projActive);
  if(projActive){const sub=document.getElementById('sbs-proj');if(sub)sub.classList.add('open');const arr=document.getElementById('sba-proj');if(arr)arr.classList.add('open');}
  const psi=document.getElementById('sbi-proj-status');if(psi)psi.classList.toggle('on',s==='projStatus');
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
  if(s==='projStatus')loadProjStatus();
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
    proj:['الرئيسية','المشاريع',null],
    adv:['الرئيسية','العهد'],
    rep:['الرئيسية','التقارير'],
    approvals:['الرئيسية','الموافقات'],
    search:['الرئيسية','بحث برقم القيد'],
    notes:['الرئيسية','ملاحظاتي'],
    dues:['الرئيسية','مستحقات المقاولين'],
    archive:['الرئيسية','الأرشيف'],
    projStatus:['الرئيسية','حالة المشاريع'],
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
  grid.innerHTML=[...projects].sort((a,b)=>{
    const sa=projSummaries[a.id]||{bal:0};
    const sb=projSummaries[b.id]||{bal:0};
    return (sa.bal||0)-(sb.bal||0); // عجز أول (سالب أصغر)
  }).map(p=>{
    const s=projSummaries[p.id]||{bal:0,inc:0,exp:0};
    const bal=s.bal||0;
    const inc=s.inc||0;
    const exp=s.exp||0;
    const balClass=bal<0?'neg':bal>0?'pos':'';
    const balLabel=bal<0?'⚠ عجز':'✅ رصيد';
    const cardClass='proj-card'+(bal<0?' deficit':'');
    return `<div class="${cardClass}" onclick="goToProject('${p.id}')">
      <div class="proj-card-name">${p.name}</div>
      <div class="proj-card-row"><span class="proj-card-lbl">الوارد</span><span class="proj-card-val pos">+${fn(inc)}</span></div>
      <div class="proj-card-row"><span class="proj-card-lbl">المصروف</span><span class="proj-card-val neg">-${fn(exp)}</span></div>
      <div class="proj-card-divider"></div>
      <div class="proj-card-row"><span class="proj-card-lbl">${balLabel}</span><span class="proj-card-val ${balClass}">${fn(Math.abs(bal))}</span></div>
    </div>`;
  }).join('');
}
function filterProjCards(q){
  const cards=document.querySelectorAll('#projCardsGrid .proj-card, #projCardsGrid .deficit');
  const term=q.trim().toLowerCase();
  cards.forEach(card=>{
    const name=card.querySelector('.proj-card-name')?.textContent?.toLowerCase()||'';
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
  const today=ts();
  const d=new Date();
  const label=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  document.getElementById('dailyDateTitle').textContent='📋 Booking Journal — '+label;
  const container=document.getElementById('dailyList');
  // Filter entries created today from allEntries (by created_at)
  let todayEntries=[];
  try{
    const res=await sb('entries?created_at=gte.'+today+'T00:00:00&order=created_at.desc');
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
        <div class="entry-desc">${e.description||'—'} ${e.seq?'<span class="seq-badge">#'+e.seq+'</span>':''}</div>
        <div class="daily-proj">${proj}${e.category?' · '+e.category:''}</div>
      </div>
      <div class="daily-amt ${isInc?'inc':'exp'}">${isInc?'+':'-'}${fn(Math.abs(e.amount))} ج</div>
    </div>`;
  }).join('');
}

// BACKUP
