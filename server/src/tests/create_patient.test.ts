
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type CreatePatientInput } from '../schema';
import { createPatient } from '../handlers/create_patient';
import { eq } from 'drizzle-orm';

// Test input with string date
const testInputWithStringDate: CreatePatientInput = {
  name: 'John Doe',
  phone_number: '+1234567890',
  complaint: 'Headache and fever',
  examination_date: '2024-01-15'
};

// Test input with Date object
const testInputWithDateObject: CreatePatientInput = {
  name: 'Jane Smith',
  phone_number: '+9876543210',
  complaint: 'Back pain',
  examination_date: new Date('2024-02-20')
};

describe('createPatient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a patient with string date', async () => {
    const result = await createPatient(testInputWithStringDate);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.phone_number).toEqual('+1234567890');
    expect(result.complaint).toEqual('Headache and fever');
    expect(result.examination_date).toBeInstanceOf(Date);
    expect(result.examination_date.toISOString().split('T')[0]).toEqual('2024-01-15');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a patient with Date object', async () => {
    const result = await createPatient(testInputWithDateObject);

    // Basic field validation
    expect(result.name).toEqual('Jane Smith');
    expect(result.phone_number).toEqual('+9876543210');
    expect(result.complaint).toEqual('Back pain');
    expect(result.examination_date).toBeInstanceOf(Date);
    expect(result.examination_date.toISOString().split('T')[0]).toEqual('2024-02-20');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save patient to database', async () => {
    const result = await createPatient(testInputWithStringDate);

    // Query using proper drizzle syntax
    const patients = await db.select()
      .from(patientsTable)
      .where(eq(patientsTable.id, result.id))
      .execute();

    expect(patients).toHaveLength(1);
    expect(patients[0].name).toEqual('John Doe');
    expect(patients[0].phone_number).toEqual('+1234567890');
    expect(patients[0].complaint).toEqual('Headache and fever');
    expect(new Date(patients[0].examination_date)).toBeInstanceOf(Date);
    expect(patients[0].examination_date).toEqual('2024-01-15');
    expect(patients[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple patients creation', async () => {
    const result1 = await createPatient(testInputWithStringDate);
    const result2 = await createPatient(testInputWithDateObject);

    // Verify both patients were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    
    // Query all patients
    const allPatients = await db.select()
      .from(patientsTable)
      .execute();

    expect(allPatients).toHaveLength(2);
    
    // Find patients by ID
    const patient1 = allPatients.find(p => p.id === result1.id);
    const patient2 = allPatients.find(p => p.id === result2.id);
    
    expect(patient1?.name).toEqual('John Doe');
    expect(patient2?.name).toEqual('Jane Smith');
  });
});
