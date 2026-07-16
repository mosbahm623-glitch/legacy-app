
function _advCatFilter(val){
  var dd=document.getElementById('_advCatDD');
  if(!dd)return;
  var base=typeof _CATS!=='undefined'?_CATS:[];
  var extra=(allEntries||[]).map(function(e){return e.category;}).filter(Boolean);
  var all=[...new Set([...base,...extra])].sort();
  var filtered=val?all.filter(function(c){return c.includes(val);}):all;
  if(!val){dd.style.display='none';return;}
  if(!filtered.length){dd.innerHTML='<div style="padding:10px 14px;font-size:12px;color:#999">لا يوجد</div>';dd.style.display='block';return;}
  dd.style.display='block';
  dd.innerHTML=filtered.map(function(c){
    var safe=c.replace(/'/g,"\'");
    return '<div onmousedown="event.preventDefault();document.getElementById(\'advCat\').value=\''+safe+'\';document.getElementById(\'_advCatDD\').style.display=\'none\'" style="padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0ee" onmouseenter="this.style.background=\'#f5f0e8\'" onmouseleave="this.style.background=\'\'" >'+c+'</div>';
  }).join('');
}

async function loadAdvList(){
  setSav('⏳ جاري تحميل العهد...','ng');
  // Populate user selector (admin only)
  if(uRole==='admin'){
    const sel=document.getElementById('advUserSel');
    if(sel&&allChatUsers&&allChatUsers.length){
      sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
      allChatUsers.forEach(u=>{
        const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
        sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
      });
    } else if(sel){
      try{
        const users=await sb('profiles?order=name');
        sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
        users.forEach(u=>{
          const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
          sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
        });
      }catch(e){notify('⚠️ تعذّر تحميل قائمة المستخدمين','warn');console.warn(e);}
    }
  }
  try{
    const query=uRole==='viewer'
      ?'advances?user_id=eq.'+uid+'&order=created_at'
      :'advances?order=created_at';
    advances=await sb(query);
    const al=document.getElementById('advList');
    if(!advances.length){al.innerHTML='<div class="emp">لا توجد عهد بعد</div>';return;}
    // جيب الدفعات والمصروفات دفعة واحدة
    const [allInst,allE]=await Promise.all([
      sb('advance_installments?order=created_at'),
      sbAll('entries?advance_id=not.is.null')
    ]);
    al.innerHTML=advances.map(a=>{
      const totalGiven=allInst.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allE.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      const rem=totalGiven-spent;
      const pct=totalGiven>0?Math.min(100,Math.round((spent/totalGiven)*100)):0;
      const ownerUser=(allChatUsers||[]).find(u=>u.id===a.user_id);
      const ownerBadge=ownerUser&&uRole==='admin'?'<span class="adv-owner-badge">🔗 '+ownerUser.name+'</span>':'';
      const remColor=rem<0?'var(--danger)':rem===0?'var(--primary-btn)':'var(--warning-text)';
      return '<div class="adv-card" onclick="openAdv(\''+a.id+'\')"><div class="adv-card-h"><div class="adv-name">👤 '+a.person_name+ownerBadge+'</div><span class="adv-status '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'⏳ مفتوحة':'✅ مغلقة')+'</span></div>'+(a.notes?'<div class="adv-notes-text">'+a.notes+'</div>':'')+'<div class="adv-nums"><div class="adv-num"><div class="adv-num-l">العهدة</div><div class="adv-num-v" style="color:#185FA5">'+fn(totalGiven)+'</div></div><div class="adv-num"><div class="adv-num-l">صرف</div><div class="adv-num-v" style="color:#922B21">'+fn(spent)+'</div></div><div class="adv-num"><div class="adv-num-l">الباقي</div><div class="adv-num-v" style="color:'+remColor+'">'+fn(rem)+'</div></div></div><div class="adv-progress-wrap"><div class="adv-progress-bar-inner"></div></div></div>';
    }).join('');
    setSav('☁️ متصل — بياناتك محفوظة','ok');
  }catch(e){document.getElementById('advList').innerHTML='<div class="emp">❌ خطأ في التحميل</div>';setSav('❌ خطأ في التحميل','er');}
}

