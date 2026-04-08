import { useState } from 'react';
import { Stethoscope, Search, FileText, FlaskConical, Pill } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DoctorPage() {
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Doctor Module" description="Patient consultations & treatment" icon={Stethoscope} />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search assigned patients..." className="pl-9" />
        </div>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">My Queue</TabsTrigger>
          <TabsTrigger value="history">Patient History</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <div className="data-table-wrapper">
            <EmptyState icon={Stethoscope} title="No patients in queue" description="Patients assigned to you by reception will appear here." />
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="data-table-wrapper">
            <EmptyState icon={FileText} title="No medical records" description="Patient medical history and past consultations will appear here." />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDiagnosis} onOpenChange={setShowDiagnosis}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Patient Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Diagnosis</Label><Textarea placeholder="Enter diagnosis..." rows={3} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Clinical notes..." rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline"><Pill className="h-4 w-4 mr-2" />Add Prescription</Button>
              <Button variant="outline"><FlaskConical className="h-4 w-4 mr-2" />Request Lab Test</Button>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Save Record (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
