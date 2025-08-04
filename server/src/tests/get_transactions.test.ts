import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type CreateTransactionInput, type GetTransactionsInput } from '../schema';
import { createTransaction } from '../handlers/create_transaction';
import { getTransactions } from '../handlers/get_transactions';

const testTransaction1: CreateTransactionInput = {
  metode_pembayaran: 'Tunai',
  items: [
    {
      nama_item: 'Paracetamol',
      harga: 5000,
      jumlah: 2
    }
  ]
};

const testTransaction2: CreateTransactionInput = {
  metode_pembayaran: 'Debit',
  items: [
    {
      nama_item: 'Konsultasi Dokter',
      harga: 50000,
      jumlah: 1
    },
    {
      nama_item: 'Vitamin',
      harga: 10000,
      jumlah: 3
    }
  ]
};

describe('getTransactions', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no transactions exist', async () => {
    const result = await getTransactions({});
    expect(result).toEqual([]);
  });

  it('should return all transactions with their items', async () => {
    // Create test transactions
    await createTransaction(testTransaction1);
    await createTransaction(testTransaction2);

    const result = await getTransactions({});

    expect(result).toHaveLength(2);

    // Check first transaction (should be ordered by date desc, so latest first)
    const transaction1 = result[0];
    expect(transaction1.metode_pembayaran).toEqual('Debit');
    expect(transaction1.total_harga).toEqual(80000); // 50000 + (10000 * 3)
    expect(transaction1.items).toHaveLength(2);
    expect(transaction1.tanggal).toBeInstanceOf(Date);

    // Check second transaction
    const transaction2 = result[1];
    expect(transaction2.metode_pembayaran).toEqual('Tunai');
    expect(transaction2.total_harga).toEqual(10000); // 5000 * 2
    expect(transaction2.items).toHaveLength(1);

    // Check items of first transaction
    const konsultasiItem = transaction1.items.find(item => item.nama_item === 'Konsultasi Dokter');
    expect(konsultasiItem).toBeDefined();
    expect(konsultasiItem!.harga).toEqual(50000);
    expect(konsultasiItem!.jumlah).toEqual(1);
    expect(konsultasiItem!.subtotal).toEqual(50000);

    const vitaminItem = transaction1.items.find(item => item.nama_item === 'Vitamin');
    expect(vitaminItem).toBeDefined();
    expect(vitaminItem!.harga).toEqual(10000);
    expect(vitaminItem!.jumlah).toEqual(3);
    expect(vitaminItem!.subtotal).toEqual(30000);
  });

  it('should filter transactions by payment method', async () => {
    // Create test transactions
    await createTransaction(testTransaction1); // Tunai
    await createTransaction(testTransaction2); // Debit

    const filters: GetTransactionsInput = {
      metode_pembayaran: 'Tunai'
    };

    const result = await getTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].metode_pembayaran).toEqual('Tunai');
    expect(result[0].total_harga).toEqual(10000);
  });

  it('should filter transactions by date range', async () => {
    // Create a transaction
    const transaction = await createTransaction(testTransaction1);

    // Test with date range that includes the transaction
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filters: GetTransactionsInput = {
      date_from: yesterday.toISOString().split('T')[0],
      date_to: tomorrow.toISOString().split('T')[0]
    };

    const result = await getTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(transaction.id);

    // Test with date range that excludes the transaction
    const oldDate = new Date(today);
    oldDate.setDate(oldDate.getDate() - 10);
    const veryOldDate = new Date(today);
    veryOldDate.setDate(veryOldDate.getDate() - 20);

    const excludeFilters: GetTransactionsInput = {
      date_from: veryOldDate.toISOString().split('T')[0],
      date_to: oldDate.toISOString().split('T')[0]
    };

    const excludeResult = await getTransactions(excludeFilters);
    expect(excludeResult).toHaveLength(0);
  });

  it('should handle multiple filters combined', async () => {
    // Create transactions with different payment methods
    await createTransaction(testTransaction1); // Tunai
    await createTransaction(testTransaction2); // Debit

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filters: GetTransactionsInput = {
      metode_pembayaran: 'Debit',
      date_from: yesterday.toISOString().split('T')[0],
      date_to: tomorrow.toISOString().split('T')[0]
    };

    const result = await getTransactions(filters);

    expect(result).toHaveLength(1);
    expect(result[0].metode_pembayaran).toEqual('Debit');
    expect(result[0].total_harga).toEqual(80000);
  });
});