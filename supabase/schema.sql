-- ============================================================
-- A-frame Qusar: verilənlər bazası sxemi
-- Supabase → SQL Editor → bu faylın hamısını yapışdırın → Run
-- ============================================================

-- ---------- Adminlər ----------
-- Supabase Auth-da istifadəçi yaradın, sonra onun id-sini bura əlavə edin:
--   insert into admins (user_id) values ('<auth.users id>');
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ---------- Evlər ----------
create table if not exists houses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  type text not null default 'aframe' check (type in ('aframe', 'house')),
  name_az text not null,
  name_ru text,
  short_az text,                -- kartlarda görünən qısa təsvir
  short_ru text,
  description_az text,
  description_ru text,
  capacity int not null default 2 check (capacity > 0),
  bedrooms int not null default 1 check (bedrooms >= 0),
  bathrooms int not null default 1 check (bathrooms >= 0),
  price_weekday numeric(10,2) not null check (price_weekday >= 0),  -- AZN, gecəlik
  price_weekend numeric(10,2) check (price_weekend >= 0),           -- Cümə/Şənbə gecəsi
  amenities text[] not null default '{}',   -- fireplace, jacuzzi, bbq, wifi ...
  lat double precision,
  lng double precision,
  distance_shahdag_km numeric(5,1),
  is_published boolean not null default false,
  sort_order int not null default 0,
  seo_title_az text,
  seo_title_ru text,
  seo_description_az text,
  seo_description_ru text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists house_images (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  path text not null,           -- Storage-da "house-images" bucket-indəki yol
  alt_az text,
  alt_ru text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists house_images_house_idx on house_images (house_id, sort_order);

-- Video tur: YouTube linki (telefonla çəkilmiş video YouTube-a yüklənir)
alter table houses add column if not exists video_url text;

-- Panorama / 360° tur: hər otaq üçün telefonun "Panorama" rejimi ilə çəkilmiş şəkil
create table if not exists house_panoramas (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  path text not null,              -- Storage-da "house-images" bucket-indəki yol
  title_az text,                   -- otağın adı: "Qonaq otağı"
  title_ru text,
  aspect numeric(6,3) not null,    -- en / hündürlük
  full_circle boolean not null default false, -- 360° tam dövrə çəkilibmi
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists house_panoramas_house_idx on house_panoramas (house_id, sort_order);

-- Mövsüm qiymətləri (Yeni il, Novruz, yay və s.). Əsas qiymətin üstünə yazılır.
create table if not exists seasonal_prices (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  price numeric(10,2) not null check (price >= 0),
  check (end_date >= start_date)
);
create index if not exists seasonal_prices_house_idx on seasonal_prices (house_id, start_date);

-- ---------- Rezervasiyalar ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references houses(id) on delete set null,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  check_in date not null,
  check_out date not null,
  guests int not null default 2 check (guests between 1 and 50),
  message text check (char_length(message) <= 1000),
  lang text not null default 'az',
  status text not null default 'new' check (status in ('new', 'confirmed', 'cancelled')),
  admin_note text,
  created_at timestamptz not null default now(),
  check (check_out > check_in)
);
create index if not exists bookings_status_idx on bookings (status, created_at desc);

-- Dolu günlər (təqvim). Admin əl ilə əlavə edir və ya təsdiqlənmiş rezervasiyadan yaranır.
create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses(id) on delete cascade,
  start_date date not null,     -- giriş günü
  end_date date not null,       -- çıxış günü (bu gün artıq boşdur)
  booking_id uuid references bookings(id) on delete cascade,
  note text,
  check (end_date > start_date)
);
create index if not exists blocked_dates_house_idx on blocked_dates (house_id, start_date);

-- ---------- Rəylər ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  house_id uuid references houses(id) on delete set null,
  author text not null check (char_length(author) between 2 and 60),
  rating int not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 5 and 1500),
  lang text not null default 'az',
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Bloq ----------
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  lang text not null default 'az' check (lang in ('az', 'ru')),
  title text not null,
  excerpt text,
  content text,                 -- Markdown
  cover_path text,
  seo_title text,
  seo_description text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lang, slug)
);

-- ---------- Ayarlar (telefon, WhatsApp, sosial şəbəkələr, SEO) ----------
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- updated_at avtomatik yenilənsin ----------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists houses_touch on houses;
create trigger houses_touch before update on houses for each row execute function touch_updated_at();
drop trigger if exists posts_touch on posts;
create trigger posts_touch before update on posts for each row execute function touch_updated_at();

-- ============================================================
-- Təhlükəsizlik (Row Level Security)
-- Ziyarətçilər yalnız dərc olunmuş məlumatı görür.
-- Ziyarətçi yalnız rezervasiya sorğusu və rəy göndərə bilər.
-- Qalan hər şeyi yalnız admin edir.
-- ============================================================
alter table admins          enable row level security;
alter table houses          enable row level security;
alter table house_images    enable row level security;
alter table seasonal_prices enable row level security;
alter table house_panoramas enable row level security;
alter table bookings        enable row level security;
alter table blocked_dates   enable row level security;
alter table reviews         enable row level security;
alter table posts           enable row level security;
alter table settings        enable row level security;

