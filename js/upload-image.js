// ██ IMAGE UPLOAD — رفع صور العهد والقيود ══════════════════════════

const BUCKET = 'receipts';

// ── رفع صورة لـ Supabase Storage ──
async function uploadImage(file, folder) {
  const token = localStorage.getItem('lg_tk');
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
  if (!allowed.includes(ext)) { notify('نوع الملف غير مدعوم', 'err'); return null; }
  if (file.size > 5 * 1024 * 1024) { notify('الحجم أكبر من 5MB', 'err'); return null; }
  const path = `${folder}/${uid_()}.${ext}`;
  const res = await fetch(`${SB}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      'apikey': AK,
      'Authorization': `Bearer ${token || AK}`,
      'Content-Type': file.type,
      'x-upsert': 'true'
    },
    body: file
  });
  if (!res.ok) { const e = await res.json(); notify('فشل الرفع: ' + (e.error || e.message || ''), 'err'); return null; }
  return `${SB}/storage/v1/object/public/${BUCKET}/${path}`;
}

// ── حذف صورة من Storage ──
async function deleteImage(url) {
  if (!url) return;
  const path = url.split(`/object/public/${BUCKET}/`)[1];
  if (!path) return;
  const token = localStorage.getItem('lg_tk');
  await fetch(`${SB}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'DELETE',
    headers: { 'apikey': AK, 'Authorization': `Bearer ${token || AK}` }
  });
}

// ── مربع رفع صورة (HTML) ──
function imgUploadBox(inputId, previewId) {
  return `
  <div style="margin-top:8px">
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;
      background:var(--bg-ivory,#f9f9f6);border:1.5px dashed var(--border,#ddd);
      border-radius:10px;padding:10px 14px;font-size:13px;color:var(--text-soft,#888);
      transition:.2s" onmouseover="this.style.borderColor='var(--primary-btn,#1D7A50)'"
      onmouseout="this.style.borderColor='var(--border,#ddd)'">
      <span style="font-size:20px">📎</span>
      <span>إرفاق صورة / إيصال (اختياري)</span>
      <input id="${inputId}" type="file" accept="image/*,application/pdf"
        style="display:none" onchange="previewImg(this,'${previewId}')">
    </label>
    <div id="${previewId}" style="display:none;margin-top:8px;text-align:center"></div>
  </div>`;
}

// ── معاينة الصورة قبل الرفع ──
function previewImg(input, previewId) {
  const prev = document.getElementById(previewId);
  if (!prev || !input.files[0]) return;
  const file = input.files[0];
  if (file.type === 'application/pdf') {
    prev.style.display = 'block';
    prev.innerHTML = `<div style="display:inline-flex;align-items:center;gap:6px;background:#f0f0f0;
      padding:6px 12px;border-radius:8px;font-size:12px;color:#555">
      📄 ${file.name}
      <span onclick="clearImgPreview('${input.id}','${previewId}')"
        style="cursor:pointer;color:#e74c3c;font-size:14px;margin-right:4px">✕</span>
    </div>`;
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    prev.style.display = 'block';
    prev.innerHTML = `<div style="position:relative;display:inline-block">
      <img src="${e.target.result}" style="max-height:80px;max-width:100%;border-radius:8px;
        border:1.5px solid var(--border,#ddd);object-fit:cover">
      <span onclick="clearImgPreview('${input.id}','${previewId}')"
        style="position:absolute;top:-6px;left:-6px;background:#e74c3c;color:#fff;
        border-radius:50%;width:18px;height:18px;display:flex;align-items:center;
        justify-content:center;font-size:11px;cursor:pointer;font-weight:700">✕</span>
    </div>`;
  };
  reader.readAsDataURL(file);
}

function clearImgPreview(inputId, previewId) {
  const inp = document.getElementById(inputId);
  const prev = document.getElementById(previewId);
  if (inp) inp.value = '';
  if (prev) { prev.style.display = 'none'; prev.innerHTML = ''; }
}

// ── عرض صورة صغيرة في القائمة ──
function thumbHtml(url, id) {
  if (!url) return '';
  const isPdf = url.toLowerCase().includes('.pdf');
  if (isPdf) return `<a href="${url}" target="_blank"
    style="display:inline-flex;align-items:center;gap:4px;font-size:11px;
    color:var(--primary,#1D7A50);text-decoration:none;background:var(--bg-ivory,#f9f9f6);
    border:1px solid var(--border,#ddd);border-radius:6px;padding:3px 8px">
    📄 إيصال</a>`;
  return `<img src="${url}" alt="صورة"
    onclick="viewFullImg('${url}')"
    style="width:32px;height:32px;border-radius:6px;object-fit:cover;cursor:pointer;
    border:1.5px solid var(--border,#ddd);transition:.2s"
    onmouseover="this.style.transform='scale(1.15)'"
    onmouseout="this.style.transform='scale(1)'"
    title="اضغط لعرض الصورة">`;
}

// ── عرض الصورة كاملة ──
function viewFullImg(url) {
  const ex = document.getElementById('_imgViewer'); if (ex) ex.remove();
  const ov = document.createElement('div');
  ov.id = '_imgViewer';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out';
  ov.innerHTML = `<div style="position:relative;max-width:90vw;max-height:90vh">
    <img src="${url}" style="max-width:100%;max-height:90vh;border-radius:12px;object-fit:contain;box-shadow:0 8px 40px rgba(0,0,0,.6)">
    <button onclick="document.getElementById('_imgViewer').remove()"
      style="position:absolute;top:-14px;right:-14px;background:#e74c3c;color:#fff;border:none;
      border-radius:50%;width:30px;height:30px;font-size:16px;cursor:pointer;font-weight:700">✕</button>
    <a href="${url}" target="_blank" download
      style="position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);
      background:rgba(255,255,255,.15);color:#fff;text-decoration:none;padding:6px 16px;
      border-radius:20px;font-size:12px;backdrop-filter:blur(4px)">⬇️ تحميل</a>
  </div>`;
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

// ── رفع صورة للعهدة مباشرة ──
function triggerAdvImg() {
  const inp = document.getElementById('advImgInput');
  if (inp) inp.click();
}

async function uploadAdvImage(input) {
  const file = input.files?.[0];
  if (!file || !curAdv?.id) return;
  setSav('⬆️ جاري رفع الصورة...', 'ng');
  const url = await uploadImage(file, 'advances');
  if (!url) return;
  try {
    const token = localStorage.getItem('lg_tk');
    await fetch(`${SB}/rest/v1/advances?id=eq.${curAdv.id}`, {
      method: 'PATCH',
      headers: { 'apikey': AK, 'Authorization': `Bearer ${token || AK}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify({ image_url: url })
    });
    curAdv.image_url = url;
    const advImgEl = document.getElementById('advDetImg');
    if (advImgEl) { advImgEl.innerHTML = thumbHtml(url, 'adv_' + curAdv.id); advImgEl.style.marginTop = '6px'; }
    setSav('✅ تم رفع الصورة', 'ok');
    notify('✅ تم رفع صورة العهدة', 'ok');
  } catch (e) { setSav('❌ ' + (e.message || 'خطأ'), 'er'); }
}
