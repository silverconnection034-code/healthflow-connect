import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setDemoUser } = useAuth();

  const quickAccess = (role: UserRole) => {
    setDemoUser(role);
    navigate(role === 'super_admin' ? '/admin/hospitals' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground font-display mb-4">
            Hospital Management System
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Complete SaaS platform for hospital operations in Kenya. Manage patients, staff, billing, and more.
          </p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">HMS Kenya</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your hospital workspace</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@hospital.co.ke" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full" disabled>
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Connect Lovable Cloud to enable authentication
            </p>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Quick Access (Preview)</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['hospital_admin', 'Hospital Admin'],
                ['receptionist', 'Receptionist'],
                ['doctor', 'Doctor'],
                ['nurse', 'Nurse'],
                ['pharmacist', 'Pharmacist'],
                ['lab_technician', 'Lab Tech'],
                ['accountant', 'Accountant'],
                ['driver', 'Driver'],
                ['super_admin', 'Super Admin'],
              ] as [UserRole, string][]).map(([role, label]) => (
                <Button key={role} variant="outline" size="sm" className="justify-start text-xs" onClick={() => quickAccess(role)}>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New hospital?{' '}
            <Button variant="link" className="px-0 text-primary" onClick={() => navigate('/register')}>
              Register here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
