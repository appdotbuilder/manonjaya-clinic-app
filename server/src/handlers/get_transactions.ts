import { db } from '../db';
import { transactionsTable, transactionItemsTable } from '../db/schema';
import { type GetTransactionsInput, type TransactionWithItems } from '../schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

export const getTransactions = async (input: GetTransactionsInput): Promise<TransactionWithItems[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Date range filtering
    if (input.date_from) {
      const fromDate = new Date(input.date_from);
      conditions.push(gte(transactionsTable.tanggal, fromDate));
    }

    if (input.date_to) {
      const toDate = new Date(input.date_to);
      toDate.setHours(23, 59, 59, 999); // Include the entire end date
      conditions.push(lte(transactionsTable.tanggal, toDate));
    }

    // Payment method filtering
    if (input.metode_pembayaran) {
      conditions.push(eq(transactionsTable.metode_pembayaran, input.metode_pembayaran));
    }

    // Build query with all conditions at once
    const query = db.select().from(transactionsTable);
    
    const transactions = conditions.length > 0
      ? await query
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(transactionsTable.tanggal))
          .execute()
      : await query
          .orderBy(desc(transactionsTable.tanggal))
          .execute();

    // Get transaction items for each transaction
    const transactionsWithItems: TransactionWithItems[] = [];

    for (const transaction of transactions) {
      const items = await db.select()
        .from(transactionItemsTable)
        .where(eq(transactionItemsTable.transaction_id, transaction.id))
        .execute();

      transactionsWithItems.push({
        ...transaction,
        total_harga: parseFloat(transaction.total_harga), // Convert string to number
        items: items.map(item => ({
          ...item,
          harga: parseFloat(item.harga), // Convert string to number
          subtotal: parseFloat(item.subtotal) // Convert string to number
        }))
      });
    }

    return transactionsWithItems;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    throw error;
  }
};