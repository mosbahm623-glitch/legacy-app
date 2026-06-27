let _entFltActive=false;
// ██ ENTRIES FILTER ══════════════════════════════════
function applyEntryFilter(){
  _entFltActive=true;
  window._rpPage=0;
  re();
}
function clearEntryFilter(){
  document.getElementById('entFltText').value='';
  document.getElementById('entFltType').value='';
  document.getElementById('entFltFrom').value='';
  document.getElementById('entFltTo').value='';
  _entFltActive=false;
  window._rpPage=0;
  re();
}
function getFilteredEntries(){
  if(!_entFltActive)return null;
  const q=(document.getElementById('entFltText')?.value||'').toLowerCase().trim();
  const type=document.getElementById('entFltType')?.value||'';
  const fromRaw=document.getElementById('entFltFrom')?.value||'';
  const toRaw=document.getElementById('entFltTo')?.value||'';
  const parseD=s=>{if(!s)return null;const[d,m,y]=s.split('/');return new Date(+y,+m-1,+d);};
  const from=parseD(fromRaw);const to=parseD(toRaw);
  return entries.filter(e=>{
    if(type&&e.type!==type)return false;
    if(q&&!(e.description||'').toLowerCase().includes(q)&&!(e.contractor||'').toLowerCase().includes(q)&&!(e.category||'').toLowerCase().includes(q))return false;
    if(from||to){
      let ed=null;
      if(e.entry_date){const p=e.entry_date.includes('/')?e.entry_date.split('/'):null;ed=p?new Date(+p[2],+p[1]-1,+p[0]):new Date(e.entry_date);}
      if(ed){if(from&&ed<from)return false;if(to){const t=new Date(to);t.setHours(23,59,59);if(ed>t)return false;}}
    }
    return true;
  });
}

// ══════════════════════════════════════════
//  CONTRACTOR DUES TAB
// ══════════════════════════════════════════
let _duesList=[];
//  DUES SCREEN (شاشة المستحقات الشاملة)
// ══════════════════════════════════════════
let _allDues=[];
let _duesFilter='all';

function goToNotes(){showScreen('notes');}

// ══════════════════════════════════════════
//  NOTES SCREEN
// ══════════════════════════════════════════
let _notesFilter='all';
function tim(){const im=document.getElementById('im');im.style.display=im.style.display==='block'?'none':'block';sit(cT);}
function sit(t){imType=t;const imE=document.getElementById('imE');const imI=document.getElementById('imI');const imH=document.getElementById('imH');if(imE)imE.classList.toggle('on',t==='e');if(imI)imI.classList.toggle('on',t==='i');if(imH)imH.textContent=t==='e'?'الترتيب: المبلغ ⇥ البند ⇥ البيان ⇥ التاريخ ⇥ المقاول':'الترتيب: المبلغ ⇥ البيان ⇥ التاريخ';}

function triggerImport(){sit(cT);document.getElementById('xlsxFileInput').click();}

// ██ IMPORT PREVIEW ════════════════════════════════
let _pendingImportEnts=null;
// ██ ENTRIES — إضافة + تعديل + حذف ══════════════

function showImportPreview(ents,sk){
  _pendingImportEnts=ents;
  const modal=document.getElementById('importPreviewModal');
  const sub=document.getElementById('impPreviewSub');
  const table=document.getElementById('impPreviewTable');
  if(!modal)return;
  sub.textContent=ents.length+' قيد جاهز للإضافة'+(sk?' · تم تخطي '+sk+' صف':'');
  const isExp=ents[0]?.type==='e';
  const headers=isExp
    ?['#','النوع','المبلغ','البند','البيان','التاريخ','المقاول','المشروع']
    :['#','النوع','المبلغ','البيان','التاريخ','المشروع'];
  table.innerHTML=`<thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${
    ents.slice(0,100).map((e,i)=>{
      const proj=allProjectsMap[e.project_id];
      const typeCell=`<td><span style="padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;background:${e.type==='i'?'var(--success-glow)':'var(--danger-pale)'};color:${e.type==='i'?'var(--primary-btn)':'var(--danger)'}">${e.type==='i'?'▲ وارد':'▼ مصروف'}</span></td>`;
      const amtCell=`<td class="${e.type==='i'?'td-inc':'td-exp'}">${fn(e.amount)} ج</td>`;
      if(isExp)return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${esc(e.category)||'—'}</td><td>${esc(e.description)||'—'}</td><td>${e.entry_date||'—'}</td><td>${esc(e.contractor)||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
      return `<tr><td style="color:var(--text-hint)">${i+1}</td>${typeCell}${amtCell}<td>${esc(e.description)||'—'}</td><td>${e.entry_date||'—'}</td><td>${proj?.name||'—'}</td></tr>`;
    }).join('')
  }${ents.length>100?`<tr><td colspan="${headers.length}" style="text-align:center;padding:10px;color:var(--text-hint)">... و${ents.length-100} قيد آخر</td></tr>`:''}
  </tbody>`;
  modal.style.display='flex';
}

