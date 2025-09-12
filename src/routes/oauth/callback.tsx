import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/utils/apiClient';

export const Route = createFileRoute('/oauth/callback')({
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, string | undefined>;
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<'refresh' | 'profile' | 'done'>('refresh');

  const redirectTo = useMemo(() => {
    const candidate = search?.redirect || search?.next || '/dashboard';
    return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/dashboard';
  }, [search]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingStep('refresh');
        await apiClient.post('/auth/refresh');

        setLoadingStep('profile');
        await apiClient.get('/auth/profile');

        setLoadingStep('done');
        navigate({ to: redirectTo, replace: true });
      } catch (e: any) {
        try {
          setLoadingStep('profile');
          await apiClient.get('/auth/profile');
          setLoadingStep('done');
          navigate({ to: redirectTo, replace: true });
          return;
        } catch {
          setError('Failed to process login. Please try again.');
        }
      }
    };
    run();
  }, [navigate, redirectTo]);

  return (
    <div className="mx-auto mt-24 max-w-md text-center">
      {!error ? (
        <div className="space-y-2">
          <div className="animate-pulse text-sm text-muted-foreground">
            {loadingStep === 'refresh' && 'Preparing session...'}
            {loadingStep === 'profile' && 'Loading profile...'}
            {loadingStep === 'done' && 'Redirecting...'}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-destructive">{error}</div>
          <button
            onClick={() => navigate({ to: '/login', replace: true })}
            className="px-3 py-2 rounded bg-primary text-primary-foreground"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}
