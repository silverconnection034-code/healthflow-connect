import { useState } from 'react';
import { Receipt, Search, CreditCard, FileText, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/shared/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BillingPage() {
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Billing & Accounting" description="Invoices, payments & financial tracking" icon={Receipt}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        <Button onClick={() => setShowInvoice(true)}>Create Invoice</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="KES 0" icon={CreditCard} variant="primary" />
        <StatCard title="Paid Invoices" value={0} icon={Receipt} variant="success" />
        <StatCard title="Pending" value={0} icon={Receipt} variant="warning" />
        <StatCard title="Overdue" value={0} icon={Receipt} variant="destructive" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search invoices..." className="pl-9" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="data-table-wrapper">
            <EmptyState icon={Receipt} title="No invoices" description="Create invoices for patient services — consultations, lab tests, pharmacy." actionLabel="Create Invoice" onAction={() => setShowInvoice(true)} />
          </div>
        </TabsContent>
        <TabsContent value="unpaid">
          <div className="data-table-wrapper">
            <EmptyState icon={Receipt} title="No unpaid invoices" description="Unpaid and overdue invoices will appear here." />
          </div>
        </TabsContent>
        <TabsContent value="paid">
          <div className="data-table-wrapper">
            <EmptyState icon={Receipt} title="No paid invoices" description="Completed payments will be recorded here." />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
            <p className="text-sm font-medium text-muted-foreground">Line Items</p>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Description" />
              <Input type="number" placeholder="Qty" />
              <Input type="number" placeholder="Price (KES)" />
            </div>
            <Button variant="outline" size="sm" className="w-full">+ Add Item</Button>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold font-display">KES 0</span>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Save Invoice (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Phone Number (M-Pesa)</Label><Input placeholder="+254" /></div>
            <div className="space-y-2"><Label>Amount (KES)</Label><Input type="number" placeholder="0" /></div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa STK Push</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Process Payment (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
