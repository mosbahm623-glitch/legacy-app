-- ══════════════════════════════════════════════════════════
--  Legacy Fine Touch — Security & Data Integrity Fixes
--  الصق هذا الكود في Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════
--  1. GRANTS — عشان التطبيق يقدر يوصل الجداول
-- ═══════════════════════════════════════════
GRANT ALL ON public.pending_entries  TO anon, authenticated;
GRANT ALL ON public.pending_advances TO anon, authenticated;


-- ═══════════════════════════════════════════
--  2. RLS — تشغيل الحماية على الجدولين
-- ═══════════════════════════════════════════
ALTER TABLE public.pending_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_advances ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════
--  3. pending_entries — سياسات الوصول
-- ═══════════════════════════════════════════

-- احذف القديم لو موجود
DROP POLICY IF EXISTS "pending_entries_select" ON public.pending_entries;
DROP POLICY IF EXISTS "pending_entries_insert" ON public.pending_entries;
DROP POLICY IF EXISTS "pending_entries_delete" ON public.pending_entries;

-- SELECT: الأدمن يشوف كل حاجة، غيره يشوف بتاعته بس
CREATE POLICY "pending_entries_select"
ON public.pending_entries FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR submitted_by = auth.uid()
);

-- INSERT: أي مستخدم authenticated يقدر يضيف (بشرط submitted_by = uid بتاعه)
CREATE POLICY "pending_entries_insert"
ON public.pending_entries FOR INSERT
WITH CHECK (submitted_by = auth.uid());

-- DELETE: الأدمن بس يقدر يحذف (موافقة أو رفض)
CREATE POLICY "pending_entries_delete"
ON public.pending_entries FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- ═══════════════════════════════════════════
--  4. pending_advances — سياسات الوصول
-- ═══════════════════════════════════════════

DROP POLICY IF EXISTS "pending_advances_select" ON public.pending_advances;
DROP POLICY IF EXISTS "pending_advances_insert" ON public.pending_advances;
DROP POLICY IF EXISTS "pending_advances_delete" ON public.pending_advances;

CREATE POLICY "pending_advances_select"
ON public.pending_advances FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR submitted_by = auth.uid()
);

CREATE POLICY "pending_advances_insert"
ON public.pending_advances FOR INSERT
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "pending_advances_delete"
ON public.pending_advances FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- ═══════════════════════════════════════════
--  5. DB Constraints — التحقق من البيانات
--     (يمنع أي حد يبعت data غلط مباشرة للـ API)
-- ═══════════════════════════════════════════

-- entries: المبلغ لازم أكبر من صفر
ALTER TABLE public.entries
  DROP CONSTRAINT IF EXISTS entries_amount_positive;
ALTER TABLE public.entries
  ADD CONSTRAINT entries_amount_positive CHECK (amount > 0);

-- entries: النوع لازم 'i' أو 'e' بس
ALTER TABLE public.entries
  DROP CONSTRAINT IF EXISTS entries_type_valid;
ALTER TABLE public.entries
  ADD CONSTRAINT entries_type_valid CHECK (type IN ('i', 'e'));

-- pending_entries: نفس القيود
ALTER TABLE public.pending_entries
  DROP CONSTRAINT IF EXISTS pending_entries_amount_positive;
ALTER TABLE public.pending_entries
  ADD CONSTRAINT pending_entries_amount_positive CHECK (amount > 0);

ALTER TABLE public.pending_entries
  DROP CONSTRAINT IF EXISTS pending_entries_type_valid;
ALTER TABLE public.pending_entries
  ADD CONSTRAINT pending_entries_type_valid CHECK (type IN ('i', 'e'));

-- advance_installments: المبلغ أكبر من صفر
ALTER TABLE public.advance_installments
  DROP CONSTRAINT IF EXISTS installments_amount_positive;
ALTER TABLE public.advance_installments
  ADD CONSTRAINT installments_amount_positive CHECK (amount > 0);

-- advances: الحالة لازم 'open' أو 'closed' بس
ALTER TABLE public.advances
  DROP CONSTRAINT IF EXISTS advances_status_valid;
ALTER TABLE public.advances
  ADD CONSTRAINT advances_status_valid CHECK (status IN ('open', 'closed'));


-- ═══════════════════════════════════════════
--  6. Index — تسريع الاستعلامات الشائعة
-- ═══════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_entries_project_id   ON public.entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_advance_id   ON public.entries(advance_id) WHERE advance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entries_type         ON public.entries(type);
CREATE INDEX IF NOT EXISTS idx_pending_submitted_by ON public.pending_entries(submitted_by);
CREATE INDEX IF NOT EXISTS idx_adv_inst_advance_id  ON public.advance_installments(advance_id);
CREATE INDEX IF NOT EXISTS idx_project_access_uid   ON public.project_access(user_id);


-- ═══════════════════════════════════════════
--  تأكد إن كل حاجة اتنفذت
-- ═══════════════════════════════════════════
DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes applied successfully!';
  RAISE NOTICE '   → RLS enabled on pending_entries & pending_advances';
  RAISE NOTICE '   → 6 DB constraints added';
  RAISE NOTICE '   → 6 performance indexes created';
END $$;
