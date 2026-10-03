-- Calorie Tracker MVP — initial schema
-- profiles: current user state and targets
-- daily_logs: per-day consumed totals + snapshotted targets
-- food_entries: individual food items

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  age int check (age is null or (age >= 1 and age <= 120)),
  gender text check (gender is null or gender in ('male', 'female', 'other')),
  height_cm numeric check (height_cm is null or height_cm > 0),
  weight_kg numeric check (weight_kg is null or weight_kg > 0),
  activity_level text check (
    activity_level is null
    or activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')
  ),
  target_protein_g numeric check (target_protein_g is null or target_protein_g >= 0),
  target_fiber_g numeric check (target_fiber_g is null or target_fiber_g >= 0),
  target_carbs_g numeric check (target_carbs_g is null or target_carbs_g >= 0),
  target_fat_g numeric check (target_fat_g is null or target_fat_g >= 0),
  target_calories numeric check (target_calories is null or target_calories >= 0),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  total_protein_g numeric not null default 0 check (total_protein_g >= 0),
  total_fiber_g numeric not null default 0 check (total_fiber_g >= 0),
  total_carbs_g numeric not null default 0 check (total_carbs_g >= 0),
  total_fat_g numeric not null default 0 check (total_fat_g >= 0),
  total_calories numeric not null default 0 check (total_calories >= 0),
  target_protein_g numeric check (target_protein_g is null or target_protein_g >= 0),
  target_fiber_g numeric check (target_fiber_g is null or target_fiber_g >= 0),
  target_carbs_g numeric check (target_carbs_g is null or target_carbs_g >= 0),
  target_fat_g numeric check (target_fat_g is null or target_fat_g >= 0),
  target_calories numeric check (target_calories is null or target_calories >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index daily_logs_user_id_log_date_idx on public.daily_logs (user_id, log_date desc);

create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs (id) on delete cascade,
  item_name text not null check (char_length(trim(item_name)) > 0),
  quantity_grams numeric check (quantity_grams is null or quantity_grams >= 0),
  protein_g numeric not null default 0 check (protein_g >= 0),
  fiber_g numeric not null default 0 check (fiber_g >= 0),
  carbs_g numeric not null default 0 check (carbs_g >= 0),
  fat_g numeric not null default 0 check (fat_g >= 0),
  calories numeric not null default 0 check (calories >= 0),
  source text not null default 'manual' check (source in ('manual', 'ai')),
  created_at timestamptz not null default now()
);

create index food_entries_daily_log_id_idx on public.food_entries (daily_log_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger daily_logs_set_updated_at before update on public.daily_logs
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.recompute_daily_log_totals(p_daily_log_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.daily_logs dl
  set
    total_protein_g = coalesce(t.protein, 0),
    total_fiber_g = coalesce(t.fiber, 0),
    total_carbs_g = coalesce(t.carbs, 0),
    total_fat_g = coalesce(t.fat, 0),
    total_calories = coalesce(t.calories, 0)
  from (
    select
      sum(fe.protein_g) as protein,
      sum(fe.fiber_g) as fiber,
      sum(fe.carbs_g) as carbs,
      sum(fe.fat_g) as fat,
      sum(fe.calories) as calories
    from public.food_entries fe
    where fe.daily_log_id = p_daily_log_id
  ) t
  where dl.id = p_daily_log_id;
end;
$$;

create or replace function public.handle_food_entry_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_daily_log_id uuid;
begin
  v_daily_log_id := coalesce(new.daily_log_id, old.daily_log_id);
  perform public.recompute_daily_log_totals(v_daily_log_id);
  return coalesce(new, old);
end;
$$;

create trigger food_entries_recompute_totals
  after insert or update or delete on public.food_entries
  for each row execute function public.handle_food_entry_change();

create or replace function public.get_or_create_daily_log(p_log_date date)
returns public.daily_logs language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_log public.daily_logs;
  v_profile public.profiles;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;

  select * into v_log from public.daily_logs
  where user_id = v_user_id and log_date = p_log_date;
  if found then return v_log; end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then raise exception 'Profile not found for user %', v_user_id; end if;

  insert into public.daily_logs (
    user_id, log_date,
    target_protein_g, target_fiber_g, target_carbs_g, target_fat_g, target_calories
  ) values (
    v_user_id, p_log_date,
    v_profile.target_protein_g, v_profile.target_fiber_g, v_profile.target_carbs_g,
    v_profile.target_fat_g, v_profile.target_calories
  ) returning * into v_log;

  return v_log;
end;
$$;

create or replace function public.sync_today_daily_log_targets()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.daily_logs
  set
    target_protein_g = new.target_protein_g,
    target_fiber_g = new.target_fiber_g,
    target_carbs_g = new.target_carbs_g,
    target_fat_g = new.target_fat_g,
    target_calories = new.target_calories
  where user_id = new.id
    and log_date = (timezone('Asia/Kolkata', now()))::date;
  return new;
end;
$$;

create trigger profiles_sync_today_targets
  after update of target_protein_g, target_fiber_g, target_carbs_g, target_fat_g, target_calories
  on public.profiles for each row execute function public.sync_today_daily_log_targets();

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.food_entries enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "daily_logs_select_own" on public.daily_logs for select using (auth.uid() = user_id);
create policy "daily_logs_insert_own" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "daily_logs_update_own" on public.daily_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_logs_delete_own" on public.daily_logs for delete using (auth.uid() = user_id);

create policy "food_entries_select_own" on public.food_entries for select using (
  exists (select 1 from public.daily_logs dl where dl.id = food_entries.daily_log_id and dl.user_id = auth.uid())
);
create policy "food_entries_insert_own" on public.food_entries for insert with check (
  exists (select 1 from public.daily_logs dl where dl.id = food_entries.daily_log_id and dl.user_id = auth.uid())
);
create policy "food_entries_update_own" on public.food_entries for update using (
  exists (select 1 from public.daily_logs dl where dl.id = food_entries.daily_log_id and dl.user_id = auth.uid())
) with check (
  exists (select 1 from public.daily_logs dl where dl.id = food_entries.daily_log_id and dl.user_id = auth.uid())
);
create policy "food_entries_delete_own" on public.food_entries for delete using (
  exists (select 1 from public.daily_logs dl where dl.id = food_entries.daily_log_id and dl.user_id = auth.uid())
);

grant execute on function public.get_or_create_daily_log(date) to authenticated;
