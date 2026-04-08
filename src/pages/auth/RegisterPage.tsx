import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
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
      toast({ title: 'Hospital registered!', description: 'Check your email to confirm your account.' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-display">HMS Kenya</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-display">Register Your Hospital</h2>
          <p className="text-muted-foreground mt-1">
            {step === 1 ? 'Step 1: Hospital details' : 'Step 2: Admin account'}
          </p>
          <div className="flex gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Hospital Name</Label><Input placeholder="e.g. Nairobi General Hospital" value={form.hospital_name} onChange={e => update('hospital_name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Hospital Email</Label><Input type="email" placeholder="info@hospital.co.ke" value={form.email} onChange={e => update('email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="+254 700 000 000" value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Location</Label><Input placeholder="City, County" value={form.location} onChange={e => update('location', e.target.value)} /></div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!form.hospital_name || !form.email}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Admin Full Name</Label><Input placeholder="Dr. Jane Wanjiku" value={form.admin_name} onChange={e => update('admin_name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Admin Email</Label><Input type="email" placeholder="admin@hospital.co.ke" value={form.admin_email} onChange={e => update('admin_email', e.target.value)} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="Minimum 6 characters" value={form.admin_password} onChange={e => update('admin_password', e.target.value)} /></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button className="flex-1" onClick={handleRegister} disabled={loading || !form.admin_email || !form.admin_password}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Hospital <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Button variant="link" className="px-0 text-primary" onClick={() => navigate('/login')}>Sign in</Button>
        </p>

        <div className="glass-panel rounded-xl p-4">
          <p className="text-sm font-semibold text-secondary-foreground">Subscription Plan</p>
          <p className="text-2xl font-bold text-foreground mt-1 font-display">KES 5,000<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <p className="text-xs text-muted-foreground mt-1">14-day free trial included. Pay via M-Pesa.</p>
        </div>
      </div>
    </div>
  );
}
