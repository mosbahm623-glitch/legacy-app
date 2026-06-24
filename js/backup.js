async function backupAll(){
// ██ BACKUP SYSTEM ══════════════════════════════════
  const btn=document.getElementById('sbi-backup');
  if(btn)btn.disabled=true;
  setSav('⏳ جاري تحميل المكتبة...','ng');
  try{
    // تحميل ExcelJS لو مش محملة
    // ExcelJS loaded in index.html
    setSav('⏳ جاري جلب البيانات...','ng');
    // جيب كل البيانات
    const [prjs,ents,advs,insts,profs,dues,pending,notes,advEnts]=await Promise.all([
      sb('projects?order=created_at'),
      sbAll('entries?order=created_at'),
      sb('advances?order=created_at'),
      sb('advance_installments?order=created_at'),
      sb('profiles?order=created_at'),
      sb('contractor_dues?order=created_at'),
      sb('pending_entries?order=submitted_at'),
      sb('notes?order=created_at'),
    ]);
    setSav('⏳ جاري بناء الملف...','ng');
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    wb.creator='Legacy Fine Touch';
    wb.created=new Date();
    const G='var(--primary)',B='var(--accent)';
    function hdr(ws,cols){
      ws.addRow(cols.map(c=>c.h));
      const r=ws.lastRow;
      r.eachCell(cell=>{
        cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+G.slice(1)}};
        cell.font={bold:true,color:{argb:'FF'+B.slice(1)},size:11};
        cell.alignment={horizontal:'center',vertical:'middle'};
        cell.border={bottom:{style:'thin',color:{argb:'FFCCCCCC'}}};
      });
      ws.columns=cols.map(c=>({key:c.k,width:c.w||18}));
    }
    function styleRows(ws,count){
      for(let i=2;i<=count+1;i++){
        const r=ws.getRow(i);
        r.eachCell(cell=>{
          cell.alignment={horizontal:'right',vertical:'middle',wrapText:true};
          cell.border={bottom:{style:'hair',color:{argb:'FFEEEEEE'}}};
        });
        if(i%2===0)r.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF9F6F0'}};});
      }
    }
    // شيت المشاريع
    const wsP=wb.addWorksheet('المشاريع',{views:[{rightToLeft:true}]});
    hdr(wsP,[{h:'الاسم',k:'name',w:25},{h:'تاريخ البداية',k:'sd',w:18},{h:'تاريخ الإغلاق',k:'cd',w:18},{h:'مؤرشف',k:'arc',w:12},{h:'ID',k:'id',w:38}]);
    prjs.forEach(p=>wsP.addRow({name:p.name,sd:p.start_date||'',cd:p.close_date||'',arc:p.archived?'مؤرشف':'نشط',id:p.id}));
    styleRows(wsP,prjs.length);
    // شيت القيود
    const wsE=wb.addWorksheet('القيود',{views:[{rightToLeft:true}]});
    hdr(wsE,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'المقاول',k:'mq',w:20},{h:'رقم',k:'seq',w:8}]);
    const projMap={};prjs.forEach(p=>projMap[p.id]=p.name);
    ents.forEach(e=>wsE.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',mq:e.contractor||'',seq:e.seq||''}));
    styleRows(wsE,ents.length);
    // لون الوارد والمصروف
    for(let i=2;i<=ents.length+1;i++){
      const cell=wsE.getRow(i).getCell(2);
      const isInc=cell.value==='وارد';
      cell.font={bold:true,color:{argb:isInc?'FF1E6B3A':'FF922B21'}};
      wsE.getRow(i).getCell(3).font={bold:true,color:{argb:isInc?'FF1E6B3A':'FF922B21'}};
    }
    // شيت العهد — مع المصروف والمتبقي
    const wsA=wb.addWorksheet('العهد',{views:[{rightToLeft:true}]});
    hdr(wsA,[{h:'الاسم',k:'name',w:22},{h:'الحالة',k:'status',w:12},{h:'إجمالي الدفعات',k:'total',w:18},{h:'إجمالي المصروف',k:'spent',w:18},{h:'المتبقي',k:'rem',w:15},{h:'ملاحظات',k:'notes',w:30}]);
    // احسب المصروف لكل عهدة
    const advSpentMap={};
    ents.filter(e=>e.advance_id).forEach(e=>{if(!advSpentMap[e.advance_id])advSpentMap[e.advance_id]=0;advSpentMap[e.advance_id]+=e.amount;});
    advs.forEach(a=>{
      const total=insts.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=advSpentMap[a.id]||0;
      const rem=total-spent;
      const row=wsA.addRow({name:a.person_name||'',status:a.status==='open'?'مفتوحة':'مغلقة',total,spent,rem,notes:a.notes||''});
      row.getCell(5).font={bold:true,color:{argb:rem>=0?'FF1E6B3A':'FF922B21'}};
    });
    styleRows(wsA,advs.length);
    // شيت دفعات العهد
    const wsI=wb.addWorksheet('دفعات العهد',{views:[{rightToLeft:true}]});
    hdr(wsI,[{h:'صاحب العهدة',k:'name',w:22},{h:'المبلغ',k:'amt',w:15},{h:'التاريخ',k:'dt',w:15},{h:'ملاحظة',k:'note',w:25}]);
    const advMap={};advs.forEach(a=>advMap[a.id]=a.person_name||'');
    insts.forEach(i=>wsI.addRow({name:advMap[i.advance_id]||'',amt:i.amount,dt:i.inst_date||'',note:i.note||''}));
    styleRows(wsI,insts.length);
    // شيت المستخدمين
    const wsU=wb.addWorksheet('المستخدمين',{views:[{rightToLeft:true}]});
    hdr(wsU,[{h:'الاسم',k:'name',w:22},{h:'الدور',k:'role',w:15},{h:'ID',k:'id',w:38}]);
    profs.forEach(u=>wsU.addRow({name:u.name||'',role:u.role||'',id:u.id}));
    styleRows(wsU,profs.length);
    // شيت المستحقات
    if(dues&&dues.length){
      const wsD=wb.addWorksheet('المستحقات',{views:[{rightToLeft:true}]});
      hdr(wsD,[{h:'المقاول',k:'name',w:22},{h:'المشروع',k:'proj',w:20},{h:'المبلغ',k:'amt',w:15},{h:'الحالة',k:'status',w:12},{h:'التاريخ',k:'dt',w:15},{h:'ملاحظة',k:'note',w:25}]);
      dues.forEach(d=>wsD.addRow({name:d.contractor_name||'',proj:projMap[d.project_id]||'',amt:d.amount,status:d.status==='paid'?'مدفوع':'غير مدفوع',dt:d.due_date||'',note:d.note||''}));
      styleRows(wsD,dues.length);
    }
    // شيت القيود المعلقة
    if(pending&&pending.length){
      const wsPN=wb.addWorksheet('قيود معلقة',{views:[{rightToLeft:true}]});
      hdr(wsPN,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'الحالة',k:'status',w:15}]);
      pending.forEach(e=>wsPN.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',status:'في الانتظار'}));
      styleRows(wsPN,pending.length);
    }
    // شيت الملاحظات
    if(notes&&notes.length){
      const wsN=wb.addWorksheet('الملاحظات',{views:[{rightToLeft:true}]});
      hdr(wsN,[{h:'العنوان',k:'title',w:25},{h:'المحتوى',k:'body',w:40},{h:'التاريخ',k:'dt',w:15}]);
      notes.forEach(n=>wsN.addRow({title:n.title||'',body:n.body||n.content||'',dt:n.created_at?n.created_at.substring(0,10):''}));
      styleRows(wsN,notes.length);
    }
    // تحميل الملف
    const buf=await wb.xlsx.writeBuffer();
    const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const now=new Date();
    const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    a.href=url;a.download='LFT_Backup_'+dateStr+'.xlsx';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    localStorage.setItem('lft_last_backup', new Date().toISOString());
    updateBackupDateDisplay();
    setSav('✅ تم تحميل النسخة الاحتياطية — '+prjs.length+' مشروع · '+ents.length+' قيد · '+advs.length+' عهدة · '+dues.length+' مستحقة','ok');
  }catch(e){
    setSav('❌ '+friendlyError(e),'er');
  }
  btn.disabled=false;
}

