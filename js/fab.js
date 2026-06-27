// ██ FAB — FLOATING ACTION BUTTON ══════════════════
function toggleFab(){
  if(uRole==='owner'){showScreen('owner');return;}
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
  const filterEl=document.getElementById('dailyDateFilter');
  const filterVal=filterEl?filterEl.value:'';
  const targetDate=filterVal||new Date().toISOString().split('T')[0];
  const d=filterVal?new Date(filterVal):new Date();
  const label=d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
  document.getElementById('dailyDateTitle').textContent='📋 Booking Journal — '+label;
  const container=document.getElementById('dailyList');
  let todayEntries=[];
  try{
    // تحويل yyyy-mm-dd لـ dd/mm/yyyy عشان يتطابق مع الداتابيز
    const _p=targetDate.split('-');
    const entryDateFmt=_p.length===3?_p[2]+'/'+_p[1]+'/'+_p[0]:targetDate;
    console.log('Booking Journal query date:', entryDateFmt);
    const res=await sb('entries?entry_date=eq.'+encodeURIComponent(entryDateFmt)+'&order=seq.desc');
    console.log('Booking Journal results:', res?.length);
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
        <div class="entry-desc">${e.description||'—'}</div>
        <div class="daily-proj" style="display:flex;gap:6px;align-items:center">${proj}${e.category?' · '+e.category:''} ${e.seq&&e.seq!==0?'<span style="font-size:10px;background:#1C3A1C;color:#C0DD97;padding:1px 7px;border-radius:4px;font-weight:500">'+e.seq+'</span>':''}</div>
        <div class="daily-proj">${proj}${e.category?' · '+e.category:''}${e.payment_method?' · 💳 '+e.payment_method:''}</div>
      </div>
      <div class="daily-amt ${isInc?'inc':'exp'}">${isInc?'+':'-'}${fn(Math.abs(e.amount))} ج</div>
      <button onclick="event.stopPropagation();printReceipt('${e.id}')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500;margin-right:4px;flex-shrink:0">إيصال</button>
    </div>`;
  }).join('');
}

// BACKUP

function toggleEntFullscreen(){
  const ent=document.getElementById('ent');
  const btn=document.getElementById('entExpandBtn');
  if(!ent)return;
  const isFs=ent.classList.contains('ent-fullscreen');
  if(isFs){
    ent.classList.remove('ent-fullscreen');
    document.body.classList.remove('ent-fs');
    if(btn)btn.innerHTML='⛶';
    if(btn)btn.title='تكبير الجدول';
  }else{
    ent.classList.add('ent-fullscreen');
    document.body.classList.add('ent-fs');
    if(btn)btn.innerHTML='✕';
    if(btn)btn.title='إغلاق التكبير';
    // ESC to close
    const esc=e=>{if(e.key==='Escape'){ent.classList.remove('ent-fullscreen');document.body.classList.remove('ent-fs');if(btn){btn.innerHTML='⛶';btn.title='تكبير الجدول';}document.removeEventListener('keydown',esc);}};
    document.addEventListener('keydown',esc);
  }
}
