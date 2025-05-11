/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import App from './App.vue';

import { createApp } from 'vue';
import { initializeApp } from 'firebase/app';
import { registerPlugins } from '@/plugins/index';
import { supabase } from './common';
import { useUserStore } from './store/user';

initializeApp({
  apiKey: 'AIzaSyA04pNlYd7gm5jflHKaKgKyfJ4vHDWvV3s',
  authDomain: 'nekonade-kozeni-uta-search.firebaseapp.com',
  projectId: 'nekonade-kozeni-uta-search',
  storageBucket: 'nekonade-kozeni-uta-search.appspot.com',
  messagingSenderId: '949940911312',
  appId: '1:557447215614:web:3996ea78bcd27f5c77e8af',
});

supabase.auth.onAuthStateChange((event, session) => {
  const userStore = useUserStore();
  if (session !== null) {
    if (session.provider_token) {
      window.localStorage.setItem('oauth_provider_token', session.provider_token);
    }
    if (session.provider_refresh_token) {
      window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token);
    }
    userStore.login(session.user);
  }
  if (event === 'SIGNED_OUT') {
    window.localStorage.removeItem('oauth_provider_token');
    window.localStorage.removeItem('oauth_provider_refresh_token');
  }
});

const app = createApp(App);

registerPlugins(app);

app.mount('#app');
