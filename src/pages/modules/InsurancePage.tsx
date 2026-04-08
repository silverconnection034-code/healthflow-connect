import { useState } from 'react';
import { Shield, Search, FileText, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/shared/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InsurancePage() {
  const [showClaim, setShowClaim] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Insurance & NHIF/SHA" description="Manage insurance claims and reimbursements" icon={Shield}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Claims</Button>
        <Button onClick={() => setShowClaim(true)}>New Claim</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Claims" value={0} icon={Shield} variant="primary" />
        <StatCard title="Approved" value="KES 0" icon={Shield} variant="success" />
        <StatCard title="Pending" value={0} icon={Shield} variant="warning" />
        <StatCard title="Rejected" value={0} icon={Shield} variant="destructive" />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="data-table-wrapper"><EmptyState icon={Shield} title="No insurance claims" description="Create claims for NHIF/SHA-covered services." actionLabel="New Claim" onAction={() => setShowClaim(true)} /></div>
        </TabsContent>
        <TabsContent value="submitted"><div className="data-table-wrapper"><EmptyState icon={Shield} title="No submitted claims" description="Claims awaiting review." /></div></TabsContent>
        <TabsContent value="approved"><div className="data-table-wrapper"><EmptyState icon={Shield} title="No approved claims" description="Approved claims pending payment." /></div></TabsContent>
        <TabsContent value="paid"><div className="data-table-wrapper"><EmptyState icon={Shield} title="No paid claims" description="Reimbursed claims." /></div></TabsContent>
      </Tabs>

      <Dialog open={showClaim} onOpenChange={setShowClaim}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">New Insurance Claim</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="nhif">NHIF</SelectItem><SelectItem value="sha">SHA</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Membership Number</Label><Input placeholder="Member ID" /></div>
            </div>
            <div className="space-y-2"><Label>Services</Label><Input placeholder="e.g. Consultation, Lab tests, Drugs" /></div>
            <div className="space-y-2"><Label>Total Claim Amount (KES)</Label><Input type="number" placeholder="0" /></div>
          </div>
          <Button className="w-full mt-2" disabled>Submit Claim (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
