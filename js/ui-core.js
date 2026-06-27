// ██ UI HELPERS ► CONFIRM MODAL + NOTIFY + ERRORS ══
function showConfirm({icon='⚠️',title='تأكيد',msg='',okLabel='تأكيد',okType='danger',onOk=()=>{}}){
  const ex=document.getElementById('_confirmModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_confirmModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
  const okColors={danger:'#e74c3c',success:'#27ae60',warning:'#f39c12',primary:'var(--primary)'};
  const okColor=okColors[okType]||okColors.danger;
  ov.innerHTML=`<div style="background:var(--primary,#1D3C2A);border:1px solid rgba(212,196,154,.2);border-radius:20px;padding:28px 24px;width:100%;max-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:slideUp .25s cubic-bezier(.16,1,.3,1);text-align:center;direction:rtl">
    <div style="font-size:38px;margin-bottom:12px">${icon}</div>
    <div style="font-size:16px;font-weight:800;color:var(--accent,#D4C49A);margin-bottom:8px">${title}</div>
    <div style="font-size:13px;color:rgba(212,196,154,.6);margin-bottom:24px;line-height:1.6">${msg}</div>
    <div style="display:flex;gap:10px">
      <button id="_confirmCancel" style="flex:1;padding:12px;background:rgba(212,196,154,.08);border:1px solid rgba(212,196,154,.15);border-radius:12px;color:rgba(212,196,154,.7);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">إلغاء</button>
      <button id="_confirmOk" style="flex:1;padding:12px;background:${okColor};border:none;border-radius:12px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${okLabel}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const close=()=>ov.remove();
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  document.getElementById('_confirmCancel').addEventListener('click',close);
  document.getElementById('_confirmOk').addEventListener('click',()=>{close();onOk();});
}

// ── notify() ──────────────────────────────────────
function notify(msg, type){
  // type: 'err' | 'ok' | 'warn' | 'info'
  const wrap=document.getElementById('notifToastWrap');
  if(!wrap){alert(msg);return;}
  const icons={err:'❌',ok:'✅',warn:'⚠️',info:'ℹ️'};
  const classes={err:'nt-delete',ok:'nt-approve',warn:'nt-pending',info:'nt-entry'};
  const dur=4000;
  const el=document.createElement('div');
  el.className='ntoast '+(classes[type]||'nt-entry');
  el.style.setProperty('--dur',dur/1000+'s');
  el.innerHTML=`<div class="ntoast-icon">${icons[type]||'ℹ️'}</div><div class="ntoast-body"><div class="ntoast-title">${msg}</div></div><div class="ntoast-bar"></div>`;
  el.onclick=()=>{el.style.animation='toast-out .35s cubic-bezier(.4,0,.2,1) forwards';setTimeout(()=>el.remove(),350);};
  wrap.prepend(el);
  const toasts=wrap.querySelectorAll('.ntoast');
  if(toasts.length>4)toasts[toasts.length-1].remove();
  setTimeout(()=>{el.style.animation='toast-out .35s cubic-bezier(.4,0,.2,1) forwards';setTimeout(()=>el.remove(),350);},dur);
}

function toggleLpass(){
  const inp=document.getElementById('lpass');
  const ico=document.getElementById('lEyeIcon');
  if(inp.type==='password'){inp.type='text';if(ico){ico.className='ti ti-eye-off';}}
  else{inp.type='password';if(ico){ico.className='ti ti-eye';}}
}
// ── showPromptModal — بديل prompt() ──────────────────
function showPromptModal({title='',label='',placeholder='',defaultVal='',okLabel='حفظ',inputType='text',onOk=()=>{}}){
  const ex=document.getElementById('_promptModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_promptModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease';
  ov.innerHTML=`<div style="background:var(--primary,#1D3C2A);border:1px solid rgba(212,196,154,.2);border-radius:20px;padding:28px 24px;width:100%;max-width:360px;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:slideUp .25s cubic-bezier(.16,1,.3,1);direction:rtl">
    <div style="font-size:16px;font-weight:800;color:var(--accent,#D4C49A);margin-bottom:16px">${title}</div>
    ${label?`<div style="font-size:12px;color:rgba(212,196,154,.6);margin-bottom:8px">${label}</div>`:''}
    <input id="_promptInput" type="${inputType}" value="${defaultVal.replace(/"/g,'&quot;')}" placeholder="${placeholder}" style="width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(212,196,154,.25);background:rgba(0,0,0,.25);color:var(--accent,#D4C49A);font-family:inherit;font-size:14px;outline:none;direction:rtl;box-sizing:border-box;margin-bottom:20px">
    <div style="display:flex;gap:10px">
      <button id="_promptCancel" style="flex:1;padding:12px;background:rgba(212,196,154,.08);border:1px solid rgba(212,196,154,.15);border-radius:12px;color:rgba(212,196,154,.7);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">إلغاء</button>
      <button id="_promptOk" style="flex:1;padding:12px;background:var(--primary-btn,#27ae60);border:none;border-radius:12px;color:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">${okLabel}</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const inp=document.getElementById('_promptInput');
  const close=()=>ov.remove();
  inp.focus();inp.select();
  ov.addEventListener('click',e=>{if(e.target===ov)close();});
  document.getElementById('_promptCancel').addEventListener('click',close);
  const submit=()=>{const v=inp.value.trim();if(!v)return;close();onOk(v);};
  document.getElementById('_promptOk').addEventListener('click',submit);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')submit();if(e.key==='Escape')close();});
}

