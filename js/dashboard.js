function renderMqManager(q){
  const list=document.getElementById('mqMgrList');if(!list)return;
  const freq={};
  allEntries.filter(e=>e.contractor).forEach(e=>{
    if(!freq[e.contractor])freq[e.contractor]={count:0,projects:new Set()};
    freq[e.contractor].count++;
    freq[e.contractor].projects.add(e.project_id);
  });
  let mqs=Object.entries(freq).sort((a,b)=>b[1].count-a[1].count);
  if(q)mqs=mqs.filter(([name])=>name.includes(q)||name.toLowerCase().includes(q.toLowerCase()));
  if(!mqs.length){list.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-hint)">لا يوجد مقاولين</div>';return;}
  list.innerHTML=mqs.map(([name,data])=>{
    const projNames=data.projects.size+' مشروع';
    const safeName=esc(name);
    return '<div class="mq-mgr-item">'+
      '<span class="mq-mgr-ico">👷</span>'+
      '<div style="flex:1;min-width:0">'+
        '<div class="mq-mgr-name">'+safeName+'</div>'+
        '<div class="mq-mgr-meta">'+data.count+' قيد · '+projNames+'</div>'+
      '</div>'+
      '<button class="mq-mgr-btn" data-mq="'+safeName+'" onclick="renameMq(this.dataset.mq)">✏️ تعديل الاسم</button>'+
    '</div>';
  }).join('');
}
async function _doRenameMq(oldName,newName){
  if(newName===oldName)return;
  const toUpdate=allEntries.filter(e=>e.contractor===oldName);
  if(!toUpdate.length)return;
  notify('⏳ جاري التحديث على '+toUpdate.length+' قيد...','info');
  let done=0;
  for(const e of toUpdate){
    try{
      await sb('entries?id=eq.'+e.id,'PATCH',{contractor:newName});
      e.contractor=newName;
      done++;
    }catch(err){console.error(err);notify('❌ فشل تحديث قيد: '+friendlyError(err),'err');}
  }
  notify('✅ تم تحديث '+done+' قيد','ok');
  renderMqManager(document.getElementById('mqMgrSearch')?.value||'');
}
function renameMq(oldName){
  showPromptModal({title:'✏️ تعديل اسم المقاول',label:'الاسم الجديد',defaultVal:oldName,okLabel:'حفظ',onOk:(newName)=>{_doRenameMq(oldName,newName);}});
}

