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
