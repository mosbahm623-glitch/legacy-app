async function np(){showPromptModal({title:'➕ مشروع جديد',label:'اسم المشروع',placeholder:'مثال: فيلا المعادي',okLabel:'إضافة',onOk:async(n)=>{try{const p=await sb('projects','POST',{name:n,start_date:fd(ts()),close_date:fd(ts())});allProjects.push(p[0]);projects.push(p[0]);curPid=p[0].id;entries=[];cTab='s';populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}});}
async function dp(){if(projects.length<=1){notify('لا يمكن حذف المشروع الوحيد','warn');return;}showConfirm({icon:'🗑️',title:'حذف المشروع',msg:'هيتحذف مشروع "'+curP().name+'" بالكامل مع كل قيوده. متأكد؟',okLabel:'حذف',okType:'danger',onOk:async()=>{try{await sb('projects?id=eq.'+curPid,'DELETE');allProjects=allProjects.filter(p=>p.id!==curPid);projects=projects.filter(p=>p.id!==curPid);curPid=projects[0].id;cTab='s';await loadEntries();populateAdvProjSel();setSav('✅ تم','ok');rp();}catch(e){setSav('❌ '+friendlyError(e),'er');}}});}

function editProject(){
  const p=curP();
  if(!p)return;
  let ov=document.getElementById('editProjModal');
  if(ov)ov.remove();
  ov=document.createElement('div');
  ov.id='editProjModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div class="modal-box-lg">
      <div class="modal-hdr">
        <div class="title-lg">✏️ تعديل المشروع</div>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-close-sm">✕</button>
      </div>
      <label class="lbl-lg">اسم المشروع</label>
      <input id="epName" type="text" value="${(p.name||'').replace(/"/g,'&quot;')}"
        class="inp-lg"
        onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
      <div class="proj-edit-dates-row">
        <div>
          <label class="lbl-lg">📅 تاريخ البداية</label>
          <input id="epStart" type="text" value="${p.start_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <div>
          <label class="lbl-lg">📅 تاريخ الإغلاق</label>
          <input id="epClose" type="text" value="${p.close_date||''}" placeholder="dd/mm/yyyy"
            class="inp-md"
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
        <button onclick="saveProjectEdit()" class="btn-primary">💾 حفظ التعديلات</button>
        <button onclick="document.getElementById('editProjModal').remove()" class="btn-cancel">إلغاء</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  document.getElementById('epName').focus();
  setTimeout(()=>{initDateInput(document.getElementById('epStart'));initDateInput(document.getElementById('epClose'));},0);
}

