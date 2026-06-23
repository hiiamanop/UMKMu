alter table tenants
  add column if not exists page_about_story_image_url          text,
  add column if not exists page_sustainability_story_image_url text;
