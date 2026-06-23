alter table tenants
  add column if not exists page_ingredients_title  text,
  add column if not exists page_ingredients_items  jsonb;
