import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { transactionsTable, transactionItemsTable } from '../db/schema';
import { type CreateTransactionInput } from '../schema';
import { createTransaction } from '../handlers/create_transaction';
import { eq } from 'drizzle-orm';

const testInput: CreateTransactionInput = {
  metode_pembayaran: 'Tunai',
  items: [
    {
      nama_item: 'Paracetamol',
      harga: 5000,
      jumlah: 2
    },
    {
      nama_item: 'Konsultasi Dokter',
      harga: 50000,
      jumlah: 1
    }
  ]
};

describe('createTransaction', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a transaction with items', async () => {
    const result = await createTransaction(testInput);

    // Basic field validation for transaction
    expect(result.metode_pembayaran).toEqual('Tunai');
    expect(result.total_harga).toEqual(60000); // (5000 * 2) + (50000 * 1)
    expect(result.id).toBeDefined();
    expect(result.tanggal).toBeInstanceOf(Date);
    expect(result.items).toHaveLength(2);

    // Validate first item
    expect(result.items[0].nama_item).toEqual('Paracetamol');
    expect(result.items[0].harga).toEqual(5000);
    expect(result.items[0].jumlah).toEqual(2);
    expect(result.items[0].subtotal).toEqual(10000);
    expect(result.items[0].transaction_id).toEqual(result.id);

    // Validate second item
    expect(result.items[1].nama_item).toEqual('Konsultasi Dokter');
    expect(result.items[1].harga).toEqual(50000);
    expect(result.items[1].jumlah).toEqual(1);
    expect(result.items[1].subtotal).toEqual(50000);
    expect(result.items[1].transaction_id).toEqual(result.id);
  });

  it('should save transaction to database', async () => {
    const result = await createTransaction(testInput);

    // Query transaction from database
    const transactions = await db.select()
      .from(transactionsTable)
      .where(eq(transactionsTable.id, result.id))
      .execute();

    expect(transactions).toHaveLength(1);
    expect(transactions[0].metode_pembayaran).toEqual('Tunai');
    expect(parseFloat(transactions[0].total_harga)).toEqual(60000);
    expect(transactions[0].tanggal).toBeInstanceOf(Date);
  });

  it('should save transaction items to database', async () => {
    const result = await createTransaction(testInput);

    // Query transaction items from database
    const items = await db.select()
      .from(transactionItemsTable)
      .where(eq(transactionItemsTable.transaction_id, result.id))
      .execute();

    expect(items).toHaveLength(2);
    
    // Check first item
    const firstItem = items.find(item => item.nama_item === 'Paracetamol');
    expect(firstItem).toBeDefined();
    expect(parseFloat(firstItem!.harga)).toEqual(5000);
    expect(firstItem!.jumlah).toEqual(2);
    expect(parseFloat(firstItem!.subtotal)).toEqual(10000);

    // Check second item
    const secondItem = items.find(item => item.nama_item === 'Konsultasi Dokter');
    expect(secondItem).toBeDefined();
    expect(parseFloat(secondItem!.harga)).toEqual(50000);
    expect(secondItem!.jumlah).toEqual(1);
    expect(parseFloat(secondItem!.subtotal)).toEqual(50000);
  });

  it('should calculate total correctly with single item', async () => {
    const singleItemInput: CreateTransactionInput = {
      metode_pembayaran: 'Debit',
      items: [
        {
          nama_item: 'Vitamin C',
          harga: 15000,
          jumlah: 3
        }
      ]
    };

    const result = await createTransaction(singleItemInput);

    expect(result.total_harga).toEqual(45000); // 15000 * 3
    expect(result.items).toHaveLength(1);
    expect(result.items[0].subtotal).toEqual(45000);
  });

  it('should handle different payment methods', async () => {
    const creditInput: CreateTransactionInput = {
      metode_pembayaran: 'Kredit',
      items: [
        {
          nama_item: 'Antibiotik',
          harga: 25000,
          jumlah: 1
        }
      ]
    };

    const result = await createTransaction(creditInput);

    expect(result.metode_pembayaran).toEqual('Kredit');
    expect(result.total_harga).toEqual(25000);
  });
});