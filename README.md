# Portfólio — Aline Reis · Data Developer & Full Stack

Portfólio pessoal full stack com um **demo de dados de verdade**: ETL de CSV → PostgreSQL → API analytics → dashboard com gráficos, tudo dentro do próprio app. O dataset fictício compara a receita de pedidos de e-commerce no **canal online × loja física**.

## Stack

- **Next.js 16** (App Router, `src/`, Turbopack, cacheComponents) · React 19 · TypeScript
- **Prisma 6** + **PostgreSQL** (migrations + seed determinístico com ~12.000 pedidos)
- **Tailwind CSS v4** (tokens de cor no CSS, dark mode via `next-themes`)
- **Recharts 3** (paleta própria validada p/ daltonismo, light/dark)
- **iron-session** (cookie selado httpOnly) + **bcryptjs** + rate-limit in-memory
- **csv-parse** (ETL streaming com validação por linha via **Zod**)
- i18n pt-BR/EN por dicionários TS + cookie (sem rotas por locale)

## Rodando localmente (Windows)

Pré-requisitos: **Node.js 20+** e **PostgreSQL** local rodando na porta 5432.

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco (psql ou pgAdmin)
createdb -U postgres portfolio
#   ou:  psql -U postgres -c "CREATE DATABASE portfolio;"

# 3. Configurar o .env (copie o .env.example e ajuste)

# 4. Migrations + seed (conteúdo real do perfil + dataset demo de 12k pedidos)
npm run db:migrate
npm run db:seed

# 5. Desenvolvimento
npm run dev          # http://localhost:3000

# Produção local
npm run build && npm start
```

### Variáveis de ambiente (`.env`)

| Variável | O que faz |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL do app |
| `SESSION_SECRET` | Segredo do cookie iron-session (hex de 32+ bytes) |
| `ADMIN_EMAIL` | E-mail de login do painel `/admin` |
| `ADMIN_PASSWORD_HASH_B64` | Hash bcrypt da senha do admin **em base64** |
| `ALLOW_INSECURE_COOKIES` | `true` só p/ demo local HTTP; remova em deploy com HTTPS |

> ⚠️ **Por que o hash é em base64?** O carregador de `.env` do Next (dotenv-expand)
> interpreta `$` como referência de variável — e todo hash bcrypt começa com `$2b$…`,
> que seria corrompido. Base64 não tem caracteres especiais. Para gerar um hash novo:
>
> ```bash
> node -e "console.log(Buffer.from(require('bcryptjs').hashSync('SUA_NOVA_SENHA', 10), 'utf8').toString('base64'))"
> ```

A senha do admin é **a que você definir** no `ADMIN_PASSWORD_HASH_B64` (comando acima) — não existe senha padrão no código.

## O que tem no app

| Rota | Descrição |
|---|---|
| `/` | One-page: hero, sobre, skills com níveis, projetos, experiência, contato |
| `/projects` | Projetos completos com filtro por stack |
| `/dashboard` | **Demo ETL + analytics**: upload de CSV com stepper, KPIs, tendência mensal, breakdown por UF/categoria |
| `/docs` | Documentação da API REST analytics/conteúdo |
| `/admin` | Painel CRUD (projetos, skills, experiências, mensagens, datasets) — login em `/admin/login` |

### Demo de dados (o coração data developer)

1. **Upload** (`POST /api/etl/upload`): CSV `;` ou `,` até 5 MB → responde `202` e processa em background.
2. **ETL**: parse streaming → normalização de cabeçalhos (aliases) → valores pt-BR (`1.234,56`, `dd/mm/aaaa`) → validação Zod por linha → derivações (desconto e frete por categoria/canal, total) → `createMany` em chunks de 1.000.
3. **Analytics** (`/api/analytics/*`): agregações no Postgres (`aggregate` do Prisma + SQL puro com `date_trunc` e `SUM … FILTER`) e derivadas no servidor.
4. Baixe o [CSV de exemplo](public/sample-orders.csv) (2.000 pedidos) e suba no dashboard.

### API pública (resumo)

- `GET /api/projects` · `GET /api/skills` · `GET /api/experiences` — conteúdo do portfólio
- `GET /api/analytics/datasets | kpis | timeseries | breakdown | sample?datasetId=` — analytics (400 se `datasetId` inválido)
- `POST /api/contact` — formulário com honeypot
- `POST /api/auth/login | logout` — sessão admin (rate-limit 5 tentativas/15 min)
- `PATCH/POST/DELETE /api/admin/*` — CRUD autenticado

Documentação completa com exemplos de request/response: **`/docs`** no app.

## Scripts

```bash
npm run dev            # desenvolvimento
npm run build && npm start
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed (perfil + dataset demo determinístico)
npm run db:studio      # Prisma Studio
npm run csv:generate   # regenera public/sample-orders.csv (2.000 pedidos)
npm run lint
```

## Decisões técnicas (conscientes)

- **ETL fire-and-forget** sem fila: o job roda no processo Node e o cliente faz polling de 1 s. Em produção real: BullMQ + Redis. Documentado em `/docs`.
- **App 100% dinâmico** (`instant = false` no root layout): locale vem de cookie e o conteúdo de banco precisa refletir o CRUD na hora — shell estático do cacheComponents não vale a pena aqui.
- **Serializador central** Decimal→Number: nunca deixa `Prisma.Decimal` vazar no JSON.
- **Rate-limit in-memory**: suficiente para demo single-instance.
- **i18n sem rotas por locale**: SEO bilíngue limitado (aceito para portfólio pessoal).
- **bcryptjs** (puro JS): evita build nativo no Windows.
- **Seed determinístico** (`faker.seed` fixa): demos reproduzíveis.

## Estrutura

```
prisma/            schema.prisma · seed.ts · migrations/
scripts/           generate-csv.ts
src/
  app/             páginas · api/ (routes) · admin/
  components/      ui · layout · sections · charts · dashboard · admin
  lib/             prisma · auth · analytics · csv/{parse,transform,load} ·
                   i18n/ · validation · serializers · api-docs · sales-config
  contexts/        LocaleProvider · ThemeProvider
```
