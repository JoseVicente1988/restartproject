import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();
export const passwordSchema = z.string().min(8).max(72);

export const registerSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(120).optional(),
  password: passwordSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const itemCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  qty: z.number().int().min(1).max(9999).default(1),
  note: z.string().trim().max(400).optional()
});

export const goalCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  target_date: z.string().datetime().optional()
});

export const feedCreateSchema = z.object({
  content: z.string().trim().min(1).max(500)
});

export const commentSchema = z.object({
  text: z.string().trim().min(1).max(400)
});

export const friendInviteSchema = z.object({
  email: emailSchema
});

export const friendActionSchema = z.object({
  friendship_id: z.coerce.bigint().positive()
});

export const dmSendSchema = z.object({
  friend_id: z.coerce.bigint().positive(),
  text: z.string().trim().min(1).max(500)
});
