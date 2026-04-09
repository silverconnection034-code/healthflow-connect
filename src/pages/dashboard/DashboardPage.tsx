import { useEffect, useState } from 'react';
import {
  Users, Calendar, Receipt, TrendingUp, AlertTriangle, Clock,
  Stethoscope, HeartPulse, Pill, FlaskConical, Ambulance, Activity,
  UserPlus, CheckCircle, BarChart3
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, totalPatients: 0, appointments: 0, revenue: 0, pendingBills: 0, staff: 0, prescriptions: 0, labTests: 0, ambulance: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.hospital_id) return;
    const hid = user.hospital_id;
    const today = new Date().toISOString().split('T')[0];

    const fetchStats = async () => {
      const [patientsRes, totalPatientsRes, appointmentsRes, invoicesRes, lowStockRes, auditRes, staffRes, rxRes, labRes, ambRes, recentPRes, todayARes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).gte('created_at', today),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hid),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).gte('scheduled_at', today),
        supabase.from('invoices').select('total_amount, paid_amount, status').eq('hospital_id', hid),
        supabase.from('inventory').select('id, name, quantity, reorder_level').eq('hospital_id', hid),
        supabase.from('audit_logs').select('*').eq('hospital_id', hid).order('created_at', { ascending: false }).limit(8),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('hospital_id', hid),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).eq('status', 'prescribed'),
        supabase.from('lab_tests').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).in('status', ['requested', 'in_progress']),
        supabase.from('ambulance_requests').select('id', { count: 'exact', head: true }).eq('hospital_id', hid).in('status', ['pending', 'dispatched']),
        supabase.from('patients').select('id, full_name, patient_number, created_at').eq('hospital_id', hid).order('created_at', { ascending: false }).limit(5),
        supabase.from('appointments').select('*, patients(full_name)').eq('hospital_id', hid).gte('scheduled_at', today).order('scheduled_at').limit(6),
      ]);

      const invoices = invoicesRes.data || [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
      const pendingBills = invoices.filter(inv => inv.status !== 'paid').length;

      setStats({
        patients: patientsRes.count || 0,
        totalPatients: totalPatientsRes.count || 0,
        appointments: appointmentsRes.count || 0,
        revenue: totalRevenue,
        pendingBills,
        staff: staffRes.count || 0,
        prescriptions: rxRes.count || 0,
        labTests: labRes.count || 0,
        ambulance: ambRes.count || 0,
      });

      const lowStock = (lowStockRes.data || []).filter(item => item.quantity <= item.reorder_level);
      setAlerts(lowStock.map(item => ({ id: item.id, message: `${item.name} — only ${item.quantity} left (reorder at ${item.reorder_level})`, type: 'stock' })));
      setRecentActivity(auditRes.data || []);
      setRecentPatients(recentPRes.data || []);
      setTodayAppointments(todayARes.data || []);
    };

    fetchStats();
  }, [user?.hospital_id]);

  return (
    <div className="module-page">
      <PageHeader title="Hospital Dashboard" description="Overview at a glance — Abancool Technology HMS" icon={BarChart3} />

      {/* Primary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" subtitle="All time" />
        <StatCard title="Today's Visits" value={stats.patients} icon={UserPlus} variant="success" subtitle="Registered today" />
        <StatCard title="Appointments" value={stats.appointments} icon={Calendar} variant="warning" subtitle="Scheduled today" />
        <StatCard title="Revenue" value={`KES ${stats.revenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle="Total collected" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon={Receipt} variant="destructive" subtitle="Unpaid invoices" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Staff Members" value={stats.staff} icon={Users} variant="default" />
        <StatCard title="Pending Rx" value={stats.prescriptions} icon={Pill} variant="warning" subtitle="Undispensed" />
        <StatCard title="Lab Queue" value={stats.labTests} icon={FlaskConical} variant="primary" subtitle="Pending/In Progress" />
        <StatCard title="Ambulance" value={stats.ambulance} icon={Ambulance} variant="destructive" subtitle="Active requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No appointments scheduled today.</p>
            ) : (
              <ul className="space-y-2">
                {todayAppointments.map(a => (
                  <li key={a.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium">{(a as any).patients?.full_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-success" /> Recent Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No patients registered yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentPatients.map(p => (
                  <li key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium">{p.full_name}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">{p.patient_number}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All systems running smoothly.</p>
              </div>
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
      </div>

      {/* Activity Log */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Activity will appear here as staff use the system.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentActivity.map(log => (
                <div key={log.id} className="text-sm flex justify-between items-start p-2 rounded-lg bg-muted/50">
                  <span><span className="font-medium">{log.action}</span> — {log.entity_type}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
