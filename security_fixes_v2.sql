-- ══════════════════════════════════════════════════════════
--  Legacy Fine Touch — Security & Data Integrity Fixes v2
--  (مُصحَّح — يسمح بالمرتجعات السالبة)
-- ══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════
--  1. GRANTS
-- ═══════════════════════════════════════════
GRANT ALL ON public.pending_entries  TO anon, authenticated;
GRANT ALL ON public.pending_advances TO anon, authenticated;

-- ═══════════════════════════════════════════
--  2. RLS
-- ═══════════════════════════════════════════
ALTER TABLE public.pending_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_advances ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════
--  3. pending_entries policies
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "pending_entries_select" ON public.pending_entries;
DROP POLICY IF EXISTS "pending_entries_insert" ON public.pending_entries;
DROP POLICY IF EXISTS "pending_entries_delete" ON public.pending_entries;

CREATE POLICY "pending_entries_select"
ON public.pending_entries FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  OR submitted_by = auth.uid()
);

CREATE POLICY "pending_entries_insert"
ON public.pending_entries FOR INSERT
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "pending_entries_delete"
ON public.pending_entries FOR DELETE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- ═══════════════════════════════════════════
--  4. pending_advances policies
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
--  5. DB Constraints
--  amount <> 0 بدل amount > 0 عشان المرتجعات السالبة
-- ═══════════════════════════════════════════
ALTER TABLE public.entries
  DROP CONSTRAINT IF EXISTS entries_amount_positive;
ALTER TABLE public.entries
  ADD CONSTRAINT entries_amount_nonzero CHECK (amount <> 0);

ALTER TABLE public.entries
  DROP CONSTRAINT IF EXISTS entries_type_valid;
ALTER TABLE public.entries
  ADD CONSTRAINT entries_type_valid CHECK (type IN ('i', 'e'));

ALTER TABLE public.pending_entries
  DROP CONSTRAINT IF EXISTS pending_entries_amount_positive;
ALTER TABLE public.pending_entries
  ADD CONSTRAINT pending_entries_amount_nonzero CHECK (amount <> 0);

ALTER TABLE public.pending_entries
  DROP CONSTRAINT IF EXISTS pending_entries_type_valid;
ALTER TABLE public.pending_entries
  ADD CONSTRAINT pending_entries_type_valid CHECK (type IN ('i', 'e'));

ALTER TABLE public.advance_installments
  DROP CONSTRAINT IF EXISTS installments_amount_positive;
ALTER TABLE public.advance_installments
  ADD CONSTRAINT installments_amount_nonzero CHECK (amount <> 0);

ALTER TABLE public.advances
  DROP CONSTRAINT IF EXISTS advances_status_valid;
ALTER TABLE public.advances
  ADD CONSTRAINT advances_status_valid CHECK (status IN ('open', 'closed'));

-- ═══════════════════════════════════════════
--  6. Indexes
-- ═══════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_entries_project_id   ON public.entries(project_id);
CREATE INDEX IF NOT EXISTS idx_entries_advance_id   ON public.entries(advance_id) WHERE advance_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_entries_type         ON public.entries(type);
CREATE INDEX IF NOT EXISTS idx_pending_submitted_by ON public.pending_entries(submitted_by);
CREATE INDEX IF NOT EXISTS idx_adv_inst_advance_id  ON public.advance_installments(advance_id);
CREATE INDEX IF NOT EXISTS idx_project_access_uid   ON public.project_access(user_id);

DO $$
BEGIN
  RAISE NOTICE '✅ Security fixes v2 applied successfully!';
END $$;
