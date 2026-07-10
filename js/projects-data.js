async function loadAllProjects(){
  // نجيب المشاريع + الملخصات من الـ View مرة واحدة
  [allProjects,allEntries]=await Promise.all([
    sbAll('projects?order=created_at'),
    sbAll('entries?select=id,seq,project_id,type,amount,category,description,contractor,entry_date,advance_id&order=entry_date.desc')
  ]);
  try{ if(!advances||!advances.length){ const _advs=await sb('advances?select=id,name'); if(_advs&&_advs.length) advances=_advs; } }catch(e){}
  // استخدم seq كـ entry_no لو seq أكبر من 20260000
  allEntries.forEach(e=>{if(e.seq&&e.seq>20260000)e.seq=e.seq;});
  // نجيب الملخصات الجاهزة من الـ View
  let summariesData=[];
  try{ summariesData=await sb('project_summaries'); }catch(e){console.warn('project_summaries failed:',e);}
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
    const auditBtn=document.getElementById('sbi-auditlog');if(auditBtn)auditBtn.style.display='flex';
    updateBackupDateDisplay();
  }
  populateAdvProjSel();
  buildSidebarProjects();
}
function populateAdvProjSel(){
  const sel=document.getElementById('advProjSel');
  if(!sel)return;
  sel.innerHTML='<option value="">اختار المشروع</option>';
  allProjects.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;sel.appendChild(o);});
}
async function loadProjects(){
  setSav('⏳ جاري التحميل...','ng');
  try{
    if(uRole==='admin'||uRole==='super_admin'||uRole==='viewer'||uRole==='owner'||uRole==='editor'){projects=allProjects;}
    else{const acc=await sb('project_access?user_id=eq.'+uid);if(!acc.length){projects=[];}else{const ids=acc.map(a=>a.project_id);projects=allProjects.filter(p=>ids.includes(p.id));}}
    if(!projects.length&&uRole==='admin'){const p=await sb('projects','POST',{name:'مشروع جديد',start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects=allProjects;}
    if(projects.length){curPid=projects[0].id;await loadEntries();}
    setSav('☁️ متصل — بياناتك محفوظة','ok');if(curScreen==='proj'||!curScreen)rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}
async function loadEntries(){if(!curPid)return;entries=await sbAll('entries?project_id=eq.'+curPid+'&order=created_at');entries.forEach(e=>{if(e.seq&&e.seq>20260000)e.seq=e.seq;});}

