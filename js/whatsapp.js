// ██ WHATSAPP & COMMUNICATIONS — whatsapp.js ═══════════════

// ── بناء زراري واتساب للعميل (وارد) ──
function waClientBtns(e, proj) {
  const _pd = allProjectsMap[e.project_id];
  if (e.type !== 'i' || !_pd) return '';
  const _txt = encodeURIComponent('مرحباً، نفيدكم باستلام مبلغ ' + fn(Math.abs(e.amount)) + ' ج\nالمشروع: ' + proj + '\nرقم الإيصال: ' + (e.seq || ''));
  const _btns = [];
  if (_pd.client_phone) _btns.push(`<a href="https://wa.me/${_pd.client_phone}?text=${_txt}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#25D366;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500">إرسال 1</a>`);
  if (_pd.client_phone2) _btns.push(`<a href="https://wa.me/${_pd.client_phone2}?text=${_txt}" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#128C7E;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500">إرسال 2</a>`);
  return _btns.length ? `<div style="margin:0 24px 16px;display:flex;gap:8px;justify-content:center">${_btns.join('')}</div>` : '';
}

// ── بناء زراري واتساب للمقاول (مصروف) ──
function waMqBtns(e) {
  if (e.type !== 'e' || !e.contractor) return { wa1: '', wa2: '' };
  const _ep = (allProjectsMap[e.project_id]?.contractor_phones || {})[e.contractor] || {};
  const projName = allProjectsMap[e.project_id]?.name || '';
  const txt = encodeURIComponent('مرحباً ' + e.contractor + '، نفيدكم بصرف مبلغ ' + fn(Math.abs(e.amount)) + ' ج\nالمشروع: ' + projName + '\nرقم القيد: ' + (e.seq || ''));
  const wa1 = _ep.p1 ? `<a href="https://wa.me/${_ep.p1}?text=${txt}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 1</a>` : '';
  const wa2 = _ep.p2 ? `<a href="https://wa.me/${_ep.p2}?text=${txt}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;background:#128C7E;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 2</a>` : '';
  return { wa1, wa2 };
}

