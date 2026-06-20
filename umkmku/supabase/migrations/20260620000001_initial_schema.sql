-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants: satu baris per merchant
create table public.tenants (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  created_at      timestamptz default now(),

  brand_name      text not null,
  tagline         text,
  description     text,
  primary_color   text not null default '#1a1a1a',
  secondary_color text not null default '#f5f5f5',
  accent_color    text not null default '#d4a574',
  logo_url        text,
  hero_image_url  text,

  whatsapp_number text,
  instagram_url   text,
  tokopedia_url   text,
  shopee_url      text,

  chatbot_name    text not null default 'Beauty Advisor',
  chatbot_persona text,

  is_active       boolean not null default true,
  owner_email     text
);

-- Products: banyak per tenant
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  created_at  timestamptz default now(),

  name         text not null,
  description  text,
  price        integer,
  image_url    text,

  skin_types   text[] not null default '{}',
  concerns     text[] not null default '{}',
  ingredients  text[] not null default '{}',
  usage_step   text,

  tokopedia_url text,
  shopee_url    text,

  sort_order   integer not null default 0,
  is_active    boolean not null default true
);

-- Chat sessions: untuk analytics
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  started_at  timestamptz default now(),
  messages    jsonb not null default '[]',
  ended_at    timestamptz
);

-- Index untuk performa
create index idx_products_tenant_id on public.products(tenant_id);
create index idx_products_tenant_active on public.products(tenant_id, is_active);
create index idx_chat_sessions_tenant_id on public.chat_sessions(tenant_id);

-- Row Level Security
alter table public.tenants enable row level security;
alter table public.products enable row level security;
alter table public.chat_sessions enable row level security;

-- Policy: siapapun bisa baca tenant yang aktif (untuk render store publik)
create policy "Public tenants are viewable by everyone"
  on public.tenants for select
  using (is_active = true);

-- Policy: siapapun bisa baca produk aktif dari tenant aktif
create policy "Active products are viewable by everyone"
  on public.products for select
  using (is_active = true);

-- Policy: siapapun bisa insert chat session (customer chatting)
create policy "Anyone can create chat sessions"
  on public.chat_sessions for insert
  with check (true);

-- Policy: siapapun bisa update chat session (append messages)
create policy "Anyone can update chat sessions"
  on public.chat_sessions for update
  using (true);

-- Service role bisa akses semua (untuk server-side operations)
-- Ini otomatis dengan service_role key, tidak perlu policy tambahan
