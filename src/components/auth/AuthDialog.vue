<script lang="ts" setup>
import { supabase } from "@/common";
import { useUserStore } from "@/store/user";
import { match } from "ts-pattern";
import { computed, ref } from "vue";

type Provider = "google" | "twitter" | "github";
function providerLabel(p: Provider): string {
  return match(p)
    .with("google", () => "Google")
    .with("twitter", () => "Twitter")
    .with("github", () => "Github")
    .exhaustive();
}
function providerIcon(p: Provider): string {
  return match(p)
    .with("google", () => "mdi-google")
    .with("twitter", () => "mdi-twitter")
    .with("github", () => "mdi-github")
    .exhaustive();
}

const showDialog = ref(false);

const store = useUserStore();

async function loginWith(provider: Provider) {
  showDialog.value = true;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (data.url !== null) {
    window.location.href = data.url;
  }

  if (error !== null) {
    console.error(`Failed to login with ${provider}: `, error.message);
  }
}

const props = defineProps<{
  providers: Array<Provider>;
  loginText: string;
  logoutText: string;
  textColor: string;
}>();

const userAvatar = computed(() => {
  return store.user?.user_metadata?.avatar_url;
});
</script>

<template>
  <v-menu v-if="store.isLoggedIn()">
    <template #activator="activator">
      <v-btn class="ma-3" icon v-bind="activator.props">
        <v-avatar>
          <img :src="userAvatar" />
        </v-avatar>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click.stop="store.logout()">
        {{ logoutText }}
      </v-list-item>
    </v-list>
  </v-menu>
  <v-dialog v-else v-model="showDialog" width="50%">
    <template #activator="activator">
      <v-btn
        class="text-h6"
        :color="textColor"
        style="text-transform: none; font-family: Cal Sans"
        v-bind="activator.props"
      >
        {{ loginText }}
      </v-btn>
    </template>

    <v-card>
      <v-list>
        <v-list-item
          v-for="provider in props.providers"
          :key="provider"
          @click="loginWith(provider)"
        >
          <template #prepend>
            <v-avatar>
              <v-icon>{{ providerIcon(provider) }}</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title>
            {{ providerLabel(provider) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn text @click="showDialog = false"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
