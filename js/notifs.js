async function loadApprovals(silent=false){
  const el=document.getElementById('approvalsList');
  if(!el)return;
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
    const totalCount=(entRows?entRows.length:0)+(advRows?advRows.length:0);
    let html='';

    // ── شريط التحكم الجماعي ──
    html+='<div id="bulkBar" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 0;margin-bottom:8px;border-bottom:1px solid var(--border)">'+
      '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;font-weight:600">'+
        '<input type="checkbox" id="selectAllChk" onchange="toggleSelectAll(this.checked)" style="width:16px;height:16px;cursor:pointer">'+
        ' تحديد الكل ('+totalCount+')'+
      '</label>'+
      '<button onclick="bulkApprove()" style="background:var(--primary);color:var(--accent);border:none;border-radius:8px;padding:6px 14px;font-family:inherit;font-size:12px;cursor:pointer;font-weight:600">✅ موافقة المحدد</button>'+
      '<button onclick="bulkReject()" style="background:var(--danger-bg,#FEE2E2);color:var(--danger);border:1px solid var(--danger);border-radius:8px;padding:6px 14px;font-family:inherit;font-size:12px;cursor:pointer;font-weight:600">❌ رفض المحدد</button>'+
    '</div>';

    // ── قيود المشاريع — مجمّعة حسب الشخص ──
    if(hasEntries){
      html+='<div class="appr-entries-title">📋 قيود المشاريع ('+entRows.length+')</div>';
      // تجميع حسب submitted_by
      const groups={};
      entRows.forEach(r=>{
        const person=profMap[r.submitted_by]||'غير معروف';
        if(!groups[person])groups[person]=[];
        groups[person].push(r);
      });
      Object.entries(groups).forEach(([person,items])=>{
        const avatar=person.trim()[0]||'?';
        const totExp=items.filter(i=>i.type==='e').reduce((s,i)=>s+i.amount,0);
        const totInc=items.filter(i=>i.type==='i').reduce((s,i)=>s+i.amount,0);
        const totHtml=(totInc>0?'<span style="color:#1D6A3E;font-weight:800">+'+fn(totInc)+'</span> ':'')+(totExp>0?'<span style="color:#C0392B;font-weight:800">-'+fn(totExp)+'</span>':'');
        html+='<div style="margin-bottom:14px">'+
          '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-faint,#eef2ee);border-radius:10px 10px 0 0;border:1px solid var(--border-light,#dde8dd);border-bottom:none">'+
            '<div style="width:32px;height:32px;border-radius:50%;background:#1D3C2A;color:#D4C49A;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">'+avatar+'</div>'+
            '<div style="font-size:13px;font-weight:700;color:var(--text-dark,#1a2e1f);flex:1">'+person+'</div>'+
            '<div style="font-size:11px;color:var(--text-muted,#888)">'+items.length+' قيد</div>'+
            '<div style="font-size:12px">'+totHtml+'</div>'+
          '</div>';
        items.forEach((r,idx)=>{
          const proj=projMap[r.project_id]||'—';
          const isInc=r.type==='i';
          const typeLabel=isInc
            ?'<span class="appr-income-badge">📥 وارد</span>'
            :'<span class="appr-expense-badge">📤 مصروف</span>';
          const timeAgo=(function(){
            if(!r.submitted_at)return'—';
            const diff=Math.floor((Date.now()-new Date(r.submitted_at))/60000);
            if(diff<1)return'الآن';if(diff<60)return diff+' د';
            if(diff<1440)return Math.floor(diff/60)+' س';
            return Math.floor(diff/1440)+' يوم';
          })();
          const borderTop=idx>0?'border-top:1px solid var(--border-faint,#f0f0ee);':'';
          html+='<div class="appr-item" id="appr-e-'+r.id+'" style="border-radius:'+(idx===items.length-1?'0 0 10px 10px':'0')+';border-top:none;'+borderTop+'">'+
            '<div class="appr-item-header">'+
              '<div style="display:flex;align-items:center;gap:8px">'+
                '<input type="checkbox" class="appr-chk" data-id="'+r.id+'" data-type="entry" style="width:16px;height:16px;cursor:pointer" onchange="updateBulkBar()">'+
                '<div class="appr-item-title-row">'+
                  typeLabel+
                  '<span class="title-sm">'+fn(r.amount)+' ج</span>'+
                  (r.category?'<span class="appr-item-cat">'+r.category+'</span>':'')+
                '</div>'+
              '</div>'+
              '<span class="appr-meta-sm">'+timeAgo+'</span>'+
            '</div>'+
            '<div class="appr-item-meta">'+
              (r.description?'<span>📝 '+r.description+'</span> &nbsp;':'')+
              (r.contractor?'<span>👷 '+r.contractor+'</span> &nbsp;':'')+
              '<span class="appr-meta-text">🏗️ '+proj+'</span> &nbsp;'+
              '<span class="appr-meta-text">📅 '+(cleanDate(r.entry_date)||'—')+'</span>'+
            '</div>'+
            '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
              '<button onclick="approveEntry(''+r.id+'')" class="appr-approve-btn">✅ موافقة</button>'+
              '<button onclick="editAndApproveEntry(''+r.id+'')" class="appr-edit-approve-btn">✏️ تعديل</button>'+
              '<button onclick="rejectEntry(''+r.id+'')" class="appr-reject-btn">❌ رفض</button>'+
              '<button onclick="requestInvoice(''+r.id+'',''+((r.description||'').replace(/'/g,"\'"))+'',''+((r.category||'').replace(/'/g,"\'"))+'',''+((r.entry_date||'').replace(/'/g,"\'"))+'','+r.amount+',''+(allProjects.find(p=>p.id===r.project_id)?.name||'—').replace(/'/g,"\'")+'',''+((r.contractor||'').replace(/'/g,"\'")+'')'))+'">📋 فاتورة</button>'+
            '</div>'+
          '</div>';
        });
        html+='</div>';
      });
    }

    // ── العهد ──
    if(hasAdv){
      html+='<div class="appr-advances-title">💼 العهد والدفعات ('+advRows.length+')</div>';
      html+=advRows.map(r=>{
        const isAdv=r.type==='advance';
        const label=isAdv
          ?'<span class="appr-adv-new-badge">💼 عهدة جديدة</span>'
          :'<span class="appr-adv-inst-badge">💰 دفعة</span>';
        const detail=isAdv
          ?'<span class="title-sm">'+(r.person_name||'—')+'</span>'+(r.notes?' <span class="appr-meta-text">· '+r.notes+'</span>':'')
          :'<span class="title-sm">'+fn(r.amount)+' ج</span> <span class="appr-meta-text">لـ '+(advMap[r.advance_id]||'—')+'</span> <span class="appr-meta-sm">· '+(r.inst_note||'دفعة')+'</span>';
        const submitter=profMap[r.submitted_by]||'—';
        return '<div class="appr-item" id="appr-a-'+r.id+'">'+
          '<div class="appr-item-header">'+
            '<div style="display:flex;align-items:center;gap:8px">'+
              '<input type="checkbox" class="appr-chk" data-id="'+r.id+'" data-type="adv" style="width:16px;height:16px;cursor:pointer" onchange="updateBulkBar()">'+
              '<div class="appr-item-title-row">'+label+' '+detail+'</div>'+
            '</div>'+
            '<span class="appr-meta-sm">👤 '+submitter+'</span>'+
          '</div>'+
          '<div style="display:flex;gap:8px">'+
            '<button onclick="approveAdv(''+r.id+'')" class="appr-adv-approve-btn">✅ موافقة</button>'+
            '<button onclick="rejectAdv(''+r.id+'')" class="appr-adv-reject-btn">❌ رفض</button>'+
          '</div>'+
        '</div>';
      }).join('');
    }
    el.innerHTML=html;
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
    const last=await sb('entries?select=seq&order=seq.desc&limit=1');
    let nextSeq=(last&&last.length?Number(last[0].seq||20260000):20260000);
    if(nextSeq<20260000)nextSeq=20260000;
    nextSeq++;
    const entry={
      id:r.id,
      project_id:newProjId,
      type:document.getElementById('eaType').value,
      amount:amt,
      category:document.getElementById('eaCat').value.trim(),
      description:document.getElementById('eaDesc').value.trim(),
      entry_date:document.getElementById('eaDate').value.trim(),
      contractor:document.getElementById('eaContr').value.trim(),
      advance_id:r.advance_id||null,
      seq:nextSeq,
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
    const last=await sb('entries?select=seq&order=seq.desc&limit=1');
    let nextSeq=(last&&last.length?Number(last[0].seq||20260000):20260000);
    if(nextSeq<20260000)nextSeq=20260000;
    nextSeq++;
    const entry={id:r.id,project_id:r.project_id,type:r.type,amount:r.amount,category:r.category||'',description:r.description||'',entry_date:r.entry_date||'',contractor:r.contractor||'',advance_id:r.advance_id||null,seq:nextSeq,created_by:r.submitted_by};
    await sb('entries','POST',entry);
    await sb('pending_entries?id=eq.'+id,'DELETE');
    if(r.project_id===curPid){await loadEntries();allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);refreshProjSummary(curPid);}
    auditLog('موافقة على قيد','entries',id,{project:allProjects.find(p=>p.id===r.project_id)?.name,amount:r.amount,category:r.category,submitted_by:r.submitted_by});
    if(!silent){setSav('✅ تمت الموافقة وتم حفظ القيد','ok');updatePendingBadge();loadApprovals();if(curAdv)loadAdvDetail();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}

