async function loadExcelJS(){
  if(xOK)return;
  await new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';
    s.onload=()=>{xOK=true;res();};s.onerror=rej;
    document.head.appendChild(s);
  });
}
async function backupAll(){
// ██ BACKUP SYSTEM ══════════════════════════════════
  const btn=document.getElementById('sbi-backup');
  if(btn)btn.disabled=true;
  setSav('⏳ جاري تحميل المكتبة...','ng');
  try{
    await loadExcelJS();
    setSav('⏳ جاري جلب البيانات...','ng');
    // جيب كل البيانات — كل جدول لوحده عشان لو جدول مش موجود ميوقفش الكل
    const safe=async(fn)=>{try{return await fn();}catch(e){console.warn('backup table skip:',e.message);return [];}};
    const [prjs,ents,advs,insts,profs,dues,pending,pendingAdvs,notes,summaries]=await Promise.all([
      safe(()=>sb('projects?order=created_at')),
      safe(()=>sbAll('entries?order=created_at')),
      safe(()=>sb('advances?order=created_at')),
      safe(()=>sb('advance_installments?order=created_at')),
      safe(()=>sb('profiles?order=created_at')),
      safe(()=>sb('contractor_dues?order=created_at')),
      safe(()=>sb('pending_entries?order=submitted_at')),
      safe(()=>sb('pending_advances?status=eq.pending&order=submitted_at')),
      safe(()=>sb('notes?order=created_at')),
      safe(()=>sb('project_summaries')),
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
      mergeTitle(wsPN,'⏳  القيود المعلقة',8,'FFD4800A');
      const profMap={};(profs||[]).forEach(p=>{profMap[p.id]=p.name||'—';});
      hdr(wsPN,[{h:'المشروع',k:'proj',w:20},{h:'النوع',k:'type',w:10},{h:'المبلغ',k:'amt',w:15},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'التاريخ',k:'dt',w:15},{h:'المُدخِل',k:'user',w:18},{h:'الحالة',k:'status',w:15}]);
      pending.forEach(e=>wsPN.addRow({proj:projMap[e.project_id]||'',type:e.type==='i'?'وارد':'مصروف',amt:e.amount,cat:e.category||'',desc:e.description||'',dt:e.entry_date||'',user:profMap[e.submitted_by]||'—',status:'في الانتظار'}));
      styleRows(wsPN,pending.length);
    }
    // شيت العهد المعلقة
    if(pendingAdvs&&pendingAdvs.length){
      const advMap2={};advs.forEach(a=>advMap2[a.id]=a.person_name||'');
      const wsPAdv=wb.addWorksheet('عهد معلقة',{views:[{rightToLeft:true}]});
      mergeTitle(wsPAdv,'⏳  العهد المعلقة',5,'FFD4800A');
      hdr(wsPAdv,[{h:'صاحب العهدة',k:'name',w:22},{h:'المبلغ',k:'amt',w:15},{h:'الملاحظة',k:'note',w:30},{h:'تاريخ الدفعة',k:'dt',w:16},{h:'الحالة',k:'status',w:14}]);
      pendingAdvs.forEach(pa=>{
        const row=wsPAdv.addRow({name:advMap2[pa.advance_id]||'',amt:pa.amount,note:pa.inst_note||'',dt:pa.inst_date||'',status:'في الانتظار'});
        row.getCell(2).numFmt='#,##0';
      });
      styleRows(wsPAdv,pendingAdvs.length);
    }
    // شيت الملاحظات
    if(notes&&notes.length){
      const wsN=wb.addWorksheet('الملاحظات',{views:[{rightToLeft:true}]});
      mergeTitle(wsN,'📝  الملاحظات',3,CLR.dark);
      hdr(wsN,[{h:'العنوان',k:'title',w:25},{h:'المحتوى',k:'body',w:40},{h:'التاريخ',k:'dt',w:15}]);
      notes.forEach(n=>wsN.addRow({title:n.title||'',body:n.body||n.content||'',dt:n.created_at?n.created_at.substring(0,10):''}));
      styleRows(wsN,notes.length);
    }
    // شيت لكل مشروع
    const entsByProj={};
    ents.forEach(e=>{const pid=e.project_id;if(!entsByProj[pid])entsByProj[pid]=[];entsByProj[pid].push(e);});
    prjs.forEach(p=>{
      const pe=entsByProj[p.id]||[];
      if(!pe.length)return;
      const sv=sumMap[p.id]||{inc:0,exp:0};
      const net=sv.inc-sv.exp;
      const sheetName=(p.name||'').replace(/[*?:\\/\[\]]/g,'-').substring(0,31);
      const wsPR=wb.addWorksheet(sheetName,{views:[{rightToLeft:true}]});
      const isArc=p.archived;
      const status=isArc?'🗂 مؤرشف':net<0?'🔴 عجز':'🟢 نشط';
      mergeTitle(wsPR,'📁  '+p.name+'  —  '+status,8,CLR.dark);
      // بطاقات ملخص
      const cardRow=wsPR.addRow(['إجمالي الوارد','','إجمالي المصروف','','صافي الربح','','عدد القيود','']);
      cardRow.height=14;
      const cardRow2=wsPR.addRow([sv.inc,'',sv.exp,'',net,'',pe.length,'']);
      cardRow2.height=28;
      [[1,CLR.green],[3,CLR.red],[5,net>=0?CLR.green:CLR.red],[7,CLR.blue]].forEach(([col,clr])=>{
        wsPR.mergeCells(cardRow.number,col,cardRow.number,col+1);
        wsPR.mergeCells(cardRow2.number,col,cardRow2.number,col+1);
        cardRow.getCell(col).fill=fill(clr);cardRow.getCell(col).font={bold:true,color:{argb:CLR.white},size:9,name:'Arial'};cardRow.getCell(col).alignment={horizontal:'center',vertical:'middle'};cardRow.getCell(col).border=brd();
        cardRow2.getCell(col).fill=fill(clr);cardRow2.getCell(col).font={bold:true,color:{argb:CLR.white},size:12,name:'Arial'};cardRow2.getCell(col).alignment={horizontal:'center',vertical:'middle'};cardRow2.getCell(col).border=brd();
        if(col!==7)cardRow2.getCell(col).numFmt='#,##0';
      });
      wsPR.addRow([]);
      // وارد
      const incRows=pe.filter(e=>e.type==='i');
      if(incRows.length){
        const incTitle=wsPR.addRow(['📥  الوارد','','','','','','','']);wsPR.mergeCells(incTitle.number,1,incTitle.number,8);incTitle.height=26;incTitle.getCell(1).fill=fill(CLR.green);incTitle.getCell(1).font={bold:true,color:{argb:CLR.white},size:12,name:'Arial'};incTitle.getCell(1).alignment={horizontal:'center',vertical:'middle'};incTitle.getCell(1).border=brd();
        hdr(wsPR,[{h:'رقم',k:'n',w:5},{h:'البيان',k:'desc',w:35},{h:'المبلغ',k:'amt',w:18},{h:'التاريخ',k:'dt',w:14},{h:'رقم القيد',k:'seq',w:14}],'FF2E7D52');
        incRows.forEach((e,i)=>{const r=wsPR.addRow({n:i+1,desc:e.description||'',amt:e.amount,dt:e.entry_date||'',seq:e.seq||''});r.height=20;r.getCell(3).numFmt='#,##0';if(i%2===0)r.eachCell(c=>{c.fill=fill(CLR.light);});else r.eachCell(c=>{c.fill=fill(CLR.white);});r.eachCell(c=>{c.border=brd();c.font={size:10,name:'Arial'};});});
        const iTot=wsPR.addRow(['إجمالي الوارد','',sv.inc,'','','','','']);iTot.height=24;wsPR.mergeCells(iTot.number,1,iTot.number,2);iTot.getCell(1).fill=fill(CLR.green);iTot.getCell(1).font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};iTot.getCell(1).alignment={horizontal:'center',vertical:'middle'};iTot.getCell(1).border=brd();iTot.getCell(3).fill=fill(CLR.green);iTot.getCell(3).font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};iTot.getCell(3).numFmt='#,##0';iTot.getCell(3).alignment={horizontal:'center',vertical:'middle'};iTot.getCell(3).border=brd();
        wsPR.addRow([]);
      }
      // مصروف
      const expRows=pe.filter(e=>e.type==='e');
      if(expRows.length){
        const expTitle=wsPR.addRow(['📤  المصروف','','','','','','','']);wsPR.mergeCells(expTitle.number,1,expTitle.number,8);expTitle.height=26;expTitle.getCell(1).fill=fill('FF8B2020');expTitle.getCell(1).font={bold:true,color:{argb:CLR.white},size:12,name:'Arial'};expTitle.getCell(1).alignment={horizontal:'center',vertical:'middle'};expTitle.getCell(1).border=brd();
        hdr(wsPR,[{h:'رقم',k:'n',w:5},{h:'البند',k:'cat',w:18},{h:'البيان',k:'desc',w:30},{h:'المبلغ',k:'amt',w:16},{h:'التاريخ',k:'dt',w:14},{h:'المقاول',k:'mq',w:18},{h:'رقم القيد',k:'seq',w:14}],CLR.red);
        expRows.forEach((e,i)=>{const r=wsPR.addRow({n:i+1,cat:e.category||'',desc:e.description||'',amt:e.amount,dt:e.entry_date||'',mq:e.contractor||'',seq:e.seq||''});r.height=20;r.getCell(4).numFmt='#,##0';if(i%2===0)r.eachCell(c=>{c.fill=fill('FFFEF2F1');});else r.eachCell(c=>{c.fill=fill(CLR.white);});r.eachCell(c=>{c.border=brd();c.font={size:10,name:'Arial'};});});
        const eTot=wsPR.addRow(['إجمالي المصروف','','',sv.exp,'','','','']);eTot.height=24;wsPR.mergeCells(eTot.number,1,eTot.number,3);eTot.getCell(1).fill=fill(CLR.red);eTot.getCell(1).font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};eTot.getCell(1).alignment={horizontal:'center',vertical:'middle'};eTot.getCell(1).border=brd();eTot.getCell(4).fill=fill(CLR.red);eTot.getCell(4).font={bold:true,color:{argb:CLR.white},size:10,name:'Arial'};eTot.getCell(4).numFmt='#,##0';eTot.getCell(4).alignment={horizontal:'center',vertical:'middle'};eTot.getCell(4).border=brd();
      }
      wsPR.views=[{state:'frozen',ySplit:1,rightToLeft:true}];
    });

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
    console.error('BACKUP ERROR FULL:',e);
    setSav('❌ '+friendlyError(e)+' — '+String(e?.message||e),'er');
  }
  btn.disabled=false;
}

// EXPORT ALL PROJECTS
async function exportAllProjects(){
  const btn=document.getElementById('sbi-save-proj');
  if(btn){btn.disabled=true;}
  setSav('⏳ جاري التحضير...','ng');
  try{
    await loadExcelJS();
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


