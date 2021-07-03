<template>
  <v-btn @click="login">Login</v-btn>
</template>
<script>
import createAuth0Client from '@auth0/auth0-spa-js';
export default {
  name: 'Video',
  computed: {},
  watch: {
  },
  data: () => ({
    auth0: null
  }),
  async mounted() {
    this.auth0 = await createAuth0Client({
      domain: 'livetl.us.auth0.com',
      client_id: 'XvrpEjsWneQ8Q5Sb3SXzbFr0trUJPbWr'
    });
  },
  methods: {
    async login() {
      await this.auth0.loginWithRedirect({
        redirect_uri: window.location.href
      });
    }
  },
  props: {
  }
};
</script>
