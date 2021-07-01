<template>
  <div id="wrapper">
    <div id="player" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import YouTubeIframeLoader from 'youtube-iframe';
export default {
  name: 'Video',
  computed: mapState(['player', 'videoID']),
  watch: {
    videoID() {
      this.player.loadVideoById(this.videoID);
    }
  },
  mounted() {
    YouTubeIframeLoader.load(YT => {
      this.$store.commit('setPlayer', new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: this.videoID,
        autoplay: 1,
        playerVars: {
          autoplay: 1
        }
      }));
    });
  },
  methods: { },
  props: {
  }
};
</script>

<style scoped>
  #wrapper {
    width: 100%;
    height: 100%;
  }
</style>
