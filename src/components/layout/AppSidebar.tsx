import {
  LayoutDashboard, UserPlus, Stethoscope, HeartPulse, Pill,
  FlaskConical, Ambulance, Receipt, Users, Settings, Building2,
  Shield, Bell, FileText, CreditCard, BarChart3, Pill as PillIcon,
  Briefcase
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const hospitalModules = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { title: 'Reception', url: '/reception', icon: UserPlus, module: 'reception' },
  { title: 'Doctor', url: '/doctor', icon: Stethoscope, module: 'doctor' },
  { title: 'Nurse', url: '/nurse', icon: HeartPulse, module: 'nurse' },
  { title: 'Pharmacy', url: '/pharmacy', icon: Pill, module: 'pharmacy' },
  { title: 'Laboratory', url: '/lab', icon: FlaskConical, module: 'lab' },
  { title: 'Ambulance', url: '/ambulance', icon: Ambulance, module: 'ambulance' },
  { title: 'Billing', url: '/billing', icon: Receipt, module: 'billing' },
  { title: 'Insurance', url: '/insurance', icon: Shield, module: 'insurance' },
  { title: 'Reports', url: '/reports', icon: BarChart3, module: 'reports' },
];

const managementModules = [
  { title: 'HR', url: '/hr', icon: Briefcase, module: 'hr' },
  { title: 'Staff', url: '/staff', icon: Users, module: 'staff' },
  { title: 'Notifications', url: '/notifications', icon: Bell, module: 'notifications' },
  { title: 'Audit Logs', url: '/audit-logs', icon: FileText, module: 'audit_logs' },
  { title: 'Payments', url: '/payment-settings', icon: CreditCard, module: 'settings' },
  { title: 'Settings', url: '/settings', icon: Settings, module: 'settings' },
];

const superAdminModules = [
  { title: 'All Hospitals', url: '/admin/hospitals', icon: Building2, module: '*' },
  { title: 'Subscriptions', url: '/admin/subscriptions', icon: CreditCard, module: '*' },
  { title: 'Revenue', url: '/admin/revenue', icon: BarChart3, module: '*' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, hospital, hasPermission } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';

  const renderGroup = (label: string, items: typeof hospitalModules) => {
    const filtered = items.filter(i => hasPermission(i.module));
    if (filtered.length === 0) return null;
    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider font-medium">
          {!collapsed && label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filtered.map(item => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    activeClassName="bg-sidebar-accent text-sidebar-primary"
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 aero-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
              <Pill className="h-5 w-5 text-orange-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-sidebar-foreground truncate">
                {isSuperAdmin ? 'Abancool HMS' : hospital?.name || 'Hospital'}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {isSuperAdmin ? 'Super Admin' : 'Abancool Technology'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(180deg, hsl(210 70% 55%), hsl(210 75% 42%))' }}>
            <Pill className="h-5 w-5 text-orange-300" />
          </div>
        )}
      </div>
      <SidebarContent className="scrollbar-thin">
        {isSuperAdmin && renderGroup('Platform', superAdminModules)}
        {!isSuperAdmin && renderGroup('Clinical', hospitalModules)}
        {!isSuperAdmin && renderGroup('Management', managementModules)}
      </SidebarContent>
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border text-center">
          <p className="text-[10px] text-sidebar-foreground/40">Powered by Abancool Technology</p>
        </div>
      )}
    </Sidebar>
  );
}
