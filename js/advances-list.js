
function _advCatFilter(val){
  var dd=document.getElementById('_advCatDD');
  if(!dd)return;
  var base=typeof _CATS!=='undefined'?_CATS:[];
  var extra=(allEntries||[]).map(function(e){return e.category;}).filter(Boolean);
  var all=[...new Set([...base,...extra])].sort();
  var filtered=val?all.filter(function(c){return c.includes(val);}):all;
  if(!val){dd.style.display='none';return;}
  if(!filtered.length){dd.innerHTML='<div style="padding:10px 14px;font-size:12px;color:#999">لا يوجد</div>';dd.style.display='block';return;}
  dd.style.display='block';
  dd.innerHTML=filtered.map(function(c){
    var safe=c.replace(/'/g,"\'");
    return '<div onmousedown="event.preventDefault();document.getElementById(\'advCat\').value=\''+safe+'\';document.getElementById(\'_advCatDD\').style.display=\'none\'" style="padding:10px 14px;font-size:13px;cursor:pointer;border-bottom:1px solid #f0f0ee" onmouseenter="this.style.background=\'#f5f0e8\'" onmouseleave="this.style.background=\'\'" >'+c+'</div>';
  }).join('');
}

async function loadAdvList(){
  setSav('⏳ جاري تحميل العهد...','ng');
  // Populate user selector (admin only)
  if(uRole==='admin'){
    const sel=document.getElementById('advUserSel');
    if(sel&&allChatUsers&&allChatUsers.length){
      sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
      allChatUsers.forEach(u=>{
        const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
        sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
      });
    } else if(sel){
      try{
        const users=await sb('profiles?order=name');
        sel.innerHTML='<option value="">👤 ربط بمستخدم (اختياري)</option>';
        users.forEach(u=>{
          const role={admin:'👑',editor:'✏️',viewer:'👁'}[u.role]||'';
          sel.innerHTML+=`<option value="${u.id}">${role} ${u.name}</option>`;
        });
      }catch(e){notify('⚠️ تعذّر تحميل قائمة المستخدمين','warn');console.warn(e);}
    }
  }
  try{
    const query=uRole==='viewer'
      ?'advances?user_id=eq.'+uid+'&order=created_at'
      :'advances?order=created_at';
    advances=await sb(query);
    const al=document.getElementById('advList');
    if(!advances.length){al.innerHTML='<div class="emp">لا توجد عهد بعد</div>';return;}
    // جيب الدفعات والمصروفات دفعة واحدة
    const [allInst,allE]=await Promise.all([
      sb('advance_installments?order=created_at'),
      sbAll('entries?advance_id=not.is.null')
    ]);
    al.innerHTML=advances.map(a=>{
      const totalGiven=allInst.filter(i=>i.advance_id===a.id).reduce((s,i)=>s+i.amount,0);
      const spent=allE.filter(e=>e.advance_id===a.id).reduce((s,e)=>s+e.amount,0);
      const rem=totalGiven-spent;
      const pct=totalGiven>0?Math.min(100,Math.round((spent/totalGiven)*100)):0;
      const ownerUser=(allChatUsers||[]).find(u=>u.id===a.user_id);
      const ownerBadge=ownerUser&&uRole==='admin'?'<span class="adv-owner-badge">🔗 '+ownerUser.name+'</span>':'';
      const remColor=rem<0?'var(--danger)':rem===0?'var(--primary-btn)':'var(--warning-text)';
      return '<div class="adv-card" onclick="openAdv(\''+a.id+'\')"><div class="adv-card-h"><div class="adv-name">👤 '+a.person_name+ownerBadge+'</div><span class="adv-status '+(a.status==='open'?'open':'closed')+'">'+(a.status==='open'?'⏳ مفتوحة':'✅ مغلقة')+'</span></div>'+(a.notes?'<div class="adv-notes-text">'+a.notes+'</div>':'')+'<div class="adv-nums"><div class="adv-num"><div class="adv-num-l">العهدة</div><div class="adv-num-v" style="color:#185FA5">'+fn(totalGiven)+'</div></div><div class="adv-num"><div class="adv-num-l">صرف</div><div class="adv-num-v" style="color:#922B21">'+fn(spent)+'</div></div><div class="adv-num"><div class="adv-num-l">الباقي</div><div class="adv-num-v" style="color:'+remColor+'">'+fn(rem)+'</div></div></div><div class="adv-progress-wrap"><div class="adv-progress-bar-inner"></div></div></div>';
    }).join('');
    setSav('☁️ متصل — بياناتك محفوظة','ok');
  }catch(e){document.getElementById('advList').innerHTML='<div class="emp">❌ خطأ في التحميل</div>';setSav('❌ خطأ في التحميل','er');}
}
