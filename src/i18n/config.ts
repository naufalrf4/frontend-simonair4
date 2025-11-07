import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import idCommon from '@/locales/id/common.json';
import enAuth from '@/locales/en/auth.json';
import idAuth from '@/locales/id/auth.json';
import enDashboard from '@/locales/en/dashboard.json';
import idDashboard from '@/locales/id/dashboard.json';
import enDevices from '@/locales/en/devices.json';
import idDevices from '@/locales/id/devices.json';
import enFarming from '@/locales/en/farming.json';
import idFarming from '@/locales/id/farming.json';
import enAdmin from '@/locales/en/admin.json';
import idAdmin from '@/locales/id/admin.json';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    devices: enDevices,
    farming: enFarming,
    admin: enAdmin,
  },
  id: {
    common: idCommon,
    auth: idAuth,
    dashboard: idDashboard,
    devices: idDevices,
    farming: idFarming,
    admin: idAdmin,
  },
} as const;

const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'simonair_locale',
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    supportedLngs: ['id', 'en'],
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'devices', 'farming', 'admin'],
    interpolation: {
      escapeValue: false,
    },
    detection: detectionOptions,
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
