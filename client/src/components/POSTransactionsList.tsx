import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import type { TransactionWithItems, GetTransactionsInput } from '../../../server/src/schema';

interface POSTransactionsListProps {
  refreshTrigger?: number;
}

export function POSTransactionsList({ refreshTrigger }: POSTransactionsListProps) {
  const [transactions, setTransactions] = useState<TransactionWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<GetTransactionsInput>({
    date_from: '',
    date_to: '',
    metode_pembayaran: ''
  });

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getTransactions.query(filters);
      setTransactions(result);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions, refreshTrigger]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Tunai': return '💵';
      case 'Debit': return '💳';
      case 'Kredit': return '💳';
      case 'Transfer': return '🏦';
      default: return '💰';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Tunai': return 'bg-green-100 text-green-800';
      case 'Debit': return 'bg-blue-100 text-blue-800';
      case 'Kredit': return 'bg-purple-100 text-purple-800';
      case 'Transfer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleTransactionDetails = (transactionId: number) => {
    setExpandedTransaction(expandedTransaction === transactionId ? null : transactionId);
  };

  const clearFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      metode_pembayaran: ''
    });
  };

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total_harga, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">📊 Daftar Transaksi POS</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                type="date"
                placeholder="Dari tanggal"
                value={filters.date_from || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev: GetTransactionsInput) => ({ ...prev, date_from: e.target.value || undefined }))
                }
              />
              <Input
                type="date"
                placeholder="Sampai tanggal"
                value={filters.date_to || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev: GetTransactionsInput) => ({ ...prev, date_to: e.target.value || undefined }))
                }
              />
              <Select 
                value={filters.metode_pembayaran || 'all'} 
                onValueChange={(value: string) =>
                  setFilters((prev: GetTransactionsInput) => ({ ...prev, metode_pembayaran: value === 'all' ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="Tunai">💵 Tunai</SelectItem>
                  <SelectItem value="Debit">💳 Debit</SelectItem>
                  <SelectItem value="Kredit">💳 Kredit</SelectItem>
                  <SelectItem value="Transfer">🏦 Transfer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={clearFilters} variant="outline">
                🔄 Reset
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">
                Total {transactions.length} transaksi
              </span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Revenue: Rp {totalRevenue.toLocaleString('id-ID')}
              </Badge>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-gray-500">Memuat transaksi...</div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && transactions.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Belum ada transaksi</div>
              <div className="text-sm text-gray-400">Buat transaksi pertama Anda!</div>
            </div>
          )}

          {/* Transactions List */}
          {!isLoading && transactions.length > 0 && (
            <div className="space-y-4">
              {transactions.map((transaction: TransactionWithItems) => (
                <Card key={transaction.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getPaymentMethodColor(transaction.metode_pembayaran)}>
                            {getPaymentMethodIcon(transaction.metode_pembayaran)} {transaction.metode_pembayaran}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            #{transaction.id}
                          </span>
                          <span className="text-sm text-gray-500">
                            {transaction.tanggal.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-lg">
                              Rp {transaction.total_harga.toLocaleString('id-ID')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.items.length} item
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTransactionDetails(transaction.id)}
                          >
                            {expandedTransaction === transaction.id ? '🔼 Tutup' : '🔽 Detail'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Items Details */}
                    {expandedTransaction === transaction.id && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm text-gray-700">Detail Item:</h4>
                          {transaction.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="font-medium">{item.nama_item}</div>
                                <div className="text-sm text-gray-600">
                                  Rp {item.harga.toLocaleString('id-ID')} × {item.jumlah}
                                </div>
                              </div>
                              <div className="font-medium">
                                Rp {item.subtotal.toLocaleString('id-ID')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}