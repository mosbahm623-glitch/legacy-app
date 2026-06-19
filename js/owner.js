// ══ OWNER SCREEN ══════════════════════════════════════

async function loadOwnerScreen(){
  const el=document.getElementById('ownerScreen');
  if(!el)return;

  if(!allProjects||!allProjects.length){
    el.innerHTML='<div style="text-align:center;padding:40px;color:#888">⏳ جاري التحميل...</div>';
    setTimeout(loadOwnerScreen,800);
    return;
  }

  const projs=[...allProjects].sort((a,b)=>a.name.localeCompare(b.name,'ar'));
  let projOpts='<option value="">اختر المشروع...</option>';
  projs.forEach(p=>{ projOpts+='<option value="'+p.id+'">'+p.name+'</option>'; });

  el.innerHTML=
    // Header
    '<div style="background:#1D3C2A;color:#D4C49A;padding:10px 14px;display:flex;align-items:center;justify-content:space-between">'+
      '<span style="font-size:14px;font-weight:700">'+uName+'</span>'+
      '<span style="font-size:11px;background:#D4C49A22;border:0.5px solid #D4C49A44;padding:2px 10px;border-radius:20px">🏢 أونر</span>'+
    '</div>'+

    // Tabs
    '<div style="display:flex;background:#fff;border-bottom:1px solid #e8e8e4">'+
      '<div id="owtab-add" onclick="owTab(\'add\')" style="flex:1;padding:10px;text-align:center;font-size:13px;font-weight:600;color:#1D3C2A;border-bottom:2px solid #1D3C2A;cursor:pointer">➕ قيد جديد</div>'+
      '<div id="owtab-pend" onclick="owTab(\'pend\')" style="flex:1;padding:10px;text-align:center;font-size:13px;font-weight:600;color:#888;border-bottom:2px solid transparent;cursor:pointer">⏳ في الانتظار <span id="owPendCount" style="background:#EF9F27;color:#fff;font-size:10px;padding:1px 6px;border-radius:10px;margin-right:4px">0</span></div>'+
    '</div>'+

    // Add form
    '<div id="ow-add">'+
      '<div style="background:#FAEEDA;border:0.5px solid #EF9F27;padding:8px 14px;font-size:12px;color:#633806;display:flex;align-items:center;gap:6px">'+
        '⏳ القيود بتروح للموافقة أولاً'+
      '</div>'+

      // Type toggle - same style as projScreen
      '<div class="ef">'+
        '<div class="tt">'+
          '<button class="tb on" id="ow-exp-btn" onclick="owSetType(\'e\')">📥 مصروف</button>'+
          '<button class="tb" id="ow-inc-btn" onclick="owSetType(\'i\')">📤 وارد</button>'+
        '</div>'+

        // Fields
        '<div class="ig">'+
          '<div class="ig-field full">'+
            '<div class="ig-lbl">البيان <span class="ig-req">*</span></div>'+
            '<input id="ow-desc" placeholder="وصف العملية..." class="input-full">'+
          '</div>'+
          '<div class="ig-field">'+
            '<div class="ig-lbl">المبلغ (ج) <span class="ig-req">*</span></div>'+
            '<input id="ow-amt" type="number" placeholder="0.00" step="any" class="req-left">'+
          '</div>'+
          '<div class="ig-field">'+
            '<div class="ig-lbl">التاريخ <span class="ig-req">*</span></div>'+
            '<input id="ow-date" type="text" placeholder="dd/mm/yyyy" maxlength="10" class="req-left" value="'+owToday()+'">'+
          '</div>'+
          '<div class="ig-field">'+
            '<div class="ig-lbl">البند <span class="ig-req">*</span></div>'+
            '<select id="ow-cat" class="input-full"><option value="">اختر البند...</option>'+
            (allCategories||[]).map(c=>'<option value="'+c+'">'+c+'</option>').join('')+
            '</select>'+
          '</div>'+
          '<div class="ig-field">'+
            '<div class="ig-lbl">المقاول</div>'+
            '<input id="ow-mq" placeholder="اختياري" class="input-full">'+
          '</div>'+
          '<div class="ig-field full">'+
            '<div class="ig-lbl">المشروع <span class="ig-req">*</span></div>'+
            '<select id="ow-proj" class="input-full">'+projOpts+'</select>'+
          '</div>'+
        '</div>'+

        // Submit
        '<button class="ab" onclick="owSubmit()" style="width:100%;margin-top:4px">⏳ إرسال للموافقة</button>'+
      '</div>'+
    '</div>'+

    // Pending list
    '<div id="ow-pend" style="display:none;padding:14px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
        '<span style="font-size:14px;font-weight:700;color:#1D3C2A">قيودي المعلقة</span>'+
        '<span id="owPendCount2" style="background:#FAEEDA;color:#633806;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px">0</span>'+
      '</div>'+
      '<div id="ow-pend-list">⏳ جاري التحميل...</div>'+
    '</div>';

  window._owType='e';
  owLoadPending();
}

