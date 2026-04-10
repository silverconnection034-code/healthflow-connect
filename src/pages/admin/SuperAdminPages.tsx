import { useEffect, useState } from 'react';
import { Building2, Search, CreditCard, BarChart3, TrendingUp, CheckCircle, XCircle, Users, Activity, Globe, AlertTriangle, Snowflake, Power } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function SuperAdminHospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [hospRes, usersRes, patientsRes] = await Promise.all([
        supabase.from('hospitals').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        supabase.from('patients').select('id', { count: 'exact', head: true }),
      ]);
      setHospitals(hospRes.data || []);
      setTotalUsers(usersRes.count || 0);
      setTotalPatients(patientsRes.count || 0);
      // Monthly revenue = active hospitals * 5000
      const activeHospitals = (hospRes.data || []).filter(h => h.subscription_status === 'active');
      setMonthlyRevenue(activeHospitals.length * 5000);
    };
    fetchData();
  }, []);

  const freezeHospital = async (h: any) => {
    await supabase.from('hospitals').update({ is_active: false, subscription_status: 'suspended' }).eq('id', h.id);
    setHospitals(prev => prev.map(x => x.id === h.id ? { ...x, is_active: false, subscription_status: 'suspended' } : x));
  };

  const activateHospital = async (h: any) => {
    const newEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    await supabase.from('hospitals').update({ is_active: true, subscription_status: 'active', subscription_end: newEnd }).eq('id', h.id);
    setHospitals(prev => prev.map(x => x.id === h.id ? { ...x, is_active: true, subscription_status: 'active', subscription_end: newEnd } : x));
  };

  const active = hospitals.filter(h => h.is_active && (h.subscription_status === 'active' || h.subscription_status === 'trial'));
  const suspended = hospitals.filter(h => !h.is_active || h.subscription_status === 'suspended' || h.subscription_status === 'expired');
  const trial = hospitals.filter(h => h.subscription_status === 'trial');
  const filtered = hospitals.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  const statusColor = (s: string, isActive: boolean) => {
    if (!isActive || s === 'suspended') return 'bg-destructive/10 text-destructive';
    if (s === 'active') return 'bg-success/10 text-success';
    if (s === 'trial') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="module-page">
      <PageHeader title="Super Admin — Platform Control" description="Abancool Technology HMS — Manage all hospitals, subscriptions & access" icon={Globe} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <StatCard title="Total Hospitals" value={hospitals.length} icon={Building2} variant="primary" />
        <StatCard title="Active" value={active.length} icon={CheckCircle} variant="success" />
        <StatCard title="Suspended" value={suspended.length} icon={Snowflake} variant="destructive" />
        <StatCard title="Trial" value={trial.length} icon={Building2} variant="warning" />
        <StatCard title="Total Users" value={totalUsers} icon={Users} variant="primary" />
        <StatCard title="Total Patients" value={totalPatients} icon={Activity} variant="success" />
        <StatCard title="Monthly Revenue" value={`KES ${monthlyRevenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle="KES 5,000/hospital" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hospitals..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="data-table-wrapper">
        {filtered.length === 0 ? <EmptyState icon={Building2} title="No hospitals" description="Hospitals that register will appear here." /> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Hospital</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Subscription End</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>{filtered.map(h => (
              <TableRow key={h.id} className={!h.is_active ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell className="text-sm">{h.email}</TableCell>
                <TableCell className="text-sm">{h.phone}</TableCell>
                <TableCell>{h.location}</TableCell>
                <TableCell><Badge className={statusColor(h.subscription_status, h.is_active)}>{!h.is_active ? 'FROZEN' : h.subscription_status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{h.subscription_end ? new Date(h.subscription_end).toLocaleDateString() : '—'}</TableCell>
                <TableCell className="space-x-2">
                  {h.is_active ? (
                    <Button size="sm" variant="destructive" onClick={() => freezeHospital(h)}><Snowflake className="h-3 w-3 mr-1" />Freeze</Button>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => activateHospital(h)}><Power className="h-3 w-3 mr-1" />Activate</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>

      <div className="text-center pt-4 border-t border-border">
        <p className="text-sm font-bold text-primary">Powered by Abancool Technology</p>
        <p className="text-xs text-muted-foreground">0728825152 / 01116679286</p>
      </div>
    </div>
  );
}

export function SuperAdminSubscriptionsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  useEffect(() => { supabase.from('hospitals').select('*').order('created_at', { ascending: false }).then(({ data }) => setHospitals(data || [])); }, []);

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-success/10 text-success';
    if (s === 'trial') return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };

  return (
    <div className="module-page">
      <PageHeader title="Subscriptions" description="Hospital subscription tracking — KES 5,000/month" icon={CreditCard} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active" value={hospitals.filter(h => h.subscription_status === 'active').length} icon={CheckCircle} variant="success" />
        <StatCard title="Trial" value={hospitals.filter(h => h.subscription_status === 'trial').length} icon={Building2} variant="warning" />
        <StatCard title="Expired/Suspended" value={hospitals.filter(h => h.subscription_status === 'expired' || h.subscription_status === 'suspended').length} icon={XCircle} variant="destructive" />
      </div>
      <div className="data-table-wrapper">
        {hospitals.length === 0 ? <EmptyState icon={CreditCard} title="No subscriptions" description="Hospital subscription plans appear here." /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Hospital</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead></TableRow></TableHeader>
            <TableBody>{hospitals.map(h => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell>KES 5,000/mo</TableCell>
                <TableCell><Badge className={statusColor(h.subscription_status)}>{h.subscription_status}</Badge></TableCell>
                <TableCell className="text-xs">{h.subscription_start ? new Date(h.subscription_start).toLocaleDateString() : '—'}</TableCell>
                <TableCell className="text-xs">{h.subscription_end ? new Date(h.subscription_end).toLocaleDateString() : '—'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export function SuperAdminRevenuePage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      supabase.from('hospitals').select('*'),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
    ]).then(([hRes, tRes]) => {
      setHospitals(hRes.data || []);
      setTransactions(tRes.data || []);
    });
  }, []);

  const activeHospitals = hospitals.filter(h => h.subscription_status === 'active').length;
  const monthlyRevenue = activeHospitals * 5000;
  const totalTransactions = transactions.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="module-page">
      <PageHeader title="Platform Revenue" description="Revenue from hospital subscriptions" icon={BarChart3} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Monthly Revenue" value={`KES ${monthlyRevenue.toLocaleString()}`} icon={TrendingUp} variant="primary" subtitle={`${activeHospitals} active × KES 5,000`} />
        <StatCard title="Annual Projection" value={`KES ${(monthlyRevenue * 12).toLocaleString()}`} icon={BarChart3} variant="success" subtitle="12 months" />
        <StatCard title="Transaction Revenue" value={`KES ${totalTransactions.toLocaleString()}`} icon={CreditCard} variant="primary" subtitle="From payments" />
        <StatCard title="Total Transactions" value={transactions.length} icon={Activity} variant="default" />
      </div>
      <div className="data-table-wrapper">
        {transactions.length === 0 ? <EmptyState icon={BarChart3} title="No revenue data" description="Revenue from subscriptions will be tracked here." /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Phone</TableHead><TableHead>Amount</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>{transactions.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.reference_id}</TableCell>
                <TableCell>{t.phone}</TableCell>
                <TableCell className="font-medium">KES {Number(t.amount).toLocaleString()}</TableCell>
                <TableCell className="uppercase text-xs">{t.provider}</TableCell>
                <TableCell><Badge variant={t.status === 'success' ? 'default' : 'secondary'}>{t.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
