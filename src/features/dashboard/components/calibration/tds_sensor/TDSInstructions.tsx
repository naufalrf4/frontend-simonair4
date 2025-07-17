import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Beaker, Zap } from 'lucide-react';

const TDSInstructions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Kalibrasi Sensor TDS</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          Kalibrasi menggunakan larutan standar dengan kompensasi suhu otomatis
        </p>
      </div>
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Panduan Kalibrasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Siapkan larutan standar TDS dengan nilai yang diketahui</li>
            <li>Celupkan sensor TDS ke dalam larutan standar</li>
            <li>Tunggu pembacaan voltage stabil (±30 detik)</li>
            <li>Pilih nilai standar yang sesuai dengan larutan</li>
            <li>Review perhitungan konstanta K</li>
            <li>Klik "Kirim Kalibrasi" untuk menyimpan</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default TDSInstructions;
