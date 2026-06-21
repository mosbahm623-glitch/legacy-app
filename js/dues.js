// ██ DUES — المستحقات ══════════════════════════════

async function loadDuesTab(el){
  el.innerHTML='<div class="emp">⏳ جاري التحميل...</div>';
  try{
    const data=await sb('contractor_dues?project_id=eq.'+curPid+'&order=created_at.desc');
    _duesList=data||[];
    renderDuesTab(el);
  }catch(e){el.innerHTML='<div class="emp">❌ خطأ في تحميل البيانات</div>';}
}

function renderDuesTab(el){
  const isSuper=uRole==='super_admin'||uRole==='admin';
  const canEdit=isSuper||uRole==='editor';
  const canAdd=canEdit||uRole==='owner'||uRole==='viewer';
  const total=_duesList.reduce((s,d)=>s+d.amount,0);
  const unpaid=_duesList.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_duesList.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  let html=`
    <div class="kp" style="margin-bottom:12px">
      <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
      <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>
    </div>`;

  if(canEdit){
    html+=`<div style="display:flex;justify-content:flex-end;margin-bottom:10px">
      <button onclick="showAddDueForm()" class="gsm">+ إضافة مستحق</button>
    </div>`;
  }

  if(!_duesList.length){
    html+='<div class="emp">لا توجد مستحقات</div>';
  } else {
    html+=`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table;table-layout:fixed">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">المقاول</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البيان</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">التاريخ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">المبلغ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">الحالة</th>
        ${canEdit?'<th style="color:#D4C49A;padding:8px 10px"></th>':''}
      </tr></thead>
      <tbody>
      ${_duesList.map((d,i)=>{
        const isPaid=d.status==='paid';
        const rowBg=i%2===0?'#fff':'#f7f7f5';
        return `<tr style="background:${rowBg};border-bottom:0.5px solid #e8e8e4;opacity:${isPaid?0.7:1}" onmouseover="this.style.background='#eef4ee'" onmouseout="this.style.background='${rowBg}'">
          <td style="padding:7px 10px;color:#999;font-size:11px">${i+1}</td>
          <td style="padding:7px 10px;font-weight:500;color:#222">${d.contractor||'—'}</td>
          <td style="padding:7px 10px;color:#555">${d.description||'—'}</td>
          <td style="padding:7px 10px;color:#888;font-size:11px;white-space:nowrap">${d.due_date||'—'}</td>
          <td style="padding:7px 10px;font-weight:500;color:${isPaid?'#27AE60':'#E74C3C'};white-space:nowrap">${isPaid?'✅':' ▼'} ${fn(d.amount)} ج</td>
          <td style="padding:7px 10px"><span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${isPaid?'#e8f8f0':'#fef0f0'};color:${isPaid?'#27AE60':'#E74C3C'}">${isPaid?'مدفوع':'غير مدفوع'}</span></td>
          ${canEdit?`<td style="padding:4px 8px;white-space:nowrap">
            <button onclick="toggleDue('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'#E74C3C':'#27AE60'};background:transparent;color:${isPaid?'#E74C3C':'#27AE60'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
            <button onclick="editDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #aaa;background:transparent;color:#555;cursor:pointer">✏️</button>
            <button onclick="deleteDue('${d.id}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid #ccc;background:transparent;color:#999;cursor:pointer">🗑</button>
          </td>`:''}
        </tr>`;
      }).join('')}
      </tbody>
    </table>`;
  }
  el.innerHTML=html;
  // تفعيل date picker على حقل التاريخ
  const dtEl=document.getElementById('dueDate');
  if(dtEl)initDateInput(dtEl);
}

