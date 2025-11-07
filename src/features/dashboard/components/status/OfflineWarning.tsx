import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OfflineWarningProps {
  lastOnline: string;
}

const OfflineWarning: React.FC<OfflineWarningProps> = ({ lastOnline }) => {
  const { t } = useTranslation('dashboard');
  return (
    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center gap-2 text-red-700 mb-1">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-bold">
          {t('offlineWarning.title')}
        </span>
      </div>
      <p className="text-sm text-red-600 ml-6">
        {t('offlineWarning.lastSeen', { time: lastOnline })}
      </p>
    </div>
  );
};

export default OfflineWarning;
