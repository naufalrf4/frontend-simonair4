import { createFileRoute } from '@tanstack/react-router';
import { SensorGraphPage } from '@/features/sensor-graph';
import { SensorDataErrorBoundary } from '@/features/sensor-data/components';

// Responsive wrapper for sensor graphs
const ResponsiveSensorGraphWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-full">
      {/* Mobile portrait (small screens) */}
      <div className="block sm:hidden">
        <div className="overflow-x-auto overflow-y-auto pb-4">
          <div className="min-w-96 w-full">
            <div className="w-full max-w-screen-sm mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile landscape and tablet (sm to lg) */}
      <div className="hidden sm:block lg:hidden">
        <div className="overflow-x-auto overflow-y-auto">
          <div className="min-w-96 w-full">
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

export const Route = createFileRoute('/_dashboard/devices/sensor-trends')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SensorDataErrorBoundary
      context={{
        route: '/_dashboard/sensor-graph',
        feature: 'sensor-graph-series'
      }}
      onError={(error) => {
        console.error('Sensor Graph Page Error:', error);
      }}
    >
      <div className="min-h-screen bg-background w-screen max-w-full overflow-hidden">
        <div className="w-full h-full">
          <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 w-full">
            <ResponsiveSensorGraphWrapper>
              <SensorGraphPage />
            </ResponsiveSensorGraphWrapper>
          </div>
        </div>
      </div>
    </SensorDataErrorBoundary>
  );
}

