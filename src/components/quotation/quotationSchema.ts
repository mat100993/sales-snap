
import * as z from 'zod';

export const quotationItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discount: z.number().min(0).max(100).optional(),
});

export const quotationSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  status: z.enum(['draft', 'sent', 'accepted', 'declined']),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
