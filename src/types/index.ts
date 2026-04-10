export type UserRole = 
  | 'super_admin'
  | 'hospital_admin'
  | 'receptionist'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab_technician'
  | 'accountant'
  | 'driver'
  | 'hr';

export interface Hospital {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  logo_url?: string;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_start?: string;
  subscription_end?: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  hospital_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  hospital_id: string;
  patient_number: string;
  full_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  insurance_provider?: string;
  insurance_number?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  hospital_id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  hospital_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id?: string;
  diagnosis: string;
  notes?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  hospital_id: string;
  medical_record_id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  status: 'prescribed' | 'dispensed' | 'cancelled';
  dispensed_by?: string;
  dispensed_at?: string;
  created_at: string;
}

export interface LabTest {
  id: string;
  hospital_id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  status: 'requested' | 'in_progress' | 'completed';
  results?: string;
  technician_id?: string;
  completed_at?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  hospital_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  reorder_level: number;
  expiry_date?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  hospital_id: string;
  patient_id: string;
  invoice_number: string;
  items: InvoiceItem[];
  total_amount: number;
  paid_amount: number;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
}

export interface InvoiceItem {
  description: string;
  category: 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'other';
  quantity: number;
  unit_price: number;
  total: number;
}

export interface AmbulanceRequest {
  id: string;
  hospital_id: string;
  patient_id?: string;
  driver_id?: string;
  pickup_location: string;
  destination: string;
  status: 'pending' | 'assigned' | 'on_trip' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  notes?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  hospital_id: string;
  reference_type: 'invoice' | 'subscription';
  reference_id: string;
  phone: string;
  amount: number;
  provider: 'intasend' | 'daraja';
  status: 'pending' | 'success' | 'failed';
  transaction_id?: string;
  created_at: string;
}

export interface InsuranceClaim {
  id: string;
  hospital_id: string;
  patient_id: string;
  provider: 'nhif' | 'sha';
  membership_number: string;
  services: string[];
  total_amount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  created_at: string;
}

export interface AuditLog {
  id: string;
  hospital_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  hospital_id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface SmsMessage {
  id: string;
  hospital_id: string;
  phone_number: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export interface PaymentSettings {
  id: string;
  hospital_id: string;
  provider_type: 'intasend' | 'daraja';
  publishable_key?: string;
  secret_key?: string;
  shortcode?: string;
  passkey?: string;
  environment: 'sandbox' | 'live';
}

// Role permissions map
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  hospital_admin: [
    'dashboard', 'reception', 'doctor', 'nurse', 'pharmacy', 'lab',
    'ambulance', 'billing', 'staff', 'settings', 'reports', 'insurance',
    'notifications', 'audit_logs'
  ],
  receptionist: ['dashboard', 'reception', 'billing'],
  doctor: ['dashboard', 'doctor', 'lab'],
  nurse: ['dashboard', 'nurse', 'doctor'],
  pharmacist: ['dashboard', 'pharmacy'],
  lab_technician: ['dashboard', 'lab'],
  accountant: ['dashboard', 'billing', 'reports', 'insurance'],
  driver: ['dashboard', 'ambulance'],
  hr: ['dashboard', 'hr', 'staff'],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
  accountant: 'Accountant',
  driver: 'Driver',
  hr: 'HR Manager',
};
