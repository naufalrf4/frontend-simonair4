import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Info, HelpCircle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { BASE_URL } from '@/utils/constants';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { LanguageToggle } from '@/components/common/language-toggle';

const createLoginFormSchema = (t: TFunction<'auth'>) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('auth:validation.emailRequired') })
      .email({ message: t('auth:validation.emailInvalid') }),
    password: z
      .string()
      .min(6, { message: t('auth:validation.passwordMin') }),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginFormSchema>>;

export function LoginPage() {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation(['auth', 'common']);
  const loginFormSchema = useMemo(() => createLoginFormSchema(t), [t]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
      await login({ email: values.email, password: values.password });
      form.reset();
      const redirectTo = (search as any)?.redirect || '/dashboard';
      navigate({ to: redirectTo, replace: true });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t('auth:login.error.generic');
      form.setError('root', {
        message: errorMessage,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const togglePasswordVisibility = useCallback(() => setShowPassword((prev: boolean) => !prev), []);

  const handleGoogleLoginClick = useCallback(async () => {
    try {
      setGoogleLoading(true);
      const redirectUri = `${window.location.origin}/oauth/callback`;
      // Always use backend BASE_URL for OAuth endpoint
      const base = BASE_URL;
      const res = await fetch(
        `${base}/auth/google?redirectUri=${encodeURIComponent(redirectUri)}`,
        { credentials: 'include' },
      );
      const json = await res.json();
      const url = json?.data?.url;
      if (url) {
        window.location.assign(url);
      } else {
        throw new Error('Google OAuth URL missing');
      }
    } catch (e) {
      form.setError('root', { message: t('auth:login.error.googleInit') });
    } finally {
      setGoogleLoading(false);
    }
  }, [form, t]);

  const Tooltip = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-primary/90 px-2 py-1 text-xs text-primary-foreground shadow-xl transition-opacity group-hover:block z-50">
        {message}
      </span>
    </span>
  );

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex justify-end">
        <LanguageToggle variant="compact" />
      </div>
      <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl focus-within:ring-2 focus-within:ring-primary/20">
      <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary/80 animate-pulse" />
      <CardHeader className="space-y-4 pb-6 pt-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/images/simonair.png"
            alt="Simonair Logo"
            className="h-20 block sm:hidden mx-auto mb-1"
            draggable={false}
            loading="lazy"
          />
          <CardTitle className="text-xl font-bold text-center text-primary drop-shadow-md">
            {t('auth:login.title')}
          </CardTitle>
        </div>
        <CardDescription className="text-center text-sm font-normal text-muted-foreground">
          {t('auth:login.subtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2 px-4 sm:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center gap-1 mb-1">
                    <FormLabel className="text-sm font-medium text-primary flex items-center gap-1">
                      {t('auth:fields.email.label')}
                      <Tooltip message={t('auth:fields.email.tooltip')}>
                        <span className="text-primary text-base font-bold cursor-help">*</span>
                      </Tooltip>
                    </FormLabel>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                      <Mail size={18} />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('auth:fields.email.placeholder')}
                        className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                        aria-label={t('auth:fields.email.label')}
                        autoComplete="email"
                        autoFocus
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs text-destructive flex items-center gap-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                        {t('auth:fields.password.label')}
                        <Tooltip message={t('auth:fields.password.tooltip')}>
                          <span className="text-primary text-base font-bold cursor-help">*</span>
                        </Tooltip>
                      </FormLabel>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline focus:underline transition-colors flex items-center gap-1"
                    >
                      <HelpCircle size={15} className="text-primary/90" />
                      {t('auth:login.forgotLink')}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                      <Lock size={18} />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth:fields.password.placeholder')}
                        className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 pr-11 text-base rounded-md outline-none transition-all"
                        aria-label={t('auth:fields.password.label')}
                        autoComplete="current-password"
                        disabled={isLoggingIn}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/80 hover:text-primary transition-colors duration-200 disabled:opacity-50"
                      aria-label={
                        showPassword
                          ? t('auth:login.toggle.hide')
                          : t('auth:login.toggle.show')
                      }
                      tabIndex={0}
                      disabled={isLoggingIn}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <FormMessage className="text-xs text-destructive flex items-center gap-1" />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 flex items-center gap-2">
                <Info className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 py-5 text-base font-semibold rounded-md shadow-sm hover:shadow mt-6 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30"
              disabled={isLoggingIn}
              // || googleLoading
              aria-label={t('auth:login.aria.submit')}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center" aria-hidden="true">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>{t('auth:login.submit.processing')}</span>
                </div>
              ) : (
                <>
                  <span>{t('auth:login.submit.label')}</span>
                  <ArrowRight size={20} className="ml-1" />
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 my-2">
              <div className="flex-grow border-t border-muted"></div>
              <span className="text-sm text-muted-foreground">{t('auth:login.divider')}</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className={`w-full flex items-center justify-center gap-3 py-5 text-base font-semibold rounded-lg border border-primary
                hover:bg-primary/95 hover:text-white focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 shadow-sm relative
                ${googleLoading || isLoggingIn ? 'opacity-60 pointer-events-none' : ''}`}
              onClick={handleGoogleLoginClick}
              aria-label={t('auth:login.aria.google')}
              disabled={googleLoading || isLoggingIn}
              tabIndex={0}
            >
              {googleLoading && (
                <span className="absolute left-5 flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
              <span className="flex items-center gap-2">
                <img
                  src="/images/icons/google-2025.svg"
                  alt="Google"
                  className="w-6 h-6 drop-shadow"
                />
                <span className="ml-1">{t('auth:login.googleButton')}</span>
              </span>
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center gap-2 pb-6 pt-2">
        <span className="text-base text-muted-foreground text-center">
          {t('auth:login.signupPrompt')}{' '}
          <Link
            to="/register"
            className="text-primary font-semibold hover:underline focus:underline transition-colors"
          >
            {t('auth:login.signupLink')}
          </Link>
        </span>
      </CardFooter>
    </Card>
    </div>
  );
}