function showAddDueForm(){
  const ex=document.getElementById('_addDueModal');if(ex)ex.remove();
  const ov=document.createElement('div');
  ov.id='_addDueModal';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML=`<div class="modal-box" style="max-width:360px;width:100%">
    <div style="text-align:center;margin-bottom:14px"><div style="font-size:26px">💰</div><div class="title-md">إضافة مستحق</div></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input id="dueContr" placeholder="اسم المقاول" class="inp-lg">
      <input id="dueAmt" type="number" placeholder="المبلغ (ج)" step="any" class="inp-lg">
      <input id="dueDesc" placeholder="البيان" class="inp-lg">
      <input id="dueDate" placeholder="📅 التاريخ dd/mm/yyyy" class="inp-lg" maxlength="10" autocomplete="off">
    </div>
    <div class="modal-btns" style="margin-top:14px">
      <button onclick="addDue()" class="btn-primary">+ إضافة</button>
      <button onclick="document.getElementById('_addDueModal').remove()" class="btn-cancel">إلغاء</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{if(e.target===ov)ov.remove();});
  setTimeout(()=>{const el=document.getElementById('dueDate');if(el)initDateInput(el);},100);
  setTimeout(()=>document.getElementById('dueContr')?.focus(),150);
}

async function addDue(){
  const contractor=document.getElementById('dueContr')?.value?.trim();
  const amount=parseFloat(document.getElementById('dueAmt')?.value);
  const description=document.getElementById('dueDesc')?.value?.trim();
  const due_date=document.getElementById('dueDate')?.value?.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    const res=await sb('contractor_dues','POST',{
      project_id:curPid,
      contractor,
      amount,
      description:description||null,
      due_date:due_date||null,
      status:'unpaid',
      created_by:uid
    });
    _duesList.unshift(res[0]);
    notify('✅ تم الإضافة','ok');
    document.getElementById('_addDueModal')?.remove();
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleDue(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _duesList=_duesList.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════

async function duesExportPDF(){
  notify('⏳ جاري التحضير...','ok');
  let dues=[];
  try{
    const res=await sb('contractor_dues?order=created_at.desc&limit=1000');
    dues=res||[];
    notify('✅ جاب '+dues.length+' مستحق','ok');
  }catch(e){notify('❌ خطأ: '+e.message,'er');return;}
  if(!dues.length){notify('لا توجد مستحقات في الجدول','warn');return;}
  _allDues=dues;
  const unpaid=_allDues.filter(d=>d.status==='unpaid');
  const paid=_allDues.filter(d=>d.status==='paid');
  const totalUnpaid=unpaid.reduce((s,d)=>s+d.amount,0);
  const totalPaid=paid.reduce((s,d)=>s+d.amount,0);
  const total=totalUnpaid+totalPaid;
  const html=_pdfOpen('مستحقات المقاولين')+
    _pdfHeader('💰 مستحقات المقاولين','Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المستحقات</div><div class="kpi-val">▼ ${fn(total)} ج</div></div>
      <div class="kpi kpi-net-neg"><div class="kpi-lbl">غير مدفوع</div><div class="kpi-val">▼ ${fn(totalUnpaid)} ج</div></div>
      <div class="kpi kpi-net-pos"><div class="kpi-lbl">مدفوع</div><div class="kpi-val">✅ ${fn(totalPaid)} ج</div></div>
    </div>
    <div class="sec-ttl">📋 تفاصيل المستحقات</div>
    <table>
      <thead><tr><th>#</th><th>المقاول</th><th>المشروع</th><th>البيان</th><th>التاريخ</th><th>الحالة</th><th>المبلغ</th></tr></thead>
      <tbody>${_allDues.map((d,i)=>{
        const proj=allProjectsMap[d.project_id];
        const isPaid=d.status==='paid';
        return`<tr><td class="rep-table-num">${i+1}</td><td>${d.contractor}</td><td>${proj?.name||'—'}</td><td>${d.description||'—'}</td><td>${d.due_date||'—'}</td><td style="color:${isPaid?'#1D6A3E':'#C86060'};font-weight:700">${isPaid?'✅ مدفوع':'⏳ غير مدفوع'}</td><td class="amt ${isPaid?'pos':'neg'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</td></tr>`;
      }).join('')}</tbody>
      <tfoot><tr><td colspan="6">إجمالي المستحقات</td><td class="amt neg">▼ ${fn(total)} ج</td></tr></tfoot>
    </table>`+
    _pdfFooter()+_pdfClose();
  openPrintWindow(html);
}

async function duesExportExcel(){try{
  if(!_allDues||!_allDues.length){
    _allDues=await sb('contractor_dues?order=created_at.desc');
    if(!_allDues||!_allDues.length){notify('لا توجد بيانات','warn');return;}
  }
  // ExcelJS loaded in index.html
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);
  const total=unpaid+paid;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const ws=wb.addWorksheet('مستحقات المقاولين',{views:[{rightToLeft:true}]});
  const COLS=7;ws.columns=[{width:8},{width:22},{width:20},{width:25},{width:16},{width:16},{width:18}];
  _xlHeader(ws,'💰 مستحقات المقاولين','إجمالي: '+fn(total)+' ج  |  غير مدفوع: '+fn(unpaid)+' ج  |  مدفوع: '+fn(paid)+' ج',COLS);
  _xlHdrRow(ws,['#','المقاول','المشروع','البيان','التاريخ','الحالة','المبلغ (ج)'],COLS);
  _allDues.forEach((d,i)=>{
    const proj=allProjectsMap[d.project_id];
    const isPaid=d.status==='paid';
    _xlDataRow(ws,[i+1,d.contractor,proj?.name||'—',d.description||'—',d.due_date||'—',isPaid?'✅ مدفوع':'⏳ غير مدفوع',d.amount],i,[null,null,null,null,null,null,isPaid?_XC.PS:_XC.RD]);
  });
  _xlTotRow(ws,['','','','','','إجمالي',total],COLS);
  _xlFooter(ws,COLS);
  const buf=await wb.xlsx.writeBuffer();
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download='مستحقات_المقاولين_'+new Date().toLocaleDateString('en-CA')+'.xlsx';a.click();
}catch(_e){notify('⚠️ خطأ في تصدير Excel','er');}}

async function loadDuesScreen(){
  const sel=document.getElementById('duesProjectFilter');
  if(sel&&allProjects.length){
    sel.innerHTML='<option value="all">كل المشاريع</option>';
    allProjects.forEach(p=>{
      sel.innerHTML+=`<option value="${p.id}">${esc(p.name)}</option>`;
    });
  }
  // إخفاء النتائج والأزرار في البداية
  _allDues=[];
  document.getElementById('duesScreenList').innerHTML='';
  document.getElementById('duesScreenKpi').innerHTML='';
  const filtersEl=document.getElementById('duesScreenFilters');
  if(filtersEl)filtersEl.style.display='none';
  document.getElementById('duesScreenSub').textContent='اختار مشروع واضغط بحث';
}

async function searchDues(){
  const projId=document.getElementById('duesProjectFilter')?.value;
  document.getElementById('duesScreenList').innerHTML='<div class="emp">⏳ جاري البحث...</div>';
  notify('⏳ جاري البحث...','ok');
  try{
    let query='contractor_dues?order=created_at.desc&limit=1000';
    if(projId&&projId!=='all') query+=`&project_id=eq.${projId}`;
    _allDues=await sb(query);
    _duesFilter='all';
    // إظهار أزرار الفلتر
    const filtersEl=document.getElementById('duesScreenFilters');
    if(filtersEl)filtersEl.style.display='flex';
    renderDuesScreen();
  }catch(e){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">❌ خطأ في البحث</div>';
  }
}

function filterDuesScreen(f){
  _duesFilter=f;
  ['all','unpaid','paid'].forEach(x=>{
    const btn=document.getElementById('duesFilter'+x.charAt(0).toUpperCase()+x.slice(1));
    if(btn){btn.style.background=x===f?'var(--primary)':'';btn.style.color=x===f?'#fff':'';}
  });
  renderDuesScreen();
}

function renderDuesScreen(){
  const filtered=_duesFilter==='all'?_allDues:_allDues.filter(d=>d.status===_duesFilter);
  const total=_allDues.reduce((s,d)=>s+d.amount,0);
  const unpaid=_allDues.filter(d=>d.status==='unpaid').reduce((s,d)=>s+d.amount,0);
  const paid=_allDues.filter(d=>d.status==='paid').reduce((s,d)=>s+d.amount,0);

  document.getElementById('duesScreenSub').textContent=`${_allDues.length} مستحق`;
  document.getElementById('duesScreenKpi').innerHTML=`
    <div class="kc"><div class="kl">إجمالي المستحقات</div><div class="kv">${fn(total)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--danger)">غير مدفوع</div><div class="kv" style="color:var(--danger)">▼ ${fn(unpaid)} ج</div></div>
    <div class="kc"><div class="kl" style="color:var(--success)">مدفوع</div><div class="kv" style="color:var(--success)">✅ ${fn(paid)} ج</div></div>`;

  if(!filtered.length){
    document.getElementById('duesScreenList').innerHTML='<div class="emp">لا توجد مستحقات</div>';
    return;
  }

  const html=filtered.map(d=>{
    const isPaid=d.status==='paid';
    const proj=allProjectsMap[d.project_id];
    return `<div class="rw">
      <div class="ri">
        <div class="rd" style="font-weight:700">${d.contractor}</div>
        <div class="rm" style="color:#888;font-size:11px">${proj?.name||'—'} · ${d.description||'—'} ${d.due_date?'· '+d.due_date:''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="ra" style="color:${isPaid?'var(--success)':'var(--danger)'}">${isPaid?'✅':'▼'} ${fn(d.amount)} ج</div>
        <button onclick="toggleDueFromScreen('${d.id}','${isPaid?'unpaid':'paid'}')" style="font-size:10px;padding:3px 8px;border-radius:6px;border:1px solid ${isPaid?'var(--danger)':'var(--success)'};background:transparent;color:${isPaid?'var(--danger)':'var(--success)'};cursor:pointer">${isPaid?'إلغاء':'✅ دفع'}</button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('duesScreenList').innerHTML=html;
}

