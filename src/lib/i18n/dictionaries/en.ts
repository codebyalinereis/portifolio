import type { Dictionary } from "./pt-BR";

// Must mirror pt-BR exactly — the compiler flags any missing or extra key.

export const en: Dictionary = {
  locale: "en",
  metadata: {
    title: "Aline Reis — Full Stack & Data Developer",
    description:
      "Aline Reis' portfolio: complete web applications, APIs, automations and data pipelines — plus a lab of interactive canvas experiments. Next.js, React, Node.js, Python and PostgreSQL.",
  },

  nav: {
    home: "Home",
    about: "About",
    skills: "Skills",
    projects: "Projects",
    experience: "Experience",
    education: "Education",
    contact: "Contact",
    lab: "Lab",
    admin: "Admin",
  },

  common: {
    loading: "Loading...",
    error: "Something went wrong. Please try again.",
    backHome: "Back to home",
    viewAll: "View all",
    close: "Close",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    new: "New",
    confirmDelete: "Confirm deletion?",
    saved: "Saved successfully.",
    deleted: "Deleted.",
    required: "Required field",
    optional: "optional",
  },

  theme: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },

  language: {
    label: "Language",
    short: "EN",
  },

  hero: {
    name: "Aline Reis",
    roles: ["Full Stack Developer", "Data Developer", "Back-end & APIs", "Automation & Integrations"],
    location: "Uberlândia — MG, Brazil",
    summary:
      "I build complete web applications — from the database to the last pixel: APIs, integrations, automations and interfaces that love to be touched. Daily TypeScript, React, Node.js, Python and SQL, with care for performance and detail.",
    ctaProjects: "View projects",
    ctaLab: "Explore the Lab",
    ctaContact: "Get in touch",
    badges: ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "n8n"],
  },

  about: {
    title: "About me",
    paragraphs: [
      "I'm a full stack developer with a strong data background: SQL modeling, ETL pipelines and system integration. On the front, TypeScript, React and Next.js; on the back, Node.js, Java and Python; and PostgreSQL as home for the data — with RabbitMQ, Kafka and Docker in the daily infra routine.",
      "Close to those who use the system, I take part in functional refinement end to end: understanding the business need with the operations team, translating it into a cohesive scope and only then coding. I love taking manual processes and returning reliable automation — I've cut entire operations' time by ~90% with RPA and orchestration. Data validation, observability and production troubleshooting are part of the craft.",
      "Off code, I study data science and AI in college — and turn ideas into interactive experiments, like the ones in this page's Lab.",
    ],
    highlightTitle: "By the numbers",
    highlights: [
      { value: "4+", label: "years building software" },
      { value: "~90%", label: "reduction in operational time through automation" },
      { value: "5+", label: "projects delivered in production" },
    ],
  },

  refinement: {
    title: "From business to code",
    subtitle:
      "Functional refinement is part of the craft: I sit with business and operations, understand the pain in the real flow and only then build. It's what separates delivered software from adopted software.",
    steps: [
      {
        title: "Understand",
        text: "Sit with the people who run the process and watch it for real — the pain the ticket doesn't tell, the step nobody wrote down.",
      },
      {
        title: "Refine",
        text: "Translate the need into a cohesive scope with business and operations: challenge, sketch examples, cut what adds nothing.",
      },
      {
        title: "Build",
        text: "With a clean scope, code flows: back-end, automation and interface at the same pace — no rework from a poor specification.",
      },
      {
        title: "Validate",
        text: "Run it with whoever asked, adjust what reality reveals and measure the gain — like the ~90% of operational time recovered.",
      },
    ],
    note: "Routine across every project in production: refinement with business and operations teams, start to finish.",
  },

  skills: {
    title: "Skills",
    subtitle: "Tools I work with, grouped by area.",
    categories: {
      FRONTEND: "Front-end & Full Stack",
      BACKEND: "Back-end & APIs",
      DATA: "Data & ETL",
      DEVOPS: "Infra, Automation & Messaging",
      DOMAIN: "Extras & Studies",
    },
    levelLabel: "level",
  },

  projects: {
    title: "Projects",
    subtitle: "Solutions in production and case studies — from back-end to interface.",
    featuredLabel: "Featured",
    tech: "Technologies",
    repo: "Repository",
    live: "View online",
    detail: "Details",
    empty: "No projects registered yet.",
    filterAll: "All",
    filterHint: "Filter by area:",
    filters: {
      FRONTEND: "Front-end",
      BACKEND: "Back-end",
      DATA: "Data",
      DEVOPS: "Infra",
      DOMAIN: "Extras",
    },
  },

  experience: {
    title: "Experience",
    subtitle: "Professional trajectory.",
    current: "Current",
    present: "present",
  },

  education: {
    title: "Education",
    subtitle: "Academic and complementary.",
    inProgress: "In progress",
    coursesTitle: "Courses",
    courses: [
      "Databases and SQL — complete course",
      "Complete Java — Object-Oriented Programming",
      "Inglês Extremo — from zero to fluency",
    ],
  },

  contact: {
    title: "Contact",
    subtitle: "Let's talk? Through the form or directly on the channels below.",
    name: "Name",
    email: "E-mail",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@email.com",
    messagePlaceholder: "Tell me about your project or opportunity...",
    send: "Send message",
    sending: "Sending...",
    success: "Message sent! Thanks for reaching out.",
    error: "Could not send. Try again or use the direct e-mail.",
    validation: "Please check the fields.",
    directTitle: "Direct contact",
    location: "Uberlândia — MG, Brazil",
  },

  footer: {
    rights: "All rights reserved.",
    builtWith: "Built with Next.js, Prisma, PostgreSQL and Tailwind — no templates.",
  },

  notFound: {
    title: "Page not found",
    subtitle: "The address you accessed doesn't exist (or has moved).",
  },

  lab: {
    title: "Lab",
    subtitle: "Interactive experiments handmade with canvas, WebGL and React — move, click, play.",
    shader: {
      title: "Procedural sculpture",
      subtitle:
        "Raymarching in pure GLSL, no three.js: the geometry is a signed distance field — a crystal prism with a pulsing lattice inside and a counter-rotating core — and every pixel marches a ray until it finds the surface, with soft shadows, ambient occlusion and fog. Drag to orbit.",
      pause: "Pause",
      play: "Resume",
      hint: "Drag to orbit the camera",
      unsupported: "Your browser doesn't support WebGL — the sculpture could not be rendered.",
    },
    fourier: {
      title: "Fourier draws",
      subtitle:
        "Draw on the left pad: your curve goes through a Fourier transform (a hand-written DFT) and the epicycle machine redraws it on the right — each circle is one frequency of your curve.",
      draw: "You draw here — mouse or finger",
      drawHint: "✏️ Draw here",
      machine: "The machine draws here (Fourier)",
      harmonics: "Circles",
      preset: "Example",
      note: "Fewer circles = more abstraction. Watch your signature become art.",
    },
    flow: {
      title: "Flow field",
      subtitle: "Particles sailing a procedural noise field. The cursor attracts; a click bursts.",
      density: "Density",
      scheme: "Palette",
      schemes: {
        violet: "Violet",
        aurora: "Aurora",
        ocean: "Ocean",
        sunset: "Sunset",
      },
      pause: "Pause",
      play: "Resume",
      hint: "Tip: hover and click on the canvas",
    },
    game: {
      title: "Memory game",
      subtitle: "Find the 8 stack pairs. Fewer moves, better.",
      moves: "Moves",
      time: "Time",
      best: "Best",
      reset: "Restart",
      win: "You found all the pairs!",
      newRecord: "New record!",
      seconds: "s",
    },
    race: {
      title: "Data race",
      subtitle: "Language popularity over time — live ranking, animation and a year scrubber.",
      play: "Play",
      pause: "Pause",
      year: "Year",
      valueLabel: "index points",
      note: "Illustrative data, generated in the browser for demonstration only — the fun is real.",
    },
  },

  admin: {
    login: {
      title: "Admin — sign in",
      subtitle: "Portfolio management area.",
      email: "E-mail",
      password: "Password",
      submit: "Sign in",
      invalid: "Invalid credentials.",
      blocked: "Too many attempts. Please wait a few minutes.",
    },
    nav: {
      overview: "Overview",
      projects: "Projects",
      technologies: "Technologies",
      experiences: "Experiences",
      messages: "Messages",
      logout: "Sign out",
      viewSite: "View site",
    },
    overview: {
      title: "Overview",
      welcome: "Portfolio management panel.",
      projects: "Projects",
      technologies: "Technologies",
      experiences: "Experiences",
      messages: "Messages",
      unread: "unread",
      recentMessages: "Recent messages",
      noMessages: "No messages received yet.",
      goTo: "Go to",
    },
    projects: {
      title: "Projects",
      tableTitle: "Title",
      slug: "Slug",
      featured: "Featured",
      order: "Order",
      summary: "Summary",
      summaryEn: "Summary (EN)",
      titleEn: "Title (EN)",
      detail: "Details (case study)",
      detailEn: "Details (EN)",
      repoUrl: "Repository (URL)",
      liveUrl: "Online URL",
      technologies: "Technologies",
      empty: "No projects.",
    },
    technologies: {
      title: "Technologies",
      name: "Name",
      category: "Category",
      level: "Level (1–5)",
      order: "Order",
      empty: "No technologies.",
    },
    experiences: {
      title: "Experiences",
      role: "Role",
      roleEn: "Role (EN)",
      company: "Company",
      order: "Order",
      startDate: "Start",
      endDate: "End",
      current: "Current",
      description: "Description",
      descriptionEn: "Description (EN)",
      empty: "No experiences.",
    },
    messages: {
      title: "Contact messages",
      from: "From",
      date: "Date",
      status: "Status",
      read: "Read",
      unread: "Unread",
      markRead: "Mark as read",
      markUnread: "Mark as unread",
      empty: "No messages.",
    },
  },
};
