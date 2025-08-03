
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type UpdateSalesTransactionInput } from '../schema';
import { updateSalesTransaction } from '../handlers/update_sales_transaction';
import { eq } from 'drizzle-orm';

describe('updateSalesTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let existingTransactionId: number;

  beforeEach(async () => {
    // Create a test transaction to update
    const result = await db.insert(salesTransactionsTable)
      .values({
        item_service_name: 'Original Item',
        price: '25.00',
        quantity: 2,
        total: '50.00'
      })
      .returning()
      .execute();
    
    existingTransactionId = result[0].id;
  });

  it('should update item service name only', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      item_service_name: 'Updated Item Name'
    };

    const result = await updateSalesTransaction(input);

    expect(result.id).toEqual(existingTransactionId);
    expect(result.item_service_name).toEqual('Updated Item Name');
    expect(result.price).toEqual(25.00); // Unchanged
    expect(result.quantity).toEqual(2); // Unchanged
    expect(result.total).toEqual(50.00); // Recalculated from existing values
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update price and recalculate total', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      price: 30.00
    };

    const result = await updateSalesTransaction(input);

    expect(result.price).toEqual(30.00);
    expect(result.quantity).toEqual(2); // Unchanged
    expect(result.total).toEqual(60.00); // Recalculated: 30.00 * 2
    expect(result.item_service_name).toEqual('Original Item'); // Unchanged
  });

  it('should update quantity and recalculate total', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      quantity: 3
    };

    const result = await updateSalesTransaction(input);

    expect(result.quantity).toEqual(3);
    expect(result.price).toEqual(25.00); // Unchanged
    expect(result.total).toEqual(75.00); // Recalculated: 25.00 * 3
    expect(result.item_service_name).toEqual('Original Item'); // Unchanged
  });

  it('should update multiple fields and recalculate total', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      item_service_name: 'Complete Update',
      price: 15.50,
      quantity: 4
    };

    const result = await updateSalesTransaction(input);

    expect(result.item_service_name).toEqual('Complete Update');
    expect(result.price).toEqual(15.50);
    expect(result.quantity).toEqual(4);
    expect(result.total).toEqual(62.00); // Recalculated: 15.50 * 4
  });

  it('should save updated transaction to database', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      item_service_name: 'Database Test Item',
      price: 12.99
    };

    await updateSalesTransaction(input);

    const transactions = await db.select()
      .from(salesTransactionsTable)
      .where(eq(salesTransactionsTable.id, existingTransactionId))
      .execute();

    expect(transactions).toHaveLength(1);
    const transaction = transactions[0];
    expect(transaction.item_service_name).toEqual('Database Test Item');
    expect(parseFloat(transaction.price)).toEqual(12.99);
    expect(transaction.quantity).toEqual(2); // Unchanged
    expect(parseFloat(transaction.total)).toEqual(25.98); // Recalculated: 12.99 * 2
  });

  it('should throw error for non-existent transaction', async () => {
    const input: UpdateSalesTransactionInput = {
      id: 99999,
      item_service_name: 'Non-existent'
    };

    expect(updateSalesTransaction(input)).rejects.toThrow(/not found/i);
  });

  it('should handle numeric precision correctly', async () => {
    const input: UpdateSalesTransactionInput = {
      id: existingTransactionId,
      price: 19.99,
      quantity: 3
    };

    const result = await updateSalesTransaction(input);

    expect(result.price).toEqual(19.99);
    expect(result.quantity).toEqual(3);
    expect(result.total).toEqual(59.97); // 19.99 * 3
    expect(typeof result.price).toBe('number');
    expect(typeof result.total).toBe('number');
  });
});
