import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  return (
    <div className="module-page">
      <PageHeader title="Notifications" description="Alerts & system notifications" icon={Bell}>
        <Button variant="outline" size="sm"><CheckCheck className="h-4 w-4 mr-2" />Mark All Read</Button>
      </PageHeader>

      <div className="data-table-wrapper">
        <EmptyState icon={Bell} title="No notifications" description="You'll receive alerts for appointments, lab results, payments, and system events." />
      </div>
    </div>
  );
}
