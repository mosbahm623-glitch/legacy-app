function goToNotes(){showScreen('notes');}
if(typeof _notesFilter==='undefined') var _notesFilter='all';
if(typeof _notesList==='undefined') var _notesList=[];

// ██ NOTES — الملاحظات والمهام ══════════════════════
const _noteColors=[
  {bg:'#E8F5E9',txt:'#1D6A3E',lbl:'عمل'},
  {bg:'#FFF8E1',txt:'#854F0B',lbl:'متابعة'},
  {bg:'#E3F2FD',txt:'#0C447C',lbl:'مالي'},
  {bg:'#FCE4EC',txt:'#72243E',lbl:'عاجل'},
];

function loadNotesScreen(){
  const dateEl=document.getElementById('notesScreenDate');
  if(dateEl)dateEl.textContent=new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  loadNotes().then(()=>renderNotesScreen());
}

function renderNotesScreen(){
  const undone=_notesList.filter(n=>!n.done).length;
  const done=_notesList.filter(n=>n.done).length;
  const stats=document.getElementById('notesScreenStats');
  if(stats)stats.innerHTML=`
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:var(--text-body)">${_notesList.length}</div>
      <div style="font-size:11px;color:var(--text-hint)">إجمالي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:#E57373">${undone}</div>
      <div style="font-size:11px;color:var(--text-hint)">متبقي</div>
    </div>
    <div style="background:var(--bg-faint);border-radius:12px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:var(--primary)">${done}</div>
      <div style="font-size:11px;color:var(--text-hint)">منتهي</div>
    </div>`;

  const el=document.getElementById('notesScreenList');
  if(!el)return;
  const list=_notesFilter==='all'?_notesList:_notesFilter==='done'?_notesList.filter(n=>n.done):_notesList.filter(n=>!n.done);
  if(!list.length){el.innerHTML='<div class="emp">لا توجد ملاحظات</div>';return;}
  el.innerHTML=list.map((n,i)=>{
    const c=_noteColors[i%_noteColors.length];
    return`<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;margin-bottom:8px;border:0.5px solid var(--border-color);background:var(--bg-pure);transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='var(--bg-pure)'">
      <div onclick="toggleNoteScreen('${n.id}',${!n.done})" style="width:20px;height:20px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:12px">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span style="font-size:10px;padding:2px 8px;border-radius:10px;font-weight:500;background:${c.bg};color:${c.txt}">${c.lbl}</span>
      ${!n.done?`<span onclick="toggleNoteScreen('${n.id}',true)" style="font-size:11px;color:#1D6A3E;cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid #1D6A3E">✅ إنجاز</span>`:'<span style="font-size:11px;color:var(--text-hint);padding:3px 8px">منتهي</span>'}
      <span onclick="deleteNoteScreen('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`;
  }).join('');
}

function setNotesFilter(f,btn){
  _notesFilter=f;
  ['nfAll','nfUndone','nfDone'].forEach(id=>{
    const b=document.getElementById(id);
    if(b){b.style.background='';b.style.color='';}
  });
  btn.style.background='var(--primary)';btn.style.color='#fff';
  renderNotesScreen();
}

async function addNoteFromScreen(){
  const input=document.getElementById('notesScreenInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNoteScreen(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNoteScreen(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotesScreen();
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

// ══════════════════════════════════════════
//  NOTES / TODO
// ══════════════════════════════════════════

async function loadNotes(){
  try{
    _notesList=await sb('notes?user_id=eq.'+uid+'&order=created_at.desc');
    renderNotes();
  }catch(e){const el=document.getElementById('notesList');if(el)el.innerHTML='<div class="d-empty">—</div>';}
}

function renderNotes(){
  const el=document.getElementById('notesList');
  if(!el)return;
  const cnt=document.getElementById('notesCount');
  const undone=_notesList.filter(n=>!n.done).length;
  if(cnt)cnt.textContent=undone?`${undone} متبقي`:'✅ كل شيء تمام';
  if(!_notesList.length){el.innerHTML='<div class="d-empty">لا توجد ملاحظات بعد</div>';return;}
  el.innerHTML=_notesList.map(n=>`
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:4px;transition:background .1s" onmouseover="this.style.background='var(--bg-faint)'" onmouseout="this.style.background='transparent'">
      <div onclick="toggleNote('${n.id}',${!n.done})" style="width:18px;height:18px;border-radius:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid ${n.done?'#1D3C2A':'var(--border-color)'};background:${n.done?'#1D3C2A':'transparent'};color:#D4C49A;font-size:11px;transition:all .15s">${n.done?'✓':''}</div>
      <div style="flex:1;font-size:13px;color:${n.done?'var(--text-hint)':'var(--text-main)'};text-decoration:${n.done?'line-through':'none'}">${n.content}</div>
      <span onclick="deleteNote('${n.id}')" style="font-size:11px;color:var(--text-hint);cursor:pointer;padding:3px 8px;border-radius:6px;border:0.5px solid var(--border-color)">حذف</span>
    </div>`).join('');
}

async function addNote(){
  const input=document.getElementById('noteInput');
  const content=input?.value?.trim();
  if(!content){notify('اكتب ملاحظة الأول','warn');return;}
  try{
    const res=await sb('notes','POST',{user_id:uid,content,done:false});
    _notesList.unshift(res[0]);
    input.value='';
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function toggleNote(id,done){
  try{
    await sb('notes?id=eq.'+id,'PATCH',{done});
    _notesList=_notesList.map(n=>n.id===id?{...n,done}:n);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

async function deleteNote(id){
  try{
    await sb('notes?id=eq.'+id,'DELETE');
    _notesList=_notesList.filter(n=>n.id!==id);
    renderNotes();
  }catch(e){notify('❌ '+friendlyError(e),'er');}
}

