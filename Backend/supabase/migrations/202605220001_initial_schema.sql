create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

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
  commission_bps integer not null default 1200 check (commission_bps between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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
  delivery_radius_km numeric(6,2) not null default 8 check (delivery_radius_km > 0),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  kind public.item_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
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
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents >= 0),
  prep_minutes integer not null default 20 check (prep_minutes > 0),
  stock integer check (stock is null or stock >= 0),
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
  updated_at timestamptz not null default now(),
  check (
    (item_type = 'product' and product_id is not null and meal_id is null)
    or (item_type = 'meal' and meal_id is not null and product_id is null)
  )
);

create unique index cart_items_product_once on public.cart_items(cart_id, product_id) where product_id is not null;
create unique index cart_items_meal_once on public.cart_items(cart_id, meal_id) where meal_id is not null;

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid references public.sellers(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  status public.order_status not null default 'pending',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  delivery_fee_cents integer not null default 0 check (delivery_fee_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
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
  product_id uuid references public.products(id) on delete set null,
  meal_id uuid references public.meals(id) on delete set null,
  seller_id uuid references public.sellers(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  name text not null,
  image_url text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  provider text not null default 'stripe',
  provider_payment_id text,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete set null,
  status public.delivery_status not null default 'assigned',
  pickup_address jsonb,
  dropoff_address jsonb not null,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete set null,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid references public.sellers(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  meal_id uuid references public.meals(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (product_id is not null or meal_id is not null or seller_id is not null)
);

create index profiles_role_idx on public.profiles(role);
create index sellers_profile_id_idx on public.sellers(profile_id);
create index sellers_status_idx on public.sellers(status);
create index restaurants_seller_id_idx on public.restaurants(seller_id);
create index products_seller_id_idx on public.products(seller_id);
create index products_category_id_idx on public.products(category_id);
create index meals_restaurant_id_idx on public.meals(restaurant_id);
create index meals_category_id_idx on public.meals(category_id);
create index carts_customer_id_idx on public.carts(customer_id);
create index orders_customer_id_idx on public.orders(customer_id);
create index orders_seller_id_idx on public.orders(seller_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index payments_order_id_idx on public.payments(order_id);
create index deliveries_order_id_idx on public.deliveries(order_id);
create index deliveries_driver_id_idx on public.deliveries(driver_id);
create index reviews_customer_id_idx on public.reviews(customer_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_sellers_updated_at before update on public.sellers for each row execute function public.set_updated_at();
create trigger set_restaurants_updated_at before update on public.restaurants for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_meals_updated_at before update on public.meals for each row execute function public.set_updated_at();
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger set_cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger set_deliveries_updated_at before update on public.deliveries for each row execute function public.set_updated_at();
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'New customer'),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
