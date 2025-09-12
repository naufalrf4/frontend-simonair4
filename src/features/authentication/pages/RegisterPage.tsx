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
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Confirm password does not match',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

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
        message: error?.response?.data?.message || error?.message || 'Registration failed. Please try again.',
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
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 sm:my-8">
      <Card className="w-full shadow-2xl border-0 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl">
        <div className="h-2 bg-gradient-to-r from-primary via-sky-400 to-primary/80 animate-pulse" />
        <CardHeader className="space-y-4 pb-6 pt-6">
          <div className="flex flex-col items-center gap-2">
            <User className="w-10 h-10 text-primary drop-shadow" />
            <CardTitle className="text-2xl font-bold text-center text-primary drop-shadow-md">
              Create New Account
            </CardTitle>
          </div>
          <CardDescription className="text-center text-base font-normal text-muted-foreground">
            Create an account to access the dashboard.
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
                        Full Name
                        <Tooltip message="Full name is required">
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
                          placeholder="Full name"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Full Name"
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
                        Email
                        <Tooltip message="Required, use an active email">
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
                          placeholder="Email address"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Email"
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
                        Password
                        <Tooltip message="Minimum 6 characters">
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
                          placeholder="Password"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Password"
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
                        Confirm Password
                        <Tooltip message="Must match the password above">
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
                          placeholder="Repeat password"
                          className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/30 py-5 pl-11 text-base rounded-md outline-none transition-all"
                          aria-label="Confirm Password"
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
                aria-label="Register account"
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
                    <span className="text-base">Processing...</span>
                  </div>
                ) : (
                  <>
                    <span>Register</span>
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 pb-6 pt-2">
          <span className="text-base text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline focus:underline transition-colors"
            >
              Login here
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
