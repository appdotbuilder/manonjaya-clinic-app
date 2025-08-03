
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type Patient, type GetPatientsInput } from '../schema';
import { and, gte, lte, or, ilike, desc, SQL } from 'drizzle-orm';

export const getPatients = async (input?: GetPatientsInput): Promise<Patient[]> => {
  try {
    const conditions: SQL<unknown>[] = [];

    // Date range filtering - examination_date is stored as string in date column
    if (input?.date_from) {
      conditions.push(gte(patientsTable.examination_date, input.date_from));
    }

    if (input?.date_to) {
      conditions.push(lte(patientsTable.examination_date, input.date_to));
    }

    // Search filtering - search by name or phone number
    if (input?.search && input.search.trim()) {
      const searchTerm = `%${input.search.trim()}%`;
      const searchCondition = or(
        ilike(patientsTable.name, searchTerm),
        ilike(patientsTable.phone_number, searchTerm)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Build final query with all conditions at once
    const results = conditions.length > 0
      ? await db.select()
          .from(patientsTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .orderBy(desc(patientsTable.examination_date))
          .execute()
      : await db.select()
          .from(patientsTable)
          .orderBy(desc(patientsTable.examination_date))
          .execute();

    // Convert the results to match the Patient schema - examination_date string to Date
    return results.map(patient => ({
      ...patient,
      examination_date: new Date(patient.examination_date), // Convert string to Date
      created_at: patient.created_at // This is already a Date from timestamp column
    }));
  } catch (error) {
    console.error('Failed to get patients:', error);
    throw error;
  }
};
