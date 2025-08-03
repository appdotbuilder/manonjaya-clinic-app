
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Search, DollarSign,Package, Hash, Trash2, Calculator } from 'lucide-react';
import type { SalesTransaction, GetSalesTransactionsInput } from '../../../server/src/schema';

export function SalesList() {
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<GetSalesTransactionsInput>({
    search: '',
    date_from: '',
    date_to: ''
  });

  const loadSalesTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getSalesTransactions.query(filters);
      setSales(result);
    } catch (error) {
      console.error('Failed to load sales transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSalesTransactions();
  }, [loadSalesTransactions]);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await trpc.deleteSalesTransaction.mutate({ id });
      setSales((prev: SalesTransaction[]) => prev.filter(s => s.id !== id));
      alert('✅ Transaksi berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete sales transaction:', error);
      alert('❌ Gagal menghapus transaksi');
    }
  };

  const handleSearch = () => {
    loadSalesTransactions();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      date_from: '',
      date_to: ''
    });
  };

  // Calculate total sales
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter Data Penjualan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Cari nama item/layanan..."
                value={filters.search || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev: GetSalesTransactionsInput) => ({ 
                    ...prev, 
                    search: e.target.value || undefined 
                  }))
                }
              />
            </div>
            <Input
              type="date"
              placeholder="Dari tanggal"
              value={filters.date_from || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((prev: GetSalesTransactionsInput) => ({ 
                  ...prev, 
                  date_from: e.target.value || undefined 
                }))
              }
            />
            <Input
              type="date"
              placeholder="Sampai tanggal"
              value={filters.date_to || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFilters((prev: GetSalesTransactionsInput) => ({ 
                  ...prev, 
                  date_to: e.target.value || undefined 
                }))
              }
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              🔍 Cari
            </Button>
            <Button onClick={clearFilters} variant="outline">
              🗑️ Bersihkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Total Sales Summary */}
      {sales.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-green-700 font-medium">
                <Calculator className="w-5 h-5" />
                Total Penjualan ({sales.length} transaksi)
              </span>
              <span className="text-2xl font-bold text-green-800">
                Rp {totalSales.toLocaleString('id-ID')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Data Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data penjualan ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sales.map((sale: SalesTransaction) => (
                <div key={sale.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-green-900 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {sale.item_service_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Rp {sale.price.toLocaleString('id-ID')} per unit
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          {sale.quantity} unit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">
                          Rp {sale.total.toLocaleString('id-ID')}
                        </div>
                        <Badge variant="outline">
                          ID: {sale.id}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => handleDelete(sale.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-3">
                    Transaksi: {sale.created_at.toLocaleDateString('id-ID')} {sale.created_at.toLocaleTimeString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
