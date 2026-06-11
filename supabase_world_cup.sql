-- ============================================================
--  FPL SUPER LEAGUE - WORLD CUP SPECIAL
--  Run this once in your Supabase SQL Editor.
--  All tables are namespaced `wc_*` so they cannot pollute any
--  existing league records or stats.
-- ============================================================

-- 1. PARTICIPANTS ---------------------------------------------
create table if not exists public.wc_participants (
  manager_id      int  primary key,
  nation_name     text not null,
  flag_emoji      text,
  flag_url        text,
  primary_color   text default '#8A1538',
  secondary_color text default '#D4AF37',
  group_name      text
);
grant select on public.wc_participants to anon, authenticated;
grant all on public.wc_participants to service_role;
alter table public.wc_participants enable row level security;
drop policy if exists "wc_participants_read" on public.wc_participants;
create policy "wc_participants_read" on public.wc_participants for select using (true);

-- 2. SQUADS ---------------------------------------------------
create table if not exists public.wc_squad (
  id            uuid primary key default gen_random_uuid(),
  manager_id    int  not null references public.wc_participants(manager_id) on delete cascade,
  player_name   text not null,
  position      text not null check (position in ('GK','DEF','MID','FWD')),
  club          text,
  shirt_number  int,
  is_captain    boolean default false
);
create index if not exists wc_squad_manager_idx on public.wc_squad(manager_id);
grant select on public.wc_squad to anon, authenticated;
grant all on public.wc_squad to service_role;
alter table public.wc_squad enable row level security;
drop policy if exists "wc_squad_read" on public.wc_squad;
create policy "wc_squad_read" on public.wc_squad for select using (true);

-- 3. GAMEWEEK POINTS (drives the live league table) -----------
create table if not exists public.wc_manager_gameweek (
  id          uuid primary key default gen_random_uuid(),
  manager_id  int  not null references public.wc_participants(manager_id) on delete cascade,
  gameweek    int  not null,
  points      int  not null default 0,
  unique (manager_id, gameweek)
);
create index if not exists wc_mgr_gw_idx on public.wc_manager_gameweek(manager_id, gameweek);
grant select on public.wc_manager_gameweek to anon, authenticated;
grant all on public.wc_manager_gameweek to service_role;
alter table public.wc_manager_gameweek enable row level security;
drop policy if exists "wc_mgr_gw_read" on public.wc_manager_gameweek;
create policy "wc_mgr_gw_read" on public.wc_manager_gameweek for select using (true);

-- 4. PLAYER STATS (records + team of the tournament) ----------
create table if not exists public.wc_player_stats (
  id              uuid primary key default gen_random_uuid(),
  manager_id      int  not null references public.wc_participants(manager_id) on delete cascade,
  player_name     text not null,
  position        text not null check (position in ('GK','DEF','MID','FWD')),
  club            text,
  goals           int  default 0,
  assists         int  default 0,
  clean_sheets    int  default 0,
  fantasy_points  int  default 0,
  appearances     int  default 0
);
create index if not exists wc_player_stats_mgr_idx on public.wc_player_stats(manager_id);
grant select on public.wc_player_stats to anon, authenticated;
grant all on public.wc_player_stats to service_role;
alter table public.wc_player_stats enable row level security;
drop policy if exists "wc_player_stats_read" on public.wc_player_stats;
create policy "wc_player_stats_read" on public.wc_player_stats for select using (true);

-- 5. SEED PARTICIPANTS ----------------------------------------
-- Everyone except Jake Toyer (9) and Average Team (12).
insert into public.wc_participants (manager_id, nation_name, flag_emoji, primary_color, secondary_color, group_name) values
  (1,  'El Changusto',         '🇲🇽', '#006847', '#CE1126', 'A'),
  (2,  'Charleston Athletic',  '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '#1B458F', '#FFFFFF', 'A'),
  (3,  'Wiggo Wanderers',      '🇦🇷', '#75AADB', '#FFFFFF', 'A'),
  (4,  'ALS Ajax',             '🇨🇮', '#FF8200', '#009E60', 'B'),
  (5,  'Padleys Piranhas',     '🇩🇪', '#FFCE00', '#DD0000', 'B'),
  (6,  'Fill Her Wycombe FC',  '🇧🇪', '#FDDA24', '#ED2939', 'B'),
  (7,  'Raybould Eagles',      '🇺🇸', '#B22234', '#3C3B6E', 'C'),
  (8,  'Adam All Stars',       '🇧🇷', '#009C3B', '#FFDF00', 'C'),
  (10, 'Send Me Location',     '🇫🇷', '#0055A4', '#EF4135', 'C'),
  (11, 'Not Too Xabi FC',      '🇪🇸', '#AA151B', '#F1BF00', 'C')
on conflict (manager_id) do update
  set nation_name = excluded.nation_name,
      flag_emoji = excluded.flag_emoji,
      primary_color = excluded.primary_color,
      secondary_color = excluded.secondary_color,
      group_name = excluded.group_name;

-- ============================================================
-- DONE. Populate wc_squad / wc_manager_gameweek / wc_player_stats
-- as the tournament progresses.
-- ============================================================
