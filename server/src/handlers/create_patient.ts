
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput, type Patient } from '../schema';

export const createPatient = async (input: CreatePatientInput): Promise<Patient> => {
  try {
    // Convert examination_date to Date object if it's a string
    const examinationDate = typeof input.examination_date === 'string' 
      ? new Date(input.examination_date) 
      : input.examination_date;

    // Insert patient record - date column expects string format
    const result = await db.insert(patientsTable)
      .values({
        name: input.name,
        phone_number: input.phone_number,
        complaint: input.complaint,
        examination_date: examinationDate.toISOString().split('T')[0] // Convert Date to YYYY-MM-DD string
      })
      .returning()
      .execute();

    // Convert the date string back to Date object for the return type
    const patient = result[0];
    return {
      ...patient,
      examination_date: new Date(patient.examination_date)
    };
  } catch (error) {
    console.error('Patient creation failed:', error);
    throw error;
  }
};
