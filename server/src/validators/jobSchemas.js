
import { z } from "zod";

const nonEmptyText = (min, max) =>
  z.string().trim().min(min).max(max);

const stringList = (maxItems, maxLength) =>
  z.array(
    z.string().trim().min(1).max(maxLength)
  ).max(maxItems);

const salarySchema = z.object({
  min: z.number().min(0).nullable().optional(),
  max: z.number().min(0).nullable().optional(),
  currency: z.string().trim().length(3).optional(),
  period: z.enum(["year", "month", "hour"]).optional(),
}).strict().refine(
  (salary) =>
    salary.min == null ||
    salary.max == null ||
    salary.min <= salary.max,
  {
    message: "Minimum salary cannot exceed maximum salary",
  }
);

const jobFields = {
  title: nonEmptyText(3, 120),
  company: nonEmptyText(2, 120),
  description: nonEmptyText(30, 20000),

  responsibilities: stringList(30, 500).optional(),
  requirements: stringList(30, 500).optional(),
 skills: z.array(
  z.string().trim().min(1).max(50)
).min(1).max(30),

  location: nonEmptyText(1, 150),

  workMode: z.enum(["onsite", "remote", "hybrid"]),

  employmentType: z.enum([
    "full-time",
    "part-time",
    "internship",
    "contract",
  ]),

  experienceLevel: z.enum([
    "internship",
    "entry",
    "junior",
    "mid",
    "senior",
  ]),

  salary: salarySchema.optional(),

  applicationDeadline: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
};

export const createJobSchema = z.object({
  ...jobFields,
  status: z.enum(["draft", "published"]).optional(),
}).strict().refine(
  (job) =>
    job.salary?.min == null ||
    job.salary?.max == null ||
    job.salary.min <= job.salary.max,
  { message: "Invalid salary range" }
);

export const updateJobSchema = z.object({
  title: jobFields.title.optional(),
  company: jobFields.company.optional(),
  description: jobFields.description.optional(),
  responsibilities: jobFields.responsibilities,
  requirements: jobFields.requirements,
  skills: jobFields.skills.optional(),
  location: jobFields.location.optional(),
  workMode: jobFields.workMode.optional(),
  employmentType: jobFields.employmentType.optional(),
  experienceLevel: jobFields.experienceLevel.optional(),
  salary: jobFields.salary,
  applicationDeadline: jobFields.applicationDeadline,
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field to update" }
).refine(
  (data) =>
    data.salary?.min == null ||
    data.salary?.max == null ||
    data.salary.min <= data.salary.max,
  { message: "Invalid salary range" }
);

export const jobStatusSchema = z.object({
  status: z.enum(["draft", "published", "closed"]),
}).strict();

export const jobListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  location: z.string().trim().max(150).optional(),
  employmentType: z.enum([
    "full-time",
    "part-time",
    "internship",
    "contract",
  ]).optional(),
  workMode: z.enum(["onsite", "remote", "hybrid"]).optional(),
  experienceLevel: z.enum([
    "internship",
    "entry",
    "junior",
    "mid",
    "senior",
  ]).optional(),
  skills: z.string().trim().max(500).optional(),
  sort: z.enum([
    "newest",
    "oldest",
    "salary_desc",
    "salary_asc",
  ]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
}).strict();
