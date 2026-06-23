alter table tenants
  add column if not exists page_sustainability_story_title text,
  add column if not exists page_sustainability_story_body  text;
