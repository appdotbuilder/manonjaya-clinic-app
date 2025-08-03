
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type UpdateSalesTransactionInput, type SalesTransaction } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSalesTransaction = async (input: UpdateSalesTransactionInput): Promise<SalesTransaction> => {
  try {
    // First, fetch the current transaction to get existing values
    const existingTransactions = await db.select()
      .from(salesTransactionsTable)
      .where(eq(salesTransactionsTable.id, input.id))
      .execute();

    if (existingTransactions.length === 0) {
      throw new Error(`Sales transaction with ID ${input.id} not found`);
    }

    const existing = existingTransactions[0];

    // Use provided values or fall back to existing values
    const price = input.price !== undefined ? input.price : parseFloat(existing.price);
    const quantity = input.quantity !== undefined ? input.quantity : existing.quantity;
    const total = price * quantity;

    // Build update object with only provided fields
    const updateValues: any = {
      total: total.toString() // Always recalculate total
    };

    if (input.item_service_name !== undefined) {
      updateValues.item_service_name = input.item_service_name;
    }
    if (input.price !== undefined) {
      updateValues.price = input.price.toString();
    }
    if (input.quantity !== undefined) {
      updateValues.quantity = input.quantity;
    }

    // Update the transaction
    const result = await db.update(salesTransactionsTable)
      .set(updateValues)
      .where(eq(salesTransactionsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const transaction = result[0];
    return {
      ...transaction,
      price: parseFloat(transaction.price),
      total: parseFloat(transaction.total)
    };
  } catch (error) {
    console.error('Sales transaction update failed:', error);
    throw error;
  }
};
