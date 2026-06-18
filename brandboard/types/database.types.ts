// ============================================================================
// Brandboard AI — Database types
// Hand-written to match supabase/migrations. Once the Supabase CLI is linked,
// regenerate with:
//   supabase gen types typescript --local > types/database.types.ts
// (or `--project-id <id>` for a remote project).
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          input_prompt: string | null;
          input_type: Database["public"]["Enums"]["project_input_type"];
          status: Database["public"]["Enums"]["project_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          input_prompt?: string | null;
          input_type?: Database["public"]["Enums"]["project_input_type"];
          status?: Database["public"]["Enums"]["project_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          input_prompt?: string | null;
          input_type?: Database["public"]["Enums"]["project_input_type"];
          status?: Database["public"]["Enums"]["project_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      boards: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          canvas_state: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name?: string;
          canvas_state?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          canvas_state?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "boards_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          project_id: string;
          type: Database["public"]["Enums"]["asset_type"];
          title: string | null;
          url: string | null;
          source: Database["public"]["Enums"]["asset_source"];
          metadata_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: Database["public"]["Enums"]["asset_type"];
          title?: string | null;
          url?: string | null;
          source?: Database["public"]["Enums"]["asset_source"];
          metadata_json?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: Database["public"]["Enums"]["asset_type"];
          title?: string | null;
          url?: string | null;
          source?: Database["public"]["Enums"]["asset_source"];
          metadata_json?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_results: {
        Row: {
          id: string;
          project_id: string;
          summary: string | null;
          mission: string | null;
          positioning: string | null;
          tone: string | null;
          color_palette: Json;
          typography: Json;
          competitors: Json;
          insights: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          summary?: string | null;
          mission?: string | null;
          positioning?: string | null;
          tone?: string | null;
          color_palette?: Json;
          typography?: Json;
          competitors?: Json;
          insights?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          summary?: string | null;
          mission?: string | null;
          positioning?: string | null;
          tone?: string | null;
          color_palette?: Json;
          typography?: Json;
          competitors?: Json;
          insights?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_results_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      canvas_items: {
        Row: {
          id: string;
          board_id: string;
          asset_id: string | null;
          node_type: Database["public"]["Enums"]["canvas_node_type"];
          x: number;
          y: number;
          width: number;
          height: number;
          rotation: number;
          z_index: number;
          notes: string | null;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          asset_id?: string | null;
          node_type?: Database["public"]["Enums"]["canvas_node_type"];
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          z_index?: number;
          notes?: string | null;
          data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          asset_id?: string | null;
          node_type?: Database["public"]["Enums"]["canvas_node_type"];
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          z_index?: number;
          notes?: string | null;
          data?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "canvas_items_board_id_fkey";
            columns: ["board_id"];
            referencedRelation: "boards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "canvas_items_asset_id_fkey";
            columns: ["asset_id"];
            referencedRelation: "assets";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["job_kind"];
          status: Database["public"]["Enums"]["job_status"];
          progress: number;
          step: string | null;
          error: string | null;
          external_run_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          kind: Database["public"]["Enums"]["job_kind"];
          status?: Database["public"]["Enums"]["job_status"];
          progress?: number;
          step?: string | null;
          error?: string | null;
          external_run_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          kind?: Database["public"]["Enums"]["job_kind"];
          status?: Database["public"]["Enums"]["job_status"];
          progress?: number;
          step?: string | null;
          error?: string | null;
          external_run_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_project_owner: {
        Args: { p_project_id: string };
        Returns: boolean;
      };
      is_board_owner: {
        Args: { p_board_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      project_input_type: "company" | "url" | "concept" | "industry";
      project_status: "draft" | "generating" | "ready" | "failed";
      asset_type: "image" | "color" | "font" | "logo" | "note" | "reference";
      asset_source:
        | "brandfetch"
        | "serpapi"
        | "apify"
        | "unsplash"
        | "pexels"
        | "ai"
        | "user";
      canvas_node_type: "image" | "color" | "text" | "note" | "section";
      job_kind: "audit" | "moodboard";
      job_status: "queued" | "running" | "succeeded" | "failed";
    };
    CompositeTypes: Record<never, never>;
  };
};

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

// Row aliases for everyday use.
export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;
export type Board = Tables<"boards">;
export type Asset = Tables<"assets">;
export type AuditResult = Tables<"audit_results">;
export type CanvasItem = Tables<"canvas_items">;
export type Job = Tables<"jobs">;
