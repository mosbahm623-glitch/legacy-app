async function login(){
  const email=document.getElementById('lemail').value.trim();
  const pass=document.getElementById('lpass').value;
  if(!email||!pass){notify('ادخل الإيميل والباسورد','err');return;}
  setLS('⏳ جاري الدخول...','ng');
  try{
    const d=await sbAuth('token?grant_type=password','POST',{email,password:pass});
    token=d.access_token;uid=d.user.id;uEmail=email;
    localStorage.setItem('lg_tk',token);localStorage.setItem('lg_uid',uid);localStorage.setItem('lg_em',email);
    await initApp();
  }catch(e){setLS('❌ '+friendlyError(e),'er');}
}
async function logout(){
  try{await sbAuth('logout','POST');}catch(e){console.error(e);}
  token=null;uid=null;uRole=null;
  localStorage.removeItem('lg_tk');localStorage.removeItem('lg_uid');
  const mobNav=document.getElementById('mobBottomNav');
  if(mobNav)mobNav.style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('mainApp').style.display='none';
}
async function checkSaved(){
  const tk=localStorage.getItem('lg_tk'),id=localStorage.getItem('lg_uid'),em=localStorage.getItem('lg_em');
  if(tk&&id){
    try{const r=await fetch(SB+'/auth/v1/user',{headers:{'apikey':AK,'Authorization':'Bearer '+tk}});if(r.ok){token=tk;uid=id;uEmail=em||'';await initApp();return;}}catch(e){console.error(e);}
    localStorage.removeItem('lg_tk');localStorage.removeItem('lg_uid');localStorage.removeItem('lg_em');
  }
  document.getElementById('loginScreen').style.display='flex';
}
async function initApp(){
  try{
    const prof=await sb('profiles?id=eq.'+uid);
    if(!prof||!prof.length){setLS('❌ حسابك غير مفعّل — تواصل مع الأدمن','er');token=null;uid=null;return;}
    uRole=prof[0].role;uName=prof[0].name;
  }catch(e){setLS('❌ خطأ في تحميل البيانات','er');return;}
  // تحميل parallel — بدل sequential awaits
  try{allChatUsers=await sb('profiles?order=name');}catch(e){allChatUsers=[];}
  const app=document.getElementById('mainApp');
  app.style.display='flex';
  closeAhdrMenu();
  document.getElementById('loginScreen').style.display='none';
  applyUserTheme();
  document.getElementById('uname').textContent=uName;
  document.getElementById('urole').textContent={'admin':'👑 أدمن','editor':'✏️ محاسب','viewer':'👁 مشاهد','owner':'🏢 مالك'}[uRole]||uRole;
  // Mobile header
  const _mhName=document.getElementById('uname-hdr');if(_mhName)_mhName.textContent=uName;
  const _mhAName=document.getElementById('ahdr-uname');if(_mhAName)_mhAName.textContent=uName;
  const _mhARole=document.getElementById('ahdr-urole');if(_mhARole)_mhARole.textContent={'admin':'👑 أدمن','editor':'✏️ محاسب','viewer':'👁 مشاهد','owner':'🏢 مالك'}[uRole]||uRole;
  document.getElementById('sbi-admin').style.display=uRole==='admin'?'flex':'none';
  document.getElementById('sbi-approvals').style.display=uRole==='admin'?'flex':'none';
  document.getElementById('sbi-backup').style.display=uRole==='admin'?'flex':'none';
  document.getElementById('sbi-rep').style.display=uRole==='viewer'?'none':'flex';
  const saveProj=document.getElementById('sbi-save-proj');
  if(saveProj)saveProj.style.display=uRole==='admin'?'flex':'none';
  const mobNav=document.getElementById('mobBottomNav');
  if(mobNav)mobNav.style.display=window.innerWidth<768?'flex':'none';
  if(uRole==='admin')updatePendingBadge();
  const canEdit=uRole==='admin'||uRole==='editor'||uRole==='owner';
  document.getElementById('entryForm').style.display=canEdit?'block':'none';
  document.getElementById('vnotice').style.display=uRole==='viewer'?'block':'none';
  document.getElementById('ehint').style.display=canEdit?'block':'none';
  document.getElementById('addPBtn').style.display=(uRole==='admin'||uRole==='editor')?'inline-block':'none';
  document.getElementById('delPBtn').style.display=(uRole==='admin'||uRole==='editor')?'inline-block':'none';
  const editPBtn=document.getElementById('editPBtn');
  if(editPBtn)editPBtn.style.display=(uRole==='admin'||uRole==='editor')?'inline-block':'none';
  document.getElementById('newAdvForm').style.display=canEdit?'block':'none';
  document.getElementById('fab').style.display=canEdit?'block':'none';
  document.getElementById('idt').value=ts();
  if(uRole==='viewer')document.getElementById('idt').setAttribute('readonly','readonly');
  document.getElementById('advEntDate').value=ts();

  // أولاً: أظهر كل عناصر السيدبار للجميع
  ['sbi-dash','sbi-proj-hdr','sbi-daily'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display='';
  });
  const sbProjSub=document.getElementById('sb-proj-sub');
  if(sbProjSub)sbProjSub.style.display='';

  // ثانياً: لو viewer — إخفاء كل حاجة ما عدا العهدة والرسائل
  if(uRole==='viewer'){
    document.getElementById('sbi-dash').style.display='none';
    document.getElementById('sbi-proj-hdr').style.display='none';
    document.getElementById('sbi-daily').style.display='none';
    const vn=document.getElementById('viewerAdvNotice');if(vn)vn.style.display='block';
    if(sbProjSub)sbProjSub.style.display='none';
    document.getElementById('fab').style.display='none';
  }

  // تحميل parallel — loadAllProjects و loadCategories في نفس الوقت
  await loadAllProjects();
  await Promise.all([
    loadCategories(),
    uRole!=='viewer' ? loadProjects() : Promise.resolve()
  ]);
  if(uRole!=='viewer') buildSidebarProjects();
  initAllDateInputs();
  checkAdvNotifications();
  setInterval(checkAdvNotifications, 15000);
  initNetworkStatus();
  setTimeout(()=>{initRealtime();setTimeout(()=>initNotifSystem(),1500);},1000);

  // Viewer يدخل مباشرة على عهدته
  if(uRole==='viewer'){
    await loadAdvList();
    showScreen('adv');
    // افتح عهدته تلقائي لو عنده عهدة واحدة
    await autoOpenViewerAdv();
  } else {
    showScreen('dash');
    // تنبيه الـ backup اليومي
    if(uRole==='admin') checkBackupReminder();
    if(uRole==='admin') checkNotesReminder();
  }
}

function checkBackupReminder(){
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
      try{ await loadNotes(); }catch(e){}
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

