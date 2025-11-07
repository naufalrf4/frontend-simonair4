import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languageOptions = [
  { code: 'id', labelKey: 'language.options.id', flag: '🇮🇩' },
  { code: 'en', labelKey: 'language.options.en', flag: '🇺🇸' },
] as const;

interface LanguageToggleProps {
  variant?: 'default' | 'compact';
}

export function LanguageToggle({ variant = 'default' }: LanguageToggleProps) {
  const { i18n, t } = useTranslation('common');

  const handleChange = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('simonair_locale', code);
  };

  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'id';
  const currentOption = languageOptions.find((opt) => opt.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === 'compact' ? 'sm' : 'default'}
          className={
            variant === 'compact'
              ? 'inline-flex items-center gap-1.5 text-sm font-semibold'
              : 'flex items-center gap-2 text-sm font-medium'
          }
          aria-label={t('language.label')}
        >
          <span aria-hidden="true" className="text-base leading-none">
            {currentOption?.flag ?? '🌐'}
          </span>
          {variant === 'compact' ? (
            <span>{currentLanguage.toUpperCase()}</span>
          ) : (
            <>
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline-flex items-center gap-2">
                <span>{t('language.label')}:</span>
                <span>{t(currentOption?.labelKey ?? 'language.options.id')}</span>
              </span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleChange(option.code)}
            className={currentLanguage === option.code ? 'font-semibold' : undefined}
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{option.flag}</span>
              {t(option.labelKey)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
