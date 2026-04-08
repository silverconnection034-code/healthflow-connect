import { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Download, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/shared/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function InsurancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showClaim, setShowClaim] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ patient_id: '', provider: '', membership_number: '', services: '', total_amount: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const [cRes, pRes] = await Promise.all([
      supabase.from('insurance_claims').select('*, patients(full_name)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }),
      supabase.from('patients').select('id, full_name').eq('hospital_id', hospitalId),
    ]);
    setClaims(cRes.data || []);
    setPatients(pRes.data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitClaim = async () => {
    if (!hospitalId) return;
    setLoading(true);
    const { error } = await supabase.from('insurance_claims').insert({
      hospital_id: hospitalId, patient_id: form.patient_id, provider: form.provider,
      membership_number: form.membership_number,
      services: form.services.split(',').map(s => s.trim()) as any,
      total_amount: parseFloat(form.total_amount) || 0,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Claim submitted' }); setShowClaim(false); fetchData(); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('insurance_claims').update({ status }).eq('id', id);
    fetchData();
  };

  const totalApproved = claims.filter(c => c.status === 'approved' || c.status === 'paid').reduce((s, c) => s + Number(c.total_amount), 0);
  const pending = claims.filter(c => c.status === 'submitted' || c.status === 'under_review');

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/10 text-success';
    if (s === 'approved') return 'bg-primary/10 text-primary';
    if (s === 'rejected') return 'bg-destructive/10 text-destructive';
    return 'bg-warning/10 text-warning';
  };

  return (
    <div className="module-page">
      <PageHeader title="Insurance & NHIF/SHA" description="Manage insurance claims" icon={Shield}>
        <Button onClick={() => setShowClaim(true)}>New Claim</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Claims" value={claims.length} icon={Shield} variant="primary" />
        <StatCard title="Approved" value={`KES ${totalApproved.toLocaleString()}`} icon={Shield} variant="success" />
        <StatCard title="Pending" value={pending.length} icon={Shield} variant="warning" />
        <StatCard title="Rejected" value={claims.filter(c => c.status === 'rejected').length} icon={Shield} variant="destructive" />
      </div>

      <div className="data-table-wrapper">
        {claims.length === 0 ? <EmptyState icon={Shield} title="No claims" description="Create claims for NHIF/SHA services." actionLabel="New Claim" onAction={() => setShowClaim(true)} /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Provider</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>{claims.map(c => (
              <TableRow key={c.id}>
                <TableCell>{(c as any).patients?.full_name}</TableCell>
                <TableCell className="uppercase font-medium">{c.provider}</TableCell>
                <TableCell>KES {Number(c.total_amount).toLocaleString()}</TableCell>
                <TableCell><Badge className={statusColor(c.status)}>{c.status}</Badge></TableCell>
                <TableCell className="space-x-1">
                  {c.status === 'submitted' && <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'approved')}>Approve</Button>}
                  {c.status === 'approved' && <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'paid')}>Mark Paid</Button>}
                </TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showClaim} onOpenChange={setShowClaim}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">New Insurance Claim</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient *</Label>
              <Select value={form.patient_id} onValueChange={v => setForm(p => ({ ...p, patient_id: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Provider *</Label>
                <Select value={form.provider} onValueChange={v => setForm(p => ({ ...p, provider: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="nhif">NHIF</SelectItem><SelectItem value="sha">SHA</SelectItem></SelectContent>
                </Select></div>
              <div className="space-y-2"><Label>Member #</Label><Input value={form.membership_number} onChange={e => setForm(p => ({ ...p, membership_number: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Services (comma-separated)</Label><Input value={form.services} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} placeholder="Consultation, Lab, Drugs" /></div>
            <div className="space-y-2"><Label>Total Amount (KES)</Label><Input type="number" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
          </div>
          <Button className="w-full mt-2" onClick={submitClaim} disabled={loading || !form.patient_id || !form.provider}>
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
