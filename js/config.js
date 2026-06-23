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

// ██ GLOBAL ERROR HANDLER ══════════════════════
window.addEventListener('unhandledrejection',function(e){
  console.error('Unhandled error:',e.reason);
  try{notify('❌ حدث خطأ غير متوقع — حاول تاني','err');}catch(_){}
});

// ██ AUDIT LOG ══════════════════════════════════
/**
 * يسجل عملية في الـ Audit Log
 * @param {string} action - اسم العملية مثل 'ADD_ENTRY'
 * @param {string} tableName - اسم الجدول
 * @param {string} recordId - ID السجل
 * @param {object} details - تفاصيل إضافية
 */
async function auditLog(action,tableName,recordId,details){
  try{
    await sb('audit_log','POST',{
      user_id:uid||null,
      user_name:uName||uEmail||'—',
      action,
      table_name:tableName||null,
      record_id:String(recordId||''),
      details:details||null
    });
  }catch(e){console.warn('audit log failed:',e);}
}


// ══════════════════════════════════════════
// ██ SUPABASE CONFIG + GLOBAL VARIABLES
// ══════════════════════════════════════════
const SB='https://ctcoqgluaytwelnutrox.supabase.co';
const AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
let token=null,uid=null,uRole=null,uName='',uEmail='';
let projects=[],entries=[],allProjects=[],allEntries=[],advances=[],allInstallments=[],curPid=null,curAdv=null;
let allProjectsMap={};
let cT='e',cTab='s',edId=null,edType=null,imType='e',xOK=false,curScreen='proj';
let allChatUsers=[];
let _rtEntCh=null,_rtAdvCh=null;


// ══════════════════════════════════════════
// ██ SUPABASE HELPERS — sb / sbAll / sbAuth
// ══════════════════════════════════════════
/**
 * طلب HTTP لـ Supabase REST API
 * @param {string} path - المسار مثل 'entries?project_id=eq.123'
 * @param {string} [method='GET'] - GET | POST | PATCH | DELETE
 * @param {object} [body] - البيانات المرسلة (POST/PATCH)
 * @returns {Promise<any>} البيانات المرجعة من Supabase
 */
async function sb(path,method,body){
  const h={'apikey':AK,'Authorization':'Bearer '+(token||AK),'Content-Type':'application/json'};
  if(method==='POST'||method==='PATCH')h['Prefer']='return=representation';
  const r=await fetch(SB+'/rest/v1/'+path,{method:method||'GET',headers:h,body:body?JSON.stringify(body):undefined,cache:'no-store'});
  if(!r.ok)throw new Error(await r.text());
  if(r.status===204)return null;
  return r.json();
}
// يجيب كل الصفوف على دفعات 1000 — يتخطى حد Supabase الافتراضي
/**
 * يجيب كل الصفوف بالـ pagination — يتخطى حد الـ 1000 صف
 * @param {string} path - المسار مثل 'entries?project_id=eq.123'
 * @returns {Promise<Array>} كل الصفوف
 */
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

// ══════════════════════════════════════════
// ██ UTILITY FUNCTIONS — helpers عامة
// ══════════════════════════════════════════
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
/** تنسيق الأرقام بالفواصل — مثال: 1000 → 1,000 */
function fn(n){return Number(n||0).toLocaleString('en-US');}
function uid_(){return crypto.randomUUID();}
function ts(){const d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();}
function fd(d){
  if(!d)return'';
  if(d.includes('/')&&/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d.trim()))return d.trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(d.trim())){const p=d.trim().split('-');return p[2]+'/'+p[1]+'/'+p[0];}
  // Full date string like "Wed Jun 03 2026 03:00:00..."
  const dt=new Date(d);
  if(!isNaN(dt))return String(dt.getDate()).padStart(2,'0')+'/'+String(dt.getMonth()+1).padStart(2,'0')+'/'+dt.getFullYear();
  return d;
}

