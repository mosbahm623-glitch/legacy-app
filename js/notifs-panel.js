function notifFmtTime(iso){
  const d=new Date(iso);const now=new Date();
  const diff=Math.floor((now-d)/1000);
  if(diff<60)return 'الآن';
  if(diff<3600)return Math.floor(diff/60)+' د';
  if(diff<86400)return Math.floor(diff/3600)+' س';
  return d.toLocaleDateString('ar-EG',{day:'numeric',month:'short'});
}

function pushNotif({type,title,sub,icon,ts,pid,eid}){
  const n={id:Date.now()+'_'+Math.random().toString(36).slice(2),type,title,sub,icon:icon||NOTIF_ICONS[type]||'🔔',ts:ts||new Date().toISOString(),read:false,pid:pid||null,eid:eid||null};
  notifList.unshift(n);
  if(notifList.length>80)notifList=notifList.slice(0,80);
  if(!notifPanelOpen){
    notifUnread++;
    updateNotifBadge();
    showToast(n);
  }
  if(notifPanelOpen&&npCurrentTab==='notifs')renderNpNotifs();
}

function updateNotifBadge(){
  const badge=document.getElementById('notifBadge');
  const bell=document.getElementById('notifBellBtn');
  if(!badge||!bell)return;
  if(notifUnread>0){
    badge.style.display='flex';
    badge.textContent=notifUnread>99?'99+':notifUnread;
    bell.style.animation='none';
    setTimeout(()=>bell.style.animation='',10);
  }else{
    badge.style.display='none';
  }
}

function showToast(n){
  const wrap=document.getElementById('notifToastWrap');
  if(!wrap)return;
  const dur=6000;
  const el=document.createElement('div');
  el.className='ntoast '+(NOTIF_TYPES[n.type]||'nt-entry');
  el.style.setProperty('--dur',dur/1000+'s');
  el.innerHTML=`<div class="ntoast-icon">${n.icon}</div><div class="ntoast-body"><div class="ntoast-title">${n.title}</div>${n.sub?`<div class="ntoast-sub">${n.sub}</div>`:''}${n.ts?`<div class="ntoast-time">${notifFmtTime(n.ts)}</div>`:''}</div><div class="ntoast-bar"></div>`;
  el.onclick=()=>{
    dismissToast(el);
    if(n.pid)goToEntry(n.pid,n.eid);
  };
  wrap.prepend(el);
  // limit toasts on screen
  const toasts=wrap.querySelectorAll('.ntoast');
  if(toasts.length>4)toasts[toasts.length-1].remove();
  setTimeout(()=>dismissToast(el),dur);
}

function dismissToast(el){
  if(!el||!el.parentNode)return;
  el.style.animation='toast-out .35s cubic-bezier(.4,0,.2,1) forwards';
  setTimeout(()=>el.remove(),350);
}

function openNotifPanel(tab){
  tab=tab||'notifs';
  npCurrentTab=tab;
  notifPanelOpen=true;
  notifUnread=0;
  updateNotifBadge();
  document.getElementById('notifPanel').classList.add('open');
  document.getElementById('notifOverlay').classList.add('open');
  switchNpTab(tab,true);
  refreshOnlineUsers();
}

function closeNotifPanel(){
  notifPanelOpen=false;
  document.getElementById('notifPanel').classList.remove('open');
  document.getElementById('notifOverlay').classList.remove('open');
}

function switchNpTab(tab,force){
  if(npCurrentTab===tab&&!force)return;
  npCurrentTab=tab;
  ['notifs','online'].forEach(t=>{
    const btn=document.getElementById('npTab-'+t);
    if(btn)btn.className='np-tab'+(t===tab?' active':'');
  });
  if(tab==='notifs')renderNpNotifs();
  else renderNpOnline();
}

// الانتقال المباشر للقيد من الإشعار
function goToEntry(pid,eid){
  closeNotifPanel();
  if(!pid)return;
  showScreen('proj');
  setTimeout(async()=>{
    document.getElementById('ps').value=pid;
    await sw(pid);
    // بعد ما القيود تتحمل، نلاقي القيد ونوصّله
    if(!eid)return;
    setTimeout(()=>{
      const rows=document.querySelectorAll('#ent .rw');
      rows.forEach(row=>{
        if(row.dataset.eid===eid){
          row.scrollIntoView({behavior:'smooth',block:'center'});
          row.style.transition='background .3s';
          row.style.background='rgba(212,196,154,.2)';
          setTimeout(()=>row.style.background='',2000);
        }
      });
    },600);
  },150);
}

