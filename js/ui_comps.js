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


// ── DRAGGABLE FAB ──────────────────────────────────
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

// ── DARK MODE ──────────────────────────────────────
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
// ── MOBILE HEADER DROPDOWN ────────────────────────
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
  // Update sidebar dark button
  const ico=document.getElementById('sb-dark-icon');
  const lbl=document.getElementById('sb-dark-lbl');
  if(ico)ico.textContent=mode==='dark'?'☀️':'🌙';
  if(lbl)lbl.textContent=mode==='dark'?'الوضع النهاري':'الوضع الليلي';

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


// ── PASSWORD CHANGE ───────────────────────────────
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

// ── LINK USER TO ADVANCE ──────────────────────────
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

// ██ ADVANCE ENTRY NOTIFICATIONS ══════════════════
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

// ══════════════════════════════════════════
//  DASHBOARD DATE FILTER
// ══════════════════════════════════════════
function initDashFilter(){
  const sel=document.getElementById('fProjSel');
  if(!sel)return;
  sel.innerHTML='<option value="all">كل المشاريع</option>';
  allProjects.forEach(p=>{
    sel.innerHTML+=`<option value="${p.id}">${esc(p.name)}</option>`;
  });
}

function parseDt(str){
  // unified: يقبل dd/mm/yyyy أو yyyy-mm-dd أو Excel serial
  if(!str||str==='—')return null;
  str=String(str).trim();
  if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)){const[d,m,y]=str.split('/');const dt=new Date(+y,+m-1,+d);return isNaN(dt)?null:dt;}
  if(/^\d{4}-\d{2}-\d{2}/.test(str)){const dt=new Date(str.substring(0,10));return isNaN(dt)?null:dt;}
  const num=parseFloat(str);
  if(!isNaN(num)&&num>40000&&num<60000){return new Date(Date.UTC(1899,11,30)+num*86400000);}
  const dt=new Date(str);
  return isNaN(dt)?null:dt;
}
function cleanDate(str){
  if(!str||str==='—')return '—';
  // dd/mm/yyyy
  if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str))return str;
  // yyyy-mm-dd
  if(/^\d{4}-\d{2}-\d{2}$/.test(str)){const[y,m,d]=str.split('-');return d+'/'+m+'/'+y;}
  // Excel serial number (e.g. 46156)
  const num=parseFloat(str);
  if(!isNaN(num)&&num>40000&&num<60000){
    const d=new Date(Date.UTC(1899,11,30)+num*86400000);
    if(!isNaN(d))return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear();
  }
  // JS Date string (Thu May 14 2026...)
  const d=new Date(str);
  if(!isNaN(d))return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
  return str;
}

function runDashFilter(){
  const projId=document.getElementById('fProjSel').value;
  const fromStr=document.getElementById('fDateFrom').value;
  const toStr=document.getElementById('fDateTo').value;
  if(!fromStr&&!toStr){notify('اختار تاريخ على الأقل','warn');return;}

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  // Filter entries
  let filtered=allEntries;
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

  const inc=filtered.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=filtered.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  const bal=inc-exp;

  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr?fromStr:'بداية')+' → '+(toStr?toStr:'اليوم');

  const entriesSorted=[...filtered].sort((a,b)=>parseDt(b.entry_date)-parseDt(a.entry_date));

  const el=document.getElementById('dashFilterResult');
  el.style.display='block';
  el.innerHTML=`
    <div class="filter-result">
      <div class="filter-result-title">📊 ${projName} · ${period}</div>
      <div class="filter-kpis">
        <div class="fkpi"><div class="fkpi-lbl">وارد</div><div class="fkpi-val inc">▲ ${fn(inc)} ج</div></div>
        <div class="fkpi"><div class="fkpi-lbl">مصروف</div><div class="fkpi-val exp">▼ ${fn(exp)} ج</div></div>
        <div class="fkpi"><div class="fkpi-lbl">رصيد</div><div class="fkpi-val bal">${bal>=0?'+':''}${fn(bal)} ج</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="filter-btn dl" onclick="downloadDashReport()" style="font-size:11px;padding:6px 14px">📥 Excel</button>
        <button class="filter-btn dl is30" onclick="downloadDashPDF()">📕 PDF</button>
        <span class="filter-count-badge">${filtered.length} قيد</span>
      </div>
      <div class="filter-entries">
        ${entriesSorted.map(e=>{
          const proj=allProjectsMap[e.project_id];
          return `<div class="fentry">
            <div class="fentry-type ${e.type}"></div>
            <div class="fentry-date">${cleanDate(e.entry_date)}</div>
            <div class="fentry-cat">${e.category||'—'}${proj&&projId==='all'?' · '+proj.name:''}</div>
            <div class="fentry-desc">${e.description||''}</div>
            <div class="fentry-amt ${e.type}">${e.type==='i'?'▲':'▼'} ${fn(e.amount)} ج</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  // Store for download
  window._lastFilterData={projName,period,filtered,inc,exp,bal};
}

