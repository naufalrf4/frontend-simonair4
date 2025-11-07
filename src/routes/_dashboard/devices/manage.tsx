import { createFileRoute } from '@tanstack/react-router'
import { DevicesPage } from '@/features/devices/components/DevicesPage'
import { ErrorPage } from '@/components/common/error-page'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_dashboard/devices/manage')({
  component: RouteComponent,
  pendingComponent: LoadingComponent,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
})

function RouteComponent() {
  const { t } = useTranslation('devices')
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('page.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('page.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <DevicesPage className="w-full" />
    </div>
  )
}

function LoadingComponent() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-80 bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Search and Add Button Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="h-10 w-full sm:w-80 bg-muted rounded animate-pulse" />
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
      </div>

      {/* Grid Skeleton - Improved */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
            {/* Status bar */}
            <div className="h-1 bg-muted" />
            
            {/* Card content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
              
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
              
              {/* Sensor data skeleton */}
              <div className="border-t pt-4">
                <div className="h-4 w-24 bg-muted rounded mb-3" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-16 bg-muted rounded" />
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
