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
  var _d=new Date();var todayISO=_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');

  var isMobile=window.innerWidth<=768;
  if(isMobile){
    el.style.cssText='background:#1D3C2A;position:fixed;top:0;left:0;right:0;bottom:0;z-index:150;display:flex;flex-direction:column';
  }else{
    el.style.cssText='background:#1D3C2A;min-height:100vh;display:flex;flex-direction:column;width:100%';
  }

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
        '<div id="ow-tab-add" onclick="owShowTab(\'add\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#1D3C2A;border-bottom:2px solid #1D3C2A;cursor:pointer">➕ قيد</div>'+
        '<div id="ow-tab-adv" onclick="owShowTab(\'adv\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">💼 عهدة</div>'+
        '<div id="ow-tab-pend" onclick="owShowTab(\'pend\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">⏳ <span id="ow-pend-cnt" style="background:#EF9F27;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px">0</span></div>'+
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
          '<input id="ow-date" type="date" style="'+inp+'" value="'+todayISO+'"></div>'+
        '</div>'+
        '<div id="ow-cat-wrap" style="margin-bottom:8px;position:relative"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">البند <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-cat-inp" type="text" placeholder="اكتب أو اختر البند..." autocomplete="off" oninput="owFilterCat(this.value)" onblur="owHideCatDD()" style="'+inp+'">'+
        '<input type="hidden" id="ow-cat">'+
        '<div id="ow-cat-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #EAEEE8;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div></div>'+
        '<div style="margin-bottom:8px;position:relative"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المشروع <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()" style="'+inp+'">'+
        '<input type="hidden" id="ow-proj">'+
        '<div id="ow-proj-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #EAEEE8;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div></div>'+
        '<div id="ow-mq-wrap" style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المقاول</label>'+
        '<input id="ow-mq" type="text" placeholder="اختياري" style="'+inp+'"></div>'+
        '<div style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">طريقة الدفع <span style="color:#E74C3C">*</span></label>'+
        '<select id="ow-pmt" onchange="owPmtChange(this.value)" style="'+inp+';background:#fff">'+
          '<option value="">اختر طريقة الدفع...</option>'+
          '<option value="كاش">💵 كاش</option>'+
          '<option value="الأهلي">🏦 الأهلي</option>'+
          '<option value="CIB">🏦 CIB</option>'+
          '<option value="أخرى">✏️ أخرى</option>'+
        '</select>'+
        '<input id="ow-pmt-other" type="text" placeholder="اسم البنك..." style="'+inp+';display:none;margin-top:6px"></div>'+
        '<button onclick="owSubmit()" style="width:100%;padding:13px;background:#1D3C2A;color:#D4C49A;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">⏳ إرسال للموافقة</button>'+
      '</div>'+

      // PENDING screen
      '<div id="ow-screen-pend" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div id="ow-pend-list"><div style="text-align:center;padding:40px;color:#ccc">⏳ جاري التحميل...</div></div>'+
      '</div>'+

      // ADVANCE screen
      '<div id="ow-screen-adv" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div style="background:#EEF2FF;border:1px solid #C5CFE8;border-radius:8px;padding:8px 12px;font-size:11px;color:#3A4A8A;margin-bottom:12px">💡 اختر الشخص اللي هتدي له دفعة عهدة — هتروح للأدمن للموافقة</div>'+
        '<div style="margin-bottom:10px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:6px">اختر الشخص <span style=\"color:#E74C3C\">*</span></label>'+
        '<div id="ow-viewers-list">⏳ جاري التحميل...</div></div>'+
        '<div style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المبلغ <span style=\"color:#E74C3C\">*</span></label>'+
        '<input id="ow-adv-amt" type="number" placeholder="0.00" step="any" style=\"width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:16px;font-weight:800;color:#1D3C2A;background:#fff;outline:none\"></div>'+
        '<div style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">ملاحظة</label>'+
        '<input id="ow-adv-note" type="text" placeholder="سبب الدفعة..." style=\"width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:13px;background:#fff;outline:none\"></div>'+
        '<div style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">طريقة الدفع <span style="color:#E74C3C">*</span></label>'+
        '<select id="ow-adv-pmt" onchange="owAdvPmtChange(this.value)" style="width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:13px;background:#fff;outline:none">'+
          '<option value="">اختر طريقة الدفع...</option>'+
          '<option value="كاش">💵 كاش</option>'+
          '<option value="الأهلي">🏦 الأهلي</option>'+
          '<option value="CIB">🏦 CIB</option>'+
          '<option value="أخرى">✏️ أخرى</option>'+
        '</select>'+
        '<input id="ow-adv-pmt-other" type="text" placeholder="اسم البنك..." style="display:none;width:100%;margin-top:6px;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:13px;background:#fff;outline:none"></div>'+
        '<button onclick="owSubmitAdv()" style="width:100%;padding:13px;background:#1D3C2A;color:#D4C49A;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">💼 إرسال طلب العهدة</button>'+
      '</div>'+

      // APPROVED screen
      '<div id="ow-screen-done" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div id="ow-done-list"><div style="text-align:center;padding:40px;color:#ccc">⏳ جاري التحميل...</div></div>'+
      '</div>'+

    '</div>';

  window._owAllCats=allCategories||[];
  window._owType='e';
  owLoadPending();
  owLoadApproved();
}

