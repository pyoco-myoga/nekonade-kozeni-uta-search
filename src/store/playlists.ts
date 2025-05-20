import type { AlgoliaData } from "@/algolia";
import { supabase } from "@/common";
import type { Tables } from "@/types/database.types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export type PlaylistType = "user" | "generated";

export type Playlist = {
  id: string;
  name: string;
  description: string;
  playlistPerformances: Map<number, AlgoliaData>;
  public: boolean;
  type: PlaylistType;
};

export const usePlaylistsStore = defineStore("playlists", () => {
  const playlists: Ref<Map<string, Playlist> | null> = ref(null);
  const playlistSubscription: Ref<ReturnType<typeof supabase.channel> | null> = ref(null);
  const playlistPerformancesSubscription: Ref<ReturnType<typeof supabase.channel> | null> =
    ref(null);

  async function fetchPlaylists(userId: string) {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        id,
        name,
        public,
        description,
        playlist_performances (
          track_order,
          performances (
            id,
            songs (
              id,
              name,
              artists (
                id,
                name
              )
            ),
            videos (
              video_id
            ),
            accompaniment,
            length,
            recommended,
            start_sec,
            end_sec
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("track_order", { foreignTable: "playlist_performances", ascending: true });
    if (error !== null) {
      console.error("Failed to fetch playlists: ", error);
      return;
    }
    playlists.value = new Map(
      data.map((p) => [
        p.id,
        {
          id: p.id,
          name: p.name,
          description: p.description,
          playlistPerformances: new Map(
            p.playlist_performances.map((pp) => [
              pp.track_order,
              {
                id: pp.performances.id,
                artist: pp.performances.songs.artists.name,
                artistId: pp.performances.songs.artists.id,
                song: pp.performances.songs.name,
                songId: pp.performances.songs.id,
                videoId: pp.performances.videos.video_id,
                startSec: pp.performances.start_sec,
                endSec: pp.performances.end_sec,
                recommended: pp.performances.recommended,
                accompaniment: pp.performances.accompaniment,
                length: pp.performances.length,
                _tags: [],
              },
            ])
          ),
          type: "user",
          public: p.public,
        },
      ])
    );
  }

  function handleRealtimePlaylistsPayload({
    eventType,
    new: newRow,
    old: oldRow,
  }: RealtimePostgresChangesPayload<Tables<"playlists">>) {
    if (playlists.value !== null) {
      if (eventType === "INSERT") {
        if (newRow === null) {
          throw Error("rdb query is INSERT, but new row not exists");
        }
        playlists.value.set(newRow.id, {
          id: newRow.id,
          name: newRow.name,
          description: newRow.description,
          playlistPerformances: new Map(),
          type: "user",
          public: newRow.public,
        });
      } else if (eventType === "DELETE") {
        if (oldRow === null) {
          throw Error("rdb query is DELETE, but old row not exists");
        }
        const { id: playlistId } = oldRow;
        if (playlistId === undefined) {
          throw Error("rdb query is DELETE, but required props not provided");
        }
        playlists.value.delete(playlistId);
      } else if (eventType === "UPDATE") {
        const performances = playlists.value.get(newRow.id)?.playlistPerformances ?? new Map();
        playlists.value.set(newRow.id, {
          id: newRow.id,
          name: newRow.name,
          description: newRow.description,
          public: newRow.public,
          type: "user",
          playlistPerformances: performances,
        });
      }
    }
  }

  async function handleRealtimePlaylistPerformancesPayload({
    eventType,
    new: newRow,
    old: oldRow,
  }: RealtimePostgresChangesPayload<Tables<"playlist_performances">>) {
    if (playlists.value !== null) {
      if (eventType === "INSERT") {
        if (newRow === null) {
          throw Error("rdb query is INSERT, but new row not exists");
        }
        const {
          playlist_id: playlistId,
          performance_id: performanceId,
          track_order: trackOrder,
        } = newRow;
        const { data, error } = await supabase
          .from("performances")
          .select(
            `
            id,
            songs (
              id,
              name,
              artists (
                id,
                name
              )
            ),
            videos (
              video_id
            ),
            accompaniment,
            length,
            recommended,
            start_sec,
            end_sec
          `
          )
          .eq("id", performanceId)
          .single();
        if (error !== null) {
          throw error;
        }
        playlists.value.get(playlistId)?.playlistPerformances.set(trackOrder, {
          id: data.id,
          artist: data.songs.artists.name,
          artistId: data.songs.artists.id,
          song: data.songs.name,
          songId: data.songs.id,
          videoId: data.videos.video_id,
          startSec: data.start_sec,
          endSec: data.end_sec,
          recommended: data.recommended,
          accompaniment: data.accompaniment,
          length: data.length,
          _tags: [],
        });
      } else if (eventType === "DELETE") {
        console.log(eventType, newRow, oldRow);
        if (oldRow === null) {
          throw Error("rdb query is DELETE, but old row not exists");
        }
        const { playlist_id: playlistId, track_order: trackOrder } = oldRow;
        if (playlistId === undefined || trackOrder === undefined) {
          throw Error("rdb query is DELETE, but required props not provided");
        }
        playlists.value?.get(playlistId)?.playlistPerformances.delete(trackOrder);
      } else if (eventType === "UPDATE") {
        const { playlist_id: playlistId, track_order: trackOrder, user_id: userId } = newRow;
        if (playlistId === undefined || trackOrder === undefined || userId === undefined) {
          throw Error("rdb query is UPDATE, but required props not provided");
        }

        const { data, error } = await supabase
          .from("playlist_performances")
          .select(
            `
            track_order,
            performances (
              id,
              songs (
                id,
                name,
                artists (
                  id,
                  name
                )
              ),
              videos (
                video_id
              ),
              accompaniment,
              length,
              recommended,
              start_sec,
              end_sec
            )
          `
          )
          .eq("user_id", userId)
          .eq("playlist_id", playlistId);
        if (error !== null) {
          console.error(error);
          return;
        }
        for (const playlistPerformance of data) {
          playlists.value
            .get(playlistId)
            ?.playlistPerformances.set(playlistPerformance.track_order, {
              id: playlistPerformance.performances.id,
              artist: playlistPerformance.performances.songs.artists.name,
              artistId: playlistPerformance.performances.songs.artists.id,
              song: playlistPerformance.performances.songs.name,
              songId: playlistPerformance.performances.songs.id,
              videoId: playlistPerformance.performances.videos.video_id,
              startSec: playlistPerformance.performances.start_sec,
              endSec: playlistPerformance.performances.end_sec,
              recommended: playlistPerformance.performances.recommended,
              accompaniment: playlistPerformance.performances.accompaniment,
              length: playlistPerformance.performances.length,
              _tags: [],
            });
        }
      }
    }
  }

  function subscribe(userId: string) {
    if (playlistSubscription.value === null) {
      playlistSubscription.value = supabase
        .channel("playlists:realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "playlists",
            filter: `user_id=eq.${userId}`,
          },
          handleRealtimePlaylistsPayload
        )
        .subscribe();
    }
    if (playlistPerformancesSubscription.value === null) {
      playlistPerformancesSubscription.value = supabase
        .channel("playlist_performances:realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "playlist_performances",
            filter: `user_id=eq.${userId}`,
          },
          handleRealtimePlaylistPerformancesPayload
        )
        .subscribe();
    }
  }

  async function createPlaylist({
    name,
    description,
    userId,
    isPublic,
  }: {
    name: string;
    description: string;
    userId: string;
    isPublic: boolean;
  }) {
    await supabase.from("playlists").insert({
      name,
      description,
      user_id: userId,
      public: isPublic,
    });
  }

  async function updatePlaylist({
    id,
    name,
    description,
    userId,
    isPublic,
  }: {
    id: string;
    name: string;
    description: string;
    userId: string;
    isPublic: boolean;
  }) {
    const { error } = await supabase
      .from("playlists")
      .update({
        name,
        description,
        public: isPublic,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error !== null) {
      console.error(error);
    }
  }

  async function deletePlaylist({ playlistId }: { playlistId: string }) {
    await supabase.from("playlists").delete().eq("id", playlistId);
  }

  async function addToPlaylist({
    performanceId,
    playlistId,
  }: {
    performanceId: string;
    playlistId: string;
  }) {
    const { error } = await supabase.rpc("insert_playlist_performance", {
      _performance_id: performanceId,
      _playlist_id: playlistId,
    });
    if (error !== null) {
      console.error(error);
    }
  }

  async function reorderPlaylist({
    playlistId,
    fromIndex,
    toIndex,
  }: {
    playlistId: string;
    fromIndex: number;
    toIndex: number;
  }) {
    const { error } = await supabase.rpc("reorder_playlist_performance", {
      _playlist_id: playlistId,
      _from_index: fromIndex,
      _to_index: toIndex,
    });
    if (error !== null) {
      console.log(error);
    }
  }

  async function removeFromPlaylist(playlistId: string, trackOrder: number) {
    const { error } = await supabase.rpc("delete_playlist_performance", {
      _playlist_id: playlistId,
      _track_order: trackOrder,
    });
    if (error !== null) {
      console.error(error);
    }
  }

  return {
    playlists,
    fetchPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addToPlaylist,
    reorderPlaylist,
    removeFromPlaylist,
    generatePlaylist,
    subscribe,
  };
});

export async function generatePlaylist({
  id,
  name,
  description,
  performanceIds,
}: {
  id: string;
  name: string;
  description: string;
  performanceIds: Array<string>;
}): Promise<Playlist> {
  const { data, error } = await supabase
    .from("performances")
    .select(
      `
      id,
      songs (
        id,
        name,
        artists (
          id,
          name
        )
      ),
      videos (
        video_id
      ),
      accompaniment,
      length,
      recommended,
      start_sec,
      end_sec
      `
    )
    .in("id", performanceIds);
  if (error !== null) {
    throw error;
  }

  const playlistPerformances = data
    .map((p) => ({
      id: p.id,
      artist: p.songs.artists.name,
      artistId: p.songs.artists.id,
      song: p.songs.name,
      songId: p.songs.id,
      videoId: p.videos.video_id,
      startSec: p.start_sec,
      endSec: p.end_sec,
      recommended: p.recommended,
      accompaniment: p.accompaniment,
      length: p.length,
      _tags: [],
    }))
    .sort((a: AlgoliaData, b: AlgoliaData) => {
      const artistCompare = a.artist.localeCompare(b.artist, "ja");
      if (artistCompare !== 0) {
        return artistCompare;
      }

      const songCompare = a.song.localeCompare(b.song, "ja");
      return songCompare;
    });

  return {
    id,
    name,
    description,
    playlistPerformances: new Map(playlistPerformances.map((value, index) => [index, value])),
    type: "generated",
    public: false,
  };
}
