import { useEffect, useState } from 'react';
import { Users, Calendar, Receipt, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, appointments: 0, revenue: 0, pendingBills: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.hospital_id) return;
    const hid = user.hospital_id;
    const today = new Date().toISOString().split('T')[0];

    const fetchStats = async () => {
      const [patientsRes, appointmentsRes, invoicesRes, lowStockRes, auditRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).gte('created_at', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).gte('scheduled_at', today),
        supabase.from('invoices').select('total_amount, paid_amount, status').eq('hospital_id', hid),
        supabase.from('inventory').select('id, name, quantity, reorder_level').eq('hospital_id', hid),
        supabase.from('audit_logs').select('*').eq('hospital_id', hid).order('created_at', { ascending: false }).limit(5),
      ]);

      const invoices = invoicesRes.data || [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
      const pendingBills = invoices.filter(inv => inv.status !== 'paid').length;

      setStats({
        patients: patientsRes.count || 0,
        appointments: appointmentsRes.count || 0,
        revenue: totalRevenue,
        pendingBills,
      });

      const lowStock = (lowStockRes.data || []).filter(item => item.quantity <= item.reorder_level);
      setAlerts(lowStock.map(item => ({ id: item.id, message: `${item.name} — only ${item.quantity} left (reorder at ${item.reorder_level})` })));
      setRecentActivity(auditRes.data || []);
    };

    fetchStats();
  }, [user?.hospital_id]);

  return (
    <div className="module-page">
      <PageHeader title="Dashboard" description="Hospital overview at a glance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Today" value={stats.patients} icon={Users} variant="primary" subtitle="Registered today" />
        <StatCard title="Appointments" value={stats.appointments} icon={Calendar} variant="success" subtitle="Scheduled today" />
        <StatCard title="Revenue Today" value={`KES ${stats.revenue.toLocaleString()}`} icon={TrendingUp} variant="warning" subtitle="Total collections" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon={Receipt} variant="destructive" subtitle="Awaiting payment" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">All systems running smoothly. Low stock alerts will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {alerts.map(a => (
                  <li key={a.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-warning/5 border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <span>{a.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Activity will appear here as staff use the system.</p>
            ) : (
              <ul className="space-y-2">
                {recentActivity.map(log => (
                  <li key={log.id} className="text-sm flex justify-between items-start p-2 rounded-lg bg-muted/50">
                    <span><span className="font-medium">{log.action}</span> — {log.entity_type}</span>
                    <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