// EXPORT ALL PROJECTS
async function exportAllProjects(){
  const btn=document.getElementById('sbi-save-proj');
  if(btn){btn.disabled=true;}
  setSav('⏳ جاري التحضير...','ng');
  try{
    if(!xOK){
      await new Promise((res,rej)=>{
        const s=document.createElement('script');
        s.src='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
        s.onload=()=>{xOK=true;res();};s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    const savedPid=curPid;
    const total=allProjects.length;
    for(let i=0;i<total;i++){
      const p=allProjects[i];
      setSav('⏳ جاري تصدير ('+(i+1)+'/'+total+'): '+p.name,'ng');
      curPid=p.id;
      entries=allEntries.filter(e=>e.project_id===curPid);
      await xl();
      await new Promise(r=>setTimeout(r,800));
    }
    curPid=savedPid;
    entries=allEntries.filter(e=>e.project_id===curPid);
    setSav('✅ تم تصدير '+total+' مشروع بنجاح','ok');
  }catch(e){
    setSav('❌ '+friendlyError(e),'er');
  }
  if(btn){btn.disabled=false;}
}

// DASHBOARD
// ██ MQ MANAGER — مدير المقاولين ══════════════════
function openMqManager(){
  document.getElementById('repHub').style.display='none';
  document.getElementById('repView').style.display='none';
  document.getElementById('mqManagerScreen').style.display='block';
  renderMqManager('');
}
function closeMqManager(){
  document.getElementById('mqManagerScreen').style.display='none';
  document.getElementById('repHub').style.display='block';
}
