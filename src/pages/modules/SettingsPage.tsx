import { Settings, Building2, Bell, Shield } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { hospital } = useAuth();

  return (
    <div className="module-page">
      <PageHeader title="Settings" description="Hospital configuration" icon={Settings} />

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Building2 className="h-4 w-4" />Hospital Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Hospital Name</Label><Input defaultValue={hospital?.name || ''} /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue={hospital?.email || ''} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input defaultValue={hospital?.phone || ''} /></div>
              <div className="space-y-2"><Label>Location</Label><Input defaultValue={hospital?.location || ''} /></div>
            </div>
            <Button disabled>Save Changes (Connect Cloud)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Bell className="h-4 w-4" />SMS Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><div><Label>Appointment Reminders</Label><p className="text-xs text-muted-foreground">Send SMS before appointments</p></div><Switch /></div>
            <div className="flex items-center justify-between"><div><Label>Payment Confirmations</Label><p className="text-xs text-muted-foreground">SMS after successful payment</p></div><Switch /></div>
            <div className="flex items-center justify-between"><div><Label>Prescription Ready</Label><p className="text-xs text-muted-foreground">Notify patient when drugs are ready</p></div><Switch /></div>
            <Button disabled>Save SMS Settings (Connect Cloud)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Shield className="h-4 w-4" />Subscription</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div>
                <p className="font-semibold font-display">Standard Plan</p>
                <p className="text-sm text-muted-foreground">KES 5,000/month</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className="font-medium text-success">Active</span>
                </p>
              </div>
              <Button variant="outline" disabled>Pay via M-Pesa</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
