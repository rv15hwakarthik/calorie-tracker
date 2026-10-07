alter table public.profiles
  add column if not exists timezone text not null default 'UTC';

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
    and log_date = (timezone(coalesce(new.timezone, 'UTC'), now()))::date;
  return new;
end;
$$;
