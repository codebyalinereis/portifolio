import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  message: z.string().min(10).max(4000),
  // Honeypot: aceita qualquer valor — a rota decide (responde fake 200 se preenchido)
  company: z.string().max(200).optional(),
});

export const projectInputSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, "slug: apenas a-z, 0-9 e hífen"),
  title: z.string().min(2).max(140),
  titleEn: z.string().max(140).optional().nullable(),
  summary: z.string().min(10).max(600),
  summaryEn: z.string().max(600).optional().nullable(),
  detail: z.string().max(8000).optional().nullable(),
  repoUrl: z.string().url().optional().nullable().or(z.literal("")),
  liveUrl: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  technologyIds: z.array(z.string()).default([]),
});

export const technologyInputSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.enum(["FRONTEND", "BACKEND", "DATA", "DEVOPS", "DOMAIN"]),
  level: z.number().int().min(1).max(5).default(3),
  order: z.number().int().min(0).default(0),
});

export const experienceInputSchema = z.object({
  role: z.string().min(2).max(140),
  roleEn: z.string().max(140).optional().nullable(),
  company: z.string().min(1).max(120),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  description: z.string().min(10).max(4000),
  descriptionEn: z.string().max(4000).optional().nullable(),
  order: z.number().int().min(0).default(0),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type TechnologyInput = z.infer<typeof technologyInputSchema>;
export type ExperienceInput = z.infer<typeof experienceInputSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
