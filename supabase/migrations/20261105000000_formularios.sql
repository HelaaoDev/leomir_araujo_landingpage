-- =========================================================
-- Formulários do site Leomir Araujo
--   • leads_checklist → checklist.html (Checklist VAAR)
--   • contatos        → index.html#contato (Solicitar proposta)
--
-- Segurança: o site usa a chave pública "anon". Com RLS ativo e
-- apenas a política de INSERT, visitantes conseguem enviar dados,
-- mas não conseguem ler, alterar nem apagar nada.
-- Os registros são lidos no painel do Supabase (Table Editor).
-- =========================================================

-- ---------- Checklist VAAR ----------
create table if not exists public.leads_checklist (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null check (char_length(nome) between 2 and 120),
  email        text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  municipio    text not null check (char_length(municipio) between 2 and 120),
  cargo        text check (char_length(cargo) <= 80),
  aceite_lgpd  boolean not null check (aceite_lgpd = true)
);

comment on table public.leads_checklist is 'Pedidos do Checklist VAAR (checklist.html)';
create index if not exists leads_checklist_created_at_idx on public.leads_checklist (created_at desc);

-- ---------- Contato / proposta ----------
create table if not exists public.contatos (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  nome         text not null check (char_length(nome) between 2 and 120),
  instituicao  text not null check (char_length(instituicao) between 2 and 160),
  email        text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  interesse    text check (interesse in ('Palestra', 'Imersão', 'Turma fechada / curso', 'Programa para secretaria')),
  mensagem     text check (char_length(mensagem) <= 4000)
);

comment on table public.contatos is 'Solicitações de proposta (index.html#contato)';
create index if not exists contatos_created_at_idx on public.contatos (created_at desc);

-- ---------- Permissões: o público só insere ----------
alter table public.leads_checklist enable row level security;
alter table public.contatos        enable row level security;

revoke all on public.leads_checklist from anon, authenticated;
revoke all on public.contatos        from anon, authenticated;
grant insert on public.leads_checklist to anon, authenticated;
grant insert on public.contatos        to anon, authenticated;

drop policy if exists "site pode inserir leads" on public.leads_checklist;
create policy "site pode inserir leads"
  on public.leads_checklist for insert
  to anon, authenticated
  with check (true);

drop policy if exists "site pode inserir contatos" on public.contatos;
create policy "site pode inserir contatos"
  on public.contatos for insert
  to anon, authenticated
  with check (true);

-- Sem políticas de SELECT/UPDATE/DELETE: ninguém lê pelo site.
