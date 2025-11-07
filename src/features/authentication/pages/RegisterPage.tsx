import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { ArrowRight, Info, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { LanguageToggle } from '@/components/common/language-toggle';

const createRegisterSchema = (t: TFunction<'auth'>) =>
  z
    .object({
      fullName: z
        .string()
        .min(2, { message: t('auth:validation.fullNameMin') }),
      email: z
        .string()
        .email({ message: t('auth:validation.emailInvalid') }),
      password: z
        .string()
        .min(6, { message: t('auth:validation.passwordMin') }),
      confirmPassword: z
        .string()
        .min(6, { message: t('auth:validation.confirmPasswordMin') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth:validation.confirmPasswordMismatch'),
      path: ['confirmPassword'],
    });

type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function RegisterPage() {
  const { register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { t } = useTranslation(['auth']);
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsRegistering(true);
    try {
      await register({ fullName: values.fullName, email: values.email, password: values.password });
      form.reset();
      const redirectTo = (search as any)?.redirect || '/dashboard';
      navigate({ to: redirectTo, replace: true });
    } catch (error: any) {
      form.setError('root', {
        message:
          error?.response?.data?.message ||
          error?.message ||
          t('auth:register.error.generic'),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const Tooltip = ({ children, message }: { children: React.ReactNode; message: string }) => (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="absolute left-1/2 bottom-full mb-2 hidden w-max -translate-x-1/2 rounded bg-primary/90 px-2 py-1 text-xs text-primary-foreground shadow-xl transition-opacity group-hover:block z-50">
        {message}
      </span>
    </span>
  );

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 sm:my-8 space-y-3">
      <div className="flex w-full justify-end">
        <LanguageToggle variant="compact" />
      </div>
      <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl">
        <div className="h-2 bg-gradient-to-r from-primary via-sky-400 to-primary/80 animate-pulse" />
        <CardHeader className="space-y-4 pb-6 pt-6">
          <div className="flex flex-col items-center gap-2">
            <User className="w-10 h-10 text-primary drop-shadow" />
            <CardTitle className="text-2xl font-bold text-center text-primary drop-shadow-md">
              {t('auth:register.title')}
            </CardTitle>
          </div>
          <CardDescription className="text-center text-base font-normal text-muted-foreground">
            {t('auth:register.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2 px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 mb-1">
                      <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                        {t('auth:fields.fullName.label')}
                        <Tooltip message={t('auth:fields.fullName.tooltip')}>
                          <span className="text-primary text-base font-bold cursor-help">*</span>
                        </Tooltip>
                      </FormLabel>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User size={18} />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder={t('auth:fields.fullName.placeholder')}
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label={t('auth:fields.fullName.label')}
                          autoFocus
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-destructive flex items-center gap-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 mb-1">
                      <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                        {t('auth:fields.email.label')}
                        <Tooltip message={t('auth:fields.email.tooltip')}>
                          <span className="text-primary text-base font-bold cursor-help">*</span>
                        </Tooltip>
                      </FormLabel>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                  <FormItem>
                    <div className="flex items-center gap-1 mb-1">
                      <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                        {t('auth:fields.password.label')}
                        <Tooltip message={t('auth:fields.password.tooltip')}>
                          <span className="text-primary text-base font-bold cursor-help">*</span>
                        </Tooltip>
                      </FormLabel>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock size={18} />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('auth:fields.password.placeholder')}
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label={t('auth:fields.password.label')}
                          autoComplete="new-password"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-destructive flex items-center gap-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 mb-1">
                      <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                        {t('auth:fields.confirmPassword.label')}
                        <Tooltip message={t('auth:fields.confirmPassword.tooltip')}>
                          <span className="text-primary text-base font-bold cursor-help">*</span>
                        </Tooltip>
                      </FormLabel>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <CheckCircle size={18} />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={t('auth:fields.confirmPassword.placeholder')}
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label={t('auth:fields.confirmPassword.label')}
                          autoComplete="new-password"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs text-destructive flex items-center gap-1" />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                  <Info className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 py-5 text-base font-semibold rounded-md shadow-sm hover:shadow mt-6 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30"
                disabled={isRegistering}
                aria-label={t('auth:register.submit.label')}
              >
                {isRegistering ? (
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
                    <span className="text-base">{t('auth:register.submit.processing')}</span>
                  </div>
                ) : (
                  <>
                    <span>{t('auth:register.submit.label')}</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 pb-6 pt-2">
          <span className="text-base text-muted-foreground">
            {t('auth:register.loginPrompt')}{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline focus:underline transition-colors"
            >
              {t('auth:register.loginLink')}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
