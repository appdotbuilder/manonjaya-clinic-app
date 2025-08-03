
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdatePatientInput, type Patient } from '../schema';

export const updatePatient = async (input: UpdatePatientInput): Promise<Patient> => {
  try {
    // First, check if patient exists
    const existingPatient = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, input.id))
      .limit(1)
      .execute();

    if (existingPatient.length === 0) {
      throw new Error(`Patient with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.phone_number !== undefined) {
      updateData.phone_number = input.phone_number;
    }
    
    if (input.complaint !== undefined) {
      updateData.complaint = input.complaint;
    }
    
    if (input.examination_date !== undefined) {
      // Convert string or Date to YYYY-MM-DD format for date column
      const examDate = typeof input.examination_date === 'string' 
        ? new Date(input.examination_date) 
        : input.examination_date;
      updateData.examination_date = examDate.toISOString().split('T')[0];
    }

    // Perform the update
    const result = await db.update(patientsTable)
      .set(updateData)
      .where(eq(patientsTable.id, input.id))
      .returning()
      .execute();

    const updatedPatient = result[0];
    
    // Convert date string back to Date object for return
    return {
      ...updatedPatient,
      examination_date: new Date(updatedPatient.examination_date),
      created_at: updatedPatient.created_at
    };
  } catch (error) {
    console.error('Patient update failed:', error);
    throw error;
  }
};
