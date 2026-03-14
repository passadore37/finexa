# Finexa — Controle Financeiro do Casal

## Deploy: finexa-one.vercel.app
## Repo: github.com/passadore37/finexa

---

## SQL — Execute no Supabase antes de usar as novas funcionalidades

```sql
-- Metas conjuntas
create table if not exists metas (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descricao text,
  valor_alvo numeric(10,2) not null,
  valor_atual numeric(10,2) default 0,
  cor text default '#D4537E',
  emoji text default '🎯',
  data_alvo date,
  concluida boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table metas enable row level security;
create policy "acesso total metas" on metas for all using (true);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  perfil text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;
create policy "acesso total push" on push_subscriptions for all using (true);

-- Adicionar campos de metas e reserva na tabela planejamento (se não existirem)
alter table planejamento
  add column if not exists reserva_atual numeric(10,2) default 0,
  add column if not exists meta_economia_leticia numeric(10,2) default 0,
  add column if not exists meta_economia_giovanna numeric(10,2) default 0;
```

## Variáveis de ambiente (Vercel)

| Variável | Valor |
|---|---|
| SUPABASE_URL | https://ajdhiuwalkupvbalwoxp.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | eyJ... |
| SALARIO_LETICIA | 8500 |
| SALARIO_GIOVANNA | 6500 |
| META_EMERGENCIA | 30000 |
| VAPID_PUBLIC_KEY | (gerar em web-push-codelab.glitch.me) |
| VAPID_PRIVATE_KEY | (gerar junto com a pública) |

## Rotas
- `/` → redireciona para `/dashboard`
- `/dashboard` → gastos, projeção, categorias, alertas
- `/lancar` → formulário de lançamento nativo
- `/planejamento` → salário → investimento → fixas → semanas
- `/metas` → metas conjuntas e individuais
