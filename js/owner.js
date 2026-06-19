// ══ OWNER SCREEN — Modern Quick Entry ═════════════════

async function loadOwnerScreen(){
  const el=document.getElementById('ownerScreen');
  if(!el)return;

  if(!allProjects||!allProjects.length){
    el.innerHTML='<div style="text-align:center;padding:60px 20px;color:#888">⏳ جاري التحميل...</div>';
    setTimeout(loadOwnerScreen,600);
    return;
  }

  const projs=[...allProjects].sort((a,b)=>a.name.localeCompare(b.name,'ar'));
  const cats=(allCategories||[]);
  const today=(function(){var d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();

  var catOpts='<option value="">اختر البند...</option>';
  cats.forEach(function(c){catOpts+='<option value="'+c+'">'+c+'</option>';});

  el.innerHTML=
    '<div style="padding:16px;padding-bottom:40px;background:#F0F2F0;min-height:100vh">'+

    // Header
    '<div style="background:linear-gradient(135deg,#1D3C2A 0%,#2D5A3D 100%);border-radius:16px;padding:20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(29,60,42,.3)">'+
      '<div>'+
        '<div style="color:#fff;font-size:16px;font-weight:700">'+uName+'</div>'+
        '<div style="color:#9DB898;font-size:11px;margin-top:2px">إضافة قيد جديد</div>'+
      '</div>'+
      '<div style="background:rgba(212,196,154,.15);border:1px solid rgba(212,196,154,.3);color:#D4C49A;font-size:11px;font-weight:600;padding:5px 12px;border-radius:20px">🏢 أونر</div>'+
    '</div>'+

    // Notice
    '<div style="background:#FFF8EC;border:1px solid #F0C060;border-radius:12px;padding:10px 14px;font-size:12px;color:#7A5500;margin-bottom:16px;display:flex;align-items:center;gap:8px">'+
      '<span>⏳</span><span>القيود بتروح للموافقة قبل ما تتسجل في المشروع</span>'+
    '</div>'+

    // Type toggle
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">'+
      '<button id="ow-exp-btn" onclick="owSetType(\'e\')" style="padding:14px;border-radius:12px;border:2px solid #C0392B;background:#FFF5F5;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#C0392B">📤 مصروف</button>'+
      '<button id="ow-inc-btn" onclick="owSetType(\'i\')" style="padding:14px;border-radius:12px;border:2px solid #E8EAE8;background:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#888">📥 وارد</button>'+
    '</div>'+

    // Main fields card
    '<div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:12px">'+
      '<div style="font-size:11px;font-weight:700;color:#1D3C2A;margin-bottom:14px;opacity:.6;letter-spacing:.5px">البيانات الأساسية</div>'+

      '<div style="margin-bottom:14px">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">البيان <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-desc" type="text" placeholder="وصف العملية..." style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:14px;background:#FAFBFA;outline:none">'+
      '</div>'+

      '<div style="margin-bottom:14px">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">المبلغ (ج) <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-amt" type="number" placeholder="0.00" step="any" style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:16px;font-weight:700;background:#FAFBFA;outline:none;color:#1D3C2A">'+
      '</div>'+
      '<div style="margin-bottom:14px">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">التاريخ <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-date" type="text" placeholder="dd/mm/yyyy" maxlength="10" value="'+today+'" oninput="owFmtDate(this)" style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:14px;background:#FAFBFA;outline:none">'+
      '</div>'+

      '<div id="ow-cat-wrap" style="margin-bottom:0">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">البند <span style="color:#C0392B">*</span></div>'+
        '<select id="ow-cat" style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:14px;background:#FAFBFA;outline:none">'+catOpts+'</select>'+
      '</div>'+
    '</div>'+

    // Project card
    '<div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.06);margin-bottom:12px">'+
      '<div style="font-size:11px;font-weight:700;color:#1D3C2A;margin-bottom:14px;opacity:.6;letter-spacing:.5px">المشروع والمقاول</div>'+

      '<div style="margin-bottom:14px;position:relative">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">المشروع <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()" style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:14px;background:#FAFBFA;outline:none">'+
        '<input type="hidden" id="ow-proj">'+
        '<div id="ow-proj-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:#fff;border:1.5px solid #E8EAE8;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:999;max-height:180px;overflow-y:auto"></div>'+
      '</div>'+

      '<div id="ow-mq-wrap">'+
        '<div style="font-size:11px;color:#888;font-weight:600;margin-bottom:6px">المقاول</div>'+
        '<input id="ow-mq" type="text" placeholder="اختياري" style="width:100%;padding:12px 14px;border:1.5px solid #E8EAE8;border-radius:10px;font-family:inherit;font-size:14px;background:#FAFBFA;outline:none">'+
      '</div>'+
    '</div>'+

    // Submit
    '<button onclick="owSubmit()" style="width:100%;padding:16px;background:linear-gradient(135deg,#1D3C2A,#2D5A3D);color:#D4C49A;border:none;border-radius:14px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(29,60,42,.3)">⏳ إرسال للموافقة</button>'+

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
  if(!expBtn||!incBtn)return;
  if(t==='e'){
    expBtn.style.cssText='padding:14px;border-radius:12px;border:2px solid #C0392B;background:#FFF5F5;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#C0392B';
    incBtn.style.cssText='padding:14px;border-radius:12px;border:2px solid #E8EAE8;background:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#888';
    if(catWrap)catWrap.style.display='block';
    if(mqWrap)mqWrap.style.display='block';
  }else{
    incBtn.style.cssText='padding:14px;border-radius:12px;border:2px solid #1D6A3E;background:#F0FFF5;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#1D6A3E';
    expBtn.style.cssText='padding:14px;border-radius:12px;border:2px solid #E8EAE8;background:#fff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;color:#888';
    if(catWrap)catWrap.style.display='none';
    if(mqWrap)mqWrap.style.display='none';
  }
}

function owFilterProj(q){
  var dd=document.getElementById('ow-proj-dd');
  var hiddenInp=document.getElementById('ow-proj');
  if(!dd)return;
  if(!q.trim()){dd.style.display='none';if(hiddenInp)hiddenInp.value='';return;}
  var matches=allProjects.filter(function(p){return p.name.indexOf(q)!==-1||p.name.toLowerCase().indexOf(q.toLowerCase())!==-1;});
  if(!matches.length){dd.style.display='none';return;}
  dd.innerHTML=matches.map(function(p){
    return '<div onclick="owSelectProj(this)" data-id="'+p.id+'" data-name="'+p.name+'" style="padding:10px 14px;cursor:pointer;font-size:13px;color:#333;border-bottom:1px solid #f5f5f5;transition:background .1s" onmouseover="this.style.background=\'#F0F7F2\';this.style.color=\'#1D3C2A\';this.style.fontWeight=\'600\'" onmouseout="this.style.background=\'\';this.style.color=\'#333\';this.style.fontWeight=\'400\'">'+p.name+'</div>';
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
  var mq=t==='e'?((document.getElementById('ow-mq').value||'').trim()):'';

  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!desc){notify('❌ ادخل البيان','err');return;}
  if(!projId){notify('❌ اختر المشروع','err');return;}
  if(t==='e'&&!cat){notify('❌ اختر البند','err');return;}

  var btn=document.querySelector('#ownerScreen button[onclick="owSubmit()"]');
  if(btn){btn.disabled=true;btn.innerHTML='⏳ جاري الإرسال...';}

  try{
    var entry={
      id:crypto.randomUUID(),
      project_id:projId,
      type:t,
      amount:amt,
      category:cat||'وارد',
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
  }catch(ex){
    notify('❌ فشل الإرسال: '+friendlyError(ex),'err');
  }finally{
    if(btn){btn.disabled=false;btn.innerHTML='⏳ إرسال للموافقة';}
  }
}