// ── modal تعديل أرقام المقاول ──
async function mqEditPhones(name, p1, p2) {
  let ov = document.getElementById('mqPhonesModal'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'mqPhonesModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `<div class="modal-box-lg"><div class="modal-hdr"><div class="title-lg">📱 أرقام واتساب المقاول</div><button onclick="document.getElementById('mqPhonesModal').remove()" class="btn-close-sm">✕</button></div><div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:14px">👷 ${name}</div><label class="lbl-lg">📱 رقم واتساب 1</label><input id="mqPh1" type="text" value="${p1}" placeholder="مثال: 201001234567" class="inp-lg"><label class="lbl-lg">📱 رقم واتساب 2 (اختياري)</label><input id="mqPh2" type="text" value="${p2}" placeholder="مثال: 201001234567" class="inp-lg"><div id="mqPhMsg" style="min-height:18px;font-size:12px;margin:8px 0"></div><div class="modal-btns"><button onclick="saveMqPhones('${name.replace(/'/g, "\\'")}')" class="btn-primary">💾 حفظ</button><button onclick="document.getElementById('mqPhonesModal').remove()" class="btn-cancel">إلغاء</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('mqPh1').focus();
}

async function saveMqPhones(name) {
  const p1 = document.getElementById('mqPh1').value.trim();
  const p2 = document.getElementById('mqPh2').value.trim();
  const msg = document.getElementById('mqPhMsg');
  msg.style.color = 'var(--warning-text)'; msg.textContent = '⏳ جاري الحفظ...';
  try {
    const cur = allProjectsMap[curPid]?.contractor_phones || {};
    const updated = { ...cur, [name]: { p1: p1 || null, p2: p2 || null } };
    await sb('projects?id=eq.' + curPid, 'PATCH', { contractor_phones: updated });
    const idx = allProjects.findIndex(p => p.id === curPid);
    if (idx >= 0) allProjects[idx].contractor_phones = updated;
    const idx2 = projects.findIndex(p => p.id === curPid);
    if (idx2 >= 0) projects[idx2].contractor_phones = updated;
    if (allProjectsMap[curPid]) allProjectsMap[curPid].contractor_phones = updated;
    msg.style.color = 'var(--primary-btn)'; msg.textContent = '✅ تم الحفظ';
    setSav('✅ تم حفظ أرقام ' + name, 'ok');
    setTimeout(() => { document.getElementById('mqPhonesModal')?.remove(); rp(); }, 600);
  } catch (e) { msg.style.color = 'var(--danger)'; msg.textContent = '❌ خطأ: ' + e.message; }
}

// ── طلب فاتورة ──
function requestInvoice(id, desc, cat, date, amount, proj, contractor) {
  const msg = `السلام عليكم،\nبرجاء إرسال فاتورة للبند التالي:\n\n📋 البيان: ${desc || '—'}\n🏷️ البند: ${cat || '—'}\n🏗️ المشروع: ${proj || '—'}\n💰 المبلغ: ${fn(amount)} ج\n📅 التاريخ: ${cleanDate(date) || '—'}${contractor ? '\n👷 المقاول: ' + contractor : ''}\n\nشكراً`;
  let ov = document.getElementById('invReqModal'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'invReqModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `<div class="modal-box-lg"><div class="modal-hdr"><div class="title-lg">📋 طلب فاتورة</div><button onclick="document.getElementById('invReqModal').remove()" class="btn-close-sm">✕</button></div><textarea id="invReqTxt" style="width:100%;min-height:160px;padding:10px;border:0.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;resize:none;direction:rtl;background:var(--bg-faint)">${msg}</textarea><div class="modal-btns"><button onclick="copyInvReq()" class="btn-primary">📋 نسخ الرسالة</button><button onclick="document.getElementById('invReqModal').remove()" class="btn-cancel">إغلاق</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

function copyInvReq() {
  const txt = document.getElementById('invReqTxt');
  if (!txt) return;
  navigator.clipboard.writeText(txt.value).then(() => notify('✅ تم نسخ الرسالة', 'ok')).catch(() => { txt.select(); document.execCommand('copy'); notify('✅ تم النسخ', 'ok'); });
}

// ══════════════════════════════════════════════════════════
// ██ شاشة دفعاتي ══════════════════════════════════════════
// ══════════════════════════════════════════════════════════

function loadDaf3ati() {
  const el = document.getElementById('daf3atiScreen');
  if (!el) return;
  // لو البيانات لسه بتتحمل
  if (!allProjects || !allProjects.length) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-soft)">⏳ جاري التحميل...</div>';
    setTimeout(loadDaf3ati, 800);
    return;
  }
  el.innerHTML = `
    <div class="bc"><span onclick="showScreen('dash')" class="bc-l">الرئيسية</span><span class="bc-s">›</span><span>دفعاتي</span></div>
    <div style="margin-bottom:14px">
      <div style="font-size:16px;font-weight:700;color:var(--primary);margin-bottom:10px">💰 دفعاتي</div>
      <input id="daf3ProjSearch" type="text" placeholder="🔍 بحث بالمشروع..." class="inp-lg" style="width:100%;margin-bottom:8px" oninput="renderDaf3ati()">
      <input id="daf3MqSearch" type="text" placeholder="👷 بحث بالمقاول..." class="inp-lg" style="width:100%" oninput="renderDaf3ati()">
    </div>
    <div id="daf3atiList"></div>`;
  renderDaf3ati();
}

function renderDaf3ati() {
  const el = document.getElementById('daf3atiList');
  if (!el) return;
  const projQ = (document.getElementById('daf3ProjSearch')?.value || '').trim().toLowerCase();
  const mqQ = (document.getElementById('daf3MqSearch')?.value || '').trim().toLowerCase();

  // فلتر المشاريع
  let filteredProjs = allProjects.filter(p => !p.archived);
  if (projQ) filteredProjs = filteredProjs.filter(p => p.name.toLowerCase().includes(projQ));

  if (!filteredProjs.length) { el.innerHTML = '<div class="emp">لا توجد نتائج</div>'; return; }

  // لو مفيش بحث — اعرض رسالة ترحيب
  if (!projQ && !mqQ) {
    el.innerHTML = '<div style="padding:50px 16px;text-align:center"><div style="font-size:40px;margin-bottom:14px">🔍</div><div style="font-size:15px;font-weight:600;color:var(--text-body);margin-bottom:8px">ابحث لعرض الدفعات</div><div style="font-size:13px;color:var(--text-soft)">اكتب اسم المشروع أو اسم المقاول في خانة البحث بالأعلى</div></div>';
    return;
  }

  let html = '';
  filteredProjs.forEach(proj => {
    const projEntries = allEntries.filter(e => e.project_id === proj.id);
    const incEntries = projEntries.filter(e => e.type === 'i');
    const expEntries = projEntries.filter(e => e.type === 'e' && e.contractor);

    // فلتر المقاول
    let filteredExp = expEntries;
    if (mqQ) filteredExp = expEntries.filter(e => (e.contractor || '').toLowerCase().includes(mqQ));

    // لو بحث بالمقاول وملقاش حاجة في المشروع ده، تخطى
    if (mqQ && !filteredExp.length) return;

    const totalIn = incEntries.reduce((s, e) => s + e.amount, 0);
    const totalOut = expEntries.reduce((s, e) => s + e.amount, 0);

    // قسّم المصروف على مقاولين
    const mqMap = {};
    filteredExp.forEach(e => {
      if (!mqMap[e.contractor]) mqMap[e.contractor] = [];
      mqMap[e.contractor].push(e);
    });

    // بناء صفوف الوارد
    const incRows = mqQ ? '' : incEntries.sort((a, b) => (b.seq || 0) - (a.seq || 0)).map(e => {
      const _pd = allProjectsMap[e.project_id];
      const txt = encodeURIComponent('مرحباً، نفيدكم باستلام مبلغ ' + fn(e.amount) + ' ج\nالمشروع: ' + proj.name + '\nرقم الإيصال: ' + (e.seq || ''));
      const wa1 = _pd?.client_phone ? `<a href="https://wa.me/${_pd.client_phone}?text=${txt}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 1</a>` : '';
      const wa2 = _pd?.client_phone2 ? `<a href="https://wa.me/${_pd.client_phone2}?text=${txt}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;background:#128C7E;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 2</a>` : '';
      const noPhone = !_pd?.client_phone ? `<span style="font-size:10px;color:var(--text-soft)">لا يوجد رقم</span>` : '';
      const _incMsg=encodeURIComponent('مرحباً،\nنفيدكم باستلام مبلغ '+fn(e.amount)+' ج\nالمشروع: '+proj.name+'\nرقم الإيصال: '+(e.seq||'')+'\nالتاريخ: '+(e.entry_date||''));
      const msgBtn=`<button onclick="showWaMsg(event,'${_incMsg}')" style="background:var(--bg-faint);border:0.5px solid var(--border);border-radius:5px;padding:3px 7px;font-size:10px;cursor:pointer;font-family:inherit;color:var(--text-body)">📋 رسالة</button>`;
      return `<div class="rw"><div class="ri"><div class="rd">${esc(e.description)||'دفعة'} <span class="nb">${e.seq||''}</span></div><div class="rm">${e.entry_date||'—'}</div></div><div class="flex-center-gap"><div class="ra pos">+${fn(e.amount)} ج</div>${msgBtn}${wa1}${wa2}${noPhone}</div></div>`;
    }).join('');

    // بناء صفوف المقاولين
    const mqRows = Object.entries(mqMap).map(([mqName, rows]) => {
      const phones = (allProjectsMap[proj.id]?.contractor_phones || {})[mqName] || {};
      const ph1 = phones.p1 || ''; const ph2 = phones.p2 || '';
      const editBtn = uRole==='admin'?`<button onclick="event.stopPropagation();mqEditPhonesForProj('${mqName.replace(/'/g,"\\'")}','${proj.id}','${ph1}','${ph2}')" style="background:var(--bg-faint);border:0.5px solid var(--border);border-radius:5px;padding:2px 7px;font-size:10px;cursor:pointer;font-family:inherit;color:var(--text-body)">📱 الأرقام</button>`:''
      const mqTotal = rows.reduce((s, e) => s + e.amount, 0);
      const entryRows = rows.sort((a, b) => (b.seq || 0) - (a.seq || 0)).map(e => {
        const txt = encodeURIComponent('مرحباً ' + e.contractor + '، نفيدكم بصرف مبلغ ' + fn(e.amount) + ' ج\nالمشروع: ' + proj.name + '\nرقم القيد: ' + (e.seq || ''));
        const wa1 = ph1 ? `<a href="https://wa.me/${ph1}?text=${txt}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 1</a>` : '';
        const wa2 = ph2 ? `<a href="https://wa.me/${ph2}?text=${txt}" target="_blank" style="display:inline-flex;align-items:center;gap:3px;background:#128C7E;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 2</a>` : '';
        const noPhone = !ph1 ? `<span style="font-size:10px;color:var(--text-soft)">لا يوجد رقم</span>` : '';
        const _expMsg=encodeURIComponent('مرحباً '+e.contractor+'،\nنفيدكم بصرف مبلغ '+fn(e.amount)+' ج\nالمشروع: '+proj.name+'\nالبند: '+(e.category||'—')+'\nرقم القيد: '+(e.seq||'')+'\nالتاريخ: '+(e.entry_date||''));
        const expMsgBtn=`<button onclick="showWaMsg(event,'${_expMsg}')" style="background:var(--bg-faint);border:0.5px solid var(--border);border-radius:5px;padding:3px 7px;font-size:10px;cursor:pointer;font-family:inherit;color:var(--text-body)">📋 رسالة</button>`;
        return `<div class="rw" style="padding-right:12px"><div class="ri"><div class="rd">${esc(e.description)||'—'} <span class="nb">${e.seq||''}</span></div><div class="rm">${e.entry_date||'—'} · ${esc(e.category)||'—'}</div></div><div class="flex-center-gap"><div class="ra">${fn(e.amount)} ج</div>${expMsgBtn}${wa1}${wa2}${noPhone}</div></div>`;
      }).join('');
      return `<div style="margin-bottom:8px"><div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--bg-faint);border-radius:6px;margin-bottom:4px"><span style="font-size:12px;font-weight:700;color:var(--text-body)">👷 ${esc(mqName)}</span><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:var(--danger);font-weight:700">${fn(mqTotal)} ج</span>${editBtn}</div></div>${entryRows}</div>`;
    }).join('');

    const hasInc = !mqQ && incEntries.length > 0;
    const hasMq = Object.keys(mqMap).length > 0;
    if (!hasInc && !hasMq) return;

    html += `<div class="card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-faint);border-bottom:0.5px solid var(--border);cursor:pointer" onclick="const b=this.nextElementSibling;b.style.display=b.style.display==='none'?'block':'none'">
        <div><div style="font-size:13px;font-weight:700;color:var(--primary)">🏗️ ${esc(proj.name)}</div><div style="font-size:11px;color:var(--text-soft);margin-top:2px">${incEntries.length} وارد · ${Object.keys(mqMap).length} مقاول</div></div>
        <div style="display:flex;gap:8px">
          <span style="font-size:11px;background:var(--success-ghost);color:var(--primary-btn);padding:2px 8px;border-radius:8px">+${fn(totalIn)} ج</span>
          <span style="font-size:11px;background:var(--danger-pale);color:var(--danger);padding:2px 8px;border-radius:8px">-${fn(totalOut)} ج</span>
        </div>
      </div>
      <div style="padding:12px 14px;display:block">
        ${hasInc ? `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;padding-bottom:4px;border-bottom:0.5px solid var(--border)"><span style="font-size:11px;font-weight:700;color:var(--primary-btn)">▲ الوارد — صاحب العمل</span>${uRole==='admin'?`<button onclick="editClientPhones('${proj.id}')" style="background:var(--bg-faint);border:0.5px solid var(--border);border-radius:5px;padding:2px 7px;font-size:10px;cursor:pointer;font-family:inherit;color:var(--text-body)">📱 الأرقام</button>`:''}</div>${incRows}` : ''}
        ${hasMq ? `<div style="font-size:11px;font-weight:700;color:var(--danger);margin:${hasInc ? '10px' : '0'} 0 6px;padding-bottom:4px;border-bottom:0.5px solid var(--border)">▼ المقاولين — دفعات صرفت</div>${mqRows}` : ''}
      </div>
    </div>`;
  });

  el.innerHTML = html || '<div class="emp">لا توجد نتائج</div>';
}

// تعديل أرقام مقاول من شاشة دفعاتي (بـ project_id محدد)
async function mqEditPhonesForProj(name, projId, p1, p2) {
  let ov = document.getElementById('mqPhonesModal'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'mqPhonesModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `<div class="modal-box-lg"><div class="modal-hdr"><div class="title-lg">📱 أرقام واتساب المقاول</div><button onclick="document.getElementById('mqPhonesModal').remove()" class="btn-close-sm">✕</button></div><div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:4px">👷 ${name}</div><div style="font-size:12px;color:var(--text-soft);margin-bottom:14px">🏗️ ${allProjectsMap[projId]?.name||''}</div><label class="lbl-lg">📱 رقم واتساب 1</label><input id="mqPh1" type="text" value="${p1}" placeholder="مثال: 201001234567" class="inp-lg"><label class="lbl-lg">📱 رقم واتساب 2 (اختياري)</label><input id="mqPh2" type="text" value="${p2}" placeholder="مثال: 201001234567" class="inp-lg"><div id="mqPhMsg" style="min-height:18px;font-size:12px;margin:8px 0"></div><div class="modal-btns"><button onclick="saveMqPhonesForProj('${name.replace(/'/g,"\\'")}','${projId}')" class="btn-primary">💾 حفظ</button><button onclick="document.getElementById('mqPhonesModal').remove()" class="btn-cancel">إلغاء</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('mqPh1').focus();
}

async function saveMqPhonesForProj(name, projId) {
  const p1 = document.getElementById('mqPh1').value.trim();
  const p2 = document.getElementById('mqPh2').value.trim();
  const msg = document.getElementById('mqPhMsg');
  msg.style.color = 'var(--warning-text)'; msg.textContent = '⏳ جاري الحفظ...';
  try {
    const cur = allProjectsMap[projId]?.contractor_phones || {};
    const updated = { ...cur, [name]: { p1: p1 || null, p2: p2 || null } };
    await sb('projects?id=eq.' + projId, 'PATCH', { contractor_phones: updated });
    const idx = allProjects.findIndex(p => p.id === projId);
    if (idx >= 0) allProjects[idx].contractor_phones = updated;
    const idx2 = projects.findIndex(p => p.id === projId);
    if (idx2 >= 0) projects[idx2].contractor_phones = updated;
    if (allProjectsMap[projId]) allProjectsMap[projId].contractor_phones = updated;
    msg.style.color = 'var(--primary-btn)'; msg.textContent = '✅ تم الحفظ';
    setSav('✅ تم حفظ أرقام ' + name, 'ok');
    setTimeout(() => { document.getElementById('mqPhonesModal')?.remove(); renderDaf3ati(); }, 600);
  } catch (e) { msg.style.color = 'var(--danger)'; msg.textContent = '❌ خطأ: ' + e.message; }
}

// ── modal تعديل أرقام صاحب العمل من دفعاتي ──
async function editClientPhones(projId) {
  const p = allProjectsMap[projId];
  if (!p) return;
  let ov = document.getElementById('clientPhonesModal'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'clientPhonesModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `<div class="modal-box-lg"><div class="modal-hdr"><div class="title-lg">📱 أرقام واتساب صاحب العمل</div><button onclick="document.getElementById('clientPhonesModal').remove()" class="btn-close-sm">✕</button></div><div style="font-size:14px;font-weight:700;color:var(--primary);margin-bottom:14px">🏗️ ${p.name}</div><label class="lbl-lg">📱 رقم واتساب 1</label><input id="cpPh1" type="text" value="${p.client_phone||''}" placeholder="مثال: 201001234567" class="inp-lg"><label class="lbl-lg">📱 رقم واتساب 2 (اختياري)</label><input id="cpPh2" type="text" value="${p.client_phone2||''}" placeholder="مثال: 201001234567" class="inp-lg"><div id="cpPhMsg" style="min-height:18px;font-size:12px;margin:8px 0"></div><div class="modal-btns"><button onclick="saveClientPhones('${projId}')" class="btn-primary">💾 حفظ</button><button onclick="document.getElementById('clientPhonesModal').remove()" class="btn-cancel">إلغاء</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.getElementById('cpPh1').focus();
}

async function saveClientPhones(projId) {
  const p1 = document.getElementById('cpPh1').value.trim();
  const p2 = document.getElementById('cpPh2').value.trim();
  const msg = document.getElementById('cpPhMsg');
  msg.style.color = 'var(--warning-text)'; msg.textContent = '⏳ جاري الحفظ...';
  try {
    const upd = { client_phone: p1 || null, client_phone2: p2 || null };
    await sb('projects?id=eq.' + projId, 'PATCH', upd);
    if (allProjectsMap[projId]) { allProjectsMap[projId].client_phone = p1 || null; allProjectsMap[projId].client_phone2 = p2 || null; }
    const idx = allProjects.findIndex(p => p.id === projId);
    if (idx >= 0) { allProjects[idx].client_phone = p1 || null; allProjects[idx].client_phone2 = p2 || null; }
    msg.style.color = 'var(--primary-btn)'; msg.textContent = '✅ تم الحفظ';
    setSav('✅ تم حفظ أرقام صاحب العمل', 'ok');
    setTimeout(() => { document.getElementById('clientPhonesModal')?.remove(); renderDaf3ati(); }, 600);
  } catch (e) { msg.style.color = 'var(--danger)'; msg.textContent = '❌ خطأ: ' + e.message; }
}

// ── عرض الرسالة للنسخ ──
function showWaMsg(event, encodedMsg) {
  event.stopPropagation();
  const msg = decodeURIComponent(encodedMsg);
  let ov = document.getElementById('waMsgModal'); if (ov) ov.remove();
  ov = document.createElement('div'); ov.id = 'waMsgModal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `<div class="modal-box-lg"><div class="modal-hdr"><div class="title-lg">📋 الرسالة</div><button onclick="document.getElementById('waMsgModal').remove()" class="btn-close-sm">✕</button></div><textarea id="waMsgTxt" style="width:100%;min-height:140px;padding:10px;border:0.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit;resize:none;direction:rtl;background:var(--bg-faint);color:var(--text-body)">${msg.replace(/</g,'&lt;')}</textarea><div class="modal-btns"><button onclick="copyWaMsg()" class="btn-primary">📋 نسخ</button><button onclick="document.getElementById('waMsgModal').remove()" class="btn-cancel">إغلاق</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

function copyWaMsg() {
  const txt = document.getElementById('waMsgTxt');
  if (!txt) return;
  navigator.clipboard.writeText(txt.value).then(() => notify('✅ تم نسخ الرسالة', 'ok')).catch(() => { txt.select(); document.execCommand('copy'); notify('✅ تم النسخ', 'ok'); });
  document.getElementById('waMsgModal')?.remove();
}