async function rejectEntry(id,silent=false){
  if(!silent)await new Promise(res=>showConfirm({icon:'❌',title:'رفض القيد',msg:'هيتحذف القيد نهائياً.',okLabel:'رفض',okType:'danger',onOk:res}));
  try{
    await sb('pending_entries?id=eq.'+id,'DELETE');
    auditLog('رفض قيد','pending_entries',id,{});
    if(!silent){setSav('🗑️ تم رفض القيد','ng');updatePendingBadge();loadApprovals();if(curAdv)loadAdvDetail();}
  }catch(e){if(!silent)setSav('❌ '+friendlyError(e),'er');}
}
// ══════════════════════════════════════

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
    if(!silent){updatePendingBadge();loadApprovals();}
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

function notifFmtTime(iso){
  const d=new Date(iso);const now=new Date();
  const diff=Math.floor((now-d)/1000);
  if(diff<60)return 'الآن';
  if(diff<3600)return Math.floor(diff/60)+' د';
  if(diff<86400)return Math.floor(diff/3600)+' س';
  return d.toLocaleDateString('ar-EG',{day:'numeric',month:'short'});
}

function pushNotif({type,title,sub,icon,ts,pid,eid}){
  const n={id:Date.now()+'_'+Math.random().toString(36).slice(2),type,title,sub,icon:icon||NOTIF_ICONS[type]||'🔔',ts:ts||new Date().toISOString(),read:false,pid:pid||null,eid:eid||null};
  notifList.unshift(n);
  if(notifList.length>80)notifList=notifList.slice(0,80);
  if(!notifPanelOpen){
    notifUnread++;
    updateNotifBadge();
    showToast(n);
  }
  if(notifPanelOpen&&npCurrentTab==='notifs')renderNpNotifs();
}

