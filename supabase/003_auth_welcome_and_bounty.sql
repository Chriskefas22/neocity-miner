-- NeoCity Miner V4.5 final auth/reward hardening
-- New users get profile, wallet, and Level 0 progress row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,username,display_name,status,referral_code)
  values(
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username',''),'user_'||substring(new.id::text from 1 for 8)),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''),coalesce(new.raw_user_meta_data ->> 'full_name','NeoCitizen')),
    'active',
    upper(substring(replace(new.id::text,'-','') from 1 for 10))
  ) on conflict(id) do nothing;

  insert into public.wallets(id,user_id,neocoin_balance,usd_balance)
  values(gen_random_uuid(),new.id,0,0) on conflict(user_id) do nothing;

  insert into public.user_account_progress(id,user_id,current_level,current_xp,total_xp_earned)
  values(gen_random_uuid(),new.id,0,0,0) on conflict(user_id) do nothing;

  return new;
end;
$$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
