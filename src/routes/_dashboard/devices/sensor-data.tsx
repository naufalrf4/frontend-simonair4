import { createFileRoute } from '@tanstack/react-router';
import { SensorDataPage, SensorDataErrorBoundary } from '@/features/sensor-data/components';

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
      <div className="min-h-screen bg-background">
        <SensorDataPage />
      </div>
    </SensorDataErrorBoundary>
  );
}
