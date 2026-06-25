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
    const [prjs,ents,advs,insts,profs,dues,pending,notes,summaries]=await Promise.all([
      sb('projects?order=created_at'),
      sbAll('entries?order=created_at'),
      sb('advances?order=created_at'),
      sb('advance_installments?order=created_at'),
      sb('profiles?order=created_at'),
      sb('contractor_dues?order=created_at'),
      sb('pending_entries?order=submitted_at'),
      sb('notes?order=created_at'),
      sb('project_summaries'),
    ]);
    setSav('⏳ جاري بناء الملف...','ng');
    const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];
    wb.creator='Legacy Core';wb.created=new Date();
    const CLR={dark:'FF1D3C2A',green:'FF1D9E75',red:'FF922B21',gold:'FFD4A017',white:'FFFFFFFF',gray:'FFF5F5F0',light:'FFE8F5EE',blue:'FF1A5276',border:'FFC8DDD1'};
    function fill(argb){return {type:'pattern',pattern:'solid',fgColor:{argb}};}
    function brd(){return {top:{style:'thin',color:{argb:CLR.border}},bottom:{style:'thin',color:{argb:CLR.border}},left:{style:'thin',color:{argb:CLR.border}},right:{style:'thin',color:{argb:CLR.border}}};}
    function hdr(ws,cols,bg){
      bg=bg||CLR.green;
      ws.addRow(cols.map(c=>c.h));
      const r=ws.lastRow;r.height=26;
      r.eachCell(cell=>{
        cell.fill=fill(bg);
        cell.font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};
        cell.alignment={horizontal:'center',vertical:'middle'};
        cell.border=brd();
      });
      ws.columns=cols.map(c=>({key:c.k,width:c.w||18}));
    }
    function styleRows(ws,count){
      for(let i=2;i<=count+1;i++){
        const r=ws.getRow(i);r.height=20;
        r.eachCell(cell=>{
          cell.fill=fill(i%2===0?CLR.gray:CLR.white);
          cell.alignment={horizontal:'right',vertical:'middle',wrapText:false};
          cell.border=brd();
          cell.font={size:10,name:'Arial'};
        });
      }
    }
    function mergeTitle(ws,text,cols,bg){
      bg=bg||CLR.dark;
      ws.mergeCells(1,1,1,cols);
      const c=ws.getCell(1,1);
      c.value=text;c.fill=fill(bg);
      c.font={bold:true,color:{argb:CLR.white},size:13,name:'Arial'};
      c.alignment={horizontal:'center',vertical:'middle'};
      c.border=brd();
      ws.getRow(1).height=36;
    }
    // ═══ ملخص عام ═══
    const projMap={};prjs.forEach(p=>projMap[p.id]=p.name);
    const wsSUM=wb.addWorksheet('ملخص عام',{views:[{rightToLeft:true}]});
    mergeTitle(wsSUM,'⚡  Legacy Core — ملخص المشاريع المالي',7,CLR.dark);
    hdr(wsSUM,[{h:'المشروع',k:'name',w:22},{h:'تاريخ البداية',k:'sd',w:16},{h:'الحالة',k:'status',w:14},{h:'إجمالي الوارد',k:'inc',w:18},{h:'إجمالي المصروف',k:'exp',w:18},{h:'صافي الربح',k:'net',w:16},{h:'ملاحظة',k:'note',w:14}],CLR.green);
    const sumMap={};if(summaries)summaries.forEach(s=>{sumMap[s.project_id]={inc:parseFloat(s.inc)||0,exp:parseFloat(s.exp)||0};});
    let sumInc=0,sumExp=0;
    prjs.forEach(p=>{
      const v=sumMap[p.id]||{inc:0,exp:0};
      const net=v.inc-v.exp;
      const isArc=p.archived;
      const status=isArc?'🗂 مؤرشف':net<0?'🔴 عجز':'🟢 نشط';
      const row=wsSUM.addRow({name:p.name,sd:p.start_date||'—',status,inc:v.inc,exp:v.exp,net,note:''});
      row.height=22;
      const statusCell=row.getCell(3);
      statusCell.fill=fill(isArc?'FF546E7A':net<0?CLR.red:'FF1D6B4A');
      statusCell.font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};
      statusCell.alignment={horizontal:'center',vertical:'middle'};
      row.getCell(4).numFmt='#,##0';row.getCell(5).numFmt='#,##0';
      row.getCell(6).numFmt='#,##0';
      row.getCell(6).font={bold:true,color:{argb:net>=0?'FF1D9E75':CLR.red},size:10,name:'Arial'};
      sumInc+=v.inc;sumExp+=v.exp;
    });
    styleRows(wsSUM,prjs.length);
    const totRow=wsSUM.addRow({name:'الإجمالي',sd:'',status:'',inc:sumInc,exp:sumExp,net:sumInc-sumExp,note:''});
    totRow.height=28;totRow.eachCell(cell=>{cell.fill=fill(CLR.dark);cell.font={bold:true,color:{argb:CLR.white},size:11,name:'Arial'};cell.alignment={horizontal:'center',vertical:'middle'};cell.border=brd();});
    totRow.getCell(4).numFmt='#,##0';totRow.getCell(5).numFmt='#,##0';totRow.getCell(6).numFmt='#,##0';
    wsSUM.views=[{state:'frozen',ySplit:2,rightToLeft:true}];

    // شيت المشاريع
    const wsP=wb.addWorksheet('المشاريع',{views:[{rightToLeft:true}]});
    mergeTitle(wsP,'📋  قائمة المشاريع',5,CLR.dark);
    hdr(wsP,[{h:'الاسم',k:'name',w:25},{h:'تاريخ البداية',k:'sd',w:18},{h:'تاريخ الإغلاق',k:'cd',w:18},{h:'مؤرشف',k:'arc',w:12},{h:'ID',k:'id',w:38}]);
    prjs.forEach(p=>{
      const row=wsP.addRow({name:p.name,sd:p.start_date||'',cd:p.close_date||'',arc:p.archived?'مؤرشف':'نشط',id:p.id});
      const arcCell=row.getCell(4);
      arcCell.fill=fill(p.archived?'FF546E7A':'FF1D6B4A');
      arcCell.font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};
      arcCell.alignment={horizontal:'center',vertical:'middle'};
    });
    styleRows(wsP,prjs.length);
    // شيت القيود
    const wsE=wb.addWorksheet('القيود',{views:[{rightToLeft:true}]});
    mergeTitle(wsE,'📊  القيود التفصيلية',8,CLR.dark);
    hdr(wsE,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'المقاول',k:'mq',w:20},{h:'رقم',k:'seq',w:8}]);
    ents.forEach(e=>wsE.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',mq:e.contractor||'',seq:e.seq||''}));
    styleRows(wsE,ents.length);
    // لون الوارد والمصروف
    for(let i=2;i<=ents.length+1;i++){
      const cell=wsE.getRow(i).getCell(2);
      const isInc=cell.value==='وارد';
      const clr=isInc?'FF1D9E75':CLR.red;
      cell.fill=fill(isInc?CLR.light:'FFFEF2F1');
      cell.font={bold:true,color:{argb:clr},size:10,name:'Arial'};
      wsE.getRow(i).getCell(3).font={bold:true,color:{argb:clr},size:10,name:'Arial'};
      wsE.getRow(i).getCell(3).numFmt='#,##0';
    }
    // شيت العهد — مع المصروف والمتبقي
    const wsA=wb.addWorksheet('العهد',{views:[{rightToLeft:true}]});
    mergeTitle(wsA,'💼  العهد والسلف',6,CLR.gold);
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
    mergeTitle(wsU,'👥  المستخدمين',3,CLR.dark);
    hdr(wsU,[{h:'الاسم',k:'name',w:22},{h:'الدور',k:'role',w:15},{h:'ID',k:'id',w:38}]);
    profs.forEach(u=>wsU.addRow({name:u.name||'',role:u.role||'',id:u.id}));
    styleRows(wsU,profs.length);
    // شيت المستحقات
    if(dues&&dues.length){
      const wsD=wb.addWorksheet('المستحقات',{views:[{rightToLeft:true}]});
      mergeTitle(wsD,'🏗  مستحقات المقاولين',6,'FF6C3483');
      hdr(wsD,[{h:'المقاول',k:'name',w:22},{h:'المشروع',k:'proj',w:20},{h:'المبلغ',k:'amt',w:15},{h:'الحالة',k:'status',w:12},{h:'التاريخ',k:'dt',w:15},{h:'ملاحظة',k:'note',w:25}]);
      dues.forEach(d=>{
        const row=wsD.addRow({name:d.contractor_name||'',proj:projMap[d.project_id]||'',amt:d.amount,status:d.status==='paid'?'مدفوع':'غير مدفوع',dt:d.due_date||'',note:d.note||''});
        const sc=row.getCell(4);const paid=d.status==='paid';
        sc.fill=fill(paid?'FF1D6B4A':CLR.red);sc.font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};sc.alignment={horizontal:'center',vertical:'middle'};
        row.getCell(3).numFmt='#,##0';
      });
      styleRows(wsD,dues.length);
    }
    // شيت القيود المعلقة
    if(pending&&pending.length){
      const wsPN=wb.addWorksheet('قيود معلقة',{views:[{rightToLeft:true}]});
      mergeTitle(wsPN,'⏳  القيود المعلقة',7,'FFD4800A');
      hdr(wsPN,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'الحالة',k:'status',w:15}]);
      pending.forEach(e=>wsPN.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',status:'في الانتظار'}));
      styleRows(wsPN,pending.length);
    }
    // شيت الملاحظات
    if(notes&&notes.length){
      const wsN=wb.addWorksheet('الملاحظات',{views:[{rightToLeft:true}]});
      mergeTitle(wsN,'📝  الملاحظات',3,CLR.dark);
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
