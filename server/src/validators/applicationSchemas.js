
import { z } from "zod";

export const createApplicationSchema = z.object({
  coverLetter: z.string().trim().max(5000).optional().default(""),
}).strict();


export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    "submitted",
    "reviewing",
    "shortlisted",
    "rejected",
    "hired",
  ]),
}).strict();


export const listApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum([
    "submitted",
    "reviewing",
    "shortlisted",
    "rejected",
    "hired",
  ]).optional(),
}).strict();
