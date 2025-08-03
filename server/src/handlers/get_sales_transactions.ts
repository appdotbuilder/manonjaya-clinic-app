
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type SalesTransaction, type GetSalesTransactionsInput } from '../schema';
import { and, gte, lte, ilike, desc, type SQL } from 'drizzle-orm';

export const getSalesTransactions = async (input?: GetSalesTransactionsInput): Promise<SalesTransaction[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Date range filtering
    if (input?.date_from) {
      const fromDate = new Date(input.date_from);
      conditions.push(gte(salesTransactionsTable.created_at, fromDate));
    }

    if (input?.date_to) {
      const toDate = new Date(input.date_to);
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      conditions.push(lte(salesTransactionsTable.created_at, toDate));
    }

    // Search by item/service name
    if (input?.search) {
      conditions.push(ilike(salesTransactionsTable.item_service_name, `%${input.search}%`));
    }

    // Build complete query in one chain
    const baseQuery = db.select().from(salesTransactionsTable);
    
    const results = conditions.length > 0
      ? await baseQuery
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(salesTransactionsTable.created_at))
          .execute()
      : await baseQuery
          .orderBy(desc(salesTransactionsTable.created_at))
          .execute();

    // Convert numeric fields from strings to numbers
    return results.map(transaction => ({
      ...transaction,
      price: parseFloat(transaction.price),
      total: parseFloat(transaction.total)
    }));
  } catch (error) {
    console.error('Failed to fetch sales transactions:', error);
    throw error;
  }
};
