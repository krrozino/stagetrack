export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      academic_institutions: {
        Row: {
          acronym: string | null;
          active: boolean;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          acronym?: string | null;
          active?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          acronym?: string | null;
          active?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_logs: {
        Row: {
          activity_date: string;
          created_at: string;
          description: string;
          duration_minutes: number;
          end_time: string;
          group_label: string | null;
          id: string;
          internship_id: string;
          notes: string | null;
          review_comment: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          start_time: string;
          status: Database["public"]["Enums"]["activity_status"];
          student_id: string;
          teacher_name: string | null;
          updated_at: string;
        };
        Insert: {
          activity_date: string;
          created_at?: string;
          description: string;
          duration_minutes: number;
          end_time: string;
          group_label?: string | null;
          id?: string;
          internship_id: string;
          notes?: string | null;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          start_time: string;
          status?: Database["public"]["Enums"]["activity_status"];
          student_id?: string;
          teacher_name?: string | null;
          updated_at?: string;
        };
        Update: {
          activity_date?: string;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          end_time?: string;
          group_label?: string | null;
          id?: string;
          internship_id?: string;
          notes?: string | null;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          start_time?: string;
          status?: Database["public"]["Enums"]["activity_status"];
          student_id?: string;
          teacher_name?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_internship_id_fkey";
            columns: ["internship_id"];
            isOneToOne: false;
            referencedRelation: "internships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_logs_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_status_events: {
        Row: {
          activity_id: string;
          actor_id: string;
          comment: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["activity_status"] | null;
          id: string;
          internship_id: string;
          student_id: string;
          to_status: Database["public"]["Enums"]["activity_status"];
        };
        Insert: {
          activity_id: string;
          actor_id: string;
          comment?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["activity_status"] | null;
          id?: string;
          internship_id: string;
          student_id: string;
          to_status: Database["public"]["Enums"]["activity_status"];
        };
        Update: {
          activity_id?: string;
          actor_id?: string;
          comment?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["activity_status"] | null;
          id?: string;
          internship_id?: string;
          student_id?: string;
          to_status?: Database["public"]["Enums"]["activity_status"];
        };
        Relationships: [
          {
            foreignKeyName: "activity_status_events_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activity_logs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_status_events_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_status_events_internship_id_fkey";
            columns: ["internship_id"];
            isOneToOne: false;
            referencedRelation: "internships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_status_events_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      courses: {
        Row: {
          academic_institution_id: string;
          active: boolean;
          code: string | null;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          academic_institution_id: string;
          active?: boolean;
          code?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          academic_institution_id?: string;
          active?: boolean;
          code?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_academic_institution_id_fkey";
            columns: ["academic_institution_id"];
            isOneToOne: false;
            referencedRelation: "academic_institutions";
            referencedColumns: ["id"];
          },
        ];
      };
      internship_types: {
        Row: {
          active: boolean;
          course_id: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          required_minutes: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          course_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          required_minutes: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          course_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          required_minutes?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internship_types_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      internships: {
        Row: {
          advisor_id: string | null;
          created_at: string;
          expected_end_date: string | null;
          id: string;
          internship_type_id: string;
          organization_id: string;
          required_minutes: number;
          start_date: string;
          status: Database["public"]["Enums"]["internship_status"];
          student_id: string;
          supervisor_id: string | null;
          updated_at: string;
        };
        Insert: {
          advisor_id?: string | null;
          created_at?: string;
          expected_end_date?: string | null;
          id?: string;
          internship_type_id: string;
          organization_id: string;
          required_minutes: number;
          start_date: string;
          status?: Database["public"]["Enums"]["internship_status"];
          student_id?: string;
          supervisor_id?: string | null;
          updated_at?: string;
        };
        Update: {
          advisor_id?: string | null;
          created_at?: string;
          expected_end_date?: string | null;
          id?: string;
          internship_type_id?: string;
          organization_id?: string;
          required_minutes?: number;
          start_date?: string;
          status?: Database["public"]["Enums"]["internship_status"];
          student_id?: string;
          supervisor_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "internships_advisor_id_fkey";
            columns: ["advisor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internships_internship_type_id_fkey";
            columns: ["internship_type_id"];
            isOneToOne: false;
            referencedRelation: "internship_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internships_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "internships_supervisor_organization_fkey";
            columns: ["supervisor_id", "organization_id"];
            isOneToOne: false;
            referencedRelation: "supervisors";
            referencedColumns: ["id", "organization_id"];
          },
        ];
      };
      organizations: {
        Row: {
          address: string | null;
          city: string | null;
          created_at: string;
          created_by: string | null;
          document: string | null;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          postal_code: string | null;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          created_by?: string | null;
          document?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          created_at?: string;
          created_by?: string | null;
          document?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_role_change_requests: {
        Row: {
          actor_id: string;
          created_at: string;
          id: string;
          previous_role: Database["public"]["Enums"]["app_role"];
          requested_role: Database["public"]["Enums"]["app_role"];
          target_profile_id: string;
        };
        Insert: {
          actor_id?: string;
          created_at?: string;
          id?: string;
          previous_role: Database["public"]["Enums"]["app_role"];
          requested_role: Database["public"]["Enums"]["app_role"];
          target_profile_id: string;
        };
        Update: {
          actor_id?: string;
          created_at?: string;
          id?: string;
          previous_role?: Database["public"]["Enums"]["app_role"];
          requested_role?: Database["public"]["Enums"]["app_role"];
          target_profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_role_change_requests_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_role_change_requests_target_profile_id_fkey";
            columns: ["target_profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          course_id: string | null;
          created_at: string;
          full_name: string;
          id: string;
          registration_number: string | null;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          course_id?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          registration_number?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          course_id?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          registration_number?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      supervisors: {
        Row: {
          created_at: string;
          created_by: string | null;
          email: string | null;
          id: string;
          name: string;
          organization_id: string;
          phone: string | null;
          position: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          phone?: string | null;
          position?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          phone?: string | null;
          position?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supervisors_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      activity_status: "draft" | "submitted" | "approved" | "rejected";
      app_role: "student" | "advisor" | "coordinator";
      internship_status:
        | "draft"
        | "active"
        | "paused"
        | "completed"
        | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_status: ["draft", "submitted", "approved", "rejected"],
      app_role: ["student", "advisor", "coordinator"],
      internship_status: [
        "draft",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
    },
  },
} as const;
