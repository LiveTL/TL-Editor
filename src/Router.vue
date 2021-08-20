<template>
  <v-app dark>
    <Header/>

    <v-main style="height: 100vh">
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import Header from '@/components/Header';

export default {
  components: { Header }
};
</script>
