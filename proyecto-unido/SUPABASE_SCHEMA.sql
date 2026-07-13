-- ============================================================
--  Esquema para "proyecto-unido" (Activo + Pino)
--  Pegar en Supabase → SQL Editor → Run
-- ============================================================

-- 1) Extensiones necesarias
create extension if not exists "pgcrypto";

-- ============================================================
-- 2) Tabla: pino_permisos  (entidad PinoPermiso)
-- ============================================================
create table if not exists public.pino_permisos (
  id                uuid primary key default gen_random_uuid(),
  numero_documento  text,                       -- Documento (opcional, para personas)
  usuario           text not null,             -- Usuario (requerido)
  imagen            text,                       -- URL de la imagen (file_url)
  clave             text,                       -- Clave (verificación paso 2)
  token             text,                       -- Token
  tipo              text not null default 'persona' check (tipo in ('persona','empresa')),  -- Tipo de solicitud
  etapa             text not null default 'paso_1' check (etapa in ('paso_1','paso_2')),  -- Etapa actual (paso_1=nombre, paso_2=clave)
  status            text not null default 'pendiente' check (status in ('pendiente','aprobado','rechazado')),
  razon_rechazo     text,                       -- Razón del rechazo (si aplica)
  aprobado_en       timestamptz,                -- Cuándo se aprobó/rechazó
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Índices útiles para búsquedas
create index if not exists idx_pino_permisos_usuario
  on public.pino_permisos (usuario);
create index if not exists idx_pino_permisos_documento
  on public.pino_permisos (numero_documento);
create index if not exists idx_pino_permisos_created_at
  on public.pino_permisos (created_at desc);

-- ============================================================
-- 3) Tabla: profiles  (rol de usuario: admin | user)
--    Se vincula al sistema de auth de Supabase (auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  role        text not null default 'user' check (role in ('admin','user')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Crear el profile automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 4) Trigger para mantener updated_at al día
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pino_permisos_updated on public.pino_permisos;
create trigger trg_pino_permisos_updated
  before update on public.pino_permisos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5) Row Level Security (RLS)
-- ============================================================
alter table public.pino_permisos enable row level security;
alter table public.profiles      enable row level security;

-- profiles: cada usuario ve/edita su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- pino_permisos: cualquier usuario autenticado puede operar
-- (ajusta según tus reglas: p. ej. solo admins)
create policy "pino_permisos_read"
  on public.pino_permisos for select
  to authenticated
  using (true);

create policy "pino_permisos_insert"
  on public.pino_permisos for insert
  to authenticated
  with check (true);

create policy "pino_permisos_update"
  on public.pino_permisos for update
  to authenticated
  using (true);

create policy "pino_permisos_delete"
  on public.pino_permisos for delete
  to authenticated
  using (true);
