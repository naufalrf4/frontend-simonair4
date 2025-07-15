import { memo, type ReactNode } from 'react';

const FeatureCard = memo(({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/20 shadow hover:scale-105 transition-transform border border-white/15 min-w-[90px]">
    {icon}
    <span className="text-xs text-primary-foreground mt-1 font-semibold">{label}</span>
  </div>
));
FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
