// ─── Cash Calculator Modal ────────────────────────────────────────
const CC_FIELDS = [
  { id:'cib_co_cc', name:'CIB شركات',   sub:'Commercial International Bank', logo:'img/cib_logo.png' },
  { id:'cib_cc',    name:'Bank CIB',     sub:'Personal Account',              logo:'img/cib_logo.png' },
  { id:'ahli_cc',   name:'Bank Al Ahly', sub:'البنك الأهلي المصري',           logo:'img/nbe_logo.png' },
  { id:'cash_cc',   name:'Cash',         sub:'نقدي بالصندوق',                 logo:null },
];
const CC_IDS    = CC_FIELDS.map(f => f.id);
const CC_LABELS = CC_FIELDS.map(f => f.name);

function openCashCalc() {
  const existing = document.getElementById('cashCalcModal');
  if (existing) { existing.style.display='flex'; _syncCCTheme(); return; }

  const modal = document.createElement('div');
  modal.id = 'cashCalcModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);padding:1rem';

  modal.innerHTML = `
    <style>@keyframes ccpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}</style>
    <div id="cashCalcCard" style="width:100%;max-width:460px;border-radius:20px;overflow:hidden;font-family:Cairo,sans-serif;direction:rtl;background:var(--cc-surface);border:1px solid var(--cc-border)">

      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--cc-border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:10px;font-weight:600;letter-spacing:2px;color:var(--cc-muted);text-transform:uppercase;margin-bottom:3px">Legacy Core</div>
          <div style="font-size:18px;font-weight:700;color:var(--cc-text);display:flex;align-items:center;gap:8px">
            صافي النقدية
            <span style="width:7px;height:7px;border-radius:50%;background:#22C55E;box-shadow:0 0 8px #22C55E;display:inline-block;animation:ccpulse 2s infinite"></span>
          </div>
        </div>
        <button onclick="closeCashCalc()" style="width:34px;height:34px;border-radius:9px;border:1px solid var(--cc-border);background:var(--cc-surface2);color:var(--cc-muted);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;font-family:inherit"
          onmouseover="this.style.color='var(--cc-text)'" onmouseout="this.style.color='var(--cc-muted)'">✕</button>
      </div>

      <div style="padding:1rem 1.5rem">
        ${CC_FIELDS.map((f,i) => `
          <div style="display:flex;align-items:center;gap:12px;padding:11px 0;${i<CC_FIELDS.length-1?'border-bottom:1px solid var(--cc-border)':''}">
            <div style="width:44px;height:44px;border-radius:10px;overflow:hidden;background:var(--cc-surface2);border:1px solid var(--cc-border);display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${f.logo ? `<img src="${f.logo}" style="width:36px;height:36px;object-fit:contain" alt="${f.name}">` : '<span style="font-size:22px">💵</span>'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:var(--cc-text)">${f.name}</div>
              <div style="font-size:10px;color:var(--cc-muted);margin-top:1px">${f.sub}</div>
            </div>
            <input type="number" id="${f.id}" placeholder="0.00" step="any" oninput="calcCC()"
              style="width:128px;background:var(--cc-surface2);border:1px solid var(--cc-border);border-radius:9px;padding:7px 11px;font-size:14px;font-weight:600;font-family:Cairo,monospace;color:var(--cc-text);direction:ltr;text-align:right;outline:none;flex-shrink:0"
              onfocus="this.style.borderColor='#3B82F6'" onblur="this.style.borderColor='var(--cc-border)'">
          </div>`).join('')}
      </div>

      <div id="cc-result-box" style="margin:0 1.5rem 1.5rem;border-radius:14px;padding:1.25rem 1.5rem;background:var(--cc-surface2);border:1px solid var(--cc-border);transition:border-color .3s">
        <div style="font-size:10px;font-weight:600;letter-spacing:1.5px;color:var(--cc-muted);text-transform:uppercase;margin-bottom:6px">Net Cash Position</div>
        <div style="display:flex;align-items:baseline;gap:6px;direction:ltr">
          <span style="font-size:13px;color:var(--cc-muted)">EGP</span>
          <span id="cc-net" style="font-size:30px;font-weight:700;letter-spacing:-.5px;color:var(--cc-muted);transition:color .3s">0.00</span>
        </div>
      </div>

      <div style="padding:.5rem 1.5rem 1.25rem;display:flex;align-items:center;gap:8px">
        <div id="cc-breakdown" style="flex:1;font-size:11px;color:var(--cc-muted);line-height:1.8;direction:ltr;text-align:left">— — — —</div>
        <button onclick="resetCC()" style="padding:7px 14px;background:transparent;border:1px solid var(--cc-border);border-radius:8px;color:var(--cc-muted);font-size:12px;cursor:pointer;font-family:Cairo,sans-serif"
          onmouseover="this.style.background='var(--cc-surface2)';this.style.color='var(--cc-text)'"
          onmouseout="this.style.background='transparent';this.style.color='var(--cc-muted)'">مسح</button>
      </div>
    </div>`;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target===modal) closeCashCalc(); });
  _syncCCTheme();
}

function _syncCCTheme() {
  const card = document.getElementById('cashCalcCard');
  if (!card) return;
  const dark = document.body.classList.contains('dark-mode');
  const v = dark
    ? {'--cc-surface':'#161920','--cc-surface2':'#1E222C','--cc-border':'rgba(255,255,255,0.07)','--cc-text':'#F0F2F5','--cc-muted':'#6B7280'}
    : {'--cc-surface':'#FFFFFF','--cc-surface2':'#F7F8FA','--cc-border':'#E2E5EA','--cc-text':'#111318','--cc-muted':'#9CA3AF'};
  Object.entries(v).forEach(([k,val]) => card.style.setProperty(k,val));
}

function closeCashCalc() {
  const m = document.getElementById('cashCalcModal');
  if (m) m.style.display = 'none';
}

function ccVal(id) { return parseFloat(document.getElementById(id)?.value)||0; }
function ccFmt(n)  { return Math.abs(n).toLocaleString('en-EG',{minimumFractionDigits:2,maximumFractionDigits:2}); }

function calcCC() {
  const vals = CC_IDS.map(ccVal);
  const net  = vals.reduce((a,b)=>a+b,0);
  const netEl = document.getElementById('cc-net');
  const box   = document.getElementById('cc-result-box');
  const bd    = document.getElementById('cc-breakdown');
  if (!netEl) return;
  netEl.textContent = (net<0?'−':'')+ccFmt(net);
  netEl.style.color = net>0?'#22C55E':net<0?'#F87171':'var(--cc-muted)';
  box.style.borderColor = net>0?'#22c55e44':net<0?'#f8717144':'var(--cc-border)';
  const parts = CC_IDS.map((id,i)=>{ const v=vals[i]; return v?`<b style="color:var(--cc-text)">${CC_LABELS[i]}</b> ${v<0?'−':''}${ccFmt(v)}`:''; }).filter(Boolean);
  bd.innerHTML = parts.length ? parts.join(' <span style="opacity:.4">+</span> ') : '— — — —';
}

function resetCC() {
  CC_IDS.forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  calcCC();
}
