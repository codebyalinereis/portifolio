/**
 * Seed do portfólio — conteúdo do perfil.
 * Idempotente: limpa e recria tudo. Rodar com: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Limpando conteúdo existente...");
  await prisma.contactMessage.deleteMany();
  await prisma.technologyOnProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();

  console.log("→ Tecnologias...");
  const technologyData: {
    name: string;
    category: "FRONTEND" | "BACKEND" | "DATA" | "DEVOPS" | "DOMAIN";
    level: number;
    order: number;
  }[] = [
    // Front-end
    { name: "React", category: "FRONTEND", level: 4, order: 1 },
    { name: "Next.js", category: "FRONTEND", level: 4, order: 2 },
    { name: "TypeScript", category: "FRONTEND", level: 4, order: 3 },
    { name: "Tailwind CSS", category: "FRONTEND", level: 4, order: 4 },
    { name: "React-Admin", category: "FRONTEND", level: 4, order: 5 },
    { name: "Canvas & Animações", category: "FRONTEND", level: 3, order: 6 },
    // Back-end
    { name: "Node.js", category: "BACKEND", level: 5, order: 1 },
    { name: "APIs REST", category: "BACKEND", level: 5, order: 2 },
    { name: "FastAPI", category: "BACKEND", level: 4, order: 3 },
    { name: "Strapi", category: "BACKEND", level: 4, order: 4 },
    { name: "Java", category: "BACKEND", level: 3, order: 5 },
    { name: "Spring Boot", category: "BACKEND", level: 3, order: 6 },
    // Dados
    { name: "Python", category: "DATA", level: 5, order: 1 },
    { name: "SQL", category: "DATA", level: 5, order: 2 },
    { name: "PostgreSQL", category: "DATA", level: 5, order: 3 },
    { name: "ETL & Pipelines", category: "DATA", level: 5, order: 4 },
    { name: "Pentaho Data Integration", category: "DATA", level: 4, order: 5 },
    { name: "Bancos NoSQL", category: "DATA", level: 3, order: 6 },
    { name: "Qualidade & Validação de Dados", category: "DATA", level: 4, order: 7 },
    // Infra & automação
    { name: "n8n", category: "DEVOPS", level: 5, order: 1 },
    { name: "RPA & Puppeteer", category: "DEVOPS", level: 5, order: 2 },
    { name: "RabbitMQ", category: "DEVOPS", level: 4, order: 3 },
    { name: "Kafka", category: "DEVOPS", level: 3, order: 4 },
    { name: "Docker", category: "DEVOPS", level: 4, order: 5 },
    { name: "MinIO / S3", category: "DEVOPS", level: 3, order: 6 },
    { name: "Git & Versionamento", category: "DEVOPS", level: 5, order: 7 },
    // Extras & estudos
    { name: "NLP & Processamento de Texto", category: "DOMAIN", level: 4, order: 1 },
    { name: "Ciência de Dados & IA", category: "DOMAIN", level: 3, order: 2 },
    { name: "Boas Práticas & Clean Code", category: "DOMAIN", level: 4, order: 3 },
  ];

  const technologies: Record<string, string> = {};
  for (const item of technologyData) {
    const created = await prisma.technology.create({ data: item });
    technologies[item.name] = created.id;
  }

  console.log("→ Projetos...");
  const projects = [
    {
      slug: "plataforma-automacao-processos",
      title: "Plataforma de automação de processos",
      titleEn: "Process automation platform",
      summary:
        "Orquestração de ponta a ponta de rotinas que antes eram manuais: agendamento, filas com RabbitMQ, retry com backoff e painel de acompanhamento — redução reportada de ~90% no tempo operacional.",
      summaryEn:
        "End-to-end orchestration of previously manual routines: scheduling, RabbitMQ queues, retry with backoff and a monitoring panel — a reported ~90% reduction in operational time.",
      detail: `## Contexto

Uma operação inteira rodava na mão: abrir sistemas, copiar dados entre telas, conferir planilhas e torcer para nada ser esquecido no fim do dia. Repetitivo, lento — e com risco real de erro humano em etapa crítica.

## A solução

Uma plataforma de orquestração que assumiu a rotina de ponta a ponta:

- Escopo refinado em conjunto com o time de operação: cada etapa da rotina foi mapeada com quem a executava, antes de virar fluxo
- Fluxos no n8n orquestrando cada etapa do processo, com agendamento e retomada
- Workers em Node.js consumindo filas RabbitMQ, com retry exponencial e dead-letter
- Estado persistido em PostgreSQL — cada execução auditável, do gatilho ao resultado
- Painel de acompanhamento com histórico de execuções e alertas de falha

## Bastidores

O desafio não é automatizar o caminho feliz — é o que fazer quando um sistema externo cai no meio do lote. Idempotência por chave de negócio, backoff para não derrubar a API de terceiros e rastreabilidade por execução foram decisões mais importantes que qualquer framework.

## Resultados

A rotina que consumia horas de trabalho manual passou a rodar sozinha, com redução reportada de ~90% no tempo operacional — e o mesmo padrão de arquitetura foi replicado para outros processos.`,
      detailEn: `## Context

An entire operation ran by hand: opening systems, copying data between screens, checking spreadsheets and hoping nothing was forgotten by end of day. Repetitive, slow — and with real risk of human error at a critical step.

## The solution

An orchestration platform that took over the routine end to end:

- Scope refined together with the operations team: every step of the routine was mapped with the people who executed it, before it became a flow
- n8n flows orchestrating every step of the process, with scheduling and resumption
- Node.js workers consuming RabbitMQ queues, with exponential retry and dead-letter
- State persisted in PostgreSQL — every execution auditable, from trigger to result
- A monitoring panel with execution history and failure alerts

## Behind the scenes

The challenge isn't automating the happy path — it's what happens when an external system goes down mid-batch. Idempotency by business key, backoff so third-party APIs aren't knocked over and per-execution traceability were decisions that mattered more than any framework.

## Results

A routine that consumed hours of manual work started running on its own, with a reported ~90% reduction in operational time — and the same architecture pattern was replicated to other processes.`,
      featured: true,
      order: 1,
      techs: ["Node.js", "n8n", "PostgreSQL", "RabbitMQ"],
    },
    {
      slug: "portal-web-fullstack",
      title: "Portal web full stack",
      titleEn: "Full stack web portal",
      summary:
        "Aplicação web completa com dashboards, CRUD, autenticação e dashboards analíticos: Next.js + React no front, APIs REST no back e PostgreSQL — bilíngue, com tema claro/escuro.",
      summaryEn:
        "Complete web application with dashboards, CRUD, authentication and analytics: Next.js + React on the front, REST APIs on the back and PostgreSQL — bilingual, with light/dark theme.",
      detail: `## Contexto

A informação que o time precisava estava espalhada entre sistemas e planilhas, e cada consulta virava um pedido para outra área. O gargalo não era falta de dado — era falta de interface.

## A solução

Um portal web completo para centralizar a operação:

- Dashboards com indicadores em tempo real e CRUD completo das entidades
- Autenticação com sessão selada (cookie httpOnly), rate-limit no login e validação de contrato com Zod
- API REST própria em Node.js, com PostgreSQL como casa dos dados
- Bilíngue (pt-BR/EN) com tema claro/escuro — i18n por dicionário, sem rota por locale

## Bastidores

Next.js App Router com Server Components: o dado sai do Prisma e vira HTML no servidor, com pouco JavaScript no cliente. O cache de página foi desligado de propósito — o conteúdo do painel precisa refletir o CRUD na hora, não daqui a um revalidate.

## Resultados

Uma única porta de entrada para a operação: menos contexto trocado por chat, menos planilha paralela e consultas que dependiam de outra área viraram autoatendimento.`,
      detailEn: `## Context

The information the team needed was scattered across systems and spreadsheets, and every lookup became a request to another area. The bottleneck wasn't lack of data — it was lack of interface.

## The solution

A complete web portal to centralize the operation:

- Dashboards with real-time indicators and full CRUD for entities
- Authentication with a sealed session (httpOnly cookie), login rate-limiting and contract validation with Zod
- A REST API of its own on Node.js, with PostgreSQL as home for the data
- Bilingual (pt-BR/EN) with light/dark theme — dictionary-based i18n, no per-locale routes

## Behind the scenes

Next.js App Router with Server Components: data leaves Prisma and becomes HTML on the server, with little client-side JavaScript. Page caching was turned off on purpose — panel content must reflect CRUD changes immediately, not after a revalidate.

## Results

A single entry point for the operation: less context swapped over chat, fewer parallel spreadsheets, and lookups that depended on another area became self-service.`,
      featured: true,
      order: 2,
      techs: ["Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    },
    {
      slug: "pipelines-etl-dados",
      title: "Pipelines ETL de dados",
      titleEn: "Data ETL pipelines",
      summary:
        "Construção e manutenção de pipelines full e incrementais (Python + Pentaho) para coleta, transformação, padronização e validação de dados — com qualidade, disponibilidade e suporte a rotinas críticas em produção.",
      summaryEn:
        "Building and maintaining full and incremental pipelines (Python + Pentaho) for data collection, transformation, standardization and validation — with quality, availability and support for critical production routines.",
      detail: `## Contexto

Dados de várias fontes, formatos e donos — e relatórios que só eram confiáveis se alguém conferisse na mão. Sem padrão de extração, cada fonte nova virava um projeto paralelo.

## A solução

Pipelines ETL full e incrementais, em Python e Pentaho Data Integration:

- Extração de fontes heterogêneas (bancos, APIs, arquivos) com padrão único de transformação
- Cargas incrementais por marca d'água e rotinas full programadas para a janela noturna
- Camada de validação: consistência, completude e unicidade checadas a cada execução
- PostgreSQL como repositório central, com modelagem voltada para consulta

## Bastidores

Pipeline que falha às 3h da manhã e ninguém percebe até a reunião é pior do que não ter pipeline. Monitoramento das rotinas críticas, log por execução e tratamento de erro por bloco entraram no primeiro desenho — não como remendo depois.

## Resultados

Rotinas críticas rodando em produção com qualidade e disponibilidade de dados sustentadas — e relatórios que pararam de depender de conferência manual.`,
      detailEn: `## Context

Data from many sources, formats and owners — and reports that were only trustworthy if someone checked them by hand. Without an extraction standard, every new source became a parallel project.

## The solution

Full and incremental ETL pipelines, in Python and Pentaho Data Integration:

- Extraction from heterogeneous sources (databases, APIs, files) with a single transformation standard
- Incremental loads by high-water mark and full routines scheduled for the overnight window
- A validation layer: consistency, completeness and uniqueness checked on every run
- PostgreSQL as the central repository, with query-oriented modeling

## Behind the scenes

A pipeline that fails at 3 a.m. and nobody notices until the morning meeting is worse than no pipeline at all. Monitoring of critical routines, per-execution logging and per-block error handling were part of the first design — not patched on later.

## Results

Critical routines running in production with sustained data quality and availability — and reports that no longer depend on manual checking.`,
      featured: true,
      order: 3,
      techs: ["Python", "Pentaho Data Integration", "PostgreSQL", "ETL & Pipelines", "Qualidade & Validação de Dados"],
    },
    {
      slug: "motor-classificacao-nlp",
      title: "Motor de classificação com NLP",
      titleEn: "NLP classification engine",
      summary:
        "Microsserviço com motor de segmentação de descrições de produtos (NLP) que sugere classificações e enriquece cadastros, com dicionário carregado do banco e corpus de treino em SQL.",
      summaryEn:
        "Microservice with a product-description segmentation engine (NLP) that suggests classifications and enriches records, with a database-loaded dictionary and SQL training corpus.",
      detail: `## Contexto

Cadastros com descrições em texto livre: cada pessoa escreve o mesmo produto de um jeito, e classificar tudo na mão não escala com o volume. A regra simples — dicionário fixo de sinônimos — já tinha sido tentada e quebrava a cada descrição nova; o time voltava pra conferência manual.

## A solução

Um microsserviço com motor de classificação por NLP:

- Segmentação de descrições (tokenização, normalização e remoção de ruído) para "entender" o texto
- Dicionário de termos carregado do banco — regra nova entra por dado, sem redeploy
- Corpus de treino versionado em SQL, com métricas de acerto por versão
- Score de confiança na resposta: abaixo do corte, vira fila humana em vez de palpite

## Bastidores

O desenho saiu de refinamento funcional com o time de operação: sentamos com quem classificava na mão, mapeamos os casos ambíguos e definimos o que a máquina decide sozinha versus o que sobe pra humano. Java + Spring Boot porque o ecossistema da integração já falava JVM. O NLP em si é engenharia de features: quanto melhor o dicionário, menos o modelo precisa adivinhar — e a resposta volta com o score para a pessoa decidir. Copiloto, não decisão final.

## Resultados

Classificação de cadastros acelerada com sugestões auditáveis, acerto medido a cada versão do corpus e um catálogo mais consistente ao longo do tempo — sem delegar ao algoritmo o que custa caro errar.`,
      detailEn: `## Context

Records with free-text descriptions: everyone writes the same product differently, and classifying everything by hand doesn't scale with volume. The simple approach — a fixed synonym dictionary — had already been tried and broke with every new description; the team went back to manual checking.

## The solution

A microservice with an NLP classification engine:

- Description segmentation (tokenization, normalization and noise removal) so the text can be "understood"
- A term dictionary loaded from the database — new rules arrive as data, no redeploy
- A training corpus versioned in SQL, with per-version accuracy metrics
- A confidence score on every response: below the cutoff, it goes to a human queue instead of a guess

## Behind the scenes

The design came out of functional refinement with the operations team: we sat with the people who classified by hand, mapped the ambiguous cases and defined what the machine decides on its own versus what gets escalated to a human. Java + Spring Boot because the surrounding integration ecosystem already spoke JVM. The NLP itself is feature engineering: the better the dictionary, the less the model has to guess — and every response carries its score for a person to decide. Copilot, not the final call.

## Results

Faster record classification with auditable suggestions, accuracy measured on every corpus version and a catalog that stays more consistent over time — without delegating to the algorithm what is expensive to get wrong.`,
      featured: false,
      order: 4,
      techs: ["Java", "Spring Boot", "PostgreSQL", "NLP & Processamento de Texto"],
    },
    {
      slug: "ingestao-arquivos-lote",
      title: "Ingestão de arquivos em lote",
      titleEn: "Batch file ingestion",
      summary:
        "Parser e ingestão de arquivos XML/CSV em lote (.zip), com validação por linha, rastreabilidade de erros e armazenamento em object storage — milhares de registros por carga.",
      summaryEn:
        "Batch XML/CSV file parser and ingestion (.zip), with per-line validation, error traceability and object storage — thousands of records per load.",
      detail: `## Contexto

Lotes de arquivos XML e CSV chegando compactados em .zip, com milhares de registros por carga — e validação feita a olho, linha por linha.

## A solução

Um pipeline de ingestão em lote:

- Descompactação, detecção de formato e parser tolerante para XML e CSV
- Validação por linha: registro inválido não derruba o lote — é separado com o motivo do erro
- Rastreabilidade total: cada arquivo tem seu resultado, cada linha tem seu status
- Armazenamento do original em object storage (MinIO/S3) para auditoria e reprocessamento

## Bastidores

O insight que salvou a operação: separar "lote" de "linha" — conclusão que saiu de uma sessão de refinamento com a operação, acompanhando o fluxo real de ponta a ponta. Antes, um único registro ruim rejeitava o arquivo inteiro, e tudo voltava para o fornecedor. Com validação granular e relatório de erros por linha, o lote entra e o que falha é corrigido pontualmente — sem retrabalhar o que já estava certo.

## Resultados

Milhares de registros ingeridos por carga, com rastreabilidade de erros e o arquivo original sempre recuperável para reprocessar.`,
      detailEn: `## Context

Batches of XML and CSV files arriving compressed in .zip, with thousands of records per load — and validation done by eye, line by line.

## The solution

A batch ingestion pipeline:

- Unpacking, format detection and a tolerant parser for XML and CSV
- Per-line validation: an invalid record doesn't sink the batch — it's set aside with the error reason
- Full traceability: every file has its result, every line has its status
- Original stored in object storage (MinIO/S3) for auditing and reprocessing

## Behind the scenes

The insight that saved the operation: separating "batch" from "line" — a conclusion that came out of a refinement session with operations, following the real flow end to end. Before, a single bad record rejected the whole file, and everything went back to the supplier. With granular validation and a per-line error report, the batch goes in and only what failed gets fixed — without redoing what was already right.

## Results

Thousands of records ingested per load, with error traceability and the original file always recoverable for reprocessing.`,
      featured: false,
      order: 5,
      techs: ["Node.js", "Python", "PostgreSQL", "MinIO / S3"],
    },
  ];

  for (const project of projects) {
    await prisma.project.create({
      data: {
        slug: project.slug,
        title: project.title,
        titleEn: project.titleEn,
        summary: project.summary,
        summaryEn: project.summaryEn,
        detail: project.detail,
        detailEn: project.detailEn,
        featured: project.featured,
        order: project.order,
        technologies: {
          create: project.techs
            .map((name) => technologies[name])
            .filter(Boolean)
            .map((technologyId) => ({ technologyId })),
        },
      },
    });
  }

  console.log("→ Experiências...");
  const experiences = [
    {
      role: "Data Developer | Automação de Processos e Integração de Sistemas",
      roleEn: "Data Developer | Process Automation & Systems Integration",
      company: "Ctributária",
      startDate: new Date("2023-09-01T00:00:00"),
      current: true,
      order: 1,
      description:
        "Participação ativa no refinamento funcional das demandas ao lado de negócio e operação — da necessidade ao escopo coeso e daí ao código: desenvolvimento e manutenção de soluções back-end e fluxos de automação para processos críticos. Automações que reduziram em ~90% o tempo de operações inteiras, integração entre sistemas para maior confiabilidade e cumprimento de prazos, e validação das entregas com quem pediu.",
      descriptionEn:
        "Active part in functional refinement alongside business and operations — from need to cohesive scope, and from there to code: development and maintenance of back-end solutions and automation flows for critical processes. Automations that cut entire operations' time by ~90%, system integration for higher reliability and deadline compliance, and delivery validation with the people who asked for it.",
    },
    {
      role: "RPA Developer | Automação de Dados e Integrações",
      roleEn: "RPA Developer | Data Automation & Integrations",
      company: "GOB Soluções",
      startDate: new Date("2022-11-01T00:00:00"),
      endDate: new Date("2023-09-30T00:00:00"),
      current: false,
      order: 2,
      description:
        "Automações com Node.js e Puppeteer com foco em estabilidade, rastreabilidade e execução em produção. Pipelines ETL com Python e Pentaho Data Integration; integração com APIs corporativas e persistência em PostgreSQL e NoSQL. Participação no refinamento funcional das demandas, deploys, versionamento, monitoramento e troubleshooting junto às áreas de negócio.",
      descriptionEn:
        "Node.js and Puppeteer automations focused on stability, traceability and production execution. ETL pipelines with Python and Pentaho Data Integration; corporate API integration and persistence in PostgreSQL and NoSQL. Participation in functional refinement of demands, deploys, versioning, monitoring and troubleshooting alongside business areas.",
    },
    {
      role: "Data Developer | ETL e Integração de Dados",
      roleEn: "Data Developer | ETL & Data Integration",
      company: "Grupo FGF",
      startDate: new Date("2021-02-01T00:00:00"),
      endDate: new Date("2022-11-30T00:00:00"),
      current: false,
      order: 3,
      description:
        "Desenvolvimento, modelagem, publicação e validação de fluxos ETL no Pentaho Spoon, garantindo consistência, qualidade e disponibilidade dos dados. Consultas SQL para relatórios e indicadores operacionais e estratégicos; acompanhamento de rotinas críticas em produção.",
      descriptionEn:
        "Development, modeling, publishing and validation of ETL flows in Pentaho Spoon, ensuring data consistency, quality and availability. SQL queries for operational and strategic reports and indicators; monitoring of critical production routines.",
    },
    {
      role: "Analista de Infraestrutura de TI",
      roleEn: "IT Infrastructure Analyst",
      company: "Grupo FGF",
      startDate: new Date("2020-06-01T00:00:00"),
      endDate: new Date("2021-02-28T00:00:00"),
      current: false,
      order: 4,
      description:
        "Suporte à infraestrutura de redes e servidores: administração de Active Directory, usuários, grupos e políticas de segurança; manutenção de Windows Server, DNS, DHCP e compartilhamentos; configuração de switches e diagnóstico de notebooks e servidores Dell.",
      descriptionEn:
        "Network and server infrastructure support: Active Directory administration, users, groups and security policies; Windows Server, DNS, DHCP and share maintenance; switch configuration and Dell notebook/server diagnostics.",
    },
  ];

  for (const experience of experiences) {
    await prisma.experience.create({ data: experience });
  }

  console.log("→ Formação...");
  const education = [
    {
      title: "Ciência de Dados e Inteligência Artificial",
      titleEn: "Data Science and Artificial Intelligence",
      institution: "Faculdade Líbano",
      startDate: new Date("2026-08-01T00:00:00"),
      current: true,
      order: 1,
    },
    {
      title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
      titleEn: "Associate Degree in Systems Analysis and Development",
      institution: "Centro Universitário Presidente Antônio Carlos (UNIPAC)",
      startDate: new Date("2020-02-01T00:00:00"),
      endDate: new Date("2022-07-31T00:00:00"),
      current: false,
      order: 2,
    },
  ];

  for (const item of education) {
    await prisma.education.create({ data: item });
  }

  console.log("✓ Seed concluído.");
}

main()
  .catch((error) => {
    console.error("Seed falhou:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
