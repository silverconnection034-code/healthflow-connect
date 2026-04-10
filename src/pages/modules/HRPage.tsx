import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Search, UserPlus, ShieldCheck, Loader2, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ROLE_LABELS: Record<string, string> = {
  hospital_admin: 'Hospital Admin', receptionist: 'Receptionist', doctor: 'Doctor',
  nurse: 'Nurse', pharmacist: 'Pharmacist', lab_technician: 'Lab Technician',
  accountant: 'Accountant', driver: 'Driver', hr: 'HR Manager',
};

const staffRoles = ['receptionist', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'accountant', 'driver', 'hr'];

export default function HRPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: '', password: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const { data: roles } = await supabase.from('user_roles').select('user_id, role').eq('hospital_id', hospitalId);
    if (!roles || roles.length === 0) { setStaff([]); return; }
    const ids = roles.map(r => r.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', ids);
    setStaff((profiles || []).map(p => ({ ...p, role: roles.find(r => r.user_id === p.user_id)?.role || 'unknown' })));
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addStaff = async () => {
    if (!hospitalId || !form.email || !form.role || !form.password) return;
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (authError || !authData.user) {
      toast({ title: 'Error', description: authError?.message || 'Failed to create user', variant: 'destructive' });
      setLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    await supabase.from('profiles').update({ hospital_id: hospitalId, full_name: form.full_name, phone: form.phone }).eq('user_id', authData.user.id);
    await supabase.from('user_roles').insert({ user_id: authData.user.id, hospital_id: hospitalId, role: form.role as any });

    toast({ title: 'Staff added', description: `${form.full_name} added as ${ROLE_LABELS[form.role]}. Login: ${form.email} / ${form.password}` });
    setShowAdd(false);
    setForm({ full_name: '', email: '', phone: '', role: '', password: '' });
    fetchData();
    setLoading(false);
  };

  const toggleActive = async (staffMember: any) => {
    await supabase.from('profiles').update({ is_active: !staffMember.is_active }).eq('id', staffMember.id);
    fetchData();
  };

  const filtered = staff.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));
  const roleCount = (r: string) => staff.filter(s => s.role === r).length;

  return (
    <div className="module-page">
      <PageHeader title="HR Department" description="Staff management, roles & employment — NO patient/financial data" icon={Briefcase} actionLabel="Add Staff" onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={staff.length} icon={Users} variant="primary" subtitle="All roles" />
        <StatCard title="Doctors" value={roleCount('doctor')} icon={Users} variant="success" subtitle="Active" />
        <StatCard title="Nurses" value={roleCount('nurse')} icon={Users} variant="warning" subtitle="Active" />
        <StatCard title="Other Staff" value={staff.length - roleCount('doctor') - roleCount('nurse')} icon={Users} variant="default" subtitle="All other" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="data-table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No staff members" description="Add staff to your hospital." actionLabel="Add Staff" onAction={() => setShowAdd(true)} />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>{s.phone || '—'}</TableCell>
                <TableCell><Badge variant="secondary">{ROLE_LABELS[s.role] || s.role}</Badge></TableCell>
                <TableCell>{s.is_active ? <Badge className="bg-success/10 text-success">Active</Badge> : <Badge className="bg-destructive/10 text-destructive">Inactive</Badge>}</TableCell>
                <TableCell><Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add New Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Staff name" /></div>
            <div className="space-y-2"><Label>Email (Login) *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="staff@hospital.co.ke" /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="text" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Set login password" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254" /></div>
            <div className="space-y-2"><Label className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Role *</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{staffRoles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
              </Select></div>
          </div>
          <Button className="w-full mt-2" onClick={addStaff} disabled={loading || !form.full_name || !form.email || !form.role || !form.password}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Staff Account'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">Staff will use the email and password above to log in.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
