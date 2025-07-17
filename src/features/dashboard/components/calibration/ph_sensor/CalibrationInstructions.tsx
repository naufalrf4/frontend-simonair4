import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Beaker } from 'lucide-react';

const CalibrationInstructions: React.FC = () => {
  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Beaker className="h-5 w-5" />
          Panduan Kalibrasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Siapkan larutan buffer pH standar (4.01, 6.86, 9.18)</li>
          <li>Celupkan sensor ke larutan buffer pertama</li>
          <li>Tunggu pembacaan voltage stabil (±30 detik)</li>
          <li>Pilih nilai buffer yang sesuai dan klik "Tambah Titik"</li>
          <li>Ulangi untuk buffer kedua (minimal 2 titik)</li>
          <li>Review persamaan regresi dan klik "Kirim Kalibrasi"</li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default CalibrationInstructions;
