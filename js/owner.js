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

  var inp='width:100%;padding:10px 12px;border:1.5px solid var(--border-color,rgba(212,196,154,.2));border-radius:8px;font-family:inherit;font-size:13px;outline:none';
  var _d=new Date();var todayISO=_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');

  var isMobile=window.innerWidth<=768;
  if(isMobile){
    el.style.cssText='background:#1D3C2A;position:fixed;top:0;left:0;right:0;bottom:58px;z-index:149;display:flex;flex-direction:column';
  }else{
    el.style.cssText='background:#1D3C2A;display:flex;flex-direction:column;width:100%;min-height:100%';
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
      '<div style="display:flex;background:var(--bg-pure,#fff);border-bottom:1px solid #f0f0ec;flex-shrink:0">'+
        '<div id="ow-tab-add" onclick="owShowTab(\'add\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#1D3C2A;border-bottom:2px solid #1D3C2A;cursor:pointer">➕ قيد</div>'+
        '<div id="ow-tab-adv" onclick="owShowTab(\'adv\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">💼 عهدة</div>'+
        '<div id="ow-tab-pend" onclick="owShowTab(\'pend\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">⏳ <span id="ow-pend-cnt" style="background:#EF9F27;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px">0</span></div>'+
        '<div id="ow-tab-done" onclick="owShowTab(\'done\')" style="flex:1;padding:11px 4px;text-align:center;font-size:11px;font-weight:700;color:#bbb;border-bottom:2px solid transparent;cursor:pointer">✅ موافق</div>'+
      '</div>'+

      // ADD screen
      '<div id="ow-screen-add" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0">'+
        '<div style="flex:1;overflow-y:auto;padding:12px 12px 0">'+
        '<div style="background:#FFF8EC;border:1px solid #F0C060;border-radius:8px;padding:8px 12px;font-size:11px;color:#7A5500;margin-bottom:10px;display:flex;align-items:center;gap:6px">⏳ بتروح للموافقة قبل ما تتسجل</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'+
          '<button id="ow-exp-btn" onclick="owSetType(\'e\')" style="padding:10px;border-radius:10px;border:2px solid #E74C3C;background:#FFF0EE;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:#C0392B">📤 مصروف</button>'+
          '<button id="ow-inc-btn" onclick="owSetType(\'i\')" style="padding:10px;border-radius:10px;border:2px solid #EAEEE8;background:var(--bg-pure,#fff);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:#999">📥 وارد</button>'+
        '</div>'+
        '<div style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">البيان <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-desc" type="text" placeholder="وصف العملية..." style="'+inp+'"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'+
          '<div><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المبلغ <span style="color:#E74C3C">*</span></label>'+
          '<input id="ow-amt" type="number" placeholder="0.00" step="any" style="'+inp+';font-size:16px;font-weight:800;color:#1D3C2A"></div>'+
          '<div><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">التاريخ <span style="color:#E74C3C">*</span></label>'+
          '<input id="ow-date" type="date" style="'+inp+'" value="'+todayISO+'"></div>'+
        '</div>'+
        '<div id="ow-inc-banner"></div>'+
        '<div id="ow-cat-wrap" style="margin-bottom:8px;position:relative"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">البند <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-cat-inp" type="text" placeholder="اكتب أو اختر البند..." autocomplete="off" oninput="owFilterCat(this.value)" onblur="owHideCatDD()" style="'+inp+'">'+
        '<input type="hidden" id="ow-cat">'+
        '<div id="ow-cat-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:var(--bg-card,var(--bg-pure,#fff));border:1.5px solid var(--border,#EAEEE8);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div></div>'+
        '<div style="margin-bottom:8px;position:relative"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المشروع <span style="color:#E74C3C">*</span></label>'+
        '<input id="ow-proj-inp" type="text" placeholder="ابحث عن مشروع..." autocomplete="off" oninput="owFilterProj(this.value)" onblur="owHideProjDD()" style="'+inp+'">'+
        '<input type="hidden" id="ow-proj">'+
        '<div id="ow-proj-dd" style="display:none;position:absolute;top:calc(100% + 4px);right:0;left:0;background:var(--bg-card,var(--bg-pure,#fff));border:1.5px solid var(--border,#EAEEE8);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:999;max-height:140px;overflow-y:auto"></div></div>'+
        '<div id="ow-mq-wrap" style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المقاول</label>'+
        '<input id="ow-mq" type="text" placeholder="اختياري" style="'+inp+'"></div>'+
        '<div style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">طريقة الدفع / الاستقبال <span style="color:#E74C3C">*</span></label>'+
        '<select id="ow-pmt" onchange="owPmtChange(this.value)" style="'+inp+';background:var(--bg-pure,#fff)">'+
          '<option value="">اختر...</option>'+
          '<option value="Cash">💵 Cash</option>'+
          '<option value="Al Ahly">🏦 Al Ahly</option>'+
          '<option value="CIB">🏦 CIB</option>'+
          '<option value="CIB شركات">🏦 CIB شركات</option>'+
          '<option value="أخرى">✏️ أخرى</option>'+
        '</select>'+
        '<input id="ow-pmt-other" type="text" placeholder="اسم البنك..." style="'+inp+';display:none;margin-top:6px"></div>'+
        '<div style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><label style="font-size:10px;color:#999;font-weight:700">صورة الفاتورة</label><span style="font-size:9px;color:#bbb;background:#f0f0ec;border-radius:10px;padding:1px 6px">اختياري</span></div>'+
        '<input type="file" id="ow-inv-file" accept="image/*,application/pdf" style="display:none" onchange="owInvSelect(this)" multiple>'+
        '<div id="ow-inv-area" style="border:1.5px dashed #ccc;border-radius:10px;overflow:hidden;display:block">'+
          '<label for="ow-inv-file" id="ow-inv-empty" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;cursor:pointer"><span style="font-size:16px">📎</span><span style="font-size:12px;color:#aaa;font-weight:600">إرفاق صورة أو PDF (يمكن أكثر من صورة)</span></label>'+
          '<div id="ow-inv-filled" style="display:none;flex-direction:column;padding:8px 10px;background:#f0faf0">'+
            '<div id="ow-inv-list"></div>'+
          '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<div style="padding:12px 12px calc(12px + env(safe-area-inset-bottom,0px));flex-shrink:0;background:#f8faf8;border-top:0.5px solid #eee">'+
        '<button onclick="owSubmit()" style="width:100%;padding:13px;background:#1D3C2A;color:#D4C49A;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer">⏳ إرسال للموافقة</button>'+
        '</div>'+
      '</div>'+

      // PENDING screen
      '<div id="ow-screen-pend" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div id="ow-pend-list"><div style="text-align:center;padding:40px;color:#ccc">⏳ جاري التحميل...</div></div>'+
      '</div>'+

      // ADVANCE screen
      '<div id="ow-screen-adv" style="display:none;flex:1;overflow-y:auto;padding:12px">'+
        '<div style="background:var(--bg-faint,#EEF2FF);border:1px solid var(--border,#C5CFE8);border-radius:8px;padding:8px 12px;font-size:11px;color:#3A4A8A;margin-bottom:12px">💡 اختر الشخص اللي هتدي له دفعة عهدة — هتروح للأدمن للموافقة</div>'+
        '<div style="margin-bottom:10px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:6px">اختر الشخص <span style=\"color:#E74C3C\">*</span></label>'+
        '<div id="ow-viewers-list">⏳ جاري التحميل...</div></div>'+
        '<div style="margin-bottom:8px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">المبلغ <span style=\"color:#E74C3C\">*</span></label>'+
        '<input id="ow-adv-amt" type="number" placeholder="0.00" step="any" style=\"width:100%;padding:10px 12px;border:1.5px solid var(--border,#EAEEE8);border-radius:8px;font-family:inherit;font-size:16px;font-weight:800;color:#1D3C2A;background:var(--bg-pure,#fff);outline:none\"></div>'+
        '<div style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">ملاحظة</label>'+
        '<input id="ow-adv-note" type="text" placeholder="سبب الدفعة..." style=\"width:100%;padding:10px 12px;border:1.5px solid var(--border,#EAEEE8);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg-pure,#fff);outline:none\"></div>'+
        '<div style="margin-bottom:12px"><label style="font-size:10px;color:#999;font-weight:700;display:block;margin-bottom:4px">طريقة الدفع / الاستقبال <span style="color:#E74C3C">*</span></label>'+
        '<select id="ow-adv-pmt" onchange="owAdvPmtChange(this.value)" style="width:100%;padding:10px 12px;border:1.5px solid var(--border,#EAEEE8);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg-pure,#fff);outline:none">'+
          '<option value="">اختر...</option>'+
          '<option value="Cash">💵 Cash</option>'+
          '<option value="Al Ahly">🏦 Al Ahly</option>'+
          '<option value="CIB">🏦 CIB</option>'+
          '<option value="CIB شركات">🏦 CIB شركات</option>'+
          '<option value="أخرى">✏️ أخرى</option>'+
        '</select>'+
        '<input id="ow-adv-pmt-other" type="text" placeholder="اسم البنك..." style="display:none;width:100%;margin-top:6px;padding:10px 12px;border:1.5px solid var(--border,#EAEEE8);border-radius:8px;font-family:inherit;font-size:13px;background:var(--bg-pure,#fff);outline:none"></div>'+
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
  var flexScreens={'add':true};
  ['add','adv','pend','done'].forEach(function(x){
    var tab=document.getElementById('ow-tab-'+x);
    var scr=document.getElementById('ow-screen-'+x);
    if(tab){tab.style.color=x===t?'#1D3C2A':'#bbb';tab.style.borderBottom=x===t?'2px solid #1D3C2A':'2px solid transparent';}
    if(scr)scr.style.display=x===t?(flexScreens[x]?'flex':'block'):'none';
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
  var base=typeof _CATS!=='undefined'?_CATS:[];
  var extra=(allEntries||[]).map(function(e){return e.category;}).filter(Boolean);
  var all=[...new Set([...base,...extra])].sort();
  if(!val){dd.style.display='none';return;}
  var filtered=all.filter(function(c){return c.includes(val);});
  if(!filtered.length){dd.innerHTML='<div style="padding:10px 14px;font-size:12px;color:#999">لا يوجد</div>';dd.style.display='block';return;}
  dd.style.display='block';
  dd.innerHTML=filtered.map(function(c){
    var safe=c.replace(/'/g,"\'");
    return '<div onmousedown="event.preventDefault();owSelectCat(\''+safe+'\')" style="padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0ee" onmouseenter="this.style.background=\'#f5f0e8\'" onmouseleave="this.style.background=\'\'">  '+c+'</div>';
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
  // تفعيل تنبيه الوارد
  var owAmtEl=document.getElementById('ow-amt');
  if(owAmtEl&&!owAmtEl._incBound){
    owAmtEl._incBound=true;
    owAmtEl.addEventListener('input',function(){
      var existing=document.getElementById('_incAlert');
      if(existing)existing.remove();
      if(window._owType!=='i')return;
      var amt=parseFloat(this.value)||0;
      var banner=typeof _showIncomingAlert==='function'?_showIncomingAlert(amt):null;
      if(!banner)return;
      var bp=document.getElementById('ow-inc-banner');
      if(bp){bp.innerHTML='';bp.appendChild(banner);}else{this.parentNode.parentNode.appendChild(banner);}
    });
  }
  // حذف البانر لما يرجع لمصروف
  if(t==='e'){var ex=document.getElementById('_incAlert');if(ex)ex.remove();}

}

function owFilterProj(q){
  var dd=document.getElementById('ow-proj-dd');
  var hidden=document.getElementById('ow-proj');
  if(!dd)return;
  if(!q.trim()){dd.style.display='none';if(hidden)hidden.value='';return;}
  var matches=allProjects.filter(function(p){return p.name.indexOf(q)!==-1||p.name.toLowerCase().indexOf(q.toLowerCase())!==-1;});
  if(!matches.length){dd.style.display='none';return;}
  dd.innerHTML=matches.slice(0,8).map(function(p){
    return '<div onclick="owSelectProj(this)" data-id="'+p.id+'" data-name="'+p.name+'" style="padding:9px 12px;cursor:pointer;font-size:13px;color:#333;border-bottom:1px solid var(--border,#F5F5F3)" onmouseover="this.style.background=\'#F0F7F2\'" onmouseout="this.style.background=\'\'">📁 '+p.name+'</div>';
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
  var isPending=statusClr==='#E67E22';
  var editBtn=isPending?'<button onclick="owEditEntry(\''+e.id+'\')" style="background:none;border:1px solid #999;border-radius:8px;padding:2px 10px;font-size:10px;color:#555;cursor:pointer;font-family:inherit">✏️ تعديل</button>':'';
  var invRow='';
  if(e.img_url){
    var safeUrl=e.img_url.replace(/'/g,"%27");
    var safeDesc=(e.description||'قيد').replace(/'/g,' ');
    invRow='<div onclick="openInvLb(\'' +safeUrl+ '\',\'' +safeDesc+ '\',\'\')" style="display:flex;align-items:center;gap:8px;padding:6px 14px;background:#f0faf0;border-top:1px solid #e0f0e0;cursor:pointer"><img src="' +e.img_url+ '" style="width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0;border:1px solid #c8e6c9"><span style="font-size:11px;font-weight:600;color:#1D6A3E">📎 فاتورة مرفقة — اضغط للعرض</span></div>';
  }
  return '<div style="background:var(--bg-pure,#fff);border-radius:12px;margin-bottom:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.05)">'+
    '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px 5px">'+
      '<div style="font-size:11px;color:#888;font-weight:600">'+pName+'</div>'+
      '<div style="font-size:15px;font-weight:900;margin-right:auto;color:'+amtClr+'">'+amtSign+fn(e.amount)+' ج</div>'+
    '</div>'+
    '<div style="padding:2px 14px 7px;display:flex;align-items:center;gap:6px">'+
      '<span style="font-size:10px;'+catBg+';border-radius:10px;padding:2px 8px;white-space:nowrap">'+cat+'</span>'+
      '<span style="font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">'+(e.description||'—')+'</span>'+
    '</div>'+
    invRow+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 14px;border-top:1px solid #f8f8f6">'+
      '<span style="font-size:10px;font-weight:700;color:'+statusClr+'">'+statusTxt+'</span>'+
      '<div style="display:flex;align-items:center;gap:8px">'+editBtn+'<span style="font-size:10px;color:#ccc">'+(e.entry_date||'—')+'</span></div>'+
    '</div>'+
  '</div>';
}

async function owEditEntry(id){
  var rows=await sb('pending_entries?id=eq.'+id);
  if(!rows||!rows.length){notify('مش لاقي القيد','er');return;}
  var e=rows[0];
  // ابني قائمة المشاريع
  var projOpts=allProjects.map(function(p){return '<option value="'+p.id+'"'+(p.id===e.project_id?' selected':'')+'>'+p.name+'</option>';}).join('');
  // بنود شائعة
  var cats=['مرتبات','مواد','مقاولين','توصيل','شخصي','تشوينات','رخام','مطبخ','أثاث','كهرباء','سباكة','دهانات','أعمال خشب','نجارة','حديد','خرسانة','تكييف','أعمال أخرى'];
  var catOpts=cats.map(function(c){return '<option value="'+c+'"'+(c===e.category?' selected':'')+'>'+c+'</option>';}).join('');
  var modal=document.createElement('div');
  modal.id='owEditModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML='<div style="background:#fff;border-radius:16px;width:100%;max-width:420px;padding:20px;font-family:inherit">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'+
      '<div style="font-size:15px;font-weight:800;color:#333">✏️ تعديل القيد</div>'+
      '<button onclick="document.getElementById(\'owEditModal\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999">×</button>'+
    '</div>'+
    '<div style="margin-bottom:10px"><label style="font-size:11px;color:#888;font-weight:700">المشروع</label>'+
      '<select id="oeProj" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-family:inherit;font-size:13px">'+projOpts+'</select></div>'+
    '<div style="margin-bottom:10px"><label style="font-size:11px;color:#888;font-weight:700">النوع</label>'+
      '<div style="display:flex;gap:8px;margin-top:4px">'+
        '<button id="oeTypeI" onclick="owSetEditType(\'i\')" style="flex:1;padding:8px;border-radius:8px;border:2px solid '+(e.type==='i'?'#1D6A3E':'#ddd')+';background:'+(e.type==='i'?'#EAF7EE':'#fff')+';color:'+(e.type==='i'?'#1D6A3E':'#666')+';font-weight:700;cursor:pointer;font-family:inherit">▲ وارد</button>'+
        '<button id="oeTypeE" onclick="owSetEditType(\'e\')" style="flex:1;padding:8px;border-radius:8px;border:2px solid '+(e.type==='e'?'#C0392B':'#ddd')+';background:'+(e.type==='e'?'#FFF0EE':'#fff')+';color:'+(e.type==='e'?'#C0392B':'#666')+';font-weight:700;cursor:pointer;font-family:inherit">▼ مصروف</button>'+
      '</div></div>'+
    '<div style="margin-bottom:10px"><label style="font-size:11px;color:#888;font-weight:700">المبلغ</label>'+
      '<input id="oeAmt" type="number" value="'+e.amount+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-family:inherit;font-size:14px;box-sizing:border-box"></div>'+
    '<div style="margin-bottom:10px"><label style="font-size:11px;color:#888;font-weight:700">البند</label>'+
      '<select id="oeCat" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-family:inherit;font-size:13px">'+catOpts+'</select></div>'+
    '<div style="margin-bottom:10px"><label style="font-size:11px;color:#888;font-weight:700">البيان</label>'+
      '<input id="oeDesc" type="text" value="'+(e.description||'')+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>'+
    '<div style="margin-bottom:16px"><label style="font-size:11px;color:#888;font-weight:700">التاريخ</label>'+
      '<input id="oeDt" type="date" value="'+(e.entry_date||(e.submitted_at?e.submitted_at.substring(0,10):''))+'" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:8px;margin-top:4px;font-family:inherit;font-size:13px;box-sizing:border-box"></div>'+
    '<div style="margin-bottom:12px">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'+
        '<label style="font-size:11px;color:#888;font-weight:700">📎 صورة الفاتورة</label>'+
        (e.img_url?'<button onclick="owClearEditInv()" style="background:none;border:none;color:#E74C3C;font-size:11px;cursor:pointer;font-family:inherit">🗑 حذف الصورة</button>':'')+
      '</div>'+
      (e.img_url?'<div id="oeInvPreview" style="border-radius:8px;overflow:hidden;border:1px solid #c8e6c9;margin-bottom:6px"><img src="'+e.img_url+'" style="width:100%;max-height:140px;object-fit:cover;display:block;cursor:zoom-in" onclick="openInvLb(\''+e.img_url.replace(/'/g,"%27")+'\',\'فاتورة\',\'\')" ></div>':'<div id="oeInvPreview"></div>')+
      '<input type="file" id="oeInvFile" accept="image/*,application/pdf" style="display:none" onchange="owEditInvSelect(this)">'+
      '<label for="oeInvFile" style="display:flex;align-items:center;gap:6px;padding:7px 12px;border:1.5px dashed #ccc;border-radius:8px;cursor:pointer;font-size:12px;color:#888">📷 '+(e.img_url?'تغيير الصورة':'إرفاق صورة')+'</label>'+
    '</div>'+
    '<div id="oeSavMsg" style="font-size:12px;text-align:center;margin-bottom:8px;min-height:16px"></div>'+
    '<button onclick="owSaveEditEntry(\''+id+'\')" style="width:100%;padding:12px;background:#2C6E3F;color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit">💾 حفظ التعديل</button>'+
  '</div>';
  // حفظ النوع الحالي
  window._owEditType=e.type;
  document.body.appendChild(modal);
}

function owSetEditType(t){
  window._owEditType=t;
  var bi=document.getElementById('oeTypeI');
  var be=document.getElementById('oeTypeE');
  if(bi){bi.style.border='2px solid '+(t==='i'?'#1D6A3E':'#ddd');bi.style.background=t==='i'?'#EAF7EE':'#fff';bi.style.color=t==='i'?'#1D6A3E':'#666';}
  if(be){be.style.border='2px solid '+(t==='e'?'#C0392B':'#ddd');be.style.background=t==='e'?'#FFF0EE':'#fff';be.style.color=t==='e'?'#C0392B':'#666';}
}

function owEditInvSelect(input){
  var file=input.files[0];if(!file)return;
  window._owEditInvFile=file;
  var preview=document.getElementById('oeInvPreview');
  if(!preview)return;
  if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
    preview.innerHTML='<div style="padding:12px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:8px;font-size:12px;color:#1D6A3E;text-align:center">📄 '+file.name+'</div>';
  }else{
    var reader=new FileReader();
    reader.onload=function(ev){
      preview.innerHTML='<img src="'+ev.target.result+'" style="width:100%;max-height:140px;object-fit:cover;display:block;border-radius:8px">';
    };
    reader.readAsDataURL(file);
  }
  // تغيير نص الـ label
  var lbl=document.querySelector('label[for="oeInvFile"]');
  if(lbl)lbl.innerHTML='✅ '+file.name.substring(0,30);
}

function owClearEditInv(){
  window._owEditInvFile=null;
  window._owEditInvClear=true;
  var preview=document.getElementById('oeInvPreview');
  if(preview)preview.innerHTML='';
  var lbl=document.querySelector('label[for="oeInvFile"]');
  if(lbl)lbl.innerHTML='📷 إرفاق صورة';
  var inp=document.getElementById('oeInvFile');
  if(inp)inp.value='';
}

async function owSaveEditEntry(id){
  var msg=document.getElementById('oeSavMsg');
  var proj=document.getElementById('oeProj').value;
  var amt=parseFloat(document.getElementById('oeAmt').value);
  var cat=document.getElementById('oeCat').value;
  var desc=document.getElementById('oeDesc').value.trim();
  var dt=document.getElementById('oeDt').value;
  var t=window._owEditType||'e';
  if(!proj||!amt||!desc||!dt){msg.textContent='⚠️ أكمل كل البيانات';msg.style.color='#E67E22';return;}
  msg.textContent='⏳ جاري الحفظ...';msg.style.color='#888';
  try{
    var patch={project_id:proj,type:t,amount:amt,category:cat,description:desc,entry_date:dt};
    // لو فيه صورة جديدة
    if(window._owEditInvFile){
      var file=window._owEditInvFile;
      var isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
      var uploadFile=file;
      if(!isPdf){
        uploadFile=await new Promise(function(res){
          var reader=new FileReader();
          reader.onload=function(ev){
            var img=new Image();
            img.onload=function(){
              var MAX=1400,w=img.width,h=img.height;
              if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
              var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
              canvas.getContext('2d').drawImage(img,0,0,w,h);
              canvas.toBlob(function(blob){res(blob);},'image/jpeg',0.80);
            };
            img.src=ev.target.result;
          };
          reader.readAsDataURL(file);
        });
      }
      var ext=isPdf?'pdf':'jpg';
      var path=id+'/invoice_'+Date.now()+'.'+ext;
      var AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
      var r=await fetch(SB+'/storage/v1/object/invoices/'+path,{method:'POST',headers:{'Authorization':'Bearer '+(token||AK),'apikey':AK,'Content-Type':isPdf?'application/pdf':'image/jpeg','x-upsert':'true'},body:uploadFile});
      if(r.ok){patch.img_url=SB+'/storage/v1/object/public/invoices/'+path;}
      window._owEditInvFile=null;
    } else if(window._owEditInvClear){
      patch.img_url=null;
      window._owEditInvClear=false;
    }
    await sb('pending_entries?id=eq.'+id,'PATCH',patch);
    msg.textContent='✅ تم التعديل';msg.style.color='#1D6A3E';
    setTimeout(function(){document.getElementById('owEditModal')&&document.getElementById('owEditModal').remove();owLoadPending();},800);
  }catch(ex){msg.textContent='❌ حصل خطأ';msg.style.color='#C0392B';}
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
          '<span style="font-size:11px;font-weight:700;background:var(--bg-faint,#EEF2FF);color:#3A4A8A;padding:2px 8px;border-radius:8px">💼 دفعة عهدة</span>'+
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
    if((window._owInvFiles||[]).length) await owInvUpload(entry.id);
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
    owInvRemove();
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
    var inp='width:100%;padding:10px 12px;border:1.5px solid var(--border-color,rgba(212,196,154,.2));border-radius:8px;font-family:inherit;font-size:13px;outline:none';
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
      return '<div id="ow-viewer-'+v.id+'" data-vid="'+v.id+'" onclick="owSelectViewer(this.dataset.vid)" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:2px solid #EAEEE8;background:var(--bg-pure,#fff);margin-bottom:8px;cursor:pointer;transition:all .15s">'+
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

// ══ OWNER INVOICE ════════════════════════════════
function owInvTrigger(){
  // allow multiple files
  document.getElementById('ow-inv-file').click();
}

function owInvSelect(input){
  const files=Array.from(input.files);if(!files.length)return;
  const tooBig=files.filter(f=>f.size>20*1024*1024);
  if(tooBig.length){notify('ملف أكبر من 20MB: '+tooBig[0].name,'err');return;}
  window._owInvFiles=(window._owInvFiles||[]).concat(files);
  _owInvRenderList();
  input.value='';
}
function _owInvRenderList(){
  const files=window._owInvFiles||[];
  const empty=document.getElementById('ow-inv-empty');
  const filled=document.getElementById('ow-inv-filled');
  const area=document.getElementById('ow-inv-area');
  const list=document.getElementById('ow-inv-list');
  if(!files.length){
    if(empty)empty.style.display='flex';
    if(filled)filled.style.display='none';
    if(area){area.style.borderColor='#ccc';area.style.borderStyle='dashed';}
    return;
  }
  if(empty)empty.style.display='none';
  if(filled)filled.style.display='flex';
  if(area){area.style.borderColor='#81c784';area.style.borderStyle='solid';}
  if(!list)return;
  list.innerHTML='';
  files.forEach((file,idx)=>{
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    const name=file.name.length>28?file.name.substring(0,26)+'…':file.name;
    const size=file.size<1024*1024?(file.size/1024).toFixed(0)+' KB':(file.size/1024/1024).toFixed(1)+' MB';
    const item=document.createElement('div');
    item.style.cssText='display:flex;align-items:center;gap:8px;padding:5px 8px;background:#f0faf0;border:1px solid #c8e6c9;border-radius:8px;margin-bottom:4px';
    item.innerHTML=`<div class="ow-inv-thumb-${idx}" style="width:36px;height:36px;background:#e8f5e9;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${isPdf?'📄':'🖼'}</div>
      <div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;color:#1D6A3E;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</div><div style="font-size:10px;color:#888">${size}</div></div>
      <button onclick="owInvRemoveOne(${idx})" style="background:none;border:none;color:#E74C3C;cursor:pointer;font-size:14px;padding:2px 4px;flex-shrink:0">✕</button>`;
    if(!isPdf){
      const reader=new FileReader();
      reader.onload=ev=>{
        const th=item.querySelector('.ow-inv-thumb-'+idx);
        if(th)th.innerHTML='<img src="'+ev.target.result+'" style="width:36px;height:36px;object-fit:cover;border-radius:5px">';
      };
      reader.readAsDataURL(file);
    }
    list.appendChild(item);
  });
  const addBtn=document.createElement('label');
  addBtn.htmlFor='ow-inv-file';
  addBtn.style.cssText='display:flex;align-items:center;gap:5px;padding:5px 10px;border:1.5px dashed #81c784;border-radius:8px;cursor:pointer;font-size:11px;color:#1D6A3E;margin-top:4px;width:fit-content';
  addBtn.innerHTML='➕ إضافة صورة أخرى';
  list.appendChild(addBtn);
}
function owInvRemoveOne(idx){
  window._owInvFiles=(window._owInvFiles||[]).filter((_,i)=>i!==idx);
  _owInvRenderList();
}

function owInvRemove(){
  window._owInvFiles=[];
  _owInvRenderList();
  const inp=document.getElementById('ow-inv-file');
  if(inp)inp.value='';
}

function owInvPreview(){
  const files=window._owInvFiles||[];
  const file=files[0];if(!file)return;
  const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
  if(isPdf){window.open(URL.createObjectURL(file),'_blank');return;}
  const reader=new FileReader();
  reader.onload=function(e){openInvLb(e.target.result,file.name,'لم يتم الحفظ بعد');};
  reader.readAsDataURL(file);
}

async function owInvUpload(entryId){
  const files=window._owInvFiles||[];
  if(!files.length||!entryId)return;
  const urls=[];
  for(const file of files){
  try{
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    let uploadFile=file;
    if(!isPdf){
      uploadFile=await new Promise((res)=>{
        const reader=new FileReader();
        reader.onload=function(e){
          const img=new Image();
          img.onload=function(){
            const MAX=1400;
            let w=img.width,h=img.height;
            if(w>MAX||h>MAX){if(w>h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
            const canvas=document.createElement('canvas');
            canvas.width=w;canvas.height=h;
            canvas.getContext('2d').drawImage(img,0,0,w,h);
            canvas.toBlob(function(blob){res(blob);},'image/jpeg',0.80);
          };
          img.src=e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
    const ext=isPdf?'pdf':'jpg';
    const path=`${entryId}/invoice_${Date.now()}.${ext}`;
    const AK='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Y29xZ2x1YXl0d2VsbnV0cm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTU5MTIsImV4cCI6MjA5NDE5MTkxMn0.Bh3LH_tkSe9H1olWr3R9-ETa_cNnD9EjZwU8yTKbn_o';
    const r=await fetch(`${SB}/storage/v1/object/invoices/${path}`,{
      method:'POST',
      headers:{'Authorization':'Bearer '+(token||AK),'apikey':AK,'Content-Type':isPdf?'application/pdf':'image/jpeg','x-upsert':'true'},
      body:uploadFile
    });
    if(r.ok){
      const pub=`${SB}/storage/v1/object/public/invoices/${path}`;
      urls.push(pub);
    }else{
      const errText=await r.text();
      console.error('owInvUpload failed:',r.status,errText);
      notify('⚠️ فشل رفع الفاتورة: '+r.status,'warn');
    }
  }catch(e){console.warn('owInvUpload error:',e);}
  }// end for
  if(urls.length){
    const imgVal=urls.length===1?urls[0]:JSON.stringify(urls);
    await sb('pending_entries?id=eq.'+entryId,'PATCH',{img_url:imgVal});
  }
  window._owInvFiles=[];
  owInvRemove();
}
