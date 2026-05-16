insert into storage.buckets (id, name, public)
values ('withdrawal-proofs', 'withdrawal-proofs', true)
on conflict (id) do nothing;

create policy "Authenticated upload proofs"
on storage.objects for insert to authenticated
with check (bucket_id = 'withdrawal-proofs' and can_write());

create policy "Authenticated read proofs"
on storage.objects for select to authenticated
using (bucket_id = 'withdrawal-proofs');

create policy "Admin delete proofs"
on storage.objects for delete to authenticated
using (bucket_id = 'withdrawal-proofs' and is_admin());
