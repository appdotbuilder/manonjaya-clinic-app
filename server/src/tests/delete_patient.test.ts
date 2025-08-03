
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deletePatient } from '../handlers/delete_patient';

describe('deletePatient', () => {
    beforeEach(createDB);
    afterEach(resetDB);

    it('should delete an existing patient', async () => {
        // Create a test patient
        const testPatient = await db.insert(patientsTable)
            .values({
                name: 'John Doe',
                phone_number: '123-456-7890',
                complaint: 'Headache',
                examination_date: '2023-12-01'
            })
            .returning()
            .execute();

        const patientId = testPatient[0].id;

        // Delete the patient
        const result = await deletePatient({ id: patientId });

        // Verify success response
        expect(result.success).toBe(true);

        // Verify patient is deleted from database
        const deletedPatient = await db.select()
            .from(patientsTable)
            .where(eq(patientsTable.id, patientId))
            .execute();

        expect(deletedPatient).toHaveLength(0);
    });

    it('should throw error when patient does not exist', async () => {
        const nonExistentId = 999;

        // Attempt to delete non-existent patient
        await expect(deletePatient({ id: nonExistentId }))
            .rejects.toThrow(/Patient with id 999 not found/i);
    });

    it('should not affect other patients when deleting one', async () => {
        // Create multiple test patients
        const patient1 = await db.insert(patientsTable)
            .values({
                name: 'John Doe',
                phone_number: '123-456-7890',
                complaint: 'Headache',
                examination_date: '2023-12-01'
            })
            .returning()
            .execute();

        const patient2 = await db.insert(patientsTable)
            .values({
                name: 'Jane Smith',
                phone_number: '987-654-3210',
                complaint: 'Fever',
                examination_date: '2023-12-02'
            })
            .returning()
            .execute();

        // Delete first patient
        const result = await deletePatient({ id: patient1[0].id });

        expect(result.success).toBe(true);

        // Verify first patient is deleted
        const deletedPatient = await db.select()
            .from(patientsTable)
            .where(eq(patientsTable.id, patient1[0].id))
            .execute();

        expect(deletedPatient).toHaveLength(0);

        // Verify second patient still exists
        const remainingPatient = await db.select()
            .from(patientsTable)
            .where(eq(patientsTable.id, patient2[0].id))
            .execute();

        expect(remainingPatient).toHaveLength(1);
        expect(remainingPatient[0].name).toEqual('Jane Smith');
    });
});
