
import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),

  description: z.string().min(3).max(1000),

  pickupAddress: z.string().min(3).max(500),
  pickupCity: z.string().min(2).max(100),

  deliveryAddress: z.string().min(3).max(500),
  deliveryCity: z.string().min(2).max(100),

  recipientName: z.string().min(2).max(150),
  recipientPhone: z.string().min(5).max(30),

  packageCount: z.number().int().min(1).max(10000),

  totalWeightKg: z.number().positive().optional(),

  deliveryFee: z.number().min(0),

  currency: z.string().length(3).default("KES"),

  scheduledAt: z.string().datetime().optional(),
});

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;
