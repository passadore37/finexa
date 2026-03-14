# FinFlow — Deploy no Vercel com Supabase

## Variáveis de ambiente necessárias

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |
| `SALARIO_LETICIA` | Valor em número, ex: `8500` |
| `SALARIO_GIOVANNA` | Valor em número, ex: `6500` |
| `META_EMERGENCIA` | ex: `30000` |

## Deploy no Vercel

1. Suba o projeto para o GitHub
2. vercel.com → Add New Project → importe o repo
3. Adicione as variáveis acima em Environment Variables
4. Deploy

## Estrutura do Supabase

### Tabela `transacoes`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid | gerado automaticamente |
| data | date | data da transação |
| valor | numeric | valor em R$ |
| categoria | text | ex: Alimentação |
| descricao | text | ex: Supermercado |
| perfil | text | leticia / giovanna / casal |
| divisao | text | ex: 50/50 |
| parcela_atual | integer | 1 se não parcelado |
| total_parcelas | integer | 1 se não parcelado |
| valor_total_compromisso | numeric | opcional |
| recorrente | boolean | conta fixa? |

### Tabela `configuracao_mensal`
| Coluna | Tipo | Descrição |
|---|---|---|
| mes | text | formato "Mar-26" |
| limite | numeric | limite de gastos do mês |
| salario_leticia | numeric | salário do mês |
| salario_giovanna | numeric | salário do mês |

## Configuração do n8n

Substituir o nó "Append to Google Sheets" por HTTP Request:

```
Método: POST
URL: https://SEU-PROJETO.supabase.co/rest/v1/transacoes
Headers:
  apikey: SUA_SERVICE_ROLE_KEY
  Authorization: Bearer SUA_SERVICE_ROLE_KEY
  Content-Type: application/json
  Prefer: return=representation

Body (JSON):
{
  "valor": {{ $json.valor }},
  "categoria": "{{ $json.categoria }}",
  "descricao": "{{ $json.descricao }}",
  "perfil": "{{ $json.perfil }}",
  "divisao": "{{ $json.divisao }}",
  "parcela_atual": {{ $json.parcelaAtual }},
  "total_parcelas": {{ $json.totalParcelas }}
}
```

Substituir o nó "Get row(s) in sheet" por HTTP Request:
```
Método: GET
URL: https://SEU-PROJETO.supabase.co/rest/v1/transacoes
  ?select=valor,categoria,data
  &data=gte.2026-03-01
  &data=lte.2026-03-31
Headers:
  apikey: SUA_SERVICE_ROLE_KEY
  Authorization: Bearer SUA_SERVICE_ROLE_KEY
```

## Mensagem de confirmação no Telegram (atualizar no n8n)

```
✅ Despesa registrada!
💰 Valor: R$ {{ $json.valor }}
📂 Categoria: {{ $json.categoria }}
📝 Descrição: {{ $json.descricao }}

📊 Ver dashboard: https://SEU-APP.vercel.app
```

## Rotas

- `/` → redireciona para `/dashboard`
- `/dashboard` → gastos, projeção, categorias, alertas
- `/planejamento` → salário → investimento → fixas → semanas
