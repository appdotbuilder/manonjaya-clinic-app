
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const deleteSalesTransactionInputSchema = z.object({
    id: z.number()
});

type DeleteSalesTransactionInput = z.infer<typeof deleteSalesTransactionInputSchema>;

export const deleteSalesTransaction = async (input: DeleteSalesTransactionInput): Promise<{ success: boolean }> => {
    try {
        // First check if the transaction exists
        const existing = await db.select()
            .from(salesTransactionsTable)
            .where(eq(salesTransactionsTable.id, input.id))
            .execute();

        if (existing.length === 0) {
            throw new Error(`Sales transaction with id ${input.id} not found`);
        }

        // Delete the transaction
        const result = await db.delete(salesTransactionsTable)
            .where(eq(salesTransactionsTable.id, input.id))
            .execute();

        return { success: true };
    } catch (error) {
        console.error('Sales transaction deletion failed:', error);
        throw error;
    }
};
