
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type CreateSalesTransactionInput } from '../schema';
import { deleteSalesTransaction } from '../handlers/delete_sales_transaction';
import { eq } from 'drizzle-orm';

// Test input for creating a sales transaction
const testTransactionInput: CreateSalesTransactionInput = {
    item_service_name: 'Test Service',
    price: 50.00,
    quantity: 2
};

describe('deleteSalesTransaction', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    it('should delete an existing sales transaction', async () => {
        // Create a test transaction first
        const createResult = await db.insert(salesTransactionsTable)
            .values({
                item_service_name: testTransactionInput.item_service_name,
                price: testTransactionInput.price.toString(),
                quantity: testTransactionInput.quantity,
                total: (testTransactionInput.price * testTransactionInput.quantity).toString()
            })
            .returning()
            .execute();

        const transactionId = createResult[0].id;

        // Delete the transaction
        const result = await deleteSalesTransaction({ id: transactionId });

        expect(result.success).toBe(true);

        // Verify transaction is deleted from database
        const transactions = await db.select()
            .from(salesTransactionsTable)
            .where(eq(salesTransactionsTable.id, transactionId))
            .execute();

        expect(transactions).toHaveLength(0);
    });

    it('should throw error when transaction does not exist', async () => {
        const nonExistentId = 99999;

        await expect(deleteSalesTransaction({ id: nonExistentId }))
            .rejects.toThrow(/not found/i);
    });

    it('should not affect other transactions when deleting one', async () => {
        // Create two test transactions
        const transaction1 = await db.insert(salesTransactionsTable)
            .values({
                item_service_name: 'Service 1',
                price: '25.00',
                quantity: 1,
                total: '25.00'
            })
            .returning()
            .execute();

        const transaction2 = await db.insert(salesTransactionsTable)
            .values({
                item_service_name: 'Service 2',
                price: '30.00',
                quantity: 2,
                total: '60.00'
            })
            .returning()
            .execute();

        // Delete first transaction
        const result = await deleteSalesTransaction({ id: transaction1[0].id });

        expect(result.success).toBe(true);

        // Verify first transaction is deleted
        const deletedTransaction = await db.select()
            .from(salesTransactionsTable)
            .where(eq(salesTransactionsTable.id, transaction1[0].id))
            .execute();

        expect(deletedTransaction).toHaveLength(0);

        // Verify second transaction still exists
        const remainingTransaction = await db.select()
            .from(salesTransactionsTable)
            .where(eq(salesTransactionsTable.id, transaction2[0].id))
            .execute();

        expect(remainingTransaction).toHaveLength(1);
        expect(remainingTransaction[0].item_service_name).toEqual('Service 2');
    });
});
