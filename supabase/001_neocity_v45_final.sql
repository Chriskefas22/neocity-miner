-- NeoCity Miner V4.5 final alignment. Non-destructive.
alter table if exists public.account_levels drop constraint if exists account_levels_level_check;
alter table if exists public.account_levels add constraint account_levels_level_check check(level>=0 and level<=70);
alter table if exists public.user_account_progress drop constraint if exists user_account_progress_current_level_check;
alter table if exists public.user_account_progress add constraint user_account_progress_current_level_check check(current_level>=0 and current_level<=70);
alter table if exists public.account_level_history drop constraint if exists account_level_history_previous_level_check;
alter table if exists public.account_level_history drop constraint if exists account_level_history_new_level_check;
alter table if exists public.account_level_history add constraint account_level_history_previous_level_check check(previous_level is null or(previous_level>=0 and previous_level<=70));
alter table if exists public.account_level_history add constraint account_level_history_new_level_check check(new_level>=0 and new_level<=70);

alter table if exists public.withdrawals add column if not exists requested_usd numeric(30,8);
alter table if exists public.withdrawals add column if not exists quoted_crypto_price_usd numeric(30,12);

create index if not exists idx_deposits_user_status_created on public.deposits(user_id,status,created_at desc);
create index if not exists idx_withdrawals_user_status_created on public.withdrawals(user_id,status,created_at desc);
create index if not exists idx_mining_entitlements_user_status on public.mining_entitlements(user_id,status);
create index if not exists idx_mining_sessions_user_status on public.mining_sessions(user_id,status);
create index if not exists idx_activity_events_user_type_created on public.activity_events(user_id,event_type,created_at desc);
create index if not exists idx_referrals_referrer_created on public.referrals(referrer_id,created_at desc);

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='mining_pool' and policyname='public_read_mining_pool') then
    create policy public_read_mining_pool on public.mining_pool for select to anon,authenticated using(true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='mining_products' and policyname='public_read_mining_products') then
    create policy public_read_mining_products on public.mining_products for select to anon,authenticated using(is_active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='membership_plans' and policyname='public_read_membership_plans') then
    create policy public_read_membership_plans on public.membership_plans for select to anon,authenticated using(is_active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='items' and policyname='public_read_items') then
    create policy public_read_items on public.items for select to anon,authenticated using(is_active=true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='bounty_definitions' and policyname='public_read_active_bounties') then
    create policy public_read_active_bounties on public.bounty_definitions for select to anon,authenticated using(status='active');
  end if;
end $$;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='wallets' and policyname='wallets_select_own') then
    create policy wallets_select_own on public.wallets for select to authenticated using((select auth.uid())=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='deposits' and policyname='deposits_select_own') then
    create policy deposits_select_own on public.deposits for select to authenticated using((select auth.uid())=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='withdrawals' and policyname='withdrawals_select_own') then
    create policy withdrawals_select_own on public.withdrawals for select to authenticated using((select auth.uid())=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='mining_entitlements' and policyname='mining_entitlements_select_own') then
    create policy mining_entitlements_select_own on public.mining_entitlements for select to authenticated using((select auth.uid())=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='user_account_progress' and policyname='user_account_progress_select_own') then
    create policy user_account_progress_select_own on public.user_account_progress for select to authenticated using((select auth.uid())=user_id);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='referrals' and policyname='referrals_select_own') then
    create policy referrals_select_own on public.referrals for select to authenticated using((select auth.uid())=referrer_id or(select auth.uid())=referred_user_id);
  end if;
end $$;

revoke insert,update,delete on public.wallet_ledger from anon,authenticated;
revoke insert,update,delete on public.ncoin_ledger from anon,authenticated;
revoke update,delete on public.deposits from anon,authenticated;
revoke update,delete on public.withdrawals from anon,authenticated;

