
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdatePatientInput } from '../schema';
import { updatePatient } from '../handlers/update_patient';

describe('updatePatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a test patient directly in database
  const createTestPatient = async (): Promise<number> => {
    const result = await db.insert(patientsTable)
      .values({
        name: 'John Doe',
        phone_number: '1234567890',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      })
      .returning()
      .execute();
    
    return result[0].id;
  };

  it('should update patient name', async () => {
    const patientId = await createTestPatient();
    
    const updateInput: UpdatePatientInput = {
      id: patientId,
      name: 'Jane Smith'
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.name).toEqual('Jane Smith');
    expect(result.phone_number).toEqual('1234567890'); // Unchanged
    expect(result.complaint).toEqual('Headache'); // Unchanged
    expect(result.examination_date).toEqual(new Date('2024-01-15')); // Unchanged
  });

  it('should update multiple fields', async () => {
    const patientId = await createTestPatient();
    
    const updateInput: UpdatePatientInput = {
      id: patientId,
      name: 'Jane Smith',
      phone_number: '0987654321',
      complaint: 'Back pain',
      examination_date: '2024-02-20'
    };

    const result = await updatePatient(updateInput);

    expect(result.id).toEqual(patientId);
    expect(result.name).toEqual('Jane Smith');
    expect(result.phone_number).toEqual('0987654321');
    expect(result.complaint).toEqual('Back pain');
    expect(result.examination_date).toEqual(new Date('2024-02-20'));
  });

  it('should update examination_date with Date object', async () => {
    const patientId = await createTestPatient();
    
    const examDate = new Date('2024-03-10');
    const updateInput: UpdatePatientInput = {
      id: patientId,
      examination_date: examDate
    };

    const result = await updatePatient(updateInput);

    expect(result.examination_date).toEqual(new Date('2024-03-10'));
  });

  it('should save updated data to database', async () => {
    const patientId = await createTestPatient();
    
    const updateInput: UpdatePatientInput = {
      id: patientId,
      name: 'Updated Name',
      complaint: 'Updated complaint'
    };

    await updatePatient(updateInput);

    // Verify in database
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, patientId))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].name).toEqual('Updated Name');
    expect(patients[0].complaint).toEqual('Updated complaint');
    expect(patients[0].phone_number).toEqual('1234567890'); // Unchanged
  });

  it('should throw error for non-existent patient', async () => {
    const updateInput: UpdatePatientInput = {
      id: 99999,
      name: 'Non-existent Patient'
    };

    await expect(updatePatient(updateInput)).rejects.toThrow(/Patient with id 99999 not found/i);
  });

  it('should handle partial updates correctly', async () => {
    const patientId = await createTestPatient();
    
    // Update only phone number
    const updateInput: UpdatePatientInput = {
      id: patientId,
      phone_number: '5555555555'
    };

    const result = await updatePatient(updateInput);

    expect(result.phone_number).toEqual('5555555555');
    expect(result.name).toEqual('John Doe'); // Original value preserved
    expect(result.complaint).toEqual('Headache'); // Original value preserved
    expect(result.examination_date).toEqual(new Date('2024-01-15')); // Original value preserved
  });
});
