-- ============ Registro OCF: schema del database ============
-- Da eseguire una volta sola nel pannello Supabase: SQL Editor -> New query -> incolla -> Run

-- Tabella dei progressi: una riga per utente, lo stato completo dell'app in JSON
create table if not exists public.progressi (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stato jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Sicurezza: ognuno vede e modifica SOLO la propria riga
alter table public.progressi enable row level security;

create policy "lettura propria" on public.progressi
  for select using (auth.uid() = user_id);
create policy "inserimento proprio" on public.progressi
  for insert with check (auth.uid() = user_id);
create policy "aggiornamento proprio" on public.progressi
  for update using (auth.uid() = user_id);
