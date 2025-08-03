
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { Calendar, Phone, User, FileText } from 'lucide-react';
import type { CreatePatientInput } from '../../../server/src/schema';

export function PatientRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  // Use string for form state since HTML inputs work with strings
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    complaint: '',
    examination_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create the input object that matches the schema
      const createPatientInput: CreatePatientInput = {
        name: formData.name,
        phone_number: formData.phone_number,
        complaint: formData.complaint,
        examination_date: formData.examination_date // This will be a string, which the schema accepts
      };

      await trpc.createPatient.mutate(createPatientInput);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        phone_number: '',
        complaint: '',
        examination_date: ''
      });

      // Show success message (you could use a toast library here)
      alert('✅ Pasien berhasil didaftarkan!');
    } catch (error) {
      console.error('Failed to register patient:', error);
      alert('❌ Gagal mendaftarkan pasien. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for default value
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nama Lengkap
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Masukkan nama lengkap pasien"
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon
              </Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                }
                placeholder="Contoh: 08123456789"
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Examination Date Field */}
            <div className="space-y-2">
              <Label htmlFor="examination_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Pemeriksaan
              </Label>
              <Input
                id="examination_date"
                type="date"
                value={formData.examination_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, examination_date: e.target.value }))
                }
                min={today}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Complaint Field */}
          <div className="space-y-2">
            <Label htmlFor="complaint" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Keluhan
            </Label>
            <Textarea
              id="complaint"
              value={formData.complaint}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, complaint: e.target.value }))
              }
              placeholder="Deskripsikan keluhan atau gejala yang dialami pasien..."
              required
              rows={4}
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {isLoading ? '⏳ Mendaftarkan...' : '✅ Daftarkan Pasien'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