function owShowTab(t){
  ['add','adv','pend','done'].forEach(function(x){
    var tab=document.getElementById('ow-tab-'+x);
    var scr=document.getElementById('ow-screen-'+x);
    if(tab){tab.style.color=x===t?'#1D3C2A':'#bbb';tab.style.borderBottom=x===t?'2px solid #1D3C2A':'2px solid transparent';}
    if(scr)scr.style.display=x===t?'block':'none';
  });
  if(t==='adv')owLoadViewers();
}

function owHideProjDD(){setTimeout(function(){var d=document.getElementById('ow-proj-dd');if(d)d.style.display='none';},200);}

function owHideCatDD(){setTimeout(function(){var d=document.getElementById('ow-cat-dd');if(d)d.style.display='none';},200);}

function owFilterCat(val){
  var dd=document.getElementById('ow-cat-dd');
  var hidden=document.getElementById('ow-cat');
  if(!dd)return;
  hidden.value='';
  var cats=window._owAllCats||[];
  var filtered=val?cats.filter(function(c){return c.includes(val);}):cats;
  if(!filtered.length){dd.style.display='none';return;}
  dd.style.display='block';
  dd.innerHTML=filtered.map(function(c){
    return '<div onclick="owSelectCat(\"'+c+'\")'  + ' style="padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0ee">'+c+'</div>';
  }).join('');
}

function owSelectCat(val){
  var inp=document.getElementById('ow-cat-inp');
  var hidden=document.getElementById('ow-cat');
  var dd=document.getElementById('ow-cat-dd');
  if(inp)inp.value=val;
  if(hidden)hidden.value=val;
  if(dd)dd.style.display='none';
}

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
  // تغيير label طريقة الدفع/الاستقبال
  var pmtLbl=document.querySelector('#ow-screen-add label[for-pmt]')||
    (function(){var els=document.querySelectorAll('#ow-screen-add label');for(var i=0;i<els.length;i++){if(els[i].textContent.includes('طريقة'))return els[i];}return null;})();
  if(pmtLbl)pmtLbl.innerHTML=(t==='i'?'طريقة الاستقبال':'طريقة الدفع')+' <span style="color:#E74C3C">*</span>';
  var pmtSel=document.getElementById('ow-pmt');
  if(pmtSel)pmtSel.options[0].text=t==='i'?'اختر طريقة الاستقبال...':'اختر طريقة الدفع...';
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
    var advPend=[];
    try{advPend=await sb('pending_advances?submitted_by=eq.'+uid+'&order=submitted_at.desc');}catch(_){}
    var total=pend.length+advPend.length;
    var cnt=document.getElementById('ow-pend-cnt');
    if(cnt)cnt.textContent=total;
    var listEl=document.getElementById('ow-pend-list');
    if(!listEl)return;
    if(!total){listEl.innerHTML='<div style="text-align:center;padding:40px;color:#ccc"><div style="font-size:32px;margin-bottom:8px">✅</div>مفيش طلبات في الانتظار</div>';return;}
    var projMap={};
    allProjects.forEach(function(p){projMap[p.id]=p.name;});
    var advMap={};advances.forEach(function(a){advMap[a.id]=a.person_name;});
    var html=pend.map(function(e){return owEntryCard(e,projMap,'⏳ في انتظار الموافقة','#E67E22');}).join('');
    html+=advPend.map(function(r){
      var name=r.adv_user_id?(advances.find(function(a){return a.user_id===r.adv_user_id;})||{}).person_name||'—':'—';
      var bg=r.status==='approved'?'#EAF7EE':r.status==='rejected'?'#FFF0EE':'#FFF8EC';
      var statusTxt=r.status==='approved'?'✅ تمت الموافقة':r.status==='rejected'?'❌ مرفوض':'⏳ في انتظار الموافقة';
      var statusClr=r.status==='approved'?'#1D6A3E':r.status==='rejected'?'#C0392B':'#E67E22';
      return '<div style="background:'+bg+';border:1px solid #EAEEE8;border-radius:12px;padding:12px 14px;margin-bottom:8px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'+
          '<span style="font-size:11px;font-weight:700;background:#EEF2FF;color:#3A4A8A;padding:2px 8px;border-radius:8px">💼 دفعة عهدة</span>'+
          '<span style="font-size:12px;font-weight:800;color:#C0392B">-'+fn(r.amount)+' ج</span>'+
        '</div>'+
        '<div style="font-size:12px;color:#444;margin-bottom:4px">لـ '+name+(r.inst_note?' · '+r.inst_note:'')+'</div>'+
        '<div style="display:flex;justify-content:space-between"><span style="font-size:10px;color:#aaa">'+(r.inst_date||'')+'</span><span style="font-size:11px;font-weight:700;color:'+statusClr+'">'+statusTxt+'</span></div>'+
      '</div>';
    }).join('');
    listEl.innerHTML=html;
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

