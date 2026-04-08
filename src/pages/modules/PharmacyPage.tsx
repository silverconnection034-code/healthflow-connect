import { useState, useEffect, useCallback } from 'react';
import { Pill, Search, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PharmacyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [drugForm, setDrugForm] = useState({ name: '', category: '', unit: '', quantity: '0', unit_price: '0', reorder_level: '10', expiry_date: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const [iRes, pRes] = await Promise.all([
      supabase.from('inventory').select('*').eq('hospital_id', hospitalId).order('name'),
      supabase.from('prescriptions').select('*, patients(full_name)').eq('hospital_id', hospitalId).eq('status', 'prescribed').order('created_at', { ascending: false }),
    ]);
    setInventory(iRes.data || []);
    setPrescriptions(pRes.data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addDrug = async () => {
    if (!hospitalId) return;
    setLoading(true);
    const { error } = await supabase.from('inventory').insert({
      hospital_id: hospitalId, name: drugForm.name, category: drugForm.category || 'general',
      unit: drugForm.unit || 'pcs', quantity: parseInt(drugForm.quantity) || 0,
      unit_price: parseFloat(drugForm.unit_price) || 0, reorder_level: parseInt(drugForm.reorder_level) || 10,
      expiry_date: drugForm.expiry_date || null,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Drug added' }); setShowAdd(false); setDrugForm({ name: '', category: '', unit: '', quantity: '0', unit_price: '0', reorder_level: '10', expiry_date: '' }); fetchData(); }
    setLoading(false);
  };

  const dispensePrescription = async (rx: any) => {
    if (!user?.id) return;
    await supabase.from('prescriptions').update({ status: 'dispensed', dispensed_by: user.id, dispensed_at: new Date().toISOString() }).eq('id', rx.id);
    toast({ title: 'Prescription dispensed' });
    fetchData();
  };

  const lowStock = inventory.filter(i => i.quantity <= i.reorder_level);
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="module-page">
      <PageHeader title="Pharmacy" description="Drug inventory & dispensing" icon={Pill} actionLabel="Add Drug" onAction={() => setShowAdd(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search drugs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="prescriptions">
        <TabsList>
          <TabsTrigger value="prescriptions">Pending ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="inventory">Inventory ({inventory.length})</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock ({lowStock.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="prescriptions">
          <div className="data-table-wrapper">
            {prescriptions.length === 0 ? <EmptyState icon={Pill} title="No pending prescriptions" description="Prescriptions from doctors appear here." /> : (
              <Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Medication</TableHead><TableHead>Dosage</TableHead><TableHead>Frequency</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>{prescriptions.map(rx => (
                  <TableRow key={rx.id}><TableCell>{(rx as any).patients?.full_name}</TableCell><TableCell className="font-medium">{rx.medication_name}</TableCell><TableCell>{rx.dosage}</TableCell><TableCell>{rx.frequency}</TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => dispensePrescription(rx)}>Dispense</Button></TableCell></TableRow>
                ))}</TableBody></Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div className="data-table-wrapper">
            {filtered.length === 0 ? <EmptyState icon={Package} title="No drugs" description="Add drugs to track stock." actionLabel="Add Drug" onAction={() => setShowAdd(true)} /> : (
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Qty</TableHead><TableHead>Unit</TableHead><TableHead>Price</TableHead><TableHead>Expiry</TableHead></TableRow></TableHeader>
                <TableBody>{filtered.map(d => (
                  <TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell>{d.category}</TableCell>
                    <TableCell><Badge className={d.quantity <= d.reorder_level ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}>{d.quantity}</Badge></TableCell>
                    <TableCell>{d.unit}</TableCell><TableCell>KES {Number(d.unit_price).toLocaleString()}</TableCell><TableCell className="text-xs">{d.expiry_date || '—'}</TableCell></TableRow>
                ))}</TableBody></Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="low-stock">
          <div className="data-table-wrapper">
            {lowStock.length === 0 ? <EmptyState icon={AlertTriangle} title="No low stock" description="All good!" /> : (
              <Table><TableHeader><TableRow><TableHead>Drug</TableHead><TableHead>Current</TableHead><TableHead>Reorder Level</TableHead></TableRow></TableHeader>
                <TableBody>{lowStock.map(d => (
                  <TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell className="text-destructive font-bold">{d.quantity}</TableCell><TableCell>{d.reorder_level}</TableCell></TableRow>
                ))}</TableBody></Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Drug to Inventory</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Drug Name *</Label><Input value={drugForm.name} onChange={e => setDrugForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Paracetamol 500mg" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input value={drugForm.category} onChange={e => setDrugForm(p => ({ ...p, category: e.target.value }))} placeholder="Analgesic" /></div>
              <div className="space-y-2"><Label>Unit</Label><Input value={drugForm.unit} onChange={e => setDrugForm(p => ({ ...p, unit: e.target.value }))} placeholder="Tablets" /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={drugForm.quantity} onChange={e => setDrugForm(p => ({ ...p, quantity: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Price (KES)</Label><Input type="number" value={drugForm.unit_price} onChange={e => setDrugForm(p => ({ ...p, unit_price: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" value={drugForm.reorder_level} onChange={e => setDrugForm(p => ({ ...p, reorder_level: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={drugForm.expiry_date} onChange={e => setDrugForm(p => ({ ...p, expiry_date: e.target.value }))} /></div>
            </div>
          </div>
          <Button className="w-full mt-2" onClick={addDrug} disabled={loading || !drugForm.name}>
            {loading ? 'Adding...' : 'Add Drug'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
