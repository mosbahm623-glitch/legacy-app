// ══ OWNER SCREEN — 3 Tabs ═════════════════════════════

async function loadOwnerScreen(){
  const el=document.getElementById('ownerScreen');
  if(!el)return;

  if(!allProjects||!allProjects.length){
    el.innerHTML='<div style="background:#1D3C2A;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#9DB898;font-size:14px">⏳ جاري التحميل...</div>';
    setTimeout(loadOwnerScreen,600);
    return;
  }

  const cats=(allCategories||[]);
  const today=(function(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();
  var catOpts='<option value="">اختر...</option>';
  cats.forEach(function(c){catOpts+='<option value="'+c+'">'+c+'</option>';});

  var inp='width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:13px;background:#fff;outline:none';

  el.style.cssText='background:#1D3C2A;position:fixed;top:0;left:0;right:0;bottom:0;z-index:5;display:flex;flex-direction:column';

  el.innerHTML=
    // Topbar
    '<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'+
      '<div style="color:#D4C49A;font-size:15px;font-weight:800">'+uName+'</div>'+
      '<div style="background:rgba(212,196,154,.15);border:1px solid rgba(212,196,154,.2);color:#D4C49A;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px">🏢 أونر</div>'+
    '</div>'+

    // Card
    '<div style="background:#f8faf8;border-radius:20px 20px 0 0;flex:1;display:flex;flex-direction:column;overflow:hidden">'+

      // Tabs
      '<div style="display:flex;background:#fff;border-bottom:1px solid #f0f0ec;flex-shrink:0">'+
        '<div id="ow-tab-add" onclick="owShowTab(\'add\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#1D3C2A;border-bottom:2px solid #1D3C2A;cursor:pointer">➕ قيد جديد</div>'+
        '<div id="ow-tab-pend" onclick="owShowTab(\'pend\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">⏳ انتظار <span id="ow-pend-cnt" style="background:#EF9F27;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px;margin-right:2px">0</span></div>'+
        '<div id="ow-tab-done" onclick="owShowTab(\'done\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">✅ موافق</div>'+
      '</div>'+

      // ADD screen
      '<div id="ow-screen-add" style="flex:1;overflow-y:auto;padding:12px">'+
        '<div style="background:#FFF8EC;border:1px solid #F0C060;border-radius:8px;padding:8px 12px;font-size:11px;color:#7A5500;margin-bottom:10px;display:flex;align-items:center;gap:6px">⏳ بتروح للموافقة قبل ما تتسجل</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
          '<button id="ow-exp-btn" onclick="owSetType(\'e\')" style="padding:10px;border-radius:10px;border:2px solid #E74C3C;background:#FFF0EE;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:#C0392B">📤 مصروف</button>'+
          '<button id="ow-inc-btn" onclick="owSetType(\'i\')" style="padding:10px;border-radius:10px;border:2px solid #EAEEE8;background:#fff;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:#999">📥 وارد</button>'+
        '</div>'+
        '<div style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">البيان <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-desc" type="text" placeholder="وصف العملية..." style="'+inp+'"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المبلغ <span style="color:#E74C3C">*</span></label>'+
          '<input id="ow-amt" type="number" placeholder="0.00" step="any" style="'+inp+';font-size:16px;font-weight:800;color:#1D3C2A"></div>'+
          '<div><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">التاريخ <span style="color:#E74C3C">*</span></label>'+
          '<input id="ow-date" type="text" placeholder="dd/mm/yyyy" maxlength="10" value="'+today+'" oninput="owFmtDate(this)" style="'+inp+'"></div>'+
        '</div>'+
        '<div id="ow-cat-wrap" style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">البند <span style="color:#E74C3C">*</span></label>'+
        '<select id="ow-cat" style="'+inp+'">'+catOpts+'</select></div>'+
        '<div style="margin-bottom:8px;position:relative"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المشروع <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()" style="'+inp+'">'+
        '<input type="hidden" id="ow-proj">'+
        '<div id="ow-proj-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #EAEEE8;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div></div>'+
        '<div id="ow-mq-wrap" style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المقاول</label>'+
        '<input id="ow-mq" type="text" placeholder="اختياري" style="'+inp+'"></div>'+
        '<button onclick="owSubmit()" style="width:100%;padding:13px;background:#1D3C2A;color:#D4C49A;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">⏳ إرسال للموافقة</button>'+
      '</div>'+

      // PENDING screen
      '<div id="ow-screen-pend" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div id="ow-pend-list"><div style="text-align:center;padding:40px;color:#ccc">⏳ جاري التحميل...</div></div>'+
      '</div>'+

      // APPROVED screen
      '<div id="ow-screen-done" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div id="ow-done-list"><div style="text-align:center;padding:40px;color:#ccc">⏳ جاري التحميل...</div></div>'+
      '</div>'+

    '</div>';

  window._owType='e';
  owLoadPending();
  owLoadApproved();
}

function owShowTab(t){
  ['add','pend','done'].forEach(function(x){
    var tab=document.getElementById('ow-tab-'+x);
    var scr=document.getElementById('ow-screen-'+x);
    if(tab){tab.style.color=x===t?'#1D3C2A':'#bbb';tab.style.borderBottom=x===t?'2px solid #1D3C2A':'2px solid transparent';}
    if(scr)scr.style.display=x===t?'block':'none';
  });
}

function owHideProjDD(){setTimeout(function(){var d=document.getElementById('ow-proj-dd');if(d)d.style.display='none';},200);}

function owFmtDate(inp){
  var v=inp.value.replace(/\D/g,'');
  if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);
  if(v.length>5)v=v.slice(0,5)+'/'+v.slice(5);
  inp.value=v;
}

function owSetType(t){
  window._owType=t;
  var expBtn=document.getElementById('ow-exp-btn');
  var incBtn=document.getElementById('ow-inc-btn');
  var catWrap=document.getElementById('ow-cat-wrap');
  var mqWrap=document.getElementById('ow-mq-wrap');
  if(t==='e'){
    if(expBtn){expBtn.style.borderColor='#E74C3C';expBtn.style.background='#FFF0EE';expBtn.style.color='#C0392B';}
    if(incBtn){incBtn.style.borderColor='#EAEEE8';incBtn.style.background='#fff';incBtn.style.color='#999';}
    if(catWrap)catWrap.style.display='block';
    if(mqWrap)mqWrap.style.display='block';
  }else{
    if(incBtn){incBtn.style.borderColor='#27AE60';incBtn.style.background='#EDFFF3';incBtn.style.color='#1D6A3E';}
    if(expBtn){expBtn.style.borderColor='#EAEEE8';expBtn.style.background='#fff';expBtn.style.color='#999';}
    if(catWrap)catWrap.style.display='none';
    if(mqWrap)mqWrap.style.display='none';
  }
}

function owFilterProj(q){
  var dd=document.getElementById('ow-proj-dd');
  var hidden=document.getElementById('ow-proj');
  if(!dd)return;
  if(!q.trim()){dd.style.display='none';if(hidden)hidden.value='';return;}
  var matches=allProjects.filter(function(p){return p.name.indexOf(q)!==-1||p.name.toLowerCase().indexOf(q.toLowerCase())!==-1;});
  if(!matches.length){dd.style.display='none';return;}
  dd.innerHTML=matches.slice(0,8).map(function(p){
    return '<div onclick="owSelectProj(this)" data-id="'+p.id+'" data-name="'+p.name+'" style="padding:9px 12px;cursor:pointer;font-size:13px;color:#333;border-bottom:1px solid #F5F5F3" onmouseover="this.style.background=\'#F0F7F2\'" onmouseout="this.style.background=\'\'">📁 '+p.name+'</div>';
  }).join('');
  dd.style.display='block';
}

function owSelectProj(el){
  var id=el.getAttribute('data-id');
  var name=el.getAttribute('data-name');
  var inp=document.getElementById('ow-proj-inp');
  var hidden=document.getElementById('ow-proj');
  if(inp)inp.value=name;
  if(hidden)hidden.value=id;
  var dd=document.getElementById('ow-proj-dd');
  if(dd)dd.style.display='none';
}

function owEntryCard(e, projMap, statusTxt, statusClr){
  var pName=projMap[e.project_id]||'—';
  var amtClr=e.type==='i'?'#1D6A3E':'#C0392B';
  var amtSign=e.type==='i'?'+':'-';
  var cat=e.category||'—';
  var catBg=e.type==='i'?'background:#EAF7EE;color:#1D6A3E':'background:#f5f5f3;color:#666';
  return '<div style="background:#fff;border-radius:12px;margin-bottom:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05)">'+
    '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px 5px">'+
      '<div style="font-size:11px;color:#888;font-weight:600">'+pName+'</div>'+
      '<div style="font-size:15px;font-weight:900;margin-right:auto;color:'+amtClr+'">'+amtSign+fn(e.amount)+' ج</div>'+
    '</div>'+
    '<div style="padding:2px 14px 7px;display:flex;align-items:center;gap:6px">'+
      '<span style="font-size:10px;'+catBg+';border-radius:10px;padding:2px 8px;white-space:nowrap">'+cat+'</span>'+
      '<span style="font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">'+(e.description||'—')+'</span>'+
    '</div>'+
    '<div style="display:flex;justify-content:space-between;padding:6px 14px;border-top:1px solid #f8f8f6">'+
      '<span style="font-size:10px;font-weight:700;color:'+statusClr+'">'+statusTxt+'</span>'+
      '<span style="font-size:10px;color:#ccc">'+(e.entry_date||'—')+'</span>'+
    '</div>'+
  '</div>';
}

async function owLoadPending(){
  try{
    var pend=await sb('pending_entries?submitted_by=eq.'+uid+'&status=eq.pending&order=submitted_at.desc');
    var cnt=document.getElementById('ow-pend-cnt');
    if(cnt)cnt.textContent=pend.length;
    var listEl=document.getElementById('ow-pend-list');
    if(!listEl)return;
    if(!pend.length){listEl.innerHTML='<div style="text-align:center;padding:40px;color:#ccc"><div style="font-size:32px;margin-bottom:8px">✅</div>مفيش قيود في الانتظار</div>';return;}
    var projMap={};
    allProjects.forEach(function(p){projMap[p.id]=p.name;});
    listEl.innerHTML=pend.map(function(e){return owEntryCard(e,projMap,'⏳ في انتظار الموافقة','#E67E22');}).join('');
  }catch(ex){console.error(ex);}
}

async function owLoadApproved(){
  try{
    var done=await sb('pending_entries?submitted_by=eq.'+uid+'&status=eq.approved&order=submitted_at.desc&limit=50');
    var listEl=document.getElementById('ow-done-list');
    if(!listEl)return;
    if(!done.length){listEl.innerHTML='<div style="text-align:center;padding:40px;color:#ccc"><div style="font-size:32px;margin-bottom:8px">📋</div>لا توجد قيود موافق عليها بعد</div>';return;}
    var projMap={};
    allProjects.forEach(function(p){projMap[p.id]=p.name;});
    listEl.innerHTML=done.map(function(e){return owEntryCard(e,projMap,'✅ تمت الموافقة','#1D6A3E');}).join('');
  }catch(ex){console.error(ex);}
}

async function owSubmit(){
  var t=window._owType||'e';
  var amt=parseFloat(document.getElementById('ow-amt').value);
  var desc=(document.getElementById('ow-desc').value||'').trim();
  var projId=document.getElementById('ow-proj').value;
  var date=document.getElementById('ow-date').value;
  var cat=t==='e'?(document.getElementById('ow-cat').value||''):'وارد';
  var mq=t==='e'?((document.getElementById('ow-mq')?document.getElementById('ow-mq').value:'')||'').trim():'';

  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!desc){notify('❌ ادخل البيان','err');return;}
  if(!projId){notify('❌ اختر المشروع','err');return;}
  if(t==='e'&&!cat){notify('❌ اختر البند','err');return;}

  var btn=document.querySelector('#ow-screen-add button[onclick="owSubmit()"]');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري الإرسال...';}

  try{
    var entry={id:crypto.randomUUID(),project_id:projId,type:t,amount:amt,category:cat,description:desc,entry_date:date,contractor:mq||null,advance_id:null,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString()};
    await sb('pending_entries','POST',entry);
    notify('✅ تم الإرسال — في انتظار موافقة الأدمن','ok');
    document.getElementById('ow-amt').value='';
    document.getElementById('ow-desc').value='';
    if(document.getElementById('ow-cat'))document.getElementById('ow-cat').value='';
    if(document.getElementById('ow-mq'))document.getElementById('ow-mq').value='';
    document.getElementById('ow-proj-inp').value='';
    document.getElementById('ow-proj').value='';
    owSetType('e');
    owLoadPending();
    owShowTab('pend');
  }catch(ex){
    notify('❌ فشل الإرسال: '+friendlyError(ex),'err');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='⏳ إرسال للموافقة';}
  }
}
