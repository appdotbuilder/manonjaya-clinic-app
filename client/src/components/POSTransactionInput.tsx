import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateTransactionInput } from '../../../server/src/schema';

interface TransactionItem {
  nama_item: string;
  harga: number;
  jumlah: number;
}

interface POSTransactionInputProps {
  onTransactionCreated: () => void;
}

export function POSTransactionInput({ onTransactionCreated }: POSTransactionInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState<string>('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState<TransactionItem>({
    nama_item: '',
    harga: 0,
    jumlah: 1
  });

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  };

  const addItem = () => {
    if (currentItem.nama_item.trim() && currentItem.harga > 0 && currentItem.jumlah > 0) {
      setItems(prev => [...prev, { ...currentItem }]);
      setCurrentItem({
        nama_item: '',
        harga: 0,
        jumlah: 1
      });
    }
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metodePembayaran || items.length === 0) {
      alert('Silakan pilih metode pembayaran dan tambahkan minimal satu item!');
      return;
    }

    setIsLoading(true);
    try {
      const transactionData: CreateTransactionInput = {
        metode_pembayaran: metodePembayaran,
        items: items
      };

      await trpc.createTransaction.mutate(transactionData);
      
      // Reset form
      setMetodePembayaran('');
      setItems([]);
      setCurrentItem({
        nama_item: '',
        harga: 0,
        jumlah: 1
      });
      
      onTransactionCreated();
      alert('Transaksi berhasil dibuat! 🎉');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Gagal membuat transaksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">💳 POS - Input Transaksi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Metode Pembayaran</label>
            <Select value={metodePembayaran} onValueChange={setMetodePembayaran}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tunai">💵 Tunai</SelectItem>
                <SelectItem value="Debit">💳 Debit</SelectItem>
                <SelectItem value="Kredit">💳 Kredit</SelectItem>
                <SelectItem value="Transfer">🏦 Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Add Item Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Tambah Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Input
                  placeholder="Nama item/layanan"
                  value={currentItem.nama_item}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentItem((prev: TransactionItem) => ({ ...prev, nama_item: e.target.value }))
                  }
                />
              </div>
              <Input
                type="number"
                placeholder="Harga"
                value={currentItem.harga || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentItem((prev: TransactionItem) => ({ ...prev, harga: parseFloat(e.target.value) || 0 }))
                }
                min="0"
                step="0.01"
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={currentItem.jumlah}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCurrentItem((prev: TransactionItem) => ({ ...prev, jumlah: parseInt(e.target.value) || 1 }))
                  }
                  min="1"
                  className="flex-1"
                />
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  ➕
                </Button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Daftar Item ({items.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="font-medium">{item.nama_item}</div>
                      <div className="text-sm text-gray-600">
                        Rp {item.harga.toLocaleString('id-ID')} × {item.jumlah} = 
                        <span className="font-medium ml-1">
                          Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      🗑️
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          {items.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Pembayaran:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Rp {calculateTotal().toLocaleString('id-ID')}
                </Badge>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading || !metodePembayaran || items.length === 0}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Memproses...' : `💰 Buat Transaksi (${items.length} item)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}