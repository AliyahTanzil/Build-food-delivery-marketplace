insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', true)
on conflict (id) do update set public = excluded.public;

create policy "food_images_select_public" on storage.objects
for select using (bucket_id = 'food-images');

create policy "food_images_insert_authenticated" on storage.objects
for insert with check (bucket_id = 'food-images' and auth.role() = 'authenticated');

create policy "food_images_update_owner_admin" on storage.objects
for update using (
  bucket_id = 'food-images'
  and (owner = auth.uid() or public.is_admin())
) with check (
  bucket_id = 'food-images'
  and (owner = auth.uid() or public.is_admin())
);

create policy "food_images_delete_owner_admin" on storage.objects
for delete using (
  bucket_id = 'food-images'
  and (owner = auth.uid() or public.is_admin())
);
