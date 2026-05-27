create extension if not exists "pgcrypto";

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  user_id,
  'authenticated',
  'authenticated',
  email,
  crypt('DemoPass123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('full_name', full_name, 'role', role),
  now(),
  now()
from (
  values
    ('00000000-0000-0000-0000-000000000101'::uuid, 'maya.customer@example.com', 'Maya Chen', 'customer'),
    ('00000000-0000-0000-0000-000000000102'::uuid, 'noah.customer@example.com', 'Noah Brooks', 'customer'),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'sofia.customer@example.com', 'Sofia Rivera', 'customer'),
    ('00000000-0000-0000-0000-000000000201'::uuid, 'lina.seller@example.com', 'Lina Patel', 'seller'),
    ('00000000-0000-0000-0000-000000000202'::uuid, 'omar.seller@example.com', 'Omar Haddad', 'seller'),
    ('00000000-0000-0000-0000-000000000301'::uuid, 'ava.driver@example.com', 'Ava Johnson', 'driver'),
    ('00000000-0000-0000-0000-000000000302'::uuid, 'leo.driver@example.com', 'Leo Kim', 'driver'),
    ('00000000-0000-0000-0000-000000000401'::uuid, 'admin@example.com', 'Admin User', 'admin')
) as seed_users(user_id, email, full_name, role)
on conflict (id) do update set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  id,
  email,
  'email',
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false),
  now(),
  now(),
  now()
from auth.users
where email in (
  'maya.customer@example.com',
  'noah.customer@example.com',
  'sofia.customer@example.com',
  'lina.seller@example.com',
  'omar.seller@example.com',
  'ava.driver@example.com',
  'leo.driver@example.com',
  'admin@example.com'
)
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.profiles (id, role, full_name, phone, default_address)
values
  ('00000000-0000-0000-0000-000000000101', 'customer', 'Maya Chen', '+1 415 555 0101', '{"line1":"22 Pine Street","city":"San Francisco","region":"CA","postalCode":"94111"}'),
  ('00000000-0000-0000-0000-000000000102', 'customer', 'Noah Brooks', '+1 415 555 0102', '{"line1":"804 Valencia Street","city":"San Francisco","region":"CA","postalCode":"94110"}'),
  ('00000000-0000-0000-0000-000000000103', 'customer', 'Sofia Rivera', '+1 415 555 0103', '{"line1":"1440 Market Street","city":"San Francisco","region":"CA","postalCode":"94102"}'),
  ('00000000-0000-0000-0000-000000000201', 'seller', 'Lina Patel', '+1 415 555 0201', null),
  ('00000000-0000-0000-0000-000000000202', 'seller', 'Omar Haddad', '+1 415 555 0202', null),
  ('00000000-0000-0000-0000-000000000301', 'driver', 'Ava Johnson', '+1 415 555 0301', null),
  ('00000000-0000-0000-0000-000000000302', 'driver', 'Leo Kim', '+1 415 555 0302', null),
  ('00000000-0000-0000-0000-000000000401', 'admin', 'Admin User', '+1 415 555 0401', null)
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  phone = excluded.phone,
  default_address = excluded.default_address,
  updated_at = now();

insert into public.categories (id, name, slug, kind)
values
  ('10000000-0000-0000-0000-000000000001', 'Breakfast', 'breakfast', 'meal'),
  ('10000000-0000-0000-0000-000000000002', 'Lunch Bowls', 'lunch-bowls', 'meal'),
  ('10000000-0000-0000-0000-000000000003', 'Bakery', 'bakery', null),
  ('10000000-0000-0000-0000-000000000004', 'Pantry', 'pantry', 'product'),
  ('10000000-0000-0000-0000-000000000005', 'Snacks & Drinks', 'snacks-drinks', 'product')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  kind = excluded.kind,
  updated_at = now();

insert into public.sellers (id, profile_id, business_name, business_type, status, commission_bps)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Golden Gate Food Group', 'both', 'approved', 1200),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'Mission Market Collective', 'both', 'approved', 1200)
on conflict (id) do update set
  business_name = excluded.business_name,
  business_type = excluded.business_type,
  status = excluded.status,
  commission_bps = excluded.commission_bps,
  updated_at = now();

