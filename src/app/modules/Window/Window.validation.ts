import { z } from 'zod';

export const createWindowValidationSchema = z.object({
  body: z.object({
    window: z.object({
      windowSquareMeters: z.number({ required_error: 'Window square meters is required' }),
      price: z.number({ required_error: 'Price is required' }),
      isDeleted: z.boolean().default(false),
    }),
  }),
});

export const updateWindowValidationSchema = z.object({
  body: z.object({
    window: z.object({
      windowSquareMeters: z.number().optional(),
      price: z.number().optional(),
      isDeleted: z.boolean().optional(),
    }),
  }),
});