import { useState, useEffect, useCallback } from 'react';
import { Stethoscope, Search, FileText, FlaskConical, Pill, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function DoctorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queue, setQueue] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [diagForm, setDiagForm] = useState({ diagnosis: '', notes: '' });
  const [prescriptions, setPrescriptions] = useState<{ medication_name: string; dosage: string; frequency: string; duration: string }[]>([]);
  const [labTests, setLabTests] = useState<{ test_name: string }[]>([]);

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId || !user?.id) return;
    const [qRes, rRes, pRes] = await Promise.all([
      supabase.from('appointments').select('*, patients(full_name, patient_number)').eq('hospital_id', hospitalId).eq('doctor_id', user.id).in('status', ['scheduled', 'checked_in', 'in_progress']).order('scheduled_at'),
      supabase.from('medical_records').select('*, patients(full_name)').eq('hospital_id', hospitalId).eq('doctor_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('patients').select('id, full_name, patient_number').eq('hospital_id', hospitalId),
    ]);
    setQueue(qRes.data || []);
    setRecords(rRes.data || []);
    setPatients(pRes.data || []);
  }, [hospitalId, user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startConsultation = (appt: any) => {
    setSelectedAppointment(appt);
    setDiagForm({ diagnosis: '', notes: '' });
    setPrescriptions([]);
    setLabTests([]);
    setShowDiagnosis(true);
  };

  const saveRecord = async () => {
    if (!hospitalId || !user?.id || !selectedAppointment) return;
    setLoading(true);
    const patientId = selectedAppointment.patient_id;

    // Create medical record
    const { data: record, error } = await supabase.from('medical_records').insert({
      hospital_id: hospitalId, patient_id: patientId, doctor_id: user.id,
      appointment_id: selectedAppointment.id, diagnosis: diagForm.diagnosis, notes: diagForm.notes || null,
    }).select().single();

    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setLoading(false); return; }

    // Create prescriptions
    if (prescriptions.length > 0 && record) {
      await supabase.from('prescriptions').insert(
        prescriptions.map(p => ({
          hospital_id: hospitalId, medical_record_id: record.id,
          patient_id: patientId, doctor_id: user.id, ...p,
        }))
      );
    }

    // Create lab tests
    if (labTests.length > 0) {
      await supabase.from('lab_tests').insert(
        labTests.map(t => ({
          hospital_id: hospitalId, patient_id: patientId, doctor_id: user.id, test_name: t.test_name,
        }))
      );
    }

    // Update appointment status
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', selectedAppointment.id);

    toast({ title: 'Record saved', description: `Diagnosis recorded for patient.` });
    setShowDiagnosis(false);
    fetchData();
    setLoading(false);
  };

  return (
    <div className="module-page">
      <PageHeader title="Doctor Module" description="Patient consultations & treatment" icon={Stethoscope} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patients..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="queue">
        <TabsList><TabsTrigger value="queue">My Queue ({queue.length})</TabsTrigger><TabsTrigger value="history">Medical Records ({records.length})</TabsTrigger></TabsList>
        <TabsContent value="queue">
          <div className="data-table-wrapper">
            {queue.length === 0 ? (
              <EmptyState icon={Stethoscope} title="No patients in queue" description="Patients assigned to you will appear here." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {queue.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{(a as any).patients?.full_name}</TableCell>
                      <TableCell>{new Date(a.scheduled_at).toLocaleTimeString()}</TableCell>
                      <TableCell><Badge variant="secondary">{a.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.reason || '—'}</TableCell>
                      <TableCell><Button size="sm" onClick={() => startConsultation(a)}>Consult</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <div className="data-table-wrapper">
            {records.length === 0 ? (
              <EmptyState icon={FileText} title="No medical records" description="Completed consultations will appear here." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Diagnosis</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {records.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{(r as any).patients?.full_name}</TableCell>
                      <TableCell>{r.diagnosis}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDiagnosis} onOpenChange={setShowDiagnosis}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Patient Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Diagnosis *</Label><Textarea value={diagForm.diagnosis} onChange={e => setDiagForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Enter diagnosis..." rows={3} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={diagForm.notes} onChange={e => setDiagForm(p => ({ ...p, notes: e.target.value }))} placeholder="Clinical notes..." rows={2} /></div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-1"><Pill className="h-4 w-4" /> Prescriptions</Label>
                <Button variant="outline" size="sm" onClick={() => setPrescriptions(p => [...p, { medication_name: '', dosage: '', frequency: '', duration: '' }])}>+ Add</Button>
              </div>
              {prescriptions.map((rx, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                  <Input placeholder="Medication" value={rx.medication_name} onChange={e => { const n = [...prescriptions]; n[i].medication_name = e.target.value; setPrescriptions(n); }} />
                  <Input placeholder="Dosage" value={rx.dosage} onChange={e => { const n = [...prescriptions]; n[i].dosage = e.target.value; setPrescriptions(n); }} />
                  <Input placeholder="Frequency" value={rx.frequency} onChange={e => { const n = [...prescriptions]; n[i].frequency = e.target.value; setPrescriptions(n); }} />
                  <Input placeholder="Duration" value={rx.duration} onChange={e => { const n = [...prescriptions]; n[i].duration = e.target.value; setPrescriptions(n); }} />
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-1"><FlaskConical className="h-4 w-4" /> Lab Tests</Label>
                <Button variant="outline" size="sm" onClick={() => setLabTests(t => [...t, { test_name: '' }])}>+ Add</Button>
              </div>
              {labTests.map((t, i) => (
                <Input key={i} placeholder="Test name" value={t.test_name} onChange={e => { const n = [...labTests]; n[i].test_name = e.target.value; setLabTests(n); }} className="mb-2" />
              ))}
            </div>
          </div>
          <Button className="w-full mt-2" onClick={saveRecord} disabled={loading || !diagForm.diagnosis}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Record'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
