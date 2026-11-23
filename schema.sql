-- Jalankan di Supabase SQL Editor.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  card text not null check (card in ('Telkomsel','by.U','Indosat / IM3','Tri (3)','Smartfren','XL','Axis','Live.On')),
  area text not null check (area in ('Area 1','Area 2','Area 3','Area 4')),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_m double precision not null check (accuracy_m > 0 and accuracy_m < 100000),
  location_consent boolean not null check (location_consent = true),
  status text not null default 'Menunggu verifikasi'
    check (status in ('Menunggu verifikasi','Sedang diproses','Selesai','Ditolak')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Semua akses anon/public ditolak. Owner dengan app_metadata.role = 'owner'
-- dapat membaca dan mengubah status.
drop policy if exists "owner can read registrations" on public.registrations;
create policy "owner can read registrations"
on public.registrations for select to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

drop policy if exists "owner can update registrations" on public.registrations;
create policy "owner can update registrations"
on public.registrations for update to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

revoke all on public.registrations from anon, authenticated;
grant select, update on public.registrations to authenticated;
-- Insert dilakukan Edge Function dengan service_role di sisi server saja.
