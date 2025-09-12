import { createFileRoute } from '@tanstack/react-router';
import { SensorDataPage, SensorDataErrorBoundary } from '@/features/sensor-data/components';

// Responsive wrapper component for sensor data
const ResponsiveSensorDataWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full">
      {/* Mobile portrait (small screens) */}
      <div className="block sm:hidden">
        <div className="overflow-x-auto overflow-y-auto pb-4">
          <div className="min-w-full inline-block align-top">
            <div className="w-full max-w-screen-sm mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile landscape and tablet (sm to lg) */}
      <div className="hidden sm:block lg:hidden">
        <div className="overflow-x-auto overflow-y-auto">
          <div className="min-w-full w-full">
            <div className="w-full max-w-screen-md mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop and large screens */}
      <div className="hidden lg:block">
        <div className="w-full overflow-x-auto overflow-y-visible">
          <div className="w-full max-w-screen-xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_dashboard/devices/sensor-data')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SensorDataErrorBoundary
      context={{ 
        route: '/_dashboard/sensor-data',
        feature: 'sensor-data-history'
      }}
      onError={(error) => {
        // Log error for debugging
        console.error('Sensor Data Page Error:', error);
        
        // You can integrate with error reporting service here
        // The error is already reported automatically for high severity errors
      }}
    >
      <div className="min-h-screen bg-background w-full h-full">
        <div className="w-full h-full max-w-none overflow-hidden">
          <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 h-full">
            <div className="w-full h-full">
              <ResponsiveSensorDataWrapper>
                <SensorDataPage />
              </ResponsiveSensorDataWrapper>
            </div>
          </div>
        </div>
      </div>
    </SensorDataErrorBoundary>
  );
}
