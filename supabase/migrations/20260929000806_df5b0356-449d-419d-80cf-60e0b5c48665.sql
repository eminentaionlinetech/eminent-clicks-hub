CREATE POLICY "receipts_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "receipts_select_own" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);