insert into public.restaurants (id, seller_id, name, description, cuisine, image_url, address, delivery_radius_km, is_open)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Harbor Harvest Kitchen', 'Seasonal bowls, grilled plates, and bright coastal flavors.', 'California', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80', '{"line1":"118 Ferry Building","city":"San Francisco","region":"CA","postalCode":"94111"}', 8, true),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Sunrise Dosa Cafe', 'South Indian breakfasts, dosas, chai, and lunch boxes.', 'Indian', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80', '{"line1":"241 Castro Street","city":"San Francisco","region":"CA","postalCode":"94114"}', 7, true),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Baker & Stone', 'Small-batch breads, pastries, sandwiches, and packaged bakery goods.', 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80', '{"line1":"699 Divisadero Street","city":"San Francisco","region":"CA","postalCode":"94117"}', 6, true),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'Mission Verde Taqueria', 'Fresh masa tacos, loaded bowls, salsas, and aguas frescas.', 'Mexican', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80', '{"line1":"2899 24th Street","city":"San Francisco","region":"CA","postalCode":"94110"}', 8, true),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Olive & Fig Pantry', 'Mediterranean meals plus packaged olives, dips, grains, and sweets.', 'Mediterranean', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80', '{"line1":"915 Valencia Street","city":"San Francisco","region":"CA","postalCode":"94110"}', 9, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  cuisine = excluded.cuisine,
  image_url = excluded.image_url,
  address = excluded.address,
  delivery_radius_km = excluded.delivery_radius_km,
  is_open = excluded.is_open,
  updated_at = now();

insert into public.meals (id, restaurant_id, category_id, name, description, image_url, price_cents, prep_minutes, stock, is_available)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Grilled Salmon Grain Bowl', 'Salmon, farro, greens, avocado, herbs, and lemon vinaigrette.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80', 1895, 25, 30, true),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Roasted Chicken Market Plate', 'Herb chicken with vegetables, rice pilaf, and tahini sauce.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=80', 1695, 22, 35, true),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Mushroom Umami Bowl', 'Roasted mushrooms, brown rice, kale, pickled onions, and miso dressing.', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80', 1495, 18, 25, true),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Coastal Shrimp Salad', 'Chilled shrimp, greens, cucumber, citrus, and dill yogurt.', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=1200&q=80', 1795, 20, 20, true),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Masala Dosa', 'Crisp dosa filled with spiced potatoes, chutney, and sambar.', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80', 1295, 18, 40, true),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Idli Sambar Combo', 'Steamed rice cakes with lentil stew and coconut chutney.', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80', 1095, 15, 35, true),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Paneer Tikka Lunch Box', 'Paneer tikka, basmati rice, cucumber salad, and mint chutney.', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80', 1495, 20, 25, true),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Cardamom Chai Set', 'House chai with two jaggery biscuits.', 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80', 695, 10, 50, true),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Butter Croissant Breakfast', 'Flaky croissant with jam, butter, and seasonal fruit.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80', 895, 10, 45, true),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Turkey Pesto Baguette', 'Roasted turkey, basil pesto, tomato, arugula, and provolone.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80', 1395, 12, 30, true),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Tomato Soup & Sourdough', 'Creamy tomato soup with toasted sourdough.', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 1195, 14, 25, true),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Ham & Gruyere Toastie', 'Toasted country bread, ham, gruyere, mustard, and greens.', 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?auto=format&fit=crop&w=1200&q=80', 1295, 12, 22, true),
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Carne Asada Taco Plate', 'Three tacos with salsa verde, radish, onions, and beans.', 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80', 1595, 18, 40, true),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Chicken Tinga Bowl', 'Rice, beans, chicken tinga, avocado, crema, and pico de gallo.', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80', 1495, 16, 35, true),
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Veggie Chile Relleno', 'Roasted poblano, rice, black beans, and roasted salsa.', 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=1200&q=80', 1395, 20, 20, true),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'Agua Fresca Duo', 'Two seasonal aguas frescas packed cold.', 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=1200&q=80', 795, 8, 60, true),
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Chicken Shawarma Plate', 'Marinated chicken, rice, salad, hummus, and garlic sauce.', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1200&q=80', 1595, 18, 35, true),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Falafel Mezze Bowl', 'Falafel, tabbouleh, hummus, pickles, tahini, and pita.', 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb0?auto=format&fit=crop&w=1200&q=80', 1395, 15, 30, true),
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Spinach Feta Pie', 'Warm phyllo pie with spinach, feta, herbs, and lemon.', 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?auto=format&fit=crop&w=1200&q=80', 1195, 14, 24, true),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Mint Lemonade', 'Cold mint lemonade with citrus and a touch of honey.', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80', 595, 5, 70, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  price_cents = excluded.price_cents,
  prep_minutes = excluded.prep_minutes,
  stock = excluded.stock,
  is_available = excluded.is_available,
  updated_at = now();

