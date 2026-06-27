function initLoginParticles(){
  const c=document.getElementById('lParticles');
  if(!c)return;
  const colors=['rgba(212,196,154,.4)','rgba(29,60,42,.8)','rgba(212,196,154,.2)','rgba(255,255,255,.1)'];
  for(let i=0;i<22;i++){
    const d=document.createElement('div');
    d.className='l-p';
    const s=Math.random()*8+3;
    d.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*15+8}s;animation-delay:${Math.random()*10}s`;
    c.appendChild(d);
  }
}
setTimeout(initLoginParticles,100);


// ── DRAGGABLE FAB ──────────────────────────────────
(function(){
  const fab=document.getElementById('fab');
  if(!fab)return;
  let dragging=false,startX,startY,origX,origY,moved=false;
  const btn=document.getElementById('fabMain');

  function onStart(e){
    const t=e.touches?e.touches[0]:e;
    startX=t.clientX;startY=t.clientY;
    const r=fab.getBoundingClientRect();
    origX=r.left;origY=r.top;
    moved=false;
    fab.style.transition='none';
    btn.classList.add('dragging');

    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onEnd);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
  }

  function onMove(e){
    if(e.cancelable)e.preventDefault();
    const t=e.touches?e.touches[0]:e;
    const dx=t.clientX-startX,dy=t.clientY-startY;
    if(Math.abs(dx)>5||Math.abs(dy)>5){dragging=true;moved=true;}
    if(!dragging)return;
    let nx=origX+dx,ny=origY+dy;
    nx=Math.max(0,Math.min(window.innerWidth-60,nx));
    ny=Math.max(0,Math.min(window.innerHeight-60,ny));
    fab.style.left=nx+'px';fab.style.top=ny+'px';
    fab.style.bottom='auto';fab.style.right='auto';
  }

  function onEnd(){
    dragging=false;
    btn.classList.remove('dragging');
    fab.style.transition='';
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
    // Snap to nearest edge
    const r=fab.getBoundingClientRect();
    const mid=window.innerWidth/2;
    if(r.left+30>mid){
      fab.style.left='auto';fab.style.right='18px';
    } else {
      fab.style.right='auto';fab.style.left='18px';
    }
  }

  btn.addEventListener('mousedown',onStart);
  btn.addEventListener('touchstart',onStart,{passive:true});
})();

// ── DARK MODE ──────────────────────────────────────
function confirmRestart(){showConfirm({icon:'🔄',title:'إعادة تشغيل',msg:'هيتعمل reload للتطبيق.',okLabel:'إعادة تشغيل',okType:'primary',onOk:()=>window.location.href=window.location.href.split("?")[0]+"?v="+Date.now()});}
