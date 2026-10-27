# Portfólio — Aline Reis · Full Stack & Dados

Portfólio pessoal full stack com **Lab interativo**: escultura procedural em raymarching WebGL, campo de fluxo generativo, corrida de dados (bar chart race), máquina de Fourier que redesenha o seu traço e um jogo da memória da stack — tudo feito à mão com React, sem bibliotecas de efeito. O conteúdo do site (projetos, skills, experiências, mensagens) vive no PostgreSQL e é gerido por um painel admin próprio.

## Stack

- **Next.js 16** (App Router, `src/`, Turbopack, cacheComponents) · React 19 · TypeScript
- **Prisma 6** + **PostgreSQL** (migrations + seed do conteúdo do perfil)
- **Tailwind CSS v4** (tokens de cor no CSS, dark mode via `next-themes`)
- **iron-session** (cookie selado httpOnly) + **bcryptjs** + rate-limit in-memory
- i18n pt-BR/EN por dicionários TS + cookie (sem rotas por locale)
- Efeitos próprios em CSS/canvas 2D/WebGL: aurora, constelação interativa, spotlight+tilt,
  scroll reveal, barra de progresso, marquee, typewriter, campo de fluxo, corrida de barras,
  flip 3D, raymarching GLSL (SDF), epicycles de Fourier (DFT escrita à mão)

## Rodando localmente (Windows)

Pré-requisitos: **Node.js 20+** e **PostgreSQL** local rodando na porta 5432.

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco (psql ou pgAdmin)
createdb -U postgres portfolio
#   ou:  psql -U postgres -c "CREATE DATABASE portfolio;"

# 3. Configurar o .env (copie o .env.example e ajuste)

# 4. Migrations + seed (conteúdo do perfil)
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
| `/` | One-page: hero com typewriter, marquee do stack, sobre, skills com níveis, projetos, experiência, contato |
| `/projects` | Projetos completos com filtro por stack |
| `/projects/[slug]` | Estudo de caso do projeto: contexto, solução, bastidores e resultados (bilíngue) |
| `/lab` | **Lab interativo**: escultura procedural em raymarching WebGL (giroide SDF, arraste para orbitar) + campo de fluxo generativo (cursor atrai, clique explode) + corrida de dados (bar chart race) + máquina de Fourier (desenhe e veja os círculos redesenharem) + jogo da memória |
| `/ia` | **IA na prática**: princípios de uso de IA em produção + playground de rede neural treinando ao vivo (MLP 2-8-8-1 com backprop escrita à mão — pinte pontos, treine, veja a fronteira de decisão e a curva de perda) + ponte pro estudo de caso de NLP |
| `/admin` | Painel CRUD (projetos, skills, experiências, mensagens) — login em `/admin/login` |

### Interações (o coração do front)

- **Playground de rede neural** (`/ia`): MLP 2-8-8-1 com forward/backprop escritos à mão (zero libs de ML) — o usuário pinta pontos de duas classes (botão direito inverte), carrega presets (espiral, XOR, anéis), treina ao vivo e vê o heatmap da fronteira de decisão aprender junto com a curva de perda BCE.
- **Escultura procedural** (`/lab`): raymarching em GLSL puro (sem three.js) — SDF de prisma de cristal com giroide pulsando dentro e núcleo contra-rotativo, sombra suave, AO e névoa; câmera orbital com auto-rotação e arraste; cores lidas dos tokens do tema.
- **Máquina de Fourier** (`/lab`): desenhe à mão; a curva é reamostrada por comprimento de arco, passa por uma DFT O(N²) escrita no componente e é redesenhada por círculos engatados animados.
- **Campo de fluxo** (`/lab`): partículas seguem um campo de ângulos procedural (senoides compostas), rastro em cometa, atração pelo cursor e explosão no clique — canvas 2D puro, dpr-aware.
- **Corrida de dados** (`/lab`): bar chart race 2010–2026 com interpolação linear entre keyframes, ranking animado em CSS transforms e scrubber de anos; paleta validada para daltonismo nos dois temas e cor fixa por linguagem.
- **Jogo da memória** (`/lab`): 8 pares da stack, flip 3D em CSS puro, cronômetro e recorde no `localStorage`.
- **Hero**: constelação que "sente" o cursor, aurora em gradiente, papéis em máquina de escrever.
- **Global**: scroll reveal, barra de progresso de leitura, spotlight+tilt nos cards, tudo com `prefers-reduced-motion` respeitado.

### API pública (resumo)

- `GET /api/projects` · `GET /api/skills` · `GET /api/experiences` — conteúdo do portfólio
- `POST /api/contact` — formulário com honeypot
- `POST /api/auth/login | logout` — sessão admin (rate-limit 5 tentativas/15 min)
- `PATCH/POST/DELETE /api/admin/*` — CRUD autenticado

## Scripts

```bash
npm run dev            # desenvolvimento
npm run build && npm start
npm run db:migrate     # prisma migrate dev
npm run db:seed        # seed do conteúdo do perfil
npm run db:studio      # Prisma Studio
npm run lint
```

## Decisões técnicas (conscientes)

- **App 100% dinâmico** (`instant = false` no root layout): locale vem de cookie e o conteúdo de banco precisa refletir o CRUD na hora — shell estático do cacheComponents não vale a pena aqui.
- **Serializador central** Decimal→Number: nunca deixa `Prisma.Decimal` vazar no JSON.
- **Rate-limit in-memory**: suficiente para demo single-instance.
- **i18n sem rotas por locale**: SEO bilíngue limitado (aceito para portfólio pessoal).
- **bcryptjs** (puro JS): evita build nativo no Windows.
- **Zero dependências de efeito/animação**: canvas e CSS escritos à mão — menos bundle, mais controle.

## Estrutura

```
prisma/            schema.prisma · seed.ts · migrations/
src/
  app/             páginas · api/ (routes) · admin/ · lab/
  components/      ui · layout · sections · effects · lab · admin
  lib/             prisma · auth · validation · serializers · i18n/
  contexts/        LocaleProvider · ThemeProvider
```
