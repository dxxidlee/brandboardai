import { z } from "zod";

export const auditRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(500),
  inputType: z.enum(["company", "url", "concept", "industry"]),
});

export type AuditRequest = z.infer<typeof auditRequestSchema>;
