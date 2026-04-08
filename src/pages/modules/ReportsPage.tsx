import { useEffect, useState, useCallback } from 'react';
import { BarChart3, Download, TrendingUp, Users, Receipt, Pill } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, patients: 0, invoices: 0, drugsDispensed: 0 });

  useEffect(() => {
    if (!user?.hospital_id) return;
    const hid = user.hospital_id;
    const fetchStats = async () => {
      const [invRes, patRes, rxRes] = await Promise.all([
        supabase.from('invoices').select('paid_amount').eq('hospital_id', hid),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hid),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).eq('status', 'dispensed'),
      ]);
      setStats({
        revenue: (invRes.data || []).reduce((s, i) => s + Number(i.paid_amount), 0),
        patients: patRes.count || 0,
        invoices: invRes.data?.length || 0,
        drugsDispensed: rxRes.count || 0,
      });
    };
    fetchStats();
  }, [user?.hospital_id]);

  return (
    <div className="module-page">
      <PageHeader title="Reports" description="Financial & operational analytics" icon={BarChart3}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export CSV</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`KES ${stats.revenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle="All time" />
        <StatCard title="Total Patients" value={stats.patients} icon={Users} variant="success" />
        <StatCard title="Invoices" value={stats.invoices} icon={Receipt} variant="warning" />
        <StatCard title="Drugs Dispensed" value={stats.drugsDispensed} icon={Pill} variant="default" />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList><TabsTrigger value="revenue">Revenue</TabsTrigger><TabsTrigger value="patients">Patients</TabsTrigger><TabsTrigger value="insurance">Insurance</TabsTrigger><TabsTrigger value="pharmacy">Pharmacy</TabsTrigger></TabsList>
        {['revenue', 'patients', 'insurance', 'pharmacy'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card className="glass-panel"><CardHeader><CardTitle className="text-base font-display capitalize">{tab} Overview</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground text-center py-8">Charts will populate as data grows. Current data is reflected in the stat cards above.</p></CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
