export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ambulance_requests: {
        Row: {
          created_at: string
          destination: string
          driver_id: string | null
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string | null
          pickup_location: string
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination: string
          driver_id?: string | null
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          pickup_location: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string
          driver_id?: string | null
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          pickup_location?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulance_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambulance_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          doctor_id: string
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string
          hospital_id: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type: string
          hospital_id: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          hospital_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          location: string
          logo_url: string | null
          name: string
          phone: string
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          location: string
          logo_url?: string | null
          name: string
          phone: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          location?: string
          logo_url?: string | null
          name?: string
          phone?: string
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          membership_number: string
          patient_id: string
          provider: string
          services: Json
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          membership_number: string
          patient_id: string
          provider: string
          services?: Json
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          membership_number?: string
          patient_id?: string
          provider?: string
          services?: Json
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          expiry_date: string | null
          hospital_id: string
          id: string
          name: string
          quantity: number
          reorder_level: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          hospital_id: string
          id?: string
          name: string
          quantity?: number
          reorder_level?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          hospital_id?: string
          id?: string
          name?: string
          quantity?: number
          reorder_level?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          due_date: string
          hospital_id: string
          id: string
          invoice_number: string
          items: Json
          paid_amount: number
          patient_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string
          hospital_id: string
          id?: string
          invoice_number: string
          items?: Json
          paid_amount?: number
          patient_id: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string
          hospital_id?: string
          id?: string
          invoice_number?: string
          items?: Json
          paid_amount?: number
          patient_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          completed_at: string | null
          created_at: string
          doctor_id: string
          hospital_id: string
          id: string
          patient_id: string
          results: string | null
          status: string
          technician_id: string | null
          test_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          doctor_id: string
          hospital_id: string
          id?: string
          patient_id: string
          results?: string | null
          status?: string
          technician_id?: string | null
          test_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          doctor_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          results?: string | null
          status?: string
          technician_id?: string | null
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_tests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string | null
          created_at: string
          diagnosis: string
          doctor_id: string
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          vitals: Json | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          diagnosis: string
          doctor_id: string
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id: string
          vitals?: Json | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          diagnosis?: string
          doctor_id?: string
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          hospital_id: string
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          patient_number: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          hospital_id: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          patient_number: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          hospital_id?: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          patient_number?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          created_at: string
          environment: string
          hospital_id: string
          id: string
          passkey: string | null
          provider_type: string
          publishable_key: string | null
          secret_key: string | null
          shortcode: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          hospital_id: string
          id?: string
          passkey?: string | null
          provider_type?: string
          publishable_key?: string | null
          secret_key?: string | null
          shortcode?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          hospital_id?: string
          id?: string
          passkey?: string | null
          provider_type?: string
          publishable_key?: string | null
          secret_key?: string | null
          shortcode?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: true
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dispensed_at: string | null
          dispensed_by: string | null
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          hospital_id: string
          id: string
          medical_record_id: string | null
          medication_name: string
          patient_id: string
          status: string
        }
        Insert: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id: string
          dosage: string
          duration: string
          frequency: string
          hospital_id: string
          id?: string
          medical_record_id?: string | null
          medication_name: string
          patient_id: string
          status?: string
        }
        Update: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          doctor_id?: string
          dosage?: string
          duration?: string
          frequency?: string
          hospital_id?: string
          id?: string
          medical_record_id?: string | null
          medication_name?: string
          patient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          hospital_id: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          hospital_id?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          hospital_id?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_messages: {
        Row: {
          created_at: string
          hospital_id: string
          id: string
          message: string
          phone_number: string
          status: string
        }
        Insert: {
          created_at?: string
          hospital_id: string
          id?: string
          message: string
          phone_number: string
          status?: string
        }
        Update: {
          created_at?: string
          hospital_id?: string
          id?: string
          message?: string
          phone_number?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_messages_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          hospital_id: string
          id: string
          phone: string
          provider: string
          reference_id: string
          reference_type: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          hospital_id: string
          id?: string
          phone: string
          provider: string
          reference_id: string
          reference_type: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          hospital_id?: string
          id?: string
          phone?: string
          provider?: string
          reference_id?: string
          reference_type?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          hospital_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          hospital_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          hospital_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_hospital_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "hospital_admin"
        | "receptionist"
        | "doctor"
        | "nurse"
        | "pharmacist"
        | "lab_technician"
        | "accountant"
        | "driver"
        | "hr"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "hospital_admin",
        "receptionist",
        "doctor",
        "nurse",
        "pharmacist",
        "lab_technician",
        "accountant",
        "driver",
        "hr",
      ],
    },
  },
} as const
