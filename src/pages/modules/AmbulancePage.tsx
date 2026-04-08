import { useState, useEffect, useCallback } from 'react';
import { Ambulance, MapPin, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AmbulancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRequest, setShowRequest] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pickup_location: '', destination: '', priority: 'normal', notes: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const { data } = await supabase.from('ambulance_requests').select('*').eq('hospital_id', hospitalId).order('created_at', { ascending: false });
    setRequests(data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitRequest = async () => {
    if (!hospitalId) return;
    setLoading(true);
    const { error } = await supabase.from('ambulance_requests').insert({
      hospital_id: hospitalId, pickup_location: form.pickup_location,
      destination: form.destination, priority: form.priority, notes: form.notes || null,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Request submitted' }); setShowRequest(false); setForm({ pickup_location: '', destination: '', priority: 'normal', notes: '' }); fetchData(); }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ambulance_requests').update({ status, driver_id: user?.id }).eq('id', id);
    fetchData();
  };

  const active = requests.filter(r => r.status === 'on_trip' || r.status === 'assigned');
  const pending = requests.filter(r => r.status === 'pending');
  const completed = requests.filter(r => r.status === 'completed');

  const priorityColor = (p: string) => p === 'emergency' ? 'bg-destructive/10 text-destructive' : p === 'urgent' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground';

  const renderTable = (items: any[]) => (
    <Table>
      <TableHeader><TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
      <TableBody>{items.map(r => (
        <TableRow key={r.id}>
          <TableCell>{r.pickup_location}</TableCell><TableCell>{r.destination}</TableCell>
          <TableCell><Badge className={priorityColor(r.priority)}>{r.priority}</Badge></TableCell>
          <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
          <TableCell className="space-x-1">
            {r.status === 'pending' && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'assigned')}>Assign</Button>}
            {r.status === 'assigned' && <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'on_trip')}>Start Trip</Button>}
            {r.status === 'on_trip' && <Button size="sm" onClick={() => updateStatus(r.id, 'completed')}>Complete</Button>}
          </TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );

  return (
    <div className="module-page">
      <PageHeader title="Ambulance" description="Ambulance dispatch & tracking" icon={Ambulance} actionLabel="New Request" onAction={() => setShowRequest(true)} />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active"><div className="data-table-wrapper">{active.length === 0 ? <EmptyState icon={Ambulance} title="No active trips" description="Active trips appear here." /> : renderTable(active)}</div></TabsContent>
        <TabsContent value="pending"><div className="data-table-wrapper">{pending.length === 0 ? <EmptyState icon={Ambulance} title="No pending requests" description="Pending requests appear here." /> : renderTable(pending)}</div></TabsContent>
        <TabsContent value="completed"><div className="data-table-wrapper">{completed.length === 0 ? <EmptyState icon={Ambulance} title="No completed trips" /> : renderTable(completed)}</div></TabsContent>
      </Tabs>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">New Ambulance Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Pickup *</Label><Input value={form.pickup_location} onChange={e => setForm(p => ({ ...p, pickup_location: e.target.value }))} placeholder="Pickup address" /></div>
            <div className="space-y-2"><Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Destination *</Label><Input value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="Destination" /></div>
            <div className="space-y-2"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Details..." /></div>
          </div>
          <Button className="w-full mt-2" onClick={submitRequest} disabled={loading || !form.pickup_location || !form.destination}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
