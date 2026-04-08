import { useState, useEffect, useCallback } from 'react';
import { Receipt, Search, CreditCard, Download, Loader2 } from 'lucide-react';
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

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedPatient, setSelectedPatient] = useState('');
  const [items, setItems] = useState<{ description: string; quantity: string; unit_price: string }[]>([{ description: '', quantity: '1', unit_price: '0' }]);

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const [iRes, pRes] = await Promise.all([
      supabase.from('invoices').select('*, patients(full_name)').eq('hospital_id', hospitalId).order('created_at', { ascending: false }),
      supabase.from('patients').select('id, full_name, patient_number').eq('hospital_id', hospitalId),
    ]);
    setInvoices(iRes.data || []);
    setPatients(pRes.data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const total = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0), 0);

  const createInvoice = async () => {
    if (!hospitalId || !selectedPatient) return;
    setLoading(true);
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const invoiceItems = items.map(i => ({
      description: i.description, category: 'other' as const, quantity: parseFloat(i.quantity) || 1,
      unit_price: parseFloat(i.unit_price) || 0, total: (parseFloat(i.quantity) || 1) * (parseFloat(i.unit_price) || 0),
    }));
    const { error } = await supabase.from('invoices').insert({
      hospital_id: hospitalId, patient_id: selectedPatient, invoice_number: invoiceNumber,
      items: invoiceItems as any, total_amount: total, paid_amount: 0,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Invoice created', description: invoiceNumber }); setShowInvoice(false); setItems([{ description: '', quantity: '1', unit_price: '0' }]); setSelectedPatient(''); fetchData(); }
    setLoading(false);
  };

  const markPaid = async (inv: any) => {
    await supabase.from('invoices').update({ status: 'paid', paid_amount: inv.total_amount }).eq('id', inv.id);
    toast({ title: 'Marked as paid' });
    fetchData();
  };

  const totalRevenue = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const paid = invoices.filter(i => i.status === 'paid');
  const unpaid = invoices.filter(i => i.status !== 'paid');

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-success/10 text-success';
    if (s === 'overdue') return 'bg-destructive/10 text-destructive';
    return 'bg-warning/10 text-warning';
  };

  const renderInvoiceTable = (list: any[]) => (
    <Table>
      <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Patient</TableHead><TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
      <TableBody>{list.map(inv => (
        <TableRow key={inv.id}>
          <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
          <TableCell>{(inv as any).patients?.full_name}</TableCell>
          <TableCell className="font-medium">KES {Number(inv.total_amount).toLocaleString()}</TableCell>
          <TableCell>KES {Number(inv.paid_amount).toLocaleString()}</TableCell>
          <TableCell><Badge className={statusColor(inv.status)}>{inv.status}</Badge></TableCell>
          <TableCell>{inv.status !== 'paid' && <Button size="sm" variant="outline" onClick={() => markPaid(inv)}>Mark Paid</Button>}</TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );

  return (
    <div className="module-page">
      <PageHeader title="Billing & Accounting" description="Invoices, payments & financial tracking" icon={Receipt}>
        <Button onClick={() => setShowInvoice(true)}>Create Invoice</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} icon={CreditCard} variant="primary" />
        <StatCard title="Paid" value={paid.length} icon={Receipt} variant="success" />
        <StatCard title="Pending" value={unpaid.length} icon={Receipt} variant="warning" />
        <StatCard title="Total Invoices" value={invoices.length} icon={Receipt} variant="default" />
      </div>

      <Tabs defaultValue="all">
        <TabsList><TabsTrigger value="all">All ({invoices.length})</TabsTrigger><TabsTrigger value="unpaid">Unpaid ({unpaid.length})</TabsTrigger><TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger></TabsList>
        <TabsContent value="all"><div className="data-table-wrapper">{invoices.length === 0 ? <EmptyState icon={Receipt} title="No invoices" description="Create your first invoice." actionLabel="Create Invoice" onAction={() => setShowInvoice(true)} /> : renderInvoiceTable(invoices)}</div></TabsContent>
        <TabsContent value="unpaid"><div className="data-table-wrapper">{unpaid.length === 0 ? <EmptyState icon={Receipt} title="All paid!" description="No unpaid invoices." /> : renderInvoiceTable(unpaid)}</div></TabsContent>
        <TabsContent value="paid"><div className="data-table-wrapper">{paid.length === 0 ? <EmptyState icon={Receipt} title="No paid invoices" description="Completed payments appear here." /> : renderInvoiceTable(paid)}</div></TabsContent>
      </Tabs>

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent>
              </Select></div>
            <p className="text-sm font-medium text-muted-foreground">Line Items</p>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <Input placeholder="Description" value={item.description} onChange={e => { const n = [...items]; n[i].description = e.target.value; setItems(n); }} />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => { const n = [...items]; n[i].quantity = e.target.value; setItems(n); }} />
                <Input type="number" placeholder="Price" value={item.unit_price} onChange={e => { const n = [...items]; n[i].unit_price = e.target.value; setItems(n); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => setItems(i => [...i, { description: '', quantity: '1', unit_price: '0' }])}>+ Add Item</Button>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold font-display">KES {total.toLocaleString()}</span>
            </div>
          </div>
          <Button className="w-full mt-2" onClick={createInvoice} disabled={loading || !selectedPatient || items.every(i => !i.description)}>
            {loading ? 'Creating...' : 'Save Invoice'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