async function saveProjectEdit(){
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
    await sb('projects?id=eq.'+curPid,'PATCH',upd);
    // حدّث الذاكرة
    const idx=allProjects.findIndex(p=>p.id===curPid);
    if(idx>=0){allProjects[idx]={...allProjects[idx],...upd};}
    const idx2=projects.findIndex(p=>p.id===curPid);
    if(idx2>=0){projects[idx2]={...projects[idx2],...upd};}
    // حدّث الـ select
    const sel=document.getElementById('ps');
    if(sel){const opt=[...sel.options].find(o=>o.value===curPid);if(opt)opt.textContent=name;}
    // حدّث حقول التواريخ في الشاشة
    const dstEl=document.getElementById('dst');
    const dclEl=document.getElementById('dcl');
    if(dstEl)dstEl.value=start||'';
    if(dclEl)dclEl.value=close||'';
    msg.style.color='var(--primary-btn)';msg.textContent='✅ تم الحفظ';
    setSav('✅ تم تعديل المشروع','ok');
    setTimeout(()=>document.getElementById('editProjModal')?.remove(),700);
  }catch(e){msg.style.color='var(--danger)';msg.textContent='❌ خطأ: '+e.message;}
}
async function upm(k,v){const u=k==='s'?{start_date:v}:{close_date:v};try{await sb('projects?id=eq.'+curPid,'PATCH',u);}catch(e){setSav('❌ '+friendlyError(e),'er');}}
function oe(id){
  if(uRole==='viewer')return;
  const e=entries.find(x=>x.id===id);if(!e)return;
  // منع تعديل قيد معتمد
  if(e.status==='approved'){notify('❌ القيد معتمد — لا يمكن تعديله','err');return;}
  edId=id;edType=e.type;
  document.getElementById('ep-t').textContent='تعديل القيد '+(e.seq||'?');
  // populate project dropdown
  const ePrj=document.getElementById('ePrj');
  ePrj.innerHTML=allProjects.map(p=>'<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>').join('');
  document.getElementById('eA').value=e.amount;
  document.getElementById('eC').value=e.category||'';document.getElementById('eC').style.display=e.type==='e'?'block':'none';
  document.getElementById('eD').value=e.description||'';
  document.getElementById('eM').value=e.contractor||'';document.getElementById('eM').style.display=e.type==='e'?'block':'none';
  if(e.entry_date&&e.entry_date!=='—'){const p=e.entry_date.split('/');if(p.length===3)document.getElementById('eDt').value=p[2]+'-'+p[1]+'-'+p[0];}else document.getElementById('eDt').value='';
  // entry_type buttons
  const wrap=document.getElementById('editEtypeWrap');
  if(e.type==='e'&&e.contractor){
    wrap.classList.add('show');
    curEditEtype=e.entry_type||'payment';
    ['payment','work','material'].forEach(t=>{
      const btn=document.getElementById('eEt-'+t);
      btn.classList.toggle('on',t===curEditEtype);
    });
  }else{wrap.classList.remove('show');curEditEtype=null;}
  // payment_method
  const _ePmtSel=document.getElementById('ePmt');
  const _ePmtOther=document.getElementById('ePmtOther');
  if(_ePmtSel){
    const pv=e.payment_method||'';
    const known=['كاش','الأهلي','CIB'];
    if(known.includes(pv)){_ePmtSel.value=pv;if(_ePmtOther)_ePmtOther.style.display='none';}
    else if(pv){_ePmtSel.value='أخرى';if(_ePmtOther){_ePmtOther.value=pv;_ePmtOther.style.display='block';}}
    else{_ePmtSel.value='';if(_ePmtOther)_ePmtOther.style.display='none';}
  }
  document.getElementById('ep').style.display='block';
}
function cep(){document.getElementById('ep').style.display='none';edId=null;edType=null;}
function st(t){
  cT=t;
  document.getElementById('tx').classList.toggle('on',t==='e');
  document.getElementById('ti').classList.toggle('on',t==='i');
  document.getElementById('ic').style.display=t==='e'?'block':'none';
  document.getElementById('iq').style.display=t==='e'?'block':'none';

}
function setCTab(t){stab(t);}
function stab(t){
  cTab=t;window._rpPage=0;
  const fb=document.getElementById('entryFilterBar');
  if(fb)fb.style.display=t==='j'?'flex':'none';
  if(t==='j'){
    setTimeout(()=>{
      const ff=document.getElementById('entFltFrom');
      const ft=document.getElementById('entFltTo');
      if(ff&&!ff._dpInit)initDateInput(ff);
      if(ft&&!ft._dpInit)initDateInput(ft);
    },100);
  }
  rp();
}

// ══ INVOICE LIGHTBOX ══════════════════════════════
const SB_URL='https://ctcoqgluaytwelnutrox.supabase.co';
const SB_AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';

function openInvoiceLb(id){
  const e=entries.find(x=>x.id===id);if(!e||!e.img_url)return;
  const lb=document.getElementById('invLb');
  const img=document.getElementById('invLbImg');
  const title=document.getElementById('invLbTitle');
  const meta=document.getElementById('invLbMeta');
  if(!lb)return;
  img.src=e.img_url;
  title.textContent=(e.description||'قيد')+' — '+(e.seq||'');
  meta.textContent=fn(Math.abs(e.amount))+' ج · '+(e.contractor||'')+(e.entry_date?' · '+cleanDate(e.entry_date):'');
  lb.style.display='flex';
  document.body.style.overflow='hidden';
}

