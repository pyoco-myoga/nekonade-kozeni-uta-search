<script lang="ts" setup>
import { usePlaylistsStore } from "@/store/playlists";
import { useUserStore } from "@/store/user";
import { reactive } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";

const show = defineModel<boolean>("show", { required: true });

const props = withDefaults(
  defineProps<{
    playlist?: {
      id: string | null;
      name: string;
      description: string;
      public: boolean;
    };
  }>(),
  {
    playlist: () => ({
      id: null,
      name: "",
      description: "",
      public: false,
    }),
  }
);

const rules = [(value: string) => (value !== "" ? true : "required")];

const form = reactive({
  name: props.playlist.name,
  description: props.playlist.description,
  public: props.playlist.public,
});

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
                プレイリスト作成
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
        </v-card-text>
        <v-card-actions>
          <v-btn text="キャンセル" @click="show = false" />
          <v-btn :text="props.playlist.id === null ? '作成' : '更新'" type="submit" />
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>
