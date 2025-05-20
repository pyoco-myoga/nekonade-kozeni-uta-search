<script lang="ts" setup>
import type { SearchQuery } from "./SearchQuery";
import { ref } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";

const searchQuery = defineModel<SearchQuery>("searchQuery", { required: true });
const props = defineProps<{
  isLoggedIn: boolean;
}>();
const showSearchOptions = ref(false);

const theme = useTheme();
</script>

<template>
  <v-container>
    <v-row class="ma-2">
      <v-text-field
        append-inner-icon="mdi-close"
        density="compact"
        label="曲名 / アーティスト名"
        :model-value="searchQuery.query"
        prepend-inner-icon="mdi-magnify"
        single-line
        variant="solo"
        @click:append-inner="searchQuery.query = ''"
        @update:model-value="(updated) => (searchQuery.query = updated)"
        hide-details
      >
        <template #append>
          <v-icon
            :color="
              showSearchOptions
                ? theme.global.current.value.colors.secondary
                : theme.global.current.value.colors['on-background']
            "
            icon="mdi-filter-plus"
            @click="showSearchOptions = !showSearchOptions"
          />
        </template>
      </v-text-field>
    </v-row>

    <v-expand-transition>
      <v-card v-show="showSearchOptions">
        <v-row>
          <v-col cols="12" lg="auto" md="auto" sm="auto" xl="auto">
            <v-btn-group background-color="primary" class="elevation-1" dark multiple>
              <template v-if="props.isLoggedIn">
                <v-btn
                  :color="
                    searchQuery.options.favoriteOnly
                      ? theme.global.current.value.colors.secondary
                      : theme.global.current.value.colors.surface
                  "
                  @click="searchQuery.options.favoriteOnly = !searchQuery.options.favoriteOnly"
                >
                  お気に入りのみ
                </v-btn>
              </template>
              <v-btn
                :color="
                  searchQuery.options.recommendedOnly
                    ? theme.global.current.value.colors.secondary
                    : theme.global.current.value.colors.surface
                "
                @click="searchQuery.options.recommendedOnly = !searchQuery.options.recommendedOnly"
              >
                おすすめのみ
              </v-btn>
              <v-btn
                :color="
                  searchQuery.options.fullOnly
                    ? theme.global.current.value.colors.secondary
                    : theme.global.current.value.colors.surface
                "
                @click="searchQuery.options.fullOnly = !searchQuery.options.fullOnly"
              >
                フルのみ
              </v-btn>
            </v-btn-group>
          </v-col>
          <v-col cols="12" lg="auto" md="auto" sm="auto" xl="auto">
            <v-btn-group background-color="primary" class="elevation-1" dark multiple>
              <v-btn
                :color="
                  searchQuery.options.accompaniment === 'KARAOKE_ONLY'
                    ? theme.global.current.value.colors.secondary
                    : theme.global.current.value.colors.surface
                "
                @click="
                  searchQuery.options.accompaniment =
                    searchQuery.options.accompaniment === 'KARAOKE_ONLY' ? null : 'KARAOKE_ONLY'
                "
              >
                カラオケのみ
              </v-btn>
              <v-btn
                :color="
                  searchQuery.options.accompaniment === 'GUITAR_ONLY'
                    ? theme.global.current.value.colors.secondary
                    : theme.global.current.value.colors.surface
                "
                @click="
                  searchQuery.options.accompaniment =
                    searchQuery.options.accompaniment === 'GUITAR_ONLY' ? null : 'GUITAR_ONLY'
                "
              >
                弾き語りのみ
              </v-btn>
            </v-btn-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="searchQuery.options.youtubeUrlOrVideoId"
              append-inner-icon="mdi-close"
              density="compact"
              hide-details
              label="YouTube URL / Video ID"
              prepend-inner-icon="mdi-youtube"
              single-line
              variant="solo"
              @click:append-inner="searchQuery.options.youtubeUrlOrVideoId = null"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>
  </v-container>
</template>
