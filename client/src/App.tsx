
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientRegistration } from '@/components/PatientRegistration';
import { SalesInput } from '@/components/SalesInput';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PatientList } from '@/components/PatientList';
import { SalesList } from '@/components/SalesList';
import { Activity, Users, DollarSign, FileText, Plus } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            🏥 Klinik Manonjaya
          </h1>
          <p className="text-gray-600">
            Sistem Manajemen Pasien dan Penjualan
          </p>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="register-patient" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Daftar Pasien
            </TabsTrigger>
            <TabsTrigger value="sales-input" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Input Penjualan
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Data Pasien
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Data Penjualan
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          {/* Patient Registration */}
          <TabsContent value="register-patient">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Registrasi Pasien Baru
                </CardTitle>
                <CardDescription>
                  Daftarkan pasien baru untuk pemeriksaan di klinik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientRegistration />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Input */}
          <TabsContent value="sales-input">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Input Transaksi Penjualan
                </CardTitle>
                <CardDescription>
                  Catat penjualan obat, alat kesehatan, atau layanan medis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesInput />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient List */}
          <TabsContent value="patients">
            <PatientList />
          </TabsContent>

          {/* Sales List */}
          <TabsContent value="sales">
            <SalesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
