-- =====================================================================
-- drovex — Supabase schema, security and seed data
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---------- 1. TABLES -------------------------------------------------

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  name           text        not null,
  name_ar        text,
  description    text,
  description_ar text,
  tech_used      text[]      not null default '{}',
  live_link      text,
  created_at     timestamptz not null default now()
);

create table if not exists public.social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text        not null unique,
  url        text        not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists social_links_touch on public.social_links;
create trigger social_links_touch
  before update on public.social_links
  for each row execute function public.touch_updated_at();

-- ---------- 2. ROW LEVEL SECURITY ------------------------------------
-- The publishable (anon) key ships inside the website bundle, so anyone can
-- use it. Therefore: the public may READ both tables, but every WRITE goes
-- through the passphrase-checked functions in section 3.

alter table public.projects     enable row level security;
alter table public.social_links enable row level security;

drop policy if exists "public read projects"     on public.projects;
drop policy if exists "public read social_links" on public.social_links;

create policy "public read projects"
  on public.projects for select to anon, authenticated using (true);
create policy "public read social_links"
  on public.social_links for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.projects     from anon, authenticated;
revoke insert, update, delete, truncate on public.social_links from anon, authenticated;

-- ---------- 3. ADMIN PASSPHRASE + WRITE FUNCTIONS --------------------
-- The passphrase is stored only as a bcrypt hash in a table that anon cannot
-- read. To change it later:
--   update public.admin_secrets
--   set passphrase_hash = extensions.crypt('NEW-PASSPHRASE', extensions.gen_salt('bf'));

create table if not exists public.admin_secrets (
  id              boolean primary key default true check (id),
  passphrase_hash text not null
);

alter table public.admin_secrets enable row level security;  -- no policies = no access
revoke all on public.admin_secrets from anon, authenticated;

insert into public.admin_secrets (id, passphrase_hash)
values (true, extensions.crypt('drovex2026', extensions.gen_salt('bf')))
on conflict (id) do nothing;

create or replace function public._admin_assert(p_passphrase text)
returns void
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from public.admin_secrets
    where passphrase_hash = crypt(coalesce(p_passphrase, ''), passphrase_hash)
  ) then
    perform pg_sleep(0.6);  -- slows down guessing
    raise exception 'Invalid passphrase' using errcode = '28000';
  end if;
end $$;

revoke all on function public._admin_assert(text) from public, anon, authenticated;

create or replace function public.admin_verify(p_passphrase text)
returns boolean
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  return exists (
    select 1 from public.admin_secrets
    where passphrase_hash = crypt(coalesce(p_passphrase, ''), passphrase_hash)
  );
end $$;

create or replace function public.admin_save_project(
  p_passphrase     text,
  p_id             uuid,
  p_name           text,
  p_name_ar        text,
  p_description    text,
  p_description_ar text,
  p_tech_used      text[],
  p_live_link      text
)
returns public.projects
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  result public.projects;
begin
  perform public._admin_assert(p_passphrase);

  if coalesce(trim(p_name), '') = '' then
    raise exception 'Project name is required';
  end if;

  if p_id is null then
    insert into public.projects (name, name_ar, description, description_ar, tech_used, live_link)
    values (trim(p_name), nullif(trim(p_name_ar), ''), nullif(trim(p_description), ''),
            nullif(trim(p_description_ar), ''), coalesce(p_tech_used, '{}'), nullif(trim(p_live_link), ''))
    returning * into result;
  else
    update public.projects
       set name           = trim(p_name),
           name_ar        = nullif(trim(p_name_ar), ''),
           description    = nullif(trim(p_description), ''),
           description_ar = nullif(trim(p_description_ar), ''),
           tech_used      = coalesce(p_tech_used, '{}'),
           live_link      = nullif(trim(p_live_link), '')
     where id = p_id
     returning * into result;
    if not found then
      raise exception 'Project not found';
    end if;
  end if;

  return result;
end $$;

create or replace function public.admin_delete_project(p_passphrase text, p_id uuid)
returns void
language plpgsql security definer
set search_path = public, extensions
as $$
begin
  perform public._admin_assert(p_passphrase);
  delete from public.projects where id = p_id;
end $$;

create or replace function public.admin_update_social(p_passphrase text, p_platform text, p_url text)
returns public.social_links
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  result public.social_links;
begin
  perform public._admin_assert(p_passphrase);

  insert into public.social_links (platform, url)
  values (trim(p_platform), coalesce(trim(p_url), ''))
  on conflict (platform) do update set url = excluded.url
  returning * into result;

  return result;
end $$;

grant execute on function public.admin_verify(text)                                                       to anon, authenticated;
grant execute on function public.admin_save_project(text, uuid, text, text, text, text, text[], text)     to anon, authenticated;
grant execute on function public.admin_delete_project(text, uuid)                                         to anon, authenticated;
grant execute on function public.admin_update_social(text, text, text)                                    to anon, authenticated;

-- ---------- 4. REALTIME (live portfolio updates) ---------------------

do $$ begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object or undefined_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.social_links;
exception when duplicate_object or undefined_object then null; end $$;

-- ---------- 5. SEED DATA ---------------------------------------------

insert into public.social_links (platform, url) values
  ('Facebook',  'https://facebook.com/'),
  ('Instagram', 'https://instagram.com/'),
  ('Telegram',  'https://t.me/'),
  ('WhatsApp',  'https://wa.me/'),
  ('LinkedIn',  'https://linkedin.com/')
on conflict (platform) do nothing;

-- Placeholder projects so the portfolio is not empty on first run.
-- Replace or delete them from /admin.
insert into public.projects (name, name_ar, description, description_ar, tech_used, live_link)
select * from (values
  ('Sample — Enterprise Web Portal',
   'نموذج — بوابة ويب للشركات',
   'A placeholder project. Replace it from the admin terminal with one of your real deliveries.',
   'مشروع تجريبي. استبدله من لوحة الإدارة بأحد مشاريعك الحقيقية.',
   array['React','Node.js','PostgreSQL'], null),
  ('Sample — Telegram Sales Bot',
   'نموذج — بوت مبيعات على تيليجرام',
   'A placeholder project showing how automation work is presented.',
   'مشروع تجريبي يوضح طريقة عرض أعمال الأتمتة.',
   array['Telegram Bot API','C#','SQL Server'], null),
  ('Sample — Desktop Inventory Suite',
   'نموذج — نظام مخزون لسطح المكتب',
   'A placeholder project showing how desktop applications are presented.',
   'مشروع تجريبي يوضح طريقة عرض تطبيقات سطح المكتب.',
   array['C#','ASP.NET','SQL Server'], null)
) as v(name, name_ar, description, description_ar, tech_used, live_link)
where not exists (select 1 from public.projects);
