
var editingAdvEntryId=null;
// ██ ADVANCES — العهد ════════════════════════════════
function editAdvEntry(id){
  editingAdvEntryId=id;
  sb('entries?id=eq.'+id).then(res=>{
    if(!res||!res.length)return;
    var e=res[0];
    document.getElementById('advEpT').textContent='تعديل المصروف #'+(e.seq||'?');
    // ملي قائمة المشاريع
    const sel=document.getElementById('advEPrj');
    sel.innerHTML=allProjects.map(p=>`<option value="${p.id}"${p.id===e.project_id?' selected':''}>${p.name}</option>`).join('');
    document.getElementById('advEA').value=e.amount;
    document.getElementById('advEC').value=e.category||'';
    document.getElementById('advED').value=e.description||'';
    document.getElementById('advEM').value=e.contractor||'';
    if(e.entry_date&&e.entry_date!=='—'){var p=e.entry_date.split('/');if(p.length===3)document.getElementById('advEDt').value=p[2]+'-'+p[1]+'-'+p[0];}
    else document.getElementById('advEDt').value='';
    document.getElementById('advEp').style.display='block';
    document.getElementById('advEp').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
}
function cancelAdvEdit(){
  document.getElementById('advEp').style.display='none';
  editingAdvEntryId=null;
}
async function saveAdvEntry(){
  if(!editingAdvEntryId)return;
  var a=parseFloat(document.getElementById('advEA').value);
  if(isNaN(a)){notify('ادخل المبلغ','err');return;}
  var newPid=document.getElementById('advEPrj').value;
  var upd={amount:a,description:document.getElementById('advED').value.trim(),entry_date:fd(document.getElementById('advEDt').value),category:document.getElementById('advEC').value.trim(),contractor:document.getElementById('advEM').value.trim()};
  if(newPid)upd.project_id=newPid;
  setSav('جاري الحفظ...','ng');
  try{
    await sb('entries?id=eq.'+editingAdvEntryId,'PATCH',upd);
    setSav('تم التعديل','ok');
    cancelAdvEdit();
    await loadAdvDetail();
    if(curPid&&(curPid===newPid||!newPid))await loadEntries();
  }catch(e){setSav('خطأ: '+e.message,'er');}
}

async function delAdvEntry(id){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المصروف',msg:'هيتحذف المصروف نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{await sb('entries?id=eq.'+id,'DELETE');setSav('✅ تم الحذف','ok');await loadAdvDetail();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function toggleAdvIm(){const im=document.getElementById('advIm');im.style.display=im.style.display==='block'?'none':'block';}

async function doAdvIm(){
  const txt=document.getElementById('advImT').value.trim();if(!txt){notify('الصق البيانات أولاً','warn');return;}
  const ents=[];let sk=0;
  const projMap={};allProjects.forEach(p=>{projMap[p.name.trim().toLowerCase()]=p.id;});
  const projSeqs={};
  txt.split('\n').filter(l=>l.trim()).forEach(l=>{
    const ps=l.split('\t').map(x=>x.trim());
    if(ps.length<4){sk++;return;}
    const pName=ps[0].toLowerCase();const cat=ps[1];const desc=ps[2];const amt=parseFloat(ps[3].replace(/,/g,''));
    if(isNaN(amt)||amt<=0){sk++;return;}
    if(!cat){sk++;return;}
    if(!desc){sk++;return;}
    const pid=projMap[pName];
    if(!pid){sk++;return;}
    if(!projSeqs[pid])projSeqs[pid]=0;
    projSeqs[pid]++;
    const e={id:uid_(),project_id:pid,type:'e',amount:amt,description:desc||'',entry_date:pimd(ps[4]||''),category:cat,contractor:ps[5]||'',seq:projSeqs[pid],advance_id:curAdv.id};
    ents.push(e);
  });
  if(!ents.length){notify('لم يتم استيراد أي قيد — تأكد من اسم المشروع صح','warn');return;}
  setSav('💾 جاري الاستيراد...','ng');
  try{
    if(uRole==='admin'){
      const pids=[...new Set(ents.map(e=>e.project_id))];
      const seqBase={};
      await Promise.all(pids.map(async pid=>{
        try{const r=await sb('entries?project_id=eq.'+pid+'&select=seq&order=seq.desc&limit=1');seqBase[pid]=r.length?(r[0].seq||0):0;}
        catch(e){seqBase[pid]=0;}
      }));
      const counter={};
      ents.forEach(e=>{
        if(!counter[e.project_id])counter[e.project_id]=seqBase[e.project_id]||0;
        counter[e.project_id]++;
        e.seq=counter[e.project_id];
      });
      await sb('entries','POST',ents);
      setSav('✅ تم استيراد '+ents.length+' قيد'+(sk?' (تخطي '+sk+')':''),'ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    document.getElementById('advImT').value='';
    document.getElementById('advIm').style.display='none';
    await loadAdvDetail();
    await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}


async function addInstallment(){
  const amt=parseFloat(document.getElementById('advInstAmt').value);
  const dt=fd(document.getElementById('advInstDate').value);
  const note=document.getElementById('advInstNote').value.trim();
  if(isNaN(amt)||amt<=0){notify('ادخل المبلغ','err');return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('advance_installments','POST',{advance_id:curAdv.id,amount:amt,inst_date:dt,note:note||'دفعة'});
      setSav('✅ تم إضافة الدفعة','ok');
    }else{
      await sb('pending_advances','POST',{type:'installment',advance_id:curAdv.id,amount:amt,inst_date:dt,inst_note:note||'دفعة',submitted_by:uid,submitted_at:new Date().toISOString()});
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
    }
    document.getElementById('advInstAmt').value='';
    document.getElementById('advInstNote').value='';
    await loadAdvDetail();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function editInstall(id,amount,date,note){
  const ex=document.getElementById('_editInstModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_editInstModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:360px;width:100%">
    <div style="text-align:center;margin-bottom:16px"><div style="font-size:28px">✏️</div><div class="title-md">تعديل الدفعة</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="_eiAmt" type="number" placeholder="المبلغ (ج)" value="${amount}" class="inp-lg">
      <input id="_eiDate" type="text" placeholder="dd/mm/yyyy" value="${date}" maxlength="10" class="inp-lg">
      <input id="_eiNote" type="text" placeholder="ملاحظة" value="${note}" class="inp-lg">
    </div>
    <div id="_eiMsg" style="color:var(--danger);font-size:12px;min-height:18px;margin-top:6px"></div>
    <div class="modal-btns" style="margin-top:14px">
      <button onclick="saveEditInstall('${id}')" class="btn-primary">💾 حفظ</button>
      <button onclick="document.getElementById('_editInstModal').remove()" class="btn-cancel">إلغاء</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>{const el=document.getElementById('_eiDate');if(el)initDateInput(el);},100);
  setTimeout(()=>document.getElementById('_eiAmt')?.focus(),150);
}

async function saveEditInstall(id){
  const amt=parseFloat(document.getElementById('_eiAmt').value);
  const date=fd(document.getElementById('_eiDate').value.trim());
  const note=document.getElementById('_eiNote').value.trim()||'دفعة';
  const msg=document.getElementById('_eiMsg');
  if(isNaN(amt)||amt<=0){msg.textContent='❌ ادخل مبلغ صح';return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    await sb('advance_installments?id=eq.'+id,'PATCH',{amount:amt,inst_date:date,note});
    document.getElementById('_editInstModal')?.remove();
    setSav('✅ تم التعديل','ok');
    notify('✅ تم تعديل الدفعة','ok');
    await loadAdvDetail();
  }catch(e){msg.textContent='❌ '+friendlyError(e);setSav('❌ فشل التعديل','er');}
}

async function delInstall(id){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف الدفعة',msg:'هيتحذف الدفعة نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{await sb('advance_installments?id=eq.'+id,'DELETE');setSav('✅ تم الحذف','ok');await loadAdvDetail();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function editAdv(){
  if(uRole==='viewer'||(uRole!=='admin'&&advances.find(a=>a.id===curAdv.id)&&window._curAdvInstalls?.length>0)){
    showConfirm({icon:'🔒',title:'العهدة مقفولة',msg:'العهدة اتوافق عليها ومش ممكن تتعدل. تواصل مع الأدمن لو محتاج تعديل.',okLabel:'حسناً',okType:'primary',onOk:()=>{}});
    return;
  }
  showPromptModal({title:'✏️ تعديل العهدة',label:'اسم الشخص',defaultVal:curAdv.person_name,okLabel:'التالي',onOk:(newName)=>{
    showPromptModal({title:'✏️ تعديل العهدة',label:'ملاحظات (اختياري)',defaultVal:curAdv.notes||'',placeholder:'أي ملاحظات...',okLabel:'حفظ',onOk:async(newNotes)=>{
      setSav('💾 جاري الحفظ...','ng');
      try{
        await sb('advances?id=eq.'+curAdv.id,'PATCH',{person_name:newName.trim(),notes:newNotes||''});
        curAdv.person_name=newName.trim();curAdv.notes=newNotes||'';
        document.getElementById('advDetName').textContent='👤 '+curAdv.person_name;
        document.getElementById('advDetNotes').textContent=curAdv.notes||'';
        setSav('✅ تم التعديل','ok');
        const idx=advances.findIndex(a=>a.id===curAdv.id);
        if(idx>-1){advances[idx].person_name=curAdv.person_name;advances[idx].notes=curAdv.notes;}
      }catch(e){setSav('❌ '+friendlyError(e),'er');}
    }});
  }});
}

async function deleteAdv(){
  await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف العهدة',msg:'هيتحذف عهدة "'+curAdv.person_name+'" مع كل الدفعات والمصروفات. متأكد؟',okLabel:'حذف',okType:'danger',onOk:res}));
  setSav('💾 جاري الحذف...','ng');
  try{
    await sb('advance_installments?advance_id=eq.'+curAdv.id,'DELETE');
    await sb('entries?advance_id=eq.'+curAdv.id,'PATCH',{advance_id:null});
    await sb('advances?id=eq.'+curAdv.id,'DELETE');
    advances=advances.filter(a=>a.id!==curAdv.id);
    setSav('✅ تم حذف العهدة','ok');
    backToAdvList();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function toggleAdvStatus(){
  const newStatus=curAdv.status==='open'?'closed':'open';
  try{
    await sb('advances?id=eq.'+curAdv.id,'PATCH',{status:newStatus});
    curAdv.status=newStatus;
    const isOpen=newStatus==='open';
    const btn=document.getElementById('advCloseBtn');
    btn.textContent=isOpen?'✅ إغلاق العهدة':'🔓 فتح العهدة';
    btn.style.background=isOpen?'var(--primary-btn)':'var(--warning-text)';
    document.getElementById('advEntryFormDiv').style.display=isOpen&&uRole!=='viewer'?'block':'none';
    setSav('✅ تم تغيير حالة العهدة','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

function backToAdvList(){
  document.getElementById('advDetail').style.display='none';
  document.getElementById('advScreen').style.display='block';
  loadAdvList();
}

// ADMIN
