-- Add category support to tenants table
alter table public.tenants
add column category text not null default 'skincare';

-- Add constraint to restrict categories
alter table public.tenants
add constraint tenants_category_check check (category in ('skincare', 'parfum', 'fashion', 'fdb'));

-- Extend products table with category support
alter table public.products
add column category_type text not null default 'skincare',
add column skincare_data jsonb default null,
add column parfum_data jsonb default null,
add column fashion_data jsonb default null,
add column fdb_data jsonb default null;

-- Add constraint for category_type
alter table public.products
add constraint products_category_type_check check (category_type in ('skincare', 'parfum', 'fashion', 'fdb'));

-- Customers table: untuk repeat purchase tracking
create table public.customers (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  created_at      timestamptz default now(),

  email           text not null,
  phone           text,
  name            text,

  total_orders    integer not null default 0,
  total_spent     integer not null default 0,  -- dalam Rupiah
  last_order_at   timestamptz,

  is_active       boolean not null default true
);

-- Orders table: untuk checkout dan payment tracking
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  customer_id     uuid references public.customers(id) on delete set null,
  created_at      timestamptz default now(),

  -- Customer info (denormalized untuk mudah lookup)
  customer_email  text not null,
  customer_phone  text,
  customer_name   text,

  -- Order items (stored as JSONB: [{product_id, quantity, price_at_purchase}])
  items           jsonb not null default '[]',

  -- Pricing breakdown (dalam Rupiah)
  subtotal        integer not null,
  ppn             integer not null,  -- 12% of subtotal
  subtotal_with_ppn integer not null,  -- subtotal + ppn
  xendit_fee      integer not null,  -- 2.5% of subtotal_with_ppn
  final_price     integer not null,  -- subtotal_with_ppn + xendit_fee

  -- Payment info
  qris_code       text,
  qris_image_url  text,

  -- Status tracking
  payment_status  text not null default 'pending',  -- pending, processing, completed, failed, expired
  order_status    text not null default 'pending',  -- pending, processing, shipped, delivered, cancelled

  -- Metadata
  promo_code      text,
  discount_amount integer default 0,
  notes           text,

  updated_at      timestamptz default now()
);

-- Update chat_sessions to include optional customer and order references
alter table public.chat_sessions
add column customer_id uuid references public.customers(id) on delete set null,
add column recommended_products jsonb default '[]',  -- [{product_id, timestamp}]
add column session_value integer default 0;  -- estimated transaction value if converted

-- Indexes for performance
create index idx_products_tenant_category on public.products(tenant_id, category_type);
create index idx_products_tenant_active_category on public.products(tenant_id, is_active, category_type);
create index idx_products_created_at on public.products(created_at);

create index idx_customers_tenant_id on public.customers(tenant_id);
create index idx_customers_email on public.customers(email);
create index idx_customers_tenant_active on public.customers(tenant_id, is_active);

create index idx_orders_tenant_id on public.orders(tenant_id);
create index idx_orders_tenant_created on public.orders(tenant_id, created_at);
create index idx_orders_payment_status on public.orders(payment_status);
create index idx_orders_customer_email on public.orders(customer_email);
create index idx_orders_qris_code on public.orders(qris_code);

create index idx_chat_sessions_customer_id on public.chat_sessions(customer_id);
create index idx_chat_sessions_created_at on public.chat_sessions(started_at);

-- Row Level Security
alter table public.customers enable row level security;
alter table public.orders enable row level security;

-- RLS Policies for customers: only service role (merchant backend) can see their customers
create policy "Tenants can see their own customers"
  on public.customers for select
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = customers.tenant_id));

create policy "Tenants can create customers"
  on public.customers for insert
  with check (auth.uid()::uuid = (select id from public.tenants where tenants.id = customers.tenant_id));

create policy "Tenants can update their customers"
  on public.customers for update
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = customers.tenant_id));

-- RLS Policies for orders: only service role can see/create/update
create policy "Tenants can view their orders"
  on public.orders for select
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = orders.tenant_id));

create policy "Tenants can create orders"
  on public.orders for insert
  with check (auth.uid()::uuid = (select id from public.tenants where tenants.id = orders.tenant_id));

create policy "Tenants can update their orders"
  on public.orders for update
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = orders.tenant_id));

-- Update products RLS to allow merchants to modify their own (if auth implemented)
create policy "Tenants can create products"
  on public.products for insert
  with check (auth.uid()::uuid = (select id from public.tenants where tenants.id = products.tenant_id));

create policy "Tenants can update their products"
  on public.products for update
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = products.tenant_id));

create policy "Tenants can delete their products"
  on public.products for delete
  using (auth.uid()::uuid = (select id from public.tenants where tenants.id = products.tenant_id));
