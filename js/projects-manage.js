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
function st(t){cT=t;document.getElementById('tx').classList.toggle('on',t==='e');document.getElementById('ti').classList.toggle('on',t==='i');document.getElementById('ic').style.display=t==='e'?'block':'none';document.getElementById('iq').style.display=t==='e'?'block':'none';}
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
