
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type CreateSalesTransactionInput, type SalesTransaction } from '../schema';

export const createSalesTransaction = async (input: CreateSalesTransactionInput): Promise<SalesTransaction> => {
  try {
    // Calculate total before inserting
    const total = input.price * input.quantity;
    
    // Insert sales transaction record
    const result = await db.insert(salesTransactionsTable)
      .values({
        item_service_name: input.item_service_name,
        price: input.price.toString(), // Convert number to string for numeric column
        quantity: input.quantity, // Integer column - no conversion needed
        total: total.toString() // Convert calculated total to string for numeric column
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const salesTransaction = result[0];
    return {
      ...salesTransaction,
      price: parseFloat(salesTransaction.price), // Convert string back to number
      total: parseFloat(salesTransaction.total) // Convert string back to number
    };
  } catch (error) {
    console.error('Sales transaction creation failed:', error);
    throw error;
  }
};
