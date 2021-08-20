<template>
  <v-app-bar dense app top class="top-bar" color="primary">
    <v-app-bar-nav-icon class="ml-2"/>
    <div class="navbar-text"><span>LiveTL Captions</span></div>
    <load-video-input v-if="this.$route.name !== 'Home'" class="hidden-sm-and-down"/>

    <v-spacer/>

    <v-progress-circular v-if="this.$auth.isLoading" indeterminate color="red"/>
    <div v-else id="auth-area" class="hidden-sm-and-down mr-2">
      <div v-if="this.$auth.user" id="translator-name" class="navbar-text text-black hidden-md-and-down">
        <span v-text="this.$auth.user.nickname"/>
      </div>
      <v-btn class="login" elevation="2" @click.prevent="accountAction">
        <span v-if="!this.$auth.isAuthenticated">Login</span>
        <span v-else>Logout</span>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import LoadVideoInput from '@/components/LoadVideoInput';

export default {
  name: 'Header',
  components: { LoadVideoInput },
  methods: {
    async login() {
      await this.$auth.loginWithRedirect();
    },
    async logout() {
      await this.$auth.logout();
    },
    accountAction() {
      if (this.$auth.isAuthenticated) {
        this.logout();
      } else {
        this.login();
      }
    }
  }
};
</script>

<style scoped>
#translator-name {
  display: inline;
}

.navbar-text {
  height: 48px;
  padding: 15px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
}
</style>
