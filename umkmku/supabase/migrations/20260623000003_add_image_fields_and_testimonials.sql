-- Add image fields to tenants
alter table tenants
  add column if not exists about_image_1_url text,
  add column if not exists about_image_2_url  text,
  add column if not exists cta_image_url      text,
  add column if not exists footer_image_url   text;

-- Testimonials table
create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade not null,
  created_at  timestamptz default now(),

  author_name  text not null,
  author_title text,
  quote        text not null,
  image_1_url  text,
  image_2_url  text,
  sort_order   integer default 0,
  is_active    boolean default true
);

create index if not exists testimonials_tenant_id_idx on testimonials(tenant_id);

-- RLS
alter table testimonials enable row level security;

create policy "Public read testimonials"
  on testimonials for select
  using (is_active = true);

create policy "Service role full access testimonials"
  on testimonials for all
  using (true)
  with check (true);
