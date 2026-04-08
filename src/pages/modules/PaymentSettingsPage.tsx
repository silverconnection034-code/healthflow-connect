import { useState } from 'react';
import { CreditCard, Building2, Shield, Check } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PaymentSettingsPage() {
  const [provider, setProvider] = useState<'intasend' | 'daraja'>('intasend');

  return (
    <div className="module-page">
      <PageHeader title="Payment Settings" description="Configure M-Pesa payment provider for your hospital" icon={CreditCard} />

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Payment Provider</CardTitle>
          <CardDescription>Select and configure your preferred payment provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={provider} onValueChange={(v) => setProvider(v as 'intasend' | 'daraja')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`relative flex cursor-pointer rounded-xl border p-4 ${provider === 'intasend' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="intasend" className="sr-only" />
              <div>
                <p className="font-semibold text-sm">IntaSend</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended — easy setup, instant M-Pesa integration</p>
                {provider === 'intasend' && <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />}
              </div>
            </label>
            <label className={`relative flex cursor-pointer rounded-xl border p-4 ${provider === 'daraja' ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <RadioGroupItem value="daraja" className="sr-only" />
              <div>
                <p className="font-semibold text-sm">Safaricom Daraja</p>
                <p className="text-xs text-muted-foreground mt-1">Advanced — direct Safaricom API integration</p>
                {provider === 'daraja' && <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />}
              </div>
            </label>
          </RadioGroup>

          {provider === 'intasend' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2"><Label>Publishable Key</Label><Input placeholder="ISPubKey_live_..." /></div>
              <div className="space-y-2"><Label>Secret Key</Label><Input type="password" placeholder="ISSecretKey_live_..." /></div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="sandbox"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sandbox">Sandbox (Testing)</SelectItem><SelectItem value="live">Live (Production)</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}

          {provider === 'daraja' && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2"><Label>Business Shortcode</Label><Input placeholder="174379" /></div>
              <div className="space-y-2"><Label>Consumer Key</Label><Input type="password" placeholder="Consumer key from Daraja" /></div>
              <div className="space-y-2"><Label>Consumer Secret</Label><Input type="password" placeholder="Consumer secret from Daraja" /></div>
              <div className="space-y-2"><Label>Passkey</Label><Input type="password" placeholder="Lipa Na M-Pesa passkey" /></div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="sandbox"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="sandbox">Sandbox</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-sm">
            <Shield className="h-4 w-4 text-secondary-foreground shrink-0" />
            <span className="text-secondary-foreground">Credentials are encrypted and stored securely. Never exposed in frontend code.</span>
          </div>

          <Button className="w-full" disabled>Save Payment Settings (Connect Cloud)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
