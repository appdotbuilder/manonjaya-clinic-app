
import { z } from 'zod';

// Patient schema
export const patientSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone_number: z.string(),
  complaint: z.string(),
  examination_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Patient = z.infer<typeof patientSchema>;

// Input schema for creating patients
export const createPatientInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  complaint: z.string().min(1, "Complaint is required"),
  examination_date: z.string().or(z.date()) // Accept both string and date inputs
});

export type CreatePatientInput = z.infer<typeof createPatientInputSchema>;

// Sales transaction schema
export const salesTransactionSchema = z.object({
  id: z.number(),
  item_service_name: z.string(),
  price: z.number(),
  quantity: z.number().int(),
  total: z.number(),
  created_at: z.coerce.date()
});

export type SalesTransaction = z.infer<typeof salesTransactionSchema>;

// Input schema for creating sales transactions
export const createSalesTransactionInputSchema = z.object({
  item_service_name: z.string().min(1, "Item/Service name is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be a positive integer")
  // total will be calculated automatically (price * quantity)
});

export type CreateSalesTransactionInput = z.infer<typeof createSalesTransactionInputSchema>;

// Input schema for updating patients
export const updatePatientInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  phone_number: z.string().min(1).optional(),
  complaint: z.string().min(1).optional(),
  examination_date: z.string().or(z.date()).optional()
});

export type UpdatePatientInput = z.infer<typeof updatePatientInputSchema>;

// Input schema for updating sales transactions
export const updateSalesTransactionInputSchema = z.object({
  id: z.number(),
  item_service_name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().positive().optional()
  // total will be recalculated if price or quantity changes
});

export type UpdateSalesTransactionInput = z.infer<typeof updateSalesTransactionInputSchema>;

// Query parameters for filtering
export const getPatientsInputSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional()
});

export type GetPatientsInput = z.infer<typeof getPatientsInputSchema>;

export const getSalesTransactionsInputSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional()
});

export type GetSalesTransactionsInput = z.infer<typeof getSalesTransactionsInputSchema>;
