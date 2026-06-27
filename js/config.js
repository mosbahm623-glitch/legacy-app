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
function setLS(m,c){const el=document.getElementById('lst');if(el){el.textContent=m;el.className='lst '+c;}}
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
