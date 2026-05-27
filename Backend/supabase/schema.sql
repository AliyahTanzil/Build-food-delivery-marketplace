create extension if not exists "uuid-ossp";

create type public.app_role as enum ('customer', 'seller', 'driver', 'admin');
create type public.seller_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.order_status as enum ('pending', 'accepted', 'rejected', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.item_type as enum ('meal', 'product');
create type public.delivery_status as enum ('assigned', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text not null,
  phone text,
  avatar_url text,
  default_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sellers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type text not null check (business_type in ('restaurant', 'store', 'both')),
  status public.seller_status not null default 'pending',
  stripe_account_id text,
  commission_bps integer not null default 1200,
  created_at timestamptz not null default now(),
  unique(profile_id)
);

create table public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  name text not null,
  description text,
  cuisine text,
  image_url text,
  address jsonb not null,
  delivery_radius_km numeric(6,2) default 8,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  kind public.item_type,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  ingredients text,
  nutrition jsonb,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.meals (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents >= 0),
  prep_minutes integer not null default 20,
  stock integer,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(customer_id)
);

create table public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  item_type public.item_type not null,
  product_id uuid references public.products(id) on delete cascade,
  meal_id uuid references public.meals(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  check (
    (item_type = 'product' and product_id is not null and meal_id is null)
    or (item_type = 'meal' and meal_id is not null and product_id is null)
  )
);

create unique index cart_items_product_once on public.cart_items(cart_id, product_id) where product_id is not null;
create unique index cart_items_meal_once on public.cart_items(cart_id, meal_id) where meal_id is not null;

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id),
  seller_id uuid references public.sellers(id),
  restaurant_id uuid references public.restaurants(id),
  status public.order_status not null default 'pending',
  subtotal_cents integer not null default 0,
  delivery_fee_cents integer not null default 0,
  platform_fee_cents integer not null default 0,
  total_cents integer not null default 0,
  delivery_address jsonb not null,
  customer_notes text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_type public.item_type not null,
  product_id uuid references public.products(id),
  meal_id uuid references public.meals(id),
  seller_id uuid references public.sellers(id),
  restaurant_id uuid references public.restaurants(id),
  name text not null,
  image_url text,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  provider text not null default 'stripe',
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount_cents integer not null,
  currency text not null default 'usd',
  created_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  driver_id uuid references public.profiles(id),
  status public.delivery_status not null default 'assigned',
  pickup_address jsonb,
  dropoff_address jsonb not null,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid not null references public.profiles(id),
  seller_id uuid references public.sellers(id),
  product_id uuid references public.products(id),
  meal_id uuid references public.meals(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_meals_updated_at before update on public.meals for each row execute function public.set_updated_at();
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'New customer'),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'customer')
  );
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_seller_owner(target_seller uuid)
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.sellers where id = target_seller and profile_id = auth.uid());
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

create policy "Profiles are visible to owner and admins" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Users update own profile" on public.profiles for update using (id = auth.uid());
create policy "Admins update profiles" on public.profiles for update using (public.is_admin());

create policy "Approved sellers are public" on public.sellers for select using (status = 'approved' or profile_id = auth.uid() or public.is_admin());
create policy "Users create seller application" on public.sellers for insert with check (profile_id = auth.uid());
create policy "Seller owners update their profile" on public.sellers for update using (profile_id = auth.uid() or public.is_admin());

create policy "Restaurants are public" on public.restaurants for select using (true);
create policy "Seller owners manage restaurants" on public.restaurants for all using (public.is_seller_owner(seller_id) or public.is_admin()) with check (public.is_seller_owner(seller_id) or public.is_admin());

create policy "Categories are public" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "Products are public" on public.products for select using (is_available = true or public.is_seller_owner(seller_id) or public.is_admin());
create policy "Seller owners manage products" on public.products for all using (public.is_seller_owner(seller_id) or public.is_admin()) with check (public.is_seller_owner(seller_id) or public.is_admin());

create policy "Meals are public" on public.meals for select using (is_available = true or public.is_admin() or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id)));
create policy "Seller owners manage meals" on public.meals for all using (public.is_admin() or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id))) with check (public.is_admin() or exists(select 1 from public.restaurants r where r.id = restaurant_id and public.is_seller_owner(r.seller_id)));

create policy "Customers manage own cart" on public.carts for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "Customers manage own cart items" on public.cart_items for all using (exists(select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid())) with check (exists(select 1 from public.carts c where c.id = cart_id and c.customer_id = auth.uid()));

create policy "Orders visible by parties" on public.orders for select using (customer_id = auth.uid() or public.is_admin() or public.is_seller_owner(seller_id) or exists(select 1 from public.deliveries d where d.order_id = id and d.driver_id = auth.uid()));
create policy "Customers create own orders" on public.orders for insert with check (customer_id = auth.uid());
create policy "Sellers and admins update orders" on public.orders for update using (public.is_admin() or public.is_seller_owner(seller_id));
create policy "Assigned drivers update delivery order status" on public.orders for update using (exists(select 1 from public.deliveries d where d.order_id = id and d.driver_id = auth.uid()));

create policy "Order items visible with order" on public.order_items for select using (exists(select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin() or public.is_seller_owner(o.seller_id))));
create policy "Order items insert by customer order" on public.order_items for insert with check (exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Payments visible by customer and admin" on public.payments for select using (customer_id = auth.uid() or public.is_admin());
create policy "Payments insert by customer" on public.payments for insert with check (customer_id = auth.uid());

create policy "Deliveries visible to drivers and admins" on public.deliveries for select using (driver_id = auth.uid() or public.is_admin() or exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "Customers create delivery records for own orders" on public.deliveries for insert with check (exists(select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "Drivers update assigned deliveries" on public.deliveries for update using (driver_id = auth.uid() or public.is_admin());

create policy "Reviews are public" on public.reviews for select using (true);
create policy "Customers write own reviews" on public.reviews for insert with check (customer_id = auth.uid());

insert into public.categories (name, slug, kind) values
  ('Breakfast', 'breakfast', 'meal'),
  ('Lunch', 'lunch', 'meal'),
  ('Dinner', 'dinner', 'meal'),
  ('Bakery', 'bakery', null),
  ('Pantry', 'pantry', 'product'),
  ('Snacks', 'snacks', 'product'),
  ('Drinks', 'drinks', null)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', true)
on conflict (id) do nothing;

create policy "Food images are publicly readable" on storage.objects for select using (bucket_id = 'food-images');
create policy "Sellers upload food images" on storage.objects for insert with check (bucket_id = 'food-images' and auth.role() = 'authenticated');
