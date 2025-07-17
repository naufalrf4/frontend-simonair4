import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Fish, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { PlusCircle } from 'lucide-react';

interface NoDevicesFallbackProps {
  isConnected?: boolean;
}

const NoDevicesFallback: React.FC<NoDevicesFallbackProps> = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/60 shadow-xl">
    <CardContent className="p-6 sm:p-12 md:p-16 text-center">
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-4xl sm:text-6xl mb-6 sm:mb-8">
        <Fish className="h-16 w-16 sm:h-24 sm:w-24 text-blue-300 animate-float" />
        <Waves className="h-14 w-14 sm:h-20 sm:w-20 text-cyan-300 animate-wave" />
      </div>
      <h3 className="text-xl sm:text-3xl font-bold text-gray-700 mb-3 sm:mb-4">
        Tidak ada perangkat yang terhubung
      </h3>
      <p className="text-gray-500 text-base sm:text-lg max-w-md sm:max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
        Silakan lakukan Pair Device untuk menghubungkan perangkat baru ke sistem.
      </p>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base">
          <Button
            asChild
            size="lg"
            className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold rounded-xl shadow-lg bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white transition-all ease-in-out duration-300 flex items-center gap-2"
          >
            <Link to="/devices">
              <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Pair Device Baru
            </Link>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default NoDevicesFallback;
