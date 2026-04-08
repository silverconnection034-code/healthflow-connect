import { BarChart3, Download, TrendingUp, Users, Receipt, Pill } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="module-page">
      <PageHeader title="Reports" description="Financial & operational analytics" icon={BarChart3}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="KES 0" icon={TrendingUp} variant="primary" subtitle="This month" />
        <StatCard title="Total Patients" value={0} icon={Users} variant="success" subtitle="This month" />
        <StatCard title="Invoices" value={0} icon={Receipt} variant="warning" subtitle="Generated" />
        <StatCard title="Drugs Dispensed" value={0} icon={Pill} variant="default" subtitle="This month" />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
          <TabsTrigger value="pharmacy">Drug Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card><CardHeader><CardTitle className="text-base font-display">Revenue Trends</CardTitle></CardHeader>
            <CardContent><EmptyState icon={TrendingUp} title="No data yet" description="Revenue charts will appear once billing data is available." /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="patients">
          <Card><CardHeader><CardTitle className="text-base font-display">Patient Trends</CardTitle></CardHeader>
            <CardContent><EmptyState icon={Users} title="No data yet" description="Patient registration trends will be shown here." /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="insurance">
          <Card><CardHeader><CardTitle className="text-base font-display">Insurance Claims</CardTitle></CardHeader>
            <CardContent><EmptyState icon={BarChart3} title="No data yet" description="NHIF/SHA claim reports will appear here." /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pharmacy">
          <Card><CardHeader><CardTitle className="text-base font-display">Drug Usage</CardTitle></CardHeader>
            <CardContent><EmptyState icon={Pill} title="No data yet" description="Drug dispensing reports will be shown here." /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
