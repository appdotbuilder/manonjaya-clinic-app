
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

// TypeScript types for the table schemas
export type Patient = typeof patientsTable.$inferSelect;
export type NewPatient = typeof patientsTable.$inferInsert;
export type SalesTransaction = typeof salesTransactionsTable.$inferSelect;
export type NewSalesTransaction = typeof salesTransactionsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  patients: patientsTable, 
  salesTransactions: salesTransactionsTable 
};
