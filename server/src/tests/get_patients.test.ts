
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable } from '../db/schema';
import { type GetPatientsInput } from '../schema';
import { getPatients } from '../handlers/get_patients';

describe('getPatients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all patients when no filters provided', async () => {
    // Create test patients - examination_date as string for date column
    await db.insert(patientsTable).values([
      {
        name: 'John Doe',
        phone_number: '123-456-7890',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      },
      {
        name: 'Jane Smith',
        phone_number: '098-765-4321',
        complaint: 'Back pain',
        examination_date: '2024-01-10'
      }
    ]).execute();

    const result = await getPatients();

    expect(result).toHaveLength(2);
    // Should be ordered by examination_date descending
    expect(result[0].name).toBe('John Doe');
    expect(result[1].name).toBe('Jane Smith');
    // Verify examination_date is converted to Date object
    expect(result[0].examination_date).toBeInstanceOf(Date);
    expect(result[0].examination_date).toEqual(new Date('2024-01-15'));
  });

  it('should filter by date range', async () => {
    // Create test patients with different dates
    await db.insert(patientsTable).values([
      {
        name: 'Patient 1',
        phone_number: '111-111-1111',
        complaint: 'Test 1',
        examination_date: '2024-01-05'
      },
      {
        name: 'Patient 2',
        phone_number: '222-222-2222',
        complaint: 'Test 2',
        examination_date: '2024-01-15'
      },
      {
        name: 'Patient 3',
        phone_number: '333-333-3333',
        complaint: 'Test 3',
        examination_date: '2024-01-25'
      }
    ]).execute();

    const input: GetPatientsInput = {
      date_from: '2024-01-10',
      date_to: '2024-01-20'
    };

    const result = await getPatients(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Patient 2');
    expect(result[0].examination_date).toEqual(new Date('2024-01-15'));
  });

  it('should search by name', async () => {
    // Create test patients
    await db.insert(patientsTable).values([
      {
        name: 'John Doe',
        phone_number: '123-456-7890',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      },
      {
        name: 'Jane Smith',
        phone_number: '098-765-4321',
        complaint: 'Back pain',
        examination_date: '2024-01-10'
      }
    ]).execute();

    const input: GetPatientsInput = {
      search: 'john'
    };

    const result = await getPatients(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
  });

  it('should search by phone number', async () => {
    // Create test patients
    await db.insert(patientsTable).values([
      {
        name: 'John Doe',
        phone_number: '123-456-7890',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      },
      {
        name: 'Jane Smith',
        phone_number: '098-765-4321',
        complaint: 'Back pain',
        examination_date: '2024-01-10'
      }
    ]).execute();

    const input: GetPatientsInput = {
      search: '123-456'
    };

    const result = await getPatients(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
    expect(result[0].phone_number).toBe('123-456-7890');
  });

  it('should combine date range and search filters', async () => {
    // Create test patients
    await db.insert(patientsTable).values([
      {
        name: 'John Doe',
        phone_number: '123-456-7890',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      },
      {
        name: 'John Smith',
        phone_number: '111-222-3333',
        complaint: 'Fever',
        examination_date: '2024-01-05'
      },
      {
        name: 'Jane Doe',
        phone_number: '098-765-4321',
        complaint: 'Back pain',
        examination_date: '2024-01-20'
      }
    ]).execute();

    const input: GetPatientsInput = {
      date_from: '2024-01-10',
      date_to: '2024-01-25',
      search: 'john'
    };

    const result = await getPatients(input);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
    expect(result[0].examination_date).toEqual(new Date('2024-01-15'));
  });

  it('should return empty array when no matches found', async () => {
    // Create test patient
    await db.insert(patientsTable).values({
      name: 'John Doe',
      phone_number: '123-456-7890',
      complaint: 'Headache',
      examination_date: '2024-01-15'
    }).execute();

    const input: GetPatientsInput = {
      search: 'nonexistent'
    };

    const result = await getPatients(input);

    expect(result).toHaveLength(0);
  });

  it('should handle empty search string', async () => {
    // Create test patient
    await db.insert(patientsTable).values({
      name: 'John Doe',
      phone_number: '123-456-7890',
      complaint: 'Headache',
      examination_date: '2024-01-15'
    }).execute();

    const input: GetPatientsInput = {
      search: '   ' // whitespace only
    };

    const result = await getPatients(input);

    // Should return all patients when search is empty/whitespace
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('John Doe');
  });

  it('should order results by examination_date descending', async () => {
    // Create test patients with different examination dates
    await db.insert(patientsTable).values([
      {
        name: 'Patient A',
        phone_number: '111-111-1111',
        complaint: 'Test A',
        examination_date: '2024-01-10'
      },
      {
        name: 'Patient B',
        phone_number: '222-222-2222',
        complaint: 'Test B',
        examination_date: '2024-01-20'
      },
      {
        name: 'Patient C',
        phone_number: '333-333-3333',
        complaint: 'Test C',
        examination_date: '2024-01-15'
      }
    ]).execute();

    const result = await getPatients();

    expect(result).toHaveLength(3);
    // Should be ordered by examination_date descending
    expect(result[0].name).toBe('Patient B'); // 2024-01-20
    expect(result[1].name).toBe('Patient C'); // 2024-01-15
    expect(result[2].name).toBe('Patient A'); // 2024-01-10
  });
});