async function toggleDueFromScreen(id,newStatus){
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{status:newStatus});
    _allDues=_allDues.map(d=>d.id===id?{...d,status:newStatus}:d);
    renderDuesScreen();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteDue(id){await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المستحق',msg:'هيتحذف المستحق نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));
  try{
    await sb('contractor_dues?id=eq.'+id,'DELETE');
    _duesList=_duesList.filter(d=>d.id!==id);
    renderDuesTab(document.getElementById('ent'));
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

let _editDueId=null;

function editDue(id){
  const d=_duesList.find(x=>x.id===id);
  if(!d)return;
  _editDueId=id;
  document.getElementById('dueEpContr').value=d.contractor||'';
  document.getElementById('dueEpAmt').value=d.amount||'';
  document.getElementById('dueEpDesc').value=d.description||'';
  document.getElementById('dueEpDate').value=d.due_date||'';
  const dtEl=document.getElementById('dueEpDate');
  if(dtEl)initDateInput(dtEl);
  document.getElementById('dueEp').style.display='block';
}

async function saveDueEdit(){
  if(!_editDueId)return;
  const contractor=document.getElementById('dueEpContr').value.trim();
  const amount=parseFloat(document.getElementById('dueEpAmt').value);
  const description=document.getElementById('dueEpDesc').value.trim();
  const due_date=document.getElementById('dueEpDate').value.trim();
  if(!contractor){notify('اكتب اسم المقاول','warn');return;}
  if(!amount||isNaN(amount)){notify('اكتب المبلغ','warn');return;}
  try{
    await sb('contractor_dues?id=eq.'+_editDueId,'PATCH',{contractor,amount,description:description||null,due_date:due_date||null});
    _duesList=_duesList.map(x=>x.id===_editDueId?{...x,contractor,amount,description:description||null,due_date:due_date||null}:x);
    document.getElementById('dueEp').style.display='none';
    _editDueId=null;
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function editDueDate(id,currentDate){
  const newDate=prompt('التاريخ الجديد (dd/mm/yyyy):',currentDate||'');
  if(newDate===null)return;
  try{
    await sb('contractor_dues?id=eq.'+id,'PATCH',{due_date:newDate.trim()||null});
    _duesList=_duesList.map(d=>d.id===id?{...d,due_date:newDate.trim()||null}:d);
    renderDuesTab(document.getElementById('ent'));
    notify('✅ تم التعديل','ok');
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

