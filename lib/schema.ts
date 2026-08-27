import { z } from "zod";

export const freightDocumentItemSchema = z.object({
  productName: z.string().nullable(),
  productNumber: z.string().nullable(),
  batchNumber: z.string().nullable(),
  quantity: z.number().nullable(),
  quantityUnit: z.string().nullable(),
  packageCount: z.number().nullable(),
  netWeightKg: z.number().nullable(),
});

export const freightDocumentSchema = z.object({
  supplier: z.string().nullable(),
  documentNumber: z.string().nullable(),
  documentDate: z.string().nullable(),
  orderNumber: z.string().nullable(),
  items: z.array(freightDocumentItemSchema),
  totalPackageCount: z.number().nullable(),
  totalWeightKg: z.number().nullable(),
});

export type FreightDocumentParsed = z.infer<typeof freightDocumentSchema>;
