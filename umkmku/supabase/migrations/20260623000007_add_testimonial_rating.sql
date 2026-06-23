alter table testimonials
  add column if not exists rating smallint default 5 check (rating between 1 and 5);
