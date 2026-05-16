import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES } from "../types/lead";

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  status: z.enum(LEAD_STATUSES).optional(),
  source: z.enum(LEAD_SOURCES)
});

export const updateLeadSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.email("Invalid email").optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    source: z.enum(LEAD_SOURCES).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update lead"
  });
