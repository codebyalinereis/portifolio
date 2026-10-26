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
        "Desenvolvimento e manutenção de soluções back-end e fluxos de automação para processos críticos de negócio, do levantamento de requisitos à validação das entregas. Automações que reduziram em ~90% o tempo de operações inteiras e integração entre sistemas para maior confiabilidade e cumprimento de prazos.",
      descriptionEn:
        "Development and maintenance of back-end solutions and automation flows for critical business processes, from requirements gathering to delivery validation. Automations that cut entire operations' time by ~90% and system integration for higher reliability and deadline compliance.",
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
        "Automações com Node.js e Puppeteer com foco em estabilidade, rastreabilidade e execução em produção. Pipelines ETL com Python e Pentaho Data Integration; integração com APIs corporativas e persistência em PostgreSQL e NoSQL. Participação em deploys, versionamento, monitoramento e troubleshooting junto às áreas de negócio.",
      descriptionEn:
        "Node.js and Puppeteer automations focused on stability, traceability and production execution. ETL pipelines with Python and Pentaho Data Integration; corporate API integration and persistence in PostgreSQL and NoSQL. Participation in deploys, versioning, monitoring and troubleshooting alongside business areas.",
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
