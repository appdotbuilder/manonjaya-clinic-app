
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type CreateSalesTransactionInput } from '../schema';
import { createSalesTransaction } from '../handlers/create_sales_transaction';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSalesTransactionInput = {
  item_service_name: 'Medical Consultation',
  price: 150.75,
  quantity: 2
};

describe('createSalesTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a sales transaction', async () => {
    const result = await createSalesTransaction(testInput);

    // Basic field validation
    expect(result.item_service_name).toEqual('Medical Consultation');
    expect(result.price).toEqual(150.75);
    expect(result.quantity).toEqual(2);
    expect(result.total).toEqual(301.5); // 150.75 * 2
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    
    // Verify numeric types
    expect(typeof result.price).toBe('number');
    expect(typeof result.total).toBe('number');
  });

  it('should calculate total correctly', async () => {
    const input = {
      item_service_name: 'X-Ray Service',
      price: 89.99,
      quantity: 3
    };

    const result = await createSalesTransaction(input);

    expect(result.total).toEqual(269.97); // 89.99 * 3
    expect(typeof result.total).toBe('number');
  });

  it('should save sales transaction to database', async () => {
    const result = await createSalesTransaction(testInput);

    // Query using proper drizzle syntax
    const transactions = await db.select()
      .from(salesTransactionsTable)
      .where(eq(salesTransactionsTable.id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].item_service_name).toEqual('Medical Consultation');
    expect(parseFloat(transactions[0].price)).toEqual(150.75);
    expect(transactions[0].quantity).toEqual(2);
    expect(parseFloat(transactions[0].total)).toEqual(301.5);
    expect(transactions[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle decimal calculations correctly', async () => {
    const input = {
      item_service_name: 'Medication',
      price: 12.99,
      quantity: 5
    };

    const result = await createSalesTransaction(input);

    expect(result.total).toEqual(64.95); // 12.99 * 5
    expect(result.price).toEqual(12.99);
    expect(result.quantity).toEqual(5);
  });
});