function updateNotifBadge(){
  const badge=document.getElementById('notifBadge');
  const bell=document.getElementById('notifBellBtn');
  if(!badge||!bell)return;
  if(notifUnread>0){
    badge.style.display='flex';
    badge.textContent=notifUnread>99?'99+':notifUnread;
    bell.style.animation='none';
    setTimeout(()=>bell.style.animation='',10);
  }else{
    badge.style.display='none';
  }
}

function showToast(n){
  const wrap=document.getElementById('notifToastWrap');
  if(!wrap)return;
  const dur=6000;
  const el=document.createElement('div');
  el.className='ntoast '+(NOTIF_TYPES[n.type]||'nt-entry');
  el.style.setProperty('--dur',dur/1000+'s');
  el.innerHTML=`<div class="ntoast-icon">${n.icon}</div><div class="ntoast-body"><div class="ntoast-title">${n.title}</div>${n.sub?`<div class="ntoast-sub">${n.sub}</div>`:''}${n.ts?`<div class="ntoast-time">${notifFmtTime(n.ts)}</div>`:''}</div><div class="ntoast-bar"></div>`;
  el.onclick=()=>{
    dismissToast(el);
    if(n.pid)goToEntry(n.pid,n.eid);
  };
  wrap.prepend(el);
  // limit toasts on screen
  const toasts=wrap.querySelectorAll('.ntoast');
  if(toasts.length>4)toasts[toasts.length-1].remove();
  setTimeout(()=>dismissToast(el),dur);
}

function dismissToast(el){
  if(!el||!el.parentNode)return;
  el.style.animation='toast-out .35s cubic-bezier(.4,0,.2,1) forwards';
  setTimeout(()=>el.remove(),350);
}

function openNotifPanel(tab){
  tab=tab||'notifs';
  npCurrentTab=tab;
  notifPanelOpen=true;
  notifUnread=0;
  updateNotifBadge();
  document.getElementById('notifPanel').classList.add('open');
  document.getElementById('notifOverlay').classList.add('open');
  switchNpTab(tab,true);
  refreshOnlineUsers();
}

function closeNotifPanel(){
  notifPanelOpen=false;
  document.getElementById('notifPanel').classList.remove('open');
  document.getElementById('notifOverlay').classList.remove('open');
}

