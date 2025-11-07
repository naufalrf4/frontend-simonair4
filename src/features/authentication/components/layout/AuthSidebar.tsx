import { Fish, Thermometer, FlaskConical, Droplets, Activity } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { useTranslation } from 'react-i18next';

export default function AuthSidebar() {
  const { t } = useTranslation('auth');
  const featureItems = [
    { icon: <Thermometer className="w-6 h-6 text-accent" />, label: t('auth:sidebar.features.temperature') },
    { icon: <FlaskConical className="w-6 h-6 text-accent" />, label: t('auth:sidebar.features.ph') },
    { icon: <Droplets className="w-6 h-6 text-accent" />, label: t('auth:sidebar.features.tds') },
    { icon: <Fish className="w-6 h-6 text-accent" />, label: t('auth:sidebar.features.do') },
    { icon: <Activity className="w-6 h-6 text-accent" />, label: t('auth:sidebar.features.logs') },
  ];
  const footerText = t('auth:sidebar.footer', { year: new Date().getFullYear() });

  return (
    <aside className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2291c7] via-[#1c5072]/90 to-[#17385b]/95 flex-col items-center justify-between p-0 relative overflow-hidden z-10">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-white/90 shadow-xl rounded-2xl p-3 flex items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-primary/10 group">
          <img
            src="/images/simonair.png"
            alt="simonair Logo"
            className="h-14 w-auto transition-transform duration-300 group-hover:rotate-2"
            draggable={false}
          />
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center h-full px-10">
        <div className="text-center max-w-lg space-y-5 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mt-10">
          <Fish
            className="w-14 h-14 mx-auto text-accent animate-bounce drop-shadow-lg"
            strokeWidth={1.5}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-primary-foreground tracking-tight drop-shadow-md">
            {t('auth:sidebar.title')}
            <span className="text-lg font-semibold block text-primary-foreground/90 mt-2">
              {t('auth:sidebar.subtitle')}
            </span>
          </h1>
          <p className="text-primary-foreground/90 text-base sm:text-lg mb-4">
            {t('auth:sidebar.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {featureItems.map((feature) => (
              <FeatureCard key={feature.label} icon={feature.icon} label={feature.label} />
            ))}
          </div>
        </div>
      </div>
      <footer className="absolute bottom-6 left-0 w-full text-center text-primary-foreground/70 text-xs sm:text-sm tracking-wide z-10">
        {footerText}
      </footer>
    </aside>
  );
}