create table if not exists public.bounty_definitions(
  id uuid primary key default gen_random_uuid(),
  bounty_key text unique not null,
  bounty_name text not null,
  description text,
  target_value numeric not null default 1 check(target_value>0),
  ncoin_reward numeric not null default 0 check(ncoin_reward>=0),
  max_claims integer,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active' check(status in('draft','active','paused','completed','cancelled')),
  verification_required boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.user_bounties(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  bounty_id uuid not null references public.bounty_definitions(id),
  progress numeric not null default 0 check(progress>=0),
  status text not null default 'active' check(status in('active','submitted','approved','rejected','paid','cancelled')),
  proof_url text,
  reference_id uuid,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,bounty_id)
);
alter table public.bounty_definitions enable row level security;
alter table public.user_bounties enable row level security;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='user_bounties' and policyname='user_bounties_select_own') then
   create policy user_bounties_select_own on public.user_bounties for select to authenticated using((select auth.uid())=user_id);
 end if;
end $$;

create or replace function public.attach_referral_by_code(p_user_id uuid,p_referral_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_referrer uuid;
begin
 if p_user_id is null or nullif(trim(p_referral_code),'') is null then return jsonb_build_object('ok',false,'error','INPUT_REQUIRED'); end if;
 select id into v_referrer from public.profiles where upper(referral_code)=upper(trim(p_referral_code)) limit 1;
 if v_referrer is null or v_referrer=p_user_id then return jsonb_build_object('ok',false,'error','INVALID_REFERRAL'); end if;
 update public.profiles set referred_by=v_referrer,updated_at=now() where id=p_user_id and referred_by is null;
 insert into public.referrals(referrer_id,referred_user_id,status,reward_amount,reward_currency)
 values(v_referrer,p_user_id,'pending',0,'N Coin') on conflict(referred_user_id) do nothing;
 return jsonb_build_object('ok',true,'referrer_id',v_referrer);
end $$;
revoke all on function public.attach_referral_by_code(uuid,text) from public;
grant execute on function public.attach_referral_by_code(uuid,text) to service_role;

create or replace function public.claim_free_hashrate_spin(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_last timestamptz; v_reward integer; v_event uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select max(created_at) into v_last from public.activity_events where user_id=p_user_id and event_type='free_hashrate_spin';
 if v_last is not null and now()<v_last+interval '3 hours' then return jsonb_build_object('ok',false,'error','SPIN_COOLDOWN','next_at',v_last+interval '3 hours'); end if;
 v_reward=floor(random()*20)::integer+1;
 insert into public.activity_events(user_id,event_type,event_value,source,metadata) values(p_user_id,'free_hashrate_spin',v_reward,'free_spin',jsonb_build_object('reward_hs',v_reward)) returning id into v_event;
 insert into public.mining_entitlements(user_id,hashrate,source,reference_id,status,starts_at) values(p_user_id,v_reward,'free_spin',v_event,'active',now());
 return jsonb_build_object('ok',true,'reward_hs',v_reward,'cooldown_seconds',10800);
end $$;
revoke all on function public.claim_free_hashrate_spin(uuid) from public;
grant execute on function public.claim_free_hashrate_spin(uuid) to service_role;

create or replace function public.claim_welcome_bonus(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_event uuid;
begin
 if exists(select 1 from public.activity_events where user_id=p_user_id and event_type='welcome_bonus') then return jsonb_build_object('ok',false,'error','WELCOME_BONUS_ALREADY_CLAIMED'); end if;
 insert into public.activity_events(user_id,event_type,event_value,source,metadata) values(p_user_id,'welcome_bonus',80,'registration',jsonb_build_object('reward_hs',80)) returning id into v_event;
 insert into public.mining_entitlements(user_id,hashrate,source,reference_id,status,starts_at) values(p_user_id,80,'welcome_bonus',v_event,'active',now());
 return jsonb_build_object('ok',true,'reward_hs',80);
end $$;
revoke all on function public.claim_welcome_bonus(uuid) from public;
grant execute on function public.claim_welcome_bonus(uuid) to service_role;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.estimate_mining_reward_v1_1(uuid,numeric,numeric,timestamptz) from public;
