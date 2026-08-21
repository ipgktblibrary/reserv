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
      bookers: {
        Row: {
          block_reason: string | null
          created_at: string | null
          id: string
          is_blocked: boolean | null
          name: string | null
          profile_id: string | null
        }
        Insert: {
          block_reason?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          name?: string | null
          profile_id?: string | null
        }
        Update: {
          block_reason?: string | null
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          name?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          allowed_days: number[]
          booking_enabled: boolean
          created_at: string
          id: string
          max_days_ahead: number
          max_slots_per_user_per_day: number
          min_days_ahead: number
          updated_at: string
        }
        Insert: {
          allowed_days?: number[]
          booking_enabled?: boolean
          created_at?: string
          id?: string
          max_days_ahead?: number
          max_slots_per_user_per_day?: number
          min_days_ahead?: number
          updated_at?: string
        }
        Update: {
          allowed_days?: number[]
          booking_enabled?: boolean
          created_at?: string
          id?: string
          max_days_ahead?: number
          max_slots_per_user_per_day?: number
          min_days_ahead?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone_number: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string
          phone_number?: string | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone_number?: string | null
          role?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          booker_id: string | null
          booking_date: string
          cancel_reason: string | null
          capacity: number
          created_at: string | null
          full_name: string
          id: string
          project_progress: string | null
          project_type: string | null
          room_id: string
          slot_id: string
          status: string
          user_role: string
        }
        Insert: {
          booker_id?: string | null
          booking_date: string
          cancel_reason?: string | null
          capacity: number
          created_at?: string | null
          full_name: string
          id?: string
          project_progress?: string | null
          project_type?: string | null
          room_id: string
          slot_id: string
          status?: string
          user_role: string
        }
        Update: {
          booker_id?: string | null
          booking_date?: string
          cancel_reason?: string | null
          capacity?: number
          created_at?: string | null
          full_name?: string
          id?: string
          project_progress?: string | null
          project_type?: string | null
          room_id?: string
          slot_id?: string
          status?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_booker_id_fkey"
            columns: ["booker_id"]
            isOneToOne: false
            referencedRelation: "bookers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "room_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      room_overrides: {
        Row: {
          blocked_reason: string | null
          created_at: string
          end_date: string
          id: string
          is_blocked: boolean
          room_id: string
          start_date: string
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_blocked?: boolean
          room_id: string
          start_date: string
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_blocked?: boolean
          room_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_overrides_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_time_slots: {
        Row: {
          blocked_reason: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_blocked: boolean | null
          room_id: string
          slot_index: number
          start_time: string
        }
        Insert: {
          blocked_reason?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time: string
          id?: string
          is_blocked?: boolean | null
          room_id: string
          slot_index: number
          start_time: string
        }
        Update: {
          blocked_reason?: string | null
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_blocked?: boolean | null
          room_id?: string
          slot_index?: number
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_time_slots_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          label: string | null
          name: string
          teacher_only: boolean | null
        }
        Insert: {
          capacity?: number
          created_at?: string | null
          id: string
          label?: string | null
          name: string
          teacher_only?: boolean | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          label?: string | null
          name?: string
          teacher_only?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      reservation_reports: {
        Row: {
          booker_name: string | null
          booker_phone: string | null
          booking_date: string | null
          id: string | null
          room_name: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      booker_delete: { Args: { p_booker_id: string }; Returns: undefined }
      check_daily_limit: {
        Args: { p_booker_id: string; p_date: string }
        Returns: boolean
      }
      check_signup_available: {
        Args: { p_email: string; p_phone_number: string }
        Returns: Json
      }
      create_reservation: {
        Args: {
          p_booker_id?: string
          p_booking_date: string
          p_capacity: number
          p_full_name: string
          p_project_progress: string
          p_project_type: string
          p_room_id: string
          p_slot_ids: string[]
          p_user_role: string
        }
        Returns: undefined
      }
      create_room_time_slot: {
        Args: {
          p_day_of_week: number
          p_end_time: string
          p_room_id: string
          p_start_time: string
        }
        Returns: {
          blocked_reason: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_blocked: boolean | null
          room_id: string
          slot_index: number
          start_time: string
        }
        SetofOptions: {
          from: "*"
          to: "room_time_slots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_room_time_slot: { Args: { p_id: string }; Returns: undefined }
      get_booked_slots: {
        Args: { p_date: string; p_room_id: string }
        Returns: {
          slot_id: string
        }[]
      }
      get_bookers_admin: {
        Args: never
        Returns: {
          id: string
          is_blocked: boolean
          name: string
          phone_number: string
          total_bookings: number
        }[]
      }
      get_monthly_report: { Args: { p_month: string }; Returns: Json }
      get_my_role: { Args: never; Returns: string }
      get_reservation_reports: {
        Args: never
        Returns: {
          booker_name: string
          booker_phone: string
          booking_date: string
          capacity: number
          id: string
          room_id: string
          room_name: string
          status: string
          time_slot: string
        }[]
      }
      get_room_time_slots_for_date: {
        Args: { p_date: string; p_room_id: string }
        Returns: {
          blocked_reason: string
          day_of_week: number
          end_time: string
          id: string
          is_blocked: boolean
          room_id: string
          slot_index: number
          start_time: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      profile_create: {
        Args: {
          user_email: string
          user_id: string
          user_name: string
          user_phone_number: string
          user_role: string
        }
        Returns: undefined
      }
      update_room_time_slot: {
        Args: { p_end_time: string; p_id: string; p_start_time: string }
        Returns: {
          blocked_reason: string | null
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_blocked: boolean | null
          room_id: string
          slot_index: number
          start_time: string
        }
        SetofOptions: {
          from: "*"
          to: "room_time_slots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      projek_enum: "perbincangan" | "mesyuarat" | "ulang kaji"
      student_class_enum: "dit5a" | "dit5b"
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
      projek_enum: ["perbincangan", "mesyuarat", "ulang kaji"],
      student_class_enum: ["dit5a", "dit5b"],
    },
  },
} as const
