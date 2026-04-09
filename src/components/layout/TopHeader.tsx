import { Bell, LogOut, User, Menu, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function TopHeader() {
  const { user, hospital, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin', hospital_admin: 'Administrator',
    receptionist: 'Receptionist', doctor: 'Doctor', nurse: 'Nurse',
    pharmacist: 'Pharmacist', lab_technician: 'Lab Technician',
    accountant: 'Accountant', driver: 'Driver',
  };

  return (
    <header className="aero-header h-12 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{ROLE_LABELS[user?.role || ''] || 'User'} ({user?.full_name || user?.email})</span>
          {hospital && <span className="text-muted-foreground">• {hospital.name}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="hidden sm:flex items-center gap-1.5 text-success">
          <Wifi className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Online</span>
        </div>
        <RefreshCw className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={() => window.location.reload()} />
        <span className="hidden md:inline text-xs text-muted-foreground">
          {time.toLocaleDateString()} — {time.toLocaleTimeString()}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/notifications')}>
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
