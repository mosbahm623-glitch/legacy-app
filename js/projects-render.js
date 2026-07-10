function rp(){
  // Rebuild sidebar project list
  const sc=document.getElementById('sb-proj-list');if(sc)sc.innerHTML='';
  buildSidebarProjects();
  const p=curP();
  const ps=document.getElementById('ps');ps.innerHTML='';
  if(!projects.length){ps.innerHTML='<option>لا توجد مشاريع</option>';document.getElementById('ent').innerHTML='<div class="emp">لا توجد مشاريع</div>';return;}
  projects.filter(pr=>!pr.archived).forEach(pr=>{const o=document.createElement('option');o.value=pr.id;o.textContent=pr.name;if(pr.id===curPid)o.selected=true;ps.appendChild(o);});
  if(p){document.getElementById('dst').value=p.start_date||'';document.getElementById('dcl').value=p.close_date||'';}
  const inc=pInc().reduce((s,e)=>s+e.amount,0),exp=pExp().reduce((s,e)=>s+e.amount,0),bal=inc-exp;
  const _pct=inc>0?Math.round((exp/inc)*100):0;
  const _pctCls=_pct<70?'kc-pct-ok':_pct<90?'kc-pct-warn':'kc-pct-danger';
  const _balCls=bal<0?'kc-neg':'kc-bal';
  const _balValCls=bal<0?'kv kv-neg':'kv kv-pos';
  const _balLbl=bal<0?'⚠ عجز':'الرصيد';
  (document.getElementById('kp')||{}).innerHTML=
    '<div class="kc kc-inc"><div class="kl">الوارد</div><div class="kv kv-inc">'+fn(inc)+'</div></div>'+
    '<div class="kc kc-exp"><div class="kl">المصروف <span class="kc-pct '+_pctCls+'">'+_pct+'%</span></div><div class="kv kv-exp">'+fn(exp)+'</div><div class="kc-bar"><div class="kc-bar-fill" style="width:'+Math.min(_pct,100)+'%"></div></div></div>'+
    '<div class="kc '+_balCls+'"><div class="kl">'+_balLbl+'</div><div class="'+_balValCls+'">'+fn(Math.abs(bal))+'</div></div>';
  // Old datalist (hidden but kept for compatibility)
  const _cl=document.getElementById('cl');if(_cl){const _allC=new Set([...(typeof _DEFAULT_CATS!=='undefined'?_DEFAULT_CATS:[]),...pExp().map(e=>e.category).filter(Boolean),...allEntries.map(e=>e.category).filter(Boolean)]);_cl.innerHTML=[..._allC].sort().map(c=>'<option value="'+c+'">').join('');}
  // Refresh categories list with project categories
  const projCats=[...new Set(pExp().map(e=>e.category).filter(Boolean))];
  projCats.forEach(c=>{if(!allCategories.includes(c))allCategories.push(c);});
  allCategories.sort();
  renderCatOpts('');
  const _ql=document.getElementById('ql');if(_ql)_ql.innerHTML=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x).map(q=>'<option value="'+q+'">').join('');
  const cs=[...new Set(pExp().map(e=>e.category))].filter(x=>x);
  const mqs=[...new Set(pExp().map(e=>e.contractor))].filter(x=>x);
  const tot=entries.length;
  const tabs=[['s','ملخص',0,''],['j','📒 يومية',tot,'jr'],['m','👷 مقاولين',mqs.length,'mq'],['dues','💰 مستحقات',0,''],['i','الوارد',pInc().length,'']];
  cs.forEach(c=>tabs.push([c,c,pExp().filter(e=>e.category===c).length,'']));
  _renderTabBtns(tabs);
  re();
}
function re(){
  const el=document.getElementById('ent');
  const isSuper=uRole==='super_admin'||uRole==='admin';
  const canEdit=isSuper||uRole==='editor';
  const canAdd=canEdit||uRole==='owner'||uRole==='viewer';
  if(cTab==='s'){
    const cs={};pExp().forEach(e=>{const cat=e.category||'بدون بند';cs[cat]=(cs[cat]||0)+e.amount;});
    const ls=Object.entries(cs).sort((a,b)=>b[1]-a[1]);
    const tt=ls.reduce((s,c)=>s+c[1],0);
    if(!ls.length){el.innerHTML='<div class="emp">لا توجد بيانات</div>';return;}
    const _dk=document.body.classList.contains('dark-mode');
    const _r0=_dk?'var(--dark-card,#1e2a1e)':'#fff';
    const _r1=_dk?'rgba(212,196,154,.04)':'#f7f7f5';
    const _brd=_dk?'rgba(212,196,154,.08)':'#e8e8e4';
    const _hov=_dk?'rgba(29,60,42,.3)':'#eef4ee';
    const _num=_dk?'rgba(212,196,154,.4)':'#999';
    const _txt=_dk?'var(--accent,#D4C49A)':'#222';
    const _bar=_dk?'rgba(212,196,154,.15)':'#eee';
    const _pct=_dk?'rgba(212,196,154,.5)':'#888';
    el.innerHTML=`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البند</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">النسبة</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">الإجمالي</th>
      </tr></thead>
      <tbody>
      ${ls.map(([c,a],i)=>{
        const pct=tt?((a/tt)*100).toFixed(1):0;
        const rowBg=i%2===0?_r0:_r1;
        return `<tr style="background:${rowBg};border-bottom:0.5px solid ${_brd};cursor:pointer" onclick="setCTab('${c.replace(/'/g,"\\'")}');re()" onmouseover="this.style.background='${_hov}'" onmouseout="this.style.background='${rowBg}'" title="اضغط لعرض قيود ${c}">
          <td style="padding:7px 10px;color:${_num};font-size:11px">${i+1}</td>
          <td style="padding:7px 10px;font-weight:500;color:${_txt}">${c}</td>
          <td style="padding:7px 10px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:${_bar};border-radius:4px;height:6px">
                <div style="width:${pct}%;background:#1D3C2A;border-radius:4px;height:6px"></div>
              </div>
              <span style="color:${_pct};font-size:11px;min-width:35px">${pct}%</span>
            </div>
          </td>
          <td style="padding:7px 10px;font-weight:500;color:var(--danger,#E74C3C);white-space:nowrap">▼ ${fn(a)} ج</td>
        </tr>`;
      }).join('')}
      <tr style="background:#1D3C2A">
        <td colspan="3" style="padding:8px 10px;color:#D4C49A;font-weight:500;font-size:11px">الإجمالي الكلي</td>
        <td style="padding:8px 10px;color:#D4C49A;font-weight:500;white-space:nowrap">▼ ${fn(tt)} ج</td>
      </tr>
      </tbody>
    </table>`;
    return;
  }
  if(cTab==='j'){const flt=getFilteredEntries();const j=flt?[...flt].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)):gJ();if(!j.length){el.innerHTML='<div class="emp">لا توجد قيود'+(flt?' للفلتر الحالي':' بعد')+'</div>';return;}
    const PAGE=60;const totalPages=Math.ceil(j.length/PAGE);
    const cp=window._rpPage||0;const start=cp*PAGE;const slice=j.slice(start,start+PAGE);
    const pager=totalPages>1?`<div class="pg-bar">${cp>0?`<button class="pg-btn" onclick="window._rpPage=${cp-1};re()">‹ السابق</button>`:''}
      <span class="pg-info">صفحة ${cp+1} / ${totalPages} (${j.length} قيد)</span>
      ${cp<totalPages-1?`<button class="pg-btn" onclick="window._rpPage=${cp+1};re()">التالي ›</button>`:''}</div>`:'';
    const isMob=window.innerWidth<=767;
    const tblRows=slice.map((e,i)=>{
      const ii=e.type==='i';
      const _advN=e.advance_id?(advances||[]).find(function(a){return a.id===e.advance_id;}):null;
      const ab=e.advance_id?'<span class="ab-badge">عهدة'+ (_advN&&_advN.name?' — '+_advN.name:'') +'</span> ':'';
      const catClr=ii?'background:#EAF3DE;color:#3B6D11':'background:#f0f0ec;color:#666';
      const catLbl=ii?'وارد':esc(e.category)||'—';
      const amtClr=ii?'#1D6A3E':'#C0392B';
      const balClr=e.bal<0?'#C0392B':e.bal>0?'#1D6A3E':'#888';
      // WhatsApp buttons
      const _ep=allProjectsMap[e.project_id]?.contractor_phones?.[e.contractor]||{};
      const wa1=_ep.p1?`<a href="https://wa.me/${_ep.p1}?text=${encodeURIComponent('مرحباً '+e.contractor+'، رقم القيد: '+(e.seq||''))}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 1</a>`:'';
      if(isMob){
        // MOBILE: card layout
        const delBtn=canEdit?`<button class="card-action card-del" onclick="event.stopPropagation();de('${e.id}')">🗑</button>`:'';
        return `<div class="entry-card" onclick="oe('${e.id}')">
          <div class="card-top">
            <span class="seq-badge">${e.seq||'?'}</span>
            <span class="card-date">${cleanDate(e.entry_date)||'—'}</span>
            <span class="card-amt" style="color:${amtClr}">${ii?'+':'-'}${fn(Math.abs(e.amount))} ج</span>
          </div>
          <div class="card-body">
            <span class="cat-pill" style="${catClr}">${catLbl}</span>
            ${e.advance_id?'<span class="adv-dot" title="عهدة"></span>':''}
            <span class="card-desc">${esc(e.description)||'—'}</span>
          </div>
          <div class="bal-row">
            <span style="font-size:11px;color:#aaa">رصيد</span>
            <span style="font-size:12px;font-weight:700;color:${balClr}">${fn(e.bal)} ج</span>
          </div>
          <div class="card-footer">
            <button class="card-action" onclick="event.stopPropagation();printReceipt('${e.id}')">🖨 إيصال</button>
            ${e.img_url?`<button class="card-action" onclick="event.stopPropagation();openEntryInvLb('${e.id}')" style="background:#EAF3DE;border-color:#97C459;color:#27500A;font-weight:700">🧾 فاتورة</button>`:''}
            ${wa1?`<button class="card-action card-wa" onclick="event.stopPropagation();window.open('${wa1.match(/href="([^"]+)"/)?.[1]||''}','_blank')">📲 واتساب</button>`:''}
            ${delBtn}
          </div>
        </div>`;
      }
      // DESKTOP: table row
      const rcpt=`<td style="padding:4px 6px;text-align:center"><button onclick="event.stopPropagation();printReceipt('${e.id}')" title="إيصال" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:11px;padding:3px 8px;color:#27500A;font-weight:600">🖨</button></td>`;
      const invTd=e.img_url
        ?`<td style="padding:4px 6px;text-align:center"><button onclick="event.stopPropagation();openEntryInvLb('${e.id}')" title="عرض الفاتورة" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 7px;color:#27500A;font-weight:700">🧾</button></td>`
        :`<td style="padding:4px 6px;text-align:center"><span style="display:inline-block;width:20px;height:20px;border:0.5px dashed #ccc;border-radius:4px"></span></td>`;
      const del=canEdit?`<td style="padding:4px 6px;text-align:center"><button class="db" onclick="event.stopPropagation();de('${e.id}')">🗑</button></td>`:'';
      const undoBtn=(uRole==='admin'||uRole==='super_admin')?`<td style="padding:4px 6px;text-align:center"><button onclick="event.stopPropagation();undoApproveEntry('${e.id}')" title="إلغاء الموافقة" style="background:var(--warning-pale,#FFF8EC);border:0.5px solid #EF9F27;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 7px;color:#854F0B">↩</button></td>`:'';
      const isDk=document.body.classList.contains('dark-mode');
      const rowBg=isDk?(i%2===0?'var(--dark-alt)':'var(--dark-mid)'):(i%2===0?'#fff':'#f7f7f5');
      const hoverBg=isDk?'rgba(255,255,255,.06)':'#eef4ee';
      const _numClr=isDk?'rgba(212,196,154,.4)':'#999';
      const _softClr=isDk?'rgba(212,196,154,.5)':'#888';
      const _bodyClr=isDk?'var(--accent,#D4C49A)':'#222';
      const _pillBrd=isDk?'rgba(212,196,154,.2)':'#ddd';
      return `<tr style="background:${rowBg};border-bottom:0.5px solid ${isDk?'rgba(212,196,154,.08)':'#e8e8e4'};cursor:pointer" onclick="oe('${e.id}')" onmouseover="this.style.background='${hoverBg}'" onmouseout="this.style.background='${rowBg}'">
        <td style="padding:7px 10px;color:${_numClr};font-size:11px">${i+1+start}</td>
        <td style="padding:7px 10px;white-space:nowrap"><span class="nb" style="font-size:10px">${e.seq||'?'}</span></td>
        <td style="padding:7px 10px;white-space:nowrap;color:${_softClr};font-size:11px">${cleanDate(e.entry_date)||'—'}</td>
        <td style="padding:7px 10px"><span style="font-size:10px;border:0.5px solid ${_pillBrd};padding:2px 7px;border-radius:10px;${catClr}">${catLbl}</span></td>
        <td style="padding:7px 10px;color:${_bodyClr};max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(e.description)||'—'}">${ab}${esc(e.description)||'—'}</td>
        <td style="padding:7px 10px;white-space:nowrap;color:${_softClr};font-size:11px">${esc(e.contractor)||'—'}</td>
        <td style="padding:7px 10px;white-space:nowrap;font-weight:500;color:${amtClr}">${ii?'+':'-'}${fn(Math.abs(e.amount))} ج</td>
        ${rcpt}${invTd}${del}${undoBtn}
      </tr>`;
    }).join('');
    if(isMob){
      el.innerHTML=pager+`<div class="card-list">${tblRows}</div>`+pager;
      return;
    }
    el.innerHTML=pager+`<table style="width:100%;border-collapse:collapse;font-size:12px;display:table">
      <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">#</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">رقم القيد</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">التاريخ</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البند</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">البيان</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500">المقاول</th>
        <th style="color:#D4C49A;padding:8px 10px;text-align:right;font-size:11px;font-weight:500;white-space:nowrap">المبلغ</th>
        <th style="color:#D4C49A;padding:8px 6px;text-align:center;font-size:11px;font-weight:500">🖨</th>
        <th style="color:#D4C49A;padding:8px 6px;text-align:center;font-size:11px;font-weight:500">📎</th>
        ${canEdit?'<th></th>':''}
        ${(typeof uRole!=='undefined'&&(uRole==='admin'||uRole==='super_admin'))?'<th></th>':''}
      </tr></thead>
      <tbody>${tblRows}</tbody>
    </table>`+pager;return;}
  if(cTab==='m'){
    const mqMap={};
    pExp().filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={n:e.contractor,pay:0,work:0,mat:0,other:0,rows:[]};
      const m=mqMap[e.contractor];
      if(e.entry_type==='payment')m.pay+=e.amount;
      else if(e.entry_type==='work')m.work+=e.amount;
      else if(e.entry_type==='material')m.mat+=e.amount;
      else m.other+=e.amount;
      m.rows.push(e);
    });
    const mqs=Object.values(mqMap).sort((a,b)=>(b.pay+b.work+b.mat+b.other)-(a.pay+a.work+a.mat+a.other));
    if(!mqs.length){el.innerHTML='<div class="emp">لا يوجد مقاولين بعد</div>';return;}
    window._mqList=mqs;
    el.innerHTML=mqs.map((m,idx)=>{
      const rem=m.pay-(m.work+m.mat);
      const hasTypes=m.rows.some(e=>e.entry_type);
      const addBtn=canEdit?`<button onclick="event.stopPropagation();mqAddByIdx(${idx})" class="mq-add-btn">+ قيد</button>`:'';
      const printBtn=`<button onclick="event.stopPropagation();mqPrintReport(${idx})" class="mq-print-btn">🖨️ تقرير</button>`;
      const _mqPhones=(allProjectsMap[curPid]?.contractor_phones||{})[m.n]||{};
      const _ph1=_mqPhones.p1||'';const _ph2=_mqPhones.p2||'';
      const phonesBadge=_ph1
        ?`<span style="font-size:10px;background:var(--success-ghost);color:var(--primary-btn);padding:1px 7px;border-radius:8px;margin-right:4px">📱 رقمان</span>`
        :`<span style="font-size:10px;background:var(--warning-faint);color:var(--warning-dark);padding:1px 7px;border-radius:8px;margin-right:4px">لا يوجد رقم</span>`;
      const phoneBtn=canEdit?`<button onclick="event.stopPropagation();mqEditPhones('${m.n.replace(/'/g,"\'")}','${_ph1}','${_ph2}')" class="mq-print-btn">📱 الأرقام</button>`:'';
      const _isDk=document.body.classList.contains('dark-mode');
      const _r0=_isDk?'var(--dark-card,#1A2A1A)':'#fff';
      const _r1=_isDk?'rgba(212,196,154,.04)':'#f7f7f5';
      const _brd=_isDk?'rgba(212,196,154,.08)':'#e8e8e4';
      const _hov=_isDk?'rgba(212,196,154,.07)':'#eef4ee';
      const _txt=_isDk?'var(--accent,#D4C49A)':'#1D2A1D';
      const _sub=_isDk?'rgba(212,196,154,.4)':'#999';
      const rows=m.rows.sort((a,b)=>pdt(b.entry_date)-pdt(a.entry_date)).map((e,_ri)=>{
        const etLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
        const etBg={'payment':'#EAF3DE','work':'#E6F1FB','material':'#FAEEDA'};
        const etC={'payment':'#27500A','work':'#0C447C','material':'#633806'};
        const tag=e.entry_type?`<span style="background:${etBg[e.entry_type]};color:${etC[e.entry_type]};padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600">${etLbl[e.entry_type]||e.entry_type}</span>`:'';
        const del=canEdit?`<button class="db" onclick="event.stopPropagation();de('${e.id}')">🗑</button>`:'';
        const rcptBtn=`<button onclick="event.stopPropagation();printReceipt('${e.id}')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500">إيصال</button>`;
        const _ep=(allProjectsMap[e.project_id]?.contractor_phones||{})[e.contractor]||{};
        const _wa1=_ep.p1?`<a href="https://wa.me/${_ep.p1}?text=${encodeURIComponent('مرحباً '+e.contractor+'، نفيدكم بصرف مبلغ '+fn(Math.abs(e.amount))+' ج\nالمشروع: '+(allProjectsMap[e.project_id]?.name||'')+'\nرقم القيد: '+(e.seq||''))}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;background:#25D366;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 1</a>`:'';
        const _wa2=_ep.p2?`<a href="https://wa.me/${_ep.p2}?text=${encodeURIComponent('مرحباً '+e.contractor+'، نفيدكم بصرف مبلغ '+fn(Math.abs(e.amount))+' ج\nالمشروع: '+(allProjectsMap[e.project_id]?.name||'')+'\nرقم القيد: '+(e.seq||''))}" target="_blank" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:3px;background:#128C7E;color:#fff;padding:3px 8px;border-radius:5px;text-decoration:none;font-size:10px;font-weight:500">📲 2</a>`:'';
        const _rb=_ri%2===0?_r0:_r1;
        return `<tr style="background:${_rb};border-bottom:0.5px solid ${_brd};cursor:pointer;transition:background .1s" onclick="oe('${e.id}')" onmouseover="this.style.background='${_hov}'" onmouseout="this.style.background='${_rb}'">
          <td style="padding:7px 10px;white-space:nowrap"><span class="nb" style="font-size:10px">${e.seq||'?'}</span></td>
          <td style="padding:7px 10px">
            <div style="font-size:12px;color:${_txt};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:320px">${esc(e.description)||'—'}</div>
            <div style="font-size:10px;color:${_sub};margin-top:2px">${cleanDate(e.entry_date)||'—'}</div>
          </td>
          <td style="padding:7px 8px;white-space:nowrap">${tag}</td>
          <td style="padding:7px 10px;font-weight:600;color:var(--danger,#C0392B);white-space:nowrap;text-align:center">${fn(e.amount)} ج</td>
          <td style="padding:7px 6px;white-space:nowrap;text-align:center">${_wa1}${_wa2}</td>
          <td style="padding:7px 6px;white-space:nowrap;text-align:center">${rcptBtn}</td>
          ${canEdit?`<td style="padding:7px 4px;text-align:center">${del}</td>`:''}
        </tr>`;
      }).join('');
      const kpis=hasTypes?`<div class="mq-kpi-grid"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">${fn(m.pay)}</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">${fn(m.work)}</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">${fn(m.mat)}</div></div><div style="background:${rem>=0?'var(--success-ghost)':'var(--danger-ghost)'};border-radius:8px;padding:8px;text-align:center"><div class="lbl-sm">${rem>=0?'الباقي معاه':'مستحق عليك'}</div><div style="font-weight:900;color:${rem>=0?'var(--primary)':'var(--danger)'};font-size:13px">${fn(Math.abs(rem))}</div></div></div>`:`<div class="mq-total-row"><span style="color:var(--text-soft);font-size:12px">إجمالي المسحوب</span><span style="font-weight:700;color:var(--primary-btn,#1D3C2A)">${fn(m.pay+m.work+m.mat+m.other)} ج</span></div>`;
      const _isDkW=document.body.classList.contains('dark-mode');
      const _cardBg=_isDkW?'var(--dark-card,#1A2A1A)':'#fff';
      const _brdW=_isDkW?'rgba(212,196,154,.12)':'#e8e8e4';
      const _ftBg=_isDkW?'rgba(212,196,154,.05)':'#f9f9f7';
      const _ftTxt=_isDkW?'var(--accent,#D4C49A)':'#1D3C2A';
      const _totAmt=m.pay+m.work+m.mat+m.other;
      return `<div class="mq-contractor-card" style="background:${_cardBg};border:0.5px solid ${_brdW}"><div class="mq-card-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'"><div class="mq-card-header-inner"><span class="mq-card-name">👷 ${m.n} ${phonesBadge}</span><div style="display:flex;gap:6px;align-items:center">${printBtn}${phoneBtn}${addBtn}<span class="mq-card-count">${m.rows.length} قيد ▼</span></div></div></div><div style="padding:12px 14px">${kpis}<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px;direction:rtl">
        <thead><tr style="background:#1D3C2A">
          <th style="color:#D4C49A;padding:7px 10px;font-size:11px;font-weight:500;text-align:right;white-space:nowrap">رقم القيد</th>
          <th style="color:#D4C49A;padding:7px 10px;font-size:11px;font-weight:500;text-align:right">البيان</th>
          <th style="color:#D4C49A;padding:7px 8px;font-size:11px;font-weight:500;text-align:right;white-space:nowrap">النوع</th>
          <th style="color:#D4C49A;padding:7px 10px;font-size:11px;font-weight:500;text-align:center;white-space:nowrap">المبلغ</th>
          <th style="color:#D4C49A;padding:7px 6px;font-size:11px;font-weight:500;text-align:center">واتساب</th>
          <th style="color:#D4C49A;padding:7px 6px;font-size:11px;font-weight:500;text-align:center">إيصال</th>
          ${canEdit?'<th style="color:#D4C49A;padding:7px 4px"></th>':''}
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:${_ftBg}">
          <td colspan="3" style="padding:8px 10px;font-size:11px;font-weight:600;color:${_ftTxt}">إجمالي المسحوب — ${m.rows.length} قيود</td>
          <td style="padding:8px 10px;font-size:12px;font-weight:700;color:var(--danger,#C0392B);text-align:center">${fn(_totAmt)} ج</td>
          <td colspan="${canEdit?3:2}"></td>
        </tr></tfoot>
      </table></div></div></div>`;
    }).join('');
    return;
  }
  if(cTab==='dues'){loadDuesTab(el);return;}
  let es=cTab==='i'?pInc():pExp().filter(e=>e.category===cTab);
  es=[...es].sort((a,b)=>(b.seq||0)-(a.seq||0));
  if(!es.length){el.innerHTML='<div class="emp">لا توجد قيود</div>';return;}
  const hasMqTypes=es.some(e=>e.contractor&&e.entry_type);
  const etypeLbl={'payment':'💰 دفعة','work':'🔨 أعمال','material':'🔩 مصنعيات'};
  let html='';
  if(hasMqTypes){
    html+=`<div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="setCatView('list',this)" class="cat-view-list-btn" id="cvList">📋 القيود</button>
      <button onclick="setCatView('mq',this)" class="cat-view-mq-btn" id="cvMq">👷 المقاولين</button>
    </div><div id="catListView">`;
  }
  html+=`<div style="overflow-x:hidden;width:100%"><table style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed">
    <colgroup>
      <col style="width:34px">
      <col style="width:76px">
      <col style="width:auto">
      <col style="width:82px">
      <col style="width:34px">
      ${canEdit?'<col style="width:30px">':''}
    </colgroup>
    <thead style="position:sticky;top:0;z-index:10"><tr style="background:#1D3C2A">
      <th style="color:#D4C49A;padding:8px 6px;text-align:center;font-weight:500;font-size:11px">🖨</th>
      <th style="color:#D4C49A;padding:8px 6px;text-align:right;font-weight:500;font-size:11px">رقم القيد</th>
      <th style="color:#D4C49A;padding:8px 6px;text-align:right;font-weight:500;font-size:11px">البيان</th>
      <th style="color:#D4C49A;padding:8px 6px;text-align:left;font-weight:500;font-size:11px">المبلغ</th>
      <th style="color:#D4C49A;padding:8px 4px;text-align:center;font-weight:500;font-size:11px">📎</th>
      ${canEdit?'<th style="color:#D4C49A;padding:8px 4px;text-align:center;font-weight:500;font-size:11px">🗑</th>':''}
    </tr></thead>
    <tbody>
    ${es.map((e,i)=>{
      const _advN=e.advance_id?(advances||[]).find(function(a){return a.id===e.advance_id;}):null;
      const ab=e.advance_id?'<span class="ab-badge">عهدة'+ (_advN&&_advN.name?' — '+_advN.name:'') +'</span> ':'';
      const no=`<span class="nb" style="font-size:10px">${e.seq||'?'}</span>`;
      const rcpt=`<td style="padding:4px 4px;text-align:center"><button onclick="event.stopPropagation();printReceipt('${e.id}')" title="إيصال" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 5px;color:#27500A;font-weight:500">🖨</button></td>`;
      const del=canEdit?`<td style="padding:4px 4px;text-align:center"><button class="db" onclick="event.stopPropagation();de('${e.id}')">🗑</button></td>`:'';
      const _dk2=document.body.classList.contains('dark-mode');
      const rowBg=_dk2?(i%2===0?'var(--dark-card,#1e2a1e)':'rgba(212,196,154,.04)'):(i%2===0?'#fff':'#f7f7f5');
      const _brd2=_dk2?'rgba(212,196,154,.08)':'#e8e8e4';
      const _hov2=_dk2?'rgba(212,196,154,.06)':'#eef4ee';
      const _txt2=_dk2?'var(--accent,#D4C49A)':'#222';
      const amtColor=e.type==='i'?'var(--primary-btn,#1D6A3E)':'var(--danger,#C0392B)';
      return `<tr style="background:${rowBg};border-bottom:0.5px solid ${_brd2};cursor:pointer" onclick="oe('${e.id}')" onmouseover="this.style.background='${_hov2}'" onmouseout="this.style.background='${rowBg}'">
        <td style="padding:4px 4px;text-align:center"><button onclick="event.stopPropagation();printReceipt('${e.id}')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:13px;padding:3px 5px;color:#27500A;">🖨</button></td>
        <td style="padding:7px 4px">${no}</td>
        <td style="padding:7px 6px;color:${_txt2};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ab}${esc(e.description)||'—'}</td>
        <td style="padding:7px 4px;font-weight:600;color:${amtColor};text-align:left;white-space:nowrap">${e.type==='i'?'+':'-'}${fn(Math.abs(e.amount))} ج</td>
        <td style="padding:4px 4px;text-align:center">${e.img_url
          ?`<button onclick="event.stopPropagation();openEntryInvLb('${e.id}')" title="عرض الفاتورة" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:11px;padding:2px 7px;color:#27500A;font-weight:700">🧾</button>`
          :`<span style="display:inline-block;width:18px;height:18px;border:0.5px dashed #ccc;border-radius:3px"></span>`
        }</td>
        ${del}
      </tr>`;
    }).join('')}
    </tbody>
  </table></div>`;
  if(hasMqTypes){
    html+='</div><div id="catMqView" style="display:none">';
    const mqMap={};
    es.filter(e=>e.contractor).forEach(e=>{
      if(!mqMap[e.contractor])mqMap[e.contractor]={pay:0,work:0,mat:0,rows:[]};
      if(e.entry_type==='payment')mqMap[e.contractor].pay+=e.amount;
      else if(e.entry_type==='work')mqMap[e.contractor].work+=e.amount;
      else if(e.entry_type==='material')mqMap[e.contractor].mat+=e.amount;
      mqMap[e.contractor].rows.push(e);
    });
    html+=Object.entries(mqMap).map(([name,d])=>{
      const rem=d.pay-(d.work+d.mat);
      const rows=d.rows.map(e=>{
        const et=etypeLbl[e.entry_type]||'—';
        const etC=e.entry_type==='payment'?'var(--primary-btn)':e.entry_type==='work'?'var(--info)':'var(--warning-dark)';
        const etBg=e.entry_type==='payment'?'var(--success-pale)':e.entry_type==='work'?'var(--info-bg)':'var(--warning-pale)';
        const _dkMq=document.body.classList.contains('dark-mode');
        const _mqTxt=_dkMq?'var(--accent,#D4C49A)':'#444';
        const _mqAmt=_dkMq?'rgba(212,196,154,.8)':'#555';
        return '<div class="mq-entry-row"><span class="mq-entry-type">'+et+'</span><span style="flex:1;color:'+_mqTxt+'">'+(e.description||'—')+'</span><span style="font-weight:700;color:'+_mqAmt+'">'+fn(e.amount)+' ج</span></div>';
      }).join('');
      return '<div class="mq-grouped-card"><div class="mq-grouped-header"><span class="mq-grouped-name">👷 '+name+'</span></div><div style="padding:12px 14px"><div class="mq-grouped-kpis"><div class="kpi-inc"><div class="lbl-sm">💰 دفعات</div><div class="kpi-val-inc">'+fn(d.pay)+'</div></div><div class="kpi-work"><div class="lbl-sm">🔨 أعمال</div><div class="kpi-val-work">'+fn(d.work)+'</div></div><div class="kpi-mat"><div class="lbl-sm">🔩 مصنعيات</div><div class="kpi-val-mat">'+fn(d.mat)+'</div></div></div><div class="mq-grouped-balance"><span style="font-size:12px;color:#666">الباقي معاه</span><span class="mq-grouped-balance-val">'+fn(rem)+' ج</span></div>'+rows+'</div></div>';
    }).join('');
    html+='</div>';
  }
  el.innerHTML=html;
}