function owAdvPmtChange(v){
  const other=document.getElementById('ow-adv-pmt-other');
  if(other)other.style.display=v==='أخرى'?'block':'none';
}

function owPmtChange(v){
  const other=document.getElementById('ow-pmt-other');
  if(other)other.style.display=v==='أخرى'?'block':'none';
}

async function owSubmit(){
  var t=window._owType||'e';
  var amt=parseFloat(document.getElementById('ow-amt').value);
  var desc=(document.getElementById('ow-desc').value||'').trim();
  var projId=document.getElementById('ow-proj').value;
  var _rawDate=document.getElementById('ow-date').value;
  var date=_rawDate&&_rawDate.includes('-')?(function(s){var p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0];}(_rawDate)):_rawDate;
  var catHidden=document.getElementById('ow-cat');
  var catInp=document.getElementById('ow-cat-inp');
  var cat=t==='e'?(catHidden&&catHidden.value?catHidden.value:(catInp?catInp.value:'')):'وارد';
  var mq=t==='e'?((document.getElementById('ow-mq')?document.getElementById('ow-mq').value:'')||'').trim():'';

  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!desc){notify('❌ ادخل البيان','err');return;}
  if(!date){notify('❌ ادخل التاريخ','err');return;}
  if(!projId){notify('❌ اختر المشروع','err');return;}
  if(t==='e'&&!cat){notify('❌ اختر البند','err');return;}

  var btn=document.querySelector('#ow-screen-add button[onclick="owSubmit()"]');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري الإرسال...';}

  try{
    var pmtSel=document.getElementById('ow-pmt');
    var pmtOther=document.getElementById('ow-pmt-other');
    var pmt=pmtSel?(pmtSel.value==='أخرى'?(pmtOther?pmtOther.value.trim():''):pmtSel.value):'';
    if(!pmt){notify('❌ اختر طريقة الدفع','err');return;}
    var entry={id:crypto.randomUUID(),project_id:projId,type:t,amount:amt,category:cat,description:desc,entry_date:date,contractor:mq||null,advance_id:null,status:'pending',submitted_by:uid,submitted_at:new Date().toISOString(),payment_method:pmt};
    await sb('pending_entries','POST',entry);
    notify('✅ تم الإرسال — في انتظار موافقة الأدمن','ok');
    document.getElementById('ow-amt').value='';
    document.getElementById('ow-desc').value='';
    if(document.getElementById('ow-cat'))document.getElementById('ow-cat').value='';
    if(document.getElementById('ow-cat-inp'))document.getElementById('ow-cat-inp').value='';
    if(document.getElementById('ow-mq'))document.getElementById('ow-mq').value='';
    if(document.getElementById('ow-pmt'))document.getElementById('ow-pmt').value='';
    if(document.getElementById('ow-pmt-other'))document.getElementById('ow-pmt-other').style.display='none';
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

// ══ OWNER ADVANCE — طلب دفعة عهدة ════════════════════
var _owViewers=[];
var _owSelectedViewer=null;

async function owLoadViewers(){
  var el=document.getElementById('ow-viewers-list');
  if(!el)return;
  el.innerHTML='<div style="text-align:center;padding:20px;color:#aaa;font-size:12px">⏳ جاري التحميل...</div>';
  try{
    var viewers=await sb('profiles?role=eq.viewer&order=name');
    var advs=await sb('advances?status=eq.open');
    var insts=await sb('advance_installments?select=advance_id,amount');
    _owViewers=viewers||[];
    _owSelectedViewer=null;
    var inp='width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:13px;background:#fff;outline:none';
    if(!_owViewers.length){
      el.innerHTML='<div style="text-align:center;padding:20px;color:#aaa;font-size:12px">لا يوجد مستخدمين من نوع viewer</div>';
      return;
    }
    el.innerHTML=_owViewers.map(function(v){
      var adv=(advs||[]).find(function(a){return a.user_id===v.id;});
      var spent=adv?(insts||[]).filter(function(i){return i.advance_id===adv.id;}).reduce(function(s,i){return s+i.amount;},0):0;
      var remaining=adv?Math.max(0,adv.amount-spent):0;
      var advInfo=adv?('متبقي العهدة: '+fn(remaining)+' ج'):'لا توجد عهدة مفتوحة';
      var advClr=adv?'#1D6A3E':'#aaa';
      return '<div id="ow-viewer-'+v.id+'" data-vid="'+v.id+'" onclick="owSelectViewer(this.dataset.vid)" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:2px solid #EAEEE8;background:#fff;margin-bottom:8px;cursor:pointer;transition:all .15s">'+
        '<div style="width:36px;height:36px;border-radius:50%;background:#1D3C2A;color:#D4C49A;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0">'+(v.name||'?')[0]+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-size:13px;font-weight:700;color:#1a2e1f">'+v.name+'</div>'+
          '<div style="font-size:10px;color:'+advClr+';margin-top:1px">'+advInfo+'</div>'+
        '</div>'+
        '<div id="ow-viewer-chk-'+v.id+'" style="font-size:16px"></div>'+
      '</div>';
    }).join('');
  }catch(ex){
    if(el)el.innerHTML='<div style="color:#c0392b;font-size:12px;padding:10px">❌ '+ex.message+'</div>';
  }
}

function owSelectViewer(id){
  _owSelectedViewer=id;
  _owViewers.forEach(function(v){
    var card=document.getElementById('ow-viewer-'+v.id);
    var chk=document.getElementById('ow-viewer-chk-'+v.id);
    if(card){card.style.borderColor=v.id===id?'#1D3C2A':'#EAEEE8';card.style.background=v.id===id?'#EBF5EF':'#fff';}
    if(chk){chk.textContent=v.id===id?'✅':'';}
  });
}

async function owSubmitAdv(){
  if(!_owSelectedViewer){notify('❌ اختر الشخص أولاً','err');return;}
  var amt=parseFloat(document.getElementById('ow-adv-amt').value);
  var note=(document.getElementById('ow-adv-note').value||'').trim();
  var advPmtSel=document.getElementById('ow-adv-pmt');
  var advPmtOther=document.getElementById('ow-adv-pmt-other');
  var advPmt=advPmtSel?(advPmtSel.value==='أخرى'?(advPmtOther?advPmtOther.value.trim():''):advPmtSel.value):'';
  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!advPmt){notify('❌ اختر طريقة الدفع','err');return;}

  // نجيب العهدة المفتوحة للشخص ده
  var advRows=[];
  try{advRows=await sb('advances?user_id=eq.'+_owSelectedViewer+'&status=eq.open');}catch(ex){}
  if(!advRows||!advRows.length){notify('❌ الشخص ده مش عنده عهدة مفتوحة — الأدمن لازم يفتح عهدة الأول','warn');return;}
  var adv=advRows[0];

  var btn=document.querySelector('#ow-screen-adv button[onclick="owSubmitAdv()"]');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري الإرسال...';}

  try{
    var viewer=_owViewers.find(function(v){return v.id===_owSelectedViewer;});
    var today=(function(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();
    await sb('pending_advances','POST',{
      type:'installment',
      advance_id:adv.id,
      amount:amt,
      inst_date:today,
      inst_note:note||'دفعة من الأونر',
      payment_method:advPmt,
      adv_user_id:_owSelectedViewer,
      submitted_by:uid,
      submitted_at:new Date().toISOString(),
    });
    notify('✅ تم إرسال طلب الدفعة لـ '+(viewer?viewer.name:'—')+' — في انتظار موافقة الأدمن','ok');
    document.getElementById('ow-adv-amt').value='';
    document.getElementById('ow-adv-note').value='';
    if(document.getElementById('ow-adv-pmt'))document.getElementById('ow-adv-pmt').value='';
    if(document.getElementById('ow-adv-pmt-other'))document.getElementById('ow-adv-pmt-other').style.display='none';
    _owSelectedViewer=null;
    owLoadViewers();
    owLoadPending();
    owShowTab('pend');
  }catch(ex){
    notify('❌ فشل الإرسال: '+friendlyError(ex),'err');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='💼 إرسال طلب العهدة';}
  }
}
