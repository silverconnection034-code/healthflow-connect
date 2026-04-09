import { useState, useEffect, useCallback } from 'react';
import { HeartPulse, Search, Thermometer, Activity, Weight, Loader2, Users, Calendar, ClipboardList, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function NursePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showVitals, setShowVitals] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [search, setSearch] = useState('');
  const [vitals, setVitals] = useState({ temperature: '', blood_pressure: '', weight: '', heart_rate: '', oxygen_saturation: '', respiratory_rate: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const today = new Date().toISOString().split('T')[0];
    const [pRes, rRes, aRes] = await Promise.all([
      supabase.from('patients').select('id, full_name, patient_number, phone, gender').eq('hospital_id', hospitalId),
      supabase.from('medical_records').select('*, patients(full_name, patient_number)').eq('hospital_id', hospitalId).not('vitals', 'eq', '{}').order('created_at', { ascending: false }).limit(50),
      supabase.from('appointments').select('*, patients(full_name)').eq('hospital_id', hospitalId).in('status', ['scheduled', 'checked_in']).gte('scheduled_at', today).order('scheduled_at'),
    ]);
    setPatients(pRes.data || []);
    setRecords(rRes.data || []);
    setAppointments(aRes.data || []);
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
      setVitals({ temperature: '', blood_pressure: '', weight: '', heart_rate: '', oxygen_saturation: '', respiratory_rate: '' });
      setSelectedPatient('');
      fetchData();
    }
    setLoading(false);
  };

  const filteredRecords = records.filter(r =>
    !search || (r as any).patients?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="module-page">
      <PageHeader title="Nurse Station" description="Record vitals, triage & patient care" icon={HeartPulse} actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patients.length} icon={Users} variant="primary" subtitle="In hospital" />
        <StatCard title="Vitals Recorded" value={records.length} icon={Activity} variant="success" subtitle="Recent records" />
        <StatCard title="Waiting Patients" value={appointments.length} icon={Clock} variant="warning" subtitle="Today's queue" />
        <StatCard title="Critical" value={records.filter(r => {
          const v = (r.vitals as any) || {};
          return v.temperature && parseFloat(v.temperature) > 38.5;
        }).length} icon={HeartPulse} variant="destructive" subtitle="High temperature" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patient vitals..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs defaultValue="vitals">
        <TabsList>
          <TabsTrigger value="vitals">Vitals History ({records.length})</TabsTrigger>
          <TabsTrigger value="waiting">Waiting Queue ({appointments.length})</TabsTrigger>
          <TabsTrigger value="patients">All Patients ({patients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <div className="data-table-wrapper">
            {filteredRecords.length === 0 ? (
              <EmptyState icon={HeartPulse} title="No vitals recorded" description="Select a patient to record their vitals." actionLabel="Record Vitals" onAction={() => setShowVitals(true)} />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>ID</TableHead><TableHead>Temp (°C)</TableHead><TableHead>BP</TableHead><TableHead>Weight</TableHead><TableHead>HR</TableHead><TableHead>SpO₂</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredRecords.map(r => {
                    const v = (r.vitals as any) || {};
                    const isHighTemp = v.temperature && parseFloat(v.temperature) > 38.5;
                    return (
                      <TableRow key={r.id} className={isHighTemp ? 'bg-destructive/5' : ''}>
                        <TableCell className="font-medium">{(r as any).patients?.full_name}</TableCell>
                        <TableCell className="font-mono text-xs">{(r as any).patients?.patient_number}</TableCell>
                        <TableCell className={isHighTemp ? 'text-destructive font-bold' : ''}>{v.temperature || '—'}</TableCell>
                        <TableCell>{v.blood_pressure || '—'}</TableCell>
                        <TableCell>{v.weight || '—'}</TableCell>
                        <TableCell>{v.heart_rate || '—'}</TableCell>
                        <TableCell>{v.oxygen_saturation || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waiting">
          <div className="data-table-wrapper">
            {appointments.length === 0 ? (
              <EmptyState icon={Clock} title="No patients waiting" description="Today's queue will appear here." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {appointments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{(a as any).patients?.full_name}</TableCell>
                      <TableCell>{new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                      <TableCell><Badge variant="secondary">{a.status}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedPatient(a.patient_id);
                          setShowVitals(true);
                        }}>Record Vitals</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <div className="data-table-wrapper">
            {patients.length === 0 ? (
              <EmptyState icon={Users} title="No patients" description="Patients will appear here once registered." />
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>ID</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {patients.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell className="font-mono text-xs">{p.patient_number}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell className="capitalize">{p.gender || '—'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(p.id); setShowVitals(true); }}>Vitals</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
              <div className="space-y-2"><Label>SpO₂ (%)</Label><Input type="number" placeholder="98" value={vitals.oxygen_saturation} onChange={e => setVitals(v => ({ ...v, oxygen_saturation: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Respiratory Rate</Label><Input type="number" placeholder="16" value={vitals.respiratory_rate} onChange={e => setVitals(v => ({ ...v, respiratory_rate: e.target.value }))} /></div>
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
