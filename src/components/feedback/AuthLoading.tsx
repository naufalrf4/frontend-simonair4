import { Fish } from 'lucide-react';

export function AuthLoading() {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-tr from-[#0c2139] via-[#105372] to-[#2db5cd]">
      {/* Left Panel (Desktop) */}
      <aside className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2291c7] via-[#1c5072]/90 to-[#17385b]/95 flex-col items-center justify-center p-10">
        <div className="animate-pulse">
          <Fish className="w-16 h-16 mx-auto text-white/50" strokeWidth={1.5} />
        </div>
      </aside>

      {/* Right Panel (Form Area) */}
      <main className="w-full md:w-1/2 bg-gradient-to-b from-[#eaf8fc] via-[#e7f0f8] to-[#f5fbfd] flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-8 animate-pulse">
          {/* Form Title Skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-muted rounded-md" />
            <div className="h-4 w-1/2 bg-muted rounded-md" />
          </div>
          
          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-muted rounded-md" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-muted rounded-md" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
          </div>
          
          {/* Submit Button Skeleton */}
          <div className="h-12 w-full bg-muted rounded-md" />
          
          {/* Footer Link Skeleton */}
          <div className="h-4 w-2/3 mx-auto bg-muted rounded-md" />
        </div>
      </main>
    </div>
  );
}
