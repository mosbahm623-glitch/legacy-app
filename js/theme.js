// ██ THEME — إدارة الوضع النهاري والليلي ══════════════

/** تبديل بين النهاري والليلي */
function toggleDark(){
  const body=document.body;
  const isDay=body.classList.contains('day-mode');
  if(isDay){
    body.classList.remove('day-mode');
    body.classList.add('dark-mode');
    saveDarkPref('dark');
    updateDarkBtn('dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('day-mode');
    saveDarkPref('day');
    updateDarkBtn('day');
  }
}

/** حفظ تفضيل المستخدم في localStorage */
function saveDarkPref(val){
  const key='lft_theme_'+(uid||'guest');
  localStorage.setItem(key,val);
}

/** تحديث أيقونة وزر الثيم */
function updateDarkBtn(mode){
  const ico=document.getElementById('sb-dark-icon');
  const lbl=document.getElementById('sb-dark-lbl');
  if(ico)ico.textContent=mode==='dark'?'☀️':'🌙';
  if(lbl)lbl.textContent=mode==='dark'?'الوضع النهاري':'الوضع الليلي';

  const b=document.getElementById('darkBtn');
  if(b)b.innerHTML=mode==='day'?'☀️ نهار':'🌙 ليل';

  // sync mobile header label
  const isDark=mode==='dark';
  const mIco=document.getElementById('ahdrMenuDarkIco');
  const mLbl=document.getElementById('ahdrMenuDarkLbl');
  if(mIco)mIco.textContent=isDark?'☀️':'🌙';
  if(mLbl)mLbl.textContent=isDark?'الوضع النهاري':'الوضع الليلي';
}

/** تطبيق ثيم المستخدم عند بداية التطبيق
 *  الـ default = نهاري — إلا لو المستخدم غيّر بنفسه
 */
function applyUserTheme(){
  const key='lft_theme_'+(uid||'guest');
  const saved=localStorage.getItem(key)||'day';
  document.body.classList.remove('dark-mode','day-mode');
  if(saved==='dark') document.body.classList.add('dark-mode');
  else document.body.classList.add('day-mode');
  updateDarkBtn(saved);
}
