import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
