let _apprPersonFilterVal='';
function _fmtApprTime(ts){
  if(!ts)return '—';
  try{
    const d=new Date(ts);
    const now=new Date();
    const h=d.getHours(),m=d.getMinutes();
    const ap=h>=12?'م':'ص';
    const hh=h%12||12;
    const mm=String(m).padStart(2,'0');
    const time=hh+':'+mm+' '+ap;
    if(d.toDateString()===now.toDateString())return 'اليوم — '+time;
    const yest=new Date(now-864e5);
    if(d.toDateString()===yest.toDateString())return 'أمس — '+time;
    return (d.getDate())+'/'+(d.getMonth()+1)+' — '+time;
  }catch(e){return '—';}
}
let _advMap={}; // global للوصول من editAndApproveAdv
async function loadApprovals(silent=false){
  const el=document.getElementById('approvalsList');
  if(!el)return;
  // حفظ حالة الـ sections المفتوحة قبل الـ reload
  const _savedPersonFilter=_apprPersonFilterVal;
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
    _advMap=advMap; // نسخة عالمية
    const profMap=await getProfileMap();
    const viewerMap={};Object.entries(profMap).forEach(([id,name])=>viewerMap[id]=name);
    let html='';
    // ── إجماليات سريعة ──
    let totExp=0,totInc=0;
    if(entRows)entRows.forEach(r=>{if(r.type==='e')totExp+=Number(r.amount||0);else totInc+=Number(r.amount||0);});
    const totNet=totInc-totExp;
    const netSign=totNet>=0?'+':'';
    const netClr=totNet>=0?'var(--success-text,#166534)':'var(--danger)';
    html+=`<div class="appr-totals-bar">
      <div class="appr-total-cell"><div class="appr-total-lbl">المصروف</div><div class="appr-total-val" style="color:var(--danger)">${fn(totExp)} ج</div></div>
      <div class="appr-total-cell"><div class="appr-total-lbl">الوارد</div><div class="appr-total-val" style="color:var(--success-text,#166534)">${fn(totInc)} ج</div></div>
      <div class="appr-total-cell"><div class="appr-total-lbl">الصافي</div><div class="appr-total-val" style="color:${netClr}">${netSign}${fn(Math.abs(totNet))} ج</div></div>
    </div>`;
    // ── فلتر بالشخص ──
    const allPersonNames=[...new Set((entRows||[]).map(r=>profMap[r.submitted_by]||'—'))].filter(n=>n&&n!=='—');
    if(allPersonNames.length>1){
      const personOpts='<option value="">— كل الأشخاص —</option>'+allPersonNames.map(n=>'<option value="'+n+'">'+n+'</option>').join('');
      html+=`<div style="padding:10px 14px 0;display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text-soft,#888);white-space:nowrap">فلتر:</span>
        <select id="apprPersonFilter" onchange="filterApprByPerson(this.value)" style="flex:1;padding:7px 10px;border-radius:10px;border:1.5px solid var(--border-mid,#ddd);background:var(--input-bg,#f9f9f9);color:var(--text-body,#222);font-family:inherit;font-size:13px">${personOpts}</select>
        <button onclick="_apprPersonFilterVal='';filterApprByPerson('');document.getElementById('apprPersonFilter').value=''" style="padding:6px 12px;border-radius:8px;border:1px solid var(--border);background:transparent;cursor:pointer;font-size:12px;color:var(--text-soft,#888)">✕</button>
      </div>`;
    }
    // ── شريط التحكم الجماعي ──
    const totalCount=(entRows?entRows.length:0)+(advRows?advRows.length:0);
    html+=`<div id="bulkBar" class="appr-bulk-bar">
      <label class="appr-bulk-label">
        <input type="checkbox" id="selectAllChk" onchange="toggleSelectAll(this.checked)" style="width:15px;height:15px;cursor:pointer;accent-color:var(--primary)">
        تحديد الكل (${totalCount})
      </label>
      <button onclick="bulkApprove()" class="appr-bulk-btn appr-bulk-approve">موافقة المحدد</button>
      <button onclick="bulkReject()" class="appr-bulk-btn appr-bulk-reject">رفض المحدد</button>
    </div>`;
    // ── قيود المشاريع ──
    if(hasEntries){
      const byPerson={};
      entRows.forEach(r=>{
        const name=profMap[r.submitted_by]||'—';
        if(!byPerson[name])byPerson[name]=[];
        byPerson[name].push(r);
      });
      const secId='sec-entries-'+Date.now();
      html+=`<div class="appr-sec-wrap">
        <div class="appr-section-hdr appr-entries-hdr open" onclick="toggleApprSection(this)">
          <span class="appr-sec-title">قيود المشاريع</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="appr-sec-count">${entRows.length} قيود</span>
            <span class="appr-sec-arrow">▾</span>
          </div>
        </div>
        <div class="appr-section-body open" id="${secId}">`;
      Object.entries(byPerson).forEach(([personName,rows])=>{
        const pid='person-'+personName.replace(/\s/g,'_')+'-'+Date.now();
        const pTotal=rows.reduce((s,r)=>s+(r.type==='i'?1:-1)*Number(r.amount||0),0);
        const pTotalFmt=(pTotal>=0?'+':'')+fn(Math.abs(pTotal))+' ج';
        const personIds=rows.map(r=>`'${r.id}'`).join(',');
        html+=`<div class="appr-person-hdr open" onclick="toggleApprPerson(this)">
          <div class="appr-person-name"><span>${personName}</span><span class="appr-person-count">${rows.length} قيود</span></div>
          <div style="display:flex;align-items:center;gap:6px" onclick="event.stopPropagation()">
            <span class="appr-person-total">${pTotalFmt}</span>
            <button onclick="bulkApproveByPerson([${personIds}])" style="font-size:10px;padding:3px 9px;border-radius:8px;border:none;background:var(--success-glow,#e8f5e9);color:var(--success-text,#166534);cursor:pointer;font-family:inherit;font-weight:700;white-space:nowrap">✅ موافقة الكل</button>
          </div>
        </div>
        <div class="appr-person-body open" id="${pid}">`;
        rows.forEach(r=>{
          const proj=projMap[r.project_id]||'—';
          const typeBadge=r.type==='i'
            ?'<span class="appr-badge appr-badge-inc">وارد</span>'
            :'<span class="appr-badge appr-badge-exp">مصروف</span>';
          html+=`<div class="appr-item" id="appr-e-${r.id}">
            <div class="appr-entry-top">
              <input type="checkbox" class="appr-chk" data-id="${r.id}" data-type="entry" onchange="updateBulkBar()">
              <div class="appr-entry-main">
                <div class="appr-entry-title">
                  ${typeBadge}
                  <span class="appr-entry-amount">${fn(r.amount)} ج</span>
                  ${r.category?'<span class="appr-badge appr-badge-cat">'+r.category+'</span>':''}
                  <span class="appr-entry-time">${_fmtApprTime(r.submitted_at)}</span>
                </div>
                <div class="appr-entry-meta">
                  ${r.description?'<span class="appr-meta-item"><span class="appr-meta-lbl">البيان</span>'+r.description+'</span>':''}
                  ${r.contractor?'<span class="appr-meta-item"><span class="appr-meta-lbl">المقاول</span>'+r.contractor+'</span>':''}
                  ${r.payment_method?'<span class="appr-meta-item"><span class="appr-meta-lbl">البنك</span>'+r.payment_method+'</span>':''}
                  <span class="appr-meta-item"><span class="appr-meta-lbl">المشروع</span>${proj}</span>
                  <span class="appr-meta-item"><span class="appr-meta-lbl">التاريخ</span>${cleanDate(r.entry_date)||'—'}</span>
                </div>
                ${r.img_url
                  ?`<div onclick="openInvLb('${r.img_url}','${(r.description||'قيد').replace(/'/g,String.fromCharCode(39))}','')" style="display:flex;align-items:center;gap:10px;margin:8px 0 4px;padding:8px 10px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:10px;cursor:pointer">
                      <img src="${r.img_url}" style="width:44px;height:44px;border-radius:7px;object-fit:cover;flex-shrink:0;border:1px solid #c8e6c9">
                      <div style="flex:1;min-width:0">
                        <div style="font-size:12px;font-weight:700;color:#1D6A3E">📎 فاتورة مرفقة</div>
                        <div style="font-size:10px;color:#888;margin-top:1px">اضغط للمعاينة قبل الموافقة</div>
                      </div>
                      <span style="font-size:11px;font-weight:700;color:#27500A;background:#EAF3DE;border:0.5px solid #97C459;border-radius:6px;padding:4px 10px;flex-shrink:0">🔍 عرض</span>
                    </div>`
                  :`<div style="display:flex;align-items:center;gap:8px;margin:8px 0 4px;padding:7px 10px;background:#fffbf0;border:1px solid #F0C060;border-radius:10px;cursor:pointer" onclick="requestInvoice('${r.id}','${(r.description||'').replace(/'/g,String.fromCharCode(92)+String.fromCharCode(39))}','${(r.category||'').replace(/'/g,String.fromCharCode(92)+String.fromCharCode(39))}','${(r.entry_date||'')}',${r.amount},'${(allProjects.find(p=>p.id===r.project_id)?.name||'—').replace(/'/g,String.fromCharCode(92)+String.fromCharCode(39))}','${(r.contractor||'')}')">
                      <span style="font-size:15px">⚠️</span>
                      <span style="font-size:11px;font-weight:600;color:#9a6700;flex:1">لا توجد فاتورة مرفقة</span>
                      <span style="font-size:9px;background:#FFF0C0;color:#9a6700;border-radius:8px;padding:2px 7px;border:0.5px solid #F0C060">اطلبها</span>
                    </div>`}

                <div class="appr-entry-actions">
                  <button onclick="approveEntry('${r.id}')" class="appr-act-btn appr-act-approve">موافقة</button>
                  <button onclick="editAndApproveEntry('${r.id}')" class="appr-act-btn appr-act-edit">تعديل وموافقة</button>
                  <button onclick="rejectEntry('${r.id}')" class="appr-act-btn appr-act-reject">رفض</button>
                </div>
              </div>
            </div>
          </div>`;
        });
        html+=`</div>`;
      });
      html+=`</div></div>`;
    }
    // ── العهود والدفعات ──
    if(hasAdv){
      const secId2='sec-adv-'+Date.now();
      html+=`<div class="appr-sec-wrap">
        <div class="appr-section-hdr appr-advances-hdr open" onclick="toggleApprSection(this)">
          <span class="appr-sec-title">العهود والدفعات</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="appr-sec-count">${advRows.length} قيود</span>
            <span class="appr-sec-arrow">▾</span>
          </div>
        </div>
        <div class="appr-section-body open" id="${secId2}">`;
      advRows.forEach(r=>{
        const isAdv=r.type==='advance';
        const advBadge=isAdv
          ?'<span class="appr-badge appr-badge-adv">عهدة جديدة</span>'
          :'<span class="appr-badge appr-badge-inst">دفعة</span>';
        const personName=isAdv?(r.person_name||'—'):(advMap[r.advance_id]||viewerMap[r.adv_user_id]||'—');
        html+=`<div class="appr-item" id="appr-a-${r.id}">
          <div class="appr-entry-top">
            <input type="checkbox" class="appr-chk" data-id="${r.id}" data-type="adv" onchange="updateBulkBar()">
            <div class="appr-entry-main">
              <div class="appr-entry-title">
                ${advBadge}
                <span class="appr-entry-amount">${isAdv?personName:fn(r.amount)+' ج'}</span>
                ${!isAdv?'<span style="font-size:11px;color:var(--text-muted,#6b7280)">لـ '+personName+'</span>':''}
                <span class="appr-entry-time">${_fmtApprTime(r.submitted_at)}</span>
              </div>
              ${(isAdv&&r.notes)||(!isAdv&&r.inst_note)?'<div class="appr-entry-meta"><span class="appr-meta-item"><span class="appr-meta-lbl">ملاحظات</span>'+(isAdv?r.notes:r.inst_note)+'</span></div>':''}
              <div class="appr-entry-actions">
                <button onclick="approveAdv(\'${r.id}\')" class="appr-act-btn appr-act-approve" style="flex:3">موافقة</button>
                ${!isAdv?`<button onclick="editAndApproveAdv('${r.id}')" class="appr-act-btn appr-act-edit" style="flex:3">تعديل وموافقة</button>`:''}
                <button onclick="rejectAdv(\'${r.id}\')" class="appr-act-btn appr-act-reject" style="flex:2">رفض</button>
              </div>
            </div>
          </div>
        </div>`;
      });
      html+=`</div></div>`;
    }
    el.innerHTML=html;
    // استعادة الفلتر المختار
    if(_apprPersonFilterVal){
      const sel=document.getElementById('apprPersonFilter');
      if(sel){sel.value=_apprPersonFilterVal;filterApprByPerson(_apprPersonFilterVal);}
    }
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
        <input id="eaDate" type="text" value="${r.entry_date||''}" placeholder="dd/mm/yyyy" style="${inp}">
        <div style="margin:12px 0">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:11px;color:var(--text-muted,#999);font-weight:600">📎 صورة الفاتورة</div>
            ${r.img_url?'<button onclick="eaClearInv()" style="background:none;border:none;color:#E74C3C;font-size:11px;cursor:pointer;font-family:inherit">🗑 حذف</button>':''}
          </div>
          <div id="eaInvPreview">
            ${r.img_url?`<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid #c8e6c9;margin-bottom:6px">
              <img src="${r.img_url}" style="width:100%;max-height:160px;object-fit:cover;display:block;cursor:zoom-in"
                onclick="openInvLb('${r.img_url.replace(/'/g,'%27')}','فاتورة','')">
              <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.45);padding:4px 10px;font-size:10px;color:#fff;text-align:center">اضغط للعرض الكامل</div>
            </div>`:''}
          </div>
          <input type="file" id="eaInvFile" accept="image/*,application/pdf" style="display:none" onchange="eaInvSelect(this)">
          <label for="eaInvFile" style="display:flex;align-items:center;gap:6px;padding:7px 12px;border:1.5px dashed #ccc;border-radius:8px;cursor:pointer;font-size:12px;color:#888">📷 ${r.img_url?'تغيير الصورة':'إرفاق صورة'}</label>
        </div>
        <div class="modal-btns" style="margin-top:16px">
          <button onclick="confirmEditApprove('${id}')" class="btn-primary">✅ حفظ وموافقة</button>
          <button onclick="document.getElementById('eaModal').remove()" class="btn-cancel">إلغاء</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
    setTimeout(()=>initDateInput(document.getElementById('eaDate')),0);
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function eaInvSelect(input){
  var file=input.files[0];if(!file)return;
  window._eaInvFile=file;
  var preview=document.getElementById('eaInvPreview');
  if(!preview)return;
  if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
    preview.innerHTML='<div style="padding:10px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:8px;font-size:12px;color:#1D6A3E;text-align:center">📄 '+file.name+'</div>';
  }else{
    var reader=new FileReader();
    reader.onload=function(ev){
      preview.innerHTML='<img src="'+ev.target.result+'" style="width:100%;max-height:140px;object-fit:cover;display:block;border-radius:8px;margin-bottom:6px">';
    };
    reader.readAsDataURL(file);
  }
  var lbl=document.querySelector('label[for="eaInvFile"]');
  if(lbl)lbl.innerHTML='✅ '+file.name.substring(0,30);
}

function eaClearInv(){
  window._eaInvFile=null;
  window._eaInvClear=true;
  var preview=document.getElementById('eaInvPreview');
  if(preview)preview.innerHTML='';
  var lbl=document.querySelector('label[for="eaInvFile"]');
  if(lbl)lbl.innerHTML='📷 إرفاق صورة';
  var inp=document.getElementById('eaInvFile');
  if(inp)inp.value='';
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
      created_by:r.submitted_by,
      img_url:r.img_url||null
    };
    // رفع صورة جديدة لو موجودة
    if(window._eaInvFile){
      try{
        var file=window._eaInvFile;
        var isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
        var uploadFile=file;
        if(!isPdf){
          uploadFile=await new Promise(function(res){
            var reader=new FileReader();
            reader.onload=function(ev){
              var img=new Image();
              img.onload=function(){
                var MAX=1400,w=img.width,h=img.height;
                if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
                var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
                canvas.getContext('2d').drawImage(img,0,0,w,h);
                canvas.toBlob(function(blob){res(blob);},'image/jpeg',0.80);
              };
              img.src=ev.target.result;
            };
            reader.readAsDataURL(file);
          });
        }
        var ext=isPdf?'pdf':'jpg';
        var path=entry.id+'/invoice_'+Date.now()+'.'+ext;
        var AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
        var resp=await fetch(SB_URL+'/storage/v1/object/invoices/'+path,{method:'POST',headers:{'Authorization':'Bearer '+(token||AK),'apikey':AK,'Content-Type':isPdf?'application/pdf':'image/jpeg','x-upsert':'true'},body:uploadFile});
        if(resp.ok)entry.img_url=SB_URL+'/storage/v1/object/public/invoices/'+path;
        window._eaInvFile=null;
      }catch(uploadErr){console.warn('inv upload:',uploadErr);}
    } else if(window._eaInvClear){
      entry.img_url=null;
      window._eaInvClear=false;
    }
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
    const entry={id:crypto.randomUUID(),project_id:r.project_id,type:r.type,amount:r.amount,category:r.category||'',description:r.description||'',entry_date:r.entry_date||'',contractor:r.contractor||'',advance_id:r.advance_id||null,created_by:r.submitted_by,img_url:r.img_url||null,payment_method:r.payment_method||null};
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

async function undoApproveEntry(id){
  await new Promise(res=>showConfirm({icon:'↩',title:'إلغاء الموافقة',msg:'هيترجع القيد لقائمة الانتظار ويتحذف من المشروع.',okLabel:'إلغاء الموافقة',okType:'warning',onOk:res}));
  try{
    const rows=await sb('entries?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ القيد مش موجود','er');return;}
    const e=rows[0];
    const pending={id:crypto.randomUUID(),project_id:e.project_id,type:e.type,amount:e.amount,category:e.category||'',description:e.description||'',entry_date:e.entry_date||'',contractor:e.contractor||'',advance_id:e.advance_id||null,status:'pending',submitted_by:e.created_by||uid,submitted_at:new Date().toISOString(),img_url:e.img_url||null,payment_method:e.payment_method||null};
    await sb('pending_entries','POST',pending);
    await sb('entries?id=eq.'+id,'DELETE');
    if(e.project_id===curPid){await loadEntries();allEntries=allEntries.filter(x=>x.project_id!==curPid).concat(entries);refreshProjSummary(curPid);}
    auditLog('إلغاء موافقة قيد','entries',id,{project:allProjects.find(p=>p.id===e.project_id)?.name,amount:e.amount});
    setSav('↩ تم إرجاع القيد للموافقات','ng');
    updatePendingBadge();
  }catch(ex){setSav('❌ '+friendlyError(ex),'er');}
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
    const advName=(advances&&advances.find(a=>a.id===r.advance_id)?.person_name)||_advMap[r.advance_id]||r.person_name||'—';
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