function renderNpNotifs(){
  const body=document.getElementById('npBody');
  if(!body)return;
  if(!notifList.length){body.innerHTML='<div class="np-empty">🔔<br>لا توجد إشعارات</div>';return;}

  // Group by time
  const now=Date.now();
  const today=[],yesterday=[],older=[];
  notifList.forEach(n=>{
    const age=now-n.ts;
    if(age<86400000)today.push(n);
    else if(age<172800000)yesterday.push(n);
    else older.push(n);
  });

  const unreadCount=notifList.filter(n=>!n.read).length;
  const renderGroup=(label,items)=>items.length?`
    <div class="np-group-lbl">${label}</div>
    ${items.map(n=>`<div class="ni${!n.read?' unread':''}" ${n.pid?`onclick="goToEntry('${n.pid}','${n.eid||''}')"`:''}>
      <div class="ni-icon-wrap ${!n.read?'unread':''}">${n.icon}</div>
      <div class="ni-body">
        <div class="ni-title">${n.title}</div>
        ${n.sub?`<div class="ni-sub">${n.sub}</div>`:''}
        <div class="ni-time">${notifFmtTime(n.ts)}${n.pid?' · اضغط للانتقال':''}</div>
      </div>
    </div>`).join('')}`:'';

  body.innerHTML=`
    <div class="np-actions">
      ${unreadCount?`<button class="np-mark-read" onclick="markAllNotifsRead()">✓ تحديد الكل كمقروء (${unreadCount})</button>`:''}
      <button class="np-clear" onclick="clearAllNotifs()">🗑 مسح</button>
    </div>
    ${renderGroup('اليوم',today)}
    ${renderGroup('أمس',yesterday)}
    ${renderGroup('أقدم',older)}`;

  notifList.forEach(n=>n.read=true);
}

function markAllNotifsRead(){
  notifList.forEach(n=>n.read=true);
  renderNpNotifs();
  updateNotifBadge();
}

function renderNpOnline(){
  const body=document.getElementById('npBody');
  if(!body)return;
  if(!onlineUsersData.length){
    body.innerHTML='<div class="np-empty">👥<br>جاري تحميل المستخدمين...</div>';
    refreshOnlineUsers();
    return;
  }
  const sorted=[...onlineUsersData].sort((a,b)=>(b.is_online?1:0)-(a.is_online?1:0));
  body.innerHTML=sorted.map(u=>{
    const initials=(u.name||'?').charAt(0).toUpperCase();
    const lastSeenTxt=u.is_online?'<span style="color:var(--success-soft);font-size:10px">● متصل الآن</span>':(u.last_seen?`آخر ظهور: ${notifFmtTime(u.last_seen)}`:'لم يتصل بعد');
    return `<div class="ou-card">
      <div class="ou-avatar">${initials}<span class="ou-status ${u.is_online?'on':'off'}"></span></div>
      <div style="flex:1;min-width:0">
        <div class="ou-name">${u.name||'—'}${u.id===uid?' <span class="online-you-label">(أنت)</span>':''}</div>
        <div class="ou-role">${ROLE_LABELS[u.role]||u.role||''}</div>
        <div class="ou-lastseen">${lastSeenTxt}</div>
      </div>
    </div>`;
  }).join('');
  const onlineCount=onlineUsersData.filter(u=>u.is_online).length;
  const npInfo=document.getElementById('npOnlineInfo');
  if(npInfo)npInfo.textContent=onlineCount+' متصل الآن من '+onlineUsersData.length+' مستخدم';
}

function clearAllNotifs(){
  notifList=[];
  notifUnread=0;
  updateNotifBadge();
  renderNpNotifs();
}

