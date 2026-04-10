import { useEffect, useState } from 'react';
import {
  Users, Calendar, Receipt, TrendingUp, AlertTriangle, Clock,
  Stethoscope, HeartPulse, Pill, FlaskConical, Ambulance, Activity,
  UserPlus, CheckCircle, BarChart3, Building2, Shield, CreditCard,
  FileText, MapPin, Package
} from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/* ─── HOSPITAL ADMIN DASHBOARD ─── */
function AdminDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ patients: 0, totalPatients: 0, appointments: 0, revenue: 0, pendingBills: 0, staff: 0, prescriptions: 0, labTests: 0, ambulance: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fetchStats = async () => {
      const [patientsRes, totalPatientsRes, appointmentsRes, invoicesRes, lowStockRes, auditRes, staffRes, rxRes, labRes, ambRes, recentPRes, todayARes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).gte('created_at', today),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).gte('scheduled_at', today),
        supabase.from('invoices').select('total_amount, paid_amount, status').eq('hospital_id', hospitalId),
        supabase.from('inventory').select('id, name, quantity, reorder_level').eq('hospital_id', hospitalId),
        supabase.from('audit_logs').select('*').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(8),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('status', 'prescribed'),
        supabase.from('lab_tests').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).in('status', ['requested', 'in_progress']),
        supabase.from('ambulance_requests').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).in('status', ['pending', 'assigned']),
        supabase.from('patients').select('id, full_name, patient_number, created_at').eq('hospital_id', hospitalId).order('created_at', { ascending: false }).limit(5),
        supabase.from('appointments').select('*, patients(full_name)').eq('hospital_id', hospitalId).gte('scheduled_at', today).order('scheduled_at').limit(6),
      ]);
      const invoices = invoicesRes.data || [];
      const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
      const pendingBills = invoices.filter(inv => inv.status !== 'paid').length;
      setStats({ patients: patientsRes.count || 0, totalPatients: totalPatientsRes.count || 0, appointments: appointmentsRes.count || 0, revenue: totalRevenue, pendingBills, staff: staffRes.count || 0, prescriptions: rxRes.count || 0, labTests: labRes.count || 0, ambulance: ambRes.count || 0 });
      const lowStock = (lowStockRes.data || []).filter(item => item.quantity <= item.reorder_level);
      setAlerts(lowStock.map(item => ({ id: item.id, message: `${item.name} — only ${item.quantity} left`, type: 'stock' })));
      setRecentActivity(auditRes.data || []);
      setRecentPatients(recentPRes.data || []);
      setTodayAppointments(todayARes.data || []);
    };
    fetchStats();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Hospital Admin Dashboard" description="Full hospital overview — Abancool Technology HMS" icon={BarChart3} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" subtitle="All time" />
        <StatCard title="Today's Visits" value={stats.patients} icon={UserPlus} variant="success" subtitle="Registered today" />
        <StatCard title="Appointments" value={stats.appointments} icon={Calendar} variant="warning" subtitle="Scheduled today" />
        <StatCard title="Revenue" value={`KES ${stats.revenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle="Total collected" />
        <StatCard title="Pending Bills" value={stats.pendingBills} icon={Receipt} variant="destructive" subtitle="Unpaid invoices" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Staff Members" value={stats.staff} icon={Users} variant="default" />
        <StatCard title="Pending Rx" value={stats.prescriptions} icon={Pill} variant="warning" subtitle="Undispensed" />
        <StatCard title="Lab Queue" value={stats.labTests} icon={FlaskConical} variant="primary" subtitle="Pending" />
        <StatCard title="Ambulance" value={stats.ambulance} icon={Ambulance} variant="destructive" subtitle="Active" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Today's Schedule</CardTitle></CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No appointments today.</p> : (
              <ul className="space-y-2">{todayAppointments.map(a => (
                <li key={a.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <div><span className="font-medium">{(a as any).patients?.full_name}</span><span className="text-xs text-muted-foreground ml-2">{new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <Badge variant="secondary" className="text-xs">{a.status}</Badge>
                </li>
              ))}</ul>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><UserPlus className="h-4 w-4 text-success" /> Recent Patients</CardTitle></CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No patients yet.</p> : (
              <ul className="space-y-2">{recentPatients.map(p => (
                <li key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                  <div><span className="font-medium">{p.full_name}</span><span className="text-xs text-muted-foreground ml-2 font-mono">{p.patient_number}</span></div>
                  <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                </li>
              ))}</ul>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Alerts</CardTitle></CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-6"><CheckCircle className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-sm text-muted-foreground">All systems running smoothly.</p></div>
            ) : (
              <ul className="space-y-2">{alerts.map(a => (
                <li key={a.id} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-warning/5 border border-warning/20"><AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" /><span>{a.message}</span></li>
              ))}</ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="glass-panel">
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Activity will appear here.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{recentActivity.map(log => (
              <div key={log.id} className="text-sm flex justify-between items-start p-2 rounded-lg bg-muted/50">
                <span><span className="font-medium">{log.action}</span> — {log.entity_type}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── RECEPTIONIST DASHBOARD ─── */
function ReceptionistDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ todayRegistered: 0, todayAppointments: 0, waiting: 0, totalPatients: 0 });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fetch = async () => {
      const [regRes, apptRes, waitRes, totalRes, listRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).gte('created_at', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).gte('scheduled_at', today),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).in('status', ['scheduled', 'checked_in']).gte('scheduled_at', today),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
        supabase.from('appointments').select('*, patients(full_name)').eq('hospital_id', hospitalId).gte('scheduled_at', today).order('scheduled_at').limit(10),
      ]);
      setStats({ todayRegistered: regRes.count || 0, todayAppointments: apptRes.count || 0, waiting: waitRes.count || 0, totalPatients: totalRes.count || 0 });
      setTodayAppointments(listRes.data || []);
    };
    fetch();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Reception Dashboard" description="Patient registration & appointments" icon={UserPlus} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Registered Today" value={stats.todayRegistered} icon={UserPlus} variant="success" subtitle="New patients" />
        <StatCard title="Appointments Today" value={stats.todayAppointments} icon={Calendar} variant="primary" subtitle="Scheduled" />
        <StatCard title="Waiting Patients" value={stats.waiting} icon={Clock} variant="warning" subtitle="In queue" />
        <StatCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="default" subtitle="All time" />
      </div>
      <Card className="glass-panel">
        <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Today's Queue</CardTitle></CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No appointments today.</p> : (
            <ul className="space-y-2">{todayAppointments.map(a => (
              <li key={a.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                <div><span className="font-medium">{(a as any).patients?.full_name}</span><span className="text-xs text-muted-foreground ml-2">{new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <Badge variant="secondary" className="text-xs">{a.status}</Badge>
              </li>
            ))}</ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── DOCTOR DASHBOARD ─── */
function DoctorDashboard({ hospitalId, userId }: { hospitalId: string; userId: string }) {
  const [stats, setStats] = useState({ myQueue: 0, todayAppointments: 0, records: 0, totalPatients: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fetch = async () => {
      const [qRes, tRes, rRes, pRes] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('doctor_id', userId).in('status', ['scheduled', 'checked_in', 'in_progress']),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('doctor_id', userId).gte('scheduled_at', today),
        supabase.from('medical_records').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).eq('doctor_id', userId),
        supabase.from('patients').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId),
      ]);
      setStats({ myQueue: qRes.count || 0, todayAppointments: tRes.count || 0, records: rRes.count || 0, totalPatients: pRes.count || 0 });
    };
    fetch();
  }, [hospitalId, userId]);

  return (
    <div className="module-page">
      <PageHeader title="Doctor Dashboard" description="Clinical overview — your patients & consultations" icon={Stethoscope} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="My Queue" value={stats.myQueue} icon={Users} variant="primary" subtitle="Waiting" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} variant="success" subtitle="Scheduled" />
        <StatCard title="Medical Records" value={stats.records} icon={FileText} variant="warning" subtitle="Created by you" />
        <StatCard title="Hospital Patients" value={stats.totalPatients} icon={Activity} variant="default" subtitle="Total" />
      </div>
    </div>
  );
}

/* ─── NURSE DASHBOARD ─── */
function NurseDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ waiting: 0, vitalsToday: 0, critical: 0, triaged: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fetch = async () => {
      const [waitRes, vitalsRes] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('hospital_id', hospitalId).in('status', ['scheduled', 'checked_in']).gte('scheduled_at', today),
        supabase.from('medical_records').select('vitals').eq('hospital_id', hospitalId).gte('created_at', today).not('vitals', 'eq', '{}'),
      ]);
      const vitals = vitalsRes.data || [];
      const critical = vitals.filter(r => { const v = (r.vitals as any) || {}; return v.temperature && parseFloat(v.temperature) > 38.5; }).length;
      setStats({ waiting: waitRes.count || 0, vitalsToday: vitals.length, critical, triaged: vitals.length });
    };
    fetch();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Nurse Station Dashboard" description="Triage & patient vitals" icon={HeartPulse} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Waiting Patients" value={stats.waiting} icon={Clock} variant="warning" subtitle="In queue" />
        <StatCard title="Vitals Recorded" value={stats.vitalsToday} icon={Activity} variant="success" subtitle="Today" />
        <StatCard title="Triaged Today" value={stats.triaged} icon={HeartPulse} variant="primary" subtitle="Sent to doctor" />
        <StatCard title="Critical Alerts" value={stats.critical} icon={AlertTriangle} variant="destructive" subtitle="High temp" />
      </div>
    </div>
  );
}

/* ─── ACCOUNTANT DASHBOARD ─── */
function AccountantDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ totalRevenue: 0, todayRevenue: 0, pending: 0, paid: 0, weekRevenue: 0, monthRevenue: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const fetch = async () => {
      const { data: invoices } = await supabase.from('invoices').select('total_amount, paid_amount, status, created_at').eq('hospital_id', hospitalId);
      const all = invoices || [];
      const totalRevenue = all.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      const todayRevenue = all.filter(i => i.created_at >= today).reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      const weekRevenue = all.filter(i => i.created_at >= weekAgo).reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      const monthRevenue = all.filter(i => i.created_at >= monthAgo).reduce((s, i) => s + Number(i.paid_amount || 0), 0);
      const pending = all.filter(i => i.status !== 'paid').length;
      const paid = all.filter(i => i.status === 'paid').length;
      setStats({ totalRevenue, todayRevenue, pending, paid, weekRevenue, monthRevenue });
    };
    fetch();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Accounting Dashboard" description="Financial overview & billing" icon={Receipt} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle="All time" />
        <StatCard title="Today" value={`KES ${stats.todayRevenue.toLocaleString()}`} icon={CreditCard} variant="success" subtitle="Collected" />
        <StatCard title="This Week" value={`KES ${stats.weekRevenue.toLocaleString()}`} icon={CreditCard} variant="primary" subtitle="7 days" />
        <StatCard title="This Month" value={`KES ${stats.monthRevenue.toLocaleString()}`} icon={CreditCard} variant="primary" subtitle="30 days" />
        <StatCard title="Paid Invoices" value={stats.paid} icon={CheckCircle} variant="success" subtitle="Completed" />
        <StatCard title="Outstanding" value={stats.pending} icon={AlertTriangle} variant="destructive" subtitle="Unpaid" />
      </div>
    </div>
  );
}

/* ─── PHARMACIST DASHBOARD ─── */
function PharmacistDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ pending: 0, dispensed: 0, lowStock: 0, totalDrugs: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [rxRes, invRes] = await Promise.all([
        supabase.from('prescriptions').select('status').eq('hospital_id', hospitalId),
        supabase.from('inventory').select('quantity, reorder_level').eq('hospital_id', hospitalId),
      ]);
      const rxData = rxRes.data || [];
      const invData = invRes.data || [];
      setStats({
        pending: rxData.filter(r => r.status === 'prescribed').length,
        dispensed: rxData.filter(r => r.status === 'dispensed').length,
        lowStock: invData.filter(i => i.quantity <= i.reorder_level).length,
        totalDrugs: invData.length,
      });
    };
    fetch();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Pharmacy Dashboard" description="Drug inventory & dispensing" icon={Pill} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Pending Rx" value={stats.pending} icon={Pill} variant="warning" subtitle="To dispense" />
        <StatCard title="Dispensed" value={stats.dispensed} icon={CheckCircle} variant="success" subtitle="Completed" />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} variant="destructive" subtitle="Below reorder" />
        <StatCard title="Total Drugs" value={stats.totalDrugs} icon={Package} variant="default" subtitle="In inventory" />
      </div>
    </div>
  );
}

/* ─── LAB TECH DASHBOARD ─── */
function LabTechDashboard({ hospitalId }: { hospitalId: string }) {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('lab_tests').select('status').eq('hospital_id', hospitalId);
      const tests = data || [];
      setStats({
        pending: tests.filter(t => t.status === 'requested').length,
        inProgress: tests.filter(t => t.status === 'in_progress').length,
        completed: tests.filter(t => t.status === 'completed').length,
        total: tests.length,
      });
    };
    fetch();
  }, [hospitalId]);

  return (
    <div className="module-page">
      <PageHeader title="Laboratory Dashboard" description="Test processing & results" icon={FlaskConical} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Pending Tests" value={stats.pending} icon={AlertTriangle} variant="warning" subtitle="Awaiting" />
        <StatCard title="In Progress" value={stats.inProgress} icon={FlaskConical} variant="primary" subtitle="Processing" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} variant="success" subtitle="Results ready" />
        <StatCard title="Total Tests" value={stats.total} icon={FlaskConical} variant="default" subtitle="All time" />
      </div>
    </div>
  );
}

/* ─── DRIVER DASHBOARD ─── */
function DriverDashboard({ hospitalId, userId }: { hospitalId: string; userId: string }) {
  const [stats, setStats] = useState({ assigned: 0, onTrip: 0, completed: 0, total: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('ambulance_requests').select('status, driver_id').eq('hospital_id', hospitalId);
      const all = data || [];
      const mine = all.filter(r => r.driver_id === userId);
      setStats({
        assigned: mine.filter(r => r.status === 'assigned').length,
        onTrip: mine.filter(r => r.status === 'on_trip').length,
        completed: mine.filter(r => r.status === 'completed').length,
        total: all.filter(r => r.status === 'pending').length,
      });
    };
    fetch();
  }, [hospitalId, userId]);

  return (
    <div className="module-page">
      <PageHeader title="Driver Dashboard" description="Ambulance trips & dispatch" icon={Ambulance} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Assigned to Me" value={stats.assigned} icon={MapPin} variant="primary" subtitle="Pending pickup" />
        <StatCard title="On Trip" value={stats.onTrip} icon={Ambulance} variant="warning" subtitle="Active" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} variant="success" subtitle="My trips" />
        <StatCard title="Pending Requests" value={stats.total} icon={Clock} variant="destructive" subtitle="Unassigned" />
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD ROUTER ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id;
  const role = user?.role;

  if (!hospitalId || !user) {
    return <div className="module-page"><p className="text-muted-foreground">Loading...</p></div>;
  }

  switch (role) {
    case 'hospital_admin':
      return <AdminDashboard hospitalId={hospitalId} />;
    case 'receptionist':
      return <ReceptionistDashboard hospitalId={hospitalId} />;
    case 'doctor':
      return <DoctorDashboard hospitalId={hospitalId} userId={user.id} />;
    case 'nurse':
      return <NurseDashboard hospitalId={hospitalId} />;
    case 'accountant':
      return <AccountantDashboard hospitalId={hospitalId} />;
    case 'pharmacist':
      return <PharmacistDashboard hospitalId={hospitalId} />;
    case 'lab_technician':
      return <LabTechDashboard hospitalId={hospitalId} />;
    case 'driver':
      return <DriverDashboard hospitalId={hospitalId} userId={user.id} />;
    default:
      return <AdminDashboard hospitalId={hospitalId} />;
  }
}
