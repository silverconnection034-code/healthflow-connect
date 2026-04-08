import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin', hospital_admin: 'Hospital Admin',
  receptionist: 'Receptionist', doctor: 'Doctor', nurse: 'Nurse',
  pharmacist: 'Pharmacist', lab_technician: 'Lab Technician',
  accountant: 'Accountant', driver: 'Driver',
};

export function TopHeader() {
  const { user, hospital, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 aero-header flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        {hospital && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{hospital.name}</span>
            {hospital.subscription_status === 'active' && (
              <Badge variant="secondary" className="text-xs bg-success/10 text-success border-0">Active</Badge>
            )}
            {hospital.subscription_status === 'trial' && (
              <Badge variant="secondary" className="text-xs bg-warning/10 text-warning border-0">Trial</Badge>
            )}
            {hospital.subscription_status === 'expired' && (
              <Badge variant="destructive" className="text-xs">Expired</Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground relative" onClick={() => navigate('/notifications')}>
          <Bell className="h-4.5 w-4.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user ? ROLE_LABELS[user.role] || user.role : ''}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
