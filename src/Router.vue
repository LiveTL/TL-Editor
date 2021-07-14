<template>
  <v-app dark>
    <Header />

    <v-main>
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
