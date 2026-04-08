import { useState } from 'react';
import { CreditCard, Shield, Check, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<'intasend' | 'daraja'>('intasend');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    publishable_key: '', secret_key: '', shortcode: '', passkey: '', environment: 'sandbox',
  });

  const saveSettings = async () => {
    if (!user?.hospital_id) return;
    setLoading(true);
    const { error } = await supabase.from('payment_settings').upsert({
      hospital_id: user.hospital_id, provider_type: provider,
      publishable_key: form.publishable_key || null,
      secret_key: form.secret_key || null,
      shortcode: form.shortcode || null,
      passkey: form.passkey || null,
      environment: form.environment,
    }, { onConflict: 'hospital_id' });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Payment settings saved' });
    setLoading(false);
  };

  return (
    <div className="module-page">
      <PageHeader title="Payment Settings" description="Configure M-Pesa payment provider" icon={CreditCard} />

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="font-display">Payment Provider</CardTitle>
          <CardDescription>Select and configure your preferred payment provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={provider} onValueChange={(v) => setProvider(v as 'intasend' | 'daraja')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex cursor-pointer rounded-xl border p-4 ${provider === 'intasend' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="intasend" className="sr-only" />
              <div><p className="font-semibold text-sm">IntaSend</p><p className="text-xs text-muted-foreground mt-1">Recommended — easy M-Pesa integration</p>
                {provider === 'intasend' && <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />}</div>
            </label>
            <label className={`relative flex cursor-pointer rounded-xl border p-4 ${provider === 'daraja' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="daraja" className="sr-only" />
              <div><p className="font-semibold text-sm">Safaricom Daraja</p><p className="text-xs text-muted-foreground mt-1">Advanced — direct Safaricom API</p>
                {provider === 'daraja' && <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />}</div>
            </label>
          </RadioGroup>

          {provider === 'intasend' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2"><Label>Publishable Key</Label><Input value={form.publishable_key} onChange={e => setForm(p => ({ ...p, publishable_key: e.target.value }))} placeholder="ISPubKey_live_..." /></div>
              <div className="space-y-2"><Label>Secret Key</Label><Input type="password" value={form.secret_key} onChange={e => setForm(p => ({ ...p, secret_key: e.target.value }))} placeholder="ISSecretKey_live_..." /></div>
              <div className="space-y-2"><Label>Environment</Label>
                <Select value={form.environment} onValueChange={v => setForm(p => ({ ...p, environment: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sandbox">Sandbox</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent>
                </Select></div>
            </div>
          )}

          {provider === 'daraja' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2"><Label>Business Shortcode</Label><Input value={form.shortcode} onChange={e => setForm(p => ({ ...p, shortcode: e.target.value }))} placeholder="174379" /></div>
              <div className="space-y-2"><Label>Consumer Key</Label><Input type="password" value={form.publishable_key} onChange={e => setForm(p => ({ ...p, publishable_key: e.target.value }))} placeholder="Consumer key" /></div>
              <div className="space-y-2"><Label>Consumer Secret</Label><Input type="password" value={form.secret_key} onChange={e => setForm(p => ({ ...p, secret_key: e.target.value }))} placeholder="Consumer secret" /></div>
              <div className="space-y-2"><Label>Passkey</Label><Input type="password" value={form.passkey} onChange={e => setForm(p => ({ ...p, passkey: e.target.value }))} placeholder="Passkey" /></div>
              <div className="space-y-2"><Label>Environment</Label>
                <Select value={form.environment} onValueChange={v => setForm(p => ({ ...p, environment: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sandbox">Sandbox</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent>
                </Select></div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
            <Shield className="h-4 w-4 text-secondary-foreground shrink-0" />
            <span className="text-secondary-foreground">Credentials are encrypted and stored securely.</span>
          </div>

          <Button className="w-full" onClick={saveSettings} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Payment Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
