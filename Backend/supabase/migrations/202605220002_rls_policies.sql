create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_seller_owner(target_seller uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.sellers where id = target_seller and profile_id = auth.uid());
$$;

create or replace function public.is_driver()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'driver');
$$;

alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.meals enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.deliveries enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_select_owner_admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_owner" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy "sellers_select_public_approved_owner_admin" on public.sellers for select using (status = 'approved' or profile_id = auth.uid() or public.is_admin());
create policy "sellers_insert_owner" on public.sellers for insert with check (profile_id = auth.uid());
create policy "sellers_update_owner_admin" on public.sellers for update using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());

create policy "restaurants_select_public" on public.restaurants for select using (true);
create policy "restaurants_manage_seller_admin" on public.restaurants for all using (public.is_seller_owner(seller_id) or public.is_admin()) with check (public.is_seller_owner(seller_id) or public.is_admin());

create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_manage_admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "products_select_public_owner_admin" on public.products for select using (is_available = true or public.is_seller_owner(seller_id) or public.is_admin());
create policy "products_manage_seller_admin" on public.products for all using (public.is_seller_owner(seller_id) or public.is_admin()) with check (public.is_seller_owner(seller_id) or public.is_admin());

create policy "meals_select_public_owner_admin" on public.meals for select using (
  is_available = true
  or public.is_admin()
  or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id))
);
create policy "meals_manage_seller_admin" on public.meals for all using (
  public.is_admin()
  or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id))
) with check (
  public.is_admin()
  or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id))
);

create policy "carts_manage_customer" on public.carts for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "cart_items_manage_customer" on public.cart_items for all using (
  exists(select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid())
) with check (
  exists(select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid())
);

create policy "orders_select_parties" on public.orders for select using (
  customer_id = auth.uid()
  or public.is_admin()
  or public.is_seller_owner(seller_id)
  or exists(select 1 from public.deliveries d where d.order_id = id and d.driver_id = auth.uid())
);
create policy "orders_insert_customer" on public.orders for insert with check (customer_id = auth.uid());
create policy "orders_update_seller_admin" on public.orders for update using (public.is_admin() or public.is_seller_owner(seller_id));
create policy "orders_update_assigned_driver" on public.orders for update using (
  exists(select 1 from public.deliveries d where d.order_id = id and d.driver_id = auth.uid())
);

create policy "order_items_select_parties" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (
    o.customer_id = auth.uid()
    or public.is_admin()
    or public.is_seller_owner(o.seller_id)
    or exists(select 1 from public.deliveries d where d.order_id = o.id and d.driver_id = auth.uid())
  ))
);
create policy "order_items_insert_customer" on public.order_items for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);

create policy "payments_select_customer_admin" on public.payments for select using (customer_id = auth.uid() or public.is_admin());
create policy "payments_insert_customer" on public.payments for insert with check (customer_id = auth.uid());
create policy "payments_update_admin" on public.payments for update using (public.is_admin()) with check (public.is_admin());

create policy "deliveries_select_parties" on public.deliveries for select using (
  driver_id = auth.uid()
  or public.is_admin()
  or exists(select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_seller_owner(o.seller_id)))
);
create policy "deliveries_insert_customer_order" on public.deliveries for insert with check (
  exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
);
create policy "deliveries_update_driver_admin" on public.deliveries for update using (driver_id = auth.uid() or public.is_admin()) with check (driver_id = auth.uid() or public.is_admin());

create policy "reviews_select_public" on public.reviews for select using (true);
create policy "reviews_insert_customer" on public.reviews for insert with check (customer_id = auth.uid());
create policy "reviews_update_customer_admin" on public.reviews for update using (customer_id = auth.uid() or public.is_admin()) with check (customer_id = auth.uid() or public.is_admin());
