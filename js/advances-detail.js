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
  document.getElementById('advScreen').style.display='none';
  document.getElementById('advDetail').style.display='block';
  document.getElementById('advDetName').textContent='👤 '+curAdv.person_name;
  document.getElementById('advDetNotes').textContent=curAdv.notes||'';
  // صورة العهدة
  const advImgEl=document.getElementById('advDetImg');
  if(advImgEl){advImgEl.innerHTML=curAdv.image_url?thumbHtml(curAdv.image_url,'adv_'+curAdv.id):'';
  advImgEl.style.marginTop=curAdv.image_url?'6px':'0';}
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
      const approvedHtml=(()=>{
        if(!advEntries.length) return '';
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
            return `<tr style="background:${rowBg};border-bottom:0.5px solid ${rowBrd}" onmouseover="this.style.background='${rowHov}'" onmouseout="this.style.background='${rowBg}'">
              <td style="padding:7px 10px;color:var(--text-soft,#aaa);font-size:11px">${i+1}</td>
              <td style="padding:7px 10px">${e2.seq?`<span class="nb">#${e2.seq}</span>`:'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#888);font-size:11px;white-space:nowrap">${cleanDate(e2.entry_date)||'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#555);font-size:11px">${pName}</td>
              <td style="padding:7px 10px"><span style="font-size:10px;background:var(--bg-ivory,#f0f0ec);border:0.5px solid var(--border,#ddd);padding:2px 7px;border-radius:10px;color:var(--text-soft,#666)">${e2.category||'—'}</span></td>
              <td style="padding:7px 10px;color:var(--text-body,#333)">${e2.description||'—'}</td>
              <td style="padding:7px 10px;color:var(--text-soft,#888);font-size:11px">${e2.contractor||'—'}</td>
              <td style="padding:7px 10px;font-weight:500;color:var(--danger,#C0392B);white-space:nowrap">▼ ${fn(e2.amount)} ج</td>
              <td style="padding:4px 6px;white-space:nowrap">${thumbHtml(e2.image_url,e2.id)}</td>
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
      ${imgUploadBox('advEntImg','advEntImgPrev')}
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
  // رفع الصورة لو موجودة
  const imgFile=document.getElementById('advEntImg')?.files?.[0];
  let imgUrl=null;
  if(imgFile){setSav('⬆️ جاري رفع الصورة...','ng');imgUrl=await uploadImage(imgFile,'entries');if(!imgUrl)return;}
  const entry={id:uid_(),project_id:pid,type:'e',amount:amt,description:desc,entry_date:dt,category:cat,contractor:mq,advance_id:curAdv.id,seq:advNextSeq,created_by:uid,image_url:imgUrl||null};
  setSav('💾 جاري الحفظ...','ng');
  try{
    if(uRole==='admin'){
      await sb('entries','POST',entry);
      setSav('✅ تم الحفظ','ok');
      markNewAdvEntry(curAdv.id, amt, cat, desc);
      _showAdvConfirm('✅ تم إضافة القيد بنجاح', '#1D9E75');
    }else{
      const pending={...entry,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
      await sb('pending_entries','POST',pending);
      setSav('⏳ تم الإرسال — في انتظار موافقة الأدمن','ng');
      _showAdvConfirm('⏳ تم الإرسال للأدمن — في انتظار الموافقة', '#C9A84C');
    }
    document.getElementById('advCat').value='';
    document.getElementById('advDesc').value='';
    document.getElementById('advEntAmt').value='';
    document.getElementById('advMq').value='';
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