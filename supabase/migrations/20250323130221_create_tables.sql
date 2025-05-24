grant usage on schema public to service_role;

grant usage on schema public to anon;

grant usage on schema public to anon;

create table if not exists public.artists (
  id uuid default uuid_generate_v4 () primary key,
  name text unique not null,
  description text not null
);

create table if not exists public.songs (
  id uuid default uuid_generate_v4 () primary key,
  artist_id uuid not null references public.artists (id) on delete cascade,
  name text not null,
  description text not null,
  constraint unique_song_per_artist unique (artist_id, name)
);

create table if not exists public.videos (
  id uuid default uuid_generate_v4 () primary key,
  video_id text unique not null,
  title text not null,
  published_at timestamptz not null
);

create type performance_accompaniment as enum ('KARAOKE', 'ACOUSTIC', 'ELECTRIC');

create type performance_length as enum ('SHORT', 'FULL');

create table if not exists public.performances (
  id uuid default uuid_generate_v4 () primary key,
  song_id uuid not null references public.songs (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  accompaniment performance_accompaniment not null,
  length performance_length not null,
  recommended boolean not null,
  start_sec integer not null check (start_sec >= 0),
  end_sec integer not null check (start_sec <= end_sec)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  performance_id uuid not null references public.performances (id) on delete cascade,
  created_at timestamptz not null default now (),
  primary key (user_id, performance_id)
);

create table if not exists public.playlists (
  id uuid default uuid_generate_v4 () primary key,
  name text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  public boolean not null default false,
  description text not null,
  created_at timestamptz not null default now ()
);

create table public.playlist_performances (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  performance_id uuid not null references public.performances (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  track_order integer not null,
  created_at timestamptz not null default now (),
  primary key (user_id, playlist_id, track_order)
);

create table if not exists public.original (
  id uuid default uuid_generate_v4 () primary key,
  song_id uuid not null references public.songs (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  start_sec integer check (start_sec >= 0),
  end_sec integer check (start_sec <= end_sec)
);

create table if not exists public.tags (
  id uuid default uuid_generate_v4 () primary key,
  name text unique not null,
  parent_id uuid references public.tags (id) on delete cascade,
  constraint no_self_reference check (id != parent_id)
);

create table if not exists public.song_tags (
  song_id uuid not null references public.songs (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (song_id, tag_id)
);

create table if not exists public.artist_alias (
  id uuid default uuid_generate_v4 () primary key,
  artist_id uuid not null references public.artists (id) on delete cascade,
  alias text not null
);

create table if not exists public.song_alias (
  id uuid default uuid_generate_v4 () primary key,
  song_id uuid not null references public.songs (id) on delete cascade,
  alias text not null
);

grant all on table public.artists to service_role;

grant select on table public.artists to authenticated;

grant select on table public.artists to anon;

grant all on table public.songs to service_role;

grant select on table public.songs to authenticated;

grant select on table public.songs to anon;

grant all on table public.videos to service_role;

grant select on table public.videos to authenticated;

grant select on table public.videos to anon;

grant all on table public.performances to service_role;

grant select on table public.performances to authenticated;

grant select on table public.performances to anon;

grant all on table public.favorites to service_role;

grant all on table public.favorites to authenticated;

grant all on table public.playlists to service_role;

grant all on table public.playlists to authenticated;

grant all on table public.playlist_performances to service_role;

grant all on table public.playlist_performances to authenticated;

grant all on table public.original to service_role;

grant select on table public.original to authenticated;

grant all on table public.tags to service_role;

grant select on table public.tags to authenticated;

grant all on table public.song_tags to service_role;

grant select on table public.song_tags to service_role;

grant all on table public.artist_alias to service_role;

grant all on table public.song_alias to service_role;

-- realtime
drop publication if exists supabase_realtime;

create publication supabase_realtime;

-- artists
alter table public.artists enable row level security;
create policy "Users can read artists" on public.artists for
select
  using (true);

-- songs
alter table public.songs enable row level security;
create policy "Users can read songs" on public.songs for
select
  using (true);

--videos
alter table public.videos enable row level security;
create policy "Users can read videos" on public.videos for
select
  using (true);

--performances
alter table public.performances enable row level security;
create policy "Users can read performances" on public.performances for
select
  using (true);

-- favorites
alter table public.favorites enable row level security;

alter table public.favorites replica identity full;

create policy "Users can read only their own favorites" on public.favorites for
select
  using (user_id = (select auth.uid ()));

create policy "Users can insert only their own favorites" on public.favorites for insert
with
  check (user_id = (select auth.uid ()));

create policy "Users can delete only their own favorites" on public.favorites for delete
  using (user_id = (select auth.uid ()));

alter publication supabase_realtime add table public.favorites;

-- playlists
alter table public.playlists enable row level security;

alter table public.playlists replica identity full;

create policy "Users can read only their own playlists or public playlists" on public.playlists for
select
  using (public = true or user_id = (select auth.uid ()));

create policy "Users can insert only their own playlists" on public.playlists for insert
with
  check (user_id = (select auth.uid ()));

create policy "Users can update only their own playlists" on public.playlists for update
  using (user_id = (select auth.uid ()))
  with check (user_id = (select auth.uid ()));

create policy "Users can delete only their own playlists" on public.playlists for
delete
  using (user_id = (select auth.uid ()));

alter publication supabase_realtime add table public.playlists;

-- playlist_performances
alter table public.playlist_performances enable row level security;

alter table public.playlist_performances replica identity full;

create policy "Users can read only their own playlist_performances or public playlist_performances" on public.playlist_performances for
select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_performances.playlist_id
      and (p.public = true or p.user_id = (select auth.uid()))
    )
  );

create policy "Users can insert only their own playlist_performances" on public.playlist_performances for insert
with
  check (user_id = (select auth.uid ()));

create policy "Users can delete only their own playlist_performances" on public.playlist_performances for delete
  using (user_id = (select auth.uid ()));

create policy "Users can update only their own playlist_performances" on public.playlist_performances for update
  using (user_id = (select auth.uid ()))
  with check (user_id = (select auth.uid ()));

alter publication supabase_realtime add table public.playlist_performances;


create or replace function normalize_playlist_track_order(
  _playlist_id uuid
) returns void as $$
declare
  _user_id uuid := auth.uid();
begin
  with ordered as (
    select
      user_id,
      playlist_id,
      track_order,
      row_number() over (order by track_order) - 1 as new_order
    from playlist_performances
    where playlist_id = _playlist_id
      and user_id = _user_id
  )
  update playlist_performances
  set track_order = ordered.new_order
  from ordered
  where playlist_performances.user_id = ordered.user_id
    and playlist_performances.playlist_id = ordered.playlist_id
    and playlist_performances.track_order = ordered.track_order
    and playlist_performances.track_order != ordered.new_order;
end;
$$ language plpgsql
set search_path = public
security invoker;


create or replace function insert_playlist_performance(
  _playlist_id uuid,
  _performance_id uuid
) returns void as $$
declare
  next_order integer;
begin
  perform normalize_playlist_track_order(_playlist_id);

  select case
    when count(*) = 0 then 0
    else max(track_order) + 1
  end
  into next_order
  from playlist_performances
  where playlist_id = _playlist_id;

  insert into playlist_performances (
    playlist_id,
    performance_id,
    user_id,
    track_order
  ) values (
    _playlist_id,
    _performance_id,
    auth.uid(),
    next_order
  );
end;
$$ language plpgsql
set search_path = public
security invoker;


create or replace function reorder_playlist_performance(
  _playlist_id uuid,
  _from_index integer,
  _to_index integer
) returns void as $$
declare
  _user_id uuid := auth.uid();
  _temp_order integer := -1;
begin
  if _from_index = _to_index then
    return;
  end if;

  update playlist_performances
  set track_order = _temp_order
  where playlist_id = _playlist_id
    and user_id = _user_id
    and track_order = _from_index;

  if _from_index > _to_index then
    update playlist_performances
    set track_order = track_order + 1
    where playlist_id = _playlist_id
      and user_id = _user_id
      and track_order >= _to_index
      and track_order < _from_index;

  elsif _from_index < _to_index then
    update playlist_performances
    set track_order = track_order - 1
    where playlist_id = _playlist_id
      and user_id = _user_id
      and track_order > _from_index
      and track_order <= _to_index;
  end if;

  update playlist_performances
  set track_order = _to_index
  where playlist_id = _playlist_id
    and user_id = _user_id
    and track_order = _temp_order;

  perform normalize_playlist_track_order(_playlist_id);
end;
$$ language plpgsql
set search_path = public
security invoker;

create or replace function delete_playlist_performance(
  _playlist_id uuid,
  _track_order integer
) returns void as $$
declare
  _user_id uuid := auth.uid();
begin
  delete from playlist_performances
  where playlist_id = _playlist_id
    and user_id = _user_id
    and track_order = _track_order;

  perform normalize_playlist_track_order(_playlist_id);
end;
$$ language plpgsql
set search_path = public
security invoker;

create or replace function update_playlist_performances(
  _performance_ids jsonb,  -- key: order, value: performance_id
  _playlist_id uuid
) returns void as $$
declare
  _user_id uuid := auth.uid();
  item record;
begin
  delete from playlist_performances
  where user_id = _user_id
    and playlist_id = _playlist_id;

  for item in
    select key::int as track_order, value::uuid as performance_id
    from jsonb_each_text(_performance_ids)
    order by key::int
  loop
    insert into playlist_performances (
      playlist_id,
      performance_id,
      user_id,
      track_order
    ) values (
      _playlist_id,
      item.performance_id,
      _user_id,
      item.track_order
    );
  end loop;
end;
$$ language plpgsql
set search_path = public
security invoker;

-- original
alter table public.original enable row level security;
create policy "Users can read original" on public.original for
select
  using (true);

-- tags
alter table public.tags enable row level security;
create policy "Users can read tags" on public.tags for
select
  using (true);

create or replace function get_tag_tree()
returns table (
  id integer,
  name text,
  parent_id integer,
  level integer
) as $$
begin
  return query
  with recursive tag_tree as (
    select id, name, parent_id, 1 as level
    from tags
    where parent_id is null

    union all

    select t.id, t.name, t.parent_id, tt.level + 1
    from tags t
    join tag_tree tt on t.parent_id = tt.id
  )
  select * from tag_tree;
end;
$$ language plpgsql
set search_path = public
security invoker;

-- song_tags
alter table public.song_tags enable row level security;
create policy "Users can read song_tags" on public.song_tags for
select
  using (true);

-- artist_alias
alter table public.artist_alias enable row level security;
create policy "Users can read artist_alias" on public.artist_alias for
select
  using (true);

-- song_alias
alter table public.song_alias enable row level security;
create policy "Users can read song_alias" on public.song_alias for
select
  using (true);

