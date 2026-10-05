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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          target_calories: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fiber_g: number | null
          target_protein_g: number | null
          total_calories: number
          total_carbs_g: number
          total_fat_g: number
          total_fiber_g: number
          total_protein_g: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date: string
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          total_calories?: number
          total_carbs_g?: number
          total_fat_g?: number
          total_fiber_g?: number
          total_protein_g?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entries: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          daily_log_id: string
          fat_g: number
          fiber_g: number
          id: string
          item_name: string
          protein_g: number
          quantity_grams: number | null
          source: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          created_at?: string
          daily_log_id: string
          fat_g?: number
          fiber_g?: number
          id?: string
          item_name: string
          protein_g?: number
          quantity_grams?: number | null
          source?: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          daily_log_id?: string
          fat_g?: number
          fiber_g?: number
          id?: string
          item_name?: string
          protein_g?: number
          quantity_grams?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_entries_daily_log_id_fkey"
            columns: ["daily_log_id"]
            isOneToOne: false
            referencedRelation: "daily_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          onboarding_complete: boolean
          target_calories: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fiber_g: number | null
          target_protein_g: number | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          onboarding_complete?: boolean
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          onboarding_complete?: boolean
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_daily_log: {
        Args: { p_log_date: string }
        Returns: {
          created_at: string
          id: string
          log_date: string
          target_calories: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fiber_g: number | null
          target_protein_g: number | null
          total_calories: number
          total_carbs_g: number
          total_fat_g: number
          total_fiber_g: number
          total_protein_g: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "daily_logs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      recompute_daily_log_totals: {
        Args: { p_daily_log_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
export type FoodEntry = Database['public']['Tables']['food_entries']['Row'];
export type FoodEntryInsert = Database['public']['Tables']['food_entries']['Insert'];
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Gender = 'male' | 'female' | 'other';
