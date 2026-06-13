/* ═══════════════════════════════════════
   COLORS — مرجع الألوان للتعديل المستقبلي
═══════════════════════════════════════ */
const COLORS = {
  'accent': 'var(--accent)',
  'accent-gold': 'var(--accent-gold)',
  'bg-faint': 'var(--bg-faint)',
  'bg-gray': 'var(--bg-gray)',
  'bg-latte': 'var(--bg-latte)',
  'bg-light': 'var(--bg-light)',
  'bg-linen': 'var(--bg-linen)',
  'bg-pure': 'var(--bg-pure)',
  'bg-warm2': 'var(--bg-warm2)',
  'border': 'var(--border)',
  'border-faint': 'var(--border-faint)',
  'border-ghost': 'var(--border-ghost)',
  'border-light': 'var(--border-light)',
  'border-mid': 'var(--border-mid)',
  'border-warm': 'var(--border-warm)',
  'danger': 'var(--danger)',
  'danger-alt': 'var(--danger-alt)',
  'danger-blush': 'var(--danger-blush)',
  'danger-ghost': 'var(--danger-ghost)',
  'danger-pale': 'var(--danger-pale)',
  'danger-peach': 'var(--danger-peach)',
  'danger-soft': 'var(--danger-soft)',
  'danger-tint': 'var(--danger-tint)',
  'danger-warm': 'var(--danger-warm)',
  'dark-emerald': 'var(--dark-emerald)',
  'info': 'var(--info)',
  'info-bg': 'var(--info-bg)',
  'info-muted': 'var(--info-muted)',
  'info-sky': 'var(--info-sky)',
  'info-soft': 'var(--info-soft)',
  'primary': 'var(--primary)',
  'primary-btn': 'var(--primary-btn)',
  'primary-mid': 'var(--primary-mid)',
  'purple-soft': 'var(--purple-soft)',
  'success': 'var(--success)',
  'success-ghost': 'var(--success-ghost)',
  'success-glow': 'var(--success-glow)',
  'success-muted': 'var(--success-muted)',
  'success-pale': 'var(--success-pale)',
  'success-soft': 'var(--success-soft)',
  'text-body': 'var(--text-body)',
  'text-dark': 'var(--text-dark)',
  'text-faint': 'var(--text-faint)',
  'text-hint': 'var(--text-hint)',
  'text-mid': 'var(--text-mid)',
  'text-muted': 'var(--text-muted)',
  'text-pale': 'var(--text-pale)',
  'text-soft': 'var(--text-soft)',
  'warning': 'var(--warning)',
  'warning-alt': 'var(--warning-alt)',
  'warning-bg': 'var(--warning-bg)',
  'warning-cream': 'var(--warning-cream)',
  'warning-dark': 'var(--warning-dark)',
  'warning-faint': 'var(--warning-faint)',
  'warning-ghost': 'var(--warning-ghost)',
  'warning-muted': 'var(--warning-muted)',
  'warning-pale': 'var(--warning-pale)',
  'warning-text': 'var(--warning-text)',
  'warning-tint': 'var(--warning-tint)',
};

// ══════ GLOBAL ERROR HANDLER ══════
window.addEventListener('unhandledrejection',function(e){
  console.error('Unhandled error:',e.reason);
  try{notify('❌ حدث خطأ غير متوقع — حاول تاني','err');}catch(_){}
});

const SB='https://ctcoqgluaytwelnutrox.supabase.co';
const AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
let token=null,uid=null,uRole=null,uName='',uEmail='';
let projects=[],entries=[],allProjects=[],allEntries=[],advances=[],allInstallments=[],curPid=null,curAdv=null;
let allProjectsMap={};
let cT='e',cTab='s',edId=null,edType=null,imType='e',xOK=false,curScreen='proj';
let allChatUsers=[];
let _rtEntCh=null,_rtAdvCh=null;

async function sb(path,method,body){
  const h={'apikey':AK,'Authorization':'Bearer '+(token||AK),'Content-Type':'application/json'};
  if(method==='POST'||method==='PATCH')h['Prefer']='return=representation';
  const r=await fetch(SB+'/rest/v1/'+path,{method:method||'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  if(!r.ok)throw new Error(await r.text());
  if(r.status===204)return null;
  return r.json();
}
// يجيب كل الصفوف على دفعات 1000 — يتخطى حد Supabase الافتراضي
async function sbAll(path){
  const all=[];let from=0;const step=1000;
  while(true){
    const h={'apikey':AK,'Authorization':'Bearer '+(token||AK),'Content-Type':'application/json','Range':from+'-'+(from+step-1)};
    const r=await fetch(SB+'/rest/v1/'+path,{headers:h,cache:'no-store'});
    if(!r.ok)throw new Error(await r.text());
    const chunk=await r.json();
    all.push(...chunk);
    if(chunk.length<step)break;
    from+=step;
  }
  return all;
}
async function sbAuth(path,method,body){
  const h={'apikey':AK,'Authorization':'Bearer '+(token||AK),'Content-Type':'application/json'};
  const r=await fetch(SB+'/auth/v1/'+path,{method:method||'GET',headers:h,body:body?JSON.stringify(body):undefined});
  if(!r.ok){const e=await r.json();throw new Error(e.error_description||e.message||'خطأ');}
  return r.json();
}
function setSav(m,c){
  const el=document.getElementById('sav');
  if(!el)return;
  el.className='sav '+c;
  const msg=el.querySelector('.sav-msg');
  const dot=el.querySelector('.sav-dot');
  if(msg){msg.textContent=m;}else{el.textContent=m;}
  if(dot){dot.style.background=c==='ok'?'#1D9E75':c==='er'?'var(--danger)':'var(--warning)';}
}
function setLS(m,c){const el=document.getElementById('lst');el.textContent=m;el.className='lst '+c;}
function fn(n){return Number(n||0).toLocaleString('en-US');}
function uid_(){return Date.now()+'-'+Math.random().toString(36).substr(2,5);}
function ts(){const d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();}
function fd(d){if(!d)return'';if(d.includes('/'))return d;const p=d.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:d;}

// ===== DATE PICKER =====
(function(){
  const MONTHS_AR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  // RTL: السبت أول عمود على اليمين ← الجمعة آخر عمود على اليسار
  // ترتيب getDay(): 0=أح، 1=إث، 2=ث، 3=أر، 4=خ، 5=ج، 6=س
  // في RTL grid: العمود 1(يمين)=س(6)، 2=ج(5)، 3=خ(4)، 4=أر(3)، 5=ث(2)، 6=إث(1)، 7(يسار)=أح(0)
  const DAYS_AR=['س','ج','خ','أر','ث','إث','أح']; // من اليمين لليسار
  let dp=null,dpTarget=null,dpY=0,dpM=0;

  function createPicker(){
    const d=document.createElement('div');
    d.id='dp-popup';
    d.style.cssText='position:fixed;z-index:99999;background:var(--bg-pure);border:1.5px solid #d0d0d0;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.25);padding:14px;width:280px;font-family:inherit;direction:rtl;display:none;';
    // dark mode
    const _dpApplyTheme=()=>{
      const dark=document.body.classList.contains('dark-mode');
      d.style.background=dark?'var(--dark-card)':'var(--bg-pure)';
      d.style.borderColor=dark?'rgba(212,196,154,.3)':'var(--border-light)';
      d.style.color=dark?'var(--accent)':'var(--text-dark)';
      const label=d.querySelector('#dp-label');
      if(label)label.style.color=dark?'var(--accent)':'var(--text-dark)';
      const prev=d.querySelector('#dp-prev');
      if(prev)prev.style.color=dark?'rgba(212,196,154,.7)':'var(--text-body)';
      const next=d.querySelector('#dp-next');
      if(next)next.style.color=dark?'rgba(212,196,154,.7)':'var(--text-body)';
      d.querySelectorAll('#dp-hdr div').forEach(c=>{c.style.color=dark?'rgba(212,196,154,.5)':'var(--text-soft)';});
    };
    _dpApplyTheme();
    const _dpObs=new MutationObserver(_dpApplyTheme);
    _dpObs.observe(document.body,{attributes:true,attributeFilter:['class']});
    d.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><button id="dp-prev" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-body);padding:2px 8px;line-height:1">&#8250;</button><span id="dp-label" style="font-weight:700;color:inherit;font-size:14px"></span><button id="dp-next" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--text-body);padding:2px 8px;line-height:1">&#8249;</button></div><div id="dp-hdr" style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px"></div><div id="dp-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px"></div><div style="margin-top:10px;display:flex;justify-content:center"><button id="dp-today" style="background:var(--primary);color:var(--bg-pure);border:none;border-radius:8px;padding:6px 22px;cursor:pointer;font-size:12px;font-family:inherit">اليوم</button></div>`;
    document.body.appendChild(d);
    DAYS_AR.forEach(day=>{
      const c=document.createElement('div');
      c.style.cssText='text-align:center;font-size:10px;color:var(--text-soft);font-weight:700;padding:3px 0';
      c.textContent=day;
      d.querySelector('#dp-hdr').appendChild(c);
    });
    d.querySelector('#dp-prev').onclick=e=>{e.stopPropagation();dpM--;if(dpM<0){dpM=11;dpY--;}renderDP();};
    d.querySelector('#dp-next').onclick=e=>{e.stopPropagation();dpM++;if(dpM>11){dpM=0;dpY++;}renderDP();};
    d.querySelector('#dp-today').onclick=e=>{e.stopPropagation();const n=new Date();dpY=n.getFullYear();dpM=n.getMonth();renderDP();pickDay(n.getDate());};
    return d;
  }

  function renderDP(){
    dp.querySelector('#dp-label').textContent=MONTHS_AR[dpM]+' '+dpY;
    const grid=dp.querySelector('#dp-grid');grid.innerHTML='';
    // getDay(): 0=أح،1=إث،2=ث،3=أر،4=خ،5=ج،6=س
    // في RTL grid عمود 1=س(6)،2=ج(5)،3=خ(4)،4=أر(3)،5=ث(2)،6=إث(1)،7=أح(0)
    // offset = (6 - first + 1) % 7  لكن نعكسه: عدد الخلايا الفارغة قبل اليوم الأول
    const first=new Date(dpY,dpM,1).getDay(); // 0-6
    // في RTL: اليوم s=6 في العمود 1 (offset=0)، ج=5 offset=1، ...، أح=0 offset=6
    const offset=(6-first+1)%7;
    for(let i=0;i<offset;i++){grid.appendChild(document.createElement('div'));}
    const days=new Date(dpY,dpM+1,0).getDate();
    const sel=dpTarget?dpTarget.value:'';let selD=0;
    if(sel){const p=sel.split('/');if(p.length===3&&+p[2]===dpY&&+p[1]-1===dpM)selD=+p[0];}
    const _dark=document.body.classList.contains('dark-mode');
    const today=new Date();
    for(let d2=1;d2<=days;d2++){
      const btn=document.createElement('button');
      const isToday=today.getDate()===d2&&today.getMonth()===dpM&&today.getFullYear()===dpY;
      const isSel=selD===d2;
      btn.textContent=d2;
      const _nc=_dark?'var(--accent)':'var(--text-dark)';
      const _nb=_dark?'transparent':'none';
      const _tb=_dark?'rgba(29,60,42,.6)':'var(--accent-ivory)';
      const _tc=_dark?'var(--accent-gold)':'var(--primary)';
      const _hb=_dark?'rgba(212,196,154,.1)':'var(--bg-page)';
      btn.style.cssText='border:none;cursor:pointer;border-radius:7px;padding:6px 2px;font-size:12px;font-family:inherit;width:100%;transition:background .1s;'+(isSel?'background:var(--primary);color:var(--bg-pure);font-weight:700;':(isToday?`background:${_tb};color:${_tc};font-weight:700;`:`background:${_nb};color:${_nc};`));
      btn.onmouseenter=function(){if(!isSel)this.style.background=_hb;};
      btn.onmouseleave=function(){if(!isSel)this.style.background=isToday?_tb:_nb;};
      btn.onclick=ev=>{ev.stopPropagation();pickDay(d2);};
      grid.appendChild(btn);
    }
  }

  function pickDay(d2){
    if(!dpTarget)return;
    dpTarget.value=String(d2).padStart(2,'0')+'/'+String(dpM+1).padStart(2,'0')+'/'+dpY;
    dpTarget.dispatchEvent(new Event('input',{bubbles:true}));
    dpTarget.dispatchEvent(new Event('change',{bubbles:true}));
    closeDP();
  }

  function openDP(el){
    if(!dp)dp=createPicker();
    dpTarget=el;
    const now=new Date();
    const val=el.value;
    if(val&&val.includes('/')){const p=val.split('/');if(p.length===3&&+p[2]>2000){dpY=+p[2];dpM=+p[1]-1;}}
    else{dpY=now.getFullYear();dpM=now.getMonth();}
    renderDP();
    // حساب الموضع مع تجنب الخروج من الشاشة
    dp.style.visibility='hidden';dp.style.display='block';
    const dpH=dp.offsetHeight||300;
    const dpW=dp.offsetWidth||280;
    dp.style.display='none';dp.style.visibility='';
    const rect=el.getBoundingClientRect();
    const spaceBelow=window.innerHeight-rect.bottom-8;
    const spaceAbove=rect.top-8;
    let top,left;
    // فوق أو تحت؟
    if(spaceBelow>=dpH||spaceBelow>=spaceAbove){
      top=rect.bottom+8;
    } else {
      top=rect.top-dpH-8;
    }
    // يمين أو يسار؟
    left=rect.right-dpW;
    if(left<8)left=8;
    if(left+dpW>window.innerWidth-8)left=window.innerWidth-dpW-8;
    // تأكد مش بيخرج من الأسفل
    if(top+dpH>window.innerHeight-8)top=window.innerHeight-dpH-8;
    if(top<8)top=8;
    dp.style.top=top+'px';
    dp.style.left=left+'px';
    dp.style.display='block';
    setTimeout(()=>document.addEventListener('click',outsideClick),0);
  }

  function closeDP(){if(dp)dp.style.display='none';document.removeEventListener('click',outsideClick);dpTarget=null;}
  function outsideClick(e){if(dp&&!dp.contains(e.target))closeDP();}

  window._openDP=openDP;
  window._closeDP=closeDP;
})();

function initDateInput(el){
  if(!el||el._dateInited)return;
  el._dateInited=true;
  el.readOnly=false;
  el.style.cursor='text';
  el.classList.add('dp-input');
  if(!el.placeholder)el.placeholder='dd/mm/yyyy';
  // فتح التقويم لما يضغط على أيقونة التقويم — أو double click
  el.addEventListener('dblclick',function(e){e.stopPropagation();window._openDP(this);});
  // تحقق من الـ format عند الخروج
  el.addEventListener('blur',function(){
    const v=this.value.trim();
    if(!v)return;
    // لو كتب بصيغة yyyy-mm-dd حولها
    if(/^\d{4}-\d{2}-\d{2}$/.test(v)){
      const [y,m,d]=v.split('-');
      this.value=`${d}/${m}/${y}`;
      return;
    }
    // تحقق من dd/mm/yyyy
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)){
      this.style.borderColor='var(--danger)';
      this.title='الصيغة الصحيحة: dd/mm/yyyy';
    }else{
      this.style.borderColor='';
      this.title='';
    }
  });
  // زرار التقويم بيفتح بالكليك العادي
  el.addEventListener('click',function(e){
    // لو ضغط في آخر 30px (منطقة أيقونة التقويم) — افتح التقويم
    const rect=this.getBoundingClientRect();
    if(e.clientX>=rect.left&&e.clientX<=rect.left+30){
      e.stopPropagation();window._openDP(this);
    }
  });
}
function initAllDateInputs(){
  ['idt','eDt','advInstDate','advEntDate','advEDt','advFDateFrom','advFDateTo',
   'rCashFrom','rCashTo','rSumFrom','rSumTo','rDateFrom','rDateTo',
   'rAdvDateFrom','rAdvDateTo','rContrFrom','rContrTo','rClientFrom','rClientTo','mqPayDt',
   'dst','dcl','dueDate'
  ].forEach(id=>{const el=document.getElementById(id);if(el)initDateInput(el);});
}
function pdt(s){return parseDt(s)||new Date(0);}
function pimd(s){
  if(!s)return'';s=s.trim();
  const M={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
  let m=s.match(/^(\d{1,2})[-\/\s]+([A-Za-z]{3,})\s*(\d{0,4})$/);
  if(m){const d=String(+m[1]).padStart(2,'0'),mo=M[m[2].toLowerCase().substr(0,3)];if(mo)return d+'/'+mo+'/'+(m[3]||new Date().getFullYear());}
  m=s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
  if(m)return String(+m[1]).padStart(2,'0')+'/'+String(+m[2]).padStart(2,'0')+'/'+(m[3].length===2?'20'+m[3]:m[3]);
  m=s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if(m)return String(+m[3]).padStart(2,'0')+'/'+String(+m[2]).padStart(2,'0')+'/'+m[1];
  return s;
}
function curP(){return projects.find(p=>p.id===curPid)||null;}
function pInc(){return entries.filter(e=>e.type==='i');}
function pExp(){return entries.filter(e=>e.type==='e');}
function pExpAdv(){return entries.filter(e=>e.type==='e'&&e.advance_id);}
function gJ(){const all=entries.map(e=>({...e}));all.sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date)||(a.entry_no||0)-(b.entry_no||0));let b=0;all.forEach(e=>{b+=e.type==='i'?e.amount:-e.amount;e.bal=b;});return all;}
function gM(){const map={};pExp().forEach(e=>{if(!e.contractor)return;if(!map[e.contractor])map[e.contractor]={n:e.contractor,t:0,cnt:0,cats:new Set(),last:''};const m=map[e.contractor];m.t+=e.amount;m.cnt++;if(e.category)m.cats.add(e.category);if(pdt(e.entry_date)>pdt(m.last))m.last=e.entry_date;});return Object.values(map).sort((a,b)=>b.t-a.t).map(m=>({...m,ca:[...m.cats]}));}

// ══════ CONFIRM MODAL — بديل confirm() ══════
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

