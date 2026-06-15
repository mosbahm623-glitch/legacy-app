// ══ Online / Offline Status ══
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
  }catch(e){console.error(e);}
}

function showScreen(s){
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
      sel.innerHTML='<option value="">كل المشاريع</option>'+allProjects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
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
async function backupAll(){
  const btn=document.getElementById('sbi-backup');
  if(btn)btn.disabled=true;
  setSav('⏳ جاري تحميل المكتبة...','ng');
  try{
    // تحميل ExcelJS لو مش محملة
    if(!xOK){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';
        s.onload=()=>{xOK=true;res();};s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    setSav('⏳ جاري جلب البيانات...','ng');
    // جيب كل البيانات
    const [prjs,ents,advs,insts,profs]=await Promise.all([
      sb('projects?order=created_at'),
      sbAll('entries?order=created_at'),
      sb('advances?order=created_at'),
      sb('advance_installments?order=created_at'),
      sb('profiles?order=created_at')
    ]);
    setSav('⏳ جاري بناء الملف...','ng');
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    wb.creator='Legacy Fine Touch';
    wb.created=new Date();
    const G='var(--primary)',B='var(--accent)';
    function hdr(ws,cols){
      ws.addRow(cols.map(c=>c.h));
      const r=ws.lastRow;
      r.eachCell(cell=>{
        cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+G.slice(1)}};
        cell.font={bold:true,color:{argb:'FF'+B.slice(1)},size:11};
        cell.alignment={horizontal:'center',vertical:'middle'};
        cell.border={bottom:{style:'thin',color:{argb:'FFCCCCCC'}}};
      });
      ws.columns=cols.map(c=>({key:c.k,width:c.w||18}));
    }
    function styleRows(ws,count){
      for(let i=2;i<=count+1;i++){
        const r=ws.getRow(i);
        r.eachCell(cell=>{
          cell.alignment={horizontal:'right',vertical:'middle',wrapText:true};
          cell.border={bottom:{style:'hair',color:{argb:'FFEEEEEE'}}};
        });
        if(i%2===0)r.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF9F6F0'}};});
      }
    }
    // شيت المشاريع
    const wsP=wb.addWorksheet('المشاريع',{views:[{rightToLeft:true}]});
    hdr(wsP,[{h:'الاسم',k:'name',w:25},{h:'تاريخ البداية',k:'sd',w:18},{h:'تاريخ الإغلاق',k:'cd',w:18},{h:'ID',k:'id',w:38}]);
    prjs.forEach(p=>wsP.addRow({name:p.name,sd:p.start_date||'',cd:p.close_date||'',id:p.id}));
    styleRows(wsP,prjs.length);
    // شيت القيود
    const wsE=wb.addWorksheet('القيود',{views:[{rightToLeft:true}]});
    hdr(wsE,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'المقاول',k:'mq',w:20},{h:'رقم',k:'seq',w:8}]);
    const projMap={};prjs.forEach(p=>projMap[p.id]=p.name);
    ents.forEach(e=>wsE.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',mq:e.contractor||'',seq:e.seq||''}));
    styleRows(wsE,ents.length);
    // لون الوارد والمصروف
    for(let i=2;i<=ents.length+1;i++){
      const cell=wsE.getRow(i).getCell(2);
      const isInc=cell.value==='وارد';
      cell.font={bold:true,color:{argb:isInc?'FF1E6B3A':'FF922B21'}};
      wsE.getRow(i).getCell(3).font={bold:true,color:{argb:isInc?'FF1E6B3A':'FF922B21'}};
    }
    // شيت العهد
    const wsA=wb.addWorksheet('العهد',{views:[{rightToLeft:true}]});
    hdr(wsA,[{h:'الاسم',k:'name',w:22},{h:'الحالة',k:'status',w:12},{h:'ملاحظات',k:'notes',w:30},{h:'ID',k:'id',w:38}]);
    advs.forEach(a=>wsA.addRow({name:a.person_name||'',status:a.status==='open'?'مفتوحة':'مغلقة',notes:a.notes||'',id:a.id}));
    styleRows(wsA,advs.length);
    // شيت دفعات العهد
    const wsI=wb.addWorksheet('دفعات العهد',{views:[{rightToLeft:true}]});
    hdr(wsI,[{h:'صاحب العهدة',k:'name',w:22},{h:'المبلغ',k:'amt',w:15},{h:'التاريخ',k:'dt',w:15},{h:'ملاحظة',k:'note',w:25}]);
    const advMap={};advs.forEach(a=>advMap[a.id]=a.person_name||'');
    insts.forEach(i=>wsI.addRow({name:advMap[i.advance_id]||'',amt:i.amount,dt:i.inst_date||'',note:i.note||''}));
    styleRows(wsI,insts.length);
    // شيت المستخدمين
    const wsU=wb.addWorksheet('المستخدمين',{views:[{rightToLeft:true}]});
    hdr(wsU,[{h:'الاسم',k:'name',w:22},{h:'الدور',k:'role',w:15},{h:'ID',k:'id',w:38}]);
    profs.forEach(u=>wsU.addRow({name:u.name||'',role:u.role||'',id:u.id}));
    styleRows(wsU,profs.length);
    // تحميل الملف
    const buf=await wb.xlsx.writeBuffer();
    const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const now=new Date();
    const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    a.href=url;a.download='LFT_Backup_'+dateStr+'.xlsx';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    localStorage.setItem('lft_last_backup', new Date().toISOString());
    updateBackupDateDisplay();
    setSav('✅ تم تحميل النسخة الاحتياطية — '+prjs.length+' مشروع · '+ents.length+' قيد · '+advs.length+' عهدة','ok');
    msg.style.color='var(--primary-btn)';
  }catch(e){
    setSav('❌ '+friendlyError(e),'er');
    msg.style.color='var(--danger)';
  }
  btn.disabled=false;
}

// EXPORT ALL PROJECTS
async function exportAllProjects(){
  const btn=document.getElementById('sbi-save-proj');
  if(btn){btn.disabled=true;}
  setSav('⏳ جاري التحضير...','ng');
  try{
    if(!xOK){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';
        s.onload=()=>{xOK=true;res();};s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    const savedPid=curPid;
    const total=allProjects.length;
    for(let i=0;i<total;i++){
      const p=allProjects[i];
      setSav('⏳ جاري تصدير ('+(i+1)+'/'+total+'): '+p.name,'ng');
      curPid=p.id;
      entries=allEntries.filter(e=>e.project_id===curPid);
      await bld();
      await new Promise(r=>setTimeout(r,600));
    }
    curPid=savedPid;
    entries=allEntries.filter(e=>e.project_id===curPid);
    setSav('✅ تم تصدير '+total+' مشروع بنجاح','ok');
  }catch(e){
    setSav('❌ '+friendlyError(e),'er');
  }
  if(btn){btn.disabled=false;}
}

