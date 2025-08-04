
import { serial, text, pgTable, timestamp, numeric, integer, date } from 'drizzle-orm/pg-core';

export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone_number: text('phone_number').notNull(),
  complaint: text('complaint').notNull(),
  examination_date: date('examination_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const salesTransactionsTable = pgTable('sales_transactions', {
  id: serial('id').primaryKey(),
  item_service_name: text('item_service_name').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// New POS tables
export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  total_harga: numeric('total_harga', { precision: 10, scale: 2 }).notNull(),
  metode_pembayaran: text('metode_pembayaran').notNull(),
  tanggal: timestamp('tanggal').defaultNow().notNull(),
});

export const transactionItemsTable = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transaction_id: integer('transaction_id').notNull().references(() => transactionsTable.id, { onDelete: 'cascade' }),
  nama_item: text('nama_item').notNull(),
  harga: numeric('harga', { precision: 10, scale: 2 }).notNull(),
  jumlah: integer('jumlah').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// TypeScript types for the table schemas
export type Patient = typeof patientsTable.$inferSelect;
export type NewPatient = typeof patientsTable.$inferInsert;
export type SalesTransaction = typeof salesTransactionsTable.$inferSelect;
export type NewSalesTransaction = typeof salesTransactionsTable.$inferInsert;

// New POS types
export type Transaction = typeof transactionsTable.$inferSelect;
export type NewTransaction = typeof transactionsTable.$inferInsert;
export type TransactionItem = typeof transactionItemsTable.$inferSelect;
export type NewTransactionItem = typeof transactionItemsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  patients: patientsTable, 
  salesTransactions: salesTransactionsTable,
  transactions: transactionsTable,
  transactionItems: transactionItemsTable
};