// ══════ NOTIFY HELPER — بديل alert() ══════
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
  ['dash','daily','proj','projList','adv','admin','rep','search','approvals','projStatus','timeline','archive','dues','notes'].forEach(x=>{
    const el=document.getElementById(x+'Screen');
    if(el)el.style.display=x===s?'block':'none';
  });
  if(s==='projList'){buildProjListScreen();}
  document.getElementById('advDetail').style.display='none';
  // Sidebar active state
  ['dash','adv','daily','admin','rep','search','approvals','archive'].forEach(x=>{
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
  if(s==='approvals')loadApprovals();
  if(s==='projStatus')loadProjStatus();
  if(s==='timeline')loadTimeline();
  if(s==='archive')loadArchivedProjects();
  if(s==='dues')loadDuesScreen();
  if(s==='notes')loadNotesScreen();
  closeSidebar();
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
        <div class="entry-desc">${e.description||'—'} ${e.entry_no?'<span class="seq-badge">#'+e.entry_no+'</span>':''}</div>
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
    ents.forEach(e=>wsE.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',mq:e.contractor||'',seq:e.entry_no||''}));
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

// DASHBOARD
// ══════ MQ MANAGER ══════
function openMqManager(){
  document.getElementById('repHub').style.display='none';
  document.getElementById('repView').style.display='none';
  document.getElementById('mqManagerScreen').style.display='block';
  renderMqManager('');
}
function closeMqManager(){
  document.getElementById('mqManagerScreen').style.display='none';
  document.getElementById('repHub').style.display='block';
}
function renderMqManager(q){
  const list=document.getElementById('mqMgrList');if(!list)return;
  const freq={};
  allEntries.filter(e=>e.contractor).forEach(e=>{
    if(!freq[e.contractor])freq[e.contractor]={count:0,projects:new Set()};
    freq[e.contractor].count++;
    freq[e.contractor].projects.add(e.project_id);
  });
  let mqs=Object.entries(freq).sort((a,b)=>b[1].count-a[1].count);
  if(q)mqs=mqs.filter(([name])=>name.includes(q)||name.toLowerCase().includes(q.toLowerCase()));
  if(!mqs.length){list.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-hint)">لا يوجد مقاولين</div>';return;}
  list.innerHTML=mqs.map(([name,data])=>{
    const projNames=data.projects.size+' مشروع';
    return `<div class="mq-mgr-item">
      <span class="mq-mgr-ico">👷</span>
      <div style="flex:1;min-width:0">
        <div class="mq-mgr-name">${name}</div>
        <div class="mq-mgr-meta">${data.count} قيد · ${projNames}</div>
      </div>
      <button class="mq-mgr-btn" onclick="renameMq('${name.replace(/'/g,"\\'")}')">✏️ تعديل الاسم</button>
    </div>`;
  }).join('');
}
async function renameMq(oldName){
  const newName=prompt('الاسم الجديد للمقاول:',oldName);
  if(!newName||newName===oldName)return;
  const toUpdate=allEntries.filter(e=>e.contractor===oldName);
  if(!toUpdate.length)return;
  notify('⏳ جاري التحديث على '+toUpdate.length+' قيد...','info');
  let done=0;
  for(const e of toUpdate){
    try{
      await sb('entries?id=eq.'+e.id,'PATCH',{contractor:newName});
      e.contractor=newName;
      done++;
    }catch(err){console.error(err);}
  }
  notify('✅ تم تحديث '+done+' قيد','ok');
  renderMqManager(document.getElementById('mqMgrSearch')?.value||'');
}

async function loadDashboard(){
  try{
    loadNotes();
    // Welcome
    const nameEl=document.getElementById('dWelcomeName');
    const dateEl=document.getElementById('dWelcomeDate');
    if(nameEl)nameEl.textContent=uName||'—';
    if(dateEl){
      const now=new Date();
      const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      dateEl.textContent=`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
    }

    const [allAdvances,_allInstallments]=await Promise.all([
      sb('advances?status=eq.open'),
      sb('advance_installments?order=created_at')
    ]);
    allInstallments=_allInstallments;

    // حساب الإجماليات
    let totalInc=0,totalExp=0;
    allProjects.forEach(p=>{
      const s=projSummaries[p.id]||{inc:0,exp:0};
      totalInc+=s.inc; totalExp+=s.exp;
    });
    let totalAdv=0;
    allAdvances.forEach(a=>{
      const inst=allInstallments.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allEntries.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      totalAdv+=(inst-spent);
    });

    // إجمالي المستحقات غير المدفوعة
    let totalDues=0;
    try{
      const dues=await sb('contractor_dues?status=eq.unpaid&select=amount');
      totalDues=dues.reduce((s,d)=>s+d.amount,0);
    }catch(_){}

    const bal=totalInc-totalExp-totalAdv+totalDues;

    // تصنيف المشاريع
    let excellent=0,needFollow=0,critical=0;
    allProjects.forEach(p=>{
      const s=projSummaries[p.id]||{inc:0,exp:0};
      const pct=s.inc>0?Math.round((s.exp/s.inc)*100):0;
      if(s.inc===0||pct>90)critical++;
      else if(pct>70)needFollow++;
      else excellent++;
    });

    // KPI cards
    const setKpi=(id,val,trend)=>{
      const el=document.getElementById(id);
      if(el)el.textContent=val;
      const tr=document.getElementById(id+'Trend');
      if(tr&&trend)tr.innerHTML=trend;
    };
    setKpi('dInc',fn(totalInc)+' ج');
    setKpi('dExp',fn(totalExp)+' ج');
    const balEl=document.getElementById('dBal');
    if(balEl){balEl.textContent=(bal>=0?'+':'')+fn(bal)+' ج';balEl.className='d-kpi-val net'+(bal<0?' exp':'');}
    setKpi('dAdv',fn(totalAdv)+' ج');
    setKpi('dDues',fn(totalDues)+' ج');

    setKpi('dProjActive',allProjects.length+' مشروع');
    setKpi('dProjWarn',needFollow+critical);

    // ملخص حالة المشاريع - Donut
    const statusList=document.getElementById('dProjStatusList');
    if(statusList){
      statusList.innerHTML=[
        {lbl:'ممتازة',val:excellent,color:'var(--success-light)'},
        {lbl:'تحتاج متابعة',val:needFollow,color:'var(--accent-gold)'},
        {lbl:'متعثرة',val:critical,color:'var(--danger-pop)'}
      ].map(s=>`<div class="d-psl-item">
        <span class="d-psl-dot" style="background:${s.color}"></span>
        <span class="d-psl-lbl">${s.lbl}</span>
        <span class="d-psl-val">${s.val}</span>
      </div>`).join('');
    }
    // Donut Chart
    const donutCanvas=document.getElementById('dDonutChart');
    if(donutCanvas&&window.Chart){
      if(donutCanvas._chartInst)donutCanvas._chartInst.destroy();
      donutCanvas._chartInst=new Chart(donutCanvas,{
        type:'doughnut',
        data:{
          labels:['ممتازة','تحتاج متابعة','متعثرة'],
          datasets:[{data:[excellent||0,needFollow||0,critical||0],backgroundColor:['#1D9E75','#D4C49A','#EB5757'],borderWidth:0,hoverOffset:4}]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{rtl:true}},
          cutout:'70%'
        }
      });
    }

    // التنبيهات
    const alerts=[];
    allProjects.forEach(p=>{
      const s=projSummaries[p.id]||{inc:0,exp:0};
      const pct=s.inc>0?Math.round((s.exp/s.inc)*100):0;
      if(s.inc>0&&pct>90)alerts.push({type:'red',ico:'🚨',title:'مشروع تجاوز الميزانية',sub:p.name+' — تجاوز '+pct+'%',pid:p.id});
      else if(s.inc>0&&pct>70)alerts.push({type:'yellow',ico:'⚠️',title:'مشروع يحتاج متابعة',sub:p.name+' — صرف '+pct+'%',pid:p.id});
    });
    allAdvances.forEach(a=>{
      const inst=allInstallments.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allEntries.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      const rem=inst-spent;
      if(rem<0)alerts.push({type:'red',ico:'💼',title:'عهدة بها عجز',sub:a.person_name+' — عجز '+fn(Math.abs(rem))+' ج'});
    });
    if(bal<0)alerts.push({type:'red',ico:'📉',title:'رصيد النقدية سالب',sub:'صافي: '+fn(bal)+' ج'});
    const alertsList=document.getElementById('dAlertsList');
    const alertCount=document.getElementById('dAlertCount');
    if(alertCount)alertCount.textContent=alerts.length||'';
    if(alertCount)alertCount.style.display=alerts.length?'':'none';
    if(alertsList){
      alertsList.innerHTML=alerts.length?alerts.slice(0,6).map(a=>`
        <div class="d-alert-item alert-${a.type}" ${a.pid?`onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${a.pid}';sw('${a.pid}');},100)" style="cursor:pointer"`:''}>
          <span class="d-alert-ico">${a.ico}</span>
          <div class="d-alert-body">
            <div class="d-alert-title">${a.title}</div>
            <div class="d-alert-sub">${a.sub}</div>
          </div>
          ${a.pid?'<span style="font-size:10px;opacity:.4">←</span>':''}
        </div>`).join(''):'<div class="d-empty">✅ لا توجد تنبيهات</div>';
    }

    // آخر الحركات
    const txnList=document.getElementById('dTxnList');
    if(txnList){
      const recent=[...allEntries].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,8);
      txnList.innerHTML=recent.map(e=>{
        const proj=allProjectsMap[e.project_id];
        const ii=e.type==='i';
        return `<div class="d-txn-item" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${e.project_id}';sw('${e.project_id}');},100)" style="cursor:pointer">
          <span class="d-txn-dot ${ii?'inc':'exp'}"></span>
          <div class="d-txn-info">
            <div class="d-txn-main">${e.description||e.category||'—'}</div>
            <div class="d-txn-sub">${e.category||''} · ${cleanDate(e.entry_date)}</div>
          </div>
          <span class="d-txn-proj">${proj?.name||'—'}</span>
          <span class="d-txn-amt ${ii?'inc':'exp'}">${ii?'▲':'▼'} ${fn(e.amount)} ج</span>
        </div>`;
      }).join('')||'<div class="d-empty">لا توجد حركات</div>';
    }

    // التدفق النقدي - Chart.js
    _renderCashFlowChart(allEntries);

    // آخر وارد 15 يوم
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
    const recentInc=allEntries.filter(e=>{
      if(e.type!=='i'||!e.entry_date)return false;
      const p=e.entry_date.split('/');
      if(p.length!==3)return false;
      return new Date(+p[2],+p[1]-1,+p[0])>=cutoff;
    }).sort((a,b)=>{
      const pa=a.entry_date.split('/'),pb=b.entry_date.split('/');
      return new Date(+pb[2],+pb[1]-1,+pb[0])-new Date(+pa[2],+pa[1]-1,+pa[0]);
    });
    const incList=document.getElementById('dIncList');
    const incCount=document.getElementById('dIncCount');
    if(incCount){incCount.textContent=recentInc.length||'';incCount.style.display=recentInc.length?'':'none';}
    if(incList){
      incList.innerHTML=recentInc.length?recentInc.map(e=>{
        const proj=allProjectsMap[e.project_id];
        return `<div class="d-inc-item" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${e.project_id}';sw('${e.project_id}');},100)" style="cursor:pointer">
          <span class="d-inc-dot"></span>
          <div class="d-inc-info">
            <div class="d-inc-main">${e.description||e.category||'—'}</div>
            <div class="d-inc-sub">${proj?.name||'—'} · ${cleanDate(e.entry_date)}</div>
          </div>
          <span class="d-inc-amt">▲ ${fn(e.amount)} ج</span>
        </div>`;
      }).join(''):'<div class="d-empty">لا يوجد وارد في آخر 30 يوم</div>';
    }

  }catch(e){setSav('❌ '+friendlyError(e),'er');console.error('Dashboard error:',e);}
}

function _renderCashFlowChart(entries){
  const cashCanvas=document.getElementById('dCashChart');
  if(!cashCanvas)return;
  if(!window.Chart){
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    s.onload=()=>_renderCashFlowChart(entries);
    document.head.appendChild(s);return;
  }
  // آخر 30 يوم
  const days=[];
  const incData=[];
  const expData=[];
  const now=new Date();
  for(let i=29;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const dayStr=d.toLocaleDateString('ar-EG',{day:'numeric',month:'numeric'});
    days.push(i%5===0||i===0?dayStr:'');
    const dayEntries=entries.filter(e=>{
      if(!e.entry_date)return false;
      const parts=e.entry_date.split('/');
      if(parts.length!==3)return false;
      const eDate=new Date(+parts[2],+parts[1]-1,+parts[0]);
      return eDate.toDateString()===d.toDateString();
    });
    incData.push(dayEntries.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0));
    expData.push(dayEntries.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0));
  }
  if(cashCanvas._chartInst)cashCanvas._chartInst.destroy();
  cashCanvas._chartInst=new Chart(cashCanvas,{
    type:'line',
    data:{
      labels:days,
      datasets:[
        {label:'الوارد',data:incData,borderColor:'#1D9E75',backgroundColor:'rgba(29,158,117,0.08)',tension:0.4,fill:true,pointRadius:2,borderWidth:2,pointHoverRadius:5},
        {label:'المصروفات',data:expData,borderColor:'#EB5757',backgroundColor:'rgba(235,87,87,0.06)',tension:0.4,fill:true,pointRadius:2,borderWidth:2,pointHoverRadius:5}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{rtl:true,mode:'index',intersect:false,callbacks:{label:ctx=>ctx.dataset.label+': '+fn(ctx.raw)+' ج'}}},
      scales:{
        x:{grid:{display:false},ticks:{color:'rgba(212,196,154,0.4)',font:{size:9}},border:{display:false}},
        y:{grid:{color:'rgba(212,196,154,0.06)'},ticks:{color:'rgba(212,196,154,0.4)',font:{size:9},callback:v=>v>=1000?Math.round(v/1000)+'k':v},border:{display:false}}
      }
    }
  });
}

// PROJECTS
async function loadProjStatus(){try{
  const sub=document.getElementById('psStatusSub');
  const dateEl=document.getElementById('psStatusDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  if(sub)sub.textContent=allProjects.length+' مشروع نشط';
  const container=document.getElementById('dProjCards');
  if(!container)return;
  if(!allEntries.length){container.innerHTML='<div class="empty-state">⏳ جاري التحميل...</div>';await loadAllData();}
  container.className='d-proj-grid';
  if(!allProjects.length){container.innerHTML='<div class="empty-state">لا توجد مشاريع</div>';return;}
  const projColors=['var(--success-soft)','var(--info-sky)','var(--accent-gold)','var(--purple-soft)','var(--danger-peach)','var(--danger-blush)','var(--info-soft)','var(--danger-warm)'];
  container.innerHTML=allProjects.map((p,idx)=>{
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0,count:0,cats:[]};
    const pI=s.inc,pE=s.exp,pB=s.bal;
    const balCls=pB>0?'pos':pB<0?'neg':'zero';
    const pct=pI>0?Math.min(100,Math.round(pE/pI*100)):0;
    const badgeTxt=pB>0?'✦ مستقر':pB<0?'⚠ عجز':'◌ صفر';
    const color=projColors[idx%projColors.length];
    return `<div class="d-pcard" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${p.id}';sw('${p.id}');},100)" style="animation-delay:${idx*0.04}s">
      <div class="d-pcard-head">
        <div class="d-pcard-name">${p.name}</div>
        <span class="d-pcard-badge ${balCls}">${badgeTxt}</span>
      </div>
      <div class="d-pcard-stats">
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">وارد</div><div class="d-pcard-stat-val inc">+${fn(pI)}</div></div>
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">مصروف</div><div class="d-pcard-stat-val exp">-${fn(pE)}</div></div>
      </div>
      <div class="d-pcard-progress">
        <div class="d-pcard-progress-info"><span class="d-pcard-meta">${s.count} قيد · ${s.cats.length} بند</span><span class="d-pcard-pct">${pct}%</span></div>
        <div class="d-pcard-progress-bar"><div class="d-pcard-progress-fill" style="width:${pct}%;background:${pct>90?'var(--danger)':pct>70?'var(--warning)':color}"></div></div>
      </div>
      <div class="d-pcard-footer"><div class="d-pcard-bal ${balCls}">${pB>=0?'+':''}${fn(pB)} ج</div></div>
    </div>`;
  }).join('');
}catch(_e){const _c=document.getElementById('dProjCards');if(_c)_c.innerHTML='<div class="empty-state">⚠️ خطأ في تحميل المشاريع</div>';}}

async function loadTimeline(){try{
  const dateEl=document.getElementById('tlScreenDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const tlEl=document.getElementById('dTimeline');
  if(!tlEl)return;
  if(!allEntries.length){tlEl.innerHTML='<div class="empty-state">⏳ جاري التحميل...</div>';await loadAllData();}
  const recent=[...allEntries].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,50);
  if(!recent.length){tlEl.innerHTML='<div class="empty-state">لا توجد حركات بعد</div>';return;}
  const projMap={};allProjects.forEach(p=>{projMap[p.id]=p.name;});
  const today=new Date().toDateString();
  const yday=new Date(Date.now()-86400000).toDateString();
  const groups={'اليوم':[],'أمس':[],'سابق':[]};
  recent.forEach(e=>{
    const d=new Date(e.created_at).toDateString();
    if(d===today)groups['اليوم'].push(e);
    else if(d===yday)groups['أمس'].push(e);
    else groups['سابق'].push(e);
  });
  tlEl.innerHTML=Object.entries(groups).filter(([,v])=>v.length).map(([date,items])=>`
    <div class="tl-group">
      <div class="tl-date-lbl">${date}</div>
      ${items.map(e=>{
        const proj=projMap[e.project_id]||'—';
        const ii=e.type==='i';
        return `<div class="tl-item">
          <div class="tl-dot ${ii?'inc':'exp'}"></div>
          <div class="tl-info">
            <div class="tl-main"><span class="tl-proj-tag">${proj}</span>${e.description||e.category||'—'}</div>
            <div class="tl-sub">${e.category||''} · ${cleanDate(e.entry_date)}</div>
          </div>
          <div class="tl-amt ${ii?'inc':'exp'}">${ii?'▲':'▼'} ${fn(e.amount)} ج</div>
        </div>`;
      }).join('')}
    </div>`).join('');
}catch(_e){const _c=document.getElementById('dTimeline');if(_c)_c.innerHTML='<div class="empty-state">⚠️ خطأ في تحميل السجل</div>';}}


// ملخصات المشاريع — بيتحسب مرة واحدة ويتخزن
let projSummaries={};

// تحديث ملخص مشروع واحد بعد أي تغيير
function refreshProjSummary(pid){
  if(!pid)return;
  const pe=allEntries.filter(e=>e.project_id===pid);
  const inc=pe.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=pe.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  // expDirect = مصروف مباشر فقط (بدون مصروفات العهد)
  const expDirect=pe.filter(e=>e.type==='e'&&!e.advance_id).reduce((s,e)=>s+e.amount,0);
  const cats=[...new Set(pe.filter(e=>e.type==='e'&&!e.advance_id).map(e=>e.category).filter(Boolean))];
  projSummaries[pid]={inc,exp,expDirect,bal:inc-exp,balDirect:inc-expDirect,cats,count:pe.length};
}

async function loadAllProjects(){
  // نجيب المشاريع + الملخصات من الـ View مرة واحدة
  [allProjects,allEntries]=await Promise.all([
    sb('projects?order=created_at'),
    sb('entries?select=id,entry_no,project_id,type,amount,category,description,contractor,entry_date,created_at,advance_id&order=created_at.desc&limit=5000')
  ]);
  // نجيب الملخصات الجاهزة من الـ View
  let summariesData=[];
  try{ summariesData=await sb('project_summaries'); }catch(_){}
  // نبني الـ map بكل المشاريع (نشطة + مؤرشفة) قبل الفلتر
  allProjectsMap={};
  allProjects.forEach(p=>{allProjectsMap[p.id]=p;});
  // المشاريع النشطة بس (غير المؤرشفة)
  allProjects=allProjects.filter(p=>!p.archived);
  // نبني projSummaries من الـ View
  projSummaries={};
  allProjects.forEach(p=>{
    const sv=summariesData.find(s=>s.project_id===p.id);
    const inc=sv?parseFloat(sv.inc)||0:0;
    const exp=sv?parseFloat(sv.exp)||0:0;
    const expDirect=sv?parseFloat(sv.exp_direct)||0:0;
    const pe=allEntries.filter(e=>e.project_id===p.id&&e.type==='e'&&!e.advance_id);
    const cats=[...new Set(pe.map(e=>e.category).filter(Boolean))];
    projSummaries[p.id]={inc,exp,expDirect,bal:inc-exp,balDirect:inc-expDirect,cats,count:sv?parseInt(sv.total_count)||0:0};
  });
  // إظهار أزرار الأدمن
  if(uRole==='admin'){
    const archBtn=document.getElementById('sbi-archive');if(archBtn)archBtn.style.display='flex';
    const archPBtn=document.getElementById('archPBtn');if(archPBtn)archPBtn.style.display='';
    updateBackupDateDisplay();
  }
  populateAdvProjSel();
  buildSidebarProjects();
}
function populateAdvProjSel(){
  const sel=document.getElementById('advProjSel');
  sel.innerHTML='<option value="">اختار المشروع</option>';
  allProjects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}
async function loadProjects(){
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(uRole==='admin'||uRole==='viewer'){projects=allProjects;}
    else{const acc=await sb('project_access?user_id=eq.'+uid);if(!acc.length){projects=[];}else{const ids=acc.map(a=>a.project_id);projects=allProjects.filter(p=>ids.includes(p.id));}}
    if(!projects.length&&uRole==='admin'){const p=await sb('projects','POST',{name:'مشروع جديد',start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects=allProjects;}
    if(projects.length){curPid=projects[0].id;await loadEntries();}
    setSav('☁️ متصل — بياناتك محفوظة','ok');if(curScreen==='proj'||!curScreen)rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}
async function loadEntries(){if(!curPid)return;entries=await sbAll('entries?project_id=eq.'+curPid+'&order=created_at');}

async function ae(){
  const a=parseFloat(document.getElementById('ia').value);
  const c=document.getElementById('ic').value.trim();
  const d=document.getElementById('id_').value.trim();
  const dt=fd(document.getElementById('idt').value);
  const m=document.getElementById('iq').value.trim();
  if(isNaN(a)){notify('ادخل المبلغ','err');return;}
  if(cT==='e'&&!c){notify('ادخل البند','err');return;}
  // snapshot الـ pid واسم المشروع وقت الضغط على حفظ — مش بنعتمد على curPid اللي ممكن يتغير
  const savedPid=curPid;
  const savedProjName=allProjectsMap[savedPid]?.name||'المشروع';
  const maxSeq2=allEntries.reduce((mx,e)=>Math.max(mx,e.entry_no||20260000),20260000);
  const nextSeq=maxSeq2<20260000?20260001:maxSeq2+1;
  const entry={id:uid_(),project_id:savedPid,type:cT,amount:a,description:d,entry_date:dt,category:cT==='e'?c:'',contractor:cT==='e'?m:'',entry_type:cT==='e'&&m?curEtype:null,seq:uRole==='admin'?nextSeq:0,created_by:uid};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      entries.push(entry);
      allEntries=allEntries.filter(e=>e.project_id!==savedPid).concat(entries);
      refreshProjSummary(savedPid);
      setSav('✅ تم الحفظ','ok');
      notify(`✅ تم حفظ القيد في مشروع: ${savedProjName}`,'ok');
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
      notify(`⏳ تم إرسال القيد للموافقة — مشروع: ${savedProjName}`,'warn');
    }
    document.getElementById('ia').value='';document.getElementById('id_').value='';document.getElementById('iq').value='';
    if(cT==='e'&&!['s','i','j','m'].includes(cTab))cTab=c;
    rp();
  }catch(e){
    const _em=friendlyError(e);
    setSav('❌ '+_em,'er');
    notify('❌ فشل الحفظ — '+_em,'err');
  }
}
// ══════ PASSWORD CONFIRMATION MODAL ══════
function confirmWithPassword(actionLabel, actionIcon, onConfirmed){
  let ov=document.getElementById('pwConfirmModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='pwConfirmModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`
    <div class="modal-box">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:32px;margin-bottom:8px">${actionIcon}</div>
        <div class="title-md">${actionLabel}</div>
        <div class="txt-muted">أدخل كلمة المرور للتأكيد</div>
      </div>
      <div style="position:relative;margin-bottom:8px">
        <input id="pwcInput" type="password" placeholder="كلمة المرور"
          class="inp-lg"
          onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'"
          onkeydown="if(event.key==='Enter')submitPwConfirm()">
      </div>
      <div id="pwcMsg" class="modal-msg-err"></div>
      <div class="modal-btns">
        <button id="pwcOkBtn" onclick="submitPwConfirm()" class="btn-primary">✔ تأكيد</button>
        <button onclick="document.getElementById('pwConfirmModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>document.getElementById('pwcInput')?.focus(),100);
  // store callback
  window._pwcCallback=onConfirmed;
}

async function submitPwConfirm(){
  const pw=document.getElementById('pwcInput').value;
  const msg=document.getElementById('pwcMsg');
  const btn=document.getElementById('pwcOkBtn');
  if(!pw){msg.textContent='❌ أدخل كلمة المرور';return;}
  btn.disabled=true;btn.textContent='⏳ جاري التحقق...';
  try{
    // تحقق من الباسورد عبر Supabase
    let email=uEmail;
    if(!email){
      const ur=await fetch(SB+'/auth/v1/user',{headers:{'apikey':AK,'Authorization':'Bearer '+token}});
      const ud=await ur.json();email=ud.email||'';
    }
    if(!email)throw new Error('تعذّر التحقق — سجّل خروجاً ودخولاً مجدداً');
    const r=await fetch(SB+'/auth/v1/token?grant_type=password',{
      method:'POST',
      headers:{'apikey':AK,'Content-Type':'application/json'},
      body:JSON.stringify({email,password:pw})
    });
    if(!r.ok)throw new Error('كلمة المرور غلط');
    document.getElementById('pwConfirmModal')?.remove();
    if(window._pwcCallback)window._pwcCallback();
  }catch(e){
    msg.textContent='❌ '+e.message;
    btn.disabled=false;btn.textContent='✔ تأكيد';
    document.getElementById('pwcInput').value='';
    document.getElementById('pwcInput').focus();
  }
}

async function de(id){
  confirmWithPassword('تأكيد حذف القيد','🗑️',async()=>{
    setSav('💾 جاري الحذف...','ng');
    try{
      await sb('entries?id=eq.'+id,'DELETE');
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
      setSav('✅ تم الحذف','ok');
      rp();
    }catch(e){setSav('❌ '+friendlyError(e),'er');}
  });
}

async function sed(){
  if(!edId)return;
  const a=parseFloat(document.getElementById('eA').value);
  if(isNaN(a)){notify('ادخل المبلغ','err');return;}
  confirmWithPassword('تأكيد حفظ التعديل','✏️',async()=>{
    const newPid=document.getElementById('ePrj').value;
    const u={amount:a,description:document.getElementById('eD').value.trim(),entry_date:fd(document.getElementById('eDt').value),project_id:newPid};
    if(edType==='e'){
      const nc=document.getElementById('eC').value.trim();
      if(!nc){notify('ادخل البند','err');return;}
      u.category=nc;
      const mq=document.getElementById('eM').value.trim();
      u.contractor=mq;u.entry_type=mq&&curEditEtype?curEditEtype:null;
    }
    setSav('💾 جاري الحفظ...','ng');
    try{
      await sb('entries?id=eq.'+edId,'PATCH',u);
      if(newPid!==curPid){
        entries=entries.filter(e=>e.id!==edId);
        allEntries=allEntries.map(e=>e.id===edId?{...e,...u}:e);
        setSav('✅ تم النقل للمشروع الجديد','ok');
      }else{
        await loadEntries();
        allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
        setSav('✅ تم التعديل','ok');
      }
      cep();rp();
    }catch(e){setSav('❌ '+friendlyError(e),'er');}
  });
}
async function sw(pid){
  curPid=pid;cTab='s';window._rpPage=0;setSav('⏳...','ng');
  cep();
  await loadEntries();setSav('☁️ متصل','ok');
  const idt=document.getElementById('idt');
  if(idt&&!idt.value)idt.value=ts();
  rp();
}
async function np(){const n=prompt('اسم المشروع الجديد:');if(!n||!n.trim())return;try{const p=await sb('projects','POST',{name:n.trim(),start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects.push(p[0]);curPid=p[0].id;entries=[];cTab='s';populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function dp(){if(projects.length<=1){notify('لا يمكن حذف المشروع الوحيد','warn');return;}showConfirm({icon:'🗑️',title:'حذف المشروع',msg:'هيتحذف مشروع "'+curP().name+'" بالكامل مع كل قيوده. متأكد؟',okLabel:'حذف',okType:'danger',onOk:async()=>{try{await sb('projects?id=eq.'+curPid,'DELETE');allProjects=allProjects.filter(p=>p.id!==curPid);projects=projects.filter(p=>p.id!==curPid);curPid=projects[0].id;cTab='s';await loadEntries();populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}});}

// ══ أرشفة المشاريع ══
async function archiveProject(){
  if(!curPid)return;
  const p=curP();
  await new Promise(res=>showConfirm({icon:'📦',title:'أرشفة المشروع',msg:'مشروع "'+p.name+'" هيختفي من القائمة الرئيسية. تقدر تستعيده من الأرشيف.',okLabel:'أرشفة',okType:'warning',onOk:res}));
  try{
    await sb('projects?id=eq.'+curPid,'PATCH',{archived:true});
    allProjects=allProjects.filter(x=>x.id!==curPid);
    projects=projects.filter(x=>x.id!==curPid);
    notify('📦 تم أرشفة "'+p.name+'"','ok');
    if(projects.length>0){curPid=projects[0].id;cTab='s';await loadEntries();rp();}
    else{showScreen('dash');}
    populateAdvProjSel();
    buildSidebarProjects();
  }catch(e){notify('❌ '+friendlyError(e),'err');}
}

let _archiveData=[];

async function loadArchivedProjects(){
  const div=document.getElementById('archivedProjList');
  const countEl=document.getElementById('archCount');
  if(!div)return;
  div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">⏳</div><div class="arch-empty-txt">جاري التحميل...</div></div>';
  try{
    const archived=await sb('projects?archived=eq.true&order=created_at.desc&limit=1000');
    if(!archived||!archived.length){
      div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">📦</div><div class="arch-empty-txt">لا توجد مشاريع مؤرشفة</div><div class="arch-empty-sub">بعد أرشفة أي مشروع سيظهر هنا</div></div>';
      if(countEl)countEl.textContent='لا توجد مشاريع';
      return;
    }
    const pids=archived.map(p=>p.id);
    let archEntries=[];
    try{archEntries=await sbAll('entries?project_id=in.('+pids.join(',')+')&select=id,project_id,type,amount,category,advance_id');}catch(_){}
    _archiveData=archived.map(p=>{
      const pe=(archEntries||[]).filter(e=>e.project_id===p.id);
      const inc=pe.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
      const expDirect=pe.filter(e=>e.type==='e'&&!e.advance_id).reduce((s,e)=>s+e.amount,0);
      const bal=inc-expDirect;
      const cats=[...new Set(pe.filter(e=>e.type==='e'&&!e.advance_id).map(e=>e.category).filter(Boolean))];
      return{...p,_inc:inc,_exp:expDirect,_bal:bal,_cats:cats,_count:pe.length};
    });
    if(countEl)countEl.textContent=_archiveData.length+' مشروع مؤرشف';
    renderArchiveCards(_archiveData,div);
  }catch(e){div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">❌</div><div class="arch-empty-txt">خطأ في التحميل</div><div class="arch-empty-sub">'+e.message+'</div></div>';}
}

function renderArchiveCards(data,div){
  if(!data.length){div.innerHTML='<div class="arch-empty"><div class="arch-empty-icon">🔍</div><div class="arch-empty-txt">لا نتائج للبحث</div></div>';return;}
  div.innerHTML=data.map(p=>{
    const bal=p._bal||0;
    const balClass=bal>0?'pos':bal<0?'neg':'neu';
    const balLabel=bal<0?'⚠ عجز':bal>0?'✅ رصيد':'—';
    const catsHtml=p._cats&&p._cats.length?p._cats.slice(0,6).map(c=>`<span class="arch-cat-tag">${c}</span>`).join('')+(p._cats.length>6?`<span class="arch-cat-tag">+${p._cats.length-6}</span>`:''): '<span class="arch-cat-tag" style="color:var(--text-pale)">لا توجد بنود</span>';
    const safeName=p.name.replace(/'/g,"\'").replace(/"/g,'&quot;');
    return `<div class="arch-card">
      <div class="arch-card-top">
        <div class="arch-card-name">${p.name}</div>
        <div class="arch-card-badge">${p._count} قيد</div>
      </div>
      <div class="arch-card-body">
        <div class="arch-card-dates"><span>📅 البداية: ${p.start_date||'—'}</span><span>🏁 الإغلاق: ${p.close_date||'جارٍ'}</span></div>
        <div class="arch-stats">
          <div class="arch-stat"><div class="arch-stat-lbl">الوارد</div><div class="arch-stat-val pos">${fn(p._inc)}</div></div>
          <div class="arch-stat"><div class="arch-stat-lbl">المصروف</div><div class="arch-stat-val neg">${fn(p._exp)}</div></div>
          <div class="arch-stat"><div class="arch-stat-lbl">${balLabel}</div><div class="arch-stat-val ${balClass}">${fn(Math.abs(bal))}</div></div>
        </div>
        <div class="arch-cats">${catsHtml}</div>
        <div class="arch-card-footer">
          <div class="arch-entries-count">📋 ${p._count} قيد محاسبي</div>
          <button class="arch-restore-btn" onclick="restoreProject('${p.id}','${safeName}')">↩ استعادة</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterArchive(q){
  if(!_archiveData.length)return;
  const div=document.getElementById('archivedProjList');
  const filtered=q.trim()?_archiveData.filter(p=>p.name.includes(q.trim())):_archiveData;
  renderArchiveCards(filtered,div);
}

async function restoreProject(pid,name){
  await new Promise(res=>showConfirm({icon:'↩️',title:'استعادة المشروع',msg:'مشروع "'+name+'" هيظهر تاني في القائمة الرئيسية.',okLabel:'استعادة',okType:'success',onOk:res}));
  try{
    await sb('projects?id=eq.'+pid,'PATCH',{archived:false});
    notify('✅ تم استعادة "'+name+'"','ok');
    await loadAllProjects();
    await loadProjects();
    loadArchivedProjects();
  }catch(e){notify('❌ '+friendlyError(e),'err');}
}

function editProject(){
  const p=curP();
  if(!p)return;
  let ov=document.getElementById('editProjModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='editProjModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div class="modal-box-lg">
      <div class="modal-hdr">
        <div class="title-lg">✏️ تعديل المشروع</div>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-close-sm">✕</button>
      </div>
      <label class="lbl-lg">اسم المشروع</label>
      <input id="epName" type="text" value="${(p.name||'').replace(/"/g,'&quot;')}"
        class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div class="proj-edit-dates-row">
        <div>
          <label class="lbl-lg">📅 تاريخ البداية</label>
          <input id="epStart" type="text" value="${p.start_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div>
          <label class="lbl-lg">📅 تاريخ الإغلاق</label>
          <input id="epClose" type="text" value="${p.close_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
      </div>
      <div id="epMsg" class="proj-edit-msg"></div>
      <div class="modal-btns">
        <button onclick="saveProjectEdit()" class="btn-primary">💾 حفظ التعديلات</button>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.getElementById('epName').focus();
  setTimeout(()=>{initDateInput(document.getElementById('epStart'));initDateInput(document.getElementById('epClose'));},0);
}

async function saveProjectEdit(){
  const name=document.getElementById('epName').value.trim();
  const start=document.getElementById('epStart').value.trim();
  const close=document.getElementById('epClose').value.trim();
  const msg=document.getElementById('epMsg');
  if(!name){msg.style.color='var(--danger)';msg.textContent='❌ الاسم مطلوب';return;}
  msg.style.color='var(--warning-text)';msg.textContent='⏳ جاري الحفظ...';
  try{
    const upd={name,start_date:start||null,close_date:close||null};
    await sb('projects?id=eq.'+curPid,'PATCH',upd);
    // حدّث الذاكرة
    const idx=allProjects.findIndex(p=>p.id===curPid);
    if(idx>=0){allProjects[idx]={...allProjects[idx],...upd};}
    const idx2=projects.findIndex(p=>p.id===curPid);
    if(idx2>=0){projects[idx2]={...projects[idx2],...upd};}
    // حدّث الـ select
    const sel=document.getElementById('ps');
    if(sel){const opt=[...sel.options].find(o=>o.value===curPid);if(opt)opt.textContent=name;}
    // حدّث حقول التواريخ في الشاشة
    const dstEl=document.getElementById('dst');
    const dclEl=document.getElementById('dcl');
    if(dstEl)dstEl.value=start||'';
    if(dclEl)dclEl.value=close||'';
    msg.style.color='var(--primary-btn)';msg.textContent='✅ تم الحفظ';
    setSav('✅ تم تعديل المشروع','ok');
    setTimeout(()=>document.getElementById('editProjModal')?.remove(),700);
  }catch(e){msg.style.color='var(--danger)';msg.textContent='❌ خطأ: '+e.message;}
}
async function upm(k,v){const u=k==='s'?{start_date:v}:{close_date:v};try{await sb('projects?id=eq.'+curPid,'PATCH',u);}catch(e){setSav('❌ '+friendlyError(e),'er');}}
function oe(id){
  if(uRole==='viewer')return;
  const e=entries.find(x=>x.id===id);if(!e)return;
  edId=id;edType=e.type;
  document.getElementById('ep-t').textContent='تعديل القيد #'+(e.entry_no||'?');
  // populate project dropdown
  const ePrj=document.getElementById('ePrj');
  ePrj.innerHTML=allProjects.map(p=>'<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>').join('');
  document.getElementById('eA').value=e.amount;
  document.getElementById('eC').value=e.category||'';document.getElementById('eC').style.display=e.type==='e'?'block':'none';
  document.getElementById('eD').value=e.description||'';
  document.getElementById('eM').value=e.contractor||'';document.getElementById('eM').style.display=e.type==='e'?'block':'none';
  if(e.entry_date&&e.entry_date!=='—'){const p=e.entry_date.split('/');if(p.length===3)document.getElementById('eDt').value=p[2]+'-'+p[1]+'-'+p[0];}else document.getElementById('eDt').value='';
  // entry_type buttons
  const wrap=document.getElementById('editEtypeWrap');
  if(e.type==='e'&&e.contractor){
    wrap.classList.add('show');
    curEditEtype=e.entry_type||'payment';
    ['payment','work','material'].forEach(t=>{
      const btn=document.getElementById('eEt-'+t);
      btn.classList.toggle('on',t===curEditEtype);
    });
  }else{wrap.classList.remove('show');curEditEtype=null;}
  document.getElementById('ep').style.display='block';
}
function cep(){document.getElementById('ep').style.display='none';edId=null;edType=null;}
function st(t){cT=t;document.getElementById('tx').classList.toggle('on',t==='e');document.getElementById('ti').classList.toggle('on',t==='i');document.getElementById('ic').style.display=t==='e'?'block':'none';document.getElementById('iq').style.display=t==='e'?'block':'none';}
function stab(t){
  cTab=t;window._rpPage=0;
  const fb=document.getElementById('entryFilterBar');
  if(fb)fb.style.display=t==='j'?'flex':'none';
  if(t==='j'){
    setTimeout(()=>{
      const ff=document.getElementById('entFltFrom');
      const ft=document.getElementById('entFltTo');
      if(ff&&!ff._dpInit)initDateInput(ff);
      if(ft&&!ft._dpInit)initDateInput(ft);
    },100);
  }
  rp();
}
let _entFltActive=false;
function applyEntryFilter(){
  _entFltActive=true;
  window._rpPage=0;
  re();
}
function clearEntryFilter(){
  document.getElementById('entFltText').value='';
  document.getElementById('entFltType').value='';
  document.getElementById('entFltFrom').value='';
  document.getElementById('entFltTo').value='';
  _entFltActive=false;
  window._rpPage=0;
  re();
}
function getFilteredEntries(){
  if(!_entFltActive)return null;
  const q=(document.getElementById('entFltText')?.value||'').toLowerCase().trim();
  const type=document.getElementById('entFltType')?.value||'';
  const fromRaw=document.getElementById('entFltFrom')?.value||'';
  const toRaw=document.getElementById('entFltTo')?.value||'';
  const parseD=s=>{if(!s)return null;const[d,m,y]=s.split('/');return new Date(+y,+m-1,+d);};
  const from=parseD(fromRaw);const to=parseD(toRaw);
  return entries.filter(e=>{
    if(type&&e.type!==type)return false;
    if(q&&!(e.description||'').toLowerCase().includes(q)&&!(e.contractor||'').toLowerCase().includes(q)&&!(e.category||'').toLowerCase().includes(q))return false;
    if(from||to){
      let ed=null;
      if(e.entry_date){const p=e.entry_date.includes('/')?e.entry_date.split('/'):null;ed=p?new Date(+p[2],+p[1]-1,+p[0]):new Date(e.entry_date);}
      if(ed){if(from&&ed<from)return false;if(to){const t=new Date(to);t.setHours(23,59,59);if(ed>t)return false;}}
    }
    return true;
  });
}

// ══════════════════════════════════════════
//  CONTRACTOR DUES TAB
// ══════════════════════════════════════════
let _duesList=[];

async function loadDuesTab(el){
  el.innerHTML='<div class="emp">⏳ جاري التحميل...</div>';
  try{
    const data=await sb('contractor_dues?project_id=eq.'+curPid+'&order=created_at.desc');
    _duesList=data||[];
    renderDuesTab(el);
  }catch(e){el.innerHTML='<div class="emp">❌ خطأ في تحميل البيانات</div>';}
}

function renderDuesTab(el){
  const canEdit=uRole!=='viewer'&&uRole!=='owner';
  const total=_duesList.reduce((s,d)=>s+d.amount,0);
  const unpaid=_duesList.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_duesList.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  let html=`
    <div class="kp" style="margin-bottom:12px">
      <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>
    </div>`;

  if(canEdit){
    html+=`<div class="ef" style="margin-bottom:12px">
      <div class="ig">
        <input id="dueContr" placeholder="اسم المقاول" class="input-full">
        <input id="dueAmt" type="number" placeholder="المبلغ (ج)" step="any">
        <input id="dueDesc" placeholder="البيان" class="input-full">
        <input id="dueDate" placeholder="📅 التاريخ dd/mm/yyyy" class="input-full" maxlength="10" autocomplete="off">
      </div>
      <button class="save-btn" onclick="addDue()" style="margin-top:8px;width:100%">+ إضافة مستحق</button>
    </div>`;
  }

  if(!_duesList.length){
    html+='<div class="emp">لا توجد مستحقات</div>';
  } else {
    html+='<div class="entries-list">';
    _duesList.forEach(d=>{
      const isPaid=d.status==='paid';
      html+=`<div class="rw" style="opacity:${isPaid?0.6:1}">
        <div class="ri">
          <div class="rd" style="font-weight:700">${d.contractor}</div>
          <div class="rm" style="color:#888;font-size:11px">${d.description||'—'} ${d.due_date?'· '+d.due_date:''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="ra" style="color:${isPaid?'var(--success)':'var(--danger)'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</div>
          ${canEdit?`<button onclick="toggleDue('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'var(--danger)':'var(--success)'};background:transparent;color:${isPaid?'var(--danger)':'var(--success)'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
          <button onclick="editDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #aaa;background:transparent;color:#555;cursor:pointer">✏️ تعديل</button>
          <button onclick="deleteDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #ccc;background:transparent;color:#999;cursor:pointer">🗑</button>`:''}
        </div>
      </div>`;
    });
    html+='</div>';
  }
  el.innerHTML=html;
  // تفعيل date picker على حقل التاريخ
  const dtEl=document.getElementById('dueDate');
  if(dtEl)initDateInput(dtEl);
}

async function addDue(){
  const contractor=document.getElementById('dueContr')?.value?.trim();
  const amount=parseFloat(document.getElementById('dueAmt')?.value);
  const description=document.getElementById('dueDesc')?.value?.trim();
  const due_date=document.getElementById('dueDate')?.value?.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    const res=await sb('contractor_dues','POST',{
      project_id:curPid,
      contractor,
      amount,
      description:description||null,
      due_date:due_date||null,
      status:'unpaid',
      created_by:uid
    });
    _duesList.unshift(res[0]);
    notify('✅ تم الإضافة','ok');
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleDue(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _duesList=_duesList.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  DUES SCREEN (شاشة المستحقات الشاملة)
// ══════════════════════════════════════════
let _allDues=[];
let _duesFilter='all';

function goToNotes(){showScreen('notes');}

// ══════════════════════════════════════════
//  NOTES SCREEN
// ══════════════════════════════════════════
let _notesFilter='all';
const _noteColors=[
  {bg:'#E8F5E9',txt:'#1D6A3E',lbl:'عمل'},
  {bg:'#FFF8E1',txt:'#854F0B',lbl:'متابعة'},
  {bg:'#E3F2FD',txt:'#0C447C',lbl:'مالي'},
  {bg:'#FCE4EC',txt:'#72243E',lbl:'عاجل'},
];

function loadNotesScreen(){
  const dateEl=document.getElementById('notesScreenDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  loadNotes().then(()=>renderNotesScreen());
}

function renderNotesScreen(){
  const undone=_notesList.filter(n=>!n.done).length;
  const done=_notesList.filter(n=>n.done).length;
  const stats=document.getElementById('notesScreenStats');
  if(stats)stats.innerHTML=`
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#1D3C2A">${_notesList.length}</div>
      <div style="font-size:11px;color:var(--text-hint)">إجمالي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#C86060">${undone}</div>
      <div style="font-size:11px;color:var(--text-hint)">متبقي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#1D6A3E">${done}</div>
      <div style="font-size:11px;color:var(--text-hint)">منتهي</div>
    </div>`;

  const el=document.getElementById('notesScreenList');
  if(!el)return;
  const list=_notesFilter==='all'?_notesList:_notesFilter==='done'?_notesList.filter(n=>n.done):_notesList.filter(n=>!n.done);
  if(!list.length){el.innerHTML='<div class="emp">لا توجد ملاحظات</div>';return;}
  el.innerHTML=list.map((n,i)=>{
    const c=_noteColors[i%_noteColors.length];
    return`<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;margin-bottom:8px;border:0.5px solid var(--border-color);background:var(--bg-pure);transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='var(--bg-pure)'">
      <div onclick="toggleNoteScreen('${n.id}',${!n.done})" style="width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:12px">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span style="font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;background:${c.bg};color:${c.txt}">${c.lbl}</span>
      ${!n.done?`<span onclick="toggleNoteScreen('${n.id}',true)" style="font-size:11px;color:#1D6A3E;cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid #1D6A3E">✅ إنجاز</span>`:'<span style="font-size:11px;color:var(--text-hint);padding:3px 8px">منتهي</span>'}
      <span onclick="deleteNoteScreen('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`;
  }).join('');
}

function setNotesFilter(f,btn){
  _notesFilter=f;
  ['nfAll','nfUndone','nfDone'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.style.background='';b.style.color='';}
  });
  btn.style.background='var(--primary)';btn.style.color='#fff';
  renderNotesScreen();
}

async function addNoteFromScreen(){
  const input=document.getElementById('notesScreenInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNoteScreen(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNoteScreen(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  NOTES / TODO
// ══════════════════════════════════════════
let _notesList=[];

async function loadNotes(){
  try{
    _notesList=await sb('notes?user_id=eq.'+uid+'&order=created_at.desc');
    renderNotes();
  }catch(e){const el=document.getElementById('notesList');if(el)el.innerHTML='<div class="d-empty">—</div>';}
}

function renderNotes(){
  const el=document.getElementById('notesList');
  if(!el)return;
  const cnt=document.getElementById('notesCount');
  const undone=_notesList.filter(n=>!n.done).length;
  if(cnt)cnt.textContent=undone?`${undone} متبقي`:'✅ كل شيء تمام';
  if(!_notesList.length){el.innerHTML='<div class="d-empty">لا توجد ملاحظات بعد</div>';return;}
  el.innerHTML=_notesList.map(n=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:4px;transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='transparent'">
      <div onclick="toggleNote('${n.id}',${!n.done})" style="width:18px;height:18px;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:11px;transition:all .15s">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span onclick="deleteNote('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`).join('');
}

async function addNote(){
  const input=document.getElementById('noteInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNote(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNote(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function duesExportPDF(){
  notify('⏳ جاري التحضير...','ok');
  let dues=[];
  try{
    const res=await sb('contractor_dues?order=created_at.desc&limit=1000');
    dues=res||[];
    notify('✅ جاب '+dues.length+' مستحق','ok');
  }catch(e){notify('❌ خطأ: '+e.message,'er');return;}
  if(!dues.length){notify('لا توجد مستحقات في الجدول','warn');return;}
  _allDues=dues;
  const unpaid=_allDues.filter(d=>d.status==='unpaid');
  const paid=_allDues.filter(d=>d.status==='paid');
  const totalUnpaid=unpaid.reduce((s,d)=>s+d.amount,0);
  const totalPaid=paid.reduce((s,d)=>s+d.amount,0);
  const total=totalUnpaid+totalPaid;
  const html=_pdfOpen('مستحقات المقاولين')+
    _pdfHeader('💰 مستحقات المقاولين','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المستحقات</div><div class="kpi-val">▼ ${fn(total)} ج</div></div>
      <div class="kpi kpi-net-neg"><div class="kpi-lbl">غير مدفوع</div><div class="kpi-val">▼ ${fn(totalUnpaid)} ج</div></div>
      <div class="kpi kpi-net-pos"><div class="kpi-lbl">مدفوع</div><div class="kpi-val">✅ ${fn(totalPaid)} ج</div></div>
    </div>
    <div class="sec-ttl">📋 تفاصيل المستحقات</div>
    <table>
      <thead><tr><th>#</th><th>المقاول</th><th>المشروع</th><th>البيان</th><th>التاريخ</th><th>الحالة</th><th>المبلغ</th></tr></thead>
      <tbody>${_allDues.map((d,i)=>{
        const proj=allProjectsMap[d.project_id];
        const isPaid=d.status==='paid';
        return`<tr><td class="rep-table-num">${i+1}</td><td>${d.contractor}</td><td>${proj?.name||'—'}</td><td>${d.description||'—'}</td><td>${d.due_date||'—'}</td><td style="color:${isPaid?'#1D6A3E':'#C86060'};font-weight:700">${isPaid?'✅ مدفوع':'⏳ غير مدفوع'}</td><td class="amt ${isPaid?'pos':'neg'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</td></tr>`;
      }).join('')}</tbody>
      <tfoot><tr><td colspan="6">إجمالي المستحقات</td><td class="amt neg">▼ ${fn(total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function duesExportExcel(){try{
  if(!_allDues||!_allDues.length){
    _allDues=await sb('contractor_dues?order=created_at.desc');
    if(!_allDues||!_allDues.length){notify('لا توجد بيانات','warn');return;}
  }
  if(!window.ExcelJS){const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r);}
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);
  const total=unpaid+paid;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('مستحقات المقاولين',{views:[{rightToLeft:true}]});
  const COLS=7;ws.columns=[{width:8},{width:22},{width:20},{width:25},{width:16},{width:16},{width:18}];
  _xlHeader(ws,'💰 مستحقات المقاولين','إجمالي: '+fn(total)+' ج  |  غير مدفوع: '+fn(unpaid)+' ج  |  مدفوع: '+fn(paid)+' ج',COLS);
  _xlHdrRow(ws,['#','المقاول','المشروع','البيان','التاريخ','الحالة','المبلغ (ج)'],COLS);
  _allDues.forEach((d,i)=>{
    const proj=allProjectsMap[d.project_id];
    const isPaid=d.status==='paid';
    _xlDataRow(ws,[i+1,d.contractor,proj?.name||'—',d.description||'—',d.due_date||'—',isPaid?'✅ مدفوع':'⏳ غير مدفوع',d.amount],i,[null,null,null,null,null,null,isPaid?_XC.PS:_XC.RD]);
  });
  _xlTotRow(ws,['','','','','','إجمالي',total],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='مستحقات_المقاولين_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

async function loadDuesScreen(){
  const sel=document.getElementById('duesProjectFilter');
  if(sel&&allProjects.length){
    sel.innerHTML='<option value="all">كل المشاريع</option>';
    allProjects.forEach(p=>{
      sel.innerHTML+=`<option value="${p.id}">${p.name}</option>`;
    });
  }
  // إخفاء النتائج والأزرار في البداية
  _allDues=[];
  document.getElementById('duesScreenList').innerHTML='';
  document.getElementById('duesScreenKpi').innerHTML='';
  const filtersEl=document.getElementById('duesScreenFilters');
  if(filtersEl)filtersEl.style.display='none';
  document.getElementById('duesScreenSub').textContent='اختار مشروع واضغط بحث';
}

async function searchDues(){
  const projId=document.getElementById('duesProjectFilter')?.value;
  document.getElementById('duesScreenList').innerHTML='<div class="emp">⏳ جاري البحث...</div>';
  notify('⏳ جاري البحث...','ok');
  try{
    let query='contractor_dues?order=created_at.desc&limit=1000';
    if(projId&&projId!=='all') query+=`&project_id=eq.${projId}`;
    _allDues=await sb(query);
    _duesFilter='all';
    // إظهار أزرار الفلتر
    const filtersEl=document.getElementById('duesScreenFilters');
    if(filtersEl)filtersEl.style.display='flex';
    renderDuesScreen();
  }catch(e){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">❌ خطأ في البحث</div>';
  }
}

function filterDuesScreen(f){
  _duesFilter=f;
  ['all','unpaid','paid'].forEach(x=>{
    const btn=document.getElementById('duesFilter'+x.charAt(0).toUpperCase()+x.slice(1));
    if(btn){btn.style.background=x===f?'var(--primary)':'';btn.style.color=x===f?'#fff':'';}
  });
  renderDuesScreen();
}

function renderDuesScreen(){
  const filtered=_duesFilter==='all'?_allDues:_allDues.filter(d=>d.status===_duesFilter);
  const total=_allDues.reduce((s,d)=>s+d.amount,0);
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  document.getElementById('duesScreenSub').textContent=`${_allDues.length} مستحق`;
  document.getElementById('duesScreenKpi').innerHTML=`
    <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>`;

  if(!filtered.length){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">لا توجد مستحقات</div>';
    return;
  }

  const html=filtered.map(d=>{
    const isPaid=d.status==='paid';
    const proj=allProjectsMap[d.project_id];
    return `<div class="rw">
      <div class="ri">
        <div class="rd" style="font-weight:700">${d.contractor}</div>
        <div class="rm" style="color:#888;font-size:11px">${proj?.name||'—'} · ${d.description||'—'} ${d.due_date?'· '+d.due_date:''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="ra" style="color:${isPaid?'var(--success)':'var(--danger)'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</div>
        <button onclick="toggleDueFromScreen('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'var(--danger)':'var(--success)'};background:transparent;color:${isPaid?'var(--danger)':'var(--success)'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('duesScreenList').innerHTML=html;
}

async function toggleDueFromScreen(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _allDues=_allDues.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesScreen();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteDue(id){await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المستحق',msg:'هيتحذف المستحق نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  try{
    await sb('contractor_dues?id=eq.'+id,'DELETE');
    _duesList=_duesList.filter(d=>d.id!==id);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

let _editDueId=null;

function editDue(id){
  const d=_duesList.find(x=>x.id===id);
  if(!d)return;
  _editDueId=id;
  document.getElementById('dueEpContr').value=d.contractor||'';
  document.getElementById('dueEpAmt').value=d.amount||'';
  document.getElementById('dueEpDesc').value=d.description||'';
  document.getElementById('dueEpDate').value=d.due_date||'';
  const dtEl=document.getElementById('dueEpDate');
  if(dtEl)initDateInput(dtEl);
  document.getElementById('dueEp').style.display='block';
}

async function saveDueEdit(){
  if(!_editDueId)return;
  const contractor=document.getElementById('dueEpContr').value.trim();
  const amount=parseFloat(document.getElementById('dueEpAmt').value);
  const description=document.getElementById('dueEpDesc').value.trim();
  const due_date=document.getElementById('dueEpDate').value.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    await sb('contractor_dues?id=eq.'+_editDueId,'PATCH',{contractor,amount,description:description||null,due_date:due_date||null});
    _duesList=_duesList.map(x=>x.id===_editDueId?{...x,contractor,amount,description:description||null,due_date:due_date||null}:x);
    document.getElementById('dueEp').style.display='none';
    _editDueId=null;
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function editDueDate(id,currentDate){
  const newDate=prompt('التاريخ الجديد (dd/mm/yyyy):',currentDate||'');
  if(newDate===null)return;
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{due_date:newDate.trim()||null});
    _duesList=_duesList.map(d=>d.id===id?{...d,due_date:newDate.trim()||null}:d);
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

function tim(){const im=document.getElementById('im');im.style.display=im.style.display==='block'?'none':'block';sit(cT);}
function sit(t){imType=t;document.getElementById('imE').classList.toggle('on',t==='e');document.getElementById('imI').classList.toggle('on',t==='i');document.getElementById('imH').textContent=t==='e'?'الترتيب: المبلغ ⇥ البند ⇥ البيان ⇥ التاريخ ⇥ المقاول':'الترتيب: المبلغ ⇥ البيان ⇥ التاريخ';}

function triggerImport(){sit(cT);document.getElementById('xlsxFileInput').click();}

// ══════ IMPORT PREVIEW ══════
let _pendingImportEnts=null;

function showImportPreview(ents,sk){
  _pendingImportEnts=ents;
  const modal=document.getElementById('importPreviewModal');
  const sub=document.getElementById('impPreviewSub');
  const table=document.getElementById('impPreviewTable');
  if(!modal)return;
  sub.textContent=ents.length+' قيد جاهز للإضافة'+(sk?' · تم تخطي '+sk+' صف':'');
  const isExp=ents[0]?.type==='e';
  const headers=isExp
    ?['#','النوع','المبلغ','البند','البيان','التاريخ','المقاول','المشروع']
    :['#','النوع','المبلغ','البيان','التاريخ','المشروع'];
  table.innerHTML=`<thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${
    ents.slice(0,100).map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const typeCell=`<td><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:${e.type==='i'?'var(--success-glow)':'var(--danger-pale)'};color:${e.type==='i'?'var(--primary-btn)':'var(--danger)'}">${e.type==='i'?'▲ وارد':'▼ مصروف'}</span></td>`;
      const amtCell=`<td class="${e.type==='i'?'td-inc':'td-exp'}">${fn(e.amount)} ج</td>`;
      if(isExp)return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${e.category||'—'}</td><td>${e.description||'—'}</td><td>${e.entry_date||'—'}</td><td>${e.contractor||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
      return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${e.description||'—'}</td><td>${e.entry_date||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
    }).join('')
  }${ents.length>100?`<tr><td colspan="${headers.length}" style="text-align:center;padding:10px;color:var(--text-hint)">... و${ents.length-100} قيد آخر</td></tr>`:''}
  </tbody>`;
  modal.style.display='flex';
}

function closeImportPreview(){
  document.getElementById('importPreviewModal').style.display='none';
  _pendingImportEnts=null;
  const inp=document.getElementById('xlsxFileInput');
  if(inp)inp.value='';
}

async function confirmImport(){
  const ents=_pendingImportEnts;
  if(!ents||!ents.length)return;
  closeImportPreview();
  setSav('💾 جاري الاستيراد ('+ents.length+' قيد)...','ng');
  try{
    if(uRole==='admin'){
      const last=await sb('entries?select=entry_no&order=entry_no.desc&limit=1');
      let nextSeq=(last&&last.length?Number(last[0].entry_no||20260000):20260000);
      if(nextSeq<20260000)nextSeq=20260000;
      ents.forEach(e=>{nextSeq++;e.seq=nextSeq;e.created_by=uid;});
      await sb('entries','POST',ents);
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);
      refreshProjSummary(curPid);
      setSav('✅ تم استيراد '+ents.length+' قيد','ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    document.getElementById('imT')&&(document.getElementById('imT').value='');
    document.getElementById('im').style.display='none';
    rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function importFromXlsx(input){
  const file=input.files[0];
  if(!file)return;
  setSav('⏳ جاري قراءة الملف...','ng');
  if(!window.XLSX){
    await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  }
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheetName=imType==='e'?'مصروفات':'وارد';
    const ws=wb.Sheets[sheetName]||wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    const dataRows=rows.slice(3).filter(r=>r[0]&&!isNaN(parseFloat(String(r[0]).replace(/,/g,''))));
    if(!dataRows.length){setSav('⚠️ لا توجد بيانات في الملف','er');input.value='';return;}
    const ents=[];let sk=0;
    const projMap={};allProjects.forEach(p=>{projMap[p.name.trim().toLowerCase()]=p.id;});
    dataRows.forEach(r=>{
      const am=parseFloat(String(r[0]).replace(/,/g,''));
      if(isNaN(am)||am===0){sk++;return;}
      let dt='';
      if(r[3]){
        if(typeof r[3]==='number'){const d=XLSX.SSF.parse_date_code(r[3]);dt=`${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}`;}
        else{dt=String(r[3]).trim();}
      }
      let pid=curPid;
      if(r[5]){const pn=String(r[5]).trim().toLowerCase();if(projMap[pn])pid=projMap[pn];}
      if(imType==='e'){
        if(!r[1]){sk++;return;}
        ents.push({id:uid_(),project_id:pid,type:'e',amount:am,category:String(r[1]).trim(),description:String(r[2]||'').trim(),entry_date:pimd(dt)||dt,contractor:String(r[4]||'').trim()});
      }else{
        ents.push({id:uid_(),project_id:pid,type:'i',amount:am,description:String(r[1]||'دفعة').trim(),entry_date:pimd(dt)||dt,category:'',contractor:''});
      }
    });
    if(!ents.length){setSav('⚠️ لم يتم التعرف على أي قيد','er');input.value='';return;}
    input.value='';
    setSav('','ok');
    showImportPreview(ents,sk);
  }catch(e){setSav('❌ '+friendlyError(e),'er');input.value='';}
}


function rp(){
  // Rebuild sidebar project list
  const sc=document.getElementById('sb-proj-list');if(sc)sc.innerHTML='';
  buildSidebarProjects();
  const p=curP();
  const ps=document.getElementById('ps');ps.innerHTML='';
  if(!projects.length){ps.innerHTML='<option>لا توجد مشاريع</option>';document.getElementById('ent').innerHTML='<div class="emp">لا توجد مشاريع</div>';return;}
  projects.forEach(pr=>{const o=document.createElement('option');o.value=pr.id;o.textContent=pr.name;if(pr.id===curPid)o.selected=true;ps.appendChild(o);});
  if(p){document.getElementById('dst').value=p.start_date||'';document.getElementById('dcl').value=p.close_date||'';}
  const inc=pInc().reduce((s,e)=>s+e.amount,0),exp=pExp().reduce((s,e)=>s+e.amount,0),bal=inc-exp;
  (document.getElementById('kp')||{}).innerHTML='<div class="kc"><div class="kl">الوارد</div><div class="kv" style="color:#185FA5">'+fn(inc)+'</div></div><div class="kc"><div class="kl">المصروف</div><div class="kv" style="color:#922B21">'+fn(exp)+'</div></div><div class="kc"><div class="kl">'+(bal<0?'⚠ عجز':'✅ الرصيد')+'</div><div class="kv" style="color:'+(bal<0?'var(--danger)':'var(--primary-btn)')+'">'+fn(bal)+'</div></div>';
  // Old datalist (hidden but kept for compatibility)
  const _cl=document.getElementById('cl');if(_cl)_cl.innerHTML=[...new Set(pExp().map(e=>e.category))].filter(x=>x).map(c=>'<option value="'+c+'">').join('');
  // Refresh categories list with project categories
  const projCats=[...new Set(pExp().map(e=>e.category).filter(Boolean))];
  projCats.forEach(c=>{if(!allCategories.includes(c))allCategories.push(c);});
  allCategories.sort();
  renderCatOpts('');
  const _ql=document.getElementById('ql');if(_ql)_ql.innerHTML=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x).map(q=>'<option value="'+q+'">').join('');
  const cs=[...new Set(pExp().map(e=>e.category))].filter(x=>x);
  const mqs=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x);
  const tot=entries.length;
  const tabs=[['s','ملخص',0,''],['j','📒 يومية',tot,'jr'],['m','👷 مقاولين',mqs.length,'mq'],['dues','💰 مستحقات',0,''],['i','الوارد',pInc().length,'']];
  cs.forEach(c=>tabs.push([c,c,pExp().filter(e=>e.category===c).length,'']));
  (document.getElementById('tbs')||{}).innerHTML=tabs.map(t=>'<button class="tab'+(t[0]===cTab?' on':'')+(t[3]?' '+t[3]:'')+'" onclick="stab(\''+t[0].replace(/'/g,"\\'")+'\')">'+t[1]+(t[2]>0?'<span class="c">'+t[2]+'</span>':'')+'</button>').join('');
  re();
}
function re(){
  const el=document.getElementById('ent');
  const canEdit=uRole!=='viewer'&&uRole!=='owner';
  if(cTab==='s'){const cs={};pExp().forEach(e=>{cs[e.category]=(cs[e.category]||0)+e.amount;});const ls=Object.entries(cs).sort((a,b)=>b[1]-a[1]);const tt=ls.reduce((s,c)=>s+c[1],0);el.innerHTML=ls.length?ls.map(([c,a])=>'<div class="rw"><div class="ri"><div class="rd">'+c+'</div><div class="rm">'+(tt?((a/tt)*100).toFixed(1):0)+'%</div></div><div class="ra">'+fn(a)+' ج</div></div>').join(''):'<div class="emp">لا توجد بيانات</div>';return;}
  if(cTab==='j'){const flt=getFilteredEntries();const j=flt?[...flt].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)):gJ();if(!j.length){el.innerHTML='<div class="emp">لا توجد قيود'+(flt?' للفلتر الحالي':' بعد')+'</div>';return;}
    const PAGE=60;const totalPages=Math.ceil(j.length/PAGE);
    const cp=window._rpPage||0;const start=cp*PAGE;const slice=j.slice(start,start+PAGE);
    const pager=totalPages>1?`<div class="pg-bar">${cp>0?`<button class="pg-btn" onclick="window._rpPage=${cp-1};re()">‹ السابق</button>`:''}
      <span class="pg-info">صفحة ${cp+1} / ${totalPages} (${j.length} قيد)</span>
      ${cp<totalPages-1?`<button class="pg-btn" onclick="window._rpPage=${cp+1};re()">التالي ›</button>`:''}</div>`:'';
    el.innerHTML=pager+slice.map(e=>{const ii=e.type==='i';const mq=e.contractor?'<span class="qb">'+e.contractor+'</span>':'';const ab=e.advance_id?'<span class="ab-badge">عهدة</span>':'';const no='<span class="nb">#'+(e.entry_no||'?')+'</span>';const del=canEdit?'<button class="db" onclick="event.stopPropagation();de(\''+e.id+'\')">🗑</button>':'';return '<div class="rw mob-card'+(canEdit?' clk':'')+'" data-eid="'+e.id+'" onclick="oe(\''+e.id+'\')"><div class="ri"><div class="rd">'+ab+mq+(e.description||'—')+no+'</div><div class="rm">'+cleanDate(e.entry_date)+' · '+(ii?'وارد':e.category||'—')+'</div></div><div class="mob-card-foot flex-center-gap"><div class="mob-card-nums"><div class="ra '+(ii?'pos':'neg')+'">'+(ii?'+':'-')+fn(Math.abs(e.amount))+' ج</div><div class="jb '+(e.bal<0?'neg':e.bal>0?'pos':'')+'">رصيد: '+fn(e.bal)+' ج</div></div>'+del+'</div></div>';}).join('')+pager;return;}
  if(cTab==='m'){
    const mqMap={};
    pExp().filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={n:e.contractor,pay:0,work:0,mat:0,other:0,rows:[]};
      const m=mqMap[e.contractor];
      if(e.entry_type==='payment')m.pay+=e.amount;
      else if(e.entry_type==='work')m.work+=e.amount;
      else if(e.entry_type==='material')m.mat+=e.amount;
      else m.other+=e.amount;
      m.rows.push(e);
    });
    const mqs=Object.values(mqMap).sort((a,b)=>(b.pay+b.work+b.mat+b.other)-(a.pay+a.work+a.mat+a.other));
    if(!mqs.length){el.innerHTML='<div class="emp">لا يوجد مقاولين بعد</div>';return;}
    window._mqList=mqs;
    el.innerHTML=mqs.map((m,idx)=>{
      const rem=m.pay-(m.work+m.mat);
      const hasTypes=m.rows.some(e=>e.entry_type);
      const addBtn=canEdit?`<button onclick="event.stopPropagation();mqAddByIdx(${idx})" class="mq-add-btn">+ قيد</button>`:'';
      const printBtn=`<button onclick="event.stopPropagation();mqPrintReport(${idx})" class="mq-print-btn">🖨️ تقرير</button>`;
      const rows=m.rows.sort((a,b)=>pdt(b.entry_date)-pdt(a.entry_date)).map(e=>{
        const etLbl={'payment':'\u{1F4B0} دفعة','work':'\u{1F528} أعمال','material':'\u{1F529} مصنعيات'};
        const etBg={'payment':'var(--success-pale)','work':'var(--info-bg)','material':'var(--warning-pale)'};
        const etC={'payment':'var(--primary-btn)','work':'var(--info)','material':'var(--warning-dark)'};
        const tag=e.entry_type?`<span style="background:${etBg[e.entry_type]};color:${etC[e.entry_type]};padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700">${etLbl[e.entry_type]||e.entry_type}</span>`:'';
        const del=canEdit?`<button class="db" onclick="event.stopPropagation();de('${e.id}')">\u{1F5D1}</button>`:'';
        return `<div class="rw${canEdit?' clk':''}" onclick="oe('${e.id}')"><div class="ri"><div class="rd">${tag} ${e.description||'—'} <span class="nb">#${e.entry_no||'?'}</span></div><div class="rm">${e.entry_date||'—'} · ${e.category||'—'}</div></div><div class="flex-center-gap"><div class="ra">${fn(e.amount)} ج</div>${del}</div></div>`;
      }).join('');
      const kpis=hasTypes?`<div class="mq-kpi-grid"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">${fn(m.pay)}</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">${fn(m.work)}</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">${fn(m.mat)}</div></div><div style="background:${rem>=0?'var(--success-ghost)':'var(--danger-ghost)'};border-radius:8px;padding:8px;text-align:center"><div class="lbl-sm">${rem>=0?'الباقي معاه':'مستحق عليك'}</div><div style="font-weight:900;color:${rem>=0?'var(--primary)':'var(--danger)'};font-size:13px">${fn(Math.abs(rem))}</div></div></div>`:`<div class="mq-total-row"><span style="color:var(--text-soft);font-size:12px">إجمالي المسحوب</span><span style="font-weight:700;color:#1D3C2A">${fn(m.pay+m.work+m.mat+m.other)} ج</span></div>`;
      return `<div class="mq-contractor-card"><div class="mq-card-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'"><div class="mq-card-header-inner"><span class="mq-card-name">👷 ${m.n}</span><div style="display:flex;gap:6px;align-items:center">${printBtn}${addBtn}<span class="mq-card-count">${m.rows.length} قيد ▼</span></div></div></div><div style="padding:14px 16px">${kpis}<div>${rows}</div></div></div>`;
    }).join('');
    return;
  }
  if(cTab==='dues'){loadDuesTab(el);return;}
  let es=cTab==='i'?pInc():pExp().filter(e=>e.category===cTab);
  es=[...es].sort((a,b)=>(b.entry_no||0)-(a.entry_no||0));
  if(!es.length){el.innerHTML='<div class="emp">لا توجد قيود</div>';return;}
  const hasMqTypes=es.some(e=>e.contractor&&e.entry_type);
  const etypeLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
  let html='';
  if(hasMqTypes){
    html+=`<div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="setCatView('list',this)" class="cat-view-list-btn" id="cvList">📋 القيود</button>
      <button onclick="setCatView('mq',this)" class="cat-view-mq-btn" id="cvMq">👷 المقاولين</button>
    </div><div id="catListView">`;
  }
  html+=es.map(e=>{
    const mq=e.contractor?'<span class="qb">'+e.contractor+'</span>':'';
    const ab=e.advance_id?'<span class="ab-badge">عهدة</span>':'';
    const no='<span class="nb">#'+(e.entry_no||'?')+'</span>';
    const etBg=e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':e.entry_type==='material'?'var(--warning-pale)':'';
    const etC=e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':e.entry_type==='material'?'var(--warning-dark)':'';
    const et=e.entry_type&&e.contractor?'<span class="entry-type-badge">'+(etypeLbl[e.entry_type]||'')+'</span>':'';
    const del=canEdit?'<button class="db" onclick="event.stopPropagation();de(\''+e.id+'\')">🗑</button>':'';
    return '<div class="rw'+(canEdit?' clk':'')+'" onclick="oe(\''+e.id+'\')"><div class="ri"><div class="rd">'+ab+et+mq+(e.description||'—')+no+'</div><div class="rm">'+(e.entry_date||'—')+(e.category?' · '+e.category:'')+'</div></div><div style="display:flex;align-items:center;gap:3px"><div class="ra '+(e.amount<0?'neg':'')+'" >'+fn(e.amount)+' ج</div>'+del+'</div></div>';
  }).join('');
  if(hasMqTypes){
    html+='</div><div id="catMqView" style="display:none">';
    const mqMap={};
    es.filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={pay:0,work:0,mat:0,rows:[]};
      if(e.entry_type==='payment')mqMap[e.contractor].pay+=e.amount;
      else if(e.entry_type==='work')mqMap[e.contractor].work+=e.amount;
      else if(e.entry_type==='material')mqMap[e.contractor].mat+=e.amount;
      mqMap[e.contractor].rows.push(e);
    });
    html+=Object.entries(mqMap).map(([name,d])=>{
      const rem=d.pay-(d.work+d.mat);
      const rows=d.rows.map(e=>{
        const et=etypeLbl[e.entry_type]||'—';
        const etC=e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':'var(--warning-dark)';
        const etBg=e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':'var(--warning-pale)';
        return '<div class="mq-entry-row"><span class="mq-entry-type">'+et+'</span><span style="flex:1;color:#444">'+(e.description||'—')+'</span><span style="font-weight:700;color:#555">'+fn(e.amount)+' ج</span></div>';
      }).join('');
      return '<div class="mq-grouped-card"><div class="mq-grouped-header"><span class="mq-grouped-name">👷 '+name+'</span></div><div style="padding:12px 14px"><div class="mq-grouped-kpis"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">'+fn(d.pay)+'</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">'+fn(d.work)+'</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">'+fn(d.mat)+'</div></div></div><div class="mq-grouped-balance"><span style="font-size:12px;color:#666">الباقي معاه</span><span class="mq-grouped-balance-val">'+fn(rem)+' ج</span></div>'+rows+'</div></div>';
    }).join('');
    html+='</div>';
  }
  el.innerHTML=html;
}

// ADVANCES
async function loadAdvList(){
  // Populate user selector (admin only)
  if(uRole==='admin'){
    const sel=document.getElementById('advUserSel');
    if(sel&&allChatUsers&&allChatUsers.length){
      sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
      allChatUsers.forEach(u=>{
        const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
        sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
      });
    } else if(sel){
      try{
        const users=await sb('profiles?order=name');
        sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
        users.forEach(u=>{
          const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
          sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
        });
      }catch(e){console.error(e);}
    }
  }
  try{
    const query=uRole==='viewer'
      ?'advances?user_id=eq.'+uid+'&order=created_at'
      :'advances?order=created_at';
    advances=await sb(query);
    const al=document.getElementById('advList');
    if(!advances.length){al.innerHTML='<div class="emp">لا توجد عهد بعد</div>';return;}
    // جيب الدفعات والمصروفات دفعة واحدة
    const [allInst,allE]=await Promise.all([
      sb('advance_installments?order=created_at'),
      sbAll('entries?advance_id=not.is.null')
    ]);
    al.innerHTML=advances.map(a=>{
      const totalGiven=allInst.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allE.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      const rem=totalGiven-spent;
      const pct=totalGiven>0?Math.min(100,Math.round((spent/totalGiven)*100)):0;
      const ownerUser=(allChatUsers||[]).find(u=>u.id===a.user_id);
      const ownerBadge=ownerUser&&uRole==='admin'?'<span class="adv-owner-badge">🔗 '+ownerUser.name+'</span>':'';
      const remColor=rem<0?'var(--danger)':rem===0?'var(--primary-btn)':'var(--warning-text)';
      return '<div class="adv-card" onclick="openAdv(\''+a.id+'\')"><div class="adv-card-h"><div class="adv-name">👤 '+a.person_name+ownerBadge+'</div><span class="adv-status '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'⏳ مفتوحة':'✅ مغلقة')+'</span></div>'+(a.notes?'<div class="adv-notes-text">'+a.notes+'</div>':'')+'<div class="adv-nums"><div class="adv-num"><div class="adv-num-l">العهدة</div><div class="adv-num-v" style="color:#185FA5">'+fn(totalGiven)+'</div></div><div class="adv-num"><div class="adv-num-l">صرف</div><div class="adv-num-v" style="color:#922B21">'+fn(spent)+'</div></div><div class="adv-num"><div class="adv-num-l">الباقي</div><div class="adv-num-v" style="color:'+remColor+'">'+fn(rem)+'</div></div></div><div class="adv-progress-wrap"><div class="adv-progress-bar-inner"></div></div></div>';
    }).join('');
  }catch(e){document.getElementById('advList').innerHTML='<div class="emp">❌ خطأ في التحميل</div>';}
}

async function createAdv(){
  const name=document.getElementById('advName').value.trim();
  const notes=document.getElementById('advNotes').value.trim();
  const selUser=document.getElementById('advUserSel').value||uid;
  if(!name){notify('ادخل اسم الشخص','err');return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      const a=await sb('advances','POST',{person_name:name,amount:0,notes,status:'open',user_id:selUser});
      advances.push(a[0]);
      setSav('✅ تم إضافة الشخص','ok');
    }else{
      await sb('pending_advances','POST',{type:'advance',person_name:name,notes,adv_user_id:selUser,submitted_by:uid,submitted_at:new Date().toISOString()});
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
    }
    document.getElementById('advName').value='';
    document.getElementById('advNotes').value='';
    await loadAdvList();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function openAdv(id){try{
  curAdv=advances.find(a=>a.id===id);if(!curAdv)return;
  document.getElementById('advScreen').style.display='none';
  document.getElementById('advDetail').style.display='block';
  document.getElementById('advDetName').textContent='👤 '+curAdv.person_name;
  document.getElementById('advDetNotes').textContent=curAdv.notes||'';
  const isOpen=curAdv.status==='open';
  const btn=document.getElementById('advCloseBtn');
  btn.textContent=isOpen?'✅ إغلاق العهدة':'🔓 فتح العهدة';
  btn.style.background=isOpen?'var(--primary-btn)':'var(--warning-text)';
  btn.style.color='var(--accent)';
  const isOwner=curAdv.user_id===uid;
  const canEdit=uRole!=='viewer'&&isOpen;
  const viewerCanAdd=uRole==='viewer'&&isOwner&&isOpen;
  document.getElementById('advInstDiv').style.display=canEdit?'block':'none';
  document.getElementById('advEntryFormDiv').style.display=(canEdit||viewerCanAdd)?'block':'none';
  // Viewer: lock date to today
  const dateField=document.getElementById('advEntDate');
  if(viewerCanAdd){
    const today=new Date().toISOString().split('T')[0];
    dateField.value=today;
    dateField.setAttribute('readonly','readonly');
    dateField.style.background='var(--bg-light)';
    dateField.style.color='var(--text-hint)';
    dateField.title='التاريخ ثابت - اليوم فقط';
  } else {
    dateField.removeAttribute('readonly');
    dateField.style.background='';
    dateField.style.color='';
  }
  await loadAdvDetail();
}catch(_e){notify('⚠️ خطأ في فتح العهدة','er');}}

function switchAdvTab(t){
  document.getElementById('advTabPanel-exp').style.display=t==='exp'?'block':'none';
  document.getElementById('advTabPanel-inst').style.display=t==='inst'?'block':'none';
  document.getElementById('advTab-exp').className='adv-tab '+(t==='exp'?'adv-tab-on':'adv-tab-off');
  document.getElementById('advTab-inst').className='adv-tab '+(t==='inst'?'adv-tab-on':'adv-tab-off');
}
function downloadInstallmentsReport(){downloadAdvReport('installs');}
function downloadInstallmentsPDF(){downloadAdvPDF('installs');}
function toggleAdvSection(){}
async function loadAdvDetail(silent=false){
  // Viewer يشوف الدفعات والمصاريف بس - بدون تعديل أو حذف
  const isViewer=uRole==='viewer';
  const editBtn=document.getElementById('advEditBtn');
  const delBtn=document.getElementById('advDelBtn');
  const closeBtn=document.getElementById('advCloseBtn');
  const instDiv=document.getElementById('advInstDiv');
  const linkBtn=document.getElementById('advLinkBtn');
  if(editBtn)editBtn.style.display=isViewer?'none':'';
  if(delBtn)delBtn.style.display=isViewer?'none':'';
  if(closeBtn)closeBtn.style.display=isViewer?'none':'';
  if(instDiv)instDiv.style.display=isViewer?'none':'';
  if(linkBtn)linkBtn.style.display=uRole==='admin'?'inline-block':'none';
  // Re-lock date for viewer
  if(uRole==='viewer'){
    const df=document.getElementById('advEntDate');
    if(df){
      const today=new Date().toISOString().split('T')[0];
      df.value=today;
      df.setAttribute('readonly','readonly');
      df.style.background='var(--bg-light)';
      df.style.color='var(--text-hint)';
    }
  }
  var il=document.getElementById('advInstList');
  var ae=document.getElementById('advEntries');
  var kp=document.getElementById('advDetKp');
  try{
    var advEntries=await sbAll('entries?advance_id=eq.'+curAdv.id+'&order=created_at');
    window._curAdvEntries=advEntries; // للفلتر
    // جيب القيود المنتظرة للعهدة دي
    var pendingAdvEntries=[];
    try{pendingAdvEntries=await sb('pending_entries?advance_id=eq.'+curAdv.id+'&order=submitted_at');}catch(e2){console.error(e2);}
    var installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}
    catch(e2){installs=[];}
    window._curAdvInstalls=installs;
    // قفل التعديل لو في دفعات (يعني الأدمن وافق) أو لو viewer
    if(editBtn&&uRole!=='admin'){
      if(isViewer||installs.length>0){
        editBtn.onclick=()=>showConfirm({icon:'🔒',title:'العهدة مقفولة',msg:'العهدة اتوافق عليها ومش ممكن تتعدل. تواصل مع الأدمن لو محتاج تعديل.',okLabel:'حسناً',okType:'primary',onOk:()=>{}});
        editBtn.style.opacity='0.5';
      } else {
        editBtn.onclick=()=>editAdv();
        editBtn.style.opacity='1';
      }
    }
    var totalGiven=installs.reduce((s,ii)=>s+ii.amount,0);
    var spent=advEntries.reduce((s,ee)=>s+ee.amount,0);
    var pendingSpent=pendingAdvEntries.reduce((s,ee)=>s+ee.amount,0);
    var rem=totalGiven-spent;
    var clr=rem<0?'var(--danger)':rem>0?'var(--warning-text)':'var(--primary-btn)';
    kp.innerHTML=`<div class='kc'><div class='kl'>إجمالي الدفعات</div><div class='kv' style='color:var(--info)'>${fn(totalGiven)} ج</div></div><div class='kc'><div class='kl'>صرف</div><div class='kv' style='color:var(--danger)'>${fn(spent)} ج</div></div><div class='kc'><div class='kl'>الباقي</div><div class='kv' style='color:${clr}'>${fn(rem)} ج</div></div>${pendingSpent>0?`<div class='kc'><div class='kl'>⬇️ في الانتظار</div><div class='kv' style='color:var(--warning-text)'>${fn(pendingSpent)} ج</div></div>`:''}`;
    if(installs.length===0){
      il.innerHTML=`<div class='emp'>لا توجد دفعات بعد</div>`;
    }else{
      const instHtml=installs.map(ins=>{var btns=uRole!=='viewer'?`<button style='background:none;border:1px solid #185FA5;color:#185FA5;border-radius:6px;padding:3px 7px;cursor:pointer;font-size:11px;font-family:inherit' onclick='editInstall("${ins.id}",${ins.amount},"${ins.inst_date||''}","${(ins.note||'دفعة').replace(/"/g,"'")}")'>✏️</button><button class='db' onclick='delInstall("${ins.id}")'>🗑</button>`:'';return `<div class='rw'><div class='ri'><div class='rd'>${ins.note||'دفعة'}</div><div class='rm'>${ins.inst_date||'&mdash;'}</div></div><div style='display:flex;align-items:center;gap:4px'><div class='ra pos'>+${fn(ins.amount)} ج</div>${btns}</div></div>`;}).join('');
      il.innerHTML=instHtml;
    }
    if(advEntries.length===0&&pendingAdvEntries.length===0){
      ae.innerHTML=`<div class='emp'>لا توجد مصروفات بعد</div>`;
    }else{
      var projMap={};
      allProjects.forEach(p=>{projMap[p.id]=p.name;});
      const approvedHtml=advEntries.map(e2=>{var pName=projMap[e2.project_id]||'&mdash;';var mq=e2.contractor?`<span class='qb'>${e2.contractor}</span>`:'';var isAdvLocked=uRole!=='admin'&&installs.length>0;var canEditAdv=!isAdvLocked&&(uRole==='admin'||uRole==='editor'||(curAdv.user_id===uid));var db2=isAdvLocked&&uRole!=='admin'?`<button class="db" onclick="notify('العهدة مقفولة — تواصل مع الأدمن','warn')" style="opacity:.5;cursor:not-allowed">🔒</button>`:canEditAdv?`<button class='db' onclick='editAdvEntry("${e2.id}")' style='color:var(--primary)'>✏️</button><button class='db' onclick='delAdvEntry("${e2.id}")'>🗑</button>`:'';var seqBadge=e2.seq?`<span class='nb'>#${e2.seq}</span>`:'';return `<div class='rw'><div class='ri'><div class='rd'>${seqBadge}${mq}${e2.description||'&mdash;'}</div><div class='rm'>${pName} &middot; ${e2.category} &middot; ${cleanDate(e2.entry_date)}</div></div><div style='display:flex;align-items:center;gap:3px'><div class='ra neg'>${fn(e2.amount)} ج</div>${db2}</div></div>`;}).join('');
      const pendingHtml=pendingAdvEntries.map(e2=>{var pName=projMap[e2.project_id]||'&mdash;';return `<div class='rw' style='opacity:.75;border:1px dashed #C9A84C;background:var(--warning-ghost)'><div class='ri'><div class='rd'>⏳ ${e2.description||'&mdash;'} <span style='font-size:10px;color:var(--warning-text);background:var(--warning-bg);padding:1px 6px;border-radius:8px'>في الانتظار</span></div><div class='rm'>${pName} &middot; ${e2.category||'&mdash;'} &middot; ${cleanDate(e2.entry_date)}</div></div><div style='display:flex;align-items:center'><div class='ra neg' style='color:var(--warning-text)'>${fn(e2.amount)} ج</div></div></div>`;}).join('');
      const totalEntries=advEntries.length+pendingAdvEntries.length;
      ae.innerHTML=approvedHtml+pendingHtml;
    }
  }catch(e){
    il.innerHTML=`<div class='emp'>لا توجد دفعات بعد</div>`;
    ae.innerHTML=`<div class='emp'>لا توجد مصروفات بعد</div>`;
  }
}

async function addAdvEntry(){
  const pid=document.getElementById('advProjSel').value;
  const cat=document.getElementById('advCat').value.trim();
  const desc=document.getElementById('advDesc').value.trim();
  const amt=parseFloat(document.getElementById('advEntAmt').value);
  const dt=fd(document.getElementById('advEntDate').value);
  const mq=document.getElementById('advMq').value.trim();
  if(!pid){notify('اختار المشروع','warn');return;}
  if(!cat){notify('ادخل البند','err');return;}
  if(isNaN(amt)||amt<=0){notify('ادخل مبلغ صحيح','err');return;}
  // ── تحذير تجاوز العهدة ──
  try{
    const [freshInstalls,freshEntries]=await Promise.all([
      sb('advance_installments?advance_id=eq.'+curAdv.id+'&select=amount'),
      sb('entries?advance_id=eq.'+curAdv.id+'&select=amount')
    ]);
    const _totalGiven=(freshInstalls||[]).reduce((s,i)=>s+i.amount,0);
    const _spent=(freshEntries||[]).reduce((s,e)=>s+e.amount,0);
    const _remAfter=_totalGiven-_spent-amt;
    if(_remAfter<0){
      const over=fn(Math.abs(_remAfter));
      const ok=await new Promise(res=>showConfirm({icon:'⚠️',title:'تجاوز العهدة',msg:'المصروف هيتجاوز العهدة بـ '+over+' ج. العجز بعد الصرف: '+over+' ج. هل تريد الإكمال؟',okLabel:'إكمال',okType:'warning',onOk:()=>res(true)}));
      if(!ok)return;
    }
  }catch(e2){console.error(e2);}
  const advMaxSeq=allEntries.reduce((mx,e)=>Math.max(mx,e.entry_no||20260000),20260000);
  const advNextSeq=advMaxSeq<20260000?20260001:advMaxSeq+1;
  const entry={id:uid_(),project_id:pid,type:'e',amount:amt,description:desc,entry_date:dt,category:cat,contractor:mq,advance_id:curAdv.id,seq:advNextSeq,created_by:uid};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      setSav('✅ تم الحفظ','ok');
      markNewAdvEntry(curAdv.id, amt, cat, desc);
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
    }
    document.getElementById('advCat').value='';
    document.getElementById('advDesc').value='';
    document.getElementById('advEntAmt').value='';
    document.getElementById('advMq').value='';
    await loadAdvDetail();
    if(curPid===pid)await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

var editingAdvEntryId=null;
function editAdvEntry(id){
  editingAdvEntryId=id;
  sb('entries?id=eq.'+id).then(res=>{
    if(!res||!res.length)return;
    var e=res[0];
    document.getElementById('advEpT').textContent='تعديل المصروف #'+(e.entry_no||'?');
    // ملي قائمة المشاريع
    const sel=document.getElementById('advEPrj');
    sel.innerHTML=allProjects.map(p=>`<option value="${p.id}"${p.id===e.project_id?' selected':''}>${p.name}</option>`).join('');
    document.getElementById('advEA').value=e.amount;
    document.getElementById('advEC').value=e.category||'';
    document.getElementById('advED').value=e.description||'';
    document.getElementById('advEM').value=e.contractor||'';
    if(e.entry_date&&e.entry_date!=='—'){var p=e.entry_date.split('/');if(p.length===3)document.getElementById('advEDt').value=p[2]+'-'+p[1]+'-'+p[0];}
    else document.getElementById('advEDt').value='';
    document.getElementById('advEp').style.display='block';
    document.getElementById('advEp').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
}
function cancelAdvEdit(){
  document.getElementById('advEp').style.display='none';
  editingAdvEntryId=null;
}
async function saveAdvEntry(){
  if(!editingAdvEntryId)return;
  var a=parseFloat(document.getElementById('advEA').value);
  if(isNaN(a)){notify('ادخل المبلغ','err');return;}
  var newPid=document.getElementById('advEPrj').value;
  var upd={amount:a,description:document.getElementById('advED').value.trim(),entry_date:fd(document.getElementById('advEDt').value),category:document.getElementById('advEC').value.trim(),contractor:document.getElementById('advEM').value.trim()};
  if(newPid)upd.project_id=newPid;
  setSav('جاري الحفظ...','ng');
  try{
    await sb('entries?id=eq.'+editingAdvEntryId,'PATCH',upd);
    setSav('تم التعديل','ok');
    cancelAdvEdit();
    await loadAdvDetail();
    if(curPid&&(curPid===newPid||!newPid))await loadEntries();
  }catch(e){setSav('خطأ: '+e.message,'er');}
}

async function delAdvEntry(id){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المصروف',msg:'هيتحذف المصروف نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{await sb('entries?id=eq.'+id,'DELETE');setSav('✅ تم الحذف','ok');await loadAdvDetail();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function toggleAdvIm(){const im=document.getElementById('advIm');im.style.display=im.style.display==='block'?'none':'block';}

async function doAdvIm(){
  const txt=document.getElementById('advImT').value.trim();if(!txt){notify('الصق البيانات أولاً','warn');return;}
  const ents=[];let sk=0;
  const projMap={};allProjects.forEach(p=>{projMap[p.name.trim().toLowerCase()]=p.id;});
  const projSeqs={};
  txt.split('\n').filter(l=>l.trim()).forEach(l=>{
    const ps=l.split('\t').map(x=>x.trim());
    if(ps.length<4){sk++;return;}
    const pName=ps[0].toLowerCase();const cat=ps[1];const desc=ps[2];const amt=parseFloat(ps[3].replace(/,/g,''));
    if(isNaN(amt)){sk++;return;}
    const pid=projMap[pName];
    if(!pid){sk++;return;}
    if(!projSeqs[pid])projSeqs[pid]=0;
    projSeqs[pid]++;
    const e={id:uid_(),project_id:pid,type:'e',amount:amt,description:desc||'',entry_date:pimd(ps[4]||''),category:cat,contractor:ps[5]||'',seq:projSeqs[pid],advance_id:curAdv.id};
    ents.push(e);
  });
  if(!ents.length){notify('لم يتم استيراد أي قيد — تأكد من اسم المشروع صح','warn');return;}
  setSav('💾 جاري الاستيراد...','ng');
  try{
    if(uRole==='admin'){
      const pids=[...new Set(ents.map(e=>e.project_id))];
      const seqBase={};
      await Promise.all(pids.map(async pid=>{
        try{const r=await sb('entries?project_id=eq.'+pid+'&select=entry_no&order=entry_no.desc&limit=1');seqBase[pid]=r.length?(r[0].entry_no||0):0;}
        catch(e){seqBase[pid]=0;}
      }));
      const counter={};
      ents.forEach(e=>{
        if(!counter[e.project_id])counter[e.project_id]=seqBase[e.project_id]||0;
        counter[e.project_id]++;
        e.seq=counter[e.project_id];
      });
      await sb('entries','POST',ents);
      setSav('✅ تم استيراد '+ents.length+' قيد'+(sk?' (تخطي '+sk+')':''),'ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    document.getElementById('advImT').value='';
    document.getElementById('advIm').style.display='none';
    await loadAdvDetail();
    await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}


async function addInstallment(){
  const amt=parseFloat(document.getElementById('advInstAmt').value);
  const dt=fd(document.getElementById('advInstDate').value);
  const note=document.getElementById('advInstNote').value.trim();
  if(isNaN(amt)||amt<=0){notify('ادخل المبلغ','err');return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('advance_installments','POST',{advance_id:curAdv.id,amount:amt,inst_date:dt,note:note||'دفعة'});
      setSav('✅ تم إضافة الدفعة','ok');
    }else{
      await sb('pending_advances','POST',{type:'installment',advance_id:curAdv.id,amount:amt,inst_date:dt,inst_note:note||'دفعة',submitted_by:uid,submitted_at:new Date().toISOString()});
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
    }
    document.getElementById('advInstAmt').value='';
    document.getElementById('advInstNote').value='';
    await loadAdvDetail();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function editInstall(id,amount,date,note){
  const ex=document.getElementById('_editInstModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_editInstModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:360px;width:100%">
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:28px">✏️</div><div class="title-md">تعديل الدفعة</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="_eiAmt" type="number" placeholder="المبلغ (ج)" value="${amount}" class="inp-lg">
      <input id="_eiDate" type="text" placeholder="dd/mm/yyyy" value="${date}" maxlength="10" class="inp-lg">
      <input id="_eiNote" type="text" placeholder="ملاحظة" value="${note}" class="inp-lg">
    </div>
    <div id="_eiMsg" style="color:var(--danger);font-size:12px;min-height:18px;margin-top:6px"></div>
    <div class="modal-btns" style="margin-top:14px">
      <button onclick="saveEditInstall('${id}')" class="btn-primary">💾 حفظ</button>
      <button onclick="document.getElementById('_editInstModal').remove()" class="btn-cancel">إلغاء</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>{const el=document.getElementById('_eiDate');if(el)initDateInput(el);},100);
  setTimeout(()=>document.getElementById('_eiAmt')?.focus(),150);
}

async function saveEditInstall(id){
  const amt=parseFloat(document.getElementById('_eiAmt').value);
  const date=fd(document.getElementById('_eiDate').value.trim());
  const note=document.getElementById('_eiNote').value.trim()||'دفعة';
  const msg=document.getElementById('_eiMsg');
  if(isNaN(amt)||amt<=0){msg.textContent='❌ ادخل مبلغ صح';return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    await sb('advance_installments?id=eq.'+id,'PATCH',{amount:amt,inst_date:date,note});
    document.getElementById('_editInstModal')?.remove();
    setSav('✅ تم التعديل','ok');
    notify('✅ تم تعديل الدفعة','ok');
    await loadAdvDetail();
  }catch(e){msg.textContent='❌ '+friendlyError(e);setSav('❌ فشل التعديل','er');}
}

async function delInstall(id){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف الدفعة',msg:'هيتحذف الدفعة نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{await sb('advance_installments?id=eq.'+id,'DELETE');setSav('✅ تم الحذف','ok');await loadAdvDetail();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function editAdv(){
  if(uRole==='viewer'||(uRole!=='admin'&&advances.find(a=>a.id===curAdv.id)&&window._curAdvInstalls?.length>0)){
    showConfirm({icon:'🔒',title:'العهدة مقفولة',msg:'العهدة اتوافق عليها ومش ممكن تتعدل. تواصل مع الأدمن لو محتاج تعديل.',okLabel:'حسناً',okType:'primary',onOk:()=>{}});
    return;
  }
  const newName=prompt('اسم الشخص:',curAdv.person_name);
  if(!newName||!newName.trim())return;
  const newNotes=prompt('ملاحظات:',curAdv.notes||'');
  setSav('💾 جاري الحفظ...','ng');
  try{
    await sb('advances?id=eq.'+curAdv.id,'PATCH',{person_name:newName.trim(),notes:newNotes||''});
    curAdv.person_name=newName.trim();curAdv.notes=newNotes||'';
    document.getElementById('advDetName').textContent='👤 '+curAdv.person_name;
    document.getElementById('advDetNotes').textContent=curAdv.notes||'';
    setSav('✅ تم التعديل','ok');
    const idx=advances.findIndex(a=>a.id===curAdv.id);
    if(idx>-1){advances[idx].person_name=curAdv.person_name;advances[idx].notes=curAdv.notes;}
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function deleteAdv(){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف العهدة',msg:'هيتحذف عهدة "'+curAdv.person_name+'" مع كل الدفعات والمصروفات. متأكد؟',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{
    await sb('advance_installments?advance_id=eq.'+curAdv.id,'DELETE');
    await sb('entries?advance_id=eq.'+curAdv.id,'PATCH',{advance_id:null});
    await sb('advances?id=eq.'+curAdv.id,'DELETE');
    advances=advances.filter(a=>a.id!==curAdv.id);
    setSav('✅ تم حذف العهدة','ok');
    backToAdvList();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function toggleAdvStatus(){
  const newStatus=curAdv.status==='open'?'closed':'open';
  try{
    await sb('advances?id=eq.'+curAdv.id,'PATCH',{status:newStatus});
    curAdv.status=newStatus;
    const isOpen=newStatus==='open';
    const btn=document.getElementById('advCloseBtn');
    btn.textContent=isOpen?'✅ إغلاق العهدة':'🔓 فتح العهدة';
    btn.style.background=isOpen?'var(--primary-btn)':'var(--warning-text)';
    document.getElementById('advEntryFormDiv').style.display=isOpen&&uRole!=='viewer'?'block':'none';
    setSav('✅ تم تغيير حالة العهدة','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function backToAdvList(){
  document.getElementById('advDetail').style.display='none';
  document.getElementById('advScreen').style.display='block';
  loadAdvList();
}

// ADMIN
async function loadAdminPanel(){
  try{
    const allP=await sb('profiles?order=created_at');
    const allA=await sb('project_access');
    const allPr=await sb('projects?order=created_at');
    const ul=document.getElementById('usersList');
    if(!allP.length){ul.innerHTML='<div class="emp">لا يوجد مستخدمين بعد</div>';return;}
    ul.innerHTML=allP.map(u=>{
      const uAcc=allA.filter(a=>a.user_id===u.id).map(a=>a.project_id);
      const chips=allPr.map(p=>'<button class="pchip '+(uAcc.includes(p.id)?'on':'')+'" onclick="togAcc(\''+u.id+'\',\''+p.id+'\',this)">'+p.name+'</button>').join('');
      const isMe=u.id===uid;
      return '<div class="ucard"><div class="ucard-h"><div><div class="uname">'+u.name+'</div></div><div style="display:flex;gap:6px;align-items:center">'+(!isMe?'<button class="del-u" onclick="delUser(\''+u.id+'\',\''+u.name+'\')">حذف</button>':'')+'<select class="rsel" onchange="chRole(\''+u.id+'\',this.value)"'+(isMe?' disabled':'')+' ><option value="admin" '+(u.role==='admin'?'selected':'')+'>👑 أدمن</option><option value="editor" '+(u.role==='editor'?'selected':'')+'>✏️ محاسب</option><option value="viewer" '+(u.role==='viewer'?'selected':'')+'>👁 مشاهد</option></select></div></div><div class="admin-proj-label">المشاريع:</div><div class="pchips">'+chips+'</div></div>';
    }).join('');
  }catch(e){document.getElementById('usersList').innerHTML='<div class="emp">❌ خطأ</div>';}
}
async function addUser(){
  const id2=document.getElementById('nuUID').value.trim();
  const name=document.getElementById('nuName').value.trim();
  const role=document.getElementById('nuRole').value;
  if(!id2||!name){notify('ادخل الـ UID والاسم','err');return;}
  setSav('💾 جاري الإضافة...','ng');
  try{await sb('profiles','POST',{id:id2,name,role});setSav('✅ تم إضافة '+name,'ok');document.getElementById('nuUID').value='';document.getElementById('nuName').value='';await loadAdminPanel();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}
async function togAcc(uid2,pid,btn){const isOn=btn.classList.contains('on');try{if(isOn){await sb('project_access?user_id=eq.'+uid2+'&project_id=eq.'+pid,'DELETE');btn.classList.remove('on');}else{await sb('project_access','POST',{user_id:uid2,project_id:pid});btn.classList.add('on');}setSav('✅ تم','ok');}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function chRole(uid2,role){try{await sb('profiles?id=eq.'+uid2,'PATCH',{role});setSav('✅ تم','ok');}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function delUser(uid2,name){await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المستخدم',msg:'هيتحذف "'+name+'" نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));try{await sb('profiles?id=eq.'+uid2,'DELETE');setSav('✅ تم حذف المستخدم','ok');await loadAdminPanel();}catch(e){setSav('❌ '+friendlyError(e),'er');}}

async function pdfClient(){
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const ct=Object.entries(cm).map(([n,rs])=>({n,r:rs}));
  const ic=pInc();
  const inc=ic.reduce((s,e)=>s+e.amount,0);
  const exp=ct.reduce((s,c)=>s+c.r.reduce((ss,e)=>ss+e.amount,0),0);
  const bal=inc-exp;
  const df=bal<0;

  let catRows='';
  ct.forEach(cat=>{
    const total=cat.r.reduce((s,e)=>s+e.amount,0);
    catRows+=`<tr><td>${cat.n}</td><td class="amt neg">▼ ${fn(total)} ج</td><td>${cat.r.length} قيد</td></tr>`;
  });

  let incRows=ic.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${e.description||'دفعة'}</td>
    <td class="amt pos">▲ ${fn(e.amount)} ج</td>
  </tr>`).join('');

  let bndRows='';
  ct.forEach(cat=>{
    const total=cat.r.reduce((s,e)=>s+e.amount,0);
    bndRows+=`<div class="sec-ttl">📋 ${cat.n}</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${cat.r.map((e,i)=>`<tr>
        <td class="rep-table-num">${i+1}</td>
        <td>${cleanDate(e.entry_date)||'—'}</td>
        <td>${e.description||'—'}</td>
        <td class="amt neg">▼ ${fn(e.amount)} ج</td>
      </tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">إجمالي ${cat.n}</td><td class="amt neg">▼ ${fn(total)} ج</td></tr></tfoot>
    </table>`;
  });

  const html=_pdfOpen('نسخة العميل — '+p.name)+
    _pdfHeader('👤 نسخة العميل — '+p.name,'Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(exp)} ج</div></div>
      <div class="kpi ${df?'kpi-net-neg':'kpi-net-pos'}"><div class="kpi-lbl">${df?'⚠ عجز':'✅ الرصيد'}</div><div class="kpi-val">${df?'▼':'▲'} ${fn(Math.abs(bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📊 ملخص البنود</div>
    <table>
      <thead><tr><th>البند</th><th>الإجمالي</th><th>عدد القيود</th></tr></thead>
      <tbody>${catRows}</tbody>
      <tfoot><tr><td colspan="2">إجمالي المصروفات</td><td class="amt neg">▼ ${fn(exp)} ج</td></tr></tfoot>
    </table>
    <div class="sec-ttl">📥 حركة الوارد</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${incRows}</tbody>
      <tfoot><tr><td colspan="3">إجمالي الوارد</td><td class="amt pos">▲ ${fn(inc)} ج</td></tr></tfoot>
    </table>
    ${bndRows}`+
    _pdfFooter()+_pdfClose();

  openPrintWindow(html);
}

async function xlClient(){
  const msg=document.getElementById('emsg');
  msg.textContent='جاري تحميل المكتبة...';
  try{
    if(!xOK){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=()=>{xOK=true;res();};s.onerror=rej;document.head.appendChild(s);});}
    msg.textContent='جاري بناء الملف...';
    await bldClient();
    msg.textContent='✓ تم التحميل';
  }catch(e){msg.textContent='خطأ: '+e.message;}
}

async function bldClient(){
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const safeSheet=n=>{let s=(n||'شيت').replace(/[:\\\\/\?\*\[\]]/g,'').trim().substring(0,28);return s||'شيت';};
  const ct=Object.entries(cm).map(([n,rs])=>({n:safeSheet(n),r:rs,tr:6+rs.length,t:rs.reduce((a,e)=>a+(e.amount||0),0)}));
  const ic=pInc().map(e=>[e.entry_no||'',e.description||'دفعة',e.entry_date||'—',e.amount]);
  const IT=6+ic.length;
  const G1='1D3C2A',G2='2A5C38',G5='EDF5EE',G6='F4F8F5',B1='D4C49A',B2='E8D8B0',B3='F5EDDB',B4='FAF5EC';
  const BL='1A3A5C',LB='D6E8F7',RD='922B21',PS='1E6B3A',LP='E2F5EA',DEF='6E1C1C',LD='FAE5E5';
  const inc=ic.reduce((s,r)=>s+r[3],0),exp=ct.reduce((s,c)=>s+c.r.reduce((ss,r)=>ss+r.amount,0),0),df=(inc-exp)<0;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const F=(c,b)=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+b}};
  const T=(c,f,s,b,i)=>c.font={color:{argb:'FF'+f},size:s||10,bold:!!b,italic:!!i,name:'Calibri'};
  const A=(c,h)=>c.alignment={horizontal:h||'right',vertical:'middle',readingOrder:'rightToLeft'};
  const BD=c=>{const b={style:'thin',color:{argb:'FFD8CEB8'}};c.border={top:b,left:b,bottom:b,right:b};};
  const N=c=>c.numFmt='#,##0';
  const MC=(w,a,b)=>{try{w.mergeCells(a+':'+b);}catch(e){}};
  const bs=(w,sub,nc)=>{const lc=String.fromCharCode(64+nc);w.views=[{rightToLeft:true}];w.getRow(1).height=30;MC(w,'A1',lc+'1');const h=w.getCell('A1');h.value='Legacy Fine Touch';F(h,G1);T(h,B1,15,true);A(h,'center');w.getRow(2).height=18;MC(w,'A2',lc+'2');const t=w.getCell('A2');t.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(t,G2);T(t,B2,9,false,true);A(t,'center');w.getRow(3).height=22;MC(w,'A3',lc+'3');const s=w.getCell('A3');s.value=sub;F(s,'C8D8C0');T(s,G1,11,true);A(s,'center');w.getRow(4).height=8;MC(w,'A4',lc+'4');F(w.getCell('A4'),B4);};
  const af=(w,r,t,nc)=>{const lc=String.fromCharCode(64+nc);MC(w,'A'+r,lc+r);const f=w.getCell('A'+r);f.value=t;F(f,B3);T(f,G1,8,false,true);A(f,'center');};

  // ملخص
  const wS=wb.addWorksheet('ملخص',{tabColor:{argb:'FF'+G1}});
  wS.views=[{rightToLeft:true}];[26,20,13,18].forEach((w,i)=>wS.getColumn(i+1).width=w);
  wS.getRow(1).height=30;MC(wS,'A1','D1');const sh=wS.getCell('A1');sh.value='Legacy Fine Touch';F(sh,G1);T(sh,B1,16,true);A(sh,'center');
  wS.getRow(2).height=18;MC(wS,'A2','D2');const s2=wS.getCell('A2');s2.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(s2,G2);T(s2,B2,9,false,true);A(s2,'center');
  wS.getRow(3).height=10;MC(wS,'A3','D3');F(wS.getCell('A3'),B4);
  wS.getRow(4).height=20;['المشروع','المهندس','تاريخ البدء','تاريخ التقفيل'].forEach((v,i)=>{const c=wS.getCell(4,i+1);c.value=v;F(c,G1);T(c,B1,9,true);A(c,'center');});
  wS.getRow(5).height=26;[p.name,'م. محمد شكري',p.start_date,p.close_date].forEach((v,i)=>{const c=wS.getCell(5,i+1);c.value=v;F(c,G5);T(c,G1,11,true);A(c,'center');const b={style:'thin',color:{argb:'FFA8C8A8'}};c.border={top:b,left:b,bottom:b,right:b};});
  wS.getRow(6).height=10;MC(wS,'A6','D6');F(wS.getCell('A6'),B4);
  wS.getRow(7).height=22;MC(wS,'A7','B7');[['A7','إجمالي الوارد',BL],['C7','إجمالي المصروفات',RD],['D7',df?'⚠ عجز':'✅ الرصيد',df?DEF:PS]].forEach(x=>{const c=wS.getCell(x[0]);c.value=x[1];F(c,x[2]);T(c,'FFFFFF',9,true);A(c,'center');});
  wS.getRow(8).height=46;MC(wS,'A8','B8');
  const k8a=wS.getCell('A8');k8a.value={formula:"'الوارد'!D"+IT,result:inc};F(k8a,LB);T(k8a,BL,18,true);A(k8a,'center');k8a.numFmt='#,##0 "ج"';
  const k8c=wS.getCell('C8');k8c.value={formula:ct.length?ct.map(c=>"'"+c.n+"'!D"+c.tr).join('+'):'0',result:exp};F(k8c,'FAE5E5');T(k8c,RD,18,true);A(k8c,'center');k8c.numFmt='#,##0 "ج"';
  const k8d=wS.getCell('D8');k8d.value={formula:'A8-C8',result:inc-exp};F(k8d,df?LD:LP);T(k8d,df?DEF:PS,18,true);A(k8d,'center');k8d.numFmt='#,##0 "ج"';
  wS.getRow(9).height=10;MC(wS,'A9','D9');F(wS.getCell('A9'),B4);
  wS.getRow(10).height=28;MC(wS,'A10','D10');wS.getCell('A10').value='تفصيل المصروفات بالبنود';F(wS.getCell('A10'),G1);T(wS.getCell('A10'),B1,12,true);A(wS.getCell('A10'),'center');
  wS.getRow(11).height=22;['البند','إجمالي المصروف (ج)','النسبة %','ملاحظة'].forEach((v,i)=>{const c=wS.getCell(11,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});
  let SR=12;const CR=[];
  ct.forEach((ct2,ix)=>{wS.getRow(SR).height=21;const ca=wS.getCell('A'+SR);ca.value=ct2.n;BD(ca);T(ca,G1,10,true);A(ca,'right');if(ix%2===0)F(ca,G6);const cb=wS.getCell('B'+SR);cb.value={formula:"'"+ct2.n+"'!D"+ct2.tr,result:ct2.t};BD(cb);A(cb,'left');T(cb,G1,10,true);N(cb);if(ix%2===0)F(cb,G6);const cc=wS.getCell('C'+SR);BD(cc);A(cc,'center');T(cc,'888888',9);if(ix%2===0)F(cc,G6);BD(wS.getCell('D'+SR));if(ix%2===0)F(wS.getCell('D'+SR),G6);CR.push(SR);SR++;});
  const GR=SR;wS.getRow(SR).height=28;wS.getCell('A'+SR).value='إجمالي المصروفات';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const gb=wS.getCell('B'+SR);gb.value={formula:ct.length?'SUM(B12:B'+(SR-1)+')':'0',result:exp};F(gb,G1);T(gb,B1,11,true);A(gb,'left');N(gb);wS.getCell('C'+SR).value='100%';F(wS.getCell('C'+SR),G1);T(wS.getCell('C'+SR),B2,10,true);A(wS.getCell('C'+SR),'center');F(wS.getCell('D'+SR),G1);SR++;
  CR.forEach((rr,i)=>{const c=wS.getCell('C'+rr);c.value={formula:'B'+rr+'/$B$'+GR,result:exp?(ct[i].t/exp):0};c.numFmt='0.0%';});
  wS.getRow(SR).height=26;wS.getCell('A'+SR).value='إجمالي الوارد';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const ib2=wS.getCell('B'+SR);ib2.value={formula:"'الوارد'!D"+IT,result:inc};F(ib2,G1);T(ib2,B1,11,true);A(ib2,'left');N(ib2);F(wS.getCell('C'+SR),G1);F(wS.getCell('D'+SR),G1);const IR=SR;SR++;
  wS.getRow(SR).height=32;const BC=df?DEF:PS;wS.getCell('A'+SR).value=df?'⚠ عجز':'✅ الرصيد المتبقي';F(wS.getCell('A'+SR),BC);T(wS.getCell('A'+SR),'FFFFFF',12,true);A(wS.getCell('A'+SR),'right');const bb=wS.getCell('B'+SR);bb.value={formula:'B'+IR+'-B'+GR,result:inc-exp};F(bb,BC);T(bb,'FFFFFF',12,true);A(bb,'left');N(bb);F(wS.getCell('C'+SR),BC);F(wS.getCell('D'+SR),BC);SR+=2;
  MC(wS,'A'+SR,'D'+SR);wS.getCell('A'+SR).value='Legacy Fine Touch  |  '+p.name+'  |  م. محمد شكري  |  '+(p.close_date||'');F(wS.getCell('A'+SR),B3);T(wS.getCell('A'+SR),G1,8,false,true);A(wS.getCell('A'+SR),'center');

  // الوارد
  const wI=wb.addWorksheet('الوارد',{tabColor:{argb:'FF2A5C38'}});[8,32,16,20].forEach((w,i)=>wI.getColumn(i+1).width=w);bs(wI,'حركة الوارد  —  '+p.name,4);wI.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wI.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let ir=6;ic.forEach((row,ix)=>{wI.getRow(ir).height=21;const cs=[wI.getCell('A'+ir),wI.getCell('B'+ir),wI.getCell('C'+ir),wI.getCell('D'+ir)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],BL,10,true);ir++;});wI.getRow(ir).height=28;MC(wI,'A'+ir,'C'+ir);wI.getCell('A'+ir).value='الإجمالي';F(wI.getCell('A'+ir),G1);T(wI.getCell('A'+ir),B1,11,true);A(wI.getCell('A'+ir),'right');const iD=wI.getCell('D'+ir);iD.value={formula:ic.length?'SUM(D6:D'+(ir-1)+')':'0',result:inc};F(iD,G1);T(iD,B1,11,true);A(iD,'left');N(iD);af(wI,ir+2,'Legacy Fine Touch  |  الوارد  |  '+p.name,4);

  // البنود بدون عمود المقاول
  const TC=['1D5C3A','1E6B4A','235E3F','1A7050','2A6B45','0D5C3A','326050','254840'];
  ct.forEach((cat,idx)=>{const wc=wb.addWorksheet(cat.n,{tabColor:{argb:'FF'+TC[idx%TC.length]}});[8,36,16,20].forEach((w,i)=>wc.getColumn(i+1).width=w);bs(wc,cat.n+'  —  '+p.name,4);wc.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wc.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let cr=6;cat.r.forEach((e,ix)=>{wc.getRow(cr).height=21;const cs=[wc.getCell('A'+cr),wc.getCell('B'+cr),wc.getCell('C'+cr),wc.getCell('D'+cr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=e.entry_no||'';A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=e.description||'—';A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=e.entry_date||'—';A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=e.amount;A(cs[3],'left');N(cs[3]);T(cs[3],e.amount<0?RD:G1,10,true);cr++;});wc.getRow(cr).height=28;MC(wc,'A'+cr,'C'+cr);wc.getCell('A'+cr).value='إجمالي '+cat.n;F(wc.getCell('A'+cr),G1);T(wc.getCell('A'+cr),B1,11,true);A(wc.getCell('A'+cr),'right');const tD=wc.getCell('D'+cr);tD.value={formula:'SUM(D6:D'+(cr-1)+')',result:cat.t};F(tD,G1);T(tD,B1,11,true);A(tD,'left');N(tD);af(wc,cr+2,'Legacy Fine Touch  |  '+cat.n+'  |  '+p.name,4);});

  const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='عميل_'+p.name.replace(/\s+/g,'_')+'.xlsx';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

async function xl(){const msg=document.getElementById('emsg');
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const safeSheet=n=>{let s=(n||'شيت').replace(/[:\\\/\?\*\[\]]/g,'').trim().substring(0,28);return s||'شيت';};
  const ct=Object.entries(cm).map(([n,rs])=>({n:safeSheet(n),r:rs.map(e=>[e.entry_no||'',e.description||'—',e.entry_date||'—',e.amount,e.contractor||'']),tr:6+rs.length,t:rs.reduce((s,e)=>s+(e.amount||0),0)}));
  const ic=pInc().map(e=>[e.entry_no||'',e.description||'دفعة',e.entry_date||'—',e.amount]);
  const IT=6+ic.length,J=gJ(),M=gM();
  const G1='1D3C2A',G2='2A5C38',G5='EDF5EE',G6='F4F8F5',B1='D4C49A',B2='E8D8B0',B3='F5EDDB',B4='FAF5EC';
  const BL='1A3A5C',LB='D6E8F7',RD='922B21',PS='1E6B3A',LP='E2F5EA',DEF='6E1C1C',LD='FAE5E5',MQ='A05F1A',LM='FDE8C8';
  const inc=ic.reduce((s,r)=>s+r[3],0),exp=ct.reduce((s,c)=>s+c.r.reduce((ss,r)=>ss+r[3],0),0),df=(inc-exp)<0;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const F=(c,b)=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+b}};
  const T=(c,f,s,b,i)=>c.font={color:{argb:'FF'+f},size:s||10,bold:!!b,italic:!!i,name:'Calibri'};
  const A=(c,h)=>c.alignment={horizontal:h||'right',vertical:'middle',readingOrder:'rightToLeft'};
  const BD=c=>{const b={style:'thin',color:{argb:'FFD8CEB8'}};c.border={top:b,left:b,bottom:b,right:b};};
  const N=c=>c.numFmt='#,##0';
  const MC=(w,a,b)=>{try{w.mergeCells(a+':'+b);}catch(e){console.error(e);}};
  const bs=(w,sub,nc)=>{const lc=String.fromCharCode(64+nc);w.views=[{rightToLeft:true}];w.getRow(1).height=30;MC(w,'A1',lc+'1');const h=w.getCell('A1');h.value='Legacy Fine Touch';F(h,G1);T(h,B1,15,true);A(h,'center');w.getRow(2).height=18;MC(w,'A2',lc+'2');const t=w.getCell('A2');t.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(t,G2);T(t,B2,9,false,true);A(t,'center');w.getRow(3).height=22;MC(w,'A3',lc+'3');const s=w.getCell('A3');s.value=sub;F(s,'C8D8C0');T(s,G1,11,true);A(s,'center');w.getRow(4).height=8;MC(w,'A4',lc+'4');F(w.getCell('A4'),B4);};
  const af=(w,r,t,nc)=>{const lc=String.fromCharCode(64+nc);MC(w,'A'+r,lc+r);const f=w.getCell('A'+r);f.value=t;F(f,B3);T(f,G1,8,false,true);A(f,'center');};
  const wS=wb.addWorksheet('ملخص',{tabColor:{argb:'FF'+G1}});wS.views=[{rightToLeft:true}];[26,20,13,18].forEach((w,i)=>wS.getColumn(i+1).width=w);wS.getRow(1).height=30;MC(wS,'A1','D1');const sh=wS.getCell('A1');sh.value='Legacy Fine Touch';F(sh,G1);T(sh,B1,16,true);A(sh,'center');wS.getRow(2).height=18;MC(wS,'A2','D2');const s2=wS.getCell('A2');s2.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(s2,G2);T(s2,B2,9,false,true);A(s2,'center');wS.getRow(3).height=10;MC(wS,'A3','D3');F(wS.getCell('A3'),B4);wS.getRow(4).height=20;['المشروع','المهندس','تاريخ البدء','تاريخ التقفيل'].forEach((v,i)=>{const c=wS.getCell(4,i+1);c.value=v;F(c,G1);T(c,B1,9,true);A(c,'center');});wS.getRow(5).height=26;[p.name,'م. محمد شكري',p.start_date,p.close_date].forEach((v,i)=>{const c=wS.getCell(5,i+1);c.value=v;F(c,G5);T(c,G1,11,true);A(c,'center');const b={style:'thin',color:{argb:'FFA8C8A8'}};c.border={top:b,left:b,bottom:b,right:b};});wS.getRow(6).height=10;MC(wS,'A6','D6');F(wS.getCell('A6'),B4);wS.getRow(7).height=22;MC(wS,'A7','B7');[['A7','إجمالي الوارد',BL],['C7','إجمالي المصروفات',RD],['D7',df?'⚠ عجز':'✅ الرصيد',df?DEF:PS]].forEach(x=>{const c=wS.getCell(x[0]);c.value=x[1];F(c,x[2]);T(c,'FFFFFF',9,true);A(c,'center');});wS.getRow(8).height=46;MC(wS,'A8','B8');const eF=ct.length?ct.map(c=>"'"+c.n+"'!D"+c.tr).join('+'):'0';const k8a=wS.getCell('A8');k8a.value={formula:"'الوارد'!D"+IT,result:inc};F(k8a,LB);T(k8a,BL,18,true);A(k8a,'center');k8a.numFmt='#,##0 "ج"';const k8c=wS.getCell('C8');k8c.value={formula:eF,result:exp};F(k8c,'FAE5E5');T(k8c,RD,18,true);A(k8c,'center');k8c.numFmt='#,##0 "ج"';const k8d=wS.getCell('D8');k8d.value={formula:'A8-C8',result:inc-exp};F(k8d,df?LD:LP);T(k8d,df?DEF:PS,18,true);A(k8d,'center');k8d.numFmt='#,##0 "ج"';wS.getRow(9).height=10;MC(wS,'A9','D9');F(wS.getCell('A9'),B4);wS.getRow(10).height=28;MC(wS,'A10','D10');wS.getCell('A10').value='تفصيل المصروفات بالبنود';F(wS.getCell('A10'),G1);T(wS.getCell('A10'),B1,12,true);A(wS.getCell('A10'),'center');wS.getRow(11).height=22;['البند','إجمالي المصروف (ج)','النسبة %','ملاحظة'].forEach((v,i)=>{const c=wS.getCell(11,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let SR=12;const CR=[];ct.forEach((ct2,ix)=>{wS.getRow(SR).height=21;const ca=wS.getCell('A'+SR);ca.value=ct2.n;BD(ca);T(ca,G1,10,true);A(ca,'right');if(ix%2===0)F(ca,G6);const cb=wS.getCell('B'+SR);cb.value={formula:"'"+ct2.n+"'!D"+ct2.tr,result:ct2.t};BD(cb);A(cb,'left');T(cb,G1,10,true);N(cb);if(ix%2===0)F(cb,G6);const cc=wS.getCell('C'+SR);BD(cc);A(cc,'center');T(cc,'888888',9);if(ix%2===0)F(cc,G6);BD(wS.getCell('D'+SR));if(ix%2===0)F(wS.getCell('D'+SR),G6);CR.push(SR);SR++;});const GR=SR;wS.getRow(SR).height=28;wS.getCell('A'+SR).value='إجمالي المصروفات';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const gb=wS.getCell('B'+SR);gb.value={formula:ct.length?'SUM(B12:B'+(SR-1)+')':'0',result:exp};F(gb,G1);T(gb,B1,11,true);A(gb,'left');N(gb);wS.getCell('C'+SR).value='100%';F(wS.getCell('C'+SR),G1);T(wS.getCell('C'+SR),B2,10,true);A(wS.getCell('C'+SR),'center');F(wS.getCell('D'+SR),G1);SR++;CR.forEach((rr,i)=>{const c=wS.getCell('C'+rr);c.value={formula:'B'+rr+'/$B$'+GR,result:exp?(ct[i].t/exp):0};c.numFmt='0.0%';});wS.getRow(SR).height=26;wS.getCell('A'+SR).value='إجمالي الوارد';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const ib2=wS.getCell('B'+SR);ib2.value={formula:"'الوارد'!D"+IT,result:inc};F(ib2,G1);T(ib2,B1,11,true);A(ib2,'left');N(ib2);F(wS.getCell('C'+SR),G1);F(wS.getCell('D'+SR),G1);const IR=SR;SR++;wS.getRow(SR).height=32;const BC=df?DEF:PS;wS.getCell('A'+SR).value=df?'⚠ عجز':'✅ الرصيد المتبقي';F(wS.getCell('A'+SR),BC);T(wS.getCell('A'+SR),'FFFFFF',12,true);A(wS.getCell('A'+SR),'right');const bb=wS.getCell('B'+SR);bb.value={formula:'B'+IR+'-B'+GR,result:inc-exp};F(bb,BC);T(bb,'FFFFFF',12,true);A(bb,'left');N(bb);F(wS.getCell('C'+SR),BC);F(wS.getCell('D'+SR),BC);SR+=2;MC(wS,'A'+SR,'D'+SR);wS.getCell('A'+SR).value='Legacy Fine Touch  |  '+p.name+'  |  م. محمد شكري  |  '+(p.close_date||'');F(wS.getCell('A'+SR),B3);T(wS.getCell('A'+SR),G1,8,false,true);A(wS.getCell('A'+SR),'center');
  const wJ=wb.addWorksheet('يومية',{tabColor:{argb:'FF6B4D1A'}});[8,14,24,15,16,13,13,16].forEach((w,i)=>wJ.getColumn(i+1).width=w);bs(wJ,'دفتر اليومية  —  '+p.name,8);wJ.getRow(5).height=22;['#','التاريخ','البيان','البند','المقاول','الوارد','المصروف','الرصيد'].forEach((v,i)=>{const c=wJ.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let jr=6;J.forEach((e,ix)=>{wJ.getRow(jr).height=21;const cs=[wJ.getCell('A'+jr),wJ.getCell('B'+jr),wJ.getCell('C'+jr),wJ.getCell('D'+jr),wJ.getCell('E'+jr),wJ.getCell('F'+jr),wJ.getCell('G'+jr),wJ.getCell('H'+jr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=e.entry_no||'';A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=e.entry_date||'—';A(cs[1],'center');T(cs[1],'666666',9);cs[2].value=e.description||'—';A(cs[2],'right');T(cs[2],'1A1A1A',10);cs[3].value=e.type==='i'?'وارد':(e.category||'—');A(cs[3],'center');T(cs[3],e.type==='i'?BL:G2,9,true);cs[4].value=e.contractor||'';A(cs[4],'center');T(cs[4],MQ,9,true);if(e.contractor)F(cs[4],LM);if(e.type==='i'){cs[5].value=e.amount;T(cs[5],BL,10,true);}A(cs[5],'left');N(cs[5]);if(e.type==='e'){cs[6].value=e.amount;T(cs[6],RD,10,true);}A(cs[6],'left');N(cs[6]);cs[7].value={formula:jr===6?'F6-G6':'H'+(jr-1)+'+F'+jr+'-G'+jr,result:e.bal};A(cs[7],'left');N(cs[7]);T(cs[7],G1,10,true);F(cs[7],LP);jr++;});if(J.length){wJ.getRow(jr).height=28;MC(wJ,'A'+jr,'E'+jr);wJ.getCell('A'+jr).value='الإجمالي';F(wJ.getCell('A'+jr),G1);T(wJ.getCell('A'+jr),B1,11,true);A(wJ.getCell('A'+jr),'right');['F','G'].forEach(col=>{const c=wJ.getCell(col+jr);c.value={formula:'SUM('+col+'6:'+col+(jr-1)+')',result:col==='F'?inc:exp};F(c,G1);T(c,B1,11,true);A(c,'left');N(c);});const th=wJ.getCell('H'+jr);th.value={formula:'F'+jr+'-G'+jr,result:inc-exp};F(th,G1);T(th,B1,11,true);A(th,'left');N(th);jr++;}af(wJ,jr+1,'Legacy Fine Touch  |  يومية  |  '+p.name,8);
  if(M.length){const wM=wb.addWorksheet('المقاولين',{tabColor:{argb:'FF'+MQ}});[22,30,13,18,15].forEach((w,i)=>wM.getColumn(i+1).width=w);bs(wM,'حساب المقاولين  —  '+p.name,5);wM.getRow(5).height=22;['المقاول','البنود','عدد الدفعات','الإجمالي (ج)','آخر دفعة'].forEach((v,i)=>{const c=wM.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let mr=6;M.forEach((m,ix)=>{wM.getRow(mr).height=22;const cs=[wM.getCell('A'+mr),wM.getCell('B'+mr),wM.getCell('C'+mr),wM.getCell('D'+mr),wM.getCell('E'+mr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,LM);});cs[0].value=m.n;A(cs[0],'right');T(cs[0],MQ,11,true);cs[1].value=m.ca.join(' · ');A(cs[1],'right');T(cs[1],'444444',10);cs[2].value=m.cnt;A(cs[2],'center');cs[3].value=m.t;A(cs[3],'left');N(cs[3]);T(cs[3],G1,11,true);cs[4].value=m.last||'—';A(cs[4],'center');T(cs[4],'666666',9);mr++;});wM.getRow(mr).height=28;MC(wM,'A'+mr,'C'+mr);wM.getCell('A'+mr).value='إجمالي المسحوب';F(wM.getCell('A'+mr),G1);T(wM.getCell('A'+mr),B1,11,true);A(wM.getCell('A'+mr),'right');const md=wM.getCell('D'+mr);md.value={formula:'SUM(D6:D'+(mr-1)+')',result:M.reduce((a,b)=>a+b.t,0)};F(md,G1);T(md,B1,11,true);A(md,'left');N(md);F(wM.getCell('E'+mr),G1);af(wM,mr+2,'Legacy Fine Touch  |  المقاولين  |  '+p.name,5);}
  const wI=wb.addWorksheet('الوارد',{tabColor:{argb:'FF2A5C38'}});[8,32,16,20].forEach((w,i)=>wI.getColumn(i+1).width=w);bs(wI,'حركة الوارد  —  '+p.name,4);wI.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wI.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let ir=6;ic.forEach((row,ix)=>{wI.getRow(ir).height=21;const cs=[wI.getCell('A'+ir),wI.getCell('B'+ir),wI.getCell('C'+ir),wI.getCell('D'+ir)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],BL,10,true);ir++;});wI.getRow(ir).height=28;MC(wI,'A'+ir,'C'+ir);wI.getCell('A'+ir).value='الإجمالي';F(wI.getCell('A'+ir),G1);T(wI.getCell('A'+ir),B1,11,true);A(wI.getCell('A'+ir),'right');const iD=wI.getCell('D'+ir);iD.value={formula:ic.length?'SUM(D6:D'+(ir-1)+')':'0',result:inc};F(iD,G1);T(iD,B1,11,true);A(iD,'left');N(iD);af(wI,ir+2,'Legacy Fine Touch  |  الوارد  |  '+p.name,4);
  const TC=['1D5C3A','1E6B4A','235E3F','1A7050','2A6B45','0D5C3A','326050','254840'];
  ct.forEach((cat,idx)=>{const wc=wb.addWorksheet(cat.n,{tabColor:{argb:'FF'+TC[idx%TC.length]}});[8,32,16,18,18].forEach((w,i)=>wc.getColumn(i+1).width=w);bs(wc,cat.n+'  —  '+p.name,5);wc.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)','المقاول'].forEach((v,i)=>{const c=wc.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let cr=6;cat.r.forEach((row,ix)=>{wc.getRow(cr).height=21;const cs=[wc.getCell('A'+cr),wc.getCell('B'+cr),wc.getCell('C'+cr),wc.getCell('D'+cr),wc.getCell('E'+cr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],row[3]<0?RD:G1,10,true);cs[4].value=row[4]||'';A(cs[4],'center');T(cs[4],MQ,9,true);if(row[4])F(cs[4],LM);cr++;});wc.getRow(cr).height=28;MC(wc,'A'+cr,'C'+cr);wc.getCell('A'+cr).value='إجمالي '+cat.n;F(wc.getCell('A'+cr),G1);T(wc.getCell('A'+cr),B1,11,true);A(wc.getCell('A'+cr),'right');const tD=wc.getCell('D'+cr);tD.value={formula:'SUM(D6:D'+(cr-1)+')',result:cat.t};F(tD,G1);T(tD,B1,11,true);A(tD,'left');N(tD);F(wc.getCell('E'+cr),G1);af(wc,cr+2,'Legacy Fine Touch  |  '+cat.n+'  |  '+p.name,5);});
  const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Legacy_'+p.name.replace(/\s+/g,'_')+'.xlsx';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}




// ══════════════════════════════════════════════════
//  CATEGORY SYSTEM
// ══════════════════════════════════════════════════
let allCategories=[], catDDOpen=false;

async function loadCategories(){
  try{
    const fromDB=await sb('categories?order=name');
    const fromEnt=[...new Set(allEntries.filter(e=>e.type==='e').map(e=>e.category).filter(Boolean))];
    const combined=[...new Set([...fromDB.map(c=>c.name),...fromEnt])].sort();
    allCategories=combined;
  }catch(e){
    allCategories=[...new Set(allEntries.filter(e=>e.type==='e').map(e=>e.category).filter(Boolean))].sort();
  }
  renderCatOpts('');
}

function getProjectCats(q){
  // لو مفيش مشروع محدد، جيب من كل المشاريع
  const projEntries=curPid
    ? allEntries.filter(e=>e.project_id===curPid&&e.type==='e'&&e.category)
    : allEntries.filter(e=>e.type==='e'&&e.category);
  const freq={};
  projEntries.forEach(e=>{freq[e.category]=(freq[e.category]||0)+1;});
  let cats=Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([c,n])=>({c,n}));
  if(q)cats=cats.filter(x=>x.c.includes(q)||x.c.toLowerCase().includes(q.toLowerCase()));
  return cats;
}

function renderCatOpts(q){
  const list=document.getElementById('catList');if(!list)return;
  const cats=getProjectCats(q);
  let html='';
  if(cats.length){
    html+=cats.map(({c,n})=>`<div class="cat-opt" onclick="selectCat('${c.replace(/'/g,"\\'")}')">
      <span class="cat-icon">📂</span>
      <span style="flex:1">${c}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
  }
  // لو في نص مكتوب ومش موجود، اعرض "إضافة بند جديد"
  const typed=(document.getElementById('ic')?.value||'').trim();
  const exact=cats.some(x=>x.c===typed);
  if(typed&&!exact){
    html+=`<div class="cat-opt cat-opt-new" onclick="selectCat('${typed.replace(/'/g,"\\'")}')">
      <span class="cat-icon">➕</span>
      <span>إضافة: <b>${typed}</b></span>
    </div>`;
  }
  if(!html)html='<div class="cat-empty-msg">لا توجد بنود بعد<br><small>اكتب بند جديد وسيُضاف تلقائياً</small></div>';
  list.innerHTML=html;
}

function toggleCatDD(){
  catDDOpen=!catDDOpen;
  const dd=document.getElementById('catDD');
  if(!dd)return;
  dd.style.display=catDDOpen?'block':'none';
  document.getElementById('catArr').className='cat-arr'+(catDDOpen?' open':'');
  if(catDDOpen){
    const si=document.getElementById('catSrch');if(si){si.value='';si.focus();}
    renderCatOpts('');
  }
}

function hideCatDD(){
  catDDOpen=false;
  const dd=document.getElementById('catDD');if(dd)dd.style.display='none';
  const a=document.getElementById('catArr');if(a)a.className='cat-arr';
}

function onCatSearch(q){
  // افتح الـ dropdown تلقائي لما المستخدم يكتب
  if(!catDDOpen){
    catDDOpen=true;
    const dd=document.getElementById('catDD');
    if(dd)dd.style.display='block';
  }
  renderCatOpts(q);
}

function selectCat(name){
  document.getElementById('ic').value=name;
  hideCatDD();
  // لو بند جديد مش موجود في قاعدة البيانات، احفظه
  if(!allCategories.includes(name)){
    allCategories.push(name);
    allCategories.sort();
    sb('categories','POST',{name}).catch(()=>{});
  }
}

async function addNewCat(){
  let name=document.getElementById('ic').value.trim();
  if(!name)name=prompt('اسم البند الجديد:');
  if(!name||!name.trim())return;
  name=name.trim();
  try{
    await sb('categories','POST',{name});
  }catch(ex){console.error(ex);}
  if(!allCategories.includes(name)){allCategories.push(name);allCategories.sort();}
  selectCat(name);
  setSav('✅ تم إضافة البند: '+name,'ok');
}

// Close dropdown when clicking outside
document.addEventListener('click',function(e){
  const w=document.getElementById('catWrap');
  if(w&&!w.contains(e.target))hideCatDD();
});

// ══════════════════════════════════════════════════

function initRealtime(){
  if(!window.supabase)return;
  if(window._sbc)return; // already initialized
  try{
    window._sbc=window.supabase.createClient(SB,AK,{
      global:{headers:{'Authorization':'Bearer '+token}},
      realtime:{params:{eventsPerSecond:10}}
    });
    window._rtOk=false;
    // entries realtime
    if(_rtEntCh){_sbc.removeChannel(_rtEntCh);_rtEntCh=null;}
    _rtEntCh=_sbc.channel('entries-all')
      .on('postgres_changes',{event:'*',schema:'public',table:'entries'},async(payload)=>{
        window._rtOk=true;
        if(payload.new?.created_by===uid||payload.old?.project_id===curPid||payload.new?.project_id===curPid){
          await loadAllProjects();
          if(curPid)await loadEntries();
          if(curScreen==='dash')loadDashboard();
          else rp();
        }
      })
      .subscribe((s)=>{if(s==='SUBSCRIBED')window._rtOk=true;});
    // advances realtime
    if(_rtAdvCh){_sbc.removeChannel(_rtAdvCh);_rtAdvCh=null;}
    _rtAdvCh=_sbc.channel('advances-all')
      .on('postgres_changes',{event:'*',schema:'public',table:'advances'},async()=>{
        window._rtOk=true;
        if(curScreen==='adv')await loadAdvList();
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'advance_installments'},async()=>{
        window._rtOk=true;
        if(curScreen==='adv'&&curAdv)await loadAdvDetail(curAdv.id);
      })
      .subscribe();
  }catch(e){console.error(e);}
}

function cleanupRealtime(){
  if(!window._sbc)return;
  if(_rtEntCh){_sbc.removeChannel(_rtEntCh);_rtEntCh=null;}
  if(_rtAdvCh){_sbc.removeChannel(_rtAdvCh);_rtAdvCh=null;}
  window._rtOk=false;
}


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

// ══════════════════════════════════════════
//  DASHBOARD DATE FILTER
// ══════════════════════════════════════════
function initDashFilter(){
  const sel=document.getElementById('fProjSel');
  if(!sel)return;
  sel.innerHTML='<option value="all">كل المشاريع</option>';
  allProjects.forEach(p=>{
    sel.innerHTML+=`<option value="${p.id}">${p.name}</option>`;
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

// ══ PDF HELPER ══
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
  const w=window.open('','_blank');
  if(w){
    w.document.open();
    w.document.write(html);
    w.document.close();
  } else {
    // لو اتبلوك popup — حمّل كـ HTML file
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
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
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
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}catch(e2){console.error(e2);}
    const totalGiven=installs.reduce((s,i)=>s+i.amount,0);
    const totalSpent=entries.reduce((s,e)=>s+e.amount,0);
    const remaining=totalGiven-totalSpent;
    const sorted=[...entries].sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
    const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
    const rows=sorted.map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      return `<tr>
        <td style="text-align:center;color:#888">${i+1}</td>
        <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
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
function renderCompareReport(){
  const div=document.getElementById('repCompareResult');
  if(!div)return;
  const sort=document.getElementById('cmpSort')?.value||'bal';
  const data=allProjects.map(p=>{
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0};
    return{name:p.name,inc:s.inc||0,exp:s.exp||0,bal:s.bal||0,count:s.count||0};
  });
  data.sort((a,b)=>{
    if(sort==='bal')return b.bal-a.bal;
    if(sort==='inc')return b.inc-a.inc;
    if(sort==='exp')return b.exp-a.exp;
    return a.name.localeCompare(b.name,'ar');
  });
  const maxInc=Math.max(...data.map(d=>d.inc),1);
  const maxExp=Math.max(...data.map(d=>d.exp),1);
  const totalInc=data.reduce((s,d)=>s+d.inc,0);
  const totalExp=data.reduce((s,d)=>s+d.exp,0);
  const totalBal=totalInc-totalExp;
  div.innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
      <div class="kc"><div class="kl">إجمالي الوارد</div><div class="kv" style="color:var(--info)">${fn(totalInc)} ج</div></div>
      <div class="kc"><div class="kl">إجمالي المصروف</div><div class="kv" style="color:var(--danger)">${fn(totalExp)} ج</div></div>
      <div class="kc"><div class="kl">${totalBal>=0?'✅ الرصيد':'⚠️ عجز'}</div><div class="kv" style="color:${totalBal>=0?'var(--primary-btn)':'var(--danger)'}">${fn(totalBal)} ج</div></div>
    </div>
    ${data.map(d=>{
      const balClr=d.bal>=0?'var(--primary-btn)':'var(--danger)';
      const incPct=d.inc?Math.round(d.inc/maxInc*100):0;
      const expPct=d.exp?Math.round(d.exp/maxExp*100):0;
      return `<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <span style="font-weight:700;color:var(--accent);font-size:14px">${d.name}</span>
          <span style="font-size:12px;color:${balClr};font-weight:700">${d.bal>=0?'+':''}${fn(d.bal)} ج</span>
        </div>
        <div style="margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:3px"><span>⬆ وارد</span><span>${fn(d.inc)} ج</span></div>
          <div style="background:var(--bg-page);border-radius:4px;height:8px;overflow:hidden"><div style="background:var(--info);height:100%;width:${incPct}%;border-radius:4px;transition:width .4s"></div></div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-bottom:3px"><span>⬇ مصروف</span><span>${fn(d.exp)} ج</span></div>
          <div style="background:var(--bg-page);border-radius:4px;height:8px;overflow:hidden"><div style="background:var(--danger);height:100%;width:${expPct}%;border-radius:4px;transition:width .4s"></div></div>
        </div>
      </div>`;
    }).join('')}`;
}
function openReport(type){
  _curReport=type;
  document.getElementById('repHub').style.display='none';
  document.getElementById('repView').style.display='block';
  const titles={cash:'💰 التدفق النقدي',summary:'📋 الملخص الدوري',proj:'🏗️ تقرير المشاريع',adv:'💼 تقرير العهد',dues:'⚠️ مستحقات المقاولين',contractor:'👷 تقرير المقاول',client:'🤝 تقرير العميل',compare:'⚖️ مقارنة المشاريع'};
  document.getElementById('repViewTitle').textContent=titles[type]||'';
  ['repCashPanel','repSummaryPanel','repProjPanel','repAdvPanel','repContractorPanel','repClientPanel','repComparePanel'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display='none';
  });
  if(type==='cash'){
    document.getElementById('repCashPanel').style.display='block';
    _populateRepProjSel('rCashProj');
  } else if(type==='summary'){
    document.getElementById('repSummaryPanel').style.display='block';
    _populateRepProjSel('rSumProj');
  } else if(type==='proj'){
    document.getElementById('repProjPanel').style.display='block';
    _populateRepProjSel('rProjSel');
  } else if(type==='adv'){
    document.getElementById('repAdvPanel').style.display='block';
    _populateAdvSel();
  } else if(type==='dues'){
    showScreen('dues');
  } else if(type==='contractor'){
    document.getElementById('repContractorPanel').style.display='block';
    _populateContrSel();
    setTimeout(()=>{
      const f=document.getElementById('rContrFrom');const t=document.getElementById('rContrTo');
      if(f)initDateInput(f);if(t)initDateInput(t);
    },0);
  } else if(type==='client'){
    document.getElementById('repClientPanel').style.display='block';
    _populateRepProjSel('rClientProj');
    setTimeout(()=>{
      const f=document.getElementById('rClientFrom');const t=document.getElementById('rClientTo');
      if(f)initDateInput(f);if(t)initDateInput(t);
    },0);
  } else if(type==='compare'){
    document.getElementById('repComparePanel').style.display='block';
    renderCompareReport();
  }
}

function _populateContrSel(){
  const sel=document.getElementById('rContrSel');
  if(!sel)return;
  const contractors=[...new Set(allEntries.filter(e=>e.contractor).map(e=>e.contractor))].sort();
  sel.innerHTML='<option value="">-- اختار مقاول --</option><option value="__ALL__">📊 كل المقاولين</option>';
  contractors.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
}

function backToRepHub(){
  document.getElementById('repHub').style.display='block';
  document.getElementById('repView').style.display='none';
  _curReport=null;
}

// ── SHARED BAR CHART HELPER ──
function _renderBarChart(canvasId,labels,datasets,opts){
  _loadChartJs(()=>{
    const ctx=document.getElementById(canvasId);
    if(!ctx||!window.Chart)return;
    if(ctx._chartInst)ctx._chartInst.destroy();
    const isMob=window.innerWidth<768;
    // اختصار أسماء الشهور على الموبايل
    const shortLabels=isMob?labels.map(l=>l.replace(/يناير/,'يناير').replace(' 20','\'').replace(/([أابتثجحخدذرزسشصضطظعغفقكلمنهوي]+)\s(\d{4})/,(m,month,year)=>month+' '+year.slice(2))):labels;
    ctx._chartInst=new Chart(ctx,{
      type:'bar',
      data:{labels:shortLabels,datasets:datasets.map(d=>({...d,borderRadius:6,borderSkipped:false}))},
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{display:datasets.length>1,position:'top',labels:{color:'rgba(212,196,154,.7)',font:{size:11},boxWidth:12}},
          tooltip:{callbacks:{label:c=>`${c.dataset.label||''}: ${fn(c.parsed.y)} ج`}}
        },
        scales:{
          x:{ticks:{color:'var(--text-soft)',font:{size:isMob?9:11},maxRotation:isMob?45:30,autoSkip:true,maxTicksLimit:isMob?8:12},grid:{display:false}},
          y:{ticks:{color:'var(--text-soft)',font:{size:isMob?9:10},callback:v=>v>=1000000?(v/1000000).toFixed(1)+'م':v>=1000?(v/1000).toFixed(0)+'ك':fn(v)},grid:{color:'rgba(255,255,255,.06)'}}
        },
        ...opts
      }
    });
  });
}
function _loadChartJs(cb){
  if(window.Chart){cb();return;}
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
  s.onload=cb;
  document.head.appendChild(s);
}

function _populateRepProjSel(selId){
  const sel=document.getElementById(selId);
  if(!sel)return;
  sel.innerHTML='<option value="all">كل المشاريع</option>';
  allProjects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}

function _populateAdvSel(){
  const sel=document.getElementById('rAdvSel');
  if(!sel)return;
  const seen=new Set();
  sel.innerHTML='<option value="all">كل العهد</option>';
  // use cached advances list if available
  sb('advances?order=person_name').then(advs=>{
    (advs||[]).forEach(a=>{
      if(seen.has(a.id))return;seen.add(a.id);
      const o=document.createElement('option');o.value=a.id;o.textContent=a.person_name||'عهدة';sel.appendChild(o);
    });
  }).catch(()=>{});
}

// ── CASH FLOW ──────────────────────────────────
function _parseEntryDate(s){return parseDt(s);}

function _monthLabel(y,m){
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return (months[m]||'')+' '+y;
}

function clearCashFlow(){
  document.getElementById('rCashFrom').value='';
  document.getElementById('rCashTo').value='';
  document.getElementById('repCashResult').innerHTML='';
}

function runCashFlow(){
  const fromVal=document.getElementById('rCashFrom').value;
  const toVal=document.getElementById('rCashTo').value;
  const projId=document.getElementById('rCashProj').value;

  let ents=[...allEntries];
  if(projId!=='all')ents=ents.filter(e=>e.project_id===projId);

  const fromD=fromVal?parseDt(fromVal):null;
  const toD=toVal?(()=>{const d=parseDt(toVal);if(d)d.setHours(23,59,59,999);return d;})():null;

  ents=ents.filter(e=>{
    const d=_parseEntryDate(e.entry_date);
    if(!d||isNaN(d))return false;
    if(fromD&&d<fromD)return false;
    if(toD&&d>toD)return false;
    return true;
  });

  if(!ents.length){
    document.getElementById('repCashResult').innerHTML='<div class="rep-no-data-msg">لا توجد بيانات في هذه الفترة</div>';
    return;
  }

  // group by month
  const buckets={};
  ents.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0,exp:0};
    if(e.type==='i')buckets[k].inc+=e.amount;
    else buckets[k].exp+=e.amount;
  });

  const rows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  window._cashRows=rows;
  const maxAmt=Math.max(...rows.map(r=>Math.max(r.inc,r.exp)),1);
  const totalInc=rows.reduce((s,r)=>s+r.inc,0);
  const totalExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totalInc-totalExp;

  document.getElementById('repCashResult').innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(totalInc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(totalExp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">صافي التدفق</div><div class="cf-kpi-val" style="color:${net>=0?'var(--info-sky)':'var(--danger-soft)'}">${net>=0?'+':''}${fn(net)} ج</div></div>
    </div>
    <div class="rep-chart-wrap"><canvas id="cashChart" role="img" aria-label="مخطط التدفق النقدي الشهري"></canvas></div>
    <div class="cf-bars">
      ${rows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        const ew=Math.round(r.exp/maxAmt*100);
        const rn=r.inc-r.exp;
        return `<div class="cf-row">
          <div class="cf-row-hdr">
            <div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div>
            <div class="cf-row-net" style="color:${rn>=0?'var(--success-soft)':'var(--danger-soft)'}">${rn>=0?'+':''}${fn(rn)} ج</div>
          </div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
            <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">-${fn(r.exp)} ج</div></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;

  // Load Chart.js and render
  _renderBarChart('cashChart',
    rows.map(r=>_monthLabel(r.y,r.m)),
    [
      {label:'وارد',data:rows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'},
      {label:'مصروف',data:rows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}
    ]
  );
}

// ── PERIODIC SUMMARY ───────────────────────────
function clearSummary(){
  document.getElementById('rSumFrom').value='';
  document.getElementById('rSumTo').value='';
  document.getElementById('repSummaryResult').innerHTML='';
}

function runSummary(){
  const fromVal=document.getElementById('rSumFrom').value;
  const toVal=document.getElementById('rSumTo').value;
  const projId=document.getElementById('rSumProj').value;

  const fromD=fromVal?parseDt(fromVal):null;
  const toD=toVal?(()=>{const d=parseDt(toVal);if(d)d.setHours(23,59,59,999);return d;})():null;

  let projects=projId==='all'?allProjects:allProjects.filter(p=>p.id===projId);

  const rows=projects.map(p=>{
    let ents=allEntries.filter(e=>e.project_id===p.id);
    if(fromD)ents=ents.filter(e=>{const d=_parseEntryDate(e.entry_date);return d&&d>=fromD;});
    if(toD)ents=ents.filter(e=>{const d=_parseEntryDate(e.entry_date);return d&&d<=toD;});
    const inc=ents.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
    const exp=ents.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
    return {name:p.name,inc,exp,net:inc-exp,count:ents.length};
  }).filter(r=>r.count>0);
  window._summaryRows=rows;

  if(!rows.length){
    document.getElementById('repSummaryResult').innerHTML='<div class="rep-no-data-msg">لا توجد بيانات في هذه الفترة</div>';
    return;
  }

  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const period=(fromVal||toVal)?((fromVal?'من '+fromVal:'')+(toVal?' لحد '+toVal:'')):'كل الفترات';

  document.getElementById('repSummaryResult').innerHTML=`
    <div class="rep-period-label">${period}</div>
    <div class="cf-kpi-row" style="margin-bottom:20px">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(totInc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(totExp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">الصافي</div><div class="cf-kpi-val" style="color:${totNet>=0?'var(--info-sky)':'var(--danger-soft)'}">${totNet>=0?'+':''}${fn(totNet)} ج</div></div>
    </div>
    <div class="rep-chart-wrap"><canvas id="summaryChart" role="img" aria-label="مخطط المشاريع المقارنة"></canvas></div>
    ${rows.sort((a,b)=>b.net-a.net).map(r=>`
      <div class="sum-proj-card">
        <div class="sum-proj-name">${r.name}</div>
        <div class="sum-proj-row"><span class="sum-row-lbl">الوارد</span><span class="sum-row-val" style="color:#7DBFA0">+${fn(r.inc)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">المصاريف</span><span class="sum-row-val" style="color:#C86060">-${fn(r.exp)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">الصافي</span><span class="sum-row-val" style="color:${r.net>=0?'var(--success-soft)':'var(--danger-soft)'};font-size:15px">${r.net>=0?'+':''}${fn(r.net)} ج</span></div>
        <div class="sum-proj-row"><span class="sum-row-lbl">عدد القيود</span><span class="sum-row-val" style="color:rgba(212,196,154,.7)">${r.count} قيد</span></div>
      </div>`).join('')}`;

  _loadChartJs(()=>{
    const ctx=document.getElementById('summaryChart');
    if(!ctx||!window.Chart)return;
    if(ctx._chartInst)ctx._chartInst.destroy();
    const sorted=[...rows].sort((a,b)=>b.net-a.net);
    const shortName=n=>n.length>20?n.substring(0,20)+'…':n;
    // ارتفاع ديناميكي حسب عدد المشاريع
    const h=Math.max(260,sorted.length*38);
    ctx.parentElement.style.height=h+'px';
    ctx._chartInst=new Chart(ctx,{
      type:'bar',
      data:{
        labels:sorted.map(r=>shortName(r.name)),
        datasets:[
          {label:'وارد',data:sorted.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.75)',borderRadius:4,borderSkipped:false},
          {label:'مصروف',data:sorted.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.75)',borderRadius:4,borderSkipped:false}
        ]
      },
      options:{
        indexAxis:'y',
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{display:true,position:'top',labels:{color:'rgba(212,196,154,.7)',font:{size:11},boxWidth:12}},
          tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fn(c.parsed.x)} ج`}}
        },
        scales:{
          x:{ticks:{color:'var(--text-soft)',font:{size:10},callback:v=>fn(v)},grid:{color:'rgba(255,255,255,.05)'}},
          y:{ticks:{color:'var(--text-soft)',font:{size:11,family:'Cairo,sans-serif'}},grid:{display:false}}
        }
      }
    });
  });
}

function loadRepScreen(){
  document.getElementById('repHub').style.display='block';
  document.getElementById('repView').style.display='none';
  _curReport=null;
  // لو الداتا مش محملة، حملها الأول
  if(!allEntries.length||!allProjects.length){
    loadAllProjects().then(()=>{
      _populateRepSelectors();
    }).catch(()=>{});
  } else {
    _populateRepSelectors();
  }
}
function _populateRepSelectors(){
  const ps=document.getElementById('rProjSel');
  if(ps){
    ps.innerHTML='<option value="all">كل المشاريع</option>';
    allProjects.forEach(p=>{ps.innerHTML+=`<option value="${p.id}">${p.name}</option>`;});
  }
  // Populate advances selector
  const as=document.getElementById('rAdvSel');
  if(as){
    as.innerHTML='<option value="all">كل العهد</option>';
    sb('advances?order=person_name').then(advs=>{
      (advs||[]).forEach(a=>{as.innerHTML+=`<option value="${a.id}">${a.person_name}</option>`;});
    }).catch(()=>{});
  }
}

function switchRepTab(tab){
  repTab=tab;
  document.getElementById('repProjPanel').style.display=tab==='proj'?'block':'none';
  document.getElementById('repAdvPanel').style.display=tab==='adv'?'block':'none';
  document.getElementById('repTabProj').className='filter-btn'+(tab==='proj'?'':' sec');
  document.getElementById('repTabAdv').className='filter-btn'+(tab==='adv'?'':' sec');
}

// ── PROJECT FILTER ──
function runRepFilter(){
  const projId=document.getElementById('rProjSel').value;
  const fromStr=document.getElementById('rDateFrom').value;
  const toStr=document.getElementById('rDateTo').value;

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  let filtered=allEntries;
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

  const inc=filtered.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=filtered.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  const bal=inc-exp;
  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  const sorted=[...filtered].sort((a,b)=>(parseDt(b.entry_date)||0)-(parseDt(a.entry_date)||0));

  _repFilterData={projName,period,filtered:sorted,inc,exp,bal,projId,fromStr,toStr};

  // بار chart data — مجمّع بالشهر
  const buckets={};
  sorted.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0,exp:0};
    if(e.type==='i')buckets[k].inc+=e.amount;else buckets[k].exp+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>Math.max(r.inc,r.exp)),1);

  document.getElementById('repResult').innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">+${fn(inc)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصاريف</div><div class="cf-kpi-val" style="color:#C86060">-${fn(exp)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">الرصيد</div><div class="cf-kpi-val" style="color:${bal>=0?'var(--info-sky)':'var(--danger-soft)'}">${bal>=0?'+':''}${fn(bal)} ج</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="projRepChart"></canvas></div>`:''}
    <div class="cf-bars">
      ${bRows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        const ew=Math.round(r.exp/maxAmt*100);
        const rn=r.inc-r.exp;
        return `<div class="cf-row">
          <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:${rn>=0?'var(--success-soft)':'var(--danger-soft)'}">${rn>=0?'+':''}${fn(rn)} ج</div></div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
            <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">-${fn(r.exp)} ج</div></div>
          </div></div>`;
      }).join('')}
    </div>
    <div class="rep-entries-list">
      <button class="filter-btn" onclick="repExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
      <button class="filter-btn is46" onclick="repExportPDF()">📕 PDF</button>
      <span class="filter-count-badge">${sorted.length} قيد</span>
    </div>`;
  if(bRows.length>1)_renderBarChart('projRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [
      {label:'وارد',data:bRows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'},
      {label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}
    ]
  );
}

function clearRepFilter(){
  document.getElementById('rDateFrom').value='';
  document.getElementById('rDateTo').value='';
  document.getElementById('rProjSel').value='all';
  document.getElementById('repResult').innerHTML='';
  _repFilterData=null;
}

// ── ADVANCE FILTER ──
async function runRepAdvFilter(){
  const advId=document.getElementById('rAdvSel').value;
  const fromStr=document.getElementById('rAdvDateFrom').value;
  const toStr=document.getElementById('rAdvDateTo').value;

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  setSav('⏳ جاري التحميل...','ng');
  try{
    const query=advId==='all'
      ?'entries?advance_id=not.is.null&order=created_at'
      :'entries?advance_id=eq.'+advId+'&order=created_at';
    let entries=await sb(query);
    if(from)entries=entries.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
    if(to)entries=entries.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

    const total=entries.reduce((s,e)=>s+e.amount,0);
    const advName=advId==='all'?'كل العهد':document.getElementById('rAdvSel').selectedOptions[0]?.text||'—';
    const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
    const sorted=[...entries].sort((a,b)=>(parseDt(b.entry_date)||0)-(parseDt(a.entry_date)||0));

    _repAdvData={advName,period,entries:sorted,total,advId,fromStr,toStr};
    setSav('✅ تم','ok');

    // bars by month
    const buckets={};
    sorted.forEach(e=>{
      const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
      const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
      if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),exp:0};
      buckets[k].exp+=e.amount;
    });
    const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
    const maxAmt=Math.max(...bRows.map(r=>r.exp),1);

    document.getElementById('repAdvResult').innerHTML=`
      <div class="cf-kpi-row">
        <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المصروف</div><div class="cf-kpi-val" style="color:#C86060">▼ ${fn(total)} ج</div></div>
        <div class="cf-kpi"><div class="cf-kpi-lbl">عدد القيود</div><div class="cf-kpi-val" style="color:#7BB8C8">${sorted.length}</div></div>
      </div>
      ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="advRepChart"></canvas></div>`:''}
      <div class="cf-bars">
        ${bRows.map(r=>{
          const ew=Math.round(r.exp/maxAmt*100);
          return `<div class="cf-row">
            <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:#C86060">▼ ${fn(r.exp)} ج</div></div>
            <div class="cf-bar-wrap">
              <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">▼ ${fn(r.exp)} ج</div></div>
            </div></div>`;
        }).join('')}
      </div>
      <div class="rep-entries-list">
        <button class="filter-btn" onclick="repAdvExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
        <button class="filter-btn is46" onclick="repAdvExportPDF()">📕 PDF</button>
      </div>`;
    if(bRows.length>1)_renderBarChart('advRepChart',
      bRows.map(r=>_monthLabel(r.y,r.m)),
      [{label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}]
    );
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function clearRepAdvFilter(){
  document.getElementById('rAdvDateFrom').value='';
  document.getElementById('rAdvDateTo').value='';
  document.getElementById('rAdvSel').value='all';
  document.getElementById('repAdvResult').innerHTML='';
  _repAdvData=null;
}

// ── EXCEL EXPORT ──
async function loadExcelJS(){
  if(typeof ExcelJS!=='undefined')return;
  await new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';
    s.onload=res;s.onerror=rej;
    document.head.appendChild(s);
  });
}

async function repExportExcel(){
  const d=_repFilterData;
  if(!d||!d.filtered.length){notify('لا يوجد بيانات','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    await loadExcelJS();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير المشاريع',{views:[{rightToLeft:true}]});
    const COLS=7;ws.columns=[{width:14},{width:12},{width:20},{width:16},{width:26},{width:18},{width:16}];
    _xlHeader(ws,'📁 تقرير مشروع: '+d.projName,d.period+'  |  وارد: '+fn(d.inc)+' ج  |  مصاريف: '+fn(d.exp)+' ج  |  رصيد: '+fn(d.bal)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','النوع','المشروع','البند','البيان','المقاول','المبلغ (ج)'],COLS);
    d.filtered.sort((a,b)=>parseDt(a.entry_date)-parseDt(b.entry_date)).forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const isI=e.type==='i';
      _xlDataRow(ws,[cleanDate(e.entry_date)||'',isI?'▲ وارد':'▼ مصروف',proj?.name||'',e.category||'',e.description||'',e.contractor||'',e.amount],i,[null,isI?_XC.PS:_XC.RD,null,null,null,_XC.MQ,isI?_XC.PS:_XC.RD]);
    });
    _xlTotRow(ws,['','▲ وارد','','','','',d.inc],COLS);
    _xlTotRow(ws,['','▼ مصروف','','','','',d.exp],COLS);
    _xlTotRow(ws,['','الرصيد','','','','',d.bal],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='تقرير_'+d.projName+'_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
    setSav('✅ تم تحميل Excel','ok');
  }catch(e){setSav('❌ '+e.message,'er');}
}

async function repAdvExportExcel(){
  const d=_repAdvData;
  if(!d||!d.entries.length){notify('لا يوجد بيانات','warn');return;}
  setSav('⏳ جاري التحميل...','ng');
  try{
    await loadExcelJS();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('تقرير العهدة',{views:[{rightToLeft:true}]});
    const COLS=6;ws.columns=[{width:14},{width:14},{width:22},{width:18},{width:16},{width:14}];
    _xlHeader(ws,'💼 تقرير عهدة: '+d.advName,d.period+'  |  إجمالي: '+fn(d.total)+' ج',COLS);
    _xlHdrRow(ws,['التاريخ','البند','البيان','المشروع','المقاول','المبلغ (ج)'],COLS);
    d.entries.forEach((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      _xlDataRow(ws,[e.entry_date||'',e.category||'',e.description||'',proj?.name||'',e.contractor||'',e.amount],i,[null,null,null,null,_XC.MQ,_XC.RD]);
    });
    _xlTotRow(ws,['إجمالي الصرف','','','','',d.total],COLS);
    _xlFooter(ws,COLS);
    const buf=await wb.xlsx.writeBuffer();
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    a.download='عهدة_'+d.advName+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    setSav('✅ تم تحميل Excel','ok');
  }catch(e){setSav('❌ '+e.message,'er');}
}

// ── PDF EXPORT ──
async function repExportPDF(){
  const d=_repFilterData;
  if(!d||!d.filtered.length){notify('شغّل الفلتر أولاً ثم اضغط عرض','warn');return;}
  // استخدم الـ cache الموجود من البحث أو اجيب الـ profiles
  let profileMap={};
  try{
    const profiles=await sb('profiles');
    if(profiles&&profiles.length)profiles.forEach(p=>{profileMap[p.id]=p.name||'—';});
    _profMapCache=profileMap;
  }catch(e){console.warn('profiles error:',e);}
  const rows=d.filtered.map((e,i)=>{
    const proj=allProjectsMap[e.project_id];
    const isI=e.type==='i';
    const c=isI?'var(--primary-btn)':'var(--danger)';
    const etLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
    const et=e.entry_type?`<span style="font-size:9px;padding:2px 6px;border-radius:8px;font-weight:700;background:${e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':'var(--warning-pale)'};color:${e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':'var(--warning-dark)'}">${etLbl[e.entry_type]}</span> `:'';
    const creator=e.created_by?(profileMap[e.created_by]||'—'):'غير مسجل';
    return `<tr><td class="rep-table-num">${i+1}</td><td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td><td style="font-size:10px">${cleanDate(e.entry_date)}</td><td><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${isI?'var(--success-pale)':'var(--danger-pale)'};color:${c}">${isI?'▲ وارد':'▼ مصروف'}</span></td><td style="font-size:10px;color:#555">${proj?.name||''}</td><td style="font-weight:600">${e.category||'—'}</td><td style="color:#555">${et}${e.description||''}</td><td style="font-size:10px;color:#555">${e.contractor||'—'}</td><td class="rep-creator-cell">${creator}</td><td style="color:${c};font-weight:700;white-space:nowrap">${isI?'▲':'▼'} ${fn(e.amount)} ج</td></tr>`;
  }).join('');
  // ملخص المقاولين
  const mqMap={};
  d.filtered.filter(e=>e.contractor&&e.entry_type).forEach(e=>{
    if(!mqMap[e.contractor])mqMap[e.contractor]={pay:0,work:0,mat:0};
    if(e.entry_type==='payment')mqMap[e.contractor].pay+=e.amount;
    else if(e.entry_type==='work')mqMap[e.contractor].work+=e.amount;
    else if(e.entry_type==='material')mqMap[e.contractor].mat+=e.amount;
  });
  const mqRows=Object.entries(mqMap).map(([name,m])=>{
    const rem=m.pay-(m.work+m.mat);
    return `<tr><td style="font-weight:700">👷 ${name}</td><td style="text-align:center;color:#1E6B3A">${fn(m.pay)} ج</td><td style="text-align:center;color:#185FA5">${fn(m.work)} ج</td><td style="text-align:center;color:#E65100">${fn(m.mat)} ج</td><td style="text-align:center;font-weight:900;color:${rem>=0?'var(--primary)':'var(--danger)'}">${rem>=0?'':'-'}${fn(Math.abs(rem))} ج</td></tr>`;
  }).join('');
  const mqSection=mqRows?`
    <h3 class="rep-contractors-title">👷 ملخص المقاولين</h3>
    <table><thead><tr><th>المقاول</th><th>💰 دفعات</th><th>🔨 أعمال</th><th>🔩 مصنعيات</th><th>الباقي / المستحق</th></tr></thead><tbody>${mqRows}</tbody></table>`:'';
  const now=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  const html=_pdfOpen('تقرير - '+d.projName)+
    _pdfHeader('📁 تقرير مشروع','📁 '+d.projName+' · 📅 '+d.period+' · 🗓 '+now)+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.exp)} ج</div></div>
      <div class="kpi ${d.bal>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي الرصيد</div><div class="kpi-val">${d.bal>=0?'▲':'▼'} ${fn(Math.abs(d.bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود <span style="font-size:11px;font-weight:400;color:#888">(${d.filtered.length} قيد)</span></div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>النوع</th><th>المشروع</th><th>البند</th><th>البيان</th><th>المقاول</th><th>مدخل البيانات</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${mqSection}`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

function repAdvExportPDF(){
  const d=_repAdvData;
  if(!d||!d.entries.length){notify('لا يوجد بيانات','warn');return;}
  const canvas=document.getElementById('advRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const rows=d.entries.map((e,i)=>{
    const proj=allProjectsMap[e.project_id];
    return `<tr>
      <td class="rep-table-num">${i+1}</td>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
      <td>${cleanDate(e.entry_date)||'—'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||'—'}</td>
      <td>${proj?.name||'—'}</td>
      <td class="amt neg">▼ ${fn(e.amount)} ج</td>
    </tr>`;
  }).join('');
  const html=_pdfOpen('تقرير عهدة')+
    _pdfHeader('💼 تقرير العهدة','صاحب العهدة: '+d.advName+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${d.entries.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المصروفات</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البند</th><th>البيان</th><th>المشروع</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt neg">▼ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

// ── CONTRACTOR REPORT ──────────────────────────
let _repContrData=null,_repClientData=null;
function runContractorReport(){
  const mq=document.getElementById('rContrSel').value;
  const fromStr=document.getElementById('rContrFrom').value;
  const toStr=document.getElementById('rContrTo').value;
  const el=document.getElementById('repContractorResult');
  if(!mq){el.innerHTML='<div class="rep-empty">اختار مقاول الأول</div>';return;}
  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;
  let filtered=allEntries.filter(e=>e.type==='e'&&(mq==='__ALL__'?e.contractor:e.contractor===mq));
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});
  filtered.sort((a,b)=>(parseDt(a.entry_date)||0)-(parseDt(b.entry_date)||0));
  const total=filtered.reduce((s,e)=>s+e.amount,0);
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  if(!filtered.length){el.innerHTML='<div class="rep-empty">لا توجد قيود لهذا المقاول في الفترة المحددة</div>';return;}
  // bars by month
  const buckets={};
  filtered.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),exp:0};
    buckets[k].exp+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>r.exp),1);
  el.innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي المدفوعات</div><div class="cf-kpi-val" style="color:#C86060">▼ ${fn(total)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">عدد القيود</div><div class="cf-kpi-val" style="color:#7BB8C8">${filtered.length}</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="contrRepChart"></canvas></div>`:''}
    <div class="cf-bars">
      ${bRows.map(r=>{
        const ew=Math.round(r.exp/maxAmt*100);
        return `<div class="cf-row">
          <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:#C86060">▼ ${fn(r.exp)} ج</div></div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">مصروف</div><div class="cf-bar-track"><div class="cf-bar-fill exp" style="width:${ew}%"></div></div><div class="cf-bar-amt exp">▼ ${fn(r.exp)} ج</div></div>
          </div></div>`;
      }).join('')}
    </div>
    <div class="rep-entries-list">
      <button class="filter-btn" onclick="contractorExportExcel()" style="font-size:12px;padding:8px 18px">📗 Excel</button>
      <button class="filter-btn is46" onclick="contractorExportPDF()">📕 PDF</button>
    </div>`;
  _repContrData={mq,period,filtered,total};
  if(bRows.length>1)_renderBarChart('contrRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [{label:'مصروف',data:bRows.map(r=>r.exp),backgroundColor:'rgba(235,87,87,.7)'}]
  );
}
function clearContractorReport(){
  document.getElementById('rContrSel').value='';
  document.getElementById('rContrFrom').value='';
  document.getElementById('rContrTo').value='';
  document.getElementById('repContractorResult').innerHTML='';
  _repContrData=null;
}
function contractorExportPDF(){
  if(!_repContrData){runContractorReport();if(!_repContrData)return;}
  const d=_repContrData;
  const canvas=document.getElementById('contrRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const rows=d.filtered.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${allProjectsMap[e.project_id]?.name||'—'}</td>
    <td>${e.category||'—'}</td>
    <td>${e.description||'—'}</td>
    <td class="amt neg">▼ ${fn(e.amount)} ج</td>
  </tr>`).join('');
  const html=_pdfOpen('تقرير المقاول — '+d.mq)+
    _pdfHeader('👷 تقرير المقاول','المقاول: '+d.mq+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المدفوعات</div><div class="kpi-val">▼ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${d.filtered.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المصروفات</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>المشروع</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="5">الإجمالي</td><td class="amt neg">▼ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}
function contractorExportExcel(){
  if(!_repContrData){runContractorReport();if(!_repContrData)return;}
  notify('جاري التحميل...','info');
  const d=_repContrData;
  _loadExcelJs(async()=>{
    const wb=new ExcelJS.Workbook();
    const ws=wb.addWorksheet('تقرير المقاول');
    ws.addRow(['م','التاريخ','المشروع','البند','البيان','المبلغ']);
    d.filtered.forEach((e,i)=>ws.addRow([i+1,e.entry_date||'',allProjectsMap[e.project_id]?.name||'',e.category||'',e.description||'',e.amount]));
    ws.addRow(['','','','','الإجمالي',d.total]);
    const buf=await wb.xlsx.writeBuffer();
    const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='مقاول_'+d.mq+'_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';a.click();
    notify('تم التحميل ✅','ok');
  });
}

// ── CLIENT REPORT ──────────────────────────────
function runClientReport(){
  const projId=document.getElementById('rClientProj').value;
  const fromStr=document.getElementById('rClientFrom').value;
  const toStr=document.getElementById('rClientTo').value;
  const el=document.getElementById('repClientResult');
  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d)d.setHours(23,59,59,999);return d;})():null;
  let filtered=allEntries.filter(e=>e.type==='i');
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});
  filtered.sort((a,b)=>(parseDt(a.entry_date)||0)-(parseDt(b.entry_date)||0));
  const total=filtered.reduce((s,e)=>s+e.amount,0);
  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr||'البداية')+' → '+(toStr||'اليوم');
  if(!filtered.length){el.innerHTML='<div class="rep-empty">لا توجد مدفوعات في الفترة المحددة</div>';return;}
  const buckets={};
  filtered.forEach(e=>{
    const d=_parseEntryDate(e.entry_date);if(!d||isNaN(d))return;
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
    if(!buckets[k])buckets[k]={key:k,y:d.getFullYear(),m:d.getMonth(),inc:0};
    buckets[k].inc+=e.amount;
  });
  const bRows=Object.values(buckets).sort((a,b)=>a.key.localeCompare(b.key));
  const maxAmt=Math.max(...bRows.map(r=>r.inc),1);
  el.innerHTML=`
    <div class="cf-kpi-row">
      <div class="cf-kpi"><div class="cf-kpi-lbl">إجمالي الوارد</div><div class="cf-kpi-val" style="color:#7DBFA0">▲ ${fn(total)} ج</div></div>
      <div class="cf-kpi"><div class="cf-kpi-lbl">عدد الدفعات</div><div class="cf-kpi-val" style="color:#7BB8C8">${filtered.length}</div></div>
    </div>
    ${bRows.length>1?`<div class="rep-chart-wrap"><canvas id="clientRepChart"></canvas></div>`:''}
    <div class="cf-bars">
      ${bRows.map(r=>{
        const iw=Math.round(r.inc/maxAmt*100);
        return `<div class="cf-row">
          <div class="cf-row-hdr"><div class="cf-row-lbl">${_monthLabel(r.y,r.m)}</div><div class="cf-row-net" style="color:#7DBFA0">▲ ${fn(r.inc)} ج</div></div>
          <div class="cf-bar-wrap">
            <div class="cf-bar-row"><div class="cf-bar-lbl">وارد</div><div class="cf-bar-track"><div class="cf-bar-fill inc" style="width:${iw}%"></div></div><div class="cf-bar-amt inc">+${fn(r.inc)} ج</div></div>
          </div></div>`;
      }).join('')}
    </div>
    <div class="rep-entries-list">
      <button class="filter-btn is46" onclick="clientExportPDF()">📕 PDF</button>
    </div>`;
  _repClientData={projName,period,filtered,total};
  if(bRows.length>1)_renderBarChart('clientRepChart',
    bRows.map(r=>_monthLabel(r.y,r.m)),
    [{label:'وارد',data:bRows.map(r=>r.inc),backgroundColor:'rgba(111,207,151,.7)'}]
  );
}
function clearClientReport(){
  document.getElementById('rClientProj').value='all';
  document.getElementById('rClientFrom').value='';
  document.getElementById('rClientTo').value='';
  document.getElementById('repClientResult').innerHTML='';
  _repClientData=null;
}
function clientExportPDF(){
  if(!_repClientData){runClientReport();if(!_repClientData)return;}
  const d=_repClientData;
  const canvas=document.getElementById('clientRepChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const rows=d.filtered.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${allProjectsMap[e.project_id]?.name||'—'}</td>
    <td>${e.description||'—'}</td>
    <td class="amt pos">▲ ${fn(e.amount)} ج</td>
  </tr>`).join('');
  const html=_pdfOpen('تقرير العميل — '+d.projName)+
    _pdfHeader('🤝 تقرير العميل','المشروع: '+d.projName+' · الفترة: '+d.period)+
    `<div class="kpis kpis-2">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(d.total)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد الدفعات</div><div class="kpi-val">${d.filtered.length}</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📒 تفاصيل المدفوعات</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>المشروع</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4">الإجمالي</td><td class="amt pos">▲ ${fn(d.total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

function loadDuesReport(){
  const map={};
  allEntries.filter(e=>e.type==='e'&&e.contractor&&e.entry_type).forEach(e=>{
    const key=e.project_id+'__'+e.contractor;
    if(!map[key])map[key]={proj:allProjectsMap[e.project_id]?.name||'—',mq:e.contractor,pay:0,work:0,mat:0};
    if(e.entry_type==='payment')map[key].pay+=e.amount;
    else if(e.entry_type==='work')map[key].work+=e.amount;
    else if(e.entry_type==='material')map[key].mat+=e.amount;
  });
  const rows=Object.values(map).map(r=>({...r,due:r.work+r.mat-r.pay})).filter(r=>r.due>0);
  rows.sort((a,b)=>b.due-a.due);
  const total=rows.reduce((s,r)=>s+r.due,0);
  if(!rows.length){document.getElementById('duesBody').innerHTML='<div class="emp empty-state">✅ لا توجد مستحقات</div>';return;}
  document.getElementById('duesBody').innerHTML=`
    <div class="rep-dues-wrap">
      <table class="rep-dues-table">
        <thead>
          <tr style="background:#1D3C2A">
            <th class="rep-dues-th">المشروع</th>
            <th class="rep-dues-th">المقاول</th>
            <th class="section-hdr-cell">🔨 أعمال + 🔩 مصنعيات</th>
            <th class="section-hdr-cell">💰 مدفوع</th>
            <th class="section-hdr-cell">⚠️ المستحق</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((r,i)=>`<tr style="background:${i%2===0?'var(--bg-pure)':'var(--bg-faint)'};border-bottom:1px solid #f0ebe0">
            <td class="rep-dues-proj-cell">${r.proj}</td>
            <td style="padding:9px 12px">👷 ${r.mq}</td>
            <td class="rep-dues-work-cell">${fn(r.work+r.mat)} ج</td>
            <td class="rep-dues-pay-cell">${fn(r.pay)} ج</td>
            <td class="rep-dues-due-cell">${fn(r.due)} ج</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="background:#f5f0e8">
            <td colspan="4" class="rep-dues-total-label">إجمالي المستحقات</td>
            <td class="rep-dues-total-val">${fn(total)} ج</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
  window._duesRows=rows;window._duesTotal=total;
}

// ── CASH FLOW EXPORTS ───────────────────────────
function cashExportPDF(){
  const rows=window._cashRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  const canvas=document.getElementById('cashChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totInc-totExp;
  const html=_pdfOpen('التدفق النقدي')+
    _pdfHeader('💰 تقرير التدفق النقدي','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">+${fn(totInc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصاريف</div><div class="kpi-val">-${fn(totExp)} ج</div></div>
      <div class="kpi ${net>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">صافي التدفق</div><div class="kpi-val">${net>=0?'+':''}${fn(net)} ج</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📊 التفاصيل الشهرية</div>
    <table>
      <thead><tr><th>الشهر</th><th>الوارد</th><th>المصاريف</th><th>الصافي</th></tr></thead>
      <tbody>${rows.map(r=>{const n=r.inc-r.exp;return`<tr><td>${_monthLabel(r.y,r.m)}</td><td class="amt pos">+${fn(r.inc)} ج</td><td class="amt neg">-${fn(r.exp)} ج</td><td class="amt ${n>=0?'pos':'neg'}">${n>=0?'+':''}${fn(n)} ج</td></tr>`;}).join('')}</tbody>
      <tfoot><tr><td>الإجمالي</td><td class="amt pos">+${fn(totInc)} ج</td><td class="amt neg">-${fn(totExp)} ج</td><td class="amt ${net>=0?'pos':'neg'}">${net>=0?'+':''}${fn(net)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function cashExportExcel(){try{
  const rows=window._cashRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  if(!window.ExcelJS){const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';document.head.appendChild(s);await new Promise(r=>s.onload=r);}
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const net=totInc-totExp;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('التدفق النقدي',{views:[{rightToLeft:true}]});
  const COLS=4;ws.columns=[{width:24},{width:20},{width:20},{width:20}];
  _xlHeader(ws,'💰 تقرير التدفق النقدي','وارد: '+fn(totInc)+' ج  |  مصاريف: '+fn(totExp)+' ج  |  صافي: '+fn(net)+' ج',COLS);
  _xlHdrRow(ws,['الشهر','الوارد (ج)','المصاريف (ج)','الصافي (ج)'],COLS);
  rows.forEach((r,i)=>{
    const n=r.inc-r.exp;
    _xlDataRow(ws,[_monthLabel(r.y,r.m),r.inc,r.exp,n],i,[null,_XC.PS,_XC.RD,n>=0?_XC.PS:_XC.RD]);
  });
  _xlTotRow(ws,['الإجمالي',totInc,totExp,net],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='تدفق_نقدي_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

// ── SUMMARY EXPORTS ───────────────────────────
function summaryExportPDF(){
  const rows=window._summaryRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  const canvas=document.getElementById('summaryChart');
  const chartImg=canvas?`<div class="chart-wrap"><img src="${canvas.toDataURL('image/png')}"></div>`:'';
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const html=_pdfOpen('الملخص الدوري')+
    _pdfHeader('📋 الملخص الدوري للمشاريع','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">+${fn(totInc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصاريف</div><div class="kpi-val">-${fn(totExp)} ج</div></div>
      <div class="kpi ${totNet>=0?'kpi-net-pos':'kpi-net-neg'}"><div class="kpi-lbl">الصافي</div><div class="kpi-val">${totNet>=0?'+':''}${fn(totNet)} ج</div></div>
    </div>
    ${chartImg}
    <div class="sec-ttl">📁 تفاصيل المشاريع</div>
    <table>
      <thead><tr><th>المشروع</th><th>الوارد</th><th>المصاريف</th><th>الصافي</th><th>القيود</th></tr></thead>
      <tbody>${rows.sort((a,b)=>b.net-a.net).map(r=>`<tr>
        <td style="font-weight:700">${r.name}</td>
        <td class="amt pos">+${fn(r.inc)} ج</td>
        <td class="amt neg">-${fn(r.exp)} ج</td>
        <td class="amt ${r.net>=0?'pos':'neg'}">${r.net>=0?'+':''}${fn(r.net)} ج</td>
        <td style="text-align:center">${r.count}</td>
      </tr>`).join('')}</tbody>
      <tfoot><tr>
        <td>الإجمالي</td>
        <td class="amt pos">+${fn(totInc)} ج</td>
        <td class="amt neg">-${fn(totExp)} ج</td>
        <td class="amt ${totNet>=0?'pos':'neg'}">${totNet>=0?'+':''}${fn(totNet)} ج</td>
        <td style="text-align:center">${rows.reduce((s,r)=>s+r.count,0)}</td>
      </tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function summaryExportExcel(){try{
  const rows=window._summaryRows;
  if(!rows||!rows.length){notify('اعرض التقرير أولاً','warn');return;}
  await loadExcelJSLib();
  const totInc=rows.reduce((s,r)=>s+r.inc,0);
  const totExp=rows.reduce((s,r)=>s+r.exp,0);
  const totNet=totInc-totExp;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('الملخص الدوري',{views:[{rightToLeft:true}]});
  const COLS=5;ws.columns=[{width:28},{width:18},{width:18},{width:18},{width:12}];
  _xlHeader(ws,'📋 الملخص الدوري للمشاريع','وارد: '+fn(totInc)+' ج  |  مصاريف: '+fn(totExp)+' ج  |  صافي: '+fn(totNet)+' ج',COLS);
  _xlHdrRow(ws,['المشروع','الوارد (ج)','المصاريف (ج)','الصافي (ج)','القيود'],COLS);
  rows.sort((a,b)=>b.net-a.net).forEach((r,i)=>{
    _xlDataRow(ws,[r.name,r.inc,r.exp,r.net,r.count],i,[null,_XC.PS,_XC.RD,r.net>=0?_XC.PS:_XC.RD,null]);
  });
  _xlTotRow(ws,['الإجمالي',totInc,totExp,totNet,rows.reduce((s,r)=>s+r.count,0)],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='ملخص_دوري_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

function mqAddByIdx(idx){
  const m=window._mqList&&window._mqList[idx];
  if(!m)return;
  mqAddPayment(m.n, m.rows[0]?.category||'');
}

function mqPrintReport(idx){
  const m=window._mqList&&window._mqList[idx];
  if(!m)return;
  const proj=allProjects?.find(p=>p.id===curPid);
  const projName=proj?.name||'—';
  const fn2=n=>Number(n).toLocaleString('en-US');
  const total=m.pay+m.work+m.mat+m.other;
  const rows=m.rows.sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date));
  const etLbl={'payment':'دفعة','work':'أعمال','material':'مصنعيات'};
  const today=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});
  const trs=rows.map((e,i)=>`
    <tr>
      <td style="text-align:center;color:#888">${i+1}</td>
      <td style="font-size:9px;color:var(--primary-btn);font-weight:700">#${e.entry_no||'—'}</td>
      <td style="text-align:center">${e.entry_date||'—'}</td>
      <td>${e.entry_type?etLbl[e.entry_type]||'—':'—'}</td>
      <td>${e.category||'—'}</td>
      <td>${e.description||'—'}</td>
      <td class="rep-adv-amount-cell">${fn2(e.amount)} ج</td>
    </tr>`).join('');
  const html=_pdfOpen('تقرير مقاول - '+m.n)+
    _pdfHeader('👷 حساب المقاول: '+m.n,'📁 مشروع: '+projName+' · 🗓 '+today)+
    `<div class="kpis kpis-4">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المسحوب</div><div class="kpi-val">${fn2(total)} ج</div></div>
      <div class="kpi kpi-inc"><div class="kpi-lbl">💰 دفعات</div><div class="kpi-val">${fn2(m.pay)} ج</div></div>
      <div class="kpi kpi-adv"><div class="kpi-lbl">🔨 أعمال</div><div class="kpi-val">${fn2(m.work)} ج</div></div>
      <div class="kpi kpi-neutral"><div class="kpi-lbl">عدد القيود</div><div class="kpi-val">${rows.length}</div></div>
    </div>
    <div class="sec-ttl">📒 تفاصيل القيود</div>
    <table>
      <thead><tr><th>#</th><th>رقم القيد</th><th>التاريخ</th><th>النوع</th><th>البند</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>
        ${trs}
      </tbody>
      <tfoot><tr><td colspan="5">الإجمالي الكلي</td><td class="amt">${fn2(total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

// Quick payment from contractor tab
let _mqName='',_mqCat='';
function mqAddPayment(name,cat){
  _mqName=name;_mqCat=cat;
  document.getElementById('mqPayName').textContent='👷 '+name;
  document.getElementById('mqPayAmt').value='';
  document.getElementById('mqPayDesc').value='دفعة';
  document.getElementById('mqPayDt').value=ts();
  document.getElementById('mqPayCat').value=cat||'';
  document.getElementById('mqPayEtype').value='payment';
  document.getElementById('mqPayMsg').textContent='';
  document.getElementById('mqPayModal').style.display='flex';
  setTimeout(()=>document.getElementById('mqPayAmt').focus(),100);
}
function closeMqPay(){document.getElementById('mqPayModal').style.display='none';}
async function saveMqPay(){
  const a=parseFloat(document.getElementById('mqPayAmt').value);
  const desc=document.getElementById('mqPayDesc').value.trim();
  const dt=fd(document.getElementById('mqPayDt').value);
  const cat=document.getElementById('mqPayCat').value.trim();
  const etype=document.getElementById('mqPayEtype').value;
  const msg=document.getElementById('mqPayMsg');
  if(isNaN(a)||a<=0){msg.textContent='⚠️ ادخل المبلغ';msg.style.color='var(--danger-alt)';return;}
  if(!cat){msg.textContent='⚠️ ادخل البند';msg.style.color='var(--danger-alt)';return;}
  msg.textContent='⏳ جاري الحفظ...';msg.style.color='var(--text-soft)';
  // جيب آخر seq من Supabase مباشرة عشان نضمن التفرد
  let nextSeq=20260001;
  try{
    const last=await sb('entries?select=entry_no&order=entry_no.desc&limit=1');
    const lastSeq=last&&last.length?Number(last[0].entry_no||20260000):20260000;
    nextSeq=lastSeq<20260000?20260001:lastSeq+1;
  }catch(e){console.error(e);}
  const entry={id:uid_(),project_id:curPid,type:'e',amount:a,description:desc||'دفعة',entry_date:dt,category:cat,contractor:_mqName,entry_type:etype,seq:uRole==='admin'?nextSeq:0,created_by:uid};
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);
      msg.textContent='✅ تم الحفظ';msg.style.color='var(--primary-btn)';
      setTimeout(()=>{closeMqPay();rp();},800);
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      msg.textContent='⏳ في انتظار موافقة الأدمن';msg.style.color='var(--warning-text)';
      setTimeout(()=>closeMqPay(),1200);
    }
  }catch(e){setSav('❌ '+friendlyError(e),'er');msg.style.color='var(--danger-alt)';}
}

window.onload=()=>{
  const _nav=document.getElementById('mobBottomNav');
  if(_nav)_nav.style.display='none';
  checkSaved();
};

let curEditEtype=null;
function onEditMqInput(v){
  const wrap=document.getElementById('editEtypeWrap');
  if(v.trim()){wrap.classList.add('show');if(!curEditEtype)curEditEtype='payment';}
  else{wrap.classList.remove('show');curEditEtype=null;}
}
function setEditEtype(t,btn){
  curEditEtype=t;
  ['payment','work','material'].forEach(id=>{document.getElementById('eEt-'+id).classList.remove('on');});
  btn.classList.add('on');
}
function setCatView(v,btn){
  document.getElementById('catListView').style.display=v==='list'?'block':'none';
  document.getElementById('catMqView').style.display=v==='mq'?'block':'none';
  ['cvList','cvMq'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.style.background='var(--bg-pure)';b.style.color='var(--text-hint)';b.style.borderColor='var(--border-warm)';}
  });
  if(btn){btn.style.background='var(--info-bg)';btn.style.color='var(--info)';btn.style.borderColor='var(--info)';}
}
let curEtype='payment';
let descDDOpen=false;

function onDescInput(v){
  const dd=document.getElementById('descDD');
  if(!dd)return;
  const q=v.trim();
  if(!q){hideDDDesc();return;}
  // جيب البيانات من كل المشاريع مرتبة من الأكثر تكراراً
  const freq={};
  allEntries.filter(e=>e.description&&e.description.trim()).forEach(e=>{
    const d=e.description.trim();
    if(d.includes(q)||d.toLowerCase().includes(q.toLowerCase()))
      freq[d]=(freq[d]||0)+1;
  });
  const results=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,8);
  if(!results.length){hideDDDesc();return;}
  dd.style.display='block';
  descDDOpen=true;
  document.getElementById('descList').innerHTML=results.map(([d,n])=>`
    <div class="cat-opt" onclick="selectDesc('${d.replace(/'/g,"\\'").replace(/"/g,'&quot;')}')">
      <span class="cat-icon">📝</span>
      <span style="flex:1">${d}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
}

function selectDesc(val){
  const inp=document.getElementById('id_');
  if(inp)inp.value=val;
  hideDDDesc();
}

function hideDDDesc(){
  descDDOpen=false;
  const dd=document.getElementById('descDD');
  if(dd)dd.style.display='none';
}

document.addEventListener('click',function(e){
  const dw=document.getElementById('descWrap');
  if(dw&&!dw.contains(e.target))hideDDDesc();
});

function getProjectMqs(q){
  const projEntries=allEntries.filter(e=>e.contractor);
  const freq={};
  projEntries.forEach(e=>{freq[e.contractor]=(freq[e.contractor]||0)+1;});
  let mqs=Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([c,n])=>({c,n}));
  if(q)mqs=mqs.filter(x=>x.c.includes(q)||x.c.toLowerCase().includes(q.toLowerCase()));
  return mqs;
}

function renderMqOpts(q){
  const list=document.getElementById('mqList');if(!list)return;
  const mqs=getProjectMqs(q);
  let html='';
  if(mqs.length){
    html+=mqs.map(({c,n})=>`<div class="cat-opt" onclick="selectMq('${c.replace(/'/g,"\\'")}')">
      <span class="cat-icon">👷</span>
      <span style="flex:1">${c}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
  }
  const typed=(document.getElementById('iq')?.value||'').trim();
  const exact=mqs.some(x=>x.c===typed);
  if(typed&&!exact){
    html+=`<div class="cat-opt cat-opt-new" onclick="selectMq('${typed.replace(/'/g,"\\'")}')">
      <span class="cat-icon">➕</span>
      <span>إضافة: <b>${typed}</b></span>
    </div>`;
  }
  if(!html)html='<div class="cat-empty-msg">لا يوجد مقاولين بعد</div>';
  list.innerHTML=html;
}

function toggleMqDD(){
  mqDDOpen=!mqDDOpen;
  const dd=document.getElementById('mqDD');if(!dd)return;
  dd.style.display=mqDDOpen?'block':'none';
  if(mqDDOpen)renderMqOpts('');
}

function hideMqDD(){
  mqDDOpen=false;
  const dd=document.getElementById('mqDD');if(dd)dd.style.display='none';
}

function selectMq(name){
  document.getElementById('iq').value=name;
  hideMqDD();
  // اظهر أزرار نوع العمل
  const w=document.getElementById('etypeWrap');
  if(w)w.classList.add('show');
}

function onMqInput(v){
  const w=document.getElementById('etypeWrap');
  if(v.trim()){
    w.classList.add('show');
    const dd=document.getElementById('mqDD');
    if(dd){dd.style.display='block';mqDDOpen=true;}
    renderMqOpts(v);
  }else{
    w.classList.remove('show');
    curEtype='payment';
    hideMqDD();
  }
}

document.addEventListener('click',function(e){
  const mw=document.getElementById('mqWrap');
  if(mw&&!mw.contains(e.target))hideMqDD();
});
function setEtype(t,btn){
  curEtype=t;
  document.querySelectorAll('.etype-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}

function closeAdvImModal(){
  document.getElementById('advImModal').style.display='none';
  document.getElementById('advXlsFile').value='';
}

async function loadExcelJSLib(){
  if(typeof ExcelJS!=='undefined')return;
  await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
}

async function readAdvXls(input){
  const file=input.files[0];if(!file)return;
  setSav('⏳ جاري قراءة الملف...','ng');
  try{
    await loadExcelJSLib();
    const buf=await file.arrayBuffer();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    await wb.xlsx.load(buf);
    const ws=wb.worksheets[0];
    const rows=[];
    ws.eachRow((row,rn)=>{
      if(rn<=3)return;
      const v=row.values.slice(1);
      const amt=parseFloat(String(v[0]||'').replace(/,/g,''));
      if(isNaN(amt)||amt<=0)return;
      const cat=String(v[1]||'').trim();
      if(!cat)return;
      const desc=String(v[2]||'').trim();
      const dt=String(v[3]||'').trim();
      const mq=String(v[4]||'').trim();
      const projName=String(v[5]||'').trim();
      const matched=allProjects.find(p=>p.name.trim().toLowerCase()===projName.toLowerCase());
      rows.push({amt,cat,desc,dt,mq,projName,pid:matched?matched.id:''});
    });
    if(!rows.length){setSav('⚠️ مفيش بيانات في الملف','er');return;}
    advImRows=rows;
    showAdvImModal();
    setSav('☁️ متصل — بياناتك محفوظة','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function showAdvImModal(){
  const projOpts=allProjects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  document.getElementById('advImBody').innerHTML=advImRows.map((r,i)=>{
    const opts=`<option value="">— اختر المشروع —</option>`+allProjects.map(p=>`<option value="${p.id}"${p.id===r.pid?' selected':''}>${p.name}</option>`).join('');
    const bg=i%2===0?'var(--bg-pure)':'var(--bg-warm2)';
    const hasPrj=!!r.pid;
    return `<tr style="background:${bg}">
      <td class="rep-client-num">${i+1}</td>
      <td class="rep-client-amount">${fn(r.amt)} ج</td>
      <td style="padding:8px 12px"><span class="rep-client-cat-badge">${r.cat||'—'}</span></td>
      <td class="rep-client-desc">${r.desc||'—'}</td>
      <td class="rep-client-date">${r.dt||'—'}</td>
      <td class="rep-client-contractor">${r.mq||'—'}</td>
      <td style="padding:8px 12px">
        <select data-idx="${i}" onchange="advImRows[this.dataset.idx].pid=this.value;this.style.borderColor=this.value?'var(--primary-mid)':'var(--warning-alt)';this.style.background=this.value?'var(--bg-pure)':'var(--warning-faint)'"
          style="width:100%;padding:6px 8px;border:1.5px solid ${hasPrj?'var(--primary-mid)':'var(--warning-alt)'};border-radius:6px;font-size:12px;font-family:inherit;background:${hasPrj?'var(--bg-pure)':'var(--warning-faint)'};color:#1D3C2A">
          ${opts}
        </select>
      </td>
    </tr>`;
  }).join('');
  const auto=advImRows.filter(r=>r.pid).length;
  document.getElementById('advImSubtitle').textContent=`${advImRows.length} صف — تم التعرف على ${auto} تلقائياً`;
  document.getElementById('advImCount').textContent=advImRows.length-auto>0?`⚠️ ${advImRows.length-auto} صف محتاج تحديد مشروع`:'✅ كل الصفوف جاهزة';
  document.getElementById('advImModal').style.display='block';
}

async function confirmAdvImport(){
  const valid=advImRows.filter(r=>r.pid);
  const skip=advImRows.length-valid.length;
  if(!valid.length){notify('لازم تحدد مشروع لصف واحد على الأقل','warn');return;}
  if(skip>0)await new Promise(res=>showConfirm({icon:'⚠️',title:'صفوف بدون مشروع',msg:skip+' صف بدون مشروع هيتخطى. تكمل؟',okLabel:'إكمال',okType:'warning',onOk:res}));
  const ents=valid.map(r=>({id:uid_(),project_id:r.pid,type:'e',amount:r.amt,description:r.desc||'',entry_date:r.dt||fd(ts()),category:r.cat,contractor:r.mq||'',advance_id:curAdv.id}));
  if(uRole!=='admin'){setSav('⚠️ الاستيراد متاح للأدمن فقط','er');closeAdvImModal();return;}
  setSav('💾 جاري الاستيراد...','ng');
  try{
    await sb('entries','POST',ents);
    setSav('✅ تم استيراد '+ents.length+' قيد'+(skip?' (تخطي '+skip+')':''),'ok');
    closeAdvImModal();
    await loadAdvDetail();
    await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ══════════ SEARCH ══════════
let _profMapCache=null;
let _srchTab='entries';
function setSrchTab(t){
  _srchTab=t;
  document.getElementById('srch-entries-panel').style.display=t==='entries'?'block':'none';
  document.getElementById('srch-advances-panel').style.display=t==='advances'?'block':'none';
  ['entries','advances'].forEach(x=>{
    const b=document.getElementById('stab-'+x);if(!b)return;
    const on=x===t;
    b.style.background=on?'var(--primary)':'var(--bg-pure)';
    b.style.color=on?'var(--accent)':'var(--text-muted)';
    b.style.borderColor=on?'var(--primary)':'var(--border)';
  });
  document.getElementById('searchResult').innerHTML='';
  document.getElementById('searchAdvResult').innerHTML='';
}
function getSrchFilters(){
  const pid=document.getElementById('srch-proj-filter')?.value||'';
  const type=document.getElementById('srch-type-filter')?.value||'';
  const userId=document.getElementById('srch-user-filter')?.value||'';
  const fromRaw=document.getElementById('srch-date-from')?.value||'';
  const toRaw=document.getElementById('srch-date-to')?.value||'';
  const parseSrchDate=s=>{if(!s)return null;const[d,m,y]=s.split('/');return new Date(+y,+m-1,+d);};
  return{pid,type,userId,from:parseSrchDate(fromRaw),to:parseSrchDate(toRaw)};
}
function applyEntryFilters(arr){
  const f=getSrchFilters();
  return arr.filter(e=>{
    if(f.pid&&e.project_id!==f.pid)return false;
    if(f.type&&e.type!==f.type)return false;
    if(f.userId&&e.created_by!==f.userId)return false;
    if(f.from||f.to){
      let ed=null;
      if(e.entry_date){const p=e.entry_date.includes('/')?e.entry_date.split('/'):null;ed=p?new Date(+p[2],+p[1]-1,+p[0]):new Date(e.entry_date);}
      else if(e.created_at){ed=new Date(e.created_at);}
      if(ed){if(f.from&&ed<f.from)return false;if(f.to){const t=new Date(f.to);t.setHours(23,59,59);if(ed>t)return false;}}
    }
    return true;
  });
}
async function searchAdvances(){
  const q=(document.getElementById('searchAdvInp')?.value||'').trim().toLowerCase();
  const div=document.getElementById('searchAdvResult');
  div.innerHTML='<div class="search-loading-msg">⏳ جاري البحث...</div>';
  try{
    const status=document.getElementById('srch-adv-status')?.value||'';
    const userId=document.getElementById('srch-adv-user')?.value||'';
    let url='advances?order=person_name';
    if(status)url+='&status=eq.'+status;
    if(userId)url+='&user_id=eq.'+userId;
    let data=await sb(url);
    if(q)data=data.filter(a=>(a.person_name||'').toLowerCase().includes(q)||(a.notes||'').toLowerCase().includes(q));
    if(!data.length){div.innerHTML='<div class="search-empty-msg">❌ لا نتائج</div>';return;}
    const profMap=await getProfileMap();
    div.innerHTML='<div class="search-results-count">📊 '+data.length+' نتيجة</div>'+data.map(a=>{
      const bal=fn(a.amount||0);
      const st=a.status==='open'?'<span style="color:var(--warning-text)">مفتوحة</span>':'<span style="color:var(--ok-text)">مغلقة</span>';
      const owner=profMap[a.user_id]||'—';
      return `<div class="search-card-header" style="margin-bottom:10px;cursor:pointer" onclick="showScreen('adv');setTimeout(()=>openAdv('${a.id}'),400)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;color:var(--accent)">${a.person_name||'—'}</span>${st}
        </div>
        <div style="font-size:13px;color:var(--text-muted);margin-top:4px">💰 ${bal} ج &nbsp;·&nbsp; 👤 ${owner}</div>
        ${a.notes?`<div style="font-size:12px;color:var(--text-muted);margin-top:2px">📝 ${a.notes}</div>`:''}
      </div>`;
    }).join('');
  }catch(e){div.innerHTML='<div class="search-error-msg">❌ '+e.message+'</div>';}
}
let _searchMode='seq';
function setSearchMode(m){
  _searchMode=m;
  ['seq','name','amt'].forEach(x=>{
    const btn=document.getElementById('smode-'+x);
    if(!btn)return;
    const on=x===m;
    btn.style.background=on?'var(--primary)':'var(--bg-pure)';
    btn.style.color=on?'var(--accent)':'var(--text-muted)';
    btn.style.borderColor=on?'var(--primary)':'var(--border)';
    const form=document.getElementById('sform-'+x);
    if(form)form.style.display=on?(x==='seq'?'flex':'block'):'none';
  });
  document.getElementById('searchResult').innerHTML='';
}
async function searchBySeq(){
  const seq=parseInt(document.getElementById('searchSeqInp').value);
  const div=document.getElementById('searchResult');
  if(!seq||isNaN(seq)){div.innerHTML='<div class="search-warn-msg">⚠️ أدخل رقم القيد</div>';return;}
  div.innerHTML='<div class="search-loading-msg">⏳ جاري البحث...</div>';
  try{
    const selPid=document.getElementById('srch-proj-filter').value;
    let data=await sb('entries?or=(seq.eq.'+seq+',entry_no.eq.'+seq+')&order=created_at');
    if(selPid)data=data.filter(e=>e.project_id===selPid);
    if(!data||!data.length){div.innerHTML='<div class="search-empty-msg">❌ القيد <strong>'+seq+'</strong> غير موجود</div>';return;}
    const projMap={};allProjects.forEach(p=>projMap[p.id]=p.name);
    const profMap=await getProfileMap();
    div.innerHTML=data.map((e,i)=>buildSearchCard(e,i,data.length,projMap,profMap)).join('');
    setTimeout(()=>{data.forEach(e=>{const el=document.getElementById('se-date-'+e.id);if(el)initDateInput(el);});},0);
  }catch(er){div.innerHTML='<div class="search-error-msg">❌ '+er.message+'</div>';}
}
async function searchByName(){try{
  const q=document.getElementById('searchNameInp').value.trim();
  const div=document.getElementById('searchResult');
  if(!q){div.innerHTML='<div class="search-warn-msg">⚠️ أدخل كلمة للبحث</div>';return;}
  div.innerHTML='<div class="search-loading-msg">⏳ جاري البحث...</div>';
  const inMq=document.getElementById('sf-mq').checked;
  const inDesc=document.getElementById('sf-desc').checked;
  const inCat=document.getElementById('sf-cat').checked;
  const ql=q.toLowerCase();
  const selPid=document.getElementById('srch-proj-filter').value;
  let results=allEntries.filter(e=>(inMq&&(e.contractor||'').toLowerCase().includes(ql))||(inDesc&&(e.description||'').toLowerCase().includes(ql))||(inCat&&(e.category||'').toLowerCase().includes(ql)));
  results=applyEntryFilters(results);
  const total=results.length;
  results=results.slice(0,200);
  if(!total){div.innerHTML='<div class="search-empty-msg">❌ لا نتائج لـ &quot;'+q+'&quot;</div>';return;}
  const projMap={};allProjects.forEach(p=>projMap[p.id]=p.name);
  const profMap=await getProfileMap();
  div.innerHTML='<div class="search-results-count">📊 '+total+' نتيجة'+(total>200?" (أول 200)":"")+'</div>'+results.map((e,i)=>buildSearchCard(e,i,results.length,projMap,profMap)).join('');
  setTimeout(()=>{results.forEach(e=>{const el=document.getElementById('se-date-'+e.id);if(el)initDateInput(el);});},0);
}catch(_e){const _d=document.getElementById('searchResult');if(_d)_d.innerHTML='<div class="search-warn-msg">⚠️ خطأ في البحث</div>';}}
async function searchByAmt(){
  const amt=parseFloat(document.getElementById('searchAmtInp').value);
  const div=document.getElementById('searchResult');
  if(!amt||isNaN(amt)){div.innerHTML='<div class="search-warn-msg">⚠️ أدخل المبلغ</div>';return;}
  div.innerHTML='<div class="search-loading-msg">⏳ جاري البحث...</div>';
  let range=0;
  if(document.getElementById('amt-100').checked)range=100;
  else if(document.getElementById('amt-500').checked)range=500;
  else if(document.getElementById('amt-1000').checked)range=1000;
  const min=amt-range;
  const max=amt+range;
  let results=allEntries.filter(e=>Math.abs(e.amount)>=min&&Math.abs(e.amount)<=max);
  results=applyEntryFilters(results);
  const total=results.length;
  results=results.slice(0,200);
  if(!total){div.innerHTML='<div class="search-empty-msg">❌ لا نتائج للمبلغ '+fn(amt)+' ج</div>';return;}
  const projMap={};allProjects.forEach(p=>projMap[p.id]=p.name);
  const profMap=await getProfileMap();
  div.innerHTML='<div class="search-results-count">📊 '+total+' نتيجة'+(total>200?" (أول 200)":"")+'</div>'+results.map((e,i)=>buildSearchCard(e,i,results.length,projMap,profMap)).join('');
  setTimeout(()=>{results.forEach(e=>{const el=document.getElementById('se-date-'+e.id);if(el)initDateInput(el);});},0);
}
async function getProfileMap(){
  if(_profMapCache)return _profMapCache;
  try{const profs=await sb('profiles');_profMapCache={};profs.forEach(p=>{_profMapCache[p.id]=p.name||'—';});}catch(e){_profMapCache={};}
  return _profMapCache;
}
function buildSearchCard(e,idx,total,projMap,profMap){
  const isInc=e.type==='i';
  const projName=(projMap&&projMap[e.project_id])||'—';
  const creator=(profMap&&e.created_by)?(profMap[e.created_by]||'—'):(typeof uName!=='undefined'?uName:'—');
  let dtVal='';
  if(e.entry_date&&e.entry_date!=='—'){dtVal=cleanDate(e.entry_date)||e.entry_date;}
  const projOpts=allProjects.map(p=>'<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>').join('');
  const topInfo=total>1?'<div class="search-card">نتيجة '+(idx+1)+' من '+total+'</div>':'';
  const catVal=(e.category||'').replace(/"/g,'&quot;');
  const mqVal=(e.contractor||'').replace(/"/g,'&quot;');
  const descVal=(e.description||'').replace(/"/g,'&quot;');
  return '<div id="sc-'+e.id+'" class="search-card-header">'+
    '<div class="search-card-type-badge">'+
      '<div><div class="mq-card-name">قيد رقم '+(e.entry_no||'?')+' — '+projName+'</div>'+
      '<div class="search-card-amount">✍️ أدخله: '+creator+'</div></div>'+
      '<span class="search-card-meta">'+(isInc?'⬆ وارد':'⬇ مصروف')+'</span>'+
    '</div>'+
    '<div style="padding:14px 16px">'+topInfo+
      '<div class="search-edit-form">'+
        '<div><label class="lbl-md">📁 المشروع</label>'+
          '<select id="se-proj-'+e.id+'" class="search-edit-select">'+projOpts+'</select></div>'+
        '<div><label class="lbl-md">📊 النوع</label>'+
          '<select id="se-type-'+e.id+'" class="search-edit-select">'+
            '<option value="e"'+(isInc?'':' selected')+'>📥 مصروف</option>'+
            '<option value="i"'+(isInc?' selected':'')+'>📤 وارد</option></select></div>'+
        '<div><label class="lbl-md">💰 المبلغ (ج)</label>'+
          '<input id="se-amt-'+e.id+'" type="number" step="any" value="'+e.amount+'" class="search-edit-number"></div>'+
        '<div><label class="lbl-md">📅 التاريخ</label>'+
          '<input id="se-date-'+e.id+'" type="text" value="'+dtVal+'" class="search-edit-input dp-input" readonly style="cursor:pointer"></div>'+
        '<div><label class="lbl-md">🏷️ البند</label>'+
          '<input id="se-cat-'+e.id+'" type="text" value="'+catVal+'" list="cl" class="search-edit-input"></div>'+
        '<div><label class="lbl-md">👷 المقاول</label>'+
          '<input id="se-mq-'+e.id+'" type="text" value="'+mqVal+'" class="search-edit-contractor"></div>'+
        '<div style="grid-column:1/-1"><label class="lbl-md">📝 البيان</label>'+
          '<input id="se-desc-'+e.id+'" type="text" value="'+descVal+'" class="search-edit-input"></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px">'+
        '<button onclick="saveSearchEdit(&quot;'+e.id+'&quot;)" class="search-edit-save-btn">💾 حفظ التعديلات</button>'+
        '<button onclick="deleteSearchEntry(&quot;'+e.id+'&quot;,'+(e.seq||0)+')" class="search-edit-del-btn">🗑 حذف</button>'+
      '</div>'+
      '<div id="se-msg-'+e.id+'" class="search-edit-msg"></div>'+
    '</div></div>';
}
async function saveSearchEdit(id){
  const msgEl=document.getElementById('se-msg-'+id);
  msgEl.innerHTML='⏳ جاري الحفظ...';msgEl.style.color='var(--text-soft)';
  const updates={project_id:document.getElementById('se-proj-'+id).value,type:document.getElementById('se-type-'+id).value,amount:parseFloat(document.getElementById('se-amt-'+id).value),entry_date:document.getElementById('se-date-'+id).value.trim(),category:document.getElementById('se-cat-'+id).value.trim(),contractor:document.getElementById('se-mq-'+id).value.trim(),description:document.getElementById('se-desc-'+id).value.trim()};
  if(isNaN(updates.amount)){msgEl.innerHTML='❌ أدخل مبلغ صحيح';msgEl.style.color='var(--danger)';return;}
  try{
    await sb('entries?id=eq.'+id,'PATCH',updates);
    const ix=allEntries.findIndex(x=>x.id===id);if(ix>=0)Object.assign(allEntries[ix],updates);
    const iy=entries.findIndex(x=>x.id===id);if(iy>=0)Object.assign(entries[iy],updates);
    msgEl.innerHTML='✅ تم الحفظ';msgEl.style.color='var(--primary-btn)';
    setSav('✅ تم تعديل القيد','ok');
    setTimeout(()=>{msgEl.innerHTML='';},3000);
  }catch(er){msgEl.innerHTML='❌ '+er.message;msgEl.style.color='var(--danger)';}
}
async function deleteSearchEntry(id,seq){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف القيد',msg:'هيتحذف القيد رقم '+seq+' نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  try{
    await sb('entries?id=eq.'+id,'DELETE');
    allEntries=allEntries.filter(x=>x.id!==id);entries=entries.filter(x=>x.id!==id);
    const card=document.getElementById('sc-'+id);
    if(card){card.style.opacity='0';card.style.transition='all .3s';setTimeout(()=>card.remove(),300);}
    setSav('✅ تم الحذف','ok');
    setTimeout(()=>{const r=document.getElementById('searchResult');if(r&&!r.querySelector('[id^="sc-"]'))r.innerHTML='<div class="search-deleted-msg">✅ تم حذف القيد</div>';},400);
  }catch(er){notify('❌ '+er.message,'err');}
}
// ══════════════════════════════════

async function downloadAdvTemplate(){
  setSav('⏳ جاري توليد الـ Template...','ng');
  try{
    await loadExcelJSLib();
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    wb.creator='Legacy Fine Touch';
    const ws=wb.addWorksheet('مصروفات العهدة');
    ws.views=[{rightToLeft:true}];

    // قوائم للـ dropdown
    const projNames=allProjects.map(p=>p.name);
    const cats=[...new Set(allEntries.filter(e=>e.type==='e').map(e=>e.category).filter(Boolean))];
    const mqs=[...new Set(allEntries.filter(e=>e.contractor).map(e=>e.contractor).filter(Boolean))];

    // ورقة مخفية للقوائم
    const wsL=wb.addWorksheet('_lists');
    wsL.state='veryHidden';
    projNames.forEach((n,i)=>wsL.getCell(i+1,1).value=n);
    cats.forEach((c,i)=>wsL.getCell(i+1,2).value=c);
    mqs.forEach((m,i)=>wsL.getCell(i+1,3).value=m);

    // Title
    ws.mergeCells('A1:F1');
    const t=ws.getCell('A1');
    t.value='نموذج استيراد مصروفات العهدة — Legacy Fine Touch';
    t.font={bold:true,color:{argb:'FFFFFFFF'},size:13,name:'Arial'};
    t.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1D3C2A'}};
    t.alignment={horizontal:'center',vertical:'middle'};
    ws.getRow(1).height=36;

    // Warning
    ws.mergeCells('A2:F2');
    const w=ws.getCell('A2');
    w.value='⚠ اختر من القوائم المنسدلة فقط — التاريخ بصيغة dd/mm/yyyy';
    w.font={color:{argb:'FF7B4F00'},size:9,name:'Arial'};
    w.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF3CD'}};
    w.alignment={horizontal:'center',vertical:'middle'};
    ws.getRow(2).height=20;

    // Headers
    const hdrs=['المبلغ','البند','البيان','التاريخ (dd/mm/yyyy)','المقاول','اسم المشروع'];
    const widths=[14,18,26,18,18,22];
    ws.getRow(3).height=26;
    hdrs.forEach((h,i)=>{
      ws.getColumn(i+1).width=widths[i];
      const c=ws.getCell(3,i+1);
      c.value=h;
      c.font={bold:true,color:{argb:'FFFFFFFF'},size:10,name:'Arial'};
      c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2E5E42'}};
      c.alignment={horizontal:'center',vertical:'middle'};
      c.border={bottom:{style:'medium',color:{argb:'FF1D3C2A'}}};
    });

    // Data rows with dropdowns
    for(let r=4;r<=103;r++){
      ws.getRow(r).height=20;
      const bg=r%2===0?'FFFFFFFF':'FFF9F7F2';
      for(let c=1;c<=6;c++){
        const cell=ws.getCell(r,c);
        cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};
        cell.font={size:10,name:'Arial'};
        cell.alignment={horizontal:c===1||c===4?'center':'right',vertical:'middle'};
        cell.border={bottom:{style:'thin',color:{argb:'FFDDDDDD'}},right:{style:'thin',color:{argb:'FFDDDDDD'}}};
      }
      // البند dropdown
      if(cats.length){
        ws.getCell(r,2).dataValidation={type:'list',formulae:[`_lists!$B$1:$B$${cats.length}`],showErrorMessage:true,errorTitle:'قيمة غير صحيحة',error:'اختر من القائمة'};
      }
      // المقاول dropdown
      if(mqs.length){
        ws.getCell(r,5).dataValidation={type:'list',formulae:[`_lists!$C$1:$C$${mqs.length}`],showErrorMessage:false};
      }
      // المشروع dropdown
      if(projNames.length){
        ws.getCell(r,6).dataValidation={type:'list',formulae:[`_lists!$A$1:$A$${projNames.length}`],showErrorMessage:true,errorTitle:'مشروع غير موجود',error:'اختر من القائمة'};
      }
    }

    // Note
    ws.mergeCells('A104:F104');
    const n=ws.getCell('A104');
    n.value='المقاول اختياري — يمكن تركه فارغاً';
    n.font={color:{argb:'FF999999'},size:9,name:'Arial',italic:true};
    n.alignment={horizontal:'center'};

    // Download
    const buf=await wb.xlsx.writeBuffer();
    const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='advance_template_'+new Date().toLocaleDateString('ar-EG').replace(/\//g,'-')+'.xlsx';
    a.click();
    setSav('✅ تم تحميل الـ Template','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

// ══════════ APPROVAL SYSTEM ══════════
async function updatePendingBadge(){
  try{
    const [e1,e2]=await Promise.all([
      sb('pending_entries?status=eq.pending&select=id'),
      sb('pending_advances?status=eq.pending&select=id')
    ]);
    const cnt=(e1?e1.length:0)+(e2?e2.length:0);
    const badge=document.getElementById('pending-badge');
    if(badge){badge.textContent=cnt;badge.style.display=cnt>0?'inline':'none';}
  }catch(e){console.error(e);}
}

async function loadApprovals(){
  const el=document.getElementById('approvalsList');
  if(!el)return;
  el.innerHTML='<div class="appr-loading">⏳ جاري التحميل...</div>';
  try{
    const [entRows,advRows]=await Promise.all([
      sb('pending_entries?status=eq.pending&order=submitted_at.asc'),
      sb('pending_advances?status=eq.pending&order=submitted_at.asc')
    ]);
    const hasEntries=entRows&&entRows.length;
    const hasAdv=advRows&&advRows.length;
    if(!hasEntries&&!hasAdv){
      el.innerHTML='<div class="appr-empty">🎉 لا يوجد قيود في الانتظار</div>';
      return;
    }
    const projMap={};allProjects.forEach(p=>projMap[p.id]=p.name);
    const advMap={};advances.forEach(a=>advMap[a.id]=a.person_name);
    const profMap=await getProfileMap();
    let html='';

    // ── قيود المشاريع ──
    if(hasEntries){
      html+=`<div class="appr-entries-title">📋 قيود المشاريع (${entRows.length})</div>`;
      html+=entRows.map(r=>{
        const proj=projMap[r.project_id]||'—';
        const typeLabel=r.type==='i'
          ?'<span class="appr-income-badge">📤 وارد</span>'
          :'<span class="appr-expense-badge">📥 مصروف</span>';
        return `<div class="appr-item">
          <div class="appr-item-header">
            <div class="appr-item-title-row">
              ${typeLabel}
              <span class="title-sm">${fn(r.amount)} ج</span>
              ${r.category?`<span class="appr-item-cat">${r.category}</span>`:''}
            </div>
            <span class="appr-meta-sm">${r.submitted_at?r.submitted_at.substring(0,16).replace('T',' '):'—'}</span>
          </div>
          <div class="appr-item-meta">
            ${r.description?`<span>📝 ${r.description}</span> &nbsp;`:''}
            ${r.contractor?`<span>👷 ${r.contractor}</span> &nbsp;`:''}
            <span class="appr-meta-text">🏗️ ${proj}</span> &nbsp;
            <span class="appr-meta-text">📅 ${r.entry_date||'—'}</span> &nbsp;
            <span class="appr-meta-text">👤 ${profMap[r.submitted_by]||'—'}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button onclick="approveEntry('${r.id}')" class="appr-approve-btn">✅ موافقة</button>
            <button onclick="editAndApproveEntry('${r.id}')" class="appr-edit-approve-btn">✏️ تعديل وموافقة</button>
            <button onclick="rejectEntry('${r.id}')" class="appr-reject-btn">❌ رفض</button>
          </div>
        </div>`;
      }).join('');
    }

    // ── العهد ──
    if(hasAdv){
      html+=`<div class="appr-advances-title">💼 العهد والدفعات (${advRows.length})</div>`;
      html+=advRows.map(r=>{
        const isAdv=r.type==='advance';
        const label=isAdv
          ?'<span class="appr-adv-new-badge">💼 عهدة جديدة</span>'
          :'<span class="appr-adv-inst-badge">💰 دفعة</span>';
        const detail=isAdv
          ?`<span class="title-sm">${r.person_name||'—'}</span>${r.notes?` <span class="appr-meta-text">· ${r.notes}</span>`:''}`
          :`<span class="title-sm">${fn(r.amount)} ج</span> <span class="appr-meta-text">لـ ${advMap[r.advance_id]||'—'}</span> <span class="appr-meta-sm">· ${r.inst_note||'دفعة'}</span>`;
        return `<div class="appr-item">
          <div class="appr-item-header">
            <div class="appr-item-title-row">${label} ${detail}</div>
            <span class="appr-meta-sm">${r.submitted_at?r.submitted_at.substring(0,16).replace('T',' '):'—'}</span>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="approveAdv('${r.id}')" class="appr-adv-approve-btn">✅ موافقة</button>
            <button onclick="rejectAdv('${r.id}')" class="appr-adv-reject-btn">❌ رفض</button>
          </div>
        </div>`;
      }).join('');
    }
    el.innerHTML=html;
  }catch(e){el.innerHTML='<div style="color:var(--danger);padding:20px">❌ خطأ: '+e.message+'</div>';}
}

async function editAndApproveEntry(id){
  try{
    const rows=await sb('pending_entries?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ القيد مش موجود','er');return;}
    const r=rows[0];
    const projOptions=allProjects.map(p=>`<option value="${p.id}"${p.id===r.project_id?' selected':''}>${p.name}</option>`).join('');
    const inp='width:100%;padding:10px;border:1.5px solid var(--border-mid,#e0e0e0);border-radius:10px;font-family:inherit;font-size:13px;margin-bottom:12px;box-sizing:border-box;background:var(--input-bg,#f9f9f9);color:var(--text-body,#222)';
    let ov=document.getElementById('eaModal');
    if(ov)ov.remove();
    ov=document.createElement('div');
    ov.id='eaModal';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    ov.innerHTML=`
      <div class="appr-edit-modal-box">
        <div class="modal-hdr">
          <div class="title-md">✏️ تعديل القيد قبل الموافقة</div>
          <button onclick="document.getElementById('eaModal').remove()" class="appr-edit-modal-close">✕</button>
        </div>
        <label class="lbl-lg">🏗️ المشروع</label>
        <select id="eaProjId" style="${inp}">
          ${projOptions}
        </select>
        <label class="lbl-lg">النوع</label>
        <select id="eaType" style="${inp}">
          <option value="e" ${r.type==='e'?'selected':''}>📥 مصروف</option>
          <option value="i" ${r.type==='i'?'selected':''}>📤 وارد</option>
        </select>
        <label class="lbl-lg">المبلغ</label>
        <input id="eaAmount" type="number" value="${r.amount||''}" style="${inp}">
        <label class="lbl-lg">البيان</label>
        <input id="eaDesc" type="text" value="${(r.description||'').replace(/"/g,'&quot;')}" style="${inp}">
        <label class="lbl-lg">البند</label>
        <input id="eaCat" type="text" value="${(r.category||'').replace(/"/g,'&quot;')}" style="${inp}">
        <label class="lbl-lg">المقاول</label>
        <input id="eaContr" type="text" value="${(r.contractor||'').replace(/"/g,'&quot;')}" style="${inp}">
        <label class="lbl-lg">التاريخ</label>
        <input id="eaDate" type="text" value="${r.entry_date||''}" placeholder="dd/mm/yyyy" style="${inp}margin-bottom:20px">
        <div class="modal-btns">
          <button onclick="confirmEditApprove('${id}')" class="btn-primary">✅ حفظ وموافقة</button>
          <button onclick="document.getElementById('eaModal').remove()" class="btn-cancel">إلغاء</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
    setTimeout(()=>initDateInput(document.getElementById('eaDate')),0);
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function confirmEditApprove(id){
  const amt=parseFloat(document.getElementById('eaAmount').value);
  if(!amt||amt<=0){setSav('❌ المبلغ مش صح','er');return;}
  const newProjId=document.getElementById('eaProjId').value;
  if(!newProjId){setSav('❌ اختر المشروع','er');return;}
  try{
    const rows=await sb('pending_entries?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ القيد مش موجود','er');return;}
    const r=rows[0];
    const last=await sb('entries?select=entry_no&order=entry_no.desc&limit=1');
    let nextSeq=(last&&last.length?Number(last[0].entry_no||20260000):20260000);
    if(nextSeq<20260000)nextSeq=20260000;
    nextSeq++;
    const entry={
      id:r.id,
      project_id:newProjId,
      type:document.getElementById('eaType').value,
      amount:amt,
      category:document.getElementById('eaCat').value.trim(),
      description:document.getElementById('eaDesc').value.trim(),
      entry_date:document.getElementById('eaDate').value.trim(),
      contractor:document.getElementById('eaContr').value.trim(),
      advance_id:r.advance_id||null,
      seq:nextSeq,
      created_by:r.submitted_by
    };
    await sb('entries','POST',entry);
    await sb('pending_entries?id=eq.'+id,'DELETE');
    // حدّث الذاكرة
    allEntries=allEntries.filter(e=>e.id!==entry.id);
    allEntries.push(entry);
    if(newProjId===curPid){entries=[...allEntries.filter(e=>e.project_id===curPid)];rp();}
    document.getElementById('eaModal')?.remove();
    const projName=allProjectsMap[newProjId]?.name||'';
    setSav(`✅ تم الحفظ في مشروع "${projName}"${ newProjId!==r.project_id?' (تم النقل)':''}`,  'ok');
    updatePendingBadge();
    loadApprovals();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function approveEntry(id){
  await new Promise(res=>showConfirm({icon:'✅',title:'موافقة على القيد',msg:'هيتحفظ القيد في المشروع.',okLabel:'موافقة',okType:'success',onOk:res}));
  try{
    // جيب القيد من pending
    const rows=await sb('pending_entries?id=eq.'+id);
    if(!rows||!rows.length)return;
    const r=rows[0];
    // احسب آخر seq
    const last=await sb('entries?select=entry_no&order=entry_no.desc&limit=1');
    let nextSeq=(last&&last.length?Number(last[0].entry_no||20260000):20260000);
    if(nextSeq<20260000)nextSeq=20260000;
    nextSeq++;
    // انقله لـ entries
    const entry={id:r.id,project_id:r.project_id,type:r.type,amount:r.amount,category:r.category||'',description:r.description||'',entry_date:r.entry_date||'',contractor:r.contractor||'',advance_id:r.advance_id||null,seq:nextSeq,created_by:r.submitted_by};
    await sb('entries','POST',entry);
    // احذفه من pending
    await sb('pending_entries?id=eq.'+id,'DELETE');
    // لو المشروع ده اللي مفتوح، حدّث البيانات
    if(r.project_id===curPid){await loadEntries();allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);}
    setSav('✅ تمت الموافقة وتم حفظ القيد','ok');
    updatePendingBadge();
    loadApprovals();
    if(curAdv)loadAdvDetail();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function rejectEntry(id){
  await new Promise(res=>showConfirm({icon:'❌',title:'رفض القيد',msg:'هيتحذف القيد نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_entries?id=eq.'+id,'DELETE');
    setSav('🗑️ تم رفض القيد','ng');
    updatePendingBadge();
    loadApprovals();
    if(curAdv)loadAdvDetail();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}
// ══════════════════════════════════════

async function approveAdv(id){
  await new Promise(res=>showConfirm({icon:'✅',title:'موافقة على الطلب',msg:'هيتحفظ الطلب.',okLabel:'موافقة',okType:'success',onOk:res}));
  try{
    const rows=await sb('pending_advances?id=eq.'+id);
    if(!rows||!rows.length)return;
    const r=rows[0];
    if(r.type==='advance'){
      const a=await sb('advances','POST',{person_name:r.person_name,amount:0,notes:r.notes||'',status:'open',user_id:r.adv_user_id||r.submitted_by});
      advances.push(a[0]);
      setSav('✅ تمت الموافقة — تم إنشاء العهدة','ok');
    }else if(r.type==='installment'){
      await sb('advance_installments','POST',{advance_id:r.advance_id,amount:r.amount,inst_date:r.inst_date||'',note:r.inst_note||'دفعة'});
      setSav('✅ تمت الموافقة — تم إضافة الدفعة','ok');
    }
    await sb('pending_advances?id=eq.'+id,'DELETE');
    updatePendingBadge();
    loadApprovals();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function rejectAdv(id){
  await new Promise(res=>showConfirm({icon:'❌',title:'رفض الطلب',msg:'هيتحذف الطلب نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_advances?id=eq.'+id,'DELETE');
    setSav('🗑️ تم الرفض','ng');
    updatePendingBadge();
    loadApprovals();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>{console.error(e);});});
}
// Reset zoom after keyboard closes on iOS
document.addEventListener('focusout',()=>{
  if(/iPhone|iPad|iPod/.test(navigator.userAgent)){
    window.scrollTo(0,0);
  }
});

// ══════════════════════════════════════════════════
//  NOTIFICATION SYSTEM
// ══════════════════════════════════════════════════
let notifList=[];
let notifUnread=0;
let notifPanelOpen=false;
let npCurrentTab='notifs';
let notifUserMap={};// user_id→{name,role}
let _rtNotifCh=null;
let _rtPendNotifCh=null;
let _rtPresenceCh=null;
let onlineUsersData=[];

const NOTIF_ICONS={
  entry_add:'📥',entry_income:'📤',entry_del:'🗑️',entry_edit:'✏️',
  adv_new:'💼',adv_inst:'💰',adv_approve:'✅',
  pending_entry:'⏳',pending_adv:'⏳',
  online:'🟢',offline:'⚫',
  approve:'✅',reject:'❌'
};
const NOTIF_TYPES={
  entry_add:'nt-entry',entry_income:'nt-entry',entry_del:'nt-delete',entry_edit:'nt-entry',
  adv_new:'nt-adv',adv_inst:'nt-inst',adv_approve:'nt-approve',
  pending_entry:'nt-pending',pending_adv:'nt-pending',
  online:'nt-online',approve:'nt-approve',reject:'nt-delete'
};
const ROLE_LABELS={'admin':'👑 أدمن','editor':'✏️ محاسب','viewer':'👁 مشاهد'};

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
  }catch(e){console.error(e);}
}

async function getUserName(userId){
  if(!userId)return 'مستخدم';
  if(notifUserMap[userId])return notifUserMap[userId].name||'مستخدم';
  // لو مش موجود في الـ map، اجيب البيانات
  try{await refreshOnlineUsers();}catch(e){console.error(e);}
  return notifUserMap[userId]?.name||'مستخدم';
}

async function updatePresence(){
  // stub — presence system removed with chat
  try{
    if(!window._sbc||!uid)return;
    await _sbc.from('user_presence').upsert({user_id:uid,is_online:true,last_seen:new Date().toISOString()},{onConflict:'user_id'});
  }catch(e){console.error(e);}
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
  // polling للموافقات كل 5 ثواني للأدمن
  if(uRole==='admin'){
    setInterval(async()=>{
      await updatePendingBadge();
      if(curScreen==='approvals')loadApprovals();
    },5000);
  }
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
        loadApprovals();
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
        loadApprovals();
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

