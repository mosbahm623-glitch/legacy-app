// ██ SEARCH — البحث الشامل ══════════════════════════
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
    let data=await sb('entries?seq=eq.'+seq+'&order=created_at');
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
  const creator=(profMap&&e.created_by)?(profMap[e.created_by]||'—'):'—';
  let dtVal='';
  if(e.entry_date&&e.entry_date!=='—'){dtVal=cleanDate(e.entry_date)||e.entry_date;}
  const projOpts=allProjects.map(p=>'<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>').join('');
  const topInfo=total>1?'<div class="search-card">نتيجة '+(idx+1)+' من '+total+'</div>':'';
  const catVal=(e.category||'').replace(/"/g,'&quot;');
  const mqVal=(e.contractor||'').replace(/"/g,'&quot;');
  const descVal=(e.description||'').replace(/"/g,'&quot;');
  return '<div id="sc-'+e.id+'" class="search-card-header">'+
    '<div class="search-card-type-badge">'+
      '<div><div class="mq-card-name">قيد رقم '+(e.seq||'?')+' — '+projName+'</div>'+
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

// ██ APPROVALS — الموافقات ══════════════════════════
function toggleApprSection(hdr){
  const body=hdr.nextElementSibling;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  hdr.classList.toggle('open',!isOpen);
}
function toggleApprPerson(hdr){
  const body=hdr.nextElementSibling;
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  hdr.classList.toggle('open',!isOpen);
}
function toggleSelectAll(checked){
  document.querySelectorAll('.appr-chk').forEach(c=>c.checked=checked);
}
function updateBulkBar(){
  const all=document.querySelectorAll('.appr-chk');
  const checked=document.querySelectorAll('.appr-chk:checked');
  const selectAllChk=document.getElementById('selectAllChk');
  if(selectAllChk)selectAllChk.checked=all.length>0&&checked.length===all.length;
}
async function bulkApprove(){
  const checked=[...document.querySelectorAll('.appr-chk:checked')];
  if(!checked.length){notify('حدد عناصر أول','warn');return;}
  await new Promise(res=>showConfirm({icon:'✅',title:'موافقة جماعية',msg:'هتوافق على '+checked.length+' عنصر. تكمل؟',okLabel:'موافقة',okType:'primary',onOk:res}));
  setSav('💾 جاري الموافقة...','ng');
  let done=0;
  for(const chk of checked){
    const id=chk.dataset.id;
    const type=chk.dataset.type;
    try{
      if(type==='entry') await approveEntry(id,true);
      else await approveAdv(id,true);
      done++;
    }catch(e){console.error(e);notify('❌ فشلت الموافقة: '+friendlyError(e),'err');}
  }
  setSav('✅ تم الموافقة على '+done+' عنصر','ok');
  await loadApprovals();
  await updatePendingBadge();
}
async function bulkReject(){
  const checked=[...document.querySelectorAll('.appr-chk:checked')];
  if(!checked.length){notify('حدد عناصر أول','warn');return;}
  await new Promise(res=>showConfirm({icon:'❌',title:'رفض جماعي',msg:'هترفض '+checked.length+' عنصر. تكمل؟',okLabel:'رفض',okType:'danger',onOk:res}));
  setSav('💾 جاري الرفض...','ng');
  let done=0;
  for(const chk of checked){
    const id=chk.dataset.id;
    const type=chk.dataset.type;
    try{
      if(type==='entry') await rejectEntry(id,true);
      else await rejectAdv(id,true);
      done++;
    }catch(e){console.error(e);notify('❌ فشل الرفض: '+friendlyError(e),'err');}
  }
  setSav('✅ تم رفض '+done+' عنصر','ok');
  await loadApprovals();
  await updatePendingBadge();
}

async function updatePendingBadge(){
  try{
    const [e1,e2]=await Promise.all([
      sb('pending_entries?status=eq.pending&select=id'),
      sb('pending_advances?status=eq.pending&select=id')
    ]);
    const cnt=(e1?e1.length:0)+(e2?e2.length:0);
    const badge=document.getElementById('pending-badge');
    if(badge){badge.textContent=cnt;badge.style.display=cnt>0?'inline':'none';}
  }catch(e){console.warn('badge:',e);} // صامت متعمد
}

let _approvalsInterval=null;
