
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { patientsTable, salesTransactionsTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';
import { sql } from 'drizzle-orm';

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats when no data exists', async () => {
    const result = await getDashboardStats();

    expect(result.total_patients_today).toEqual(0);
    expect(result.total_patients_this_month).toEqual(0);
    expect(result.total_sales_today).toEqual(0);
    expect(result.total_sales_this_month).toEqual(0);
    expect(result.recent_patients).toEqual([]);
    expect(result.recent_sales).toEqual([]);
  });

  it('should count patients created today', async () => {
    // Create test patients
    await db.insert(patientsTable).values([
      {
        name: 'Patient 1',
        phone_number: '123456789',
        complaint: 'Headache',
        examination_date: '2024-01-15'
      },
      {
        name: 'Patient 2',
        phone_number: '987654321',
        complaint: 'Fever',
        examination_date: '2024-01-16'
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_patients_today).toEqual(2);
    expect(result.total_patients_this_month).toEqual(2);
  });

  it('should calculate sales totals correctly', async () => {
    // Create test sales transactions
    await db.insert(salesTransactionsTable).values([
      {
        item_service_name: 'Medicine A',
        price: '25.50',
        quantity: 2,
        total: '51.00'
      },
      {
        item_service_name: 'Consultation',
        price: '100.00',
        quantity: 1,
        total: '100.00'
      }
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_sales_today).toEqual(151.00);
    expect(result.total_sales_this_month).toEqual(151.00);
    expect(typeof result.total_sales_today).toBe('number');
    expect(typeof result.total_sales_this_month).toBe('number');
  });

  it('should return recent patients in correct format', async () => {
    // Create test patients with slight delay to ensure different timestamps
    await db.insert(patientsTable).values({
      name: 'John Doe',
      phone_number: '123456789',
      complaint: 'Headache',
      examination_date: '2024-01-15'
    }).execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(patientsTable).values({
      name: 'Jane Smith',
      phone_number: '987654321',
      complaint: 'Fever',
      examination_date: '2024-01-16'
    }).execute();

    const result = await getDashboardStats();

    expect(result.recent_patients).toHaveLength(2);
    
    // Verify structure without assuming specific order
    const patientNames = result.recent_patients.map(p => p.name);
    expect(patientNames).toContain('John Doe');
    expect(patientNames).toContain('Jane Smith');
    
    // Check first patient structure (regardless of which one it is)
    const firstPatient = result.recent_patients[0];
    expect(firstPatient.examination_date).toBeInstanceOf(Date);
    expect(firstPatient.id).toBeDefined();
    expect(typeof firstPatient.id).toBe('number');
    expect(typeof firstPatient.name).toBe('string');
  });

  it('should return recent sales in correct format', async () => {
    // Create test sales transactions with slight delay
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Medicine A',
      price: '25.50',
      quantity: 2,
      total: '51.00'
    }).execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Consultation',
      price: '100.00',
      quantity: 1,
      total: '100.00'
    }).execute();

    const result = await getDashboardStats();

    expect(result.recent_sales).toHaveLength(2);
    
    // Verify structure without assuming specific order
    const salesNames = result.recent_sales.map(s => s.item_service_name);
    expect(salesNames).toContain('Medicine A');
    expect(salesNames).toContain('Consultation');
    
    // Check first sale structure (regardless of which one it is)
    const firstSale = result.recent_sales[0];
    expect(typeof firstSale.total).toBe('number');
    expect(firstSale.total).toBeGreaterThan(0);
    expect(firstSale.created_at).toBeInstanceOf(Date);
    expect(firstSale.id).toBeDefined();
    expect(typeof firstSale.id).toBe('number');
    expect(typeof firstSale.item_service_name).toBe('string');
  });

  it('should limit recent items to 5 entries', async () => {
    // Create 7 test patients
    const patients = Array.from({ length: 7 }, (_, i) => ({
      name: `Patient ${i + 1}`,
      phone_number: `12345678${i}`,
      complaint: `Complaint ${i + 1}`,
      examination_date: '2024-01-15'
    }));

    await db.insert(patientsTable).values(patients).execute();

    // Create 7 test sales
    const sales = Array.from({ length: 7 }, (_, i) => ({
      item_service_name: `Item ${i + 1}`,
      price: '10.00',
      quantity: 1,
      total: '10.00'
    }));

    await db.insert(salesTransactionsTable).values(sales).execute();

    const result = await getDashboardStats();

    expect(result.recent_patients).toHaveLength(5);
    expect(result.recent_sales).toHaveLength(5);
    expect(result.total_patients_today).toEqual(7);
    expect(result.total_sales_today).toEqual(70.00);
  });

  it('should handle date boundaries correctly', async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create patient with yesterday's timestamp by directly manipulating created_at
    await db.insert(patientsTable).values({
      name: 'Yesterday Patient',
      phone_number: '123456789',
      complaint: 'Old complaint',
      examination_date: '2024-01-15'
    }).execute();

    // Update the created_at to yesterday using proper sql syntax
    await db.execute(sql`
      UPDATE patients 
      SET created_at = ${yesterday.toISOString()} 
      WHERE name = 'Yesterday Patient'
    `);

    // Create today's patient
    await db.insert(patientsTable).values({
      name: 'Today Patient',
      phone_number: '987654321',
      complaint: 'New complaint',
      examination_date: '2024-01-16'
    }).execute();

    const result = await getDashboardStats();

    // Should only count today's patient
    expect(result.total_patients_today).toEqual(1);
    // Should count both for this month
    expect(result.total_patients_this_month).toEqual(2);
  });
});
