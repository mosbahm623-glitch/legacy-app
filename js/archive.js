// ██ ARCHIVE — أرشيف المشاريع ══════════════════════
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

async function loadAuditLog(){
  const el=document.getElementById('auditLogList');
  if(!el)return;
  el.innerHTML='<div class="emp">⏳ جاري التحميل...</div>';
  try{
    const rows=await sb('audit_log?order=created_at.desc&limit=200');
    if(!rows||!rows.length){el.innerHTML='<div class="emp">لا يوجد سجلات بعد</div>';return;}
    const actionColor={
      'إضافة قيد':'var(--success)','موافقة على قيد':'var(--success)',
      'حذف قيد':'var(--danger)','رفض قيد':'var(--danger)',
    };
    el.innerHTML=rows.map(r=>{
      const dt=new Date(r.created_at);
      const dateStr=String(dt.getDate()).padStart(2,'0')+'/'+String(dt.getMonth()+1).padStart(2,'0')+'/'+dt.getFullYear()+' '+String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0');
      const color=actionColor[r.action]||'var(--text-hint)';
      const details=r.details?Object.entries(r.details).filter(([k,v])=>v).map(([k,v])=>k+': '+v).join(' · '):'';
      return `<div class="rw" style="margin-bottom:6px">
        <div class="ri">
          <div class="rd"><span style="color:${color};font-weight:600">${r.action}</span> ${details?'<span style="color:var(--text-hint);font-size:11px">· '+details+'</span>':''}</div>
          <div class="rm">👤 ${r.user_name||'—'} · 📅 ${dateStr}</div>
        </div>
      </div>`;
    }).join('');
  }catch(e){el.innerHTML='<div style="color:var(--danger);padding:20px">❌ '+e.message+'</div>';}
}

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
    let summaries=[];
    try{summaries=await sb('project_summaries?select=project_id,inc,exp&project_id=in.('+pids.join(',')+')');}catch(_){}
    const summMap={};(summaries||[]).forEach(s=>{summMap[s.project_id]=s;});
    let archEntries=[];
    try{archEntries=await sbAll('entries?project_id=in.('+pids.join(',')+')&select=id,project_id,type,amount,category,advance_id');}catch(_){}
    _archiveData=archived.map(p=>{
      const s=summMap[p.id]||{};
      const inc=s.inc||0;
      const expDirect=s.exp||0;
      const bal=inc-expDirect;
      const pe=(archEntries||[]).filter(e=>e.project_id===p.id);
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
          <div style="display:flex;gap:6px">
            <button class="arch-edit-btn" onclick="openArchivedEntries('${p.id}')">📋 القيود</button>
            <button class="arch-edit-btn" onclick="editArchivedProject('${p.id}')">✏️ تعديل</button>
            <button class="arch-restore-btn" onclick="restoreProject('${p.id}','${safeName}')">↩ استعادة</button>
          </div>
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

async function openArchivedEntries(pid){
  const archProj=_archiveData.find(p=>p.id===pid);
  if(!archProj)return;
  // نضيفه مؤقتاً في allProjects و allProjectsMap فقط (مش projects عشان مش يظهر في الـ dropdown)
  if(!allProjects.find(p=>p.id===pid)){
    allProjects.push(archProj);
    allProjectsMap[pid]=archProj;
  }
  // مش نضيفه في projects عشان مش يظهر في dropdown التعديل
  showScreen('proj');
  await sw(pid);
  setSav('📦 مشروع مؤرشف — يمكن التعديل على قيوده','ok');
}

function editArchivedProject(pid){
  const p=_archiveData.find(x=>x.id===pid);
  if(!p)return;
  let ov=document.getElementById('editProjModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='editProjModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div class="modal-box-lg">
      <div class="modal-hdr">
        <div class="title-lg">✏️ تعديل المشروع المؤرشف</div>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-close-sm">✕</button>
      </div>
      <label class="lbl-lg">اسم المشروع</label>
      <input id="epName" type="text" value="${(p.name||'').replace(/"/g,'&quot;')}" class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div class="proj-edit-dates-row">
        <div>
          <label class="lbl-lg">📅 تاريخ البداية</label>
          <input id="epStart" type="text" value="${p.start_date||''}" placeholder="dd/mm/yyyy" class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div>
          <label class="lbl-lg">📅 تاريخ الإغلاق</label>
          <input id="epClose" type="text" value="${p.close_date||''}" placeholder="dd/mm/yyyy" class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
      </div>
      <label class="lbl-lg">📱 واتساب العميل (رقم 1)</label>
      <input id="epPhone" type="text" value="${(p.client_phone||'').replace(/"/g,'&quot;')}" placeholder="مثال: 201001234567"
        class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <label class="lbl-lg">📱 واتساب العميل (رقم 2)</label>
      <input id="epPhone2" type="text" value="${(p.client_phone2||'').replace(/"/g,'&quot;')}" placeholder="مثال: 201001234567"
        class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div id="epMsg" class="proj-edit-msg"></div>
      <div class="modal-btns">
        <button onclick="saveArchivedProjectEdit('${pid}')" class="btn-primary">💾 حفظ التعديلات</button>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById('epName').focus();
  setTimeout(()=>{initDateInput(document.getElementById('epStart'));initDateInput(document.getElementById('epClose'));},0);
}

async function saveArchivedProjectEdit(pid){
  const name=document.getElementById('epName').value.trim();
  const start=document.getElementById('epStart').value.trim();
  const close=document.getElementById('epClose').value.trim();
  const msg=document.getElementById('epMsg');
  if(!name){msg.style.color='var(--danger)';msg.textContent='❌ الاسم مطلوب';return;}
  msg.style.color='var(--warning-text)';msg.textContent='⏳ جاري الحفظ...';
  try{
    const phone=document.getElementById('epPhone').value.trim();
    const phone2=document.getElementById('epPhone2').value.trim();
    const upd={name,start_date:start||null,close_date:close||null,client_phone:phone||null,client_phone2:phone2||null};
    await sb('projects?id=eq.'+pid,'PATCH',upd);
    const idx=_archiveData.findIndex(p=>p.id===pid);
    if(idx>=0){_archiveData[idx]={..._archiveData[idx],...upd};}
    msg.style.color='var(--primary-btn)';msg.textContent='✅ تم الحفظ';
    setSav('✅ تم تعديل المشروع المؤرشف','ok');
    setTimeout(()=>{document.getElementById('editProjModal')?.remove();loadArchivedProjects();},700);
  }catch(e){msg.style.color='var(--danger)';msg.textContent='❌ خطأ: '+e.message;}
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

