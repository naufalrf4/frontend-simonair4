interface DashboardLoadingProps {
  message?: string;
}

export function DashboardLoading({ message = "Loading dashboard..." }: DashboardLoadingProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30">
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-30">
        <div className="animate-pulse bg-card h-full rounded-lg m-4" />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-20 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-full bg-muted animate-pulse" />
        </div>
        <div className="flex-1 container mx-auto p-6">
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">{message}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}