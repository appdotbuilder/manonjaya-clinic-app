import { db } from '../db';
import { transactionsTable, transactionItemsTable } from '../db/schema';
import { type TransactionWithItems } from '../schema';
import { eq } from 'drizzle-orm';

export const getTransactionById = async (id: number): Promise<TransactionWithItems | null> => {
  try {
    // Get the main transaction
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, id))
      .execute();

    if (transactions.length === 0) {
      return null;
    }

    const transaction = transactions[0];

    // Get transaction items
    const items = await db.select()
      .from(transactionItemsTable)
      .where(eq(transactionItemsTable.transaction_id, id))
      .execute();

    return {
      ...transaction,
      total_harga: parseFloat(transaction.total_harga), // Convert string to number
      items: items.map(item => ({
        ...item,
        harga: parseFloat(item.harga), // Convert string to number
        subtotal: parseFloat(item.subtotal) // Convert string to number
      }))
    };
  } catch (error) {
    console.error('Failed to get transaction by ID:', error);
    throw error;
  }
};