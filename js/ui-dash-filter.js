function initDashFilter(){
  const sel=document.getElementById('fProjSel');
  if(!sel)return;
  sel.innerHTML='<option value="all">كل المشاريع</option>';
  allProjects.forEach(p=>{
    sel.innerHTML+=`<option value="${p.id}">${esc(p.name)}</option>`;
  });
}

function parseDt(str){
  // unified: يقبل dd/mm/yyyy أو yyyy-mm-dd أو Excel serial
  if(!str||str==='—')return null;
  str=String(str).trim();
  if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)){const[d,m,y]=str.split('/');const dt=new Date(+y,+m-1,+d);return isNaN(dt)?null:dt;}
  if(/^\d{4}-\d{2}-\d{2}/.test(str)){const dt=new Date(str.substring(0,10));return isNaN(dt)?null:dt;}
  const num=parseFloat(str);
  if(!isNaN(num)&&num>40000&&num<60000){return new Date(Date.UTC(1899,11,30)+num*86400000);}
  const dt=new Date(str);
  return isNaN(dt)?null:dt;
}
function cleanDate(str){
  if(!str||str==='—')return '—';
  // dd/mm/yyyy
  if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str))return str;
  // yyyy-mm-dd
  if(/^\d{4}-\d{2}-\d{2}$/.test(str)){const[y,m,d]=str.split('-');return d+'/'+m+'/'+y;}
  // Excel serial number (e.g. 46156)
  const num=parseFloat(str);
  if(!isNaN(num)&&num>40000&&num<60000){
    const d=new Date(Date.UTC(1899,11,30)+num*86400000);
    if(!isNaN(d))return String(d.getUTCDate()).padStart(2,'0')+'/'+String(d.getUTCMonth()+1).padStart(2,'0')+'/'+d.getUTCFullYear();
  }
  // JS Date string (Thu May 14 2026...)
  const d=new Date(str);
  if(!isNaN(d))return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
  return str;
}

function runDashFilter(){
  const projId=document.getElementById('fProjSel').value;
  const fromStr=document.getElementById('fDateFrom').value;
  const toStr=document.getElementById('fDateTo').value;
  if(!fromStr&&!toStr){notify('اختار تاريخ على الأقل','warn');return;}

  const from=fromStr?parseDt(fromStr):null;
  const to=toStr?(()=>{const d=parseDt(toStr);if(d){d.setHours(23,59,59,999);}return d;})():null;

  // Filter entries
  let filtered=allEntries;
  if(projId!=='all')filtered=filtered.filter(e=>e.project_id===projId);
  if(from)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d>=from;});
  if(to)filtered=filtered.filter(e=>{const d=parseDt(e.entry_date);return d&&d<=to;});

  const inc=filtered.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=filtered.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  const bal=inc-exp;

  const projName=projId==='all'?'كل المشاريع':allProjectsMap[projId]?.name||'—';
  const period=(fromStr?fromStr:'بداية')+' → '+(toStr?toStr:'اليوم');

  const entriesSorted=[...filtered].sort((a,b)=>parseDt(b.entry_date)-parseDt(a.entry_date));

  const el=document.getElementById('dashFilterResult');
  el.style.display='block';
  el.innerHTML=`
    <div class="filter-result">
      <div class="filter-result-title">📊 ${projName} · ${period}</div>
      <div class="filter-kpis">
        <div class="fkpi"><div class="fkpi-lbl">وارد</div><div class="fkpi-val inc">▲ ${fn(inc)} ج</div></div>
        <div class="fkpi"><div class="fkpi-lbl">مصروف</div><div class="fkpi-val exp">▼ ${fn(exp)} ج</div></div>
        <div class="fkpi"><div class="fkpi-lbl">رصيد</div><div class="fkpi-val bal">${bal>=0?'+':''}${fn(bal)} ج</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <button class="filter-btn dl" onclick="downloadDashReport()" style="font-size:11px;padding:6px 14px">📥 Excel</button>
        <button class="filter-btn dl is30" onclick="downloadDashPDF()">📕 PDF</button>
        <span class="filter-count-badge">${filtered.length} قيد</span>
      </div>
      <div class="filter-entries">
        ${entriesSorted.map(e=>{
          const proj=allProjectsMap[e.project_id];
          return `<div class="fentry">
            <div class="fentry-type ${e.type}"></div>
            <div class="fentry-date">${cleanDate(e.entry_date)}</div>
            <div class="fentry-cat">${e.category||'—'}${proj&&projId==='all'?' · '+proj.name:''}</div>
            <div class="fentry-desc">${e.description||''}</div>
            <div class="fentry-amt ${e.type}">${e.type==='i'?'▲':'▼'} ${fn(e.amount)} ج</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  // Store for download
  window._lastFilterData={projName,period,filtered,inc,exp,bal};
}

function clearDashFilter(){
  document.getElementById('dashFilterResult').style.display='none';
  document.getElementById('fDateFrom').value='';
  document.getElementById('fDateTo').value='';
  document.getElementById('fProjSel').value='all';
  window._lastFilterData=null;
}

