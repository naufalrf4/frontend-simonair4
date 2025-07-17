import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Beaker, Waves } from 'lucide-react';

const DOInstructions: React.FC = () => {
  return (
    <div className="text-center">
      <Waves className="h-12 w-12 mx-auto text-green-500 mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-3">
        Kalibrasi Sensor DO
      </h3>
      <Card className="border-indigo-200 bg-indigo-50 mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Panduan Kalibrasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Pastikan sensor DO bersih dan kering</li>
            <li>Biarkan sensor berada di udara terbuka selama 5-10 menit</li>
            <li>Pastikan suhu ambient stabil</li>
            <li>Tunggu pembacaan voltage stabil</li>
            <li>Klik "Kirim Kalibrasi" untuk menyimpan kalibrasi udara jenuh</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default DOInstructions;
