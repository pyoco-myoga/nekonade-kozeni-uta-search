export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artist_alias: {
        Row: {
          alias: string
          artist_id: string
          id: string
        }
        Insert: {
          alias: string
          artist_id: string
          id?: string
        }
        Update: {
          alias?: string
          artist_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_alias_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          description: string
          id: string
          name: string
        }
        Insert: {
          description: string
          id?: string
          name: string
        }
        Update: {
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          performance_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          performance_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          performance_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
        ]
      }
      original: {
        Row: {
          end_sec: number | null
          id: string
          song_id: string
          start_sec: number | null
          video_id: string
        }
        Insert: {
          end_sec?: number | null
          id?: string
          song_id: string
          start_sec?: number | null
          video_id: string
        }
        Update: {
          end_sec?: number | null
          id?: string
          song_id?: string
          start_sec?: number | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "original_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "original_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      performances: {
        Row: {
          accompaniment: Database["public"]["Enums"]["performance_accompaniment"]
          end_sec: number
          id: string
          length: Database["public"]["Enums"]["performance_length"]
          recommended: boolean
          song_id: string
          start_sec: number
          video_id: string
        }
        Insert: {
          accompaniment: Database["public"]["Enums"]["performance_accompaniment"]
          end_sec: number
          id?: string
          length: Database["public"]["Enums"]["performance_length"]
          recommended: boolean
          song_id: string
          start_sec: number
          video_id: string
        }
        Update: {
          accompaniment?: Database["public"]["Enums"]["performance_accompaniment"]
          end_sec?: number
          id?: string
          length?: Database["public"]["Enums"]["performance_length"]
          recommended?: boolean
          song_id?: string
          start_sec?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performances_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performances_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_performances: {
        Row: {
          created_at: string
          performance_id: string
          playlist_id: string
          track_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          performance_id: string
          playlist_id: string
          track_order: number
          user_id: string
        }
        Update: {
          created_at?: string
          performance_id?: string
          playlist_id?: string
          track_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_performances_new_performance_id_fkey"
            columns: ["performance_id"]
            isOneToOne: false
            referencedRelation: "performances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_performances_new_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          public: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          public?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          public?: boolean
          user_id?: string
        }
        Relationships: []
      }
      song_alias: {
        Row: {
          alias: string
          id: string
          song_id: string
        }
        Insert: {
          alias: string
          id?: string
          song_id: string
        }
        Update: {
          alias?: string
          id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_alias_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      song_tags: {
        Row: {
          song_id: string
          tag_id: string
        }
        Insert: {
          song_id: string
          tag_id: string
        }
        Update: {
          song_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_tags_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          artist_id: string
          description: string
          id: string
          name: string
        }
        Insert: {
          artist_id: string
          description: string
          id?: string
          name: string
        }
        Update: {
          artist_id?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          id: string
          published_at: string
          title: string
          video_id: string
        }
        Insert: {
          id?: string
          published_at: string
          title: string
          video_id: string
        }
        Update: {
          id?: string
          published_at?: string
          title?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_playlist_performance: {
        Args: { _playlist_id: string; _track_order: number }
        Returns: undefined
      }
      get_tag_tree: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          name: string
          parent_id: number
          level: number
        }[]
      }
      insert_playlist_performance: {
        Args: { _playlist_id: string; _performance_id: string }
        Returns: undefined
      }
      normalize_playlist_track_order: {
        Args: { _playlist_id: string }
        Returns: undefined
      }
      reorder_playlist_performance: {
        Args: { _playlist_id: string; _from_index: number; _to_index: number }
        Returns: undefined
      }
    }
    Enums: {
      performance_accompaniment: "KARAOKE" | "ACOUSTIC" | "ELECTRIC"
      performance_length: "SHORT" | "FULL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      performance_accompaniment: ["KARAOKE", "ACOUSTIC", "ELECTRIC"],
      performance_length: ["SHORT", "FULL"],
    },
  },
} as const
