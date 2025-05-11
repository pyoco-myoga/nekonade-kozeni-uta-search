import { supabase } from '@/common';
import { type User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';
import { useFavoritesStore } from './favorites';
import { usePlaylistsStore } from './playlists';

export const useUserStore = defineStore('app', () => {
  const user: Ref<User | null> = ref(null);

  function isLoggedIn (): boolean {
    return user.value !== null;
  }

  function login (user_: User) {
    user.value = user_;
    const favoriteStore = useFavoritesStore();
    favoriteStore.fetchFavorites(user.value.id);
    favoriteStore.subscribe(user.value.id);

    const playlistsStore = usePlaylistsStore();
    playlistsStore.fetchPlaylists(user.value.id);
    playlistsStore.subscribe(user.value.id);
  }

  async function logout () {
    const { error } = await supabase.auth.signOut();
    if (error !== null) {
      console.log(error);
    }
    user.value = null;
    const favoriteStore = useFavoritesStore();
    await favoriteStore.unsubscribe();
  }

  return {
    user,
    login,
    logout,
    isLoggedIn,
  };
});
