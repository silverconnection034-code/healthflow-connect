import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, Loader2, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    hospital_name: '', email: '', phone: '', location: '',
    admin_name: '', admin_email: '', admin_password: '',
  });

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(form);
      toast({ title: 'Hospital registered!', description: 'You are now logged in.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(210 35% 55%), hsl(210 30% 65%), hsl(210 25% 60%))' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-lg overflow-hidden shadow-2xl border border-white/30">
          <div className="px-6 py-4 text-center" style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
            <div className="flex items-center justify-center gap-2">
              <Pill className="h-6 w-6 text-orange-300" />
              <h1 className="text-xl font-bold text-white font-display">Register Your Hospital</h1>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 space-y-6">
            <div>
              <p className="text-muted-foreground text-sm">
                {step === 1 ? 'Step 1: Hospital details' : 'Step 2: Admin account'}
              </p>
              <div className="flex gap-2 mt-3">
                <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="font-semibold">Hospital Name</Label><Input className="bg-white border-gray-300" placeholder="e.g. Nairobi General Hospital" value={form.hospital_name} onChange={e => update('hospital_name', e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-semibold">Hospital Email</Label><Input className="bg-white border-gray-300" type="email" placeholder="info@hospital.co.ke" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-semibold">Phone</Label><Input className="bg-white border-gray-300" placeholder="+254 700 000 000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-semibold">Location</Label><Input className="bg-white border-gray-300" placeholder="City, County" value={form.location} onChange={e => update('location', e.target.value)} /></div>
                <Button className="w-full" onClick={() => setStep(2)} disabled={!form.hospital_name || !form.email} style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2"><Label className="font-semibold">Admin Full Name</Label><Input className="bg-white border-gray-300" placeholder="Dr. Jane Wanjiku" value={form.admin_name} onChange={e => update('admin_name', e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-semibold">Admin Email</Label><Input className="bg-white border-gray-300" type="email" placeholder="admin@hospital.co.ke" value={form.admin_email} onChange={e => update('admin_email', e.target.value)} /></div>
                <div className="space-y-2"><Label className="font-semibold">Password</Label><Input className="bg-white border-gray-300" type="password" placeholder="Minimum 6 characters" value={form.admin_password} onChange={e => update('admin_password', e.target.value)} /></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                  <Button className="flex-1" onClick={handleRegister} disabled={loading || !form.admin_email || !form.admin_password} style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Hospital <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Button variant="link" className="px-0 text-primary font-semibold" onClick={() => navigate('/login')}>Sign in</Button>
            </p>

            <div className="border-t border-gray-300 pt-4">
              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <p className="text-sm font-semibold">Subscription Plan</p>
                <p className="text-2xl font-bold mt-1 font-display text-primary">KES 5,000<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-xs text-muted-foreground mt-1">14-day free trial included. Pay via M-Pesa.</p>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-primary">Powered by Abancool Technology</p>
              <p className="text-xs text-muted-foreground">0728825152 / 01116679286</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