function owToday(){
  const d=new Date();
  return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
}

function owTab(t){
  const addDiv=document.getElementById('ow-add');
  const pendDiv=document.getElementById('ow-pend');
  const addTab=document.getElementById('owtab-add');
  const pendTab=document.getElementById('owtab-pend');
  if(!addDiv||!pendDiv)return;
  if(t==='add'){
    addDiv.style.display='block';pendDiv.style.display='none';
    if(addTab){addTab.style.color='#1D3C2A';addTab.style.borderBottom='2px solid #1D3C2A';}
    if(pendTab){pendTab.style.color='#888';pendTab.style.borderBottom='2px solid transparent';}
  }else{
    addDiv.style.display='none';pendDiv.style.display='block';
    if(pendTab){pendTab.style.color='#1D3C2A';pendTab.style.borderBottom='2px solid #1D3C2A';}
    if(addTab){addTab.style.color='#888';addTab.style.borderBottom='2px solid transparent';}
    owLoadPending();
  }
}

function owSetType(t){
  window._owType=t;
  const expBtn=document.getElementById('ow-exp-btn');
  const incBtn=document.getElementById('ow-inc-btn');
  if(!expBtn||!incBtn)return;
  if(t==='e'){
    expBtn.className='tb on';
    incBtn.className='tb';
  }else{
    incBtn.className='tb on';
    expBtn.className='tb';
  }
}

async function owSubmit(){
  const amt=parseFloat(document.getElementById('ow-amt').value);
  const desc=(document.getElementById('ow-desc').value||'').trim();
  const cat=document.getElementById('ow-cat').value;
  const projId=document.getElementById('ow-proj').value;
  const date=document.getElementById('ow-date').value;
  const mq=(document.getElementById('ow-mq').value||'').trim();
  if(!amt||!desc||!cat||!projId){notify('❌ اكمل الحقول المطلوبة','err');return;}
  const entry={
    id:crypto.randomUUID(),
    project_id:projId,
    type:window._owType||'e',
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
  try{
    await sb('pending_entries','POST',entry);
    notify('⏳ تم الإرسال — في انتظار موافقة الأدمن','warn');
    document.getElementById('ow-amt').value='';
    document.getElementById('ow-desc').value='';
    document.getElementById('ow-cat').value='';
    document.getElementById('ow-mq').value='';
    owLoadPending();
    owTab('pend');
  }catch(ex){notify('❌ فشل الإرسال: '+friendlyError(ex),'err');}
}

async function owLoadPending(){
  try{
    const pend=await sb('pending_entries?submitted_by=eq.'+uid+'&status=eq.pending&order=submitted_at.desc');
    const count=pend.length;
    ['owPendCount','owPendCount2'].forEach(function(id){
      const el=document.getElementById(id);
      if(el)el.textContent=count;
    });
    const listEl=document.getElementById('ow-pend-list');
    if(!listEl)return;
    if(!count){
      listEl.innerHTML='<div style="text-align:center;padding:40px;color:#aaa"><div style="font-size:32px;margin-bottom:8px">✅</div><div style="font-size:13px">مفيش قيود في الانتظار</div></div>';
      return;
    }
    const projMap={};
    allProjects.forEach(function(p){projMap[p.id]=p.name;});
    let html='';
    pend.forEach(function(e){
      const pName=projMap[e.project_id]||'—';
      const amtClr=e.type==='i'?'#1D6A3E':'#C0392B';
      const amtSign=e.type==='i'?'+':'-';
      html+='<div style="background:#fff;border-radius:10px;border:0.5px solid #e8e8e4;margin-bottom:8px;overflow:hidden">'+
        '<div style="display:flex;align-items:center;gap:8px;padding:10px 12px 6px">'+
          '<span style="background:#1D3C2A;color:#D4C49A;font-size:10px;font-weight:700;padding:2px 7px;border-radius:5px">معلق</span>'+
          '<span style="font-size:11px;color:#888">'+pName+'</span>'+
          '<span style="font-size:15px;font-weight:800;margin-right:auto;color:'+amtClr+'">'+amtSign+fn(e.amount)+' ج</span>'+
        '</div>'+
        '<div style="padding:2px 12px 8px;display:flex;align-items:center;gap:6px">'+
          '<span style="font-size:10px;background:#f0f0ec;border:0.5px solid #ddd;border-radius:10px;padding:2px 8px;color:#666">'+(e.category||'—')+'</span>'+
          '<span style="font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">'+(e.description||'—')+'</span>'+
        '</div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 12px;background:#FFFBF2;border-top:0.5px solid #f0ead8">'+
          '<span style="font-size:10px;font-weight:600;color:#854F0B">⏳ في انتظار الموافقة</span>'+
          '<span style="font-size:10px;color:#aaa">'+(e.entry_date||'—')+'</span>'+
        '</div>'+
      '</div>';
    });
    listEl.innerHTML=html;
  }catch(ex){console.error('owLoadPending:',ex);}
}
