
import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(150),

  email: z
    .string()
    .email()
    .max(255)
    .optional()
    .or(z.literal("")),

  phone: z.string().min(5).max(30).optional(),

  companyName: z.string().max(150).optional(),

  address: z.string().max(500).optional(),

  city: z.string().max(100).optional(),

  country: z.string().max(100).optional(),

  notes: z.string().max(2000).optional(),
});

export type CreateCustomerInput = z.infer<
  typeof createCustomerSchema
>;