-- Adminlər
drop policy if exists "admins: self read" on admins;
create policy "admins: self read" on admins for select using (user_id = auth.uid());

-- Evlər
drop policy if exists "houses: public read" on houses;
create policy "houses: public read" on houses for select using (is_published or is_admin());
drop policy if exists "houses: admin write" on houses;
create policy "houses: admin write" on houses for all using (is_admin()) with check (is_admin());

-- Şəkillər, mövsüm qiymətləri, dolu günlər: dərc olunmuş evə aiddirsə hamı görür
drop policy if exists "house_images: public read" on house_images;
create policy "house_images: public read" on house_images for select
  using (is_admin() or exists (select 1 from houses h where h.id = house_id and h.is_published));
drop policy if exists "house_images: admin write" on house_images;
create policy "house_images: admin write" on house_images for all using (is_admin()) with check (is_admin());

drop policy if exists "house_panoramas: public read" on house_panoramas;
create policy "house_panoramas: public read" on house_panoramas for select
  using (is_admin() or exists (select 1 from houses h where h.id = house_id and h.is_published));
drop policy if exists "house_panoramas: admin write" on house_panoramas;
create policy "house_panoramas: admin write" on house_panoramas for all using (is_admin()) with check (is_admin());

drop policy if exists "seasonal_prices: public read" on seasonal_prices;
create policy "seasonal_prices: public read" on seasonal_prices for select
  using (is_admin() or exists (select 1 from houses h where h.id = house_id and h.is_published));
drop policy if exists "seasonal_prices: admin write" on seasonal_prices;
create policy "seasonal_prices: admin write" on seasonal_prices for all using (is_admin()) with check (is_admin());

drop policy if exists "blocked_dates: public read" on blocked_dates;
create policy "blocked_dates: public read" on blocked_dates for select
  using (is_admin() or exists (select 1 from houses h where h.id = house_id and h.is_published));
drop policy if exists "blocked_dates: admin write" on blocked_dates;
create policy "blocked_dates: admin write" on blocked_dates for all using (is_admin()) with check (is_admin());

-- Rezervasiyalar: hər kəs yeni sorğu göndərə bilər, oxumaq yalnız admin
drop policy if exists "bookings: public insert" on bookings;
create policy "bookings: public insert" on bookings for insert
  with check (status = 'new' and admin_note is null and check_in >= current_date);
drop policy if exists "bookings: admin all" on bookings;
create policy "bookings: admin all" on bookings for all using (is_admin()) with check (is_admin());

-- Rəylər: hər kəs göndərə bilər (təsdiqsiz), ictimai yalnız təsdiqlənmişlər
drop policy if exists "reviews: public read" on reviews;
create policy "reviews: public read" on reviews for select using (is_approved or is_admin());
drop policy if exists "reviews: public insert" on reviews;
create policy "reviews: public insert" on reviews for insert with check (is_approved = false);
drop policy if exists "reviews: admin all" on reviews;
create policy "reviews: admin all" on reviews for all using (is_admin()) with check (is_admin());

-- Bloq
drop policy if exists "posts: public read" on posts;
create policy "posts: public read" on posts for select using (is_published or is_admin());
drop policy if exists "posts: admin write" on posts;
create policy "posts: admin write" on posts for all using (is_admin()) with check (is_admin());

-- Ayarlar
drop policy if exists "settings: public read" on settings;
create policy "settings: public read" on settings for select using (true);
drop policy if exists "settings: admin write" on settings;
create policy "settings: admin write" on settings for all using (is_admin()) with check (is_admin());

-- ============================================================
-- API girişi. Yeni Supabase layihələrində cədvəllər avtomatik API-yə açılmır.
-- Kimin nəyi görə biləcəyini yuxarıdakı RLS qaydaları müəyyən edir.
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select on houses, house_images, house_panoramas, seasonal_prices, blocked_dates, reviews, posts, settings to anon;
grant insert on bookings, reviews to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function is_admin() to anon, authenticated;

-- ============================================================
-- Şəkil saxlama (Storage)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('house-images', 'house-images', true)
on conflict (id) do nothing;

drop policy if exists "house-images: public read" on storage.objects;
create policy "house-images: public read" on storage.objects for select
  using (bucket_id = 'house-images');
drop policy if exists "house-images: admin insert" on storage.objects;
create policy "house-images: admin insert" on storage.objects for insert
  with check (bucket_id = 'house-images' and is_admin());
drop policy if exists "house-images: admin update" on storage.objects;
create policy "house-images: admin update" on storage.objects for update
  using (bucket_id = 'house-images' and is_admin());
drop policy if exists "house-images: admin delete" on storage.objects;
create policy "house-images: admin delete" on storage.objects for delete
  using (bucket_id = 'house-images' and is_admin());
