// ██ APPROVALS — كود الموافقات (منقول من search.js)
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
