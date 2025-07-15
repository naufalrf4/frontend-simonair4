import { Fish, Waves, Thermometer, BellRing } from 'lucide-react';
import FeatureCard from './FeatureCard';

export default function AuthSidebar() {
  return (
    <aside className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2291c7] via-[#1c5072]/90 to-[#17385b]/95 flex-col items-center justify-between p-0 relative overflow-hidden z-10">
      <div className="w-full flex flex-col items-center justify-center h-full px-10">
        <div className="text-center max-w-lg space-y-5 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mt-10">
          <Fish className="w-14 h-14 mx-auto text-accent animate-bounce drop-shadow-lg" strokeWidth={1.5} />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-primary-foreground tracking-tight drop-shadow-md">
            SIMONAIR 4.0
            <span className="text-lg font-semibold block text-primary-foreground/90 mt-2">
              Sistem Monitoring Kualitas Air
            </span>
          </h1>
          <p className="text-primary-foreground/90 text-base sm:text-lg mb-4">
            Real-time monitoring & management of <b>water quality</b> for your ornamental freshwater fish tanks.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <FeatureCard icon={<Waves className="w-6 h-6 text-accent" />} label="Live Sensor Logs" />
            <FeatureCard icon={<Thermometer className="w-6 h-6 text-accent" />} label="Temperature & pH" />
            <FeatureCard icon={<BellRing className="w-6 h-6 text-accent" />} label="Threshold Alerts" />
          </div>
        </div>
      </div>
      <footer className="absolute bottom-6 left-0 w-full text-center text-primary-foreground/70 text-xs sm:text-sm tracking-wide z-10">
        © {new Date().getFullYear()} Simonair 4.0 · <span className="font-semibold text-accent">TEK 59</span> Sekolah Vokasi IPB. All rights reserved.
      </footer>
    </aside>
  );
}
