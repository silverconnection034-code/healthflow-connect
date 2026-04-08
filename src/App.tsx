import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ReceptionPage from "@/pages/modules/ReceptionPage";
import DoctorPage from "@/pages/modules/DoctorPage";
import NursePage from "@/pages/modules/NursePage";
import PharmacyPage from "@/pages/modules/PharmacyPage";
import LabPage from "@/pages/modules/LabPage";
import AmbulancePage from "@/pages/modules/AmbulancePage";
import BillingPage from "@/pages/modules/BillingPage";
import InsurancePage from "@/pages/modules/InsurancePage";
import StaffPage from "@/pages/modules/StaffPage";
import ReportsPage from "@/pages/modules/ReportsPage";
import NotificationsPage from "@/pages/modules/NotificationsPage";
import AuditLogsPage from "@/pages/modules/AuditLogsPage";
import PaymentSettingsPage from "@/pages/modules/PaymentSettingsPage";
import SettingsPage from "@/pages/modules/SettingsPage";
import SuperAdminHospitalsPage, { SuperAdminSubscriptionsPage, SuperAdminRevenuePage } from "@/pages/admin/SuperAdminPages";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/reception" element={<ProtectedRoute><ReceptionPage /></ProtectedRoute>} />
      <Route path="/doctor" element={<ProtectedRoute><DoctorPage /></ProtectedRoute>} />
      <Route path="/nurse" element={<ProtectedRoute><NursePage /></ProtectedRoute>} />
      <Route path="/pharmacy" element={<ProtectedRoute><PharmacyPage /></ProtectedRoute>} />
      <Route path="/lab" element={<ProtectedRoute><LabPage /></ProtectedRoute>} />
      <Route path="/ambulance" element={<ProtectedRoute><AmbulancePage /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
      <Route path="/staff" element={<ProtectedRoute><StaffPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/payment-settings" element={<ProtectedRoute><PaymentSettingsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="/admin/hospitals" element={<ProtectedRoute><SuperAdminHospitalsPage /></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute><SuperAdminSubscriptionsPage /></ProtectedRoute>} />
      <Route path="/admin/revenue" element={<ProtectedRoute><SuperAdminRevenuePage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
