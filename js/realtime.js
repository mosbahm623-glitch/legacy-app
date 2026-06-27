// ██ REALTIME ══════════════════════════════════════
// تليفون مفتوح مع Supabase — أي تغيير يوصل فورًا
let _sbClient = null;

function getSbClient() {
  if (_sbClient) return _sbClient;
  if (window.supabase && window.supabase.createClient) {
    _sbClient = window.supabase.createClient(SB, AK);
  }
  return _sbClient;
}

function initRealtime() {
  const client = getSbClient();
  if (!client) { console.warn('Supabase client غير متاح'); return; }

  // إلغاء أي اشتراك قديم
  if (_rtEntCh) { try { client.removeChannel(_rtEntCh); } catch(_) {} _rtEntCh = null; }
  if (_rtAdvCh) { try { client.removeChannel(_rtAdvCh); } catch(_) {} _rtAdvCh = null; }

  // ── Channel 1: entries ──────────────────────────
  _rtEntCh = client.channel('rt-entries')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, async (payload) => {
      try {
        const { eventType, new: nw, old: ol } = payload;
        if (eventType === 'INSERT') {
          if (!allEntries.find(e => e.id === nw.id)) {
            allEntries.push(nw);
            if (nw.project_id) refreshProjSummary(nw.project_id);
          }
        } else if (eventType === 'UPDATE') {
          const idx = allEntries.findIndex(e => e.id === nw.id);
          if (idx !== -1) allEntries[idx] = nw;
          else allEntries.push(nw);
          if (nw.project_id) refreshProjSummary(nw.project_id);
          if (ol?.project_id && ol.project_id !== nw.project_id) refreshProjSummary(ol.project_id);
        } else if (eventType === 'DELETE') {
          const idx = allEntries.findIndex(e => e.id === ol.id);
          if (idx !== -1) allEntries.splice(idx, 1);
          if (ol?.project_id) refreshProjSummary(ol.project_id);
        }
        // تحديث الداشبورد إذا كان مفتوحًا
        _rtRefreshVisible();
      } catch(e) { console.warn('Realtime entries error:', e); }
    })
    .subscribe();

  // ── Channel 2: pending_entries ──────────────────
  _rtAdvCh = client.channel('rt-pending')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_entries' }, async () => {
      try { _rtRefreshVisible(); } catch(e) {}
    })
    .subscribe();

  console.log('✅ Realtime مفعّل');
}

// Debounce timer — يمنع تكرار التحديث لو جه أكتر من event في نفس الوقت
let _rtDebounceTimer = null;

// بيحدث الشاشة اللي أنت واقف عليها بس — مع debounce 800ms
function _rtRefreshVisible() {
  if (window._blockRtRefresh) return;
  if (_rtDebounceTimer) clearTimeout(_rtDebounceTimer);
  _rtDebounceTimer = setTimeout(() => {
    _rtDebounceTimer = null;
    if (window._blockRtRefresh) return;
    const s = curScreen || '';
    if (s === 'dash') {
      if (typeof loadDashboard === 'function') loadDashboard();
    } else if (s === 'proj' && curPid) {
      if (typeof loadEntries === 'function') loadEntries();
    } else if (s === 'tl') {
      if (typeof loadTimeline === 'function') loadTimeline();
    }
  }, 800);
}

// إيقاف الـ Realtime لما المستخدم يسجل خروج
function stopRealtime() {
  const client = getSbClient();
  if (!client) return;
  if (_rtEntCh) { try { client.removeChannel(_rtEntCh); } catch(_) {} _rtEntCh = null; }
  if (_rtAdvCh) { try { client.removeChannel(_rtAdvCh); } catch(_) {} _rtAdvCh = null; }
}

