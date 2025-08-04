import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type CreateTransactionInput } from '../schema';
import { createTransaction } from '../handlers/create_transaction';
import { getTransactionById } from '../handlers/get_transaction_by_id';

const testTransaction: CreateTransactionInput = {
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

describe('getTransactionById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return transaction with items by ID', async () => {
    // Create test transaction
    const createdTransaction = await createTransaction(testTransaction);

    const result = await getTransactionById(createdTransaction.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdTransaction.id);
    expect(result!.metode_pembayaran).toEqual('Tunai');
    expect(result!.total_harga).toEqual(60000); // (5000 * 2) + (50000 * 1)
    expect(result!.tanggal).toBeInstanceOf(Date);
    expect(result!.items).toHaveLength(2);

    // Check items
    const paracetamolItem = result!.items.find(item => item.nama_item === 'Paracetamol');
    expect(paracetamolItem).toBeDefined();
    expect(paracetamolItem!.harga).toEqual(5000);
    expect(paracetamolItem!.jumlah).toEqual(2);
    expect(paracetamolItem!.subtotal).toEqual(10000);

    const konsultasiItem = result!.items.find(item => item.nama_item === 'Konsultasi Dokter');
    expect(konsultasiItem).toBeDefined();
    expect(konsultasiItem!.harga).toEqual(50000);
    expect(konsultasiItem!.jumlah).toEqual(1);
    expect(konsultasiItem!.subtotal).toEqual(50000);
  });

  it('should return null for non-existent transaction ID', async () => {
    const result = await getTransactionById(99999);
    expect(result).toBeNull();
  });

  it('should return correct numeric types', async () => {
    const createdTransaction = await createTransaction(testTransaction);
    const result = await getTransactionById(createdTransaction.id);

    expect(result).toBeDefined();
    expect(typeof result!.total_harga).toBe('number');
    expect(typeof result!.items[0].harga).toBe('number');
    expect(typeof result!.items[0].subtotal).toBe('number');
    expect(typeof result!.items[0].jumlah).toBe('number');
  });
});