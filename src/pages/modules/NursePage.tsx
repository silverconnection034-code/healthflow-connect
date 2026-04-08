import { useState, useEffect, useCallback } from 'react';
import { HeartPulse, Search, Thermometer, Activity, Weight, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function NursePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showVitals, setShowVitals] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', blood_pressure: '', weight: '', heart_rate: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const [pRes, rRes] = await Promise.all([
      supabase.from('patients').select('id, full_name, patient_number').eq('hospital_id', hospitalId),
      supabase.from('medical_records').select('*, patients(full_name)').eq('hospital_id', hospitalId).not('vitals', 'eq', '{}').order('created_at', { ascending: false }).limit(30),
    ]);
    setPatients(pRes.data || []);
    setRecords(rRes.data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveVitals = async () => {
    if (!hospitalId || !user?.id || !selectedPatient) return;
    setLoading(true);
    const { error } = await supabase.from('medical_records').insert({
      hospital_id: hospitalId, patient_id: selectedPatient, doctor_id: user.id,
      diagnosis: 'Vitals recorded', vitals: vitals,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'Vitals saved' });
      setShowVitals(false);
      setVitals({ temperature: '', blood_pressure: '', weight: '', heart_rate: '' });
      fetchData();
    }
    setLoading(false);
  };

  return (
    <div className="module-page">
      <PageHeader title="Nurse Station" description="Record vitals & assist doctors" icon={HeartPulse} actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />

      <div className="data-table-wrapper">
        {records.length === 0 ? (
          <EmptyState icon={HeartPulse} title="No vitals recorded" description="Select a patient to record their vitals." actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Temperature</TableHead><TableHead>BP</TableHead><TableHead>Weight</TableHead><TableHead>HR</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {records.map(r => {
                const v = (r.vitals as any) || {};
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{(r as any).patients?.full_name}</TableCell>
                    <TableCell>{v.temperature || '—'}</TableCell>
                    <TableCell>{v.blood_pressure || '—'}</TableCell>
                    <TableCell>{v.weight || '—'}</TableCell>
                    <TableCell>{v.heart_rate || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={showVitals} onOpenChange={setShowVitals}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Record Patient Vitals</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.patient_number})</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" />Temperature (°C)</Label><Input type="number" step="0.1" placeholder="36.5" value={vitals.temperature} onChange={e => setVitals(v => ({ ...v, temperature: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />Blood Pressure</Label><Input placeholder="120/80" value={vitals.blood_pressure} onChange={e => setVitals(v => ({ ...v, blood_pressure: e.target.value }))} /></div>
              <div className="space-y-2"><Label className="flex items-center gap-1"><Weight className="h-3.5 w-3.5" />Weight (kg)</Label><Input type="number" step="0.1" placeholder="70" value={vitals.weight} onChange={e => setVitals(v => ({ ...v, weight: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Heart Rate (bpm)</Label><Input type="number" placeholder="72" value={vitals.heart_rate} onChange={e => setVitals(v => ({ ...v, heart_rate: e.target.value }))} /></div>
            </div>
          </div>
          <Button className="w-full mt-2" onClick={saveVitals} disabled={loading || !selectedPatient}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Vitals'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
