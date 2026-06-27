function showScreen(s){
// ██ UI NAVIGATION — SCREENS + SIDEBAR ════════════
  // Viewer مش يقدر يدخل على حاجة غير العهدة والملاحظات
  if(uRole==='viewer'&&s!=='adv'&&s!=='notes')return;
  curScreen=s;
  ['dash','daily','proj','projList','adv','admin','rep','search','approvals','timeline','archive','dues','notes','auditlog','daf3ati','owner'].forEach(x=>{
    const el=document.getElementById(x+'Screen');
    if(el)el.style.display=x===s?'block':'none';
  });
  if(s==='projList'){buildProjListScreen();}
  if(s==='owner'){loadOwnerScreen().catch(ex=>{console.error('ownerScreen error:',ex);notify('خطأ: '+ex.message,'err');});}
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
  // ── زرار التحديث — تم إزالته بعد تفعيل Realtime ──
  const existingRefresh=targetEl.querySelector('.pg-refresh-btn');
  if(existingRefresh)existingRefresh.remove();
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
  const isOpen=sb.classList.contains('sb-open');
  if(ov)ov.classList.toggle('show',isOpen);
  document.body.style.overflow=isOpen?'hidden':'';
}
function closeSidebar(){
  document.getElementById('sidebar').classList.remove('sb-open');
  const ov=document.getElementById('sbOverlay');
  if(ov)ov.classList.remove('show');
  document.body.style.overflow='';
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
  grid.style.cssText='display:block;padding:10px 12px';
  const dk=document.body.classList.contains('dark-mode');

  const sorted=[...projects].sort((a,b)=>{
    const sa=projSummaries[a.id]||{bal:0};
    const sb_=projSummaries[b.id]||{bal:0};
    return (sa.bal||0)-(sb_.bal||0);
  });

  const totI=sorted.reduce((s,p)=>{const ps=projSummaries[p.id]||{};return s+(ps.inc||0);},0);
  const totE=sorted.reduce((s,p)=>{const ps=projSummaries[p.id]||{};return s+(ps.exp||0);},0);
  const totB=totI-totE;

  function getStatus(pI,pE,pB){
    if(pI===0&&pE===0)return'zero';
    const pct=pI>0?pE/pI*100:pE>0?101:0;
    if(pct>100)return'danger';
    if(pct>75)return'warn';
    return'good';
  }

  function fnShort(n){
    if(n>=1000000)return(n/1000000).toFixed(1)+'M';
    if(n>=1000)return(n/1000).toFixed(0)+'K';
    return Number(n||0).toLocaleString('en-US');
  }

  // ألوان حسب الوضع
  const C={
    danger:  dk?'#e87070':'#C0392B',
    dangerBg:dk?'rgba(232,112,112,.1)':'rgba(192,57,43,.06)',
    warn:    dk?'#d4a84c':'#A06B00',
    warnBg:  dk?'rgba(212,170,76,.1)':'rgba(160,107,0,.06)',
    good:    dk?'#4eca8b':'#1A7A4A',
    goodBg:  dk?'rgba(78,202,139,.08)':'rgba(26,122,74,.05)',
    zero:    dk?'rgba(212,196,154,.2)':'#E8E4DE',
    zeroBg:  'transparent',
    border:  dk?'rgba(212,196,154,.1)':'#EDEAE4',
    card:    dk?'rgba(255,255,255,.04)':'#FFFFFF',
    text:    dk?'#D4C49A':'#1C2B1E',
    muted:   dk?'rgba(212,196,154,.4)':'#8A9490',
    inc:     dk?'#4eca8b':'#1A7A4A',
    exp:     dk?'#e87070':'#B83232',
  };

  function projCard(p){
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0};
    const pI=s.inc||0,pE=s.exp||0,pB=(s.bal!==undefined?s.bal:pI-pE);
    const st=getStatus(pI,pE,pB);
    const pct=pI>0?Math.min(100,Math.round(pE/pI*100)):pE>0?100:0;
    const stColor=C[st];
    const stBg=C[st+'Bg'];
    const balClr=pB>0?C.good:pB<0?C.danger:C.muted;
    const leftBar=`border-right:3.5px solid ${stColor}`;
    const badgeMap={danger:'⚠️ عجز',warn:'🟡 '+pct+'%',good:'✅ '+pct+'%',zero:'—'};

    return `<div onclick="goToProject('${p.id}')" style="background:${C.card};border:1px solid ${C.border};${leftBar};border-radius:14px;margin-bottom:9px;overflow:hidden;cursor:pointer;transition:box-shadow .15s" onmouseenter="this.style.boxShadow='0 3px 12px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow='none'">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px 6px">
        <div style="font-size:13px;font-weight:700;color:${C.text}">${esc(p.name)}</div>
        <div style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;background:${stBg};color:${stColor}">${badgeMap[st]}</div>
      </div>
      <div style="padding:6px 14px 4px">
        <div style="height:5px;background:${dk?'rgba(255,255,255,.07)':'#F0EDE8'};border-radius:5px;overflow:hidden">
          <div style="width:${pct}%;height:100%;border-radius:5px;background:${stColor};opacity:.85"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:${C.muted};margin-top:3px">
          <span>0%</span><span style="font-weight:700;color:${stColor}">${pct}% صرف</span><span>100%</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;padding:8px 14px 12px;border-top:1px solid ${C.border};margin-top:6px;gap:4px">
        <div style="text-align:center">
          <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.4px;margin-bottom:3px">الوارد</div>
          <div style="font-size:12px;font-weight:700;color:${pI?C.inc:C.muted}">${pI?'▲ '+fnShort(pI):'—'}</div>
        </div>
        <div style="text-align:center;border-right:1px solid ${C.border};border-left:1px solid ${C.border}">
          <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.4px;margin-bottom:3px">المصروف</div>
          <div style="font-size:12px;font-weight:700;color:${pE?C.exp:C.muted}">${pE?'▼ '+fnShort(pE):'—'}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.4px;margin-bottom:3px">الرصيد</div>
          <div style="font-size:12px;font-weight:700;color:${balClr}">${pB===0?'—':(pB>0?'+ ':'')+fnShort(Math.abs(pB))}</div>
        </div>
      </div>
    </div>`;
  }

  // تجميع بالحالة
  const groups={danger:[],warn:[],good:[],zero:[]};
  sorted.forEach(p=>{
    const s=projSummaries[p.id]||{inc:0,exp:0};
    const st=getStatus(s.inc||0,s.exp||0,(s.bal!==undefined?s.bal:(s.inc||0)-(s.exp||0)));
    groups[st].push(p);
  });

  const sectionLbl=(lbl,n)=>`<div style="font-size:10px;font-weight:700;color:${C.muted};letter-spacing:1px;padding:12px 0 7px;display:flex;align-items:center;gap:8px">${lbl} <span style="opacity:.5">(${n})</span><div style="flex:1;height:1px;background:${C.border}"></div></div>`;

  let html='';

  // إجمالي في الأعلى
  const totBClr=totB>=0?C.good:C.danger;
  html+=`<div style="background:${C.card};border:1px solid ${C.border};border-radius:14px;padding:14px;margin-bottom:14px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
      <div style="text-align:center">
        <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.5px;margin-bottom:4px">إجمالي الوارد</div>
        <div style="font-size:14px;font-weight:800;color:${C.inc}">▲ ${fnShort(totI)}</div>
      </div>
      <div style="text-align:center;border-right:1px solid ${C.border};border-left:1px solid ${C.border}">
        <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.5px;margin-bottom:4px">إجمالي المصروف</div>
        <div style="font-size:14px;font-weight:800;color:${C.exp}">▼ ${fnShort(totE)}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:9px;color:${C.muted};font-weight:600;letter-spacing:.5px;margin-bottom:4px">صافي الرصيد</div>
        <div style="font-size:14px;font-weight:800;color:${totBClr}">${totB>=0?'+ ':''} ${fnShort(Math.abs(totB))}</div>
      </div>
    </div>
  </div>`;

  const _f=typeof _curProjFilter!=='undefined'?_curProjFilter:'all';
  const showDanger=_f==='all'||_f==='danger';
  const showWarn=_f==='all'||_f==='warn';
  const showGood=_f==='all'||_f==='good';
  const showZero=_f==='all'||_f==='zero';
  if(showDanger&&groups.danger.length){html+=sectionLbl('⚠️ تحتاج متابعة',groups.danger.length);html+=groups.danger.map(projCard).join('');}
  if(showWarn&&groups.warn.length){html+=sectionLbl('🟡 تحذير',groups.warn.length);html+=groups.warn.map(projCard).join('');}
  if(showGood&&groups.good.length){html+=sectionLbl('✅ طبيعي',groups.good.length);html+=groups.good.map(projCard).join('');}
  if(showZero&&groups.zero.length){html+=sectionLbl('— بدون حركة',groups.zero.length);html+=groups.zero.map(projCard).join('');}
  if(!html)html='<div style="text-align:center;padding:40px;color:var(--text-soft,#888);font-size:13px">لا توجد مشاريع في هذا التصنيف</div>';

  grid.innerHTML=html;
}
let _curProjFilter='all';

function setProjFilter(f, btn){
  _curProjFilter=f;
  document.querySelectorAll('.pfbtn').forEach(b=>{
    b.style.background='var(--card)';
    b.style.color='var(--text-soft,#888)';
    b.style.borderColor='var(--border)';
  });
  if(btn){
    btn.style.background='var(--accent,#1D3C2A)';
    btn.style.color='#D4C49A';
    btn.style.borderColor='var(--accent,#1D3C2A)';
  }
  buildProjListScreen();
  const q=document.getElementById('projSearchInput')?.value||'';
  if(q)filterProjCards(q);
}

function filterProjCards(q){
  const term=q.trim().toLowerCase();
  // table structure: filter tbody rows
  const rows=document.querySelectorAll('#projCardsGrid tbody tr');
  if(rows.length){
    rows.forEach(row=>{
      const name=row.querySelector('td')?.textContent?.toLowerCase()||'';
      row.style.display=(!term||name.includes(term))?'':'none';
    });
    return;
  }
  // fallback: old card structure
  const cards=document.querySelectorAll('#projCardsGrid > div');
  cards.forEach(card=>{
    const name=card.querySelector('div')?.textContent?.toLowerCase()||'';
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