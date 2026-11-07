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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      idea_comments: {
        Row: {
          body: string
          created_at: string
          field: string
          id: string
          idea_id: string
          student_id: string
        }
        Insert: {
          body: string
          created_at?: string
          field?: string
          id?: string
          idea_id: string
          student_id: string
        }
        Update: {
          body?: string
          created_at?: string
          field?: string
          id?: string
          idea_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_likes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_likes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_likes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          approved: boolean
          cons: string
          created_at: string
          hidden: boolean
          id: string
          improvement: string
          problem_key: string
          pros: string
          solution: string
          student_id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          cons?: string
          created_at?: string
          hidden?: boolean
          id?: string
          improvement?: string
          problem_key: string
          pros?: string
          solution?: string
          student_id: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          cons?: string
          created_at?: string
          hidden?: boolean
          id?: string
          improvement?: string
          problem_key?: string
          pros?: string
          solution?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_presence: {
        Row: {
          direction: string
          moving: boolean
          solved: number
          student_id: string
          teacher_id: string
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          direction?: string
          moving?: boolean
          solved?: number
          student_id: string
          teacher_id: string
          updated_at?: string
          x?: number
          y?: number
        }
        Update: {
          direction?: string
          moving?: boolean
          solved?: number
          student_id?: string
          teacher_id?: string
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_presence_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_presence_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar: Json
          code: string
          created_at: string
          id: string
          name: string
          teacher_id: string
        }
        Insert: {
          avatar?: Json
          code: string
          created_at?: string
          id?: string
          name: string
          teacher_id: string
        }
        Update: {
          avatar?: Json
          code?: string
          created_at?: string
          id?: string
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          board_mode: string
          created_at: string
          display_name: string
          id: string
          school_name: string
          village_name: string
        }
        Insert: {
          board_mode?: string
          created_at?: string
          display_name?: string
          id: string
          school_name?: string
          village_name?: string
        }
        Update: {
          board_mode?: string
          created_at?: string
          display_name?: string
          id?: string
          school_name?: string
          village_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sync_presence: {
        Args: {
          _code: string
          _dir: string
          _moving: boolean
          _solved: number
          _x: number
          _y: number
        }
        Returns: Json
      }
      sync_presence_v2: {
        Args: {
          _code: string
          _dir: string
          _moving: boolean
          _solved: number
          _write: boolean
          _x: number
          _y: number
        }
        Returns: Json
      }
      teacher_presence: { Args: { _window_seconds?: number }; Returns: Json }
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
  public: {
    Enums: {},
  },
} as const