function openInvoiceUpload(id){
  const e=entries.find(x=>x.id===id);if(!e)return;
  const lb=document.getElementById('invLb');
  const img=document.getElementById('invLbImg');
  const title=document.getElementById('invLbTitle');
  const meta=document.getElementById('invLbMeta');
  const uploadArea=document.getElementById('invLbUpload');
  const imgArea=document.getElementById('invLbImgArea');
  const openBtn=document.getElementById('invLbOpenBtn');
  if(!lb)return;
  window._invUploadId=id;
  img.src='';
  title.textContent='إرفاق فاتورة — '+(e.description||'');
  meta.textContent=fn(Math.abs(e.amount))+' ج · '+(cleanDate(e.entry_date)||'');
  imgArea.style.display='none';
  uploadArea.style.display='flex';
  if(openBtn)openBtn.style.display='none';
  lb.style.display='flex';
  document.body.style.overflow='hidden';
}

function closeInvoiceLb(){
  const lb=document.getElementById('invLb');
  if(lb)lb.style.display='none';
  document.body.style.overflow='';
  window._invUploadId=null;
}

async function handleInvoiceUpload(input){
  const file=input.files[0];if(!file)return;
  if(file.size>8*1024*1024){notify('الحجم أكبر من 8MB','err');return;}
  const id=window._invUploadId;if(!id)return;
  const uploadArea=document.getElementById('invLbUpload');
  const imgArea=document.getElementById('invLbImgArea');
  const img=document.getElementById('invLbImg');
  const openBtn=document.getElementById('invLbOpenBtn');
  uploadArea.innerHTML=`<div style="color:var(--text-muted);font-size:13px">⏳ جاري الرفع...</div>`;
  try{
    const ext=file.name.split('.').pop().toLowerCase();
    const path=`${id}/invoice_${Date.now()}.${ext}`;
    const upRes=await fetch(`${SB_URL}/storage/v1/object/invoices/${path}`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+(token||SB_AK),'apikey':SB_AK,'Content-Type':file.type,'x-upsert':'true'},
      body:file
    });
    if(!upRes.ok){const err=await upRes.text();throw new Error(err);}
    const publicUrl=`${SB_URL}/storage/v1/object/public/invoices/${path}`;
    await sb('entries?id=eq.'+id,'PATCH',{img_url:publicUrl});
    const entry=entries.find(x=>x.id===id);
    if(entry)entry.img_url=publicUrl;
    img.src=publicUrl;
    imgArea.style.display='flex';
    uploadArea.style.display='none';
    if(openBtn)openBtn.style.display='inline-flex';
    document.getElementById('invLbTitle').textContent=(entries.find(x=>x.id===id)?.description||'قيد')+' — '+(entries.find(x=>x.id===id)?.seq||'');
    rp();
    notify('✅ تم رفع الفاتورة','ok');
  }catch(err){
    notify('❌ فشل الرفع: '+err.message,'err');
    uploadArea.innerHTML=`<label style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px"><input type="file" accept="image/*" style="display:none" onchange="handleInvoiceUpload(this)"><span style="font-size:28px">📁</span><span style="font-size:13px;color:var(--text-muted)">اضغط لإعادة المحاولة</span></label>`;
  }
  input.value='';
}

async function deleteInvoice(){
  const lb=document.getElementById('invLb');
  const img=document.getElementById('invLbImg');
  const url=img.src;
  if(!url||!window._invUploadId)return;
  if(!confirm('هتحذف الفاتورة؟'))return;
  const id=window._invUploadId;
  try{
    await sb('entries?id=eq.'+id,'PATCH',{img_url:null});
    const entry=entries.find(x=>x.id===id);
    if(entry)entry.img_url=null;
    closeInvoiceLb();
    rp();
    notify('✅ تم حذف الفاتورة','ok');
  }catch(e){notify('❌ '+friendlyError(e),'err');}
}