async function refreshOnlineUsers(){
  try{
    const[profiles,presence]=await Promise.all([
      sb('profiles?order=name'),
      sb('user_presence')
    ]);
    const presMap={};
    (presence||[]).forEach(p=>{
      const isOnline=p.is_online&&(Date.now()-new Date(p.last_seen).getTime())<120000;
      presMap[p.user_id]={is_online:isOnline,last_seen:p.last_seen};
    });
    onlineUsersData=(profiles||[]).map(p=>({
      id:p.id,name:p.name,role:p.role,
      is_online:presMap[p.id]?.is_online||false,
      last_seen:presMap[p.id]?.last_seen||null
    }));
    // update notifUserMap
    (profiles||[]).forEach(p=>{notifUserMap[p.id]={name:p.name,role:p.role};});
    // update online pill
    const cnt=onlineUsersData.filter(u=>u.is_online).length;
    const pill=document.getElementById('onlinePill');
    const cntEl=document.getElementById('onlineCount');
    if(pill&&cnt>0){pill.style.display='flex';if(cntEl)cntEl.textContent=cnt;}
    else if(pill){pill.style.display='none';}
    if(notifPanelOpen&&npCurrentTab==='online')renderNpOnline();
  }catch(e){console.warn('refreshOnlineUsers:',e);} // صامت متعمد
}

async function getUserName(userId){
  if(!userId)return 'مستخدم';
  if(notifUserMap[userId])return notifUserMap[userId].name||'مستخدم';
  // لو مش موجود في الـ map، اجيب البيانات
  try{await refreshOnlineUsers();}catch(e){console.warn('getUserName:',e);} // صامت متعمد
  return notifUserMap[userId]?.name||'مستخدم';
}

async function updatePresence(){
  // stub — presence system removed with chat
  try{
    if(!window._sbc||!uid)return;
    await _sbc.from('user_presence').upsert({user_id:uid,is_online:true,last_seen:new Date().toISOString()},{onConflict:'user_id'});
  }catch(e){console.warn('updatePresence:',e);} // صامت متعمد
}

function initNotifSystem(){
  // show bell
  const bell=document.getElementById('notifBellBtn');
  if(bell)bell.style.display='block';
  // سجّل الحضور فوراً (مش بس لما يفتح الرسائل)
  updatePresence().then(()=>refreshOnlineUsers());
  // setup realtime listeners for pending notifications
  setupNotifRealtime();
  // refresh online every 45s
  setInterval(()=>{updatePresence().then(()=>refreshOnlineUsers());},45000);
}

function setupNotifRealtime(){
  if(!window._sbc)return;
  if(_rtNotifCh){_sbc.removeChannel(_rtNotifCh);_rtNotifCh=null;}
  if(_rtPendNotifCh){_sbc.removeChannel(_rtPendNotifCh);_rtPendNotifCh=null;}

  _rtPendNotifCh=_sbc.channel('notif-pending')
    .on('postgres_changes',{event:'*',schema:'public',table:'pending_entries'},
      async(payload)=>{
        window._rtOk=true;
        updatePendingBadge();
        if(curScreen==='approvals')loadApprovals(true);
        if(curScreen==='dash')loadDashboard();
        if(uRole==='admin'&&payload.eventType==='INSERT'){
          const r=payload.new;
          if(r.submitted_by===uid)return;
          const who=await getUserName(r.submitted_by);
          const projName=allProjectsMap[r.project_id]?.name||'مشروع';
          pushNotif({type:'pending_entry',title:`${who} طلب موافقة على قيد`,sub:`${fn(r.amount)} ج · ${projName}${r.category?' · '+r.category:''}`});
        }
      }
    )
    .on('postgres_changes',{event:'*',schema:'public',table:'pending_advances'},
      async(payload)=>{
        window._rtOk=true;
        updatePendingBadge();
        if(curScreen==='approvals')loadApprovals(true);
        if(curScreen==='dash')loadDashboard();
        if(uRole==='admin'&&payload.eventType==='INSERT'){
          const r=payload.new;
          if(r.submitted_by===uid)return;
          const who=await getUserName(r.submitted_by);
          const label=r.type==='advance'?'عهدة جديدة':'دفعة';
          pushNotif({type:'pending_adv',title:`${who} طلب موافقة — ${label}`,sub:r.person_name?`${r.person_name}`:r.amount?`${fn(r.amount)} ج`:''});
        }
      }
    )
    .subscribe((status)=>{});
}

