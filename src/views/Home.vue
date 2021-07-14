<template>
  <div id="home">
    <v-container>
      <h1 class="text-center">Welcome to the LiveTL Community Captions Editor!</h1>
      <h3 class="text-center">Enter a YouTube video link, or ID to start translating:</h3>

      <v-row justify="center">
        <v-col md="6">
          <load-video-input/>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import LoadVideoInput from '@/components/LoadVideoInput';

export default {
  name: 'Home',
  components: { LoadVideoInput }
};
</script>
