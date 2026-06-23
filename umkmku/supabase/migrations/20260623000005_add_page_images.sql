alter table tenants
  add column if not exists page_about_image_url          text,
  add column if not exists page_ingredients_image_url    text,
  add column if not exists page_sustainability_image_url text;
