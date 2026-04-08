import { useState } from 'react';
import { Users, Search, UserPlus, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_LABELS, UserRole } from '@/types';

const staffRoles: UserRole[] = ['receptionist', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'accountant', 'driver'];

export default function StaffPage() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Staff Management" description="Manage hospital staff & roles" icon={Users} actionLabel="Add Staff" onAction={() => setShowAdd(true)} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." className="pl-9" />
      </div>

      <div className="data-table-wrapper">
        <EmptyState icon={Users} title="No staff members" description="Add staff members and assign them roles to grant access to the system." actionLabel="Add Staff" onAction={() => setShowAdd(true)} />
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Add Staff Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Staff name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="staff@hospital.co.ke" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+254" /></div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Role</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {staffRoles.map(role => (
                    <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full mt-2" disabled>Add Staff (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
