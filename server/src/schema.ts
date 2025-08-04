
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

// POS Transaction schemas
export const transactionSchema = z.object({
  id: z.number(),
  total_harga: z.number(),
  metode_pembayaran: z.string(),
  tanggal: z.coerce.date()
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionItemSchema = z.object({
  id: z.number(),
  transaction_id: z.number(),
  nama_item: z.string(),
  harga: z.number(),
  jumlah: z.number().int(),
  subtotal: z.number()
});

export type TransactionItem = z.infer<typeof transactionItemSchema>;

// Input schema for creating POS transactions
export const createTransactionInputSchema = z.object({
  metode_pembayaran: z.string().min(1, "Payment method is required"),
  items: z.array(z.object({
    nama_item: z.string().min(1, "Item name is required"),
    harga: z.number().positive("Price must be positive"),
    jumlah: z.number().int().positive("Quantity must be a positive integer")
    // subtotal will be calculated automatically (harga * jumlah)
  })).min(1, "At least one item is required")
  // total_harga will be calculated from items
});

export type CreateTransactionInput = z.infer<typeof createTransactionInputSchema>;

// Complete transaction with items for display
export const transactionWithItemsSchema = z.object({
  id: z.number(),
  total_harga: z.number(),
  metode_pembayaran: z.string(),
  tanggal: z.coerce.date(),
  items: z.array(transactionItemSchema)
});

export type TransactionWithItems = z.infer<typeof transactionWithItemsSchema>;

// Query parameters for filtering POS transactions
export const getTransactionsInputSchema = z.object({
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  metode_pembayaran: z.string().optional()
});

export type GetTransactionsInput = z.infer<typeof getTransactionsInputSchema>;
