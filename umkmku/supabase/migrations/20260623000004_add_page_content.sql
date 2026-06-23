alter table tenants
  add column if not exists page_about_story       text,
  add column if not exists page_commitments       jsonb,
  add column if not exists page_process_steps     jsonb,
  add column if not exists page_sustainability    jsonb,
  add column if not exists page_stats             jsonb;