// ADVANCES

function _renderTabBtns(tabs) {
  const el = document.getElementById('tbs');
  if (!el) return;
  const html = tabs.map(function(t) {
    const isActive = t[0] === cTab;
    const cls = 'tab' + (isActive ? ' on' : '') + (t[3] ? ' ' + t[3] : '');
    const cnt = t[2] > 0 ? '<span class="c">' + t[2] + '</span>' : '';
    const isCat = ['s','j','m','dues','i'].indexOf(t[0]) === -1;
    const pid = typeof curPid !== 'undefined' ? curPid : '';
    const printBtn = isCat
      ? '<button class="cat-print-btn" data-cat="' + encodeURIComponent(t[0]) + '" data-pid="' + encodeURIComponent(pid) + '" data-lbl="' + encodeURIComponent(t[1]) + '" title="طباعة بند" style="background:transparent;border:1px solid #1D3C2A;border-radius:8px;padding:3px 6px;cursor:pointer;font-size:11px;color:#1D3C2A;margin-left:2px;vertical-align:middle;font-family:inherit">🖨</button>'
      : '';
    const tabBtn = '<button class="' + cls + '" onclick="stab(\'' + t[0].replace(/\\/g, '\\\\').replace(/'/g, "\\'") + '\')">' + t[1] + cnt + '</button>';
    return tabBtn + printBtn;
  }).join('');
  el.innerHTML = html;
}

document.addEventListener('click', function(e) {
  const btn = e.target.closest('.cat-print-btn');
  if (!btn) return;
  e.stopPropagation();
  const cat = decodeURIComponent(btn.dataset.cat || '');
  const pid = decodeURIComponent(btn.dataset.pid || '');
  const lbl = decodeURIComponent(btn.dataset.lbl || cat);
  if (typeof printCategoryPDF === 'function') printCategoryPDF(cat, pid, lbl);
});
