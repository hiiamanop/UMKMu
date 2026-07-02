-- Token management: WA notification flag + admin override per merchant
alter table tenant_subscriptions
  add column if not exists notified_80pct_tokens boolean not null default false,
  add column if not exists ai_token_limit_override bigint default null;