function closeImportPreview(){
  document.getElementById('importPreviewModal').style.display='none';
  _pendingImportEnts=null;
  const inp=document.getElementById('xlsxFileInput');
  if(inp)inp.value='';
}

async function confirmImport(){
  const ents=_pendingImportEnts;
  if(!ents||!ents.length)return;
  closeImportPreview();
  setSav('💾 جاري الاستيراد ('+ents.length+' قيد)...','ng');
  try{
    if(uRole==='admin'||uRole==='super_admin'||uRole==='editor'){
      const last=await sb('entries?select=seq&order=seq.desc&limit=1');
      let nextSeq=(last&&last.length?Number(last[0].seq||20260000):20260000);
      if(nextSeq<20260000)nextSeq=20260000;
      ents.forEach(e=>{nextSeq++;e.seq=nextSeq;e.created_by=uid;});
      await sb('entries','POST',ents);
      await loadEntries();
      allEntries=allEntries.filter(e=>e.project_id!==curPid).concat(entries);
      refreshProjSummary(curPid);
      setSav('✅ تم استيراد '+ents.length+' قيد','ok');
    }else{
      const pending=ents.map(e=>({...e,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()}));
      for(const p of pending){await sb('pending_entries','POST',p);}
      setSav('⏳ تم إرسال '+ents.length+' قيد للموافقة','ng');
      notify('⏳ تم إرسال '+ents.length+' قيد للموافقة من الأدمن','warn');
    }
    document.getElementById('imT')&&(document.getElementById('imT').value='');
    document.getElementById('im').style.display='none';
    rp();
  }catch(e){setSav('❌ '+friendlyError(e),'er');}
}

async function importFromXlsx(input){
  const file=input.files[0];
  if(!file)return;
  setSav('⏳ جاري قراءة الملف...','ng');
  if(!window.XLSX){
    await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
  }
  try{
    const buf=await file.arrayBuffer();
    const wb=XLSX.read(buf,{type:'array'});
    const sheetName=imType==='e'?'مصروفات':'وارد';
    const ws=wb.Sheets[sheetName]||wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
    const dataRows=rows.slice(3).filter(r=>r[0]&&!isNaN(parseFloat(String(r[0]).replace(/,/g,''))));
    if(!dataRows.length){setSav('⚠️ لا توجد بيانات في الملف','er');input.value='';return;}
    const ents=[];let sk=0;
    const projMap={};allProjects.forEach(p=>{projMap[p.name.trim().toLowerCase()]=p.id;});
    dataRows.forEach(r=>{
      const am=parseFloat(String(r[0]).replace(/,/g,''));
      if(isNaN(am)||am===0){sk++;return;}
      let dt='';
      if(r[3]){
        if(typeof r[3]==='number'){const d=XLSX.SSF.parse_date_code(r[3]);dt=`${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}`;}
        else{dt=String(r[3]).trim();}
      }
      let pid=curPid;
      if(r[5]){const pn=String(r[5]).trim().toLowerCase();if(projMap[pn])pid=projMap[pn];}
      if(imType==='e'){
        if(!r[1]||!String(r[1]).trim()){sk++;return;}
        ents.push({id:uid_(),project_id:pid,type:'e',amount:am,category:String(r[1]).trim(),description:String(r[2]||'').trim(),entry_date:pimd(dt)||dt,contractor:String(r[4]||'').trim()});
      }else{
        ents.push({id:uid_(),project_id:pid,type:'i',amount:am,description:String(r[1]||'دفعة').trim(),entry_date:pimd(dt)||dt,category:'',contractor:''});
      }
    });
    if(!ents.length){setSav('⚠️ لم يتم التعرف على أي قيد — تأكد إن عمود البند مش فاضي','er');input.value='';return;}
    input.value='';
    setSav('','ok');
    if(sk>0)notify('⚠️ تم تخطي '+sk+' صف — تأكد إن البند والمبلغ موجودين في كل صف','warn');
    showImportPreview(ents,sk);
  }catch(e){setSav('❌ '+friendlyError(e),'er');input.value='';}
}