function clearDashFilter(){
  document.getElementById('dashFilterResult').style.display='none';
  document.getElementById('fDateFrom').value='';
  document.getElementById('fDateTo').value='';
  document.getElementById('fProjSel').value='all';
  window._lastFilterData=null;
}

async function downloadDashReport(){
  const d=window._lastFilterData;
  if(!d){notify('شغّل الفلتر أولاً','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(typeof ExcelJS==='undefined'){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير',{views:[{rightToLeft:true}]});
    const COLS=6;ws.columns=[{width:14},{width:12},{width:16},{width:26},{width:16},{width:20}];
    _xlHeader(ws,'📊 تقرير: '+d.projName,'الفترة: '+d.period+'  |  وارد: '+fn(d.inc)+' ج  |  مصاريف: '+fn(d.exp)+' ج  |  رصيد: '+fn(d.bal)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','النوع','البند','البيان','المبلغ (ج)','المشروع'],COLS);
    d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const isI=e.type==='i';
      _xlDataRow(ws,[e.entry_date||'',isI?'▲ وارد':'▼ مصروف',e.category||'',e.description||'',e.amount,proj?.name||''],i,[null,isI?_XC.PS:_XC.RD,null,null,isI?_XC.PS:_XC.RD,null]);
    });
    _xlTotRow(ws,['','','','الرصيد',d.bal,''],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='تقرير_'+d.projName+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم التحميل','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ██ PDF HELPERS ════════════════════════════════════
// ═══════════════════════════════════════════════════
//  UNIFIED REPORT TEMPLATE HELPERS
// ═══════════════════════════════════════════════════
const _PDF_CSS=`
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;direction:rtl;background:var(--bg-gray);color:#1a1a1a}
  .page{background:var(--bg-pure);max-width:960px;margin:0 auto;padding:36px 40px;min-height:100vh}
  @media print{.no-print{display:none!important}}
  /* ── HEADER ── */
  .hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:4px solid #1D3C2A;margin-bottom:24px}
  .hdr-left h1{font-size:24px;font-weight:900;color:var(--primary);margin-bottom:3px}
  .hdr-left .sub{font-size:12px;color:var(--text-soft);line-height:1.6}
  .hdr-badges{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
  .hdr-badge{font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block}
  .hdr-badge.owner{background:var(--success-glow);color:var(--primary-btn);border:1px solid #C8E6C9}
  .hdr-badge.acct{background:var(--info-bg);color:var(--info);border:1px solid #BBDEFB}
  .hdr-logo{height:64px;object-fit:contain}
  /* ── KPI CARDS ── */
  .kpis{display:grid;gap:12px;margin-bottom:24px}
  .kpis-3{grid-template-columns:1fr 1fr 1fr}
  .kpis-2{grid-template-columns:1fr 1fr}
  .kpis-4{grid-template-columns:1fr 1fr 1fr 1fr}
  .kpi{border-radius:10px;padding:14px 16px;text-align:center;border:1px solid}
  .kpi-lbl{font-size:10px;font-weight:700;margin-bottom:7px;letter-spacing:.4px;text-transform:uppercase}
  .kpi-val{font-size:22px;font-weight:900;font-family:Arial,sans-serif}
  .kpi-inc{background:var(--success-glow);border-color:var(--success-muted);color:#1E6B3A}
  .kpi-exp{background:var(--danger-pale);border-color:var(--danger-tint);color:#922B21}
  .kpi-adv{background:var(--info-bg);border-color:var(--info-muted);color:#185FA5}
  .kpi-net-pos{background:var(--success-glow);border-color:var(--success-muted);color:#1E6B3A}
  .kpi-net-neg{background:var(--danger-pale);border-color:var(--danger-tint);color:#922B21}
  .kpi-neutral{background:var(--bg-pure);border-color:var(--border-light);color:#555}
  /* ── SECTION TITLE ── */
  .sec-ttl{font-size:13px;font-weight:800;color:var(--primary);padding:10px 0;border-bottom:2px solid #e0e0e0;margin-bottom:0;display:flex;align-items:center;gap:6px}
  /* ── TABLE ── */
  table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:24px}
  thead tr{background:#1D3C2A}
  th{color:var(--accent);padding:10px 8px;text-align:right;font-size:10px;font-weight:700;letter-spacing:.3px}
  th:last-child{text-align:center}
  td{padding:8px 8px;border-bottom:1px solid #f0f0f0;vertical-align:middle}
  tr:nth-child(even) td{background:#fafaf8}
  tr:last-child td{border-bottom:none}
  tfoot tr{background:#f5f0e8}
  tfoot td{padding:9px 8px;font-weight:800;border-top:2px solid #1D3C2A}
  /* ── BADGES ── */
  .b{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}
  .b-i{background:var(--success-glow);color:#1E6B3A}.b-e{background:var(--danger-pale);color:#922B21}
  .b-pay{background:var(--success-glow);color:#1E6B3A}.b-work{background:var(--info-bg);color:#185FA5}.b-mat{background:var(--warning-pale);color:#E65100}
  /* ── AMOUNTS ── */
  .amt{white-space:nowrap;font-weight:700}
  .pos{color:#1E6B3A}.neg{color:#922B21}
  /* ── WATERMARK ── */
  .wm{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:80px;font-weight:900;color:rgba(29,60,42,.04);pointer-events:none;letter-spacing:4px;z-index:0;white-space:nowrap}
  /* ── CHART ── */
  .chart-wrap{width:100%;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #eee}
  .chart-wrap img{width:100%;max-height:240px;object-fit:contain;display:block}
  /* ── FOOTER ── */
  .ftr{margin-top:28px;padding-top:16px;border-top:2px solid #eeeeee;display:flex;justify-content:space-between;align-items:center;gap:16px}
  .ftr-logo{height:36px;opacity:.4;flex-shrink:0}
  .ftr-mid{text-align:center;flex:1}
  .ftr-company{font-size:12px;font-weight:800;color:var(--primary);margin-bottom:4px}
  .ftr-owner{font-size:10px;color:var(--primary-btn);font-weight:600;margin-bottom:2px}
  .ftr-acct{font-size:10px;color:var(--info);font-weight:600;background:var(--info-bg);display:inline-block;padding:2px 10px;border-radius:20px;margin-bottom:3px}
  .ftr-date{font-size:9px;color:var(--text-faint);margin-top:2px}
  .ftr-conf{font-size:9px;color:var(--border-mid);text-align:left;line-height:1.5;flex-shrink:0}
  @media print{body{background:#fff}.page{padding:20px;max-width:100%}button{display:none}.wm{display:block}}
`;

function _pdfHeader(title,subtitle){
  return `<div class="hdr">
    <div class="hdr-left">
      <h1>${title}</h1>
      <div class="sub">${subtitle}</div>
      <div class="hdr-badges">
        <span class="hdr-badge owner">🏗 المهندس محمد شكري &nbsp;|&nbsp; 📞 01099808939</span>
        <span class="hdr-badge acct">✍ محاسب: محمود مصباح &nbsp;|&nbsp; 📞 01114892670</span>
      </div>
    </div>
    <img src="logo.jpg" class="hdr-logo">
  </div>`;
}
function _pdfFooter(){
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  return `<div class="ftr">
    <img src="logo.jpg" class="ftr-logo">
    <div class="ftr-mid">
      <div class="ftr-company">Legacy Fine Touch</div>
      <div class="ftr-owner">🏗 المهندس محمد شكري &nbsp;|&nbsp; 📞 01099808939</div>
      <div class="ftr-acct">✍ محاسب: محمود مصباح &nbsp;|&nbsp; 📞 01114892670</div>
      <div class="ftr-date">تم الإنشاء: ${now}</div>
    </div>
    <div class="ftr-conf">سري وخاص<br>بالشركة</div>
  </div>`;
}
function _pdfOpen(title){
  return `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${title}</title><style>${_PDF_CSS}</style></head><body><div class="wm">LEGACY</div><div class="page">`;
}
function _pdfClose(){
  return `</div><div style="position:fixed;top:10px;left:10px;z-index:9999;print-color-adjust:exact" class="no-print"><button onclick="window.close()" style="background:#1D3C2A;color:#D4C49A;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;font-family:Cairo,sans-serif">✕ إغلاق</button><button onclick="window.print()" style="background:#D4C49A;color:#1D3C2A;border:none;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;margin-right:6px;font-family:Cairo,sans-serif">🖨 طباعة</button></div><script>window.onload=()=>{};<\/script></body></html>`;
}

// ═══════════════════════════════════════════════════════════════
//  UNIFIED EXCEL STYLE — mirrors PDF template
// ═══════════════════════════════════════════════════════════════
const _XC={
  G1:'FF1D3C2A', G2:'FF2A5C38', G5:'FFEDF5EE', G6:'FFF4F8F5',
  BEIGE:'FFD4C49A', BEIGE2:'FFE8D8B0', BEIGE3:'FFF5EDDB', BEIGE4:'FFFAF5EC',
  BL:'FF1A3A5C', LB:'FFD6E8F7',
  RD:'FF922B21', DR:'FF6E1C1C', LR:'FFFAE5E5',
  PS:'FF1E6B3A', LP:'FFE2F5EA',
  MQ:'FFA05F1A', LM:'FFFDE8C8',
  WH:'FFFFFFFF', GR:'FF888888', GR2:'FFF5F5F5', GR3:'FFFAFAF8',
  INFO:'FF185FA5', INFOL:'FFE3F0FF',
};
function _xF(c,argb){c.fill={type:'pattern',pattern:'solid',fgColor:{argb:argb}};}
function _xT(c,argb,size,bold,italic){c.font={color:{argb:argb},size:size||10,bold:!!bold,italic:!!italic,name:'Cairo'};}
function _xA(c,h,v){c.alignment={horizontal:h||'right',vertical:v||'middle',readingOrder:'rightToLeft',wrapText:false};}
function _xB(c,style,argb){const b={style:style||'thin',color:{argb:argb||'FFE0E0E0'}};c.border={top:b,bottom:b,left:b,right:b};}
function _xN(c,fmt){c.numFmt=fmt||'#,##0';}

// ── كامل Header (Title + Subtitle bar + empty separator) ──
function _xlHeader(ws,title,subtitle,cols){
  const L=String.fromCharCode(64+cols);
  // R1 — title
  ws.addRow([title]);ws.mergeCells('A1:'+L+'1');
  const r1=ws.getCell('A1');
  _xF(r1,_XC.G1);_xT(r1,_XC.BEIGE,14,true);_xA(r1,'right');
  ws.getRow(1).height=34;
  // R2 — info bar
  const info='✍ محاسب: محمود مصباح  |  📞 01114892670     🏗 المهندس محمد شكري  |  📞 01099808939     📅 '+new Date().toLocaleDateString('ar-EG')+(subtitle?'     |     '+subtitle:'');
  ws.addRow([info]);ws.mergeCells('A2:'+L+'2');
  const r2=ws.getCell('A2');
  _xF(r2,_XC.G5);_xT(r2,_XC.G2,10,true);_xA(r2,'right');
  r2.border={bottom:{style:'medium',color:{argb:_XC.G1}}};
  ws.getRow(2).height=22;
  // R3 — separator
  ws.addRow([]);ws.getRow(3).height=6;
}

// ── Header Row للجدول ──
function _xlHdrRow(ws,headers,cols){
  ws.addRow(headers);
  const r=ws.lastRow;r.height=26;
  for(let i=1;i<=cols;i++){
    const c=r.getCell(i);
    _xF(c,_XC.G2);_xT(c,_XC.WH,10,true);_xA(c,'center');
    c.border={bottom:{style:'medium',color:{argb:_XC.BEIGE}},top:{style:'thin',color:{argb:_XC.G1}},left:{style:'thin',color:{argb:_XC.G1}},right:{style:'thin',color:{argb:_XC.G1}}};
  }
}

// ── Data Row ──
function _xlDataRow(ws,values,idx,colorOverrides){
  ws.addRow(values);
  const r=ws.lastRow;r.height=21;
  const bg=idx%2===0?_XC.WH:_XC.GR3;
  values.forEach((_,i)=>{
    const c=r.getCell(i+1);
    _xF(c,bg);_xT(c,'FF1A1A1A',10);_xA(c,'right');
    c.border={bottom:{style:'thin',color:{argb:'FFF0F0F0'}},right:{style:'thin',color:{argb:'FFF5F5F5'}}};
    if(typeof values[i]==='number'){_xN(c);_xT(c,_XC.G1,10,true);}
    if(colorOverrides&&colorOverrides[i])_xT(c,colorOverrides[i],10,true);
  });
}

// ── Totals Row ──
function _xlTotRow(ws,values,cols){
  ws.addRow(values);
  const r=ws.lastRow;r.height=28;
  for(let i=1;i<=cols;i++){
    const c=r.getCell(i);
    _xF(c,_XC.G1);_xT(c,_XC.BEIGE,11,true);_xA(c,i===1?'right':'center');
    c.border={top:{style:'medium',color:{argb:_XC.BEIGE}},bottom:{style:'medium',color:{argb:_XC.BEIGE}}};
    if(typeof values[i-1]==='number'){_xN(c);}
  }
}

// ── KPI bar (صف ملون تحت الهيدر يعرض الأرقام الرئيسية) ──
function _xlKpiRow(ws,kpis,cols){
  // kpis = [{label,value,color}]
  const L=String.fromCharCode(64+cols);
  const perCell=Math.floor(cols/kpis.length);
  let col=1;
  kpis.forEach((k,i)=>{
    const endCol=i===kpis.length-1?cols:col+perCell-1;
    const startLetter=String.fromCharCode(64+col);
    const endLetter=String.fromCharCode(64+endCol);
    if(startLetter!==endLetter){try{ws.mergeCells(startLetter+ws.rowCount+':'+endLetter+ws.rowCount);}catch(e){}}
    const c=ws.getCell(startLetter+(ws.rowCount));
    c.value=k.label+': '+Number(k.value).toLocaleString('en-US')+' ج';
    _xF(c,k.bgColor||_XC.G5);_xT(c,k.color||_XC.G1,11,true);_xA(c,'center');
    c.border={bottom:{style:'medium',color:{argb:_XC.G2}}};
    col=endCol+1;
  });
}

// ── Footer ──
function _xlFooter(ws,cols){
  ws.addRow([]);ws.lastRow.height=6;
  const L=String.fromCharCode(64+cols);
  ws.addRow(['Legacy Fine Touch  ·  المهندس محمد شكري  |  01099808939  ·  محاسب: محمود مصباح  |  01114892670  ·  سري وخاص بالشركة']);
  ws.mergeCells('A'+ws.rowCount+':'+L+ws.rowCount);
  const f=ws.getCell('A'+ws.rowCount);
  _xF(f,_XC.BEIGE4);_xT(f,_XC.GR,9,false,true);_xA(f,'center');
  ws.lastRow.height=18;
}

// backward-compat wrappers
function _xlAddTitle(ws,title,cols,summary){_xlHeader(ws,title,summary,cols);}
function _xlAddFooter(ws,cols){_xlFooter(ws,cols);}

function openPrintWindow(html){
  // inject html2pdf script + download button into the html
  const withPdf=html.replace('</head>',
    `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script></head>`
  ).replace('<body',
    `<body`
  ).replace(
    /(<button[^>]*onclick="window\.close[^"]*"[^>]*>.*?<\/button>)/,
    `$1 <button onclick="downloadAsPdf()" style="padding:8px 18px;background:#1D3C2A;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit;font-weight:700;">⬇ تحميل PDF</button>`
  );
  const w=window.open('','_blank');
  if(w){
    w.document.open();
    w.document.write(withPdf);
    w.document.write(`<script>
      function downloadAsPdf(){
        const btn=document.querySelector('[onclick="downloadAsPdf()"]');
        if(btn)btn.style.display='none';
        const title=document.title||'تقرير';
        html2pdf().set({
          margin:8,
          filename:title+'.pdf',
          image:{type:'jpeg',quality:0.98},
          html2canvas:{scale:2,useCORS:true,direction:'rtl'},
          jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
        }).from(document.body).save().then(()=>{
          if(btn)btn.style.display='';
        });
      }
    <\/script>`);
    w.document.close();
  } else {
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='report.html';
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
}

async function downloadDashPDF(){try{
  const d=window._lastFilterData;
  if(!d){notify('شغّل الفلتر أولاً','warn');return;}
  // Simple HTML print to PDF
  const rows=d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).map(e=>{
    const proj=allProjectsMap[e.project_id];
    const color=e.type==='i'?'var(--primary-btn)':'var(--danger)';
    return `<tr>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
      <td>${cleanDate(e.entry_date)}</td>
      <td style="color:${color};font-weight:700">${e.type==='i'?'وارد':'مصروف'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||''}</td>
      <td style="color:${color};font-weight:700;text-align:left">${e.type==='i'?'▲':'▼'} ${fn(e.amount)} ج</td>
      <td>${proj?.name||''}</td>
    </tr>`;
  }).join('');
  const html=_pdfOpen('تقرير')+
    _pdfHeader('📁 '+d.projName,'📅 '+d.period)+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.exp)} ج</div></div>
      <div class="kpi ${d.bal>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي الرصيد</div><div class="kpi-val">${d.bal>=0?'▲':'▼'} ${fn(Math.abs(d.bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>البند</th><th>البيان</th><th>المبلغ</th><th>المشروع</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}catch(_e){notify('⚠️ خطأ في تصدير PDF','er');}}

// ══════════════════════════════════════════
// ██ EXCEL HELPERS ══════════════════════════════════
//  ADVANCE DATE FILTER
// ══════════════════════════════════════════
let _advFilteredEntries=null;

function runAdvFilter(){
  const fromStr=document.getElementById('advFDateFrom').value;
  const toStr=document.getElementById('advFDateTo').value;
  if(!fromStr&&!toStr){clearAdvFilter();return;}

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;

  const allE=window._curAdvEntries||[];
  let filtered=allE;
  if(from)filtered=filtered.filter(e=>{const d=pdt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=pdt(e.entry_date);return d&&d<=to;});

  _advFilteredEntries=filtered;
  const total=filtered.reduce((s,e)=>s+e.amount,0);

  const ae=document.getElementById('advEntries');
  ae.innerHTML=`<div class="report-adv-section">
    <span>📅 ${fromStr||'البداية'} → ${toStr||'اليوم'} · ${filtered.length} قيد</span>
    <span style="font-weight:700;color:#C86060">▼ ${fn(total)} ج</span>
  </div>
  ${filtered.length===0?'<div class="emp">لا يوجد مصروفات في هذه الفترة</div>':
    filtered.map(e=>`<div class="rw">
      <span>${e.entry_date||'—'}</span>
      <span>${e.category||'—'}</span>
      <span style="color:#aaa">${e.description||''}</span>
      <span style="color:var(--danger-soft);font-weight:700">▼ ${fn(e.amount)} ج</span>
    </div>`).join('')}`;
}

function clearAdvFilter(){
  document.getElementById('advFDateFrom').value='';
  document.getElementById('advFDateTo').value='';
  _advFilteredEntries=null;
  loadAdvDetail();
}

async function downloadAdvReport(){
  const entries=_advFilteredEntries||window._curAdvEntries||[];
  if(!entries.length){notify('لا يوجد بيانات للتحميل','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(typeof ExcelJS==='undefined'){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
    let installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}catch(e2){}
    const totalGiven=installs.reduce((s,i)=>s+i.amount,0);
    const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
    const remaining=totalGiven-totalSpent;
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('العهدة',{views:[{rightToLeft:true}]});
    const COLS=5;ws.columns=[{width:14},{width:18},{width:28},{width:22},{width:16}];
    _xlHeader(ws,'💼 تقرير عهدة: '+(curAdv?.person_name||'—'),'دفعات: '+fn(totalGiven)+' ج  |  صرف: '+fn(totalSpent)+' ج  |  متبقي: '+fn(remaining)+' ج',COLS);
    // KPI row
    ws.addRow([]);ws.lastRow.height=6;
    const kpiR=ws.rowCount+1;
    ws.addRow(['إجمالي الدفعات: '+fn(totalGiven)+' ج','','إجمالي الصرف: '+fn(totalSpent)+' ج','','المتبقي: '+fn(remaining)+' ج']);
    ws.mergeCells('A'+kpiR+':B'+kpiR);ws.mergeCells('C'+kpiR+':D'+kpiR);
    [[1,_XC.INFOL,_XC.BL],[3,_XC.LR,_XC.RD],[5,remaining>=0?_XC.LP:_XC.LR,remaining>=0?_XC.PS:_XC.RD]].forEach(([col,bg,fg])=>{
      const c=ws.getCell(kpiR,col);_xF(c,bg);_xT(c,fg,11,true);_xA(c,'center');
      c.border={bottom:{style:'medium',color:{argb:_XC.G1}}};
    });
    ws.getRow(kpiR).height=26;
    ws.addRow([]);ws.lastRow.height=6;
    _xlHdrRow(ws,['التاريخ','البند','البيان','المشروع','المبلغ (ج)'],COLS);
    const sorted=[...entries].sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
    sorted.forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      _xlDataRow(ws,[e.entry_date||'—',e.category||'—',e.description||'—',proj?.name||'—',e.amount],i,[null,null,null,null,_XC.RD]);
    });
    _xlTotRow(ws,['إجمالي المصروفات','','','',totalSpent],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='عهدة_'+(curAdv?.person_name||'report')+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم التحميل','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function downloadAdvPDF(){
  const entries=_advFilteredEntries||window._curAdvEntries||[];
  if(!entries.length){notify('لا يوجد بيانات للتحميل','warn');return;}
  setSav('⏳ جاري تجهيز PDF...','ng');
  try{
    let installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}catch(e2){console.warn('installs PDF:',e2);} // صامت متعمد
    const totalGiven=installs.reduce((s,i)=>s+i.amount,0);
    const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
    const remaining=totalGiven-totalSpent;
    const sorted=[...entries].sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
    const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
    const rows=sorted.map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      return `<tr>
        <td style="text-align:center;color:#888">${i+1}</td>
        <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.seq||'—'}</td>
        <td style="font-size:10px">${cleanDate(e.entry_date)}</td>
        <td style="font-weight:700;color:#922B21">${e.category||'—'}</td>
        <td style="color:#555">${e.description||'—'}</td>
        <td style="color:var(--text-soft);font-size:10px">${proj?.name||'—'}</td>
        <td class="amt neg">${Number(e.amount).toLocaleString('en-US')} ج</td>
      </tr>`;
    }).join('');
    const instRows=installs.map(i=>`<tr>
      <td>${i.note||'دفعة'}</td>
      <td>${i.inst_date||'—'}</td>
      <td class="amt pos">${Number(i.amount).toLocaleString('en-US')} ج</td>
    </tr>`).join('');
    const html=_pdfOpen('تقرير عهدة - '+curAdv?.person_name)+
      _pdfHeader('💼 تقرير عهدة: '+(curAdv?.person_name||'—'),'🗓 '+now+' · '+sorted.length+' قيد مصروف · Legacy Fine Touch')+
      `<div class="kpis kpis-3">
        <div class="kpi kpi-adv"><div class="kpi-lbl">إجمالي الدفعات</div><div class="kpi-val">${Number(totalGiven).toLocaleString('en-US')} ج</div></div>
        <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي الصرف</div><div class="kpi-val">${Number(totalSpent).toLocaleString('en-US')} ج</div></div>
        <div class="kpi ${remaining>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">الرصيد المتبقي</div><div class="kpi-val">${Number(remaining).toLocaleString('en-US')} ج</div></div>
      </div>
      <div class="sec-ttl">💸 مصروفات العهدة (${sorted.length} قيد)</div>
      <table>
        <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>البند</th><th>البيان</th><th>المشروع</th><th>المبلغ</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt neg">${Number(totalSpent).toLocaleString('en-US')} ج</td></tr></tfoot>
      </table>
      ${installs.length?`<div class="sec-ttl">💰 الدفعات (${installs.length} دفعة)</div>
      <table>
        <thead><tr><th>البيان</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
        <tbody>${instRows}</tbody>
        <tfoot><tr><td colspan="2">الإجمالي</td><td class="amt pos">${Number(totalGiven).toLocaleString('en-US')} ج</td></tr></tfoot>
      </table>`:''}`+
      _pdfFooter()+_pdfClose();
    openPrintWindow(html);
    setSav('✅ تم فتح التقرير','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  REPORTS SCREEN
// ══════════════════════════════════════════
let repTab='proj', _repFilterData=null, _repAdvData=null, _curReport=null;

// ── REPORTS HUB ────────────────────────────────
