<script lang="ts" setup>
import type { AlgoliaData } from "@/algolia";
import { usePlaylistsStore, type Playlist } from "@/store/playlists";
import { useUserStore } from "@/store/user";
import { reactive } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import { VueDraggable } from "vue-draggable-plus";

const show = defineModel<boolean>("show", { required: true });

type EditablePlaylist = Omit<Playlist, "id"> & { id: string | null };

const props = withDefaults(
  defineProps<{
    playlist?: EditablePlaylist;
  }>(),
  {
    playlist: () => ({
      id: null,
      name: "",
      description: "",
      public: false,
      playlistPerformances: new Map<number, AlgoliaData>(),
      type: "user",
    }),
  }
);

const rules = [(value: string) => (value !== "" ? true : "required")];

function createInitialForm() {
  return {
    name: props.playlist.name,
    description: props.playlist.description,
    public: props.playlist.public,
    playlistPerformances: Array.from(props.playlist.playlistPerformances.entries())
      .sort(([order1], [order2]) => order1 - order2)
      .map(([_, performance]) => ({ ...performance, uuid: crypto.randomUUID() })),
  };
}

const form = reactive(createInitialForm());

function resetForm() {
  const fresh = createInitialForm();
  form.name = fresh.name;
  form.description = fresh.description;
  form.public = fresh.public;
  form.playlistPerformances = [...fresh.playlistPerformances];
}

const userStore = useUserStore();
const playlistsStore = usePlaylistsStore();

async function onClickPlaylistCreate() {
  if (userStore.user === null) {
    console.error("user must be logged in");
    return;
  }
  if (props.playlist.id === null) {
    await playlistsStore.createPlaylist({
      name: form.name,
      description: form.description,
      userId: userStore.user.id,
      isPublic: form.public,
    });
  } else {
    await playlistsStore.updatePlaylist({
      id: props.playlist.id,
      name: form.name,
      description: form.description,
      userId: userStore.user.id,
      isPublic: form.public,
      playlistPerformanceIds: form.playlistPerformances.map((pp) => pp.id),
    });
  }
  show.value = false;
}
const theme = useTheme();
</script>

<template>
  <v-dialog v-model="show" persistent>
    <v-form @submit.prevent="onClickPlaylistCreate">
      <v-card>
        <v-toolbar
          :style="{
            color: theme.current.value.colors['on-primary'],
            backgroundColor: theme.current.value.colors.primary,
          }"
        >
          <template v-slot:title>
            <span class="font-weight-bold">
              <div>
                <v-icon icon="mdi-music" />
                <template v-if="props.playlist.id === null"> プレイリスト作成 </template>
                <template v-else> プレイリスト更新 </template>
              </div>
            </span>
          </template>
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="form.name" label="name (required)" :rules="rules" variant="solo" />
          <v-textarea v-model="form.description" label="description (optional)" variant="solo" />
          <v-switch
            label="public"
            :color="theme.current.value.colors.primary"
            v-model="form.public"
          />
          <VueDraggable v-model="form.playlistPerformances" :animation="150" handle=".handle">
            <template
              v-for="(performance, trackOrder) of form.playlistPerformances"
              :key="performance.uuid"
            >
              <PlaylistSongCard
                :performance="performance"
                :playlist-type="playlist.type"
                :is-playing="false"
              >
                <template #user-playlist-post-icon>
                  <v-btn
                    :elevation="0"
                    icon="mdi-minus-circle-outline"
                    @click.stop="
                      form.playlistPerformances.splice(trackOrder, 1);
                      console.log(form.playlistPerformances);
                      console.log(trackOrder);
                    "
                  />
                  {{ trackOrder }}
                  <template v-if="props.playlist.type === 'user'">
                    <v-btn :elevation="0" class="handle" icon="mdi-menu" />
                  </template>
                </template>
              </PlaylistSongCard>
            </template>
          </VueDraggable>
        </v-card-text>
        <v-card-actions>
          <v-btn
            text="キャンセル"
            @click="
              resetForm();
              show = false;
            "
          />
          <v-btn :text="props.playlist.id === null ? '作成' : '更新'" type="submit" />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
