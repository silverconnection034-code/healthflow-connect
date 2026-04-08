import { useState } from 'react';
import { HeartPulse, Search, Thermometer, Activity, Weight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function NursePage() {
  const [showVitals, setShowVitals] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Nurse Station" description="Record vitals & assist doctors" icon={HeartPulse} actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients..." className="pl-9" />
      </div>

      <div className="data-table-wrapper">
        <EmptyState icon={HeartPulse} title="No vitals recorded" description="Select a patient to record their vitals before doctor consultation." actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />
      </div>

      <Dialog open={showVitals} onOpenChange={setShowVitals}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Record Patient Vitals</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" />Temperature (°C)</Label>
                <Input type="number" step="0.1" placeholder="36.5" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Blood Pressure</Label>
                <Input placeholder="120/80" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" />Weight (kg)</Label>
                <Input type="number" step="0.1" placeholder="70" />
              </div>
              <div className="space-y-2">
                <Label>Heart Rate (bpm)</Label>
                <Input type="number" placeholder="72" />
              </div>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Save Vitals (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
