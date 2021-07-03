<template>
  <v-app>
    <v-app-bar dense app top class="top-bar" color="primary">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <div class="navbar-text"><span>LiveTL Community Captions Browser</span></div>
      <v-spacer></v-spacer>
      <div class="navbar-text text-black" v-if="user"><span>{{ user.name }}</span></div>
      <v-btn
        class="login"
        elevation="2"
        @click="accountAction"
      >
        <span v-if="authenticationState == undefined">Loading...</span>
        <span v-else-if="!authenticationState">Login</span>
        <span v-else>Logout</span>
      </v-btn>
    </v-app-bar>
    <v-main style="max-height: 100%;">
    </v-main>
  </v-app>
</template>
<script>
// import { mapState } from 'vuex';
import createAuth0Client from '@auth0/auth0-spa-js';
export default {
  name: 'Video',
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
      set(val) { this.$store.commit('setUser', val); },
      get() { return this.$store.state.user; }
    }
  },
  watch: {
  },
  data: () => ({
  }),
  async mounted() {
    this.$vuetify.theme.dark = true;
    this.auth0 = await createAuth0Client({
      domain: 'livetl.us.auth0.com',
      client_id: 'XvrpEjsWneQ8Q5Sb3SXzbFr0trUJPbWr',
      redirect_uri: window.location.href
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
        redirect_uri: window.location.href
      });
    },
    async logout() {
      await this.auth0.logout({
        returnTo: window.location.href
      });
    },
    accountAction() {
      if (this.authenticationState !== undefined) {
        if (this.authenticationState) this.logout();
        else this.login();
      }
    }
  },
  props: {
  }
};
</script>
<style>
.navbar-text {
  height: 48px;
  padding: 15px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}
.top-bar {
}
.v-application p {
  margin-bottom: 0px;
}
.login {
  margin-right: 5px !important;
}
.v-app-bar__nav-icon {
  margin-left: 5px !important;
}
</style>
