// ADMIN
async function loadAdminPanel(){
  try{
    const allP=await sb('profiles?order=created_at');
    const allA=await sb('project_access');
    const allPr=await sb('projects?order=created_at');
    const ul=document.getElementById('usersList');
    if(!allP.length){ul.innerHTML='<div class="emp">لا يوجد مستخدمين بعد</div>';return;}
    ul.innerHTML=allP.map(u=>{
      const uAcc=allA.filter(a=>a.user_id===u.id).map(a=>a.project_id);
      const chips=allPr.map(p=>'<button class="pchip '+(uAcc.includes(p.id)?'on':'')+'" onclick="togAcc(\''+u.id+'\',\''+p.id+'\',this)">'+p.name+'</button>').join('');
      const isMe=u.id===uid;
      return '<div class="ucard"><div class="ucard-h"><div><div class="uname">'+u.name+'</div></div><div style="display:flex;gap:6px;align-items:center">'+(!isMe?'<button class="del-u" onclick="delUser(\''+u.id+'\',\''+u.name+'\')">حذف</button>':'')+'<select class="rsel" onchange="chRole(\''+u.id+'\',this.value)"'+(isMe?' disabled':'')+' ><option value="admin" '+(u.role==='admin'?'selected':'')+'>👑 أدمن</option><option value="editor" '+(u.role==='editor'?'selected':'')+'>✏️ محاسب</option><option value="viewer" '+(u.role==='viewer'?'selected':'')+'>👁 مشاهد</option></select></div></div><div class="admin-proj-label">المشاريع:</div><div class="pchips">'+chips+'</div></div>';
    }).join('');
  }catch(e){document.getElementById('usersList').innerHTML='<div class="emp">❌ خطأ</div>';}
}
async function addUser(){
  const id2=document.getElementById('nuUID').value.trim();
  const name=document.getElementById('nuName').value.trim();
  const role=document.getElementById('nuRole').value;
  if(!id2||!name){notify('ادخل الـ UID والاسم','err');return;}
  setSav('💾 جاري الإضافة...','ng');
  try{await sb('profiles','POST',{id:id2,name,role});setSav('✅ تم إضافة '+name,'ok');document.getElementById('nuUID').value='';document.getElementById('nuName').value='';await loadAdminPanel();}
  catch(e){setSav('❌ '+friendlyError(e),'er');}
}
async function togAcc(uid2,pid,btn){const isOn=btn.classList.contains('on');try{if(isOn){await sb('project_access?user_id=eq.'+uid2+'&project_id=eq.'+pid,'DELETE');btn.classList.remove('on');}else{await sb('project_access','POST',{user_id:uid2,project_id:pid});btn.classList.add('on');}setSav('✅ تم','ok');}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function chRole(uid2,role){try{await sb('profiles?id=eq.'+uid2,'PATCH',{role});setSav('✅ تم','ok');}catch(e){setSav('❌ '+friendlyError(e),'er');}}
async function delUser(uid2,name){await new Promise(res=>showConfirm({icon:'🗑️',title:'حذف المستخدم',msg:'هيتحذف "'+name+'" نهائياً.',okLabel:'حذف',okType:'danger',onOk:res}));try{await sb('profiles?id=eq.'+uid2,'DELETE');setSav('✅ تم حذف المستخدم','ok');await loadAdminPanel();}catch(e){setSav('❌ '+friendlyError(e),'er');}}

async function pdfClient(){
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const ct=Object.entries(cm).map(([n,rs])=>({n,r:rs}));
  const ic=pInc();
  const inc=ic.reduce((s,e)=>s+e.amount,0);
  const exp=ct.reduce((s,c)=>s+c.r.reduce((ss,e)=>ss+e.amount,0),0);
  const bal=inc-exp;
  const df=bal<0;

  let catRows='';
  ct.forEach(cat=>{
    const total=cat.r.reduce((s,e)=>s+e.amount,0);
    catRows+=`<tr><td>${cat.n}</td><td class="amt neg">▼ ${fn(total)} ج</td><td>${cat.r.length} قيد</td></tr>`;
  });

  let incRows=ic.map((e,i)=>`<tr>
    <td class="rep-table-num">${i+1}</td>
    <td>${cleanDate(e.entry_date)||'—'}</td>
    <td>${e.description||'دفعة'}</td>
    <td class="amt pos">▲ ${fn(e.amount)} ج</td>
  </tr>`).join('');

  let bndRows='';
  ct.forEach(cat=>{
    const total=cat.r.reduce((s,e)=>s+e.amount,0);
    bndRows+=`<div class="sec-ttl">📋 ${cat.n}</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${cat.r.map((e,i)=>`<tr>
        <td class="rep-table-num">${i+1}</td>
        <td>${cleanDate(e.entry_date)||'—'}</td>
        <td>${e.description||'—'}</td>
        <td class="amt neg">▼ ${fn(e.amount)} ج</td>
      </tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">إجمالي ${cat.n}</td><td class="amt neg">▼ ${fn(total)} ج</td></tr></tfoot>
    </table>`;
  });

  const html=_pdfOpen('نسخة العميل — '+p.name)+
    _pdfHeader('👤 نسخة العميل — '+p.name,'Legacy Fine Touch · '+new Date().toLocaleDateString('ar-EG'))+
    `<div class="kpis kpis-3">
      <div class="kpi kpi-inc"><div class="kpi-lbl">إجمالي الوارد</div><div class="kpi-val">▲ ${fn(inc)} ج</div></div>
      <div class="kpi kpi-exp"><div class="kpi-lbl">إجمالي المصروف</div><div class="kpi-val">▼ ${fn(exp)} ج</div></div>
      <div class="kpi ${df?'kpi-net-neg':'kpi-net-pos'}"><div class="kpi-lbl">${df?'⚠ عجز':'✅ الرصيد'}</div><div class="kpi-val">${df?'▼':'▲'} ${fn(Math.abs(bal))} ج</div></div>
    </div>
    <div class="sec-ttl">📊 ملخص البنود</div>
    <table>
      <thead><tr><th>البند</th><th>الإجمالي</th><th>عدد القيود</th></tr></thead>
      <tbody>${catRows}</tbody>
      <tfoot><tr><td colspan="2">إجمالي المصروفات</td><td class="amt neg">▼ ${fn(exp)} ج</td></tr></tfoot>
    </table>
    <div class="sec-ttl">📥 حركة الوارد</div>
    <table>
      <thead><tr><th>#</th><th>التاريخ</th><th>البيان</th><th>المبلغ</th></tr></thead>
      <tbody>${incRows}</tbody>
      <tfoot><tr><td colspan="3">إجمالي الوارد</td><td class="amt pos">▲ ${fn(inc)} ج</td></tr></tfoot>
    </table>
    ${bndRows}`+
    _pdfFooter()+_pdfClose();

  openPrintWindow(html);
}

async function xlClient(){
  const msg=document.getElementById('emsg');
  msg.textContent='جاري تحميل المكتبة...';
  try{
    if(!xOK){await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://unpkg.com/exceljs@4.4.0/dist/exceljs.min.js';s.onload=()=>{xOK=true;res();};s.onerror=rej;document.head.appendChild(s);});}
    msg.textContent='جاري بناء الملف...';
    await bldClient();
    msg.textContent='✓ تم التحميل';
  }catch(e){msg.textContent='خطأ: '+e.message;}
}

async function bldClient(){
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const safeSheet=n=>{let s=(n||'شيت').replace(/[:\\\\/\?\*\[\]]/g,'').trim().substring(0,28);return s||'شيت';};
  const ct=Object.entries(cm).map(([n,rs])=>({n:safeSheet(n),r:rs,tr:6+rs.length,t:rs.reduce((a,e)=>a+(e.amount||0),0)}));
  const ic=pInc().map(e=>[e.seq||'',e.description||'دفعة',e.entry_date||'—',e.amount]);
  const IT=6+ic.length;
  const G1='1D3C2A',G2='2A5C38',G5='EDF5EE',G6='F4F8F5',B1='D4C49A',B2='E8D8B0',B3='F5EDDB',B4='FAF5EC';
  const BL='1A3A5C',LB='D6E8F7',RD='922B21',PS='1E6B3A',LP='E2F5EA',DEF='6E1C1C',LD='FAE5E5';
  const inc=ic.reduce((s,r)=>s+r[3],0),exp=ct.reduce((s,c)=>s+c.r.reduce((ss,r)=>ss+r.amount,0),0),df=(inc-exp)<0;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const F=(c,b)=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+b}};
  const T=(c,f,s,b,i)=>c.font={color:{argb:'FF'+f},size:s||10,bold:!!b,italic:!!i,name:'Calibri'};
  const A=(c,h)=>c.alignment={horizontal:h||'right',vertical:'middle',readingOrder:'rightToLeft'};
  const BD=c=>{const b={style:'thin',color:{argb:'FFD8CEB8'}};c.border={top:b,left:b,bottom:b,right:b};};
  const N=c=>c.numFmt='#,##0';
  const MC=(w,a,b)=>{try{w.mergeCells(a+':'+b);}catch(e){}};
  const bs=(w,sub,nc)=>{const lc=String.fromCharCode(64+nc);w.views=[{rightToLeft:true}];w.getRow(1).height=30;MC(w,'A1',lc+'1');const h=w.getCell('A1');h.value='Legacy Fine Touch';F(h,G1);T(h,B1,15,true);A(h,'center');w.getRow(2).height=18;MC(w,'A2',lc+'2');const t=w.getCell('A2');t.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(t,G2);T(t,B2,9,false,true);A(t,'center');w.getRow(3).height=22;MC(w,'A3',lc+'3');const s=w.getCell('A3');s.value=sub;F(s,'C8D8C0');T(s,G1,11,true);A(s,'center');w.getRow(4).height=8;MC(w,'A4',lc+'4');F(w.getCell('A4'),B4);};
  const af=(w,r,t,nc)=>{const lc=String.fromCharCode(64+nc);MC(w,'A'+r,lc+r);const f=w.getCell('A'+r);f.value=t;F(f,B3);T(f,G1,8,false,true);A(f,'center');};

  // ملخص
  const wS=wb.addWorksheet('ملخص',{tabColor:{argb:'FF'+G1}});
  wS.views=[{rightToLeft:true}];[26,20,13,18].forEach((w,i)=>wS.getColumn(i+1).width=w);
  wS.getRow(1).height=30;MC(wS,'A1','D1');const sh=wS.getCell('A1');sh.value='Legacy Fine Touch';F(sh,G1);T(sh,B1,16,true);A(sh,'center');
  wS.getRow(2).height=18;MC(wS,'A2','D2');const s2=wS.getCell('A2');s2.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(s2,G2);T(s2,B2,9,false,true);A(s2,'center');
  wS.getRow(3).height=10;MC(wS,'A3','D3');F(wS.getCell('A3'),B4);
  wS.getRow(4).height=20;['المشروع','المهندس','تاريخ البدء','تاريخ التقفيل'].forEach((v,i)=>{const c=wS.getCell(4,i+1);c.value=v;F(c,G1);T(c,B1,9,true);A(c,'center');});
  wS.getRow(5).height=26;[p.name,'م. محمد شكري',p.start_date,p.close_date].forEach((v,i)=>{const c=wS.getCell(5,i+1);c.value=v;F(c,G5);T(c,G1,11,true);A(c,'center');const b={style:'thin',color:{argb:'FFA8C8A8'}};c.border={top:b,left:b,bottom:b,right:b};});
  wS.getRow(6).height=10;MC(wS,'A6','D6');F(wS.getCell('A6'),B4);
  wS.getRow(7).height=22;MC(wS,'A7','B7');[['A7','إجمالي الوارد',BL],['C7','إجمالي المصروفات',RD],['D7',df?'⚠ عجز':'✅ الرصيد',df?DEF:PS]].forEach(x=>{const c=wS.getCell(x[0]);c.value=x[1];F(c,x[2]);T(c,'FFFFFF',9,true);A(c,'center');});
  wS.getRow(8).height=46;MC(wS,'A8','B8');
  const k8a=wS.getCell('A8');k8a.value={formula:"'الوارد'!D"+IT,result:inc};F(k8a,LB);T(k8a,BL,18,true);A(k8a,'center');k8a.numFmt='#,##0 "ج"';
  const k8c=wS.getCell('C8');k8c.value={formula:ct.length?ct.map(c=>"'"+c.n+"'!D"+c.tr).join('+'):'0',result:exp};F(k8c,'FAE5E5');T(k8c,RD,18,true);A(k8c,'center');k8c.numFmt='#,##0 "ج"';
  const k8d=wS.getCell('D8');k8d.value={formula:'A8-C8',result:inc-exp};F(k8d,df?LD:LP);T(k8d,df?DEF:PS,18,true);A(k8d,'center');k8d.numFmt='#,##0 "ج"';
  wS.getRow(9).height=10;MC(wS,'A9','D9');F(wS.getCell('A9'),B4);
  wS.getRow(10).height=28;MC(wS,'A10','D10');wS.getCell('A10').value='تفصيل المصروفات بالبنود';F(wS.getCell('A10'),G1);T(wS.getCell('A10'),B1,12,true);A(wS.getCell('A10'),'center');
  wS.getRow(11).height=22;['البند','إجمالي المصروف (ج)','النسبة %','ملاحظة'].forEach((v,i)=>{const c=wS.getCell(11,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});
  let SR=12;const CR=[];
  ct.forEach((ct2,ix)=>{wS.getRow(SR).height=21;const ca=wS.getCell('A'+SR);ca.value=ct2.n;BD(ca);T(ca,G1,10,true);A(ca,'right');if(ix%2===0)F(ca,G6);const cb=wS.getCell('B'+SR);cb.value={formula:"'"+ct2.n+"'!D"+ct2.tr,result:ct2.t};BD(cb);A(cb,'left');T(cb,G1,10,true);N(cb);if(ix%2===0)F(cb,G6);const cc=wS.getCell('C'+SR);BD(cc);A(cc,'center');T(cc,'888888',9);if(ix%2===0)F(cc,G6);BD(wS.getCell('D'+SR));if(ix%2===0)F(wS.getCell('D'+SR),G6);CR.push(SR);SR++;});
  const GR=SR;wS.getRow(SR).height=28;wS.getCell('A'+SR).value='إجمالي المصروفات';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const gb=wS.getCell('B'+SR);gb.value={formula:ct.length?'SUM(B12:B'+(SR-1)+')':'0',result:exp};F(gb,G1);T(gb,B1,11,true);A(gb,'left');N(gb);wS.getCell('C'+SR).value='100%';F(wS.getCell('C'+SR),G1);T(wS.getCell('C'+SR),B2,10,true);A(wS.getCell('C'+SR),'center');F(wS.getCell('D'+SR),G1);SR++;
  CR.forEach((rr,i)=>{const c=wS.getCell('C'+rr);c.value={formula:'B'+rr+'/$B$'+GR,result:exp?(ct[i].t/exp):0};c.numFmt='0.0%';});
  wS.getRow(SR).height=26;wS.getCell('A'+SR).value='إجمالي الوارد';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const ib2=wS.getCell('B'+SR);ib2.value={formula:"'الوارد'!D"+IT,result:inc};F(ib2,G1);T(ib2,B1,11,true);A(ib2,'left');N(ib2);F(wS.getCell('C'+SR),G1);F(wS.getCell('D'+SR),G1);const IR=SR;SR++;
  wS.getRow(SR).height=32;const BC=df?DEF:PS;wS.getCell('A'+SR).value=df?'⚠ عجز':'✅ الرصيد المتبقي';F(wS.getCell('A'+SR),BC);T(wS.getCell('A'+SR),'FFFFFF',12,true);A(wS.getCell('A'+SR),'right');const bb=wS.getCell('B'+SR);bb.value={formula:'B'+IR+'-B'+GR,result:inc-exp};F(bb,BC);T(bb,'FFFFFF',12,true);A(bb,'left');N(bb);F(wS.getCell('C'+SR),BC);F(wS.getCell('D'+SR),BC);SR+=2;
  MC(wS,'A'+SR,'D'+SR);wS.getCell('A'+SR).value='Legacy Fine Touch  |  '+p.name+'  |  م. محمد شكري  |  '+(p.close_date||'');F(wS.getCell('A'+SR),B3);T(wS.getCell('A'+SR),G1,8,false,true);A(wS.getCell('A'+SR),'center');

  // الوارد
  const wI=wb.addWorksheet('الوارد',{tabColor:{argb:'FF2A5C38'}});[8,32,16,20].forEach((w,i)=>wI.getColumn(i+1).width=w);bs(wI,'حركة الوارد  —  '+p.name,4);wI.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wI.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let ir=6;ic.forEach((row,ix)=>{wI.getRow(ir).height=21;const cs=[wI.getCell('A'+ir),wI.getCell('B'+ir),wI.getCell('C'+ir),wI.getCell('D'+ir)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],BL,10,true);ir++;});wI.getRow(ir).height=28;MC(wI,'A'+ir,'C'+ir);wI.getCell('A'+ir).value='الإجمالي';F(wI.getCell('A'+ir),G1);T(wI.getCell('A'+ir),B1,11,true);A(wI.getCell('A'+ir),'right');const iD=wI.getCell('D'+ir);iD.value={formula:ic.length?'SUM(D6:D'+(ir-1)+')':'0',result:inc};F(iD,G1);T(iD,B1,11,true);A(iD,'left');N(iD);af(wI,ir+2,'Legacy Fine Touch  |  الوارد  |  '+p.name,4);

  // البنود بدون عمود المقاول
  const TC=['1D5C3A','1E6B4A','235E3F','1A7050','2A6B45','0D5C3A','326050','254840'];
  ct.forEach((cat,idx)=>{const wc=wb.addWorksheet(cat.n,{tabColor:{argb:'FF'+TC[idx%TC.length]}});[8,36,16,20].forEach((w,i)=>wc.getColumn(i+1).width=w);bs(wc,cat.n+'  —  '+p.name,4);wc.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wc.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let cr=6;cat.r.forEach((e,ix)=>{wc.getRow(cr).height=21;const cs=[wc.getCell('A'+cr),wc.getCell('B'+cr),wc.getCell('C'+cr),wc.getCell('D'+cr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=e.seq||'';A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=e.description||'—';A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=e.entry_date||'—';A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=e.amount;A(cs[3],'left');N(cs[3]);T(cs[3],e.amount<0?RD:G1,10,true);cr++;});wc.getRow(cr).height=28;MC(wc,'A'+cr,'C'+cr);wc.getCell('A'+cr).value='إجمالي '+cat.n;F(wc.getCell('A'+cr),G1);T(wc.getCell('A'+cr),B1,11,true);A(wc.getCell('A'+cr),'right');const tD=wc.getCell('D'+cr);tD.value={formula:'SUM(D6:D'+(cr-1)+')',result:cat.t};F(tD,G1);T(tD,B1,11,true);A(tD,'left');N(tD);af(wc,cr+2,'Legacy Fine Touch  |  '+cat.n+'  |  '+p.name,4);});

  const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='عميل_'+p.name.replace(/\s+/g,'_')+'.xlsx';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

async function xl(){const msg=document.getElementById('emsg');
  const p=curP();if(!p)return;
  const cm={};pExp().forEach(e=>{const cat=(e.category&&e.category.trim())?e.category.trim():'متنوع';if(!cm[cat])cm[cat]=[];cm[cat].push(e);});
  const safeSheet=n=>{let s=(n||'شيت').replace(/[:\\\/\?\*\[\]]/g,'').trim().substring(0,28);return s||'شيت';};
  const ct=Object.entries(cm).map(([n,rs])=>({n:safeSheet(n),r:rs.map(e=>[e.seq||'',e.description||'—',e.entry_date||'—',e.amount,e.contractor||'']),tr:6+rs.length,t:rs.reduce((s,e)=>s+(e.amount||0),0)}));
  const ic=pInc().map(e=>[e.seq||'',e.description||'دفعة',e.entry_date||'—',e.amount]);
  const IT=6+ic.length,J=gJ(),M=gM();
  const G1='1D3C2A',G2='2A5C38',G5='EDF5EE',G6='F4F8F5',B1='D4C49A',B2='E8D8B0',B3='F5EDDB',B4='FAF5EC';
  const BL='1A3A5C',LB='D6E8F7',RD='922B21',PS='1E6B3A',LP='E2F5EA',DEF='6E1C1C',LD='FAE5E5',MQ='A05F1A',LM='FDE8C8';
  const inc=ic.reduce((s,r)=>s+r[3],0),exp=ct.reduce((s,c)=>s+c.r.reduce((ss,r)=>ss+r[3],0),0),df=(inc-exp)<0;
  const wb=new ExcelJS.Workbook();wb.views=[{rightToLeft:true}];wb.creator='Legacy Fine Touch';
  const F=(c,b)=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+b}};
  const T=(c,f,s,b,i)=>c.font={color:{argb:'FF'+f},size:s||10,bold:!!b,italic:!!i,name:'Calibri'};
  const A=(c,h)=>c.alignment={horizontal:h||'right',vertical:'middle',readingOrder:'rightToLeft'};
  const BD=c=>{const b={style:'thin',color:{argb:'FFD8CEB8'}};c.border={top:b,left:b,bottom:b,right:b};};
  const N=c=>c.numFmt='#,##0';
  const MC=(w,a,b)=>{try{w.mergeCells(a+':'+b);}catch(e){console.error(e);}};
  const bs=(w,sub,nc)=>{const lc=String.fromCharCode(64+nc);w.views=[{rightToLeft:true}];w.getRow(1).height=30;MC(w,'A1',lc+'1');const h=w.getCell('A1');h.value='Legacy Fine Touch';F(h,G1);T(h,B1,15,true);A(h,'center');w.getRow(2).height=18;MC(w,'A2',lc+'2');const t=w.getCell('A2');t.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(t,G2);T(t,B2,9,false,true);A(t,'center');w.getRow(3).height=22;MC(w,'A3',lc+'3');const s=w.getCell('A3');s.value=sub;F(s,'C8D8C0');T(s,G1,11,true);A(s,'center');w.getRow(4).height=8;MC(w,'A4',lc+'4');F(w.getCell('A4'),B4);};
  const af=(w,r,t,nc)=>{const lc=String.fromCharCode(64+nc);MC(w,'A'+r,lc+r);const f=w.getCell('A'+r);f.value=t;F(f,B3);T(f,G1,8,false,true);A(f,'center');};
  const wS=wb.addWorksheet('ملخص',{tabColor:{argb:'FF'+G1}});wS.views=[{rightToLeft:true}];[26,20,13,18].forEach((w,i)=>wS.getColumn(i+1).width=w);wS.getRow(1).height=30;MC(wS,'A1','D1');const sh=wS.getCell('A1');sh.value='Legacy Fine Touch';F(sh,G1);T(sh,B1,16,true);A(sh,'center');wS.getRow(2).height=18;MC(wS,'A2','D2');const s2=wS.getCell('A2');s2.value='Innovation · Quality · Integrity  |  م. محمد شكري  |  01099808939';F(s2,G2);T(s2,B2,9,false,true);A(s2,'center');wS.getRow(3).height=10;MC(wS,'A3','D3');F(wS.getCell('A3'),B4);wS.getRow(4).height=20;['المشروع','المهندس','تاريخ البدء','تاريخ التقفيل'].forEach((v,i)=>{const c=wS.getCell(4,i+1);c.value=v;F(c,G1);T(c,B1,9,true);A(c,'center');});wS.getRow(5).height=26;[p.name,'م. محمد شكري',p.start_date,p.close_date].forEach((v,i)=>{const c=wS.getCell(5,i+1);c.value=v;F(c,G5);T(c,G1,11,true);A(c,'center');const b={style:'thin',color:{argb:'FFA8C8A8'}};c.border={top:b,left:b,bottom:b,right:b};});wS.getRow(6).height=10;MC(wS,'A6','D6');F(wS.getCell('A6'),B4);wS.getRow(7).height=22;MC(wS,'A7','B7');[['A7','إجمالي الوارد',BL],['C7','إجمالي المصروفات',RD],['D7',df?'⚠ عجز':'✅ الرصيد',df?DEF:PS]].forEach(x=>{const c=wS.getCell(x[0]);c.value=x[1];F(c,x[2]);T(c,'FFFFFF',9,true);A(c,'center');});wS.getRow(8).height=46;MC(wS,'A8','B8');const eF=ct.length?ct.map(c=>"'"+c.n+"'!D"+c.tr).join('+'):'0';const k8a=wS.getCell('A8');k8a.value={formula:"'الوارد'!D"+IT,result:inc};F(k8a,LB);T(k8a,BL,18,true);A(k8a,'center');k8a.numFmt='#,##0 "ج"';const k8c=wS.getCell('C8');k8c.value={formula:eF,result:exp};F(k8c,'FAE5E5');T(k8c,RD,18,true);A(k8c,'center');k8c.numFmt='#,##0 "ج"';const k8d=wS.getCell('D8');k8d.value={formula:'A8-C8',result:inc-exp};F(k8d,df?LD:LP);T(k8d,df?DEF:PS,18,true);A(k8d,'center');k8d.numFmt='#,##0 "ج"';wS.getRow(9).height=10;MC(wS,'A9','D9');F(wS.getCell('A9'),B4);wS.getRow(10).height=28;MC(wS,'A10','D10');wS.getCell('A10').value='تفصيل المصروفات بالبنود';F(wS.getCell('A10'),G1);T(wS.getCell('A10'),B1,12,true);A(wS.getCell('A10'),'center');wS.getRow(11).height=22;['البند','إجمالي المصروف (ج)','النسبة %','ملاحظة'].forEach((v,i)=>{const c=wS.getCell(11,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let SR=12;const CR=[];ct.forEach((ct2,ix)=>{wS.getRow(SR).height=21;const ca=wS.getCell('A'+SR);ca.value=ct2.n;BD(ca);T(ca,G1,10,true);A(ca,'right');if(ix%2===0)F(ca,G6);const cb=wS.getCell('B'+SR);cb.value={formula:"'"+ct2.n+"'!D"+ct2.tr,result:ct2.t};BD(cb);A(cb,'left');T(cb,G1,10,true);N(cb);if(ix%2===0)F(cb,G6);const cc=wS.getCell('C'+SR);BD(cc);A(cc,'center');T(cc,'888888',9);if(ix%2===0)F(cc,G6);BD(wS.getCell('D'+SR));if(ix%2===0)F(wS.getCell('D'+SR),G6);CR.push(SR);SR++;});const GR=SR;wS.getRow(SR).height=28;wS.getCell('A'+SR).value='إجمالي المصروفات';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const gb=wS.getCell('B'+SR);gb.value={formula:ct.length?'SUM(B12:B'+(SR-1)+')':'0',result:exp};F(gb,G1);T(gb,B1,11,true);A(gb,'left');N(gb);wS.getCell('C'+SR).value='100%';F(wS.getCell('C'+SR),G1);T(wS.getCell('C'+SR),B2,10,true);A(wS.getCell('C'+SR),'center');F(wS.getCell('D'+SR),G1);SR++;CR.forEach((rr,i)=>{const c=wS.getCell('C'+rr);c.value={formula:'B'+rr+'/$B$'+GR,result:exp?(ct[i].t/exp):0};c.numFmt='0.0%';});wS.getRow(SR).height=26;wS.getCell('A'+SR).value='إجمالي الوارد';F(wS.getCell('A'+SR),G1);T(wS.getCell('A'+SR),B1,11,true);A(wS.getCell('A'+SR),'right');const ib2=wS.getCell('B'+SR);ib2.value={formula:"'الوارد'!D"+IT,result:inc};F(ib2,G1);T(ib2,B1,11,true);A(ib2,'left');N(ib2);F(wS.getCell('C'+SR),G1);F(wS.getCell('D'+SR),G1);const IR=SR;SR++;wS.getRow(SR).height=32;const BC=df?DEF:PS;wS.getCell('A'+SR).value=df?'⚠ عجز':'✅ الرصيد المتبقي';F(wS.getCell('A'+SR),BC);T(wS.getCell('A'+SR),'FFFFFF',12,true);A(wS.getCell('A'+SR),'right');const bb=wS.getCell('B'+SR);bb.value={formula:'B'+IR+'-B'+GR,result:inc-exp};F(bb,BC);T(bb,'FFFFFF',12,true);A(bb,'left');N(bb);F(wS.getCell('C'+SR),BC);F(wS.getCell('D'+SR),BC);SR+=2;MC(wS,'A'+SR,'D'+SR);wS.getCell('A'+SR).value='Legacy Fine Touch  |  '+p.name+'  |  م. محمد شكري  |  '+(p.close_date||'');F(wS.getCell('A'+SR),B3);T(wS.getCell('A'+SR),G1,8,false,true);A(wS.getCell('A'+SR),'center');
  const wJ=wb.addWorksheet('يومية',{tabColor:{argb:'FF6B4D1A'}});[8,14,24,15,16,13,13,16].forEach((w,i)=>wJ.getColumn(i+1).width=w);bs(wJ,'دفتر اليومية  —  '+p.name,8);wJ.getRow(5).height=22;['#','التاريخ','البيان','البند','المقاول','الوارد','المصروف','الرصيد'].forEach((v,i)=>{const c=wJ.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let jr=6;J.forEach((e,ix)=>{wJ.getRow(jr).height=21;const cs=[wJ.getCell('A'+jr),wJ.getCell('B'+jr),wJ.getCell('C'+jr),wJ.getCell('D'+jr),wJ.getCell('E'+jr),wJ.getCell('F'+jr),wJ.getCell('G'+jr),wJ.getCell('H'+jr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=e.seq||'';A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=e.entry_date||'—';A(cs[1],'center');T(cs[1],'666666',9);cs[2].value=e.description||'—';A(cs[2],'right');T(cs[2],'1A1A1A',10);cs[3].value=e.type==='i'?'وارد':(e.category||'—');A(cs[3],'center');T(cs[3],e.type==='i'?BL:G2,9,true);cs[4].value=e.contractor||'';A(cs[4],'center');T(cs[4],MQ,9,true);if(e.contractor)F(cs[4],LM);if(e.type==='i'){cs[5].value=e.amount;T(cs[5],BL,10,true);}A(cs[5],'left');N(cs[5]);if(e.type==='e'){cs[6].value=e.amount;T(cs[6],RD,10,true);}A(cs[6],'left');N(cs[6]);cs[7].value={formula:jr===6?'F6-G6':'H'+(jr-1)+'+F'+jr+'-G'+jr,result:e.bal};A(cs[7],'left');N(cs[7]);T(cs[7],G1,10,true);F(cs[7],LP);jr++;});if(J.length){wJ.getRow(jr).height=28;MC(wJ,'A'+jr,'E'+jr);wJ.getCell('A'+jr).value='الإجمالي';F(wJ.getCell('A'+jr),G1);T(wJ.getCell('A'+jr),B1,11,true);A(wJ.getCell('A'+jr),'right');['F','G'].forEach(col=>{const c=wJ.getCell(col+jr);c.value={formula:'SUM('+col+'6:'+col+(jr-1)+')',result:col==='F'?inc:exp};F(c,G1);T(c,B1,11,true);A(c,'left');N(c);});const th=wJ.getCell('H'+jr);th.value={formula:'F'+jr+'-G'+jr,result:inc-exp};F(th,G1);T(th,B1,11,true);A(th,'left');N(th);jr++;}af(wJ,jr+1,'Legacy Fine Touch  |  يومية  |  '+p.name,8);
  if(M.length){const wM=wb.addWorksheet('المقاولين',{tabColor:{argb:'FF'+MQ}});[22,30,13,18,15].forEach((w,i)=>wM.getColumn(i+1).width=w);bs(wM,'حساب المقاولين  —  '+p.name,5);wM.getRow(5).height=22;['المقاول','البنود','عدد الدفعات','الإجمالي (ج)','آخر دفعة'].forEach((v,i)=>{const c=wM.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let mr=6;M.forEach((m,ix)=>{wM.getRow(mr).height=22;const cs=[wM.getCell('A'+mr),wM.getCell('B'+mr),wM.getCell('C'+mr),wM.getCell('D'+mr),wM.getCell('E'+mr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,LM);});cs[0].value=m.n;A(cs[0],'right');T(cs[0],MQ,11,true);cs[1].value=m.ca.join(' · ');A(cs[1],'right');T(cs[1],'444444',10);cs[2].value=m.cnt;A(cs[2],'center');cs[3].value=m.t;A(cs[3],'left');N(cs[3]);T(cs[3],G1,11,true);cs[4].value=m.last||'—';A(cs[4],'center');T(cs[4],'666666',9);mr++;});wM.getRow(mr).height=28;MC(wM,'A'+mr,'C'+mr);wM.getCell('A'+mr).value='إجمالي المسحوب';F(wM.getCell('A'+mr),G1);T(wM.getCell('A'+mr),B1,11,true);A(wM.getCell('A'+mr),'right');const md=wM.getCell('D'+mr);md.value={formula:'SUM(D6:D'+(mr-1)+')',result:M.reduce((a,b)=>a+b.t,0)};F(md,G1);T(md,B1,11,true);A(md,'left');N(md);F(wM.getCell('E'+mr),G1);af(wM,mr+2,'Legacy Fine Touch  |  المقاولين  |  '+p.name,5);}
  const wI=wb.addWorksheet('الوارد',{tabColor:{argb:'FF2A5C38'}});[8,32,16,20].forEach((w,i)=>wI.getColumn(i+1).width=w);bs(wI,'حركة الوارد  —  '+p.name,4);wI.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)'].forEach((v,i)=>{const c=wI.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let ir=6;ic.forEach((row,ix)=>{wI.getRow(ir).height=21;const cs=[wI.getCell('A'+ir),wI.getCell('B'+ir),wI.getCell('C'+ir),wI.getCell('D'+ir)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],BL,10,true);ir++;});wI.getRow(ir).height=28;MC(wI,'A'+ir,'C'+ir);wI.getCell('A'+ir).value='الإجمالي';F(wI.getCell('A'+ir),G1);T(wI.getCell('A'+ir),B1,11,true);A(wI.getCell('A'+ir),'right');const iD=wI.getCell('D'+ir);iD.value={formula:ic.length?'SUM(D6:D'+(ir-1)+')':'0',result:inc};F(iD,G1);T(iD,B1,11,true);A(iD,'left');N(iD);af(wI,ir+2,'Legacy Fine Touch  |  الوارد  |  '+p.name,4);
  const TC=['1D5C3A','1E6B4A','235E3F','1A7050','2A6B45','0D5C3A','326050','254840'];
  ct.forEach((cat,idx)=>{const wc=wb.addWorksheet(cat.n,{tabColor:{argb:'FF'+TC[idx%TC.length]}});[8,32,16,18,18].forEach((w,i)=>wc.getColumn(i+1).width=w);bs(wc,cat.n+'  —  '+p.name,5);wc.getRow(5).height=22;['#','البيان','التاريخ','المبلغ (ج)','المقاول'].forEach((v,i)=>{const c=wc.getCell(5,i+1);c.value=v;F(c,G2);T(c,'FFFFFF',10,true);A(c,'center');});let cr=6;cat.r.forEach((row,ix)=>{wc.getRow(cr).height=21;const cs=[wc.getCell('A'+cr),wc.getCell('B'+cr),wc.getCell('C'+cr),wc.getCell('D'+cr),wc.getCell('E'+cr)];cs.forEach(c=>{BD(c);if(ix%2===0)F(c,G6);});cs[0].value=row[0];A(cs[0],'center');T(cs[0],G1,9,true);cs[1].value=row[1];A(cs[1],'right');T(cs[1],'1A1A1A',10);cs[2].value=row[2];A(cs[2],'center');T(cs[2],'666666',9);cs[3].value=row[3];A(cs[3],'left');N(cs[3]);T(cs[3],row[3]<0?RD:G1,10,true);cs[4].value=row[4]||'';A(cs[4],'center');T(cs[4],MQ,9,true);if(row[4])F(cs[4],LM);cr++;});wc.getRow(cr).height=28;MC(wc,'A'+cr,'C'+cr);wc.getCell('A'+cr).value='إجمالي '+cat.n;F(wc.getCell('A'+cr),G1);T(wc.getCell('A'+cr),B1,11,true);A(wc.getCell('A'+cr),'right');const tD=wc.getCell('D'+cr);tD.value={formula:'SUM(D6:D'+(cr-1)+')',result:cat.t};F(tD,G1);T(tD,B1,11,true);A(tD,'left');N(tD);F(wc.getCell('E'+cr),G1);af(wc,cr+2,'Legacy Fine Touch  |  '+cat.n+'  |  '+p.name,5);});
  const buf=await wb.xlsx.writeBuffer();const blob=new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Legacy_'+p.name.replace(/\s+/g,'_')+'.xlsx';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}




// ══════════════════════════════════════════════════
//  CATEGORY SYSTEM
// ══════════════════════════════════════════════════
let allCategories=[], catDDOpen=false;

async function loadCategories(){
  try{
    const fromDB=await sb('categories?order=name');
    const fromEnt=[...new Set(allEntries.filter(e=>e.type==='e').map(e=>e.category).filter(Boolean))];
    const combined=[...new Set([...fromDB.map(c=>c.name),...fromEnt])].sort();
    allCategories=combined;
  }catch(e){
    allCategories=[...new Set(allEntries.filter(e=>e.type==='e').map(e=>e.category).filter(Boolean))].sort();
  }
  renderCatOpts('');
}

function getProjectCats(q){
  // لو مفيش مشروع محدد، جيب من كل المشاريع
  const projEntries=curPid
    ? allEntries.filter(e=>e.project_id===curPid&&e.type==='e'&&e.category)
    : allEntries.filter(e=>e.type==='e'&&e.category);
  const freq={};
  projEntries.forEach(e=>{freq[e.category]=(freq[e.category]||0)+1;});
  let cats=Object.entries(freq).sort((a,b)=>b[1]-a[1]).map(([c,n])=>({c,n}));
  if(q)cats=cats.filter(x=>x.c.includes(q)||x.c.toLowerCase().includes(q.toLowerCase()));
  return cats;
}

function renderCatOpts(q){
  const list=document.getElementById('catList');if(!list)return;
  const cats=getProjectCats(q);
  let html='';
  if(cats.length){
    html+=cats.map(({c,n})=>`<div class="cat-opt" onclick="selectCat('${c.replace(/'/g,"\\'")}')">
      <span class="cat-icon">📂</span>
      <span style="flex:1">${c}</span>
      <span class="cat-freq-badge">${n}×</span>
    </div>`).join('');
  }
  // لو في نص مكتوب ومش موجود، اعرض "إضافة بند جديد"
  const typed=(document.getElementById('ic')?.value||'').trim();
  const exact=cats.some(x=>x.c===typed);
  if(typed&&!exact){
    html+=`<div class="cat-opt cat-opt-new" onclick="selectCat('${typed.replace(/'/g,"\\'")}')">
      <span class="cat-icon">➕</span>
      <span>إضافة: <b>${typed}</b></span>
    </div>`;
  }
  if(!html)html='<div class="cat-empty-msg">لا توجد بنود بعد<br><small>اكتب بند جديد وسيُضاف تلقائياً</small></div>';
  list.innerHTML=html;
}

function toggleCatDD(){
  catDDOpen=!catDDOpen;
  const dd=document.getElementById('catDD');
  if(!dd)return;
  dd.style.display=catDDOpen?'block':'none';
  document.getElementById('catArr').className='cat-arr'+(catDDOpen?' open':'');
  if(catDDOpen){
    const si=document.getElementById('catSrch');if(si){si.value='';si.focus();}
    renderCatOpts('');
  }
}

function hideCatDD(){
  catDDOpen=false;
  const dd=document.getElementById('catDD');if(dd)dd.style.display='none';
  const a=document.getElementById('catArr');if(a)a.className='cat-arr';
}

function onCatSearch(q){
  // افتح الـ dropdown تلقائي لما المستخدم يكتب
  if(!catDDOpen){
    catDDOpen=true;
    const dd=document.getElementById('catDD');
    if(dd)dd.style.display='block';
  }
  renderCatOpts(q);
}

function selectCat(name){
  document.getElementById('ic').value=name;
  hideCatDD();
  // لو بند جديد مش موجود في قاعدة البيانات، احفظه
  if(!allCategories.includes(name)){
    allCategories.push(name);
    allCategories.sort();
    sb('categories','POST',{name}).catch(()=>{});
  }
}

async function addNewCat(){
  let name=document.getElementById('ic').value.trim();
  if(!name)name=prompt('اسم البند الجديد:');
  if(!name||!name.trim())return;
  name=name.trim();
  try{
    await sb('categories','POST',{name});
  }catch(ex){console.error(ex);}
  if(!allCategories.includes(name)){allCategories.push(name);allCategories.sort();}
  selectCat(name);
  setSav('✅ تم إضافة البند: '+name,'ok');
}

// Close dropdown when clicking outside
document.addEventListener('click',function(e){
  const w=document.getElementById('catWrap');
  if(w&&!w.contains(e.target))hideCatDD();
});

// ══════════════════════════════════════════════════

function initRealtime(){
  if(!window.supabase)return;
  if(window._sbc)return; // already initialized
  try{
    window._sbc=window.supabase.createClient(SB,AK,{
      global:{headers:{'Authorization':'Bearer '+token}},
      realtime:{params:{eventsPerSecond:10}}
    });
    window._rtOk=false;
    // entries realtime
    if(_rtEntCh){_sbc.removeChannel(_rtEntCh);_rtEntCh=null;}
    _rtEntCh=_sbc.channel('entries-all')
      .on('postgres_changes',{event:'*',schema:'public',table:'entries'},async(payload)=>{
        window._rtOk=true;
        if(payload.new?.created_by===uid||payload.old?.project_id===curPid||payload.new?.project_id===curPid){
          await loadAllProjects();
          if(curPid)await loadEntries();
          if(curScreen==='dash')loadDashboard();
          else rp();
        }
      })
      .subscribe((s)=>{if(s==='SUBSCRIBED')window._rtOk=true;});
    // advances realtime
    if(_rtAdvCh){_sbc.removeChannel(_rtAdvCh);_rtAdvCh=null;}
    _rtAdvCh=_sbc.channel('advances-all')
      .on('postgres_changes',{event:'*',schema:'public',table:'advances'},async()=>{
        window._rtOk=true;
        if(curScreen==='adv')await loadAdvList();
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'advance_installments'},async()=>{
        window._rtOk=true;
        if(curScreen==='adv'&&curAdv)await loadAdvDetail(curAdv.id);
      })
      .subscribe();
  }catch(e){console.error(e);}
}

function cleanupRealtime(){
  if(!window._sbc)return;
  if(_rtEntCh){_sbc.removeChannel(_rtEntCh);_rtEntCh=null;}
  if(_rtAdvCh){_sbc.removeChannel(_rtAdvCh);_rtAdvCh=null;}
  window._rtOk=false;
}


