
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const deletePatientInputSchema = z.object({
    id: z.number()
});

type DeletePatientInput = z.infer<typeof deletePatientInputSchema>;

export const deletePatient = async (input: DeletePatientInput): Promise<{ success: boolean }> => {
    try {
        // First check if patient exists
        const existingPatient = await db.select()
            .from(patientsTable)
            .where(eq(patientsTable.id, input.id))
            .execute();

        if (existingPatient.length === 0) {
            throw new Error(`Patient with id ${input.id} not found`);
        }

        // Delete the patient
        const result = await db.delete(patientsTable)
            .where(eq(patientsTable.id, input.id))
            .execute();

        return { success: true };
    } catch (error) {
        console.error('Patient deletion failed:', error);
        throw error;
    }
};
