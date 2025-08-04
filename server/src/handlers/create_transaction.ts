import { db } from '../db';
import { transactionsTable, transactionItemsTable } from '../db/schema';
import { type CreateTransactionInput, type TransactionWithItems } from '../schema';

export const createTransaction = async (input: CreateTransactionInput): Promise<TransactionWithItems> => {
  try {
    // Calculate total price from items
    const total_harga = input.items.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

    // Start transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // Insert main transaction record
      const transactionResult = await tx.insert(transactionsTable)
        .values({
          total_harga: total_harga.toString(), // Convert number to string for numeric column
          metode_pembayaran: input.metode_pembayaran
        })
        .returning()
        .execute();

      const transaction = transactionResult[0];

      // Insert transaction items
      const itemsToInsert = input.items.map(item => ({
        transaction_id: transaction.id,
        nama_item: item.nama_item,
        harga: item.harga.toString(), // Convert number to string for numeric column
        jumlah: item.jumlah,
        subtotal: (item.harga * item.jumlah).toString() // Calculate and convert subtotal
      }));

      const itemsResult = await tx.insert(transactionItemsTable)
        .values(itemsToInsert)
        .returning()
        .execute();

      // Return transaction with items
      return {
        ...transaction,
        total_harga: parseFloat(transaction.total_harga), // Convert back to number
        items: itemsResult.map(item => ({
          ...item,
          harga: parseFloat(item.harga), // Convert back to number
          subtotal: parseFloat(item.subtotal) // Convert back to number
        }))
      };
    });

    return result;
  } catch (error) {
    console.error('Transaction creation failed:', error);
    throw error;
  }
};