async function loadDashboard(){
// ██ DASHBOARD ══════════════════════════════════════
  try{
    setSav('⏳ جاري تحميل الداشبورد...','ng');
    loadNotes();
    // Welcome
    const nameEl=document.getElementById('dWelcomeName');
    const dateEl=document.getElementById('dWelcomeDate');
    if(nameEl)nameEl.textContent=uName||'—';
    if(dateEl){
      const now=new Date();
      const days=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      dateEl.textContent=`${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
    }

    const [allAdvances,_allInstallments,_liveSummaries,_advEntries]=await Promise.all([
      sb('advances?status=eq.open'),
      sb('advance_installments?order=created_at'),
      sb('project_summaries?select=project_id,inc,exp'),
      sb('entries?advance_id=not.is.null&select=advance_id,amount')
    ]);
    allInstallments=_allInstallments;

    // حساب الإجماليات — من Supabase مباشرة لضمان الدقة اللحظية
    let totalInc=0,totalExp=0;
    _liveSummaries.forEach(s=>{
      totalInc+=parseFloat(s.inc)||0;
      totalExp+=parseFloat(s.exp)||0;
    });
    let totalAdv=0;
    allAdvances.forEach(a=>{
      const inst=_allInstallments.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=_advEntries.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      totalAdv+=(inst-spent);
    });

    // إجمالي المستحقات غير المدفوعة
    let totalDues=0;
    try{
      const dues=await sb('contractor_dues?status=eq.unpaid&select=amount');
      totalDues=dues.reduce((s,d)=>s+d.amount,0);
    }catch(_){}

    const bal=totalInc-totalExp-totalAdv+totalDues;

    // تصنيف المشاريع
    let excellent=0,needFollow=0,critical=0;
    allProjects.forEach(p=>{
      const s=projSummaries[p.id]||{inc:0,exp:0};
      const pct=s.inc>0?Math.round((s.exp/s.inc)*100):0;
      if(s.inc===0||pct>90)critical++;
      else if(pct>70)needFollow++;
      else excellent++;
    });

    // KPI cards
    const setKpi=(id,val,trend)=>{
      const el=document.getElementById(id);
      if(el)el.textContent=val;
      const tr=document.getElementById(id+'Trend');
      if(tr&&trend)tr.innerHTML=trend;
    };
    setKpi('dInc',fn(totalInc)+' ج');
    setKpi('dExp',fn(totalExp)+' ج');
    const balEl=document.getElementById('dBal');
    if(balEl){balEl.textContent=(bal>=0?'+':'')+fn(bal)+' ج';balEl.className='d-kpi-val net'+(bal<0?' exp':'');}
    setKpi('dAdv',fn(totalAdv)+' ج');
    setKpi('dDues',fn(totalDues)+' ج');

    setKpi('dProjActive',allProjects.length+' مشروع');
    setKpi('dProjWarn',needFollow+critical);

    // ملخص حالة المشاريع - Donut
    const statusList=document.getElementById('dProjStatusList');
    if(statusList){
      statusList.innerHTML=[
        {lbl:'ممتازة',val:excellent,color:'var(--success-light)'},
        {lbl:'تحتاج متابعة',val:needFollow,color:'var(--accent-gold)'},
        {lbl:'متعثرة',val:critical,color:'var(--danger-pop)'}
      ].map(s=>`<div class="d-psl-item">
        <span class="d-psl-dot" style="background:${s.color}"></span>
        <span class="d-psl-lbl">${s.lbl}</span>
        <span class="d-psl-val">${s.val}</span>
      </div>`).join('');
    }
    // Donut Chart
    const donutCanvas=document.getElementById('dDonutChart');
    if(donutCanvas&&window.Chart){
      if(donutCanvas._chartInst)donutCanvas._chartInst.destroy();
      donutCanvas._chartInst=new Chart(donutCanvas,{
        type:'doughnut',
        data:{
          labels:['ممتازة','تحتاج متابعة','متعثرة'],
          datasets:[{data:[excellent||0,needFollow||0,critical||0],backgroundColor:['#1D9E75','#D4C49A','#EB5757'],borderWidth:0,hoverOffset:4}]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{rtl:true}},
          cutout:'70%'
        }
      });
    }

    // التنبيهات
    const alerts=[];
    allProjects.forEach(p=>{
      const s=projSummaries[p.id]||{inc:0,exp:0};
      const pct=s.inc>0?Math.round((s.exp/s.inc)*100):0;
      if(s.inc>0&&pct>90)alerts.push({type:'red',ico:'🚨',title:'مشروع تجاوز الميزانية',sub:p.name+' — تجاوز '+pct+'%',pid:p.id});
      else if(s.inc>0&&pct>70)alerts.push({type:'yellow',ico:'⚠️',title:'مشروع يحتاج متابعة',sub:p.name+' — صرف '+pct+'%',pid:p.id});
    });
    allAdvances.forEach(a=>{
      const inst=allInstallments.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allEntries.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      const rem=inst-spent;
      if(rem<0)alerts.push({type:'red',ico:'💼',title:'عهدة بها عجز',sub:a.person_name+' — عجز '+fn(Math.abs(rem))+' ج'});
    });
    if(bal<0)alerts.push({type:'red',ico:'📉',title:'رصيد النقدية سالب',sub:'صافي: '+fn(bal)+' ج'});
    const alertsList=document.getElementById('dAlertsList');
    const alertCount=document.getElementById('dAlertCount');
    if(alertCount)alertCount.textContent=alerts.length||'';
    if(alertCount)alertCount.style.display=alerts.length?'':'none';
    if(alertsList){
      alertsList.innerHTML=alerts.length?alerts.slice(0,6).map(a=>`
        <div class="d-alert-item alert-${a.type}" ${a.pid?`onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${a.pid}';sw('${a.pid}');},100)" style="cursor:pointer"`:''}>
          <span class="d-alert-ico">${a.ico}</span>
          <div class="d-alert-body">
            <div class="d-alert-title">${a.title}</div>
            <div class="d-alert-sub">${a.sub}</div>
          </div>
          ${a.pid?'<span style="font-size:10px;opacity:.4">←</span>':''}
        </div>`).join(''):'<div class="d-empty">✅ لا توجد تنبيهات</div>';
    }

    // آخر الحركات
    const txnList=document.getElementById('dTxnList');
    if(txnList){
      const recent=[...allEntries].sort((a,b)=>(b.seq||0)-(a.seq||0)).slice(0,8);
      txnList.innerHTML=recent.map(e=>{
        const proj=allProjectsMap[e.project_id];
        const ii=e.type==='i';
        return `<div class="d-txn-item" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${e.project_id}';sw('${e.project_id}');},100)" style="cursor:pointer">
          <span class="d-txn-dot ${ii?'inc':'exp'}"></span>
          <div class="d-txn-info">
            <div class="d-txn-main">${e.description||e.category||'—'}</div>
            <div class="d-txn-sub">${e.category||''} · ${cleanDate(e.entry_date)}</div>
          </div>
          <span class="d-txn-proj">${proj?.name||'—'}</span>
          <span class="d-txn-amt ${ii?'inc':'exp'}">${ii?'▲':'▼'} ${fn(e.amount)} ج</span>
        </div>`;
      }).join('')||'<div class="d-empty">لا توجد حركات</div>';
    }

    // التدفق النقدي - Chart.js
    _renderCashFlowChart(allEntries);

    // آخر وارد 15 يوم
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
    const recentInc=allEntries.filter(e=>{
      if(e.type!=='i'||!e.entry_date)return false;
      const p=e.entry_date.split('/');
      if(p.length!==3)return false;
      return new Date(+p[2],+p[1]-1,+p[0])>=cutoff;
    }).sort((a,b)=>{
      const pa=a.entry_date.split('/'),pb=b.entry_date.split('/');
      return new Date(+pb[2],+pb[1]-1,+pb[0])-new Date(+pa[2],+pa[1]-1,+pa[0]);
    });
    const incList=document.getElementById('dIncList');
    const incCount=document.getElementById('dIncCount');
    if(incCount){incCount.textContent=recentInc.length||'';incCount.style.display=recentInc.length?'':'none';}
    if(incList){
      incList.innerHTML=recentInc.length?recentInc.map(e=>{
        const proj=allProjectsMap[e.project_id];
        return `<div class="d-inc-item" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${e.project_id}';sw('${e.project_id}');},100)" style="cursor:pointer">
          <span class="d-inc-dot"></span>
          <div class="d-inc-info">
            <div class="d-inc-main">${e.description||e.category||'—'}</div>
            <div class="d-inc-sub">${proj?.name||'—'} · ${cleanDate(e.entry_date)}</div>
          </div>
          <span class="d-inc-amt">▲ ${fn(e.amount)} ج</span>
        </div>`;
      }).join(''):'<div class="d-empty">لا يوجد وارد في آخر 30 يوم</div>';
    }
    setSav('☁️ متصل — بياناتك محفوظة','ok');
  }catch(e){setSav('❌ '+friendlyError(e),'er');console.error('Dashboard error:',e);}
}

function _renderCashFlowChart(entries){
  const cashCanvas=document.getElementById('dCashChart');
  if(!cashCanvas)return;
  if(!window.Chart){
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
    s.onload=()=>_renderCashFlowChart(entries);
    document.head.appendChild(s);return;
  }
  // آخر 30 يوم
  const days=[];
  const incData=[];
  const expData=[];
  const now=new Date();
  for(let i=29;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);
    const dayStr=d.toLocaleDateString('ar-EG',{day:'numeric',month:'numeric'});
    days.push(i%5===0||i===0?dayStr:'');
    const dayEntries=entries.filter(e=>{
      if(!e.entry_date)return false;
      const parts=e.entry_date.split('/');
      if(parts.length!==3)return false;
      const eDate=new Date(+parts[2],+parts[1]-1,+parts[0]);
      return eDate.toDateString()===d.toDateString();
    });
    incData.push(dayEntries.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0));
    expData.push(dayEntries.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0));
  }
  if(cashCanvas._chartInst)cashCanvas._chartInst.destroy();
  cashCanvas._chartInst=new Chart(cashCanvas,{
    type:'line',
    data:{
      labels:days,
      datasets:[
        {label:'الوارد',data:incData,borderColor:'#1D9E75',backgroundColor:'rgba(29,158,117,0.08)',tension:0.4,fill:true,pointRadius:2,borderWidth:2,pointHoverRadius:5},
        {label:'المصروفات',data:expData,borderColor:'#EB5757',backgroundColor:'rgba(235,87,87,0.06)',tension:0.4,fill:true,pointRadius:2,borderWidth:2,pointHoverRadius:5}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{rtl:true,mode:'index',intersect:false,callbacks:{label:ctx=>ctx.dataset.label+': '+fn(ctx.raw)+' ج'}}},
      scales:{
        x:{grid:{display:false},ticks:{color:'rgba(212,196,154,0.4)',font:{size:9}},border:{display:false}},
        y:{grid:{color:'rgba(212,196,154,0.06)'},ticks:{color:'rgba(212,196,154,0.4)',font:{size:9},callback:v=>v>=1000?Math.round(v/1000)+'k':v},border:{display:false}}
      }
    }
  });
}

// PROJECTS
async function loadProjStatus(){try{
  const sub=document.getElementById('psStatusSub');
  const dateEl=document.getElementById('psStatusDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  if(sub)sub.textContent=allProjects.length+' مشروع نشط';
  const container=document.getElementById('dProjCards');
  if(!container)return;
  if(!allEntries.length){container.innerHTML='<div class="empty-state">⏳ جاري التحميل...</div>';await loadAllData();}
  container.className='d-proj-grid';
  if(!allProjects.length){container.innerHTML='<div class="empty-state">لا توجد مشاريع</div>';return;}
  const projColors=['var(--success-soft)','var(--info-sky)','var(--accent-gold)','var(--purple-soft)','var(--danger-peach)','var(--danger-blush)','var(--info-soft)','var(--danger-warm)'];
  container.innerHTML=allProjects.map((p,idx)=>{
    const s=projSummaries[p.id]||{inc:0,exp:0,bal:0,count:0,cats:[]};
    const pI=s.inc,pE=s.exp,pB=s.bal;
    const balCls=pB>0?'pos':pB<0?'neg':'zero';
    const pct=pI>0?Math.min(100,Math.round(pE/pI*100)):0;
    const badgeTxt=pB>0?'✦ مستقر':pB<0?'⚠ عجز':'◌ صفر';
    const color=projColors[idx%projColors.length];
    return `<div class="d-pcard" onclick="showScreen('proj');setTimeout(()=>{document.getElementById('ps').value='${p.id}';sw('${p.id}');},100)" style="animation-delay:${idx*0.04}s">
      <div class="d-pcard-head">
        <div class="d-pcard-name">${p.name}</div>
        <span class="d-pcard-badge ${balCls}">${badgeTxt}</span>
      </div>
      <div class="d-pcard-stats">
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">وارد</div><div class="d-pcard-stat-val inc">+${fn(pI)}</div></div>
        <div class="d-pcard-stat"><div class="d-pcard-stat-lbl">مصروف</div><div class="d-pcard-stat-val exp">-${fn(pE)}</div></div>
      </div>
      <div class="d-pcard-progress">
        <div class="d-pcard-progress-info"><span class="d-pcard-meta">${s.count} قيد · ${s.cats.length} بند</span><span class="d-pcard-pct">${pct}%</span></div>
        <div class="d-pcard-progress-bar"><div class="d-pcard-progress-fill" style="width:${pct}%;background:${pct>90?'var(--danger)':pct>70?'var(--warning)':color}"></div></div>
      </div>
      <div class="d-pcard-footer"><div class="d-pcard-bal ${balCls}">${pB>=0?'+':''}${fn(pB)} ج</div></div>
    </div>`;
  }).join('');
}catch(_e){const _c=document.getElementById('dProjCards');if(_c)_c.innerHTML='<div class="empty-state">⚠️ خطأ في تحميل المشاريع</div>';}}

async function loadTimeline(){try{
  const dateEl=document.getElementById('tlScreenDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const tlEl=document.getElementById('dTimeline');
  if(!tlEl)return;
  if(!allEntries.length){tlEl.innerHTML='<div class="empty-state">⏳ جاري التحميل...</div>';await loadAllData();}
  const recent=[...allEntries].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,50);
  if(!recent.length){tlEl.innerHTML='<div class="empty-state">لا توجد حركات بعد</div>';return;}
  const projMap={};allProjects.forEach(p=>{projMap[p.id]=p.name;});
  const today=new Date().toDateString();
  const yday=new Date(Date.now()-86400000).toDateString();
  const groups={'اليوم':[],'أمس':[],'سابق':[]};
  recent.forEach(e=>{
    const d=new Date(e.created_at).toDateString();
    if(d===today)groups['اليوم'].push(e);
    else if(d===yday)groups['أمس'].push(e);
    else groups['سابق'].push(e);
  });
  tlEl.innerHTML=Object.entries(groups).filter(([,v])=>v.length).map(([date,items])=>`
    <div class="tl-group">
      <div class="tl-date-lbl">${date}</div>
      ${items.map(e=>{
        const proj=projMap[e.project_id]||'—';
        const ii=e.type==='i';
        return `<div class="tl-item">
          <div class="tl-dot ${ii?'inc':'exp'}"></div>
          <div class="tl-info">
            <div class="tl-main"><span class="tl-proj-tag">${proj}</span>${e.description||e.category||'—'} ${e.seq&&e.seq!==0?'<span style="font-size:10px;background:#1C3A1C;color:#C0DD97;padding:1px 7px;border-radius:4px;font-weight:500">'+e.seq+'</span>':''}</div>
            <div class="tl-sub">${e.category||''} · ${cleanDate(e.entry_date)}</div>
          </div>
          <div class="tl-amt ${ii?'inc':'exp'}">${ii?'▲':'▼'} ${fn(e.amount)} ج</div>
          <button onclick="event.stopPropagation();printReceipt('${e.id}')" style="background:#EAF3DE;border:0.5px solid #97C459;border-radius:4px;cursor:pointer;font-size:10px;padding:2px 6px;color:#27500A;font-weight:500;margin-right:6px">إيصال</button>
        </div>`;
      }).join('')}
    </div>`).join('');
}catch(_e){const _c=document.getElementById('dTimeline');if(_c)_c.innerHTML='<div class="empty-state">⚠️ خطأ في تحميل السجل</div>';}}


// ملخصات المشاريع — بيتحسب مرة واحدة ويتخزن
let projSummaries={};
// ██ PROJECTS — تحميل + إضافة + تعديل + حذف ══════

// تحديث ملخص مشروع واحد بعد أي تغيير
function refreshProjSummary(pid){
  if(!pid)return;
  const pe=allEntries.filter(e=>e.project_id===pid);
  const inc=pe.filter(e=>e.type==='i').reduce((s,e)=>s+e.amount,0);
  const exp=pe.filter(e=>e.type==='e').reduce((s,e)=>s+e.amount,0);
  // expDirect = مصروف مباشر فقط (بدون مصروفات العهد)
  const expDirect=pe.filter(e=>e.type==='e'&&!e.advance_id).reduce((s,e)=>s+e.amount,0);
  const cats=[...new Set(pe.filter(e=>e.type==='e'&&!e.advance_id).map(e=>e.category).filter(Boolean))];
  projSummaries[pid]={inc,exp,expDirect,bal:inc-exp,balDirect:inc-expDirect,cats,count:pe.length};
}

