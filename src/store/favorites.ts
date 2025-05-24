import { defineStore } from "pinia";
import { supabase } from "@/common";
import { ref, type Ref } from "vue";
import type { Tables } from "@/types/database.types.ts";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { AlgoliaData } from "@/algolia";
import { generatePlaylist, type Playlist } from "@/store/playlists";

export const useFavoritesStore = defineStore("favorites", () => {
  const favorites: Ref<Array<string> | null> = ref(null);
  const subscription: Ref<ReturnType<typeof supabase.channel> | null> = ref(null);

  function isFavorite(performance: AlgoliaData): boolean | null {
    return favorites.value?.includes(performance.id) ?? null;
  }

  function isFavoritesSubscribed(): boolean {
    return subscription.value !== null;
  }

  async function fetchFavorites(userId: string) {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .overrideTypes<Array<Tables<"favorites">>>();
    if (error !== null) {
      console.error(error);
      return;
    }
    favorites.value = data.map((f) => f.performance_id);
  }

  function handleRealtimePayload({
    eventType,
    new: newRow,
    old: oldRow,
  }: RealtimePostgresChangesPayload<Tables<"favorites">>) {
    if (favorites.value !== null) {
      if (eventType === "INSERT") {
        if (newRow === null) {
          throw Error("rdb query is INSERT, but new row not exists");
        }
        favorites.value = [...favorites.value, newRow.performance_id];
      } else if (eventType === "DELETE") {
        if (oldRow === null) {
          throw Error("rdb query is DELETE, but old row not exists");
        }
        favorites.value = favorites.value.filter((f) => f !== oldRow.performance_id);
      }
    }
  }

  function subscribe(userId: string) {
    if (subscription.value !== null) {
      return;
    }
    subscription.value = supabase
      .channel("favorites:realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "favorites",
          filter: `user_id=eq.${userId}`,
        },
        handleRealtimePayload
      )
      .subscribe();
  }

  async function unsubscribe() {
    if (subscription.value === null) {
      return;
    }
    await supabase.removeChannel(subscription.value);
    subscription.value = null;
    favorites.value = null;
  }

  async function getFavoritePlaylist(): Promise<Playlist | null> {
    if (favorites.value === null) {
      return null;
    }

    return await generatePlaylist({
      id: "favorites",
      name: "お気に入り",
      description: "お気に入りプレイリスト",
      performanceIds: favorites.value,
    });
  }

  return {
    favorites,
    isFavorite,
    isFavoritesSubscribed,
    fetchFavorites,
    getFavoritePlaylist,
    subscribe,
    unsubscribe,
  };
});
