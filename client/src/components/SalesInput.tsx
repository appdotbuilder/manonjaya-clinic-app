
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Package, DollarSign, Hash, Calculator } from 'lucide-react';
import type { CreateSalesTransactionInput } from '../../../server/src/schema';

export function SalesInput() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSalesTransactionInput>({
    item_service_name: '',
    price: 0,
    quantity: 1
  });

  // Calculate total whenever price or quantity changes
  const total = formData.price * formData.quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await trpc.createSalesTransaction.mutate(formData);
      
      // Reset form after successful submission
      setFormData({
        item_service_name: '',
        price: 0,
        quantity: 1
      });

      // Show success message
      alert('✅ Transaksi penjualan berhasil dicatat!');
    } catch (error) {
      console.error('Failed to create sales transaction:', error);
      alert('❌ Gagal mencatat transaksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item/Service Name Field */}
          <div className="space-y-2">
            <Label htmlFor="item_service_name" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Nama Item/Layanan
            </Label>
            <Input
              id="item_service_name"
              value={formData.item_service_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateSalesTransactionInput) => ({ 
                  ...prev, 
                  item_service_name: e.target.value 
                }))
              }
              placeholder="Contoh: Paracetamol 500mg, Konsultasi Dokter, dll."
              required
              className="focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Price Field */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Harga Satuan (Rp)
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateSalesTransactionInput) => ({ 
                    ...prev, 
                    price: parseFloat(e.target.value) || 0 
                  }))
                }
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Quantity Field */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Jumlah
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateSalesTransactionInput) => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 1 
                  }))
                }
                placeholder="1"
                min="1"
                required
                className="focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Total Display */}
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-700 font-medium">
                <Calculator className="w-5 h-5" />
                Total
              </span>
              <span className="text-2xl font-bold text-green-800">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isLoading ? '⏳ Menyimpan...' : '💰 Catat Transaksi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
