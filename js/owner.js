// ══ OWNER SCREEN — Quick Entry ════════════════════════

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
  const today=(()=>{const d=new Date();return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();

  let projOpts='<option value="">اختر المشروع...</option>';
  projs.forEach(p=>{projOpts+='<option value="'+p.id+'">'+p.name+'</option>';});

  let catOpts='<option value="">اختر البند...</option>';
  cats.forEach(c=>{catOpts+='<option value="'+c+'">'+c+'</option>';});

  el.innerHTML=
    // Notice
    '<div style="background:#FAEEDA;border-bottom:1px solid #EF9F27;padding:9px 16px;font-size:12px;color:#633806;display:flex;align-items:center;gap:6px">'+
      '<span>⏳</span><span>القيود بتروح للموافقة قبل ما تتسجل في المشروع</span>'+
    '</div>'+

    // Form wrapper
    '<div style="padding:16px 14px">'+

      // Type toggle
      '<div class="tt" style="margin-bottom:16px">'+
        '<button class="tb on" id="ow-exp-btn" onclick="owSetType(\'e\')">📤 مصروف</button>'+
        '<button class="tb" id="ow-inc-btn" onclick="owSetType(\'i\')">📥 وارد</button>'+
      '</div>'+

      // البيان
      '<div class="ig-field full" style="margin-bottom:10px">'+
        '<div class="ig-lbl">البيان <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-desc" type="text" placeholder="وصف العملية..." class="finp" style="width:100%">'+
      '</div>'+

      // المبلغ + التاريخ
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'+
        '<div class="ig-field">'+
          '<div class="ig-lbl">المبلغ (ج) <span style="color:#C0392B">*</span></div>'+
          '<input id="ow-amt" type="number" placeholder="0.00" step="any" class="finp req-left" style="width:100%">'+
        '</div>'+
        '<div class="ig-field">'+
          '<div class="ig-lbl">التاريخ <span style="color:#C0392B">*</span></div>'+
          '<input id="ow-date" type="text" placeholder="dd/mm/yyyy" maxlength="10" class="finp" style="width:100%" value="'+today+'" oninput="owFmtDate(this)">'+
        '</div>'+
      '</div>'+

      // البند (مصروف فقط)
      '<div class="ig-field full" id="ow-cat-wrap" style="margin-bottom:10px">'+
        '<div class="ig-lbl">البند <span style="color:#C0392B">*</span></div>'+
        '<select id="ow-cat" class="finp" style="width:100%">'+catOpts+'</select>'+
      '</div>'+

      // المشروع - autocomplete
      '<div class="ig-field full" style="margin-bottom:10px;position:relative">'+
        '<div class="ig-lbl">المشروع <span style="color:#C0392B">*</span></div>'+
        '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." class="finp" style="width:100%" autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()">'+
        '<input type="hidden" id="ow-proj">'+
        '<div id="ow-proj-dd" style="display:none;position:absolute;top:100%;right:0;left:0;background:#fff;border:1px solid #e0e0dc;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.1);z-index:999;max-height:180px;overflow-y:auto;margin-top:2px"></div>'+
      '</div>'+

      // المقاول (مصروف فقط)
      '<div class="ig-field full" id="ow-mq-wrap" style="margin-bottom:10px">'+
        '<div class="ig-lbl">المقاول</div>'+
        '<input id="ow-mq" type="text" placeholder="اختياري" class="finp" style="width:100%">'+
      '</div>'+

      // Submit
      '<button onclick="owSubmit()" class="ab" style="width:100%;margin-top:6px">⏳ إرسال للموافقة</button>'+
    '</div>';

  window._owType='e';
}

function owHideProjDD(){setTimeout(function(){const d=document.getElementById('ow-proj-dd');if(d)d.style.display='none';},200);}

function owFilterProj(q){
  const dd=document.getElementById('ow-proj-dd');
  const hiddenInp=document.getElementById('ow-proj');
  if(!dd)return;
  if(!q.trim()){dd.style.display='none';hiddenInp.value='';return;}
  const matches=allProjects.filter(p=>p.name.includes(q)||p.name.toLowerCase().includes(q.toLowerCase()));
  if(!matches.length){dd.style.display='none';return;}
  dd.innerHTML=matches.map(p=>
    '<div onclick="owSelectProj(''+p.id+'',''+p.name+'')" style="padding:10px 14px;cursor:pointer;font-size:13px;border-bottom:0.5px solid #f0f0ec" onmouseover="this.style.background='#f5f5f3'" onmouseout="this.style.background='#fff'">'+p.name+'</div>'
  ).join('');
  dd.style.display='block';
}

function owSelectProj(id, name){
  document.getElementById('ow-proj').value=id;
  document.getElementById('ow-proj-inp').value=name;
  const dd=document.getElementById('ow-proj-dd');
  if(dd)dd.style.display='none';
}

function owFmtDate(inp){
  let v=inp.value.replace(/\D/g,'');
  if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);
  if(v.length>5)v=v.slice(0,5)+'/'+v.slice(5);
  inp.value=v;
}

function owSetType(t){
  window._owType=t;
  const expBtn=document.getElementById('ow-exp-btn');
  const incBtn=document.getElementById('ow-inc-btn');
  const catWrap=document.getElementById('ow-cat-wrap');
  const mqWrap=document.getElementById('ow-mq-wrap');
  if(!expBtn||!incBtn)return;
  if(t==='e'){
    expBtn.className='tb on';
    incBtn.className='tb';
    if(catWrap)catWrap.style.display='block';
    if(mqWrap)mqWrap.style.display='block';
  }else{
    incBtn.className='tb on';
    expBtn.className='tb';
    if(catWrap)catWrap.style.display='none';
    if(mqWrap)mqWrap.style.display='none';
  }
}

async function owSubmit(){
  const t=window._owType||'e';
  const amt=parseFloat(document.getElementById('ow-amt').value);
  const desc=(document.getElementById('ow-desc').value||'').trim();
  const projId=document.getElementById('ow-proj').value;
  const date=document.getElementById('ow-date').value;
  const cat=t==='e'?(document.getElementById('ow-cat').value||''):'وارد';
  const mq=t==='e'?((document.getElementById('ow-mq').value||'').trim()):'';

  if(!amt||amt<=0){notify('❌ ادخل المبلغ','err');return;}
  if(!desc){notify('❌ ادخل البيان','err');return;}
  if(!projId){notify('❌ اختر المشروع','err');return;}
  if(t==='e'&&!cat){notify('❌ اختر البند','err');return;}

  const btn=document.querySelector('#ownerScreen .ab');
  if(btn){btn.disabled=true;btn.textContent='⏳ جاري الإرسال...';}

  try{
    const entry={
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
    // Reset
    document.getElementById('ow-amt').value='';
    document.getElementById('ow-desc').value='';
    if(document.getElementById('ow-cat'))document.getElementById('ow-cat').value='';
    if(document.getElementById('ow-mq'))document.getElementById('ow-mq').value='';
    document.getElementById('ow-proj').value='';
    updatePendingBadge();
  }catch(ex){
    notify('❌ فشل الإرسال: '+friendlyError(ex),'err');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='⏳ إرسال للموافقة';}
  }
}
