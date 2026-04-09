import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Eye, EyeOff, Loader2, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(210 35% 55%), hsl(210 30% 65%), hsl(210 25% 60%))' }}>
      <div className="w-full max-w-md">
        {/* Windows 7 style card */}
        <div className="rounded-lg overflow-hidden shadow-2xl border border-white/30">
          {/* Blue header bar */}
          <div className="px-6 py-4 text-center" style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
            <div className="flex items-center justify-center gap-2">
              <Pill className="h-6 w-6 text-orange-300" />
              <h1 className="text-xl font-bold text-white font-display">Abancool Technology HMS — Login</h1>
            </div>
          </div>

          {/* Form body */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="bg-white border-gray-300" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button className="w-full text-base font-semibold" type="submit" disabled={loading} style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Log In
              </Button>
            </form>

            <div className="border-t border-gray-300 pt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                New hospital?{' '}
                <Button variant="link" className="px-0 text-primary font-semibold" onClick={() => navigate('/register')}>
                  Register here
                </Button>
              </p>
            </div>

            <div className="border-t border-gray-300 pt-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">HMS Sponsor</p>
              <p className="text-sm font-bold text-primary">Powered by Abancool Technology</p>
              <p className="text-xs text-muted-foreground">0728825152 / 01116679286</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
