async function loadApprovals(silent=false){
  const el=document.getElementById('approvalsList');
  if(!el)return;
  // حفظ حالة الـ sections المفتوحة قبل الـ reload
  const _openSecs=new Set();
  const _openPersons=new Set();
  if(silent){
    el.querySelectorAll('.appr-section-hdr').forEach(h=>{
      const body=h.nextElementSibling;
      if(body&&body.classList.contains('open')){
        _openSecs.add(h.querySelector('span')?.textContent?.trim()||'');
      }
    });
    el.querySelectorAll('.appr-person-hdr').forEach(h=>{
      const body=h.nextElementSibling;
      if(body&&body.classList.contains('open')){
        _openPersons.add(h.querySelector('div')?.textContent?.trim()||'');
      }
    });
  }
  if(!silent)el.innerHTML='<div class="appr-loading">⏳ جاري التحميل...</div>';
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
    const viewerMap={};Object.entries(profMap).forEach(([id,name])=>viewerMap[id]=name);
    let html='';

    // ── شريط التحكم الجماعي ──
    const totalCount=(entRows?entRows.length:0)+(advRows?advRows.length:0);
    html+=`<div id="bulkBar" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 0;margin-bottom:8px;border-bottom:1px solid var(--border)">
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:600">
        <input type="checkbox" id="selectAllChk" onchange="toggleSelectAll(this.checked)" style="width:16px;height:16px;cursor:pointer">
        تحديد الكل (${totalCount})
      </label>
      <button onclick="bulkApprove()" style="background:var(--primary);color:var(--accent);border:none;border-radius:8px;padding:6px 14px;font-family:inherit;font-size:12px;cursor:pointer;font-weight:600">✅ موافقة المحدد</button>
      <button onclick="bulkReject()" style="background:var(--danger-bg,#FEE2E2);color:var(--danger);border:1px solid var(--danger);border-radius:8px;padding:6px 14px;font-family:inherit;font-size:12px;cursor:pointer;font-weight:600">❌ رفض المحدد</button>
    </div>`;

    // ── قيود المشاريع ──
    if(hasEntries){
      // تجميع القيود حسب الشخص
      const byPerson={};
      entRows.forEach(r=>{
        const name=profMap[r.submitted_by]||'—';
        if(!byPerson[name])byPerson[name]=[];
        byPerson[name].push(r);
      });
      const secId='sec-entries-'+Date.now();
      html+=`<div class="appr-section-hdr appr-entries-hdr" onclick="toggleApprSection(this)">
        <span>📋 قيود المشاريع (${entRows.length})</span>
        <span class="appr-sec-arrow">▾</span>
      </div>
      <div class="appr-section-body" id="${secId}">`;
      Object.entries(byPerson).forEach(([personName,rows])=>{
        const pid='person-'+personName.replace(/\s/g,'_')+'-'+Date.now();
        html+=`<div class="appr-person-hdr" onclick="toggleApprPerson(this)">
          <div style="display:flex;align-items:center;gap:8px">👤 ${personName} <span class="appr-person-count">(${rows.length} قيود)</span></div>
          <span class="appr-sec-arrow">▾</span>
        </div>
        <div class="appr-person-body" id="${pid}">`;
        rows.forEach(r=>{
          const proj=projMap[r.project_id]||'—';
          const typeLabel=r.type==='i'
            ?'<span class="appr-income-badge">📤 وارد</span>'
            :'<span class="appr-expense-badge">📥 مصروف</span>';
          html+=`<div class="appr-item" id="appr-e-${r.id}">
            <div class="appr-item-header">
              <div style="display:flex;align-items:center;gap:8px">
                <input type="checkbox" class="appr-chk" data-id="${r.id}" data-type="entry" style="width:16px;height:16px;cursor:pointer" onchange="updateBulkBar()">
                <div class="appr-item-title-row">
                  ${typeLabel}
                  <span class="title-sm">${fn(r.amount)} ج</span>
                  ${r.category?'<span class="appr-item-cat">'+r.category+'</span>':''}
                </div>
              </div>
              <span class="appr-meta-sm">${r.submitted_at?r.submitted_at.substring(0,16).replace('T',' '):'—'}</span>
            </div>
            <div class="appr-item-meta">
              ${r.description?'<span>📝 '+r.description+'</span> &nbsp;':''}
              ${r.contractor?'<span>👷 '+r.contractor+'</span> &nbsp;':''}
              ${r.payment_method?'<span>💳 '+r.payment_method+'</span> &nbsp;':''}
              <span class="appr-meta-text">🏗️ ${proj}</span> &nbsp;
              <span class="appr-meta-text">📅 ${cleanDate(r.entry_date)||'—'}</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button onclick="approveEntry('${r.id}')" class="appr-approve-btn">✅ موافقة</button>
              <button onclick="editAndApproveEntry('${r.id}')" class="appr-edit-approve-btn">✏️ تعديل وموافقة</button>
              <button onclick="rejectEntry('${r.id}')" class="appr-reject-btn">❌ رفض</button>
              <button onclick="requestInvoice('${r.id}','${(r.description||'').replace(/'/g,"\\'")}','${(r.category||'').replace(/'/g,"\\'")}','${(r.entry_date||'').replace(/'/g,"\\'")}',${r.amount},'${(allProjects.find(p=>p.id===r.project_id)?.name||'—').replace(/'/g,"\\'")}','${(r.contractor||'').replace(/'/g,"\\'")}')">📋 طلب فاتورة</button>
            </div>
          </div>`;
        });
        html+=`</div>`;// end person-body
      });
      html+=`</div>`;// end section-body
    }

    // ── العهد والدفعات ──
    if(hasAdv){
      const secId2='sec-adv-'+Date.now();
      html+=`<div class="appr-section-hdr appr-advances-hdr" onclick="toggleApprSection(this)">
        <span>💼 العهود والدفعات (${advRows.length})</span>
        <span class="appr-sec-arrow">▾</span>
      </div>
      <div class="appr-section-body" id="${secId2}">`;
      advRows.forEach(r=>{
        const isAdv=r.type==='advance';
        const label=isAdv
          ?'<span class="appr-adv-new-badge">💼 عهدة جديدة</span>'
          :'<span class="appr-adv-inst-badge">💰 دفعة</span>';
        const personName=isAdv?(r.person_name||'—'):(advMap[r.advance_id]||viewerMap[r.adv_user_id]||'—');
        const detail=isAdv
          ?'<span class="title-sm">'+personName+'</span>'+(r.notes?' <span class="appr-meta-text">· '+r.notes+'</span>':'')
          :'<span class="title-sm">'+fn(r.amount)+' ج</span> <span class="appr-meta-text">لـ '+personName+'</span>'+(r.inst_note?' <span class="appr-meta-sm">· '+r.inst_note+'</span>':'');
        html+=`<div class="appr-item" id="appr-a-${r.id}">
          <div class="appr-item-header">
            <div style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" class="appr-chk" data-id="${r.id}" data-type="adv" style="width:16px;height:16px;cursor:pointer" onchange="updateBulkBar()">
              <div class="appr-item-title-row">${label} ${detail}</div>
            </div>
            <span class="appr-meta-sm">${r.submitted_at?r.submitted_at.substring(0,16).replace('T',' '):'—'}</span>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="approveAdv('${r.id}')" class="appr-adv-approve-btn">✅ موافقة</button>
            ${!isAdv?`<button onclick="editAndApproveAdv('${r.id}')" class="appr-edit-approve-btn">✏️ تعديل وموافقة</button>`:''}
            <button onclick="rejectAdv('${r.id}')" class="appr-adv-reject-btn">❌ رفض</button>
          </div>
        </div>`;
      });
      html+=`</div>`;// end section-body
    }
    el.innerHTML=html;
    // استعادة حالة الـ sections المفتوحة
    if(silent&&(_openSecs.size||_openPersons.size)){
      el.querySelectorAll('.appr-section-hdr').forEach(h=>{
        const txt=h.querySelector('span')?.textContent?.trim()||'';
        const matched=[..._openSecs].some(s=>s.split('(')[0].trim()===txt.split('(')[0].trim());
        const body=h.nextElementSibling;
        const arrow=h.querySelector('.appr-sec-arrow');
        if(matched&&body){
          body.classList.add('open');
          if(arrow)arrow.textContent='▴';
        }
      });
      el.querySelectorAll('.appr-person-hdr').forEach(h=>{
        const txt=h.querySelector('div')?.textContent?.trim()||'';
        const matched=[..._openPersons].some(s=>s.split('(')[0].trim()===txt.split('(')[0].trim());
        const body=h.nextElementSibling;
        const arrow=h.querySelector('.appr-sec-arrow');
        if(matched&&body){
          body.classList.add('open');
          if(arrow)arrow.textContent='▴';
        }
      });
    }
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
        <label class="lbl-lg">💳 طريقة الدفع / الاستقبال</label>
        <select id="eaPmt" style="${inp}">
          <option value="">اختر...</option>
          <option value="Cash" ${r.payment_method==='Cash'?'selected':''}>💵 Cash</option>
          <option value="Al Ahly" ${r.payment_method==='Al Ahly'?'selected':''}>🏦 Al Ahly</option>
          <option value="CIB" ${r.payment_method==='CIB'?'selected':''}>🏦 CIB</option>
          <option value="CIB شركات" ${r.payment_method==='CIB شركات'?'selected':''}>🏦 CIB شركات</option>
          <option value="أخرى" ${r.payment_method&&!['Cash','Al Ahly','CIB','CIB شركات'].includes(r.payment_method)?'selected':''}>✏️ أخرى</option>
        </select>
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
    const entry={
      id:crypto.randomUUID(),
      project_id:newProjId,
      type:document.getElementById('eaType').value,
      amount:amt,
      category:document.getElementById('eaCat').value.trim(),
      description:document.getElementById('eaDesc').value.trim(),
      entry_date:document.getElementById('eaDate').value.trim(),
      contractor:document.getElementById('eaContr').value.trim(),
      payment_method:document.getElementById('eaPmt')?.value||r.payment_method||null,
      advance_id:r.advance_id||null,
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

function requestInvoice(id,desc,cat,date,amount,proj,contractor){
  const msg=`السلام عليكم،\nبرجاء إرسال فاتورة للبند التالي:\n\n📋 البيان: ${desc||'—'}\n🏷️ البند: ${cat||'—'}\n🏗️ المشروع: ${proj||'—'}\n💰 المبلغ: ${fn(amount)} ج\n📅 التاريخ: ${cleanDate(date)||'—'}${contractor?'\n👷 المقاول: '+contractor:''}\n\nشكراً`;
  // عرض modal مع الرسالة
  const ex=document.getElementById('_invReqModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_invReqModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:400px;width:100%">
    <div style="text-align:center;margin-bottom:14px"><div style="font-size:28px">📋</div><div class="title-md">طلب فاتورة</div></div>
    <textarea id="_invReqTxt" style="width:100%;height:180px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg-faint);color:var(--text-main);font-family:inherit;font-size:13px;resize:none;direction:rtl;line-height:1.7">${msg}</textarea>
    <div class="modal-btns" style="margin-top:12px">
      <button onclick="copyInvReq()" class="btn-primary">📋 نسخ الرسالة</button>
      <button onclick="document.getElementById('_invReqModal').remove()" class="btn-cancel">إغلاق</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
}
function copyInvReq(){
  const txt=document.getElementById('_invReqTxt');
  if(!txt)return;
  navigator.clipboard.writeText(txt.value).then(()=>{
    notify('✅ تم نسخ الرسالة','ok');
    document.getElementById('_invReqModal')?.remove();
  }).catch(()=>{
    txt.select();
    document.execCommand('copy');
    notify('✅ تم نسخ الرسالة','ok');
    document.getElementById('_invReqModal')?.remove();
  });
}

async function approveEntry(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'✅',title:'موافقة على القيد',msg:'هيتحفظ القيد في المشروع.',okLabel:'موافقة',okType:'success',onOk:res}));
  try{
    const rows=await sb('pending_entries?id=eq.'+id);
    if(!rows||!rows.length)return;
    const r=rows[0];
    const entry={id:crypto.randomUUID(),project_id:r.project_id,type:r.type,amount:r.amount,category:r.category||'',description:r.description||'',entry_date:r.entry_date||'',contractor:r.contractor||'',advance_id:r.advance_id||null,created_by:r.submitted_by};
    await sb('entries','POST',entry);
    await sb('pending_entries?id=eq.'+id,'DELETE');
    if(r.project_id===curPid){await loadEntries();allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);}
    auditLog('موافقة على قيد','entries',id,{project:allProjects.find(p=>p.id===r.project_id)?.name,amount:r.amount,category:r.category,submitted_by:r.submitted_by});
    if(!silent){setSav('✅ تمت الموافقة وتم حفظ القيد','ok');updatePendingBadge();loadApprovals(true);if(curAdv)loadAdvDetail();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

async function rejectEntry(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'❌',title:'رفض القيد',msg:'هيتحذف القيد نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_entries?id=eq.'+id,'DELETE');
    auditLog('رفض قيد','pending_entries',id,{});
    if(!silent){setSav('🗑️ تم رفض القيد','ng');updatePendingBadge();loadApprovals(true);if(curAdv)loadAdvDetail();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}
// ══════════════════════════════════════

async function editAndApproveAdv(id){
  try{
    const rows=await sb('pending_advances?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ الطلب مش موجود','er');return;}
    const r=rows[0];
    const inp='width:100%;padding:10px;border:1.5px solid var(--border-mid,#e0e0e0);border-radius:10px;font-family:inherit;font-size:13px;margin-bottom:12px;box-sizing:border-box;background:var(--input-bg,#f9f9f9);color:var(--text-body,#222)';
    let ov=document.getElementById('eaAdvModal');
    if(ov)ov.remove();
    ov=document.createElement('div');
    ov.id='eaAdvModal';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
    const advName=(advances&&advances.find(a=>a.id===r.advance_id)?.person_name)||(advMap&&advMap[r.advance_id])||r.person_name||'—';
    ov.innerHTML=`
      <div class="appr-edit-modal-box">
        <div class="modal-hdr">
          <div class="title-md">✏️ تعديل الدفعة قبل الموافقة</div>
          <button onclick="document.getElementById('eaAdvModal').remove()" class="appr-edit-modal-close">✕</button>
        </div>
        <div style="margin-bottom:12px;padding:10px;background:var(--bg-faint,#f5f5f0);border-radius:8px;font-size:13px;color:var(--text-sub)">
          💼 صاحب العهدة: <strong>${advName}</strong>
        </div>
        <label class="lbl-lg">المبلغ</label>
        <input id="eaAdvAmount" type="number" value="${r.amount||''}" style="${inp}">
        <label class="lbl-lg">الملاحظة</label>
        <input id="eaAdvNote" type="text" value="${(r.inst_note||'').replace(/"/g,'&quot;')}" style="${inp}">
        <label class="lbl-lg">التاريخ</label>
        <input id="eaAdvDate" type="text" value="${r.inst_date||''}" placeholder="dd/mm/yyyy" style="${inp}margin-bottom:20px">
        <div class="modal-btns">
          <button onclick="confirmEditApproveAdv('${id}')" class="btn-primary">✅ حفظ وموافقة</button>
          <button onclick="document.getElementById('eaAdvModal').remove()" class="btn-cancel">إلغاء</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
    setTimeout(()=>initDateInput(document.getElementById('eaAdvDate')),0);
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function confirmEditApproveAdv(id){
  const amt=parseFloat(document.getElementById('eaAdvAmount').value);
  if(!amt||amt<=0){setSav('❌ المبلغ مش صح','er');return;}
  const note=document.getElementById('eaAdvNote').value.trim();
  const date=document.getElementById('eaAdvDate').value.trim();
  try{
    const rows=await sb('pending_advances?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ الطلب مش موجود','er');return;}
    const r=rows[0];
    await sb('advance_installments','POST',{advance_id:r.advance_id,amount:amt,inst_date:date||'',note:note||'دفعة'});
    await sb('pending_advances?id=eq.'+id,'DELETE');
    document.getElementById('eaAdvModal')?.remove();
    setSav('✅ تمت الموافقة — تم إضافة الدفعة','ok');
    updatePendingBadge();
    loadApprovals(true);
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}


async function approveAdv(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'✅',title:'موافقة على الطلب',msg:'هيتحفظ الطلب.',okLabel:'موافقة',okType:'success',onOk:res}));
  try{
    const rows=await sb('pending_advances?id=eq.'+id);
    if(!rows||!rows.length)return;
    const r=rows[0];
    if(r.type==='advance'){
      const a=await sb('advances','POST',{person_name:r.person_name,amount:0,notes:r.notes||'',status:'open',user_id:r.adv_user_id||r.submitted_by});
      advances.push(a[0]);
      if(!silent)setSav('✅ تمت الموافقة — تم إنشاء العهدة','ok');
    }else if(r.type==='installment'){
      await sb('advance_installments','POST',{advance_id:r.advance_id,amount:r.amount,inst_date:r.inst_date||'',note:r.inst_note||'دفعة'});
      if(!silent)setSav('✅ تمت الموافقة — تم إضافة الدفعة','ok');
    }
    await sb('pending_advances?id=eq.'+id,'DELETE');
    if(!silent){updatePendingBadge();loadApprovals(true);}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

async function rejectAdv(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'❌',title:'رفض الطلب',msg:'هيتحذف الطلب نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_advances?id=eq.'+id,'DELETE');
    if(!silent){setSav('🗑️ تم الرفض','ng');updatePendingBadge();loadApprovals();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(e=>{console.warn('SW register failed:',e);});}); // صامت متعمد
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
// ██ NOTIFICATIONS + REALTIME ══════════════════════
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