function switchNpTab(tab,force){
  if(npCurrentTab===tab&&!force)return;
  npCurrentTab=tab;
  ['notifs','online'].forEach(t=>{
    const btn=document.getElementById('npTab-'+t);
    if(btn)btn.className='np-tab'+(t===tab?' active':'');
  });
  if(tab==='notifs')renderNpNotifs();
  else renderNpOnline();
}

// الانتقال المباشر للقيد من الإشعار
function goToEntry(pid,eid){
  closeNotifPanel();
  if(!pid)return;
  showScreen('proj');
  setTimeout(async()=>{
    document.getElementById('ps').value=pid;
    await sw(pid);
    // بعد ما القيود تتحمل، نلاقي القيد ونوصّله
    if(!eid)return;
    setTimeout(()=>{
      const rows=document.querySelectorAll('#ent .rw');
      rows.forEach(row=>{
        if(row.dataset.eid===eid){
          row.scrollIntoView({behavior:'smooth',block:'center'});
          row.style.transition='background .3s';
          row.style.background='rgba(212,196,154,.2)';
          setTimeout(()=>row.style.background='',2000);
        }
      });
    },600);
  },150);
}

function renderNpNotifs(){
  const body=document.getElementById('npBody');
  if(!body)return;
  if(!notifList.length){body.innerHTML='<div class="np-empty">🔔<br>لا توجد إشعارات</div>';return;}

  // Group by time
  const now=Date.now();
  const today=[],yesterday=[],older=[];
  notifList.forEach(n=>{
    const age=now-n.ts;
    if(age<86400000)today.push(n);
    else if(age<172800000)yesterday.push(n);
    else older.push(n);
  });

  const unreadCount=notifList.filter(n=>!n.read).length;
  const renderGroup=(label,items)=>items.length?`
    <div class="np-group-lbl">${label}</div>
    ${items.map(n=>`<div class="ni${!n.read?' unread':''}" ${n.pid?`onclick="goToEntry('${n.pid}','${n.eid||''}')"`:''}>
      <div class="ni-icon-wrap ${!n.read?'unread':''}">${n.icon}</div>
      <div class="ni-body">
        <div class="ni-title">${n.title}</div>
        ${n.sub?`<div class="ni-sub">${n.sub}</div>`:''}
        <div class="ni-time">${notifFmtTime(n.ts)}${n.pid?' · اضغط للانتقال':''}</div>
      </div>
    </div>`).join('')}`:'';

  body.innerHTML=`
    <div class="np-actions">
      ${unreadCount?`<button class="np-mark-read" onclick="markAllNotifsRead()">✓ تحديد الكل كمقروء (${unreadCount})</button>`:''}
      <button class="np-clear" onclick="clearAllNotifs()">🗑 مسح</button>
    </div>
    ${renderGroup('اليوم',today)}
    ${renderGroup('أمس',yesterday)}
    ${renderGroup('أقدم',older)}`;

  notifList.forEach(n=>n.read=true);
}

function markAllNotifsRead(){
  notifList.forEach(n=>n.read=true);
  renderNpNotifs();
  updateNotifBadge();
}

function renderNpOnline(){
  const body=document.getElementById('npBody');
  if(!body)return;
  if(!onlineUsersData.length){
    body.innerHTML='<div class="np-empty">👥<br>جاري تحميل المستخدمين...</div>';
    refreshOnlineUsers();
    return;
  }
  const sorted=[...onlineUsersData].sort((a,b)=>(b.is_online?1:0)-(a.is_online?1:0));
  body.innerHTML=sorted.map(u=>{
    const initials=(u.name||'?').charAt(0).toUpperCase();
    const lastSeenTxt=u.is_online?'<span style="color:var(--success-soft);font-size:10px">● متصل الآن</span>':(u.last_seen?`آخر ظهور: ${notifFmtTime(u.last_seen)}`:'لم يتصل بعد');
    return `<div class="ou-card">
      <div class="ou-avatar">${initials}<span class="ou-status ${u.is_online?'on':'off'}"></span></div>
      <div style="flex:1;min-width:0">
        <div class="ou-name">${u.name||'—'}${u.id===uid?' <span class="online-you-label">(أنت)</span>':''}</div>
        <div class="ou-role">${ROLE_LABELS[u.role]||u.role||''}</div>
        <div class="ou-lastseen">${lastSeenTxt}</div>
      </div>
    </div>`;
  }).join('');
  const onlineCount=onlineUsersData.filter(u=>u.is_online).length;
  const npInfo=document.getElementById('npOnlineInfo');
  if(npInfo)npInfo.textContent=onlineCount+' متصل الآن من '+onlineUsersData.length+' مستخدم';
}

