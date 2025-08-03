
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Phone, FileText, Trash2 } from 'lucide-react';
import type { Patient, GetPatientsInput } from '../../../server/src/schema';

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<GetPatientsInput>({
    search: '',
    date_from: '',
    date_to: ''
  });

  const loadPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getPatients.query(filters);
      setPatients(result);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pasien ini?')) {
      return;
    }

    try {
      await trpc.deletePatient.mutate({ id });
      setPatients((prev: Patient[]) => prev.filter(p => p.id !== id));
      alert('✅ Data pasien berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete patient:', error);
      alert('❌ Gagal menghapus data pasien');
    }
  };

  const handleSearch = () => {
    loadPatients();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      date_from: '',
      date_to: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filter Data Pasien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Cari nama atau nomor telepon..."
                value={filters.search || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev: GetPatientsInput) => ({ 
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
                setFilters((prev: GetPatientsInput) => ({ 
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
                setFilters((prev: GetPatientsInput) => ({ 
                  ...prev, 
                  date_to: e.target.value || undefined 
                }))
              }
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              🔍 Cari
            </Button>
            <Button onClick={clearFilters} variant="outline">
              🗑️ Bersihkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Data Pasien</CardTitle>
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
          ) : patients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada data pasien ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {patients.map((patient: Patient) => (
                <div key={patient.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">
                        {patient.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {patient.phone_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {patient.examination_date.toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        ID: {patient.id}
                      </Badge>
                      <Button
                        onClick={() => handleDelete(patient.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-700">
                        <strong>Keluhan:</strong> {patient.complaint}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-3">
                    Didaftarkan: {patient.created_at.toLocaleDateString('id-ID')} {patient.created_at.toLocaleTimeString('id-ID')}
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
