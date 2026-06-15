// ══ LOGIN PARTICLES ══
function initLoginParticles(){
  const c=document.getElementById('lParticles');
  if(!c)return;
  const colors=['rgba(212,196,154,.4)','rgba(29,60,42,.8)','rgba(212,196,154,.2)','rgba(255,255,255,.1)'];
  for(let i=0;i<22;i++){
    const d=document.createElement('div');
    d.className='l-p';
    const s=Math.random()*8+3;
    d.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*15+8}s;animation-delay:${Math.random()*10}s`;
    c.appendChild(d);
  }
}
setTimeout(initLoginParticles,100);


// ══ DRAGGABLE FAB ══
(function(){
  const fab=document.getElementById('fab');
  if(!fab)return;
  let dragging=false,startX,startY,origX,origY,moved=false;
  const btn=document.getElementById('fabMain');

  function onStart(e){
    const t=e.touches?e.touches[0]:e;
    startX=t.clientX;startY=t.clientY;
    const r=fab.getBoundingClientRect();
    origX=r.left;origY=r.top;
    moved=false;
    fab.style.transition='none';
    btn.classList.add('dragging');

    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onEnd);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
  }

  function onMove(e){
    if(e.cancelable)e.preventDefault();
    const t=e.touches?e.touches[0]:e;
    const dx=t.clientX-startX,dy=t.clientY-startY;
    if(Math.abs(dx)>5||Math.abs(dy)>5){dragging=true;moved=true;}
    if(!dragging)return;
    let nx=origX+dx,ny=origY+dy;
    nx=Math.max(0,Math.min(window.innerWidth-60,nx));
    ny=Math.max(0,Math.min(window.innerHeight-60,ny));
    fab.style.left=nx+'px';fab.style.top=ny+'px';
    fab.style.bottom='auto';fab.style.right='auto';
  }

  function onEnd(){
    dragging=false;
    btn.classList.remove('dragging');
    fab.style.transition='';
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
    // Snap to nearest edge
    const r=fab.getBoundingClientRect();
    const mid=window.innerWidth/2;
    if(r.left+30>mid){
      fab.style.left='auto';fab.style.right='18px';
    } else {
      fab.style.right='auto';fab.style.left='18px';
    }
  }

  btn.addEventListener('mousedown',onStart);
  btn.addEventListener('touchstart',onStart,{passive:true});
})();

// ══ DARK MODE ══
function confirmRestart(){showConfirm({icon:'🔄',title:'إعادة تشغيل',msg:'هيتعمل reload للتطبيق.',okLabel:'إعادة تشغيل',okType:'primary',onOk:()=>window.location.href=window.location.href.split("?")[0]+"?v="+Date.now()});}
function toggleDark(){
  const body=document.body;
  const isDay=body.classList.contains('day-mode');
  if(isDay){
    body.classList.remove('day-mode');
    body.classList.add('dark-mode');
    saveDarkPref('dark');
    updateDarkBtn('dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('day-mode');
    saveDarkPref('day');
    updateDarkBtn('day');
  }
}
// ══ MOBILE HEADER DROPDOWN ══
function toggleAhdrMenu(){
  const menu=document.getElementById('ahdrMenu');
  if(!menu)return;
  const isOpen=menu.classList.contains('open');
  if(isOpen){closeAhdrMenu();}else{
    // sync dark mode label
    const isDark=document.body.classList.contains('dark-mode');
    const ico=document.getElementById('ahdrMenuDarkIco');
    const lbl=document.getElementById('ahdrMenuDarkLbl');
    if(ico)ico.textContent=isDark?'☀️':'🌙';
    if(lbl)lbl.textContent=isDark?'الوضع النهاري':'الوضع الليلي';
    menu.classList.add('open');
    setTimeout(()=>document.addEventListener('click',_ahdrMenuClose,{once:true}),10);
  }
}
function closeAhdrMenu(){
  const menu=document.getElementById('ahdrMenu');
  if(menu)menu.classList.remove('open');
}
function _ahdrMenuClose(e){
  const menu=document.getElementById('ahdrMenu');
  const btn=document.getElementById('ahdrMoreBtn');
  if(menu&&!menu.contains(e.target)&&e.target!==btn)closeAhdrMenu();
}
function saveDarkPref(val){
  const key='lft_theme_'+(uid||'guest');
  localStorage.setItem(key,val);
}
function updateDarkBtn(mode){
  const b=document.getElementById('darkBtn');
  if(!b)return;
  if(mode==='day'){b.innerHTML='☀️ نهار';}
  else{b.innerHTML='🌙 ليل';}
}
function applyUserTheme(){
  const key='lft_theme_'+(uid||'guest');
  const saved=localStorage.getItem(key)||'dark';
  document.body.classList.remove('dark-mode','day-mode');
  if(saved==='day')document.body.classList.add('day-mode');
  else document.body.classList.add('dark-mode');
  updateDarkBtn(saved==='day'?'day':'dark');
}


// ══ PASSWORD CHANGE ══
function showPwdModal(){
  document.getElementById('pwdModal').style.display='flex';
  document.getElementById('pwdOld').value='';
  document.getElementById('pwdNew').value='';
  document.getElementById('pwdConfirm').value='';
  document.getElementById('pwdMsg').textContent='';
  document.getElementById('pwdMsg').className='pwd-msg';
  document.getElementById('pwdBar').style.width='0%';
  setTimeout(()=>document.getElementById('pwdOld').focus(),100);
}
function closePwdModal(){
  document.getElementById('pwdModal').style.display='none';
}
function checkPwdStrength(v){
  const bar=document.getElementById('pwdBar');
  let score=0;
  if(v.length>=6)score++;
  if(v.length>=10)score++;
  if(/[A-Z]/.test(v)||/[a-z]/.test(v))score++;
  if(/[0-9]/.test(v))score++;
  if(/[^A-Za-z0-9]/.test(v))score++;
  const pct=score*20;
  const colors=['var(--danger-soft)','var(--warning)','var(--warning)','var(--success-soft)','var(--success)'];
  bar.style.width=pct+'%';
  bar.style.background=colors[Math.min(score-1,4)]||'var(--danger-soft)';
}
async function savePwd(){
  const op=document.getElementById('pwdOld').value;
  const np=document.getElementById('pwdNew').value;
  const cp=document.getElementById('pwdConfirm').value;
  const msg=document.getElementById('pwdMsg');
  if(!op){msg.textContent='⚠️ أدخل كلمة المرور الحالية';msg.className='pwd-msg er';return;}
  if(!np||np.length<6){msg.textContent='⚠️ كلمة المرور أقل من 6 أحرف';msg.className='pwd-msg er';return;}
  if(np!==cp){msg.textContent='❌ كلمتا المرور غير متطابقتين';msg.className='pwd-msg er';return;}
  msg.textContent='⏳ جاري التحقق...';msg.className='pwd-msg';
  try{
    // Get email from Supabase if not stored locally
    if(!uEmail){
      const ur=await fetch(SB+'/auth/v1/user',{headers:{'apikey':AK,'Authorization':'Bearer '+token}});
      const ud=await ur.json();
      uEmail=ud.email||'';
      if(uEmail)localStorage.setItem('lg_em',uEmail);
    }
    if(!uEmail){throw new Error('تعذّر تحديد حسابك — سجّل خروجاً ودخولاً مجدداً');}
    // Verify old password
    await sbAuth('token?grant_type=password','POST',{email:uEmail,password:op});
    msg.textContent='⏳ جاري الحفظ...';
    const res=await fetch(SB+'/auth/v1/user',{
      method:'PUT',
      headers:{'apikey':AK,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({password:np})
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data.message||data.error_description||'خطأ');
    msg.textContent='✅ تم تغيير كلمة المرور بنجاح!';
    msg.className='pwd-msg ok';
    setTimeout(closePwdModal,2000);
  }catch(e){
    const t=e.message||'';
    const isWrongPwd=t.toLowerCase().includes('invalid')||t.includes('credentials')||t.includes('password');
    msg.textContent='❌ '+(isWrongPwd?'كلمة المرور الحالية غير صحيحة':t);
    msg.className='pwd-msg er';
  }
}
function showForgotPwd(){
  const em=document.getElementById('lemail').value.trim();
  document.getElementById('forgotEmail').value=em;
  document.getElementById('forgotMsg').textContent='';
  document.getElementById('forgotMsg').className='pwd-msg';
  document.getElementById('forgotPwdModal').style.display='flex';
  setTimeout(()=>document.getElementById('forgotEmail').focus(),100);
}
function closeForgotPwd(){document.getElementById('forgotPwdModal').style.display='none';}
async function sendResetLink(){
  const email=document.getElementById('forgotEmail').value.trim();
  const msg=document.getElementById('forgotMsg');
  if(!email){msg.textContent='⚠️ أدخل البريد الإلكتروني';msg.className='pwd-msg er';return;}
  msg.textContent='⏳ جاري الإرسال...';msg.className='pwd-msg';
  try{
    const r=await fetch(SB+'/auth/v1/recover',{
      method:'POST',
      headers:{'apikey':AK,'Content-Type':'application/json'},
      body:JSON.stringify({email})
    });
    if(!r.ok){const e=await r.json();throw new Error(e.error_description||e.message||'خطأ');}
    msg.textContent='✅ تم إرسال الرابط! تحقق من إيميلك';
    msg.className='pwd-msg ok';
    setTimeout(closeForgotPwd,3000);
  }catch(e){
    msg.textContent='❌ '+e.message;
    msg.className='pwd-msg er';
  }
}

// ══ LINK USER TO ADVANCE ══
async function showLinkUserModal(){
  if(!curAdv)return;
  const modal=document.getElementById('linkUserModal');
  const sel=document.getElementById('linkUserSel');
  const msg=document.getElementById('linkMsg');
  msg.textContent='';msg.className='pwd-msg';

  // Set advance name
  document.getElementById('linkAdvName').textContent='العهدة: '+curAdv.person_name;

  // Show current linked user
  const curLinked=document.getElementById('linkCurUser');
  if(curAdv.user_id){
    try{
      const u=await sb('profiles?id=eq.'+curAdv.user_id);
      curLinked.textContent='مرتبطة حالياً بـ: '+(u[0]?.name||curAdv.user_id);
    }catch(e){curLinked.textContent='';}
  } else {
    curLinked.textContent='غير مرتبطة بأي مستخدم';
  }

  // Populate users
  try{
    const users=await sb('profiles?order=name');
    sel.innerHTML='<option value="">— اختار المستخدم —</option>';
    users.forEach(u=>{
      const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
      const selected=u.id===curAdv.user_id?' selected':'';
      sel.innerHTML+=`<option value="${u.id}"${selected}>${role} ${u.name}</option>`;
    });
    // Add option to unlink
    sel.innerHTML+='<option value="unlink">🚫 إلغاء الربط</option>';
  }catch(e){sel.innerHTML='<option>خطأ في تحميل المستخدمين</option>';}

  modal.style.display='flex';
}

function closeLinkModal(){
  document.getElementById('linkUserModal').style.display='none';
}

async function saveLinkUser(){
  const sel=document.getElementById('linkUserSel');
  const msg=document.getElementById('linkMsg');
  const val=sel.value;
  if(!val){msg.textContent='⚠️ اختار مستخدم أولاً';msg.className='pwd-msg er';return;}

  msg.textContent='⏳ جاري الحفظ...';msg.className='pwd-msg';
  try{
    const newUserId=val==='unlink'?null:val;
    await sb('advances?id=eq.'+curAdv.id,'PATCH',{user_id:newUserId});
    curAdv.user_id=newUserId;

    // Update in advances array
    const idx=advances.findIndex(a=>a.id===curAdv.id);
    if(idx>=0)advances[idx].user_id=newUserId;

    const linkedUser=newUserId?(await sb('profiles?id=eq.'+newUserId))[0]:null;
    msg.textContent=newUserId
      ?'✅ تم الربط بـ '+( linkedUser?.name||'المستخدم')
      :'✅ تم إلغاء الربط';
    msg.className='pwd-msg ok';

    // Refresh list
    await loadAdvList();
    setTimeout(closeLinkModal,1500);
  }catch(e){
    msg.textContent='❌ '+e.message;
    msg.className='pwd-msg er';
  }
}

// ══ ADVANCE ENTRY NOTIFICATIONS ══
function markNewAdvEntry(advId, amt, cat, desc){
  // Save to localStorage for admin to see
  const key='lft_new_adv_entries';
  const existing=JSON.parse(localStorage.getItem(key)||'[]');
  existing.push({
    advId, amt, cat, desc,
    user: uName,
    advName: curAdv?.person_name||'—',
    time: new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(existing));
}

function checkAdvNotifications(){
  if(uRole!=='admin')return;
  const key='lft_new_adv_entries';
  const items=JSON.parse(localStorage.getItem(key)||'[]');
  const badge=document.getElementById('advBadge');
  if(!badge)return;
  if(items.length>0){
    badge.style.display='inline';
    badge.textContent=items.length;
  } else {
    badge.style.display='none';
  }
}

function clearAdvNotifications(){
  localStorage.removeItem('lft_new_adv_entries');
  const badge=document.getElementById('advBadge');
  if(badge)badge.style.display='none';
}

function showAdvNotifications(){
  const key='lft_new_adv_entries';
  const items=JSON.parse(localStorage.getItem(key)||'[]');
  if(!items.length){notify('لا توجد إشعارات جديدة','info');return;}
  let msg='📋 إشعارات جديدة ('+items.length+'):\n\n';
  items.forEach((n,i)=>{
    const t=new Date(n.time).toLocaleString('ar-EG');
    msg+=`${i+1}. ${n.user} - عهدة: ${n.advName}\n   ${n.cat}: ${n.amt} ج${n.desc?' ('+n.desc+')':''}\n   ${t}\n\n`;
  });
  msg+='اضغط OK لمسح الإشعارات';
  showConfirm({icon:'🔔',title:'مسح الإشعارات',msg:msg,okLabel:'مسح',okType:'warning',onOk:clearAdvNotifications});
}

