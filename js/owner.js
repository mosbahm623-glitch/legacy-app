// ══ OWNER SCREEN — Compact No-Scroll ═════════════════

async function loadOwnerScreen(){
  const el=document.getElementById('ownerScreen');
  if(!el)return;

  if(!allProjects||!allProjects.length){
    el.innerHTML='<div style="background:#1D3C2A;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#9DB898;font-size:14px">⏳ جاري التحميل...</div>';
    setTimeout(loadOwnerScreen,600);
    return;
  }

  const projs=[...allProjects].sort(function(a,b){return a.name.localeCompare(b.name,'ar');});
  const cats=(allCategories||[]);
  const today=(function(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();

  var catOpts='<option value="">اختر...</option>';
  cats.forEach(function(c){catOpts+='<option value="'+c+'">'+c+'</option>';});

  var inpStyle='width:100%;padding:10px 12px;border:1.5px solid #EAEEE8;border-radius:8px;font-family:inherit;font-size:14px;background:#FAFBF9;outline:none;color:#222';

  el.style.cssText='background:#1D3C2A;height:100%;display:flex;flex-direction:column;position:absolute;inset:0;z-index:1';

  el.innerHTML=
    // Topbar
    '<div style="padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">'+
      '<div style="color:#D4C49A;font-size:15px;font-weight:800">➕ قيد جديد</div>'+
      '<div style="background:rgba(212,196,154,.15);border:1px solid rgba(212,196,154,.2);color:#D4C49A;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px">'+uName+'</div>'+
    '</div>'+

    // Main card
    '<div style="background:#fff;border-radius:20px 20px 0 0;flex:1;padding:16px;display:flex;flex-direction:column;gap:10px;overflow:hidden">'+

      // Notice
      '<div style="background:#FFF8EC;border:1px solid #F0C060;border-radius:8px;padding:8px 12px;font-size:11px;color:#7A5500;display:flex;align-items:center;gap:6px;flex-shrink:0">'+
        '<span>⏳</span><span>بتروح للموافقة قبل ما تتسجل</span>'+
      '</div>'+

      // Type toggle
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;flex-shrink:0">'+
        '<button id="ow-exp-btn" onclick="owSetType(\'e\')" style="padding:10px;border-radius:10px;border:2px solid #E74C3C;background:#FFF0EE;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:#C0392B">📤 مصروف</button>'+
        '<button id="ow-inc-btn" onclick="owSetType(\'i\')" style="padding:10px;border-radius:10px;border:2px solid #EAEEE8;background:#F8FAF8;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;color:#999">📥 وارد</button>'+
      '</div>'+

      // Fields
      '<div style="display:flex;flex-direction:column;gap:8px;flex:1;overflow:hidden">'+

        '<div>'+
          '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">البيان <span style="color:#E74C3C">*</span></div>'+
          '<input id="ow-desc" type="text" placeholder="وصف العملية..." style="'+inpStyle+'">'+
        '</div>'+

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
          '<div>'+
            '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">المبلغ (ج) <span style="color:#E74C3C">*</span></div>'+
            '<input id="ow-amt" type="number" placeholder="0.00" step="any" style="'+inpStyle+';font-size:18px;font-weight:800;color:#1D3C2A">'+
          '</div>'+
          '<div>'+
            '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">التاريخ <span style="color:#E74C3C">*</span></div>'+
            '<input id="ow-date" type="text" placeholder="dd/mm/yyyy" maxlength="10" value="'+today+'" oninput="owFmtDate(this)" style="'+inpStyle+'">'+
          '</div>'+
        '</div>'+

        '<div id="ow-cat-wrap">'+
          '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">البند <span style="color:#E74C3C">*</span></div>'+
          '<select id="ow-cat" style="'+inpStyle+'">'+catOpts+'</select>'+
        '</div>'+

        '<div style="position:relative">'+
          '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">المشروع <span style="color:#E74C3C">*</span></div>'+
          '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()" style="'+inpStyle+'">'+
          '<input type="hidden" id="ow-proj">'+
          '<div id="ow-proj-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #EAEEE8;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div>'+
        '</div>'+

        '<div id="ow-mq-wrap">'+
          '<div style="font-size:10px;color:#999;font-weight:700;margin-bottom:4px;letter-spacing:.3px">المقاول</div>'+
          '<input id="ow-mq" type="text" placeholder="اختياري" style="'+inpStyle+'">'+
        '</div>'+

      '</div>'+

      // Submit - fixed at bottom above nav
      '<div style="height:70px"></div>'+
    '</div>'+
    '<div style="position:fixed;bottom:60px;right:0;left:0;padding:8px 16px;background:#1D3C2A;z-index:50">'+
      '<button onclick="owSubmit()" style="width:100%;padding:13px;background:linear-gradient(135deg,#2D5A3D,#1D3C2A);color:#D4C49A;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(29,60,42,.4)">⏳ إرسال للموافقة</button>'+
    '</div>';

  window._owType='e';
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
    if(incBtn){incBtn.style.borderColor='#EAEEE8';incBtn.style.background='#F8FAF8';incBtn.style.color='#999';}
    if(catWrap)catWrap.style.display='block';
    if(mqWrap)mqWrap.style.display='block';
  }else{
    if(incBtn){incBtn.style.borderColor='#27AE60';incBtn.style.background='#EDFFF3';incBtn.style.color='#1D6A3E';}
    if(expBtn){expBtn.style.borderColor='#EAEEE8';expBtn.style.background='#F8FAF8';expBtn.style.color='#999';}
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
    return '<div onclick="owSelectProj(this)" data-id="'+p.id+'" data-name="'+p.name+'" style="padding:9px 12px;cursor:pointer;font-size:12px;color:#333;border-bottom:1px solid #F5F5F3" onmouseover="this.style.background=\'#F0F7F2\';this.style.fontWeight=\'700\'" onmouseout="this.style.background=\'\';this.style.fontWeight=\'400\'">📁 '+p.name+'</div>';
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

async function owSubmit(){
  var t=window._owType||'e';
  var amt=parseFloat(document.getElementById('ow-amt').value);
  var desc=(document.getElementById('ow-desc').value||'').trim();
  var projId=document.getElementById('ow-proj').value;
  var date=document.getElementById('ow-date').value;
  var cat=t==='e'?(document.getElementById('ow-cat').value||''):'وارد';
  var mq=t==='e'?((document.getElementById('ow-mq')?document.getElementById('ow-mq').value:'') ||'').trim():'';

  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!desc){notify('❌ ادخل البيان','err');return;}
  if(!projId){notify('❌ اختر المشروع','err');return;}
  if(t==='e'&&!cat){notify('❌ اختر البند','err');return;}

  var btn=document.querySelector('#ownerScreen button[onclick="owSubmit()"]');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري الإرسال...';}

  try{
    var entry={
      id:crypto.randomUUID(),
      project_id:projId,
      type:t,
      amount:amt,
      category:cat,
      description:desc,
      entry_date:date,
      contractor:mq||null,
      advance_id:null,
      status:'pending',
      submitted_by:uid,
      submitted_at:new Date().toISOString()
    };
    await sb('pending_entries','POST',entry);
    notify('✅ تم الإرسال — في انتظار موافقة الأدمن','ok');
    document.getElementById('ow-amt').value='';
    document.getElementById('ow-desc').value='';
    if(document.getElementById('ow-cat'))document.getElementById('ow-cat').value='';
    if(document.getElementById('ow-mq'))document.getElementById('ow-mq').value='';
    document.getElementById('ow-proj-inp').value='';
    document.getElementById('ow-proj').value='';
    owSetType('e');
  }catch(ex){
    notify('❌ فشل الإرسال: '+friendlyError(ex),'err');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='⏳ إرسال للموافقة';}
  }
}