async function createAdv(){
  const name=document.getElementById('advName').value.trim();
  const notes=document.getElementById('advNotes').value.trim();
  const selUser=document.getElementById('advUserSel').value||uid;
  if(!name){notify('ادخل اسم الشخص','err');return;}
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      const a=await sb('advances','POST',{person_name:name,amount:0,notes,status:'open',user_id:selUser});
      advances.push(a[0]);
      setSav('✅ تم إضافة الشخص','ok');
    }else{
      await sb('pending_advances','POST',{type:'advance',person_name:name,notes,adv_user_id:selUser,submitted_by:uid,submitted_at:new Date().toISOString()});
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
    }
    document.getElementById('advName').value='';
    document.getElementById('advNotes').value='';
    await loadAdvList();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function openAdv(id){try{
  curAdv=advances.find(a=>a.id===id);if(!curAdv)return;
  if(typeof closeSidebar==='function')closeSidebar();
  document.getElementById('advScreen').style.display='none';
  document.getElementById('advDetail').style.display='block';
  document.getElementById('advDetName').textContent='👤 '+curAdv.person_name;
  document.getElementById('advDetNotes').textContent=curAdv.notes||'';
  const isOpen=curAdv.status==='open';
  const btn=document.getElementById('advCloseBtn');
  btn.textContent=isOpen?'✅ إغلاق العهدة':'🔓 فتح العهدة';
  btn.style.background=isOpen?'var(--primary-btn)':'var(--warning-text)';
  btn.style.color='var(--accent)';
  const isOwner=curAdv.user_id===uid;
  const canEdit=uRole!=='viewer'&&isOpen;
  const viewerCanAdd=uRole==='viewer'&&isOwner&&isOpen;
  document.getElementById('advInstDiv').style.display=canEdit?'block':'none';
  document.getElementById('advEntryFormDiv').style.display=(canEdit||viewerCanAdd)?'block':'none';
  // Viewer: lock date to today
  const dateField=document.getElementById('advEntDate');
  if(dateField){
    if(viewerCanAdd){
      const today=new Date().toISOString().split('T')[0];
      dateField.value=today;
      dateField.setAttribute('readonly','readonly');
      dateField.style.background='var(--bg-light)';
      dateField.style.color='var(--text-hint)';
      dateField.title='التاريخ ثابت - اليوم فقط';
    } else {
      dateField.removeAttribute('readonly');
      dateField.style.background='';
      dateField.style.color='';
    }
  }
  await loadAdvDetail();
}catch(_e){notify('⚠️ خطأ في فتح العهدة','er');}}

