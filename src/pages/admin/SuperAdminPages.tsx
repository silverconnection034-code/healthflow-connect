import { Building2, Search, CreditCard, BarChart3, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SuperAdminHospitalsPage() {
  return (
    <div className="module-page">
      <PageHeader title="All Hospitals" description="Platform-wide hospital management" icon={Building2} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Hospitals" value={0} icon={Building2} variant="primary" />
        <StatCard title="Active" value={0} icon={CheckCircle} variant="success" />
        <StatCard title="Trial" value={0} icon={Building2} variant="warning" />
        <StatCard title="Expired" value={0} icon={XCircle} variant="destructive" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hospitals..." className="pl-9" />
      </div>

      <div className="data-table-wrapper">
        <EmptyState icon={Building2} title="No hospitals registered" description="Hospitals that sign up on the platform will appear here." />
      </div>
    </div>
  );
}

export function SuperAdminSubscriptionsPage() {
  return (
    <div className="module-page">
      <PageHeader title="Subscriptions" description="Hospital subscription tracking" icon={CreditCard} />
      <div className="data-table-wrapper">
        <EmptyState icon={CreditCard} title="No subscriptions" description="Hospital subscription plans and payment history will appear here." />
      </div>
    </div>
  );
}

export function SuperAdminRevenuePage() {
  return (
    <div className="module-page">
      <PageHeader title="Platform Revenue" description="Revenue from all hospital subscriptions" icon={BarChart3} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value="KES 0" icon={TrendingUp} variant="primary" subtitle="All time" />
        <StatCard title="This Month" value="KES 0" icon={TrendingUp} variant="success" />
        <StatCard title="Active Subscriptions" value={0} icon={CreditCard} variant="warning" />
      </div>
      <div className="data-table-wrapper">
        <EmptyState icon={BarChart3} title="No revenue data" description="Revenue from hospital subscriptions will be tracked here." />
      </div>
    </div>
  );
}
