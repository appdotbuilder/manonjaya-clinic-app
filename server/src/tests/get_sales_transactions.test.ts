
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { salesTransactionsTable } from '../db/schema';
import { type GetSalesTransactionsInput } from '../schema';
import { getSalesTransactions } from '../handlers/get_sales_transactions';

describe('getSalesTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all transactions when no filters provided', async () => {
    // Create test transactions with explicit timestamps to ensure ordering
    const firstTime = new Date('2024-01-01T10:00:00Z');
    const secondTime = new Date('2024-01-01T11:00:00Z');

    await db.insert(salesTransactionsTable).values([
      {
        item_service_name: 'Medical Consultation',
        price: '150.00',
        quantity: 1,
        total: '150.00',
        created_at: firstTime
      },
      {
        item_service_name: 'Blood Test',
        price: '75.50',
        quantity: 2,
        total: '151.00',
        created_at: secondTime
      }
    ]).execute();

    const result = await getSalesTransactions();

    expect(result).toHaveLength(2);
    expect(result[0].item_service_name).toEqual('Blood Test'); // Should be ordered by created_at desc
    expect(result[0].price).toEqual(75.50);
    expect(result[0].total).toEqual(151.00);
    expect(typeof result[0].price).toBe('number');
    expect(typeof result[0].total).toBe('number');
    expect(result[0].quantity).toEqual(2);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter by date range correctly', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Create transaction from yesterday
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Old Transaction',
      price: '100.00',
      quantity: 1,
      total: '100.00',
      created_at: yesterday
    }).execute();

    // Create transaction from today
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Recent Transaction',
      price: '200.00',
      quantity: 1,
      total: '200.00'
    }).execute();

    const filters: GetSalesTransactionsInput = {
      date_from: new Date().toISOString().split('T')[0], // Today's date
      date_to: tomorrow.toISOString().split('T')[0]
    };

    const result = await getSalesTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].item_service_name).toEqual('Recent Transaction');
    expect(result[0].price).toEqual(200.00);
  });

  it('should search by item/service name case-insensitively', async () => {
    await db.insert(salesTransactionsTable).values([
      {
        item_service_name: 'Medical Consultation',
        price: '150.00',
        quantity: 1,
        total: '150.00'
      },
      {
        item_service_name: 'Blood Test Analysis',
        price: '75.50',
        quantity: 1,
        total: '75.50'
      },
      {
        item_service_name: 'X-Ray Examination',
        price: '200.00',
        quantity: 1,
        total: '200.00'
      }
    ]).execute();

    const filters: GetSalesTransactionsInput = {
      search: 'medical'
    };

    const result = await getSalesTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].item_service_name).toEqual('Medical Consultation');
    expect(result[0].price).toEqual(150.00);
  });

  it('should combine date and search filters', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Create old consultation
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Medical Consultation',
      price: '150.00',
      quantity: 1,
      total: '150.00',
      created_at: yesterday
    }).execute();

    // Create recent consultation
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Medical Consultation',
      price: '175.00',
      quantity: 1,
      total: '175.00'
    }).execute();

    // Create recent blood test
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Blood Test',
      price: '100.00',
      quantity: 1,
      total: '100.00'
    }).execute();

    const filters: GetSalesTransactionsInput = {
      date_from: new Date().toISOString().split('T')[0], // Today's date
      search: 'consultation'
    };

    const result = await getSalesTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].item_service_name).toEqual('Medical Consultation');
    expect(result[0].price).toEqual(175.00);
  });

  it('should return empty array when no transactions match filters', async () => {
    await db.insert(salesTransactionsTable).values({
      item_service_name: 'Medical Consultation',
      price: '150.00',
      quantity: 1,
      total: '150.00'
    }).execute();

    const filters: GetSalesTransactionsInput = {
      search: 'nonexistent'
    };

    const result = await getSalesTransactions(filters);

    expect(result).toHaveLength(0);
  });

  it('should order results by created_at descending', async () => {
    const firstTime = new Date('2024-01-01T10:00:00Z');
    const secondTime = new Date('2024-01-01T11:00:00Z');
    const thirdTime = new Date('2024-01-01T12:00:00Z');

    await db.insert(salesTransactionsTable).values([
      {
        item_service_name: 'First Transaction',
        price: '100.00',
        quantity: 1,
        total: '100.00',
        created_at: firstTime
      },
      {
        item_service_name: 'Third Transaction',
        price: '300.00',
        quantity: 1,
        total: '300.00',
        created_at: thirdTime
      },
      {
        item_service_name: 'Second Transaction',
        price: '200.00',
        quantity: 1,
        total: '200.00',
        created_at: secondTime
      }
    ]).execute();

    const result = await getSalesTransactions();

    expect(result).toHaveLength(3);
    expect(result[0].item_service_name).toEqual('Third Transaction');
    expect(result[1].item_service_name).toEqual('Second Transaction');
    expect(result[2].item_service_name).toEqual('First Transaction');
  });
});