/**
 * يحول الـ error التقني لرسالة مفهومة للمستخدم
 * @param {Error|object} e - الخطأ
 * @returns {string} رسالة بالعربي
 */
function friendlyError(e){
  if(!navigator.onLine)return'لا يوجد اتصال بالإنترنت';
  let msg=e?.message||e?.error||String(e)||'';
  // لو الـ message فيها JSON — حللها
  if(msg.startsWith('{')){
    try{const j=JSON.parse(msg);msg=j.message||j.error||j.msg||msg;}catch(_){}
  }
  if(msg.includes('Failed to fetch')||msg.includes('NetworkError')||msg.includes('fetch'))return'تعذّر الاتصال بالخادم — تحقق من الإنترنت';
  if(msg.includes('JWT')||msg.includes('token')||msg.includes('session'))return'انتهت جلستك — سجّل الدخول مجدداً';
  if(msg.includes('duplicate')||msg.includes('unique'))return'البيانات موجودة مسبقاً';
  if(msg.includes('foreign key')||msg.includes('violates'))return'لا يمكن حذف هذا العنصر — مرتبط ببيانات أخرى';
  if(msg.includes('permission')||msg.includes('policy')||msg.includes('not allowed'))return'ليس لديك صلاحية لهذا الإجراء';
  if(msg.includes('timeout')||msg.includes('timed out'))return'انتهت مهلة الاتصال — حاول مرة أخرى';
  if(msg.includes('404')||msg.includes('Not Found'))return'البيانات غير موجودة';
  if(msg.includes('500')||msg.includes('Internal'))return'خطأ في الخادم — حاول مرة أخرى';
  if(msg.includes('Invalid login')||msg.includes('Invalid email')||msg.includes('credentials'))return'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  if(msg.includes('Email not confirmed'))return'البريد الإلكتروني غير مفعّل — تحقق من بريدك';
  if(msg.includes('Too many requests'))return'محاولات كثيرة — انتظر دقيقة وحاول مجدداً';
  if(msg.includes('row-level security')||msg.includes('RLS'))return'ليس لديك صلاحية الوصول';
  if(msg.includes('offline'))return'لا يوجد اتصال بالإنترنت';
  if(msg.length>0&&msg.length<80)return msg;
  return'حدث خطأ غير متوقع — حاول مرة أخرى';
}

// ── XSS Protection ──────────────────────────────────
function esc(str){
  if(!str)return'';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
