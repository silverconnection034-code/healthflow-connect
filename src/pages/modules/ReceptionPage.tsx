import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ReceptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRegister, setShowRegister] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', phone: '', email: '',
    address: '', next_of_kin_name: '', next_of_kin_phone: '',
    insurance_provider: '', insurance_number: '',
  });
  const [bookingForm, setBookingForm] = useState({ patient_id: '', doctor_id: '', scheduled_at: '', reason: '' });

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const [pRes, aRes, dRes] = await Promise.all([
      supabase.from('patients').select('*').eq('hospital_id', hospitalId).order('created_at', { ascending: false }),
      supabase.from('appointments').select('*, patients(full_name)').eq('hospital_id', hospitalId).order('scheduled_at', { ascending: false }).limit(50),
      supabase.from('user_roles').select('user_id, role').eq('hospital_id', hospitalId).eq('role', 'doctor'),
    ]);
    setPatients(pRes.data || []);
    setAppointments(aRes.data || []);
    // Fetch doctor names
    if (dRes.data && dRes.data.length > 0) {
      const ids = dRes.data.map(d => d.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', ids);
      setDoctors((profiles || []).map(p => ({ id: p.user_id, name: p.full_name })));
    }
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const registerPatient = async () => {
    if (!hospitalId || !form.full_name || !form.phone) return;
    setLoading(true);
    const patientNumber = `P-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('patients').insert({
      hospital_id: hospitalId, patient_number: patientNumber,
      full_name: form.full_name, date_of_birth: form.date_of_birth || null,
      gender: form.gender || null, phone: form.phone, email: form.email || null,
      address: form.address || null, next_of_kin_name: form.next_of_kin_name || null,
      next_of_kin_phone: form.next_of_kin_phone || null,
      insurance_provider: form.insurance_provider || null,
      insurance_number: form.insurance_number || null,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'Patient registered', description: `${form.full_name} — ${patientNumber}` });
      setShowRegister(false);
      setForm({ full_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '', next_of_kin_name: '', next_of_kin_phone: '', insurance_provider: '', insurance_number: '' });
      fetchData();
    }
    setLoading(false);
  };

  const bookAppointment = async () => {
    if (!hospitalId || !bookingForm.patient_id || !bookingForm.doctor_id || !bookingForm.scheduled_at) return;
    setLoading(true);
    const { error } = await supabase.from('appointments').insert({
      hospital_id: hospitalId, patient_id: bookingForm.patient_id,
      doctor_id: bookingForm.doctor_id, scheduled_at: bookingForm.scheduled_at,
      reason: bookingForm.reason || null,
    });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'Appointment booked' });
      setShowBooking(false);
      setBookingForm({ patient_id: '', doctor_id: '', scheduled_at: '', reason: '' });
      fetchData();
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_number.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-success/10 text-success';
    if (s === 'cancelled') return 'bg-destructive/10 text-destructive';
    if (s === 'in_progress') return 'bg-primary/10 text-primary';
    return 'bg-warning/10 text-warning';
  };

  return (
    <div className="module-page">
      <PageHeader title="Reception" description="Patient registration & appointment booking" icon={UserPlus}>
        <Button variant="outline" onClick={() => setShowBooking(true)}>
          <Calendar className="h-4 w-4 mr-2" />Book Appointment
        </Button>
        <Button onClick={() => setShowRegister(true)}>
          <UserPlus className="h-4 w-4 mr-2" />Register Patient
        </Button>
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients by name, ID, or phone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs defaultValue="patients">
        <TabsList><TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger><TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger></TabsList>
        <TabsContent value="patients">
          <div className="data-table-wrapper">
            {filteredPatients.length === 0 ? (
              <EmptyState icon={UserPlus} title="No patients" description="Register your first patient." actionLabel="Register Patient" onAction={() => setShowRegister(true)} />
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>Insurance</TableHead><TableHead>Registered</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredPatients.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.patient_number}</TableCell>
                      <TableCell className="font-medium">{p.full_name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell className="capitalize">{p.gender || '—'}</TableCell>
                      <TableCell>{p.insurance_provider ? <Badge variant="secondary" className="capitalize">{p.insurance_provider}</Badge> : '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        <TabsContent value="appointments">
          <div className="data-table-wrapper">
            {appointments.length === 0 ? (
              <EmptyState icon={Calendar} title="No appointments" description="Book appointments for patients." actionLabel="Book Appointment" onAction={() => setShowBooking(true)} />
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Patient</TableHead><TableHead>Date/Time</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {appointments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{(a as any).patients?.full_name || '—'}</TableCell>
                      <TableCell>{new Date(a.scheduled_at).toLocaleString()}</TableCell>
                      <TableCell><Badge className={statusColor(a.status)}>{a.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.reason || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Register New Patient</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Patient full name" /></div>
            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Gender</Label>
              <Select value={form.gender} onValueChange={v => setForm(p => ({ ...p, gender: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Optional" /></div>
            <div className="col-span-2 space-y-2"><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Address" /></div>
            <div className="space-y-2"><Label>Next of Kin</Label><Input value={form.next_of_kin_name} onChange={e => setForm(p => ({ ...p, next_of_kin_name: e.target.value }))} placeholder="Name" /></div>
            <div className="space-y-2"><Label>Kin Phone</Label><Input value={form.next_of_kin_phone} onChange={e => setForm(p => ({ ...p, next_of_kin_phone: e.target.value }))} placeholder="+254" /></div>
            <div className="space-y-2"><Label>Insurance</Label>
              <Select value={form.insurance_provider} onValueChange={v => setForm(p => ({ ...p, insurance_provider: v }))}><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="nhif">NHIF</SelectItem><SelectItem value="sha">SHA</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Insurance #</Label><Input value={form.insurance_number} onChange={e => setForm(p => ({ ...p, insurance_number: e.target.value }))} placeholder="Optional" /></div>
          </div>
          <Button className="w-full mt-2" onClick={registerPatient} disabled={loading || !form.full_name || !form.phone}>
            {loading ? 'Saving...' : 'Save Patient'}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Book Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient *</Label>
              <Select value={bookingForm.patient_id} onValueChange={v => setBookingForm(p => ({ ...p, patient_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.full_name} ({p.patient_number})</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Doctor *</Label>
              <Select value={bookingForm.doctor_id} onValueChange={v => setBookingForm(p => ({ ...p, doctor_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-2"><Label>Date & Time *</Label><Input type="datetime-local" value={bookingForm.scheduled_at} onChange={e => setBookingForm(p => ({ ...p, scheduled_at: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Reason</Label><Input value={bookingForm.reason} onChange={e => setBookingForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for visit" /></div>
          </div>
          <Button className="w-full mt-2" onClick={bookAppointment} disabled={loading || !bookingForm.patient_id || !bookingForm.doctor_id || !bookingForm.scheduled_at}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
