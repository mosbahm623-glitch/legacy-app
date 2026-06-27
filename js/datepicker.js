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
