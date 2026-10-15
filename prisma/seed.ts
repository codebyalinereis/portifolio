/**
 * Seed do portfólio — conteúdo real do perfil + dataset demo de NF-e.
 * Idempotente: limpa e recria tudo. Rodar com: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { generateInvoices } from "../src/lib/fake-dataset";

const prisma = new PrismaClient();

const INVOICE_COUNT = 12000;
const CHUNK_SIZE = 1000;

async function seedContent() {
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
    // Dados & ETL
    { name: "Python", category: "DATA", level: 5, order: 1 },
    { name: "SQL", category: "DATA", level: 5, order: 2 },
    { name: "Pentaho Data Integration", category: "DATA", level: 4, order: 3 },
    { name: "ETL & Pipelines", category: "DATA", level: 5, order: 4 },
    { name: "PostgreSQL", category: "DATA", level: 5, order: 5 },
    { name: "Bancos NoSQL", category: "DATA", level: 3, order: 6 },
    { name: "Qualidade & Validação de Dados", category: "DATA", level: 4, order: 7 },
    // Back-end
    { name: "Node.js", category: "BACKEND", level: 5, order: 1 },
    { name: "APIs REST", category: "BACKEND", level: 5, order: 2 },
    { name: "FastAPI", category: "BACKEND", level: 4, order: 3 },
    { name: "Strapi", category: "BACKEND", level: 4, order: 4 },
    { name: "Java", category: "BACKEND", level: 3, order: 5 },
    { name: "Spring Boot", category: "BACKEND", level: 3, order: 6 },
    // Front-end
    { name: "React", category: "FRONTEND", level: 4, order: 1 },
    { name: "Next.js", category: "FRONTEND", level: 4, order: 2 },
    { name: "TypeScript", category: "FRONTEND", level: 4, order: 3 },
    { name: "Tailwind CSS", category: "FRONTEND", level: 4, order: 4 },
    { name: "React-Admin", category: "FRONTEND", level: 4, order: 5 },
    { name: "Recharts", category: "FRONTEND", level: 3, order: 6 },
    // Infra & automação
    { name: "n8n", category: "DEVOPS", level: 5, order: 1 },
    { name: "RPA & Puppeteer", category: "DEVOPS", level: 5, order: 2 },
    { name: "RabbitMQ", category: "DEVOPS", level: 4, order: 3 },
    { name: "Kafka", category: "DEVOPS", level: 3, order: 4 },
    { name: "Docker", category: "DEVOPS", level: 4, order: 5 },
    { name: "MinIO / S3", category: "DEVOPS", level: 3, order: 6 },
    { name: "Git & Versionamento", category: "DEVOPS", level: 5, order: 7 },
    // Domínio fiscal
    { name: "ICMS-ST & Substituição Tributária", category: "DOMAIN", level: 5, order: 1 },
    { name: "Reforma Tributária (IBS/CBS)", category: "DOMAIN", level: 5, order: 2 },
    { name: "NF-e / DF-e & XML fiscal", category: "DOMAIN", level: 5, order: 3 },
    { name: "SPED · REINF · DIRBI", category: "DOMAIN", level: 4, order: 4 },
    { name: "Apuração de Créditos", category: "DOMAIN", level: 4, order: 5 },
  ];

  const technologies: Record<string, string> = {};
  for (const item of technologyData) {
    const created = await prisma.technology.create({ data: item });
    technologies[item.name] = created.id;
  }

  console.log("→ Projetos...");
  const projects = [
    {
      slug: "automacao-guias-st",
      title: "Automação de guias de Substituição Tributária",
      titleEn: "Tax Substitution guide automation",
      summary:
        "Automação de ponta a ponta da geração de guias de ICMS-ST para os 27 estados brasileiros — redução reportada de ~90% no tempo operacional e maior confiabilidade no cumprimento de prazos fiscais.",
      summaryEn:
        "End-to-end automation of ICMS-ST guide generation for all 27 Brazilian states — a reported ~90% reduction in operational time and higher reliability in meeting tax deadlines.",
      featured: true,
      order: 1,
      techs: ["Node.js", "n8n", "PostgreSQL", "RabbitMQ", "ICMS-ST & Substituição Tributária"],
    },
    {
      slug: "portal-reforma-tributaria",
      title: "Portal da Reforma Tributária (IBS/CBS)",
      titleEn: "Tax Reform portal (IBS/CBS)",
      summary:
        "Portal web para apuração assistida da Reforma Tributária: créditos IBS/CBS, documentos fiscais, simulador de carga, oportunidades e compliance, com dashboards analíticos.",
      summaryEn:
        "Web portal for the assisted assessment of Brazil's tax reform: IBS/CBS credits, fiscal documents, burden simulator, opportunities and compliance, with analytical dashboards.",
      featured: true,
      order: 2,
      techs: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Recharts", "Reforma Tributária (IBS/CBS)"],
    },
    {
      slug: "pipelines-etl-dados-fiscais",
      title: "Pipelines ETL de dados fiscais",
      titleEn: "Fiscal data ETL pipelines",
      summary:
        "Construção e manutenção de pipelines full e incrementais (Python + Pentaho) para coleta, transformação, padronização e validação de dados — com qualidade, disponibilidade e suporte a rotinas críticas em produção.",
      summaryEn:
        "Building and maintaining full and incremental pipelines (Python + Pentaho) for data collection, transformation, standardization and validation — with quality, availability and support for critical production routines.",
      featured: true,
      order: 3,
      techs: ["Python", "Pentaho Data Integration", "PostgreSQL", "ETL & Pipelines", "Qualidade & Validação de Dados"],
    },
    {
      slug: "ingestao-xml-nfe",
      title: "Ingestão de XML de NF-e/DF-e",
      titleEn: "NF-e/DF-e XML ingestion",
      summary:
        "Parser e ingestão de XML de notas fiscais (layouts 4.00 e 10.0, incluindo grupo IBS/CBS), com uploads em lote (.xml/.zip), validação por linha, rastreabilidade e armazenamento em object storage.",
      summaryEn:
        "Parser and ingestion of invoice XML (layouts 4.00 and 10.0, including the IBS/CBS group), with batch uploads (.xml/.zip), per-line validation, traceability and object storage.",
      featured: false,
      order: 4,
      techs: ["Node.js", "Python", "PostgreSQL", "MinIO / S3", "NF-e / DF-e & XML fiscal"],
    },
    {
      slug: "api-sugestao-tributaria",
      title: "API de sugestão de classificação fiscal",
      titleEn: "Tax classification suggestion API",
      summary:
        "Microsserviço com motor de segmentação de descrições de produtos (NLP) que sugere classificação fiscal (NCM/EAN), com dicionário carregado do banco e corpus de treino em SQL.",
      summaryEn:
        "Microservice with a product-description segmentation engine (NLP) that suggests tax classification (NCM/EAN), with a database-loaded dictionary and SQL training corpus.",
      featured: false,
      order: 5,
      techs: ["Java", "Spring Boot", "PostgreSQL", "APIs REST"],
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
        "Desenvolvimento e manutenção de soluções back-end e fluxos de automação para processos fiscais e tributários, do levantamento de requisitos à validação das entregas. Automação para geração de guias de Substituição Tributária em todos os estados brasileiros (~90% de redução no tempo operacional) e integração entre sistemas para maior confiabilidade e cumprimento de prazos fiscais.",
      descriptionEn:
        "Development and maintenance of back-end solutions and automation flows for tax processes, from requirements gathering to delivery validation. Automation for Tax Substitution guide generation across all Brazilian states (~90% operational time reduction) and system integration for higher reliability and tax deadline compliance.",
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
      title: "MBA em Gestão Fiscal e Tributária",
      titleEn: "MBA in Tax and Fiscal Management",
      institution: "Faculdade Líbano",
      startDate: new Date("2026-08-01T00:00:00"),
      current: true,
      order: 1,
    },
    {
      title: "Ciência de Dados e Inteligência Artificial",
      titleEn: "Data Science and Artificial Intelligence",
      institution: "Faculdade Líbano",
      startDate: new Date("2026-08-01T00:00:00"),
      current: true,
      order: 2,
    },
    {
      title: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
      titleEn: "Associate Degree in Systems Analysis and Development",
      institution: "Centro Universitário Presidente Antônio Carlos (UNIPAC)",
      startDate: new Date("2020-02-01T00:00:00"),
      endDate: new Date("2022-07-31T00:00:00"),
      current: false,
      order: 3,
    },
  ];

  for (const item of education) {
    await prisma.education.create({ data: item });
  }
}

async function seedDataset() {
  console.log("→ Dataset demo (ETL)...");
  await prisma.dataset.deleteMany();

  const startedAt = Date.now();
  const dataset = await prisma.dataset.create({
    data: {
      name: "Demo — NF-e 12 meses",
      source: "seed",
      status: "PROCESSING",
    },
  });

  const invoices = generateInvoices(INVOICE_COUNT);
  for (let index = 0; index < invoices.length; index += CHUNK_SIZE) {
    const chunk = invoices.slice(index, index + CHUNK_SIZE).map((invoice) => ({ ...invoice, datasetId: dataset.id }));
    await prisma.nfeInvoice.createMany({ data: chunk });
  }

  await prisma.dataset.update({
    where: { id: dataset.id },
    data: {
      status: "DONE",
      rowCount: invoices.length,
      durationMs: Date.now() - startedAt,
      completedAt: new Date(),
    },
  });
  console.log(`   ${invoices.length} notas inseridas.`);
}

async function main() {
  await seedContent();
  await seedDataset();
  console.log("✓ Seed concluído.");
}

main()
  .catch((error) => {
    console.error("Seed falhou:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
