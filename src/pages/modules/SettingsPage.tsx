import { useState } from 'react';
import { Settings, Building2, Bell, Shield } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { hospital } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: hospital?.name || '', email: hospital?.email || '',
    phone: hospital?.phone || '', location: hospital?.location || '',
  });
  const [loading, setLoading] = useState(false);

  const saveSettings = async () => {
    if (!hospital?.id) return;
    setLoading(true);
    const { error } = await supabase.from('hospitals').update(form).eq('id', hospital.id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settings saved' });
    setLoading(false);
  };

  return (
    <div className="module-page">
      <PageHeader title="Settings" description="Hospital configuration" icon={Settings} />

      <div className="grid gap-6">
        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Building2 className="h-4 w-4" />Hospital Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Hospital Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
            </div>
            <Button onClick={saveSettings} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Shield className="h-4 w-4" />Subscription</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div>
                <p className="font-semibold font-display">Standard Plan</p>
                <p className="text-sm text-muted-foreground">KES 5,000/month</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Status: <span className={`font-medium ${hospital?.subscription_status === 'active' ? 'text-success' : hospital?.subscription_status === 'trial' ? 'text-warning' : 'text-destructive'}`}>
                    {hospital?.subscription_status || 'Unknown'}
                  </span>
                </p>
                {hospital?.subscription_end && (
                  <p className="text-xs text-muted-foreground">Expires: {new Date(hospital.subscription_end).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
