async function login(){
// ██ AUTH — LOGIN / LOGOUT / CHECK SAVED / INIT APP
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
  try{await sbAuth('logout','POST');}catch(e){console.warn('logout failed:',e);} // صامت متعمد
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
    try{const r=await fetch(SB+'/auth/v1/user',{headers:{'apikey':AK,'Authorization':'Bearer '+tk}});if(r.ok){token=tk;uid=id;uEmail=em||'';await initApp();return;}}catch(e){console.warn('session check failed:',e);} // صامت متعمد
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
  document.getElementById('urole').textContent={'admin':'👑 أدمن','editor':'✏️ محاسب','viewer':'👁 مشاهد','owner':'🏢 أونر'}[uRole]||uRole;
  // Mobile header
  const _mhName=document.getElementById('uname-hdr');if(_mhName)_mhName.textContent=uName;
  const _mhAName=document.getElementById('ahdr-uname');if(_mhAName)_mhAName.textContent=uName;
  const _mhARole=document.getElementById('ahdr-urole');if(_mhARole)_mhARole.textContent={'admin':'👑 أدمن','editor':'✏️ محاسب','viewer':'👁 مشاهد','owner':'🏢 أونر'}[uRole]||uRole;
  const isAdmin=uRole==='admin'||uRole==='super_admin';
  document.getElementById('sbi-admin').style.display=isAdmin?'flex':'none';
  document.getElementById('sbi-approvals').style.display=isAdmin?'flex':'none';
  document.getElementById('sbi-backup').style.display=isAdmin?'flex':'none';
  document.getElementById('sbi-rep').style.display=(uRole==='viewer')?'none':'flex';
  const saveProj=document.getElementById('sbi-save-proj');
  if(saveProj)saveProj.style.display=uRole==='admin'?'flex':'none';
  const mobNav=document.getElementById('mobBottomNav');
  if(mobNav)mobNav.style.display=window.innerWidth<768?'flex':'none';
  if(uRole==='admin'||uRole==='super_admin')updatePendingBadge();
  const canEdit=uRole==='admin'||uRole==='super_admin'||uRole==='editor'||uRole==='owner';
  document.getElementById('entryForm').style.display=canEdit?'block':'none';
  document.getElementById('vnotice').style.display=uRole==='viewer'?'block':'none';
  document.getElementById('ehint').style.display=canEdit?'block':'none';
  document.getElementById('addPBtn').style.display=(isAdmin||uRole==='editor')?'inline-block':'none';
  document.getElementById('delPBtn').style.display=(isAdmin||uRole==='editor')?'inline-block':'none';
  const editPBtn=document.getElementById('editPBtn');
  if(editPBtn)editPBtn.style.display=(uRole==='admin'||uRole==='editor')?'inline-block':'none';
  document.getElementById('newAdvForm').style.display=canEdit?'block':'none';
  document.getElementById('fab').style.display=canEdit?'block':'none';
  document.getElementById('idt').value=ts();
  if(uRole==='viewer')document.getElementById('idt').setAttribute('readonly','readonly');
  const advEntDateEl=document.getElementById('advEntDate');
  if(advEntDateEl)advEntDateEl.value=ts();

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

  // تحميل — المشاريع أولاً ثم الباقي
  await loadAllProjects();
  await Promise.all([
    loadCategories(),
    uRole!=='viewer' ? loadProjects() : Promise.resolve()
  ]);
  if(uRole!=='viewer') buildSidebarProjects();
  if(uRole!=='viewer') _updateEntryBanner();
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
    if(uRole==='admin'||uRole==='super_admin') checkBackupReminder();
    if(uRole==='admin'||uRole==='super_admin') checkNotesReminder();
  }
}