insert into public.products (id, seller_id, category_id, name, description, image_url, price_cents, stock, ingredients, nutrition, is_available)
values
  ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Sea Salt Granola', 'Oat granola with almonds, coconut, and sea salt.', 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=1200&q=80', 899, 80, 'Oats, almonds, coconut, honey, sea salt', '{"serving":"55g","calories":230}', true),
  ('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Farro Grain Pouch', 'Cook-ready pearled farro for salads and bowls.', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=80', 749, 55, 'Farro', '{"serving":"75g","calories":260}', true),
  ('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Lemon Herb Crackers', 'Crisp crackers with herbs and lemon zest.', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1200&q=80', 599, 70, 'Wheat flour, olive oil, herbs, lemon', '{"serving":"30g","calories":130}', true),
  ('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Avocado Lime Dressing', 'Bottle of creamy avocado lime dressing.', 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=1200&q=80', 795, 40, 'Avocado, lime, herbs, vinegar', '{"serving":"30ml","calories":90}', true),
  ('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Sourdough Boule', 'Naturally leavened sourdough loaf.', 'https://images.unsplash.com/photo-1585478259715-1c093a2eda91?auto=format&fit=crop&w=1200&q=80', 950, 35, 'Flour, water, salt, starter', '{"serving":"60g","calories":160}', true),
  ('50000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Chocolate Hazelnut Biscotti', 'Crunchy biscotti packed in a bakery bag.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80', 799, 45, 'Flour, eggs, hazelnuts, cocoa', '{"serving":"40g","calories":180}', true),
  ('50000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Cold Brew Bottle', 'Smooth bottled cold brew coffee.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80', 525, 90, 'Coffee, water', '{"serving":"355ml","calories":15}', true),
  ('50000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Roasted Almond Butter', 'Small-batch almond butter with a pinch of salt.', 'https://images.unsplash.com/photo-1609501676725-7186f734fdd6?auto=format&fit=crop&w=1200&q=80', 1195, 35, 'Almonds, salt', '{"serving":"32g","calories":190}', true),
  ('50000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Dried Mango Slices', 'Unsweetened dried mango snack pouch.', 'https://images.unsplash.com/photo-1624300629298-e9de39c13be8?auto=format&fit=crop&w=1200&q=80', 699, 65, 'Mango', '{"serving":"40g","calories":140}', true),
  ('50000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Tomato Basil Soup Jar', 'Shelf-stable tomato basil soup.', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80', 899, 42, 'Tomato, basil, onion, olive oil', '{"serving":"240ml","calories":120}', true),
  ('50000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Stone Ground Tortilla Chips', 'Crisp tortilla chips made from stone-ground corn.', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=80', 649, 100, 'Corn, oil, salt', '{"serving":"28g","calories":150}', true),
  ('50000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Roasted Salsa Verde', 'Jarred tomatillo salsa with roasted peppers.', 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=1200&q=80', 799, 60, 'Tomatillo, jalapeno, onion, cilantro', '{"serving":"30g","calories":20}', true),
  ('50000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Hibiscus Agua Fresca', 'Bottled hibiscus agua fresca.', 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=1200&q=80', 495, 75, 'Hibiscus, citrus, cane sugar', '{"serving":"355ml","calories":90}', true),
  ('50000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Black Bean Meal Starter', 'Seasoned black beans for bowls and tacos.', 'https://images.unsplash.com/photo-1626201850129-a4f0c3f89e8d?auto=format&fit=crop&w=1200&q=80', 725, 55, 'Black beans, spices, onion, garlic', '{"serving":"130g","calories":170}', true),
  ('50000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Herbed Couscous Box', 'Quick-cooking couscous with herbs and lemon.', 'https://images.unsplash.com/photo-1604908812863-9b4765354f1d?auto=format&fit=crop&w=1200&q=80', 675, 48, 'Couscous, herbs, lemon peel', '{"serving":"60g","calories":220}', true),
  ('50000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Garlic Hummus Tub', 'Creamy hummus with garlic and tahini.', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80', 699, 50, 'Chickpeas, tahini, garlic, lemon', '{"serving":"50g","calories":130}', true),
  ('50000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Marinated Olive Mix', 'Jarred olives with citrus peel and herbs.', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80', 995, 45, 'Olives, olive oil, herbs, citrus', '{"serving":"30g","calories":80}', true),
  ('50000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Pistachio Halva Bites', 'Individually wrapped pistachio halva pieces.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80', 849, 38, 'Sesame, sugar, pistachio', '{"serving":"35g","calories":170}', true),
  ('50000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Zaatar Pita Crisps', 'Baked pita crisps with zaatar.', 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?auto=format&fit=crop&w=1200&q=80', 599, 72, 'Pita, olive oil, zaatar', '{"serving":"28g","calories":130}', true),
  ('50000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Mint Lemon Sparkler', 'Sparkling mint lemon drink.', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80', 425, 80, 'Carbonated water, lemon, mint', '{"serving":"355ml","calories":60}', true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  price_cents = excluded.price_cents,
  stock = excluded.stock,
  ingredients = excluded.ingredients,
  nutrition = excluded.nutrition,
  is_available = excluded.is_available,
  updated_at = now();

insert into public.carts (id, customer_id)
values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000103')
on conflict (customer_id) do nothing;
