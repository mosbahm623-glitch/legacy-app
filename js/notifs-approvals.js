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
    // ── شريط الفلاتر (chips) ──
    const allPersonNames=[...new Set((entRows||[]).map(r=>profMap[r.submitted_by]||'—'))].filter(n=>n&&n!=='—');
    const allProjIds=[...new Set((entRows||[]).map(r=>r.project_id))].filter(Boolean);
    const allBanks=[...new Set((entRows||[]).map(r=>r.payment_method||'').filter(Boolean))].filter(b=>b);
    // بناء خيارات القوائم المنسدلة
    const personItems=allPersonNames.map(n=>`<div class="appr-chip-opt" onclick="event.stopPropagation();_apprPersonFilterVal='${n.replace(/'/g,"\\'")}';filterApprByPerson('${n.replace(/'/g,"\\'")}');_activateChip('apprChipPerson','apprChipPersonLbl','${n.replace(/'/g,"\\'")}','apprChipPersonX');_closeApprChips()">${n}</div>`).join('');
    const projItems=allProjIds.map(pid=>`<div class="appr-chip-opt" onclick="event.stopPropagation();_apprProjFilterVal='${pid}';filterApprByProj('${pid}');_activateChip('apprChipProj','apprChipProjLbl','${(projMap[pid]||pid).replace(/'/g,"\\'")}','apprChipProjX');_closeApprChips()">${projMap[pid]||pid}</div>`).join('');
    const bankItems=allBanks.map(b=>`<div class="appr-chip-opt" onclick="event.stopPropagation();_apprBankFilterVal='${b.replace(/'/g,"\\'")}';filterApprByBank('${b.replace(/'/g,"\\'")}');_activateChip('apprChipBank','apprChipBankLbl','${b.replace(/'/g,"\\'")}','apprChipBankX');_closeApprChips()">${b}</div>`).join('');
    html+=`<style>
.appr-chips-bar{display:flex;align-items:center;gap:6px;padding:10px 14px 4px;flex-wrap:wrap;direction:rtl}
.appr-chip{position:relative;display:inline-flex;align-items:center;gap:4px;padding:5px 10px;border-radius:20px;border:1.5px solid var(--border-mid,#ddd);background:var(--card-bg,#fff);color:var(--text-body,#333);font-size:12px;cursor:pointer;white-space:nowrap;user-select:none;transition:border-color .15s,background .15s}
.appr-chip:hover{border-color:var(--primary,#2563eb);background:var(--chip-hover,#f0f4ff)}
.appr-chip.active{border-color:var(--primary,#2563eb);background:var(--primary,#2563eb);color:#fff}
.appr-chip-arrow{font-size:9px;opacity:.7;pointer-events:none}
.appr-chip>span:first-child{pointer-events:none}
.appr-chip-clear{font-size:11px;padding:0 2px;opacity:.8;cursor:pointer;pointer-events:auto;position:relative;z-index:1}
.appr-chip-drop{position:absolute;top:calc(100% + 4px);right:0;min-width:160px;background:var(--card-bg,#fff);border:1.5px solid var(--border-mid,#ddd);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:999;overflow:hidden;display:none}
.appr-chip-drop.open{display:block}
.appr-chip-opt{padding:9px 14px;font-size:13px;cursor:pointer;color:var(--text-body,#222);transition:background .1s}
.appr-chip-opt:hover{background:var(--chip-hover,#f0f4ff)}
.appr-chip-date-drop{padding:10px 12px;display:flex;flex-direction:column;gap:8px;min-width:200px}
.appr-chip-date-drop label{font-size:11px;color:var(--text-soft,#888);margin-bottom:2px}
.appr-chip-date-drop input{padding:6px 8px;border-radius:8px;border:1.5px solid var(--border-mid,#ddd);background:var(--input-bg,#f9f9f9);color:var(--text-body,#222);font-family:inherit;font-size:13px;width:100%}
.appr-type-chips{display:inline-flex;border-radius:20px;overflow:hidden;border:1.5px solid var(--border-mid,#ddd)}
.appr-type-btn{padding:5px 12px;font-size:12px;cursor:pointer;background:var(--card-bg,#fff);color:var(--text-body,#555);border:none;border-left:1px solid var(--border-mid,#ddd);font-family:inherit;transition:background .15s,color .15s}
.appr-type-btn:last-child{border-left:none}
.appr-type-btn.active{background:var(--primary,#2563eb);color:#fff}
</style>
<div class="appr-chips-bar" id="apprChipsBar">
  ${allPersonNames.length>1?`<div class="appr-chip" id="apprChipPerson" onclick="event.stopPropagation();_toggleApprChip('apprDropPerson')">
    <span>👤 <span id="apprChipPersonLbl">الشخص</span></span>
    <span class="appr-chip-arrow" id="apprChipPersonArrow">▾</span>
    <span class="appr-chip-clear" id="apprChipPersonX" hidden onclick="event.stopPropagation();_apprPersonFilterVal='';filterApprByPerson('');_resetChip('apprChipPerson','apprChipPersonLbl','الشخص','apprChipPersonX')">✕</span>
    <div class="appr-chip-drop" id="apprDropPerson" onclick="event.stopPropagation()">
      <div class="appr-chip-opt" onclick="event.stopPropagation();_apprPersonFilterVal='';filterApprByPerson('');_resetChip('apprChipPerson','apprChipPersonLbl','الشخص','apprChipPersonX');_closeApprChips()">— الكل —</div>
      ${personItems}
    </div>
  </div>`:''}
  ${allProjIds.length>1?`<div class="appr-chip" id="apprChipProj" onclick="event.stopPropagation();_toggleApprChip('apprDropProj')">
    <span>📁 <span id="apprChipProjLbl">المشروع</span></span>
    <span class="appr-chip-arrow" id="apprChipProjArrow">▾</span>
    <span class="appr-chip-clear" id="apprChipProjX" hidden onclick="event.stopPropagation();_apprProjFilterVal='';filterApprByProj('');_resetChip('apprChipProj','apprChipProjLbl','المشروع','apprChipProjX')">✕</span>
    <div class="appr-chip-drop" id="apprDropProj" onclick="event.stopPropagation()">
      <div class="appr-chip-opt" onclick="event.stopPropagation();_apprProjFilterVal='';filterApprByProj('');_resetChip('apprChipProj','apprChipProjLbl','المشروع','apprChipProjX');_closeApprChips()">— الكل —</div>
      ${projItems}
    </div>
  </div>`:''}
  ${allBanks.length>1?`<div class="appr-chip" id="apprChipBank" onclick="event.stopPropagation();_toggleApprChip('apprDropBank')">
    <span>🏦 <span id="apprChipBankLbl">البنك</span></span>
    <span class="appr-chip-arrow" id="apprChipBankArrow">▾</span>
    <span class="appr-chip-clear" id="apprChipBankX" hidden onclick="event.stopPropagation();_apprBankFilterVal='';filterApprByBank('');_resetChip('apprChipBank','apprChipBankLbl','البنك','apprChipBankX')">✕</span>
    <div class="appr-chip-drop" id="apprDropBank" onclick="event.stopPropagation()">
      <div class="appr-chip-opt" onclick="event.stopPropagation();_apprBankFilterVal='';filterApprByBank('');_resetChip('apprChipBank','apprChipBankLbl','البنك','apprChipBankX');_closeApprChips()">— الكل —</div>
      ${bankItems}
    </div>
  </div>`:''}
  <div class="appr-chip" id="apprChipDate" onclick="event.stopPropagation();_toggleApprChip('apprDropDate')">
    <span>📅 <span id="apprChipDateLbl">التاريخ</span></span>
    <span class="appr-chip-arrow" id="apprChipDateArrow">▾</span>
    <span class="appr-chip-clear" id="apprChipDateX" hidden onclick="event.stopPropagation();document.getElementById('apprDateFrom').value='';document.getElementById('apprDateTo').value='';filterApprByDate();_resetChip('apprChipDate','apprChipDateLbl','التاريخ','apprChipDateX')">✕</span>
    <div class="appr-chip-drop appr-chip-date-drop" id="apprDropDate" onclick="event.stopPropagation()">
      <div><label>من</label><input type="date" id="apprDateFrom" onchange="filterApprByDate();_markDateChip()"></div>
      <div><label>إلى</label><input type="date" id="apprDateTo" onchange="filterApprByDate();_markDateChip()"></div>
      <div style="text-align:left"><button onclick="document.getElementById('apprDateFrom').value='';document.getElementById('apprDateTo').value='';filterApprByDate();_resetChip('apprChipDate','apprChipDateLbl','التاريخ','apprChipDateX')" style="padding:4px 10px;border-radius:8px;border:1px solid var(--border-mid,#ddd);background:transparent;cursor:pointer;font-size:11px;color:var(--text-soft,#888)">مسح</button></div>
    </div>
  </div>
  <div class="appr-type-chips">
    <button class="appr-type-btn active" id="apprTypeAll" onclick="filterApprByType('')">الكل</button>
    <button class="appr-type-btn" id="apprTypeInc" onclick="filterApprByType('i')">وارد</button>
    <button class="appr-type-btn" id="apprTypeExp" onclick="filterApprByType('e')">مصروف</button>
  </div>
</div>`;
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
          html+=`<div class="appr-item" id="appr-e-${r.id}" data-projid="${r.project_id||''}" data-bank="${r.payment_method||''}" data-date="${r.entry_date||''}" data-type="${r.type||''}">
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
                  ?(()=>{window._pendInvMap=window._pendInvMap||{};window._pendInvMap[r.id]=r.img_url;
                  const _thumb=(()=>{try{return r.img_url.trim().startsWith('[')?JSON.parse(r.img_url)[0]:r.img_url;}catch(x){return r.img_url;}})();
                  const _cnt=(()=>{try{const _u=r.img_url.trim().startsWith('[')?JSON.parse(r.img_url):[r.img_url];return _u.length>1?_u.length+' فواتير مرفقة':'فاتورة مرفقة';}catch(x){return 'فاتورة مرفقة';}})();
                  return `<div onclick="openInvLb(window._pendInvMap['${r.id}'],'${(r.description||'قيد').replace(/'/g,'%27')}','')" style="display:flex;align-items:center;gap:10px;margin:8px 0 4px;padding:8px 10px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:10px;cursor:pointer">
                      <img src="${_thumb}" style="width:44px;height:44px;border-radius:7px;object-fit:cover;flex-shrink:0;border:1px solid #c8e6c9">
                      <div style="flex:1;min-width:0">
                        <div style="font-size:12px;font-weight:700;color:#1D6A3E">📎 ${_cnt}</div>
                        <div style="font-size:10px;color:#888;margin-top:1px">اضغط للمعاينة قبل الموافقة</div>
                      </div>
                      <span style="font-size:11px;font-weight:700;color:#27500A;background:#EAF3DE;border:0.5px solid #97C459;border-radius:6px;padding:4px 10px;flex-shrink:0">🔍 عرض</span>
                    </div>`;
                  })()
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
            ${r.img_url?'<button onclick="eaClearInv()" style="background:none;border:none;color:#E74C3C;font-size:11px;cursor:pointer;font-family:inherit">🗑 حذف الكل</button>':''}
          </div>
          <div id="eaInvPreview">
            ${r.img_url?(()=>{
              let _urls=[];try{_urls=r.img_url.trim().startsWith('[')?JSON.parse(r.img_url):[r.img_url];}catch(x){_urls=[r.img_url];}
              // خزن الـ urls في global عشان الـ onclick يوصلها
              window._eaInvUrls=_urls;
              return _urls.map((_u,_i)=>`<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid #c8e6c9;margin-bottom:6px">
                <img src="${_u}" style="width:100%;max-height:160px;object-fit:cover;display:block;cursor:zoom-in"
                  onclick="window._invLbUrls=window._eaInvUrls||['${_u}'];window._invLbIdx=${_i};_invLbShow('فاتورة','')">
                <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.45);padding:4px 10px;font-size:10px;color:#fff;text-align:center">صورة ${_i+1} من ${_urls.length} — اضغط للعرض الكامل</div>
              </div>`).join('');
            })():''}
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
    _removeCardAndUpdateTotals(id,'e');
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
    if(!silent){setSav('✅ تمت الموافقة وتم حفظ القيد','ok');updatePendingBadge();_removeCardAndUpdateTotals(id,'e');if(curAdv)loadAdvDetail();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

async function rejectEntry(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'❌',title:'رفض القيد',msg:'هيتحذف القيد نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_entries?id=eq.'+id,'DELETE');
    auditLog('رفض قيد','pending_entries',id,{});
    if(!silent){setSav('🗑️ تم رفض القيد','ng');updatePendingBadge();_removeCardAndUpdateTotals(id,'e');if(curAdv)loadAdvDetail();}
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

async function undoApproveAdvInstall(id){
  await new Promise(res=>showConfirm({icon:'↩',title:'إلغاء الموافقة',msg:'هترجع الدفعة لقائمة الانتظار.',okLabel:'إلغاء الموافقة',okType:'warn',onOk:res}));
  try{
    const rows=await sb('advance_installments?id=eq.'+id);
    if(!rows||!rows.length){setSav('❌ الدفعة مش موجودة','er');return;}
    const ins=rows[0];
    const pending={id:crypto.randomUUID(),advance_id:ins.advance_id,type:'installment',amount:ins.amount,inst_note:ins.note||'دفعة',inst_date:ins.inst_date||'',submitted_by:uid||null};
    await sb('pending_advances','POST',pending);
    await sb('advance_installments?id=eq.'+id,'DELETE');
    setSav('↩ تم إرجاع الدفعة للموافقات','ng');
    updatePendingBadge();
    if(typeof openAdv==='function'&&curAdv)openAdv(curAdv.id);
  }catch(ex){setSav('❌ '+friendlyError(ex),'er');}
}

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
    if(!silent){updatePendingBadge();_removeCardAndUpdateTotals(id,'a');}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

async function rejectAdv(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'❌',title:'رفض الطلب',msg:'هيتحذف الطلب نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_advances?id=eq.'+id,'DELETE');
    if(!silent){setSav('🗑️ تم الرفض','ng');updatePendingBadge();_removeCardAndUpdateTotals(id,'a');}
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


let _apprBankFilterVal='';
let _apprTypeFilterVal='';
function filterApprByType(type){
  _apprTypeFilterVal=type;
  // تحديث حالة الأزرار
  const btnAll=document.getElementById('apprTypeAll');
  const btnInc=document.getElementById('apprTypeInc');
  const btnExp=document.getElementById('apprTypeExp');
  if(btnAll)btnAll.classList.toggle('active',type==='');
  if(btnInc)btnInc.classList.toggle('active',type==='i');
  if(btnExp)btnExp.classList.toggle('active',type==='e');
  document.querySelectorAll('.appr-item[data-type]').forEach(function(item){
    if(!type||item.dataset.type===type){
      item.style.display='';
    } else {
      item.style.display='none';
    }
  });
  document.querySelectorAll('.appr-person-hdr').forEach(function(hdr){
    const body=hdr.nextElementSibling;
    if(!body)return;
    const visibleItems=body.querySelectorAll('.appr-item:not([style*="display: none"]):not([style*="display:none"])');
    const hide=type&&visibleItems.length===0;
    hdr.style.display=hide?'none':'';
    body.style.display=hide?'none':'';
  });
}
function _toggleApprChip(dropId){
  const drop=document.getElementById(dropId);
  if(!drop)return;
  const isOpen=drop.classList.contains('open');
  _closeApprChips();
  if(!isOpen)drop.classList.add('open');
}
function _closeApprChips(){
  document.querySelectorAll('.appr-chip-drop.open').forEach(function(d){d.classList.remove('open');});
}
function _resetChip(chipId,lblId,defaultLbl,xId){
  const chip=document.getElementById(chipId);
  const lbl=document.getElementById(lblId);
  const x=document.getElementById(xId);
  if(chip)chip.classList.remove('active');
  if(lbl)lbl.textContent=defaultLbl;
  if(x)x.hidden=true;
}
function _activateChip(chipId,lblId,val,xId){
  const chip=document.getElementById(chipId);
  const lbl=document.getElementById(lblId);
  const x=document.getElementById(xId);
  if(chip)chip.classList.add('active');
  if(lbl)lbl.textContent=val;
  if(x)x.hidden=false;
}
function _markDateChip(){
  const from=document.getElementById('apprDateFrom');
  const to=document.getElementById('apprDateTo');
  const hasDate=(from&&from.value)||(to&&to.value);
  if(hasDate){
    _activateChip('apprChipDate','apprChipDateLbl','📅 '+((from&&from.value?from.value.slice(5):'')+(to&&to.value?' — '+to.value.slice(5):'')),'apprChipDateX');
  } else {
    _resetChip('apprChipDate','apprChipDateLbl','التاريخ','apprChipDateX');
  }
}
// إغلاق القوائم عند الضغط خارجها — يُعاد تسجيله عند كل تحميل
(function(){
  document.removeEventListener('click',window._apprChipOutsideHandler||null);
  window._apprChipOutsideHandler=function(e){
    if(!e.target.closest('.appr-chip'))_closeApprChips();
  };
  document.addEventListener('click',window._apprChipOutsideHandler);
})();
function filterApprByBank(bank){
  _apprBankFilterVal=bank;
  document.querySelectorAll('.appr-item[data-bank]').forEach(function(item){
    if(!bank||item.dataset.bank===bank){
      item.style.display='';
    } else {
      item.style.display='none';
    }
  });
  document.querySelectorAll('.appr-person-hdr').forEach(function(hdr){
    const body=hdr.nextElementSibling;
    if(!body)return;
    const visibleItems=body.querySelectorAll('.appr-item:not([style*="display: none"]):not([style*="display:none"])');
    const hide=bank&&visibleItems.length===0;
    hdr.style.display=hide?'none':'';
    body.style.display=hide?'none':'';
  });
}
function filterApprByDate(){
  const fromEl=document.getElementById('apprDateFrom');
  const toEl=document.getElementById('apprDateTo');
  const from=fromEl?fromEl.value:'';
  const to=toEl?toEl.value:'';
  // تحويل dd/mm/yyyy إلى yyyy-mm-dd للمقارنة
  function parseDate(str){
    if(!str)return null;
    // إذا كان بالفعل yyyy-mm-dd
    if(/^\d{4}-\d{2}-\d{2}$/.test(str))return str;
    // dd/mm/yyyy
    const m=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
    return null;
  }
  const fromD=parseDate(from);
  const toD=parseDate(to);
  document.querySelectorAll('.appr-item[data-date]').forEach(function(item){
    const d=parseDate(item.dataset.date);
    let show=true;
    if(fromD&&d&&d<fromD)show=false;
    if(toD&&d&&d>toD)show=false;
    if(!d&&(fromD||toD))show=false;
    item.style.display=show?'':'none';
  });
  document.querySelectorAll('.appr-person-hdr').forEach(function(hdr){
    const body=hdr.nextElementSibling;
    if(!body)return;
    const visibleItems=body.querySelectorAll('.appr-item:not([style*="display: none"]):not([style*="display:none"])');
    const hide=(fromD||toD)&&visibleItems.length===0;
    hdr.style.display=hide?'none':'';
    body.style.display=hide?'none':'';
  });
}
// ⚠️ مهجورة — لا تستخدمها في الموافقات الفردية
// استخدم _removeCardAndUpdateTotals(id,'e'|'a') بدلاً منها لتجنب flash الصفحة
// مسموح باستخدامها فقط في حالات استثنائية تحتاج reload كامل
async function _reloadKeepScroll(){
  const sy=window.scrollY||document.documentElement.scrollTop||0;
  const el=document.getElementById('approvalsList');
  const esy=el?el.scrollTop:0;
  await loadApprovals(true);
  setTimeout(function(){
    window.scrollTo(0,sy);
    const el2=document.getElementById('approvalsList');
    if(el2)el2.scrollTop=esy;
  },150);
}

// ✅ الدالة الصحيحة للموافقة/الرفض الفردي — تشيل الكارت من الـ DOM بدون reload
// cardType: 'e' للقيود، 'a' للعهود
function _removeCardAndUpdateTotals(id,cardType){
  // cardType: 'e' للقيود، 'a' للعهود
  const prefix=cardType==='e'?'appr-e-':'appr-a-';
  const card=document.getElementById(prefix+id);
  if(!card)return;

  // حساب مبلغ الكارت قبل الشيل (للـ totals)
  let amt=0,entryType='e';
  if(cardType==='e'){
    const badge=card.querySelector('.appr-badge-inc,.appr-badge-exp');
    entryType=badge&&badge.classList.contains('appr-badge-inc')?'i':'e';
    const amtEl=card.querySelector('.appr-entry-amount');
    if(amtEl)amt=Number((amtEl.textContent||'').replace(/[^\d.]/g,''))||0;
  }

  // شيل الكارت من الـ DOM
  const personBody=card.closest('.appr-person-body');
  const secWrap=card.closest('.appr-sec-wrap');
  card.remove();

  // لو الـ person section فاضي، اشيله
  if(personBody&&!personBody.querySelector('.appr-item')){
    const personHdr=personBody.previousElementSibling;
    if(personHdr)personHdr.remove();
    personBody.remove();
  }

  // لو الـ section كله فاضي، اشيله
  if(secWrap&&!secWrap.querySelector('.appr-item')){
    secWrap.remove();
  }

  // لو مفيش حاجة خالص، اعرض رسالة الفراغ
  const el=document.getElementById('approvalsList');
  if(el&&!el.querySelector('.appr-item')){
    el.innerHTML='<div class="appr-empty">🎉 لا يوجد قيود في الانتظار</div>';
    return;
  }

  // تحديث الـ totals bar
  if(cardType==='e'&&el){
    const totExpEl=el.querySelector('.appr-total-cell:nth-child(1) .appr-total-val');
    const totIncEl=el.querySelector('.appr-total-cell:nth-child(2) .appr-total-val');
    const totNetEl=el.querySelector('.appr-total-cell:nth-child(3) .appr-total-val');
    if(totExpEl&&totIncEl&&totNetEl){
      let curExp=Number((totExpEl.textContent||'').replace(/[^\d.]/g,''))||0;
      let curInc=Number((totIncEl.textContent||'').replace(/[^\d.]/g,''))||0;
      if(entryType==='e')curExp=Math.max(0,curExp-amt);
      else curInc=Math.max(0,curInc-amt);
      const net=curInc-curExp;
      const sign=net>=0?'+':'';
      totExpEl.textContent=fn(curExp)+' ج';
      totIncEl.textContent=fn(curInc)+' ج';
      totNetEl.textContent=sign+fn(Math.abs(net))+' ج';
      totNetEl.style.color=net>=0?'var(--success-text,#166534)':'var(--danger)';
    }
  }

  // تحديث count في header الـ section
  if(secWrap){
    const remaining=secWrap.querySelectorAll('.appr-item').length;
    const countEl=secWrap.querySelector('.appr-sec-count');
    if(countEl)countEl.textContent=remaining+' قيود';
  }

  // تحديث person count
  if(personBody){
    const pRemaining=personBody.querySelectorAll('.appr-item').length;
    const pHdr=personBody.previousElementSibling;
    if(pHdr){
      const pCountEl=pHdr.querySelector('.appr-person-count');
      if(pCountEl)pCountEl.textContent=pRemaining+' قيود';
    }
  }
}