function switchAdvTab(t){
  document.getElementById('advTabPanel-exp').style.display=t==='exp'?'block':'none';
  document.getElementById('advTabPanel-inst').style.display=t==='inst'?'block':'none';
  document.getElementById('advTab-exp').className='adv-tab '+(t==='exp'?'adv-tab-on':'adv-tab-off');
  document.getElementById('advTab-inst').className='adv-tab '+(t==='inst'?'adv-tab-on':'adv-tab-off');
}
function downloadInstallmentsReport(){downloadAdvReport('installs');}
function downloadInstallmentsPDF(){downloadAdvPDF('installs');}
function toggleAdvSection(){}
async function loadAdvDetail(silent=false){
  // Viewer يشوف الدفعات والمصاريف بس - بدون تعديل أو حذف
  const isViewer=uRole==='viewer';
  const editBtn=document.getElementById('advEditBtn');
  const delBtn=document.getElementById('advDelBtn');
  const closeBtn=document.getElementById('advCloseBtn');
  const instDiv=document.getElementById('advInstDiv');
  const linkBtn=document.getElementById('advLinkBtn');
  if(editBtn)editBtn.style.display=isViewer?'none':'';
  if(delBtn)delBtn.style.display=isViewer?'none':'';
  if(closeBtn)closeBtn.style.display=isViewer?'none':'';
  if(instDiv)instDiv.style.display=isViewer?'none':'';
  if(linkBtn)linkBtn.style.display=uRole==='admin'?'inline-block':'none';
  // Re-lock date for viewer
  if(uRole==='viewer'){
    const df=document.getElementById('advEntDate');
    if(df){
      const today=new Date().toISOString().split('T')[0];
      df.value=today;
      df.setAttribute('readonly','readonly');
      df.style.background='var(--bg-light)';
      df.style.color='var(--text-hint)';
    }
  }
  var il=document.getElementById('advInstList');
  var ae=document.getElementById('advEntries');
  var kp=document.getElementById('advDetKp');
  try{
    var advEntries=await sbAll('entries?advance_id=eq.'+curAdv.id+'&order=created_at');
    window._curAdvEntries=advEntries; // للفلتر
    // جيب القيود المنتظرة للعهدة دي
    var pendingAdvEntries=[];
    try{pendingAdvEntries=await sb('pending_entries?advance_id=eq.'+curAdv.id+'&order=submitted_at');}catch(e2){console.warn('pending adv entries:',e2);} // صامت متعمد
    var installs=[];
    try{installs=await sb('advance_installments?advance_id=eq.'+curAdv.id+'&order=created_at');}
    catch(e2){installs=[];}
    window._curAdvInstalls=installs;
    // قفل التعديل لو في دفعات (يعني الأدمن وافق) أو لو viewer
    if(editBtn&&uRole!=='admin'){
      if(isViewer||installs.length>0){
        editBtn.onclick=()=>showConfirm({icon:'🔒',title:'العهدة مقفولة',msg:'العهدة اتوافق عليها ومش ممكن تتعدل. تواصل مع الأدمن لو محتاج تعديل.',okLabel:'حسناً',okType:'primary',onOk:()=>{}});
        editBtn.style.opacity='0.5';
      } else {
        editBtn.onclick=()=>editAdv();
        editBtn.style.opacity='1';
      }
    }
    var totalGiven=installs.reduce((s,ii)=>s+ii.amount,0);
    var spent=advEntries.reduce((s,ee)=>s+ee.amount,0);
    var pendingSpent=pendingAdvEntries.reduce((s,ee)=>s+ee.amount,0);
    var rem=totalGiven-spent;
    var clr=rem<0?'var(--danger)':rem>0?'var(--warning-text)':'var(--primary-btn)';
    kp.innerHTML=`<div class='kc'><div class='kl'>إجمالي الدفعات</div><div class='kv' style='color:var(--info)'>${fn(totalGiven)} ج</div></div><div class='kc'><div class='kl'>صرف</div><div class='kv' style='color:var(--danger)'>${fn(spent)} ج</div></div><div class='kc'><div class='kl'>الباقي</div><div class='kv' style='color:${clr}'>${fn(rem)} ج</div></div>${pendingSpent>0?`<div class='kc'><div class='kl'>⬇️ في الانتظار</div><div class='kv' style='color:var(--warning-text)'>${fn(pendingSpent)} ج</div></div>`:''}`;
    if(installs.length===0){
      il.innerHTML=`<div class='emp'>لا توجد دفعات بعد</div>`;
    }else{
      const instHtml=installs.map(ins=>{var btns=uRole!=='viewer'?`<button style='background:none;border:1px solid #185FA5;color:#185FA5;border-radius:6px;padding:3px 7px;cursor:pointer;font-size:11px;font-family:inherit' onclick='editInstall("${ins.id}",${ins.amount},"${ins.inst_date||''}","${(ins.note||'دفعة').replace(/"/g,"'")}")'>✏️</button><button class='db' onclick='delInstall("${ins.id}")'>🗑</button>`:'';return `<div class='rw'><div class='ri'><div class='rd'>${ins.note||'دفعة'}</div><div class='rm'>${ins.inst_date||'&mdash;'}</div></div><div style='display:flex;align-items:center;gap:4px'><div class='ra pos'>+${fn(ins.amount)} ج</div>${btns}</div></div>`;}).join('');
      il.innerHTML=instHtml;
    }
    if(advEntries.length===0&&pendingAdvEntries.length===0){
      ae.innerHTML=`<div class='emp'>لا توجد مصروفات بعد</div>`;
    }else{
      var projMap={};
      allProjects.forEach(p=>{projMap[p.id]=p.name;});
      const isMob=window.innerWidth<=640;
      const approvedHtml=(()=>{
        if(!advEntries.length) return '';
        if(isMob){
          return advEntries.map((e2,i)=>{
            const pName=projMap[e2.project_id]||'—';
            const isAdvLocked=uRole!=='admin'&&installs.length>0;
            const canEditAdv=!isAdvLocked&&(uRole==='admin'||uRole==='editor'||(curAdv.user_id===uid));
            const btns=isAdvLocked&&uRole!=='admin'
              ?`<button class="db" onclick="notify('العهدة مقفولة','warn')" style="opacity:.5">🔒</button>`
              :canEditAdv?`<button class='db' onclick='editAdvEntry("${e2.id}")' style='color:var(--primary)'>✏️</button><button class='db' onclick='delAdvEntry("${e2.id}")'>🗑</button>`:'';
            const invBtn=e2.img_url?`<button onclick="openInvLb('${e2.img_url}','${(e2.description||'').replace(/'/g,"\\'")}','')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#27500A;cursor:pointer">🧾</button>`:'';
            return `<div style="background:var(--bg-card,#fff);border-radius:10px;padding:10px 12px;margin-bottom:8px;border:0.5px solid var(--border,#eee);box-shadow:0 1px 4px rgba(0,0,0,.05)">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <div style="display:flex;align-items:center;gap:6px">
                  ${e2.seq?`<span class="nb">#${e2.seq}</span>`:''}
                  <span style="font-size:10px;background:var(--bg-ivory,#f0f0ec);border:0.5px solid var(--border,#ddd);padding:2px 7px;border-radius:10px;color:var(--text-soft,#666)">${e2.category||'—'}</span>
                </div>
                <span style="font-weight:700;color:var(--danger,#C0392B);font-size:13px">▼ ${fn(e2.amount)} ج</span>
              </div>
              <div style="font-size:12px;color:var(--text-body,#333);margin-bottom:4px;font-weight:600">${e2.description||'—'}</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--text-soft,#888);margin-bottom:6px">
                <span>${pName}</span>
                ${e2.contractor?`<span>· ${e2.contractor}</span>`:''}
                <span>· ${cleanDate(e2.entry_date)||'—'}</span>
              </div>
              <div style="display:flex;gap:6px;align-items:center">${invBtn}${btns}</div>
            </div>`;
          }).join('');
        }
        return `<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
          <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">#</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">رقم القيد</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px;white-space:nowrap">التاريخ</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">المشروع</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">البند</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">البيان</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px">المقاول</th>
            <th style="color:#D4C49A;padding:7px 10px;text-align:right;font-size:11px;white-space:nowrap">المبلغ</th>
            <th style="color:#D4C49A;padding:7px 6px;text-align:center;font-size:11px">📎</th>
            <th></th>
          </tr></thead>
          <tbody>${advEntries.map((e2,i)=>{
            const pName=projMap[e2.project_id]||'—';
            const isAdvLocked=uRole!=='admin'&&installs.length>0;
            const canEditAdv=!isAdvLocked&&(uRole==='admin'||uRole==='editor'||(curAdv.user_id===uid));
            const btns=isAdvLocked&&uRole!=='admin'?`<button class="db" onclick="notify('العهدة مقفولة','warn')" style="opacity:.5">🔒</button>`:canEditAdv?`<button class='db' onclick='editAdvEntry("${e2.id}")' style='color:var(--primary)'>✏️</button><button class='db' onclick='delAdvEntry("${e2.id}")'>🗑</button>`:'';
            const _dk=document.body.classList.contains('dark-mode');
            const rowBg=i%2===0?(_dk?'var(--bg-card,#1e2a1e)':'#fff'):(_dk?'rgba(212,196,154,.04)':'#f7f7f5');
            const rowHov=_dk?'rgba(29,60,42,.4)':'#eef4ee';
            const rowBrd=_dk?'rgba(212,196,154,.08)':'#eee';
            const invTd=e2.img_url
              ?`<td style="padding:4px 6px;text-align:center"><button onclick="openInvLb('${e2.img_url}','${(e2.description||'').replace(/'/g,"\\'")}','')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 7px;color:#27500A;font-weight:700">🧾</button></td>`
              :`<td style="padding:4px 6px;text-align:center"><span style="display:inline-block;width:18px;height:18px;border:0.5px dashed #ccc;border-radius:3px"></span></td>`;
            return `<tr style="background:${rowBg};border-bottom:0.5px solid ${rowBrd}" onmouseover="this.style.background='${rowHov}'" onmouseout="this.style.background='${rowBg}'">
              <td style="padding:7px 10px;color:var(--text-soft,#aaa);font-size:11px">${i+1}</td>
              <td style="padding:7px 10px">${e2.seq?`<span class="nb">#${e2.seq}</span>`:'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#888);font-size:11px;white-space:nowrap">${cleanDate(e2.entry_date)||'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#555);font-size:11px">${pName}</td>
              <td style="padding:7px 10px"><span style="font-size:10px;background:var(--bg-ivory,#f0f0ec);border:0.5px solid var(--border,#ddd);padding:2px 7px;border-radius:10px;color:var(--text-soft,#666)">${e2.category||'—'}</span></td>
              <td style="padding:7px 10px;color:var(--text-body,#333)">${e2.description||'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#888);font-size:11px">${e2.contractor||'—'}</td>
              <td style="padding:7px 10px;font-weight:500;color:var(--danger,#C0392B);white-space:nowrap">▼ ${fn(e2.amount)} ج</td>
              ${invTd}
              <td style="padding:4px 6px;white-space:nowrap">${btns}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>`;
      })();
      const pendingHtml=pendingAdvEntries.map(e2=>{var pName=projMap[e2.project_id]||'&mdash;';return `<div class='rw' style='opacity:.75;border:1px dashed #C9A84C;background:var(--warning-ghost)'><div class='ri'><div class='rd'>⏳ ${e2.description||'&mdash;'} <span style='font-size:10px;color:var(--warning-text);background:var(--warning-bg);padding:1px 6px;border-radius:8px'>في الانتظار</span></div><div class='rm'>${pName} &middot; ${e2.category||'&mdash;'} &middot; ${cleanDate(e2.entry_date)}</div></div><div style='display:flex;align-items:center'><div class='ra neg' style='color:var(--warning-text)'>${fn(e2.amount)} ج</div></div></div>`;}).join('');
      const totalEntries=advEntries.length+pendingAdvEntries.length;
      ae.innerHTML=approvedHtml+pendingHtml;
    }
  }catch(e){
    il.innerHTML=`<div class='emp'>لا توجد دفعات بعد</div>`;
    ae.innerHTML=`<div class='emp'>لا توجد مصروفات بعد</div>`;
  }
}

function showAdvEntryModal(){
  const ex=document.getElementById('_advEntModal');if(ex)ex.remove();
  const projs=allProjects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const ov=document.createElement('div');
  ov.id='_advEntModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:400px;width:100%">
    <div style="text-align:center;margin-bottom:14px"><div style="font-size:26px">➕</div><div class="title-md">إضافة مصروف على العهدة</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="position:relative">
        <input id="advProjInput" placeholder="🔍 ابحث عن مشروع..." class="inp-lg" autocomplete="off"
          oninput="advProjSearch(this.value)" style="width:100%">
        <input type="hidden" id="advProjSel">
        <div id="advProjDD" style="display:none;position:absolute;top:100%;right:0;left:0;background:#fff;border:1px solid #ddd;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.1);z-index:999;max-height:180px;overflow-y:auto;margin-top:4px"></div>
      </div>
      <div style="position:relative">
        <input id="advCat" placeholder="اكتب أو اختر البند..." class="inp-lg" autocomplete="off"
          oninput="_advCatFilter(this.value)"
                    onblur="setTimeout(()=>{const d=document.getElementById('_advCatDD');if(d)d.style.display='none';},150)">
        <div id="_advCatDD" style="display:none;position:absolute;top:100%;right:0;left:0;background:var(--bg-card,#fff);border:1px solid #ddd;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:999;max-height:200px;overflow-y:auto"></div>
      </div>
      <input id="advDesc" placeholder="البيان" class="inp-lg">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <input id="advEntAmt" type="number" placeholder="المبلغ (ج)" step="any" class="inp-lg">
        <input id="advEntDate" type="text" placeholder="dd/mm/yyyy" maxlength="10" class="inp-lg">
      </div>
      <input id="advMq" placeholder="👷 المقاول (اختياري)" class="inp-lg" list="ql">
      <div><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><label style="font-size:11px;color:#999;font-weight:700">صورة الفاتورة</label><span style="font-size:9px;color:#bbb;background:#f0f0ec;border-radius:10px;padding:1px 6px">اختياري</span></div>
      <input type="file" id="advInvFile" accept="image/*,application/pdf" style="display:none" onchange="advInvSelect(this)" multiple>
      <div id="advInvArea" style="border:1.5px dashed #ccc;border-radius:10px;overflow:hidden;display:block">
        <label for="advInvFile" id="advInvEmpty" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;cursor:pointer"><span style="font-size:15px">📎</span><span style="font-size:12px;color:#aaa;font-weight:600">إرفاق صورة أو PDF (يمكن أكثر من صورة)</span></label>
        <div id="advInvFilled" style="display:none;flex-direction:column;padding:8px 10px;background:#f0faf0">
          <div id="advInvList"></div>
        </div>
      </div></div>
    </div>
    <div class="modal-btns" style="margin-top:14px">
      <button onclick="addAdvEntry()" class="btn-primary">+ إضافة</button>
      <button onclick="document.getElementById('_advEntModal').remove()" class="btn-cancel">إلغاء</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>{const el=document.getElementById('advEntDate');if(el){initDateInput(el);if(!el.value)el.value=ts();}},100);
  setTimeout(()=>document.getElementById('advCat')?.focus(),150);
}


let _lastAdvProjId='', _lastAdvProjName='';

function advProjSearch(q){
  const dd=document.getElementById('advProjDD');
  const inp=document.getElementById('advProjInput');
  if(!dd||!inp)return;
  if(!q.trim()){dd.style.display='none';return;}
  const filtered=allProjects.filter(p=>p.name.includes(q.trim()));
  if(!filtered.length){dd.style.display='none';return;}
  dd.innerHTML=filtered.map(p=>`
    <div onclick="advProjSelect('${p.id}','${p.name.replace(/'/g,"\'")}')"
      style="padding:10px 14px;cursor:pointer;font-size:13px;font-weight:600;border-bottom:1px solid #f5f5f5"
      onmouseover="this.style.background='#f0f7f0'" onmouseout="this.style.background='#fff'">
      ${p.name}
    </div>`).join('');
  dd.style.display='block';
  // أغلق لو ضغط بره
  setTimeout(()=>{
    document.addEventListener('click', function _c(e){
      if(!dd.contains(e.target)&&e.target!==inp){dd.style.display='none';}
      document.removeEventListener('click',_c);
    });
  },100);
}

function advProjSelect(id, name){
  _lastAdvProjId=id;
  _lastAdvProjName=name;
  document.getElementById('advProjSel').value=id;
  document.getElementById('advProjInput').value=name;
  document.getElementById('advProjDD').style.display='none';
}

function _showAdvConfirm(msg, color){
  // امسح القديمة
  const ex=document.getElementById('_advConfirmMsg');
  if(ex)ex.remove();
  // دور على الـ modal box
  const modal=document.querySelector('#_advEntModal .modal-box');
  if(!modal)return;
  const el=document.createElement('div');
  el.id='_advConfirmMsg';
  el.style.cssText=`background:${color};color:#fff;padding:10px 16px;border-radius:10px;font-family:Cairo,sans-serif;font-size:13px;font-weight:700;text-align:center;margin-bottom:12px;animation:fadeIn .2s ease`;
  el.textContent=msg;
  // حطه في أول الـ modal box
  modal.insertBefore(el, modal.firstChild);
  setTimeout(()=>el.remove(), 3000);
}
async function addAdvEntry(){
  const pid=document.getElementById('advProjSel').value;
  const cat=document.getElementById('advCat').value.trim();
  const desc=document.getElementById('advDesc').value.trim();
  const amt=parseFloat(document.getElementById('advEntAmt').value);
  const dt=fd(document.getElementById('advEntDate').value);
  const mq=document.getElementById('advMq').value.trim();
  if(!pid){notify('اختار المشروع','warn');return;}
  if(!cat){notify('ادخل البند','err');return;}
  if(!dt){notify('❌ ادخل التاريخ','err');return;}
  if(isNaN(amt)||amt<=0){notify('ادخل مبلغ صحيح','err');return;}
  // ── تحذير تجاوز العهدة ──
  try{
    const [freshInstalls,freshEntries]=await Promise.all([
      sb('advance_installments?advance_id=eq.'+curAdv.id+'&select=amount'),
      sb('entries?advance_id=eq.'+curAdv.id+'&select=amount')
    ]);
    const _totalGiven=(freshInstalls||[]).reduce((s,i)=>s+i.amount,0);
    const _spent=(freshEntries||[]).reduce((s,e)=>s+e.amount,0);
    const _remAfter=_totalGiven-_spent-amt;
    if(_remAfter<0){
      const over=fn(Math.abs(_remAfter));
      const ok=await new Promise(res=>showConfirm({icon:'⚠️',title:'تجاوز العهدة',msg:'المصروف هيتجاوز العهدة بـ '+over+' ج. العجز بعد الصرف: '+over+' ج. هل تريد الإكمال؟',okLabel:'إكمال',okType:'warning',onOk:()=>res(true)}));
      if(!ok)return;
    }
  }catch(e2){console.warn('overspend check:',e2);} // صامت متعمد
  const advMaxSeq=allEntries.reduce((mx,e)=>Math.max(mx,e.seq||20260000),20260000);
  const advNextSeq=advMaxSeq<20260000?20260001:advMaxSeq+1;
  const entry={id:uid_(),project_id:pid,type:'e',amount:amt,description:desc,entry_date:dt,category:cat,contractor:mq,advance_id:curAdv.id,seq:advNextSeq,created_by:uid};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      if((window._advInvFiles||[]).length) await advInvUpload(entry.id);
      setSav('✅ تم الحفظ','ok');
      markNewAdvEntry(curAdv.id, amt, cat, desc);
      _showAdvConfirm('✅ تم إضافة القيد بنجاح', '#1D9E75');
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      if((window._advInvFiles||[]).length) await advInvUploadPending(entry.id);
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
      _showAdvConfirm('⏳ تم الإرسال للأدمن — في انتظار الموافقة', '#C9A84C');
    }
    document.getElementById('advCat').value='';
    document.getElementById('advDesc').value='';
    document.getElementById('advEntAmt').value='';
    document.getElementById('advMq').value='';
    advInvRemove();
    // امسح المشروع مع باقي الحقول
    _lastAdvProjId='';
    _lastAdvProjName='';
    document.getElementById('advProjSel').value='';
    document.getElementById('advProjInput').value='';
    // الفورم يفضل مفتوح — بس امسح الحقول
    await loadAdvDetail();
    if(curPid===pid)await loadEntries();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

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

// ══ ADV INVOICE ══════════════════════════════════
function advInvTrigger(){
  // allow multiple
  document.getElementById('advInvFile').click();
}
function advInvSelect(input){
  const files=Array.from(input.files);if(!files.length)return;
  const tooBig=files.filter(f=>f.size>20*1024*1024);
  if(tooBig.length){notify('ملف أكبر من 20MB: '+tooBig[0].name,'err');return;}
  window._advInvFiles=(window._advInvFiles||[]).concat(files);
  _advInvRenderList();
  input.value='';
}
function _advInvRenderList(){
  const files=window._advInvFiles||[];
  const empty=document.getElementById('advInvEmpty');
  const filled=document.getElementById('advInvFilled');
  const area=document.getElementById('advInvArea');
  const list=document.getElementById('advInvList');
  if(!files.length){
    if(empty)empty.style.display='flex';
    if(filled)filled.style.display='none';
    if(area){area.style.borderColor='#ccc';area.style.borderStyle='dashed';}
    return;
  }
  if(empty)empty.style.display='none';
  if(filled)filled.style.display='flex';
  if(area){area.style.borderColor='#81c784';area.style.borderStyle='solid';}
  if(!list)return;
  list.innerHTML='';
  files.forEach((file,idx)=>{
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    const name=file.name.length>28?file.name.substring(0,26)+'…':file.name;
    const size=file.size<1024*1024?(file.size/1024).toFixed(0)+' KB':(file.size/1024/1024).toFixed(1)+' MB';
    const item=document.createElement('div');
    item.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 8px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:8px;margin-bottom:4px';
    item.innerHTML=`<div class="adv-inv-th-${idx}" style="width:36px;height:36px;background:#e8f5e9;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${isPdf?'📄':'🖼'}</div>
      <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;color:#1D6A3E;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</div><div style="font-size:10px;color:#888">${size}</div></div>
      <button onclick="advInvRemoveOne(${idx})" style="background:none;border:none;color:#E74C3C;cursor:pointer;font-size:14px;padding:2px 4px;flex-shrink:0">✕</button>`;
    if(!isPdf){
      const reader=new FileReader();
      reader.onload=ev=>{const th=item.querySelector('.adv-inv-th-'+idx);if(th)th.innerHTML='<img src="'+ev.target.result+'" style="width:36px;height:36px;object-fit:cover;border-radius:5px">';};
      reader.readAsDataURL(file);
    }
    list.appendChild(item);
  });
  const addBtn=document.createElement('label');
  addBtn.htmlFor='advInvFile';
  addBtn.style.cssText='display:flex;align-items:center;gap:5px;padding:5px 10px;border:1.5px dashed #81c784;border-radius:8px;cursor:pointer;font-size:11px;color:#1D6A3E;margin-top:4px;width:fit-content';
  addBtn.innerHTML='➕ إضافة صورة أخرى';
  list.appendChild(addBtn);
}
function advInvRemoveOne(idx){window._advInvFiles=(window._advInvFiles||[]).filter((_,i)=>i!==idx);_advInvRenderList();}
function advInvRemove(){
  window._advInvFiles=[];
  _advInvRenderList();
  const inp=document.getElementById('advInvFile');
  if(inp)inp.value='';
}
async function _advInvUploadFile(entryId, table){
  const files=window._advInvFiles||[];
  if(!files.length||!entryId)return;
  const urls=[];
  for(const file of files){
  try{
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    let uploadFile=file;
    if(!isPdf){
      uploadFile=await new Promise(res=>{
        const reader=new FileReader();
        reader.onload=e=>{
          const img=new Image();
          img.onload=()=>{
            const MAX=1400;let w=img.width,h=img.height;
            if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
            const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            canvas.toBlob(blob=>res(blob),'image/jpeg',0.80);
          };img.src=e.target.result;
        };reader.readAsDataURL(file);
      });
    }
    const ext=isPdf?'pdf':'jpg';
    const path=`${entryId}/invoice_${Date.now()}.${ext}`;
    const AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
    const r=await fetch(`${SB_URL}/storage/v1/object/invoices/${path}`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+(token||AK),'apikey':AK,'Content-Type':isPdf?'application/pdf':'image/jpeg','x-upsert':'true'},
      body:uploadFile
    });
    if(r.ok){
      const pub=`${SB_URL}/storage/v1/object/public/invoices/${path}`;
      urls.push(pub);
    }
  }catch(e){console.warn('advInvUpload:',e);}
  }// end for
  if(urls.length){
    const imgVal=urls.length===1?urls[0]:JSON.stringify(urls);
    await sb(`${table}?id=eq.`+entryId,'PATCH',{img_url:imgVal});
  }
  window._advInvFiles=[];
  advInvRemove();
}
async function advInvUpload(id){await _advInvUploadFile(id,'entries');}
async function advInvUploadPending(id){await _advInvUploadFile(id,'pending_entries');}
