import { Users, Calendar, Receipt, TrendingUp, AlertTriangle, Pill, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="module-page">
      <PageHeader title="Dashboard" description="Hospital overview at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Today" value={0} icon={Users} variant="primary" subtitle="Registered today" />
        <StatCard title="Appointments" value={0} icon={Calendar} variant="success" subtitle="Scheduled today" />
        <StatCard title="Revenue Today" value="KES 0" icon={TrendingUp} variant="warning" subtitle="Total collections" />
        <StatCard title="Pending Bills" value={0} icon={Receipt} variant="destructive" subtitle="Awaiting payment" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={AlertTriangle} title="No alerts" description="All systems running smoothly. Alerts for low stock and pending bills will appear here." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Clock} title="No recent activity" description="Patient registrations, appointments, and billing activity will appear here." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
