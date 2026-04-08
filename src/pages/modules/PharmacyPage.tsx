import { useState } from 'react';
import { Pill, Search, Package, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function PharmacyPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Pharmacy" description="Drug inventory & dispensing" icon={Pill} actionLabel="Add Drug" onAction={() => setShowAdd(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search drugs..." className="pl-9" />
      </div>

      <Tabs defaultValue="prescriptions">
        <TabsList>
          <TabsTrigger value="prescriptions">Pending Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>
        <TabsContent value="prescriptions">
          <div className="data-table-wrapper">
            <EmptyState icon={Pill} title="No pending prescriptions" description="Prescriptions from doctors will appear here for dispensing." />
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div className="data-table-wrapper">
            <EmptyState icon={Package} title="No drugs in inventory" description="Add drugs to your inventory to track stock levels." actionLabel="Add Drug" onAction={() => setShowAdd(true)} />
          </div>
        </TabsContent>
        <TabsContent value="low-stock">
          <div className="data-table-wrapper">
            <EmptyState icon={AlertTriangle} title="No low stock alerts" description="Drugs below reorder level will appear here." />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Drug to Inventory</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Drug Name</Label><Input placeholder="e.g. Paracetamol 500mg" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Input placeholder="e.g. Analgesic" /></div>
              <div className="space-y-2"><Label>Unit</Label><Input placeholder="e.g. Tablets" /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="0" /></div>
              <div className="space-y-2"><Label>Unit Price (KES)</Label><Input type="number" placeholder="0" /></div>
              <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" placeholder="10" /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" /></div>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Add Drug (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
