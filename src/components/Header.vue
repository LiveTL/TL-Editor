<template>
  <v-app-bar dense app top class="top-bar" color="primary">
    <v-app-bar-nav-icon class="ml-2"/>
    <div class="navbar-text"><span>LiveTL Community Captions</span></div>
    <load-video-input v-if="this.$route.name !== 'Home'"/>
    <v-spacer/>
    <div id="auth-area" class="hidden-sm-and-down mr-2">
      <div class="navbar-text text-black" v-if="user" style="display: inline"><span v-text="user.name"/></div>
      <v-btn
        class="login"
        elevation="2"
        @click="accountAction"
      >
        <span v-if="authenticationState === undefined">Loading...</span>
        <span v-else-if="!authenticationState">Login</span>
        <span v-else>Logout</span>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import createAuth0Client from '@auth0/auth0-spa-js';
import LoadVideoInput from '@/components/LoadVideoInput';
import { getRootUrl } from '@/js/utils';
import { getTranslator } from '@livetl/api-wrapper';

export default {
  name: 'Header',
  components: { LoadVideoInput },
  computed: {
    auth0: {
      set(val) { this.$store.commit('setAuth', val); },
      get() { return this.$store.state.auth0; }
    },
    authenticationState: {
      set(val) { this.$store.commit('setAuthenticationState', val); },
      get() { return this.$store.state.authenticationState; }
    },
    user: {
      async set(val) {
        this.$store.commit('setUser', val);

        const translator = await getTranslator(val.sub);
        if (typeof (translator) === 'object') {
          this.$store.commit('setTranslator', translator);
        }
      },
      get() { return this.$store.state.user; }
    }
  },

  async mounted() {
    this.auth0 = await createAuth0Client({
      domain: 'livetl.us.auth0.com',
      client_id: 'XvrpEjsWneQ8Q5Sb3SXzbFr0trUJPbWr',
      redirect_uri: getRootUrl()
    });
    if (
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      await this.auth0.handleRedirectCallback();
    }
    this.user = await this.auth0.getUser();
    const state = await this.auth0.isAuthenticated();
    this.authenticationState = state;
    if (state) {
      window.history.pushState({}, '', window.location.href.split('?')[0]);
    }
  },
  methods: {
    async login() {
      await this.auth0.loginWithRedirect({
        redirect_uri: getRootUrl()
      });
    },
    async logout() {
      await this.auth0.logout({
        returnTo: getRootUrl()
      });
    },
    accountAction() {
      if (this.authenticationState !== undefined) {
        if (this.authenticationState) this.logout();
        else this.login();
      }
    }
  }
};
</script>

<style scoped>
.navbar-text {
  height: 48px;
  padding: 15px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}
</style>
