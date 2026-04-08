import { useState } from 'react';
import { Ambulance, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function AmbulancePage() {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Ambulance" description="Ambulance dispatch & tracking" icon={Ambulance} actionLabel="New Request" onAction={() => setShowRequest(true)} />

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Trips</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="data-table-wrapper">
            <EmptyState icon={Ambulance} title="No active trips" description="Active ambulance trips will be tracked here." />
          </div>
        </TabsContent>
        <TabsContent value="pending">
          <div className="data-table-wrapper">
            <EmptyState icon={Ambulance} title="No pending requests" description="Ambulance requests awaiting assignment will appear here." />
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="data-table-wrapper">
            <EmptyState icon={Ambulance} title="No completed trips" description="Completed ambulance trips will be listed here." />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">New Ambulance Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient (optional)</Label><Input placeholder="Search patient..." /></div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Pickup Location</Label>
              <Input placeholder="Pickup address" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Destination</Label>
              <Input placeholder="Destination address" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Additional details..." /></div>
          </div>
          <Button className="w-full mt-2" disabled>Submit Request (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