// ██ DATE PICKER + PARSE UTILS ════════════════════
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
function gJ(){const all=entries.map(e=>({...e}));all.sort((a,b)=>pdt(a.entry_date)-pdt(b.entry_date)||(a.seq||0)-(b.seq||0));let b=0;all.forEach(e=>{b+=e.type==='i'?e.amount:-e.amount;e.bal=b;});return all;}
function gM(){const map={};pExp().forEach(e=>{if(!e.contractor)return;if(!map[e.contractor])map[e.contractor]={n:e.contractor,t:0,cnt:0,cats:new Set(),last:''};const m=map[e.contractor];m.t+=e.amount;m.cnt++;if(e.category)m.cats.add(e.category);if(pdt(e.entry_date)>pdt(m.last))m.last=e.entry_date;});return Object.values(map).sort((a,b)=>b.t-a.t).map(m=>({...m,ca:[...m.cats]}));}

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

// ██ REALTIME ══════════════════════════════════════
// تليفون مفتوح مع Supabase — أي تغيير يوصل فورًا
let _sbClient = null;

function getSbClient() {
  if (_sbClient) return _sbClient;
  if (window.supabase && window.supabase.createClient) {
    _sbClient = window.supabase.createClient(SB, AK);
  }
  return _sbClient;
}

function initRealtime() {
  const client = getSbClient();
  if (!client) { console.warn('Supabase client غير متاح'); return; }

  // إلغاء أي اشتراك قديم
  if (_rtEntCh) { try { client.removeChannel(_rtEntCh); } catch(_) {} _rtEntCh = null; }
  if (_rtAdvCh) { try { client.removeChannel(_rtAdvCh); } catch(_) {} _rtAdvCh = null; }

  // ── Channel 1: entries ──────────────────────────
  _rtEntCh = client.channel('rt-entries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, async (payload) => {
      try {
        const { eventType, new: nw, old: ol } = payload;
        if (eventType === 'INSERT') {
          if (!allEntries.find(e => e.id === nw.id)) {
            allEntries.push(nw);
            if (nw.project_id) refreshProjSummary(nw.project_id);
          }
        } else if (eventType === 'UPDATE') {
          const idx = allEntries.findIndex(e => e.id === nw.id);
          if (idx !== -1) allEntries[idx] = nw;
          else allEntries.push(nw);
          if (nw.project_id) refreshProjSummary(nw.project_id);
          if (ol?.project_id && ol.project_id !== nw.project_id) refreshProjSummary(ol.project_id);
        } else if (eventType === 'DELETE') {
          const idx = allEntries.findIndex(e => e.id === ol.id);
          if (idx !== -1) allEntries.splice(idx, 1);
          if (ol?.project_id) refreshProjSummary(ol.project_id);
        }
        // تحديث الداشبورد إذا كان مفتوحًا
        _rtRefreshVisible();
      } catch(e) { console.warn('Realtime entries error:', e); }
    })
    .subscribe();

  // ── Channel 2: pending_entries ──────────────────
  _rtAdvCh = client.channel('rt-pending')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_entries' }, async () => {
      try { _rtRefreshVisible(); } catch(e) {}
    })
    .subscribe();

  console.log('✅ Realtime مفعّل');
}

// Debounce timer — يمنع تكرار التحديث لو جه أكتر من event في نفس الوقت
let _rtDebounceTimer = null;

// بيحدث الشاشة اللي أنت واقف عليها بس — مع debounce 800ms
function _rtRefreshVisible() {
  if (window._blockRtRefresh) return;
  if (_rtDebounceTimer) clearTimeout(_rtDebounceTimer);
  _rtDebounceTimer = setTimeout(() => {
    _rtDebounceTimer = null;
    if (window._blockRtRefresh) return;
    const s = curScreen || '';
    if (s === 'dash') {
      if (typeof loadDashboard === 'function') loadDashboard();
    } else if (s === 'proj' && curPid) {
      if (typeof loadEntries === 'function') loadEntries();
    } else if (s === 'tl') {
      if (typeof loadTimeline === 'function') loadTimeline();
    }
  }, 800);
}

// إيقاف الـ Realtime لما المستخدم يسجل خروج
function stopRealtime() {
  const client = getSbClient();
  if (!client) return;
  if (_rtEntCh) { try { client.removeChannel(_rtEntCh); } catch(_) {} _rtEntCh = null; }
  if (_rtAdvCh) { try { client.removeChannel(_rtAdvCh); } catch(_) {} _rtAdvCh = null; }
}
