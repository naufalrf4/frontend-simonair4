import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
import { Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Kata sandi minimal 8 karakter' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Kata sandi harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
      }),
    confirmPassword: z.string().min(8, { message: 'Konfirmasi sandi minimal 8 karakter' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi sandi tidak cocok',
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const { validateResetToken, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams({ strict: false });
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        const valid = await validateResetToken(token); // Panggil dari context
        setIsTokenValid(valid);
        if (!valid) {
          toast.error('Token tidak valid atau kadaluarsa');
          navigate({ to: '/forgot-password', replace: true });
        }
      } catch {
        setIsTokenValid(false);
      }
    };

    checkToken();
  }, [token, validateResetToken, navigate]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      form.setError('root', {
        message: 'Token tidak valid.',
      });
      return;
    }
    try {
      await resetPassword(token, values.password, values.confirmPassword); // Panggil dari context
      toast.success('Password berhasil diubah. Silakan login.');
      navigate({ to: '/login', replace: true });
    } catch (error: any) {
      form.setError('root', {
        message: error?.response?.data?.message || 'Gagal reset password. Coba lagi.',
      });
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 sm:my-8">
        <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 sm:my-8">
        <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl">
          <div className="h-2 bg-gradient-to-r from-destructive via-destructive/60 to-destructive/80" />
          <CardHeader className="space-y-4 pb-6 pt-6">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-destructive drop-shadow" />
              <CardTitle className="text-2xl font-bold text-center text-destructive drop-shadow-md">
                Token Tidak Valid
              </CardTitle>
            </div>
            <CardDescription className="text-center text-base font-normal text-muted-foreground">
              Link reset password tidak valid atau sudah kedaluwarsa.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-2 pb-6 pt-2">
            <Button
              onClick={() => navigate({ to: '/forgot-password' })}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Kirim Ulang Link Reset
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 sm:my-8">
      <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl">
        <div className="h-2 bg-gradient-to-r from-primary via-sky-400 to-primary/80 animate-pulse" />
        <CardHeader className="space-y-4 pb-6 pt-6">
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-10 h-10 text-primary drop-shadow" />
            <CardTitle className="text-2xl font-bold text-center text-primary drop-shadow-md">
              Reset Kata Sandi
            </CardTitle>
          </div>
          <CardDescription className="text-center text-base font-normal text-muted-foreground">
            Masukkan kata sandi baru Anda.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 pt-2 px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" autoComplete="on">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                      Kata Sandi Baru
                      <span className="text-primary text-base font-bold">*</span>
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock size={18} />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Kata sandi baru"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Kata Sandi Baru"
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
                    <FormLabel className="text-sm font-semibold text-primary flex items-center gap-1">
                      Konfirmasi Kata Sandi
                      <span className="text-primary text-base font-bold">*</span>
                    </FormLabel>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <CheckCircle size={18} />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Ulangi kata sandi baru"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Konfirmasi Kata Sandi"
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
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 py-5 text-base font-semibold rounded-md shadow-sm hover:shadow mt-6 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/30"
                disabled={form.formState.isSubmitting}
                aria-label="Reset Password"
              >
                {form.formState.isSubmitting ? (
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
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={20} className="ml-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
