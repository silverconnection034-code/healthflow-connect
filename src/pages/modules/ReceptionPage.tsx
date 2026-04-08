import { useState } from 'react';
import { UserPlus, Search, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReceptionPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

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
          <Input placeholder="Search patients by name, ID, or phone..." className="pl-9" />
        </div>
      </div>

      <Tabs defaultValue="patients">
        <TabsList>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Today's Appointments</TabsTrigger>
        </TabsList>
        <TabsContent value="patients">
          <div className="data-table-wrapper">
            <EmptyState icon={UserPlus} title="No patients registered" description="Register your first patient to get started. Patient records will be stored securely." actionLabel="Register Patient" onAction={() => setShowRegister(true)} />
          </div>
        </TabsContent>
        <TabsContent value="appointments">
          <div className="data-table-wrapper">
            <EmptyState icon={Calendar} title="No appointments today" description="Book appointments for patients to see doctors." actionLabel="Book Appointment" onAction={() => setShowBooking(true)} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Register Patient Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">Register New Patient</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2"><Label>Full Name</Label><Input placeholder="Patient full name" /></div>
            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+254" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="Optional" /></div>
            <div className="col-span-2 space-y-2"><Label>Address</Label><Input placeholder="Address" /></div>
            <div className="space-y-2"><Label>Next of Kin Name</Label><Input placeholder="Name" /></div>
            <div className="space-y-2"><Label>Next of Kin Phone</Label><Input placeholder="+254" /></div>
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Select><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="nhif">NHIF</SelectItem><SelectItem value="sha">SHA</SelectItem><SelectItem value="none">None</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Insurance Number</Label><Input placeholder="Optional" /></div>
          </div>
          <Button className="w-full mt-2" disabled>Save Patient (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>

      {/* Book Appointment Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Book Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
            <div className="space-y-2"><Label>Doctor</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger><SelectContent /></Select>
            </div>
            <div className="space-y-2"><Label>Date & Time</Label><Input type="datetime-local" /></div>
            <div className="space-y-2"><Label>Reason</Label><Input placeholder="Reason for visit" /></div>
          </div>
          <Button className="w-full mt-2" disabled>Book Appointment (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
