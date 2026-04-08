import { useState, useEffect, useCallback } from 'react';
import { Users, Search, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
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
  accountant: 'Accountant', driver: 'Driver',
};

const staffRoles = ['receptionist', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'accountant', 'driver'];

export default function StaffPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', role: '' });

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
    if (!hospitalId || !form.email || !form.role) return;
    setLoading(true);
    // Create user via admin invite (sign up with temp password)
    const tempPassword = `Temp${Date.now()}!`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email, password: tempPassword,
      options: { data: { full_name: form.full_name } },
    });

    if (authError || !authData.user) {
      toast({ title: 'Error', description: authError?.message || 'Failed to create user', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Update profile
    await supabase.from('profiles').update({ hospital_id: hospitalId, full_name: form.full_name, phone: form.phone }).eq('user_id', authData.user.id);
    // Assign role
    await supabase.from('user_roles').insert({ user_id: authData.user.id, hospital_id: hospitalId, role: form.role as any });

    toast({ title: 'Staff added', description: `${form.full_name} added as ${ROLE_LABELS[form.role]}` });
    setShowAdd(false);
    setForm({ full_name: '', email: '', phone: '', role: '' });
    fetchData();
    setLoading(false);
  };

  const toggleActive = async (staffMember: any) => {
    await supabase.from('profiles').update({ is_active: !staffMember.is_active }).eq('id', staffMember.id);
    fetchData();
  };

  const filtered = staff.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="module-page">
      <PageHeader title="Staff Management" description="Manage hospital staff & roles" icon={Users} actionLabel="Add Staff" onAction={() => setShowAdd(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="data-table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No staff" description="Add staff members to your hospital." actionLabel="Add Staff" onAction={() => setShowAdd(true)} />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.full_name}</TableCell>
                <TableCell>{s.phone || '—'}</TableCell>
                <TableCell><Badge variant="secondary">{ROLE_LABELS[s.role] || s.role}</Badge></TableCell>
                <TableCell><Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Staff name" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="staff@hospital.co.ke" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254" /></div>
            <div className="space-y-2"><Label className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Role *</Label>
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{staffRoles.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
              </Select></div>
          </div>
          <Button className="w-full mt-2" onClick={addStaff} disabled={loading || !form.full_name || !form.email || !form.role}>
            {loading ? 'Adding...' : 'Add Staff'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