function clearAllNotifs(){
  notifList=[];
  notifUnread=0;
  updateNotifBadge();
  renderNpNotifs();
}

async function refreshOnlineUsers(){
  try{
    const[profiles,presence]=await Promise.all([
      sb('profiles?order=name'),
      sb('user_presence')
    ]);
    const presMap={};
    (presence||[]).forEach(p=>{
      const isOnline=p.is_online&&(Date.now()-new Date(p.last_seen).getTime())<120000;
      presMap[p.user_id]={is_online:isOnline,last_seen:p.last_seen};
    });
    onlineUsersData=(profiles||[]).map(p=>({
      id:p.id,name:p.name,role:p.role,
      is_online:presMap[p.id]?.is_online||false,
      last_seen:presMap[p.id]?.last_seen||null
    }));
    // update notifUserMap
    (profiles||[]).forEach(p=>{notifUserMap[p.id]={name:p.name,role:p.role};});
    // update online pill
    const cnt=onlineUsersData.filter(u=>u.is_online).length;
    const pill=document.getElementById('onlinePill');
    const cntEl=document.getElementById('onlineCount');
    if(pill&&cnt>0){pill.style.display='flex';if(cntEl)cntEl.textContent=cnt;}
    else if(pill){pill.style.display='none';}
    if(notifPanelOpen&&npCurrentTab==='online')renderNpOnline();
  }catch(e){console.warn('refreshOnlineUsers:',e);} // صامت متعمد
}

async function getUserName(userId){
  if(!userId)return 'مستخدم';
  if(notifUserMap[userId])return notifUserMap[userId].name||'مستخدم';
  // لو مش موجود في الـ map، اجيب البيانات
  try{await refreshOnlineUsers();}catch(e){console.warn('getUserName:',e);} // صامت متعمد
  return notifUserMap[userId]?.name||'مستخدم';
}

async function updatePresence(){
  // stub — presence system removed with chat
  try{
    if(!window._sbc||!uid)return;
    await _sbc.from('user_presence').upsert({user_id:uid,is_online:true,last_seen:new Date().toISOString()},{onConflict:'user_id'});
  }catch(e){console.warn('updatePresence:',e);} // صامت متعمد
}

function initNotifSystem(){
  // show bell
  const bell=document.getElementById('notifBellBtn');
  if(bell)bell.style.display='block';
  // سجّل الحضور فوراً (مش بس لما يفتح الرسائل)
  updatePresence().then(()=>refreshOnlineUsers());
  // setup realtime listeners for pending notifications
  setupNotifRealtime();
  // refresh online every 45s
  setInterval(()=>{updatePresence().then(()=>refreshOnlineUsers());},45000);
}

function setupNotifRealtime(){
  if(!window._sbc)return;
  if(_rtNotifCh){_sbc.removeChannel(_rtNotifCh);_rtNotifCh=null;}
  if(_rtPendNotifCh){_sbc.removeChannel(_rtPendNotifCh);_rtPendNotifCh=null;}

  _rtPendNotifCh=_sbc.channel('notif-pending')
    .on('postgres_changes',{event:'*',schema:'public',table:'pending_entries'},
      async(payload)=>{
        window._rtOk=true;
        updatePendingBadge();
        if(curScreen==='approvals')loadApprovals(true);
        if(curScreen==='dash')loadDashboard();
        if(uRole==='admin'&&payload.eventType==='INSERT'){
          const r=payload.new;
          if(r.submitted_by===uid)return;
          const who=await getUserName(r.submitted_by);
          const projName=allProjectsMap[r.project_id]?.name||'مشروع';
          pushNotif({type:'pending_entry',title:`${who} طلب موافقة على قيد`,sub:`${fn(r.amount)} ج · ${projName}${r.category?' · '+r.category:''}`});
        }
      }
    )
    .on('postgres_changes',{event:'*',schema:'public',table:'pending_advances'},
      async(payload)=>{
        window._rtOk=true;
        updatePendingBadge();
        if(curScreen==='approvals')loadApprovals(true);
        if(curScreen==='dash')loadDashboard();
        if(uRole==='admin'&&payload.eventType==='INSERT'){
          const r=payload.new;
          if(r.submitted_by===uid)return;
          const who=await getUserName(r.submitted_by);
          const label=r.type==='advance'?'عهدة جديدة':'دفعة';
          pushNotif({type:'pending_adv',title:`${who} طلب موافقة — ${label}`,sub:r.person_name?`${r.person_name}`:r.amount?`${fn(r.amount)} ج`:''});
        }
      }
    )
    .subscribe((status)=>{});
}

