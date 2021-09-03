<template>
  <div :class="stretch ? 'stretch-container' : 'responsive-container'">
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
      if (this.player) {
        this.player.loadVideoById(this.videoID);
      }
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
          autoplay: 1,
          playsinline: 1
        }
      }));
    });
  },
  methods: { },
  props: {
    stretch: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
  .stretch-container {
    width: 100%;
    height: 100%;
  }

  /* from https://embedresponsively.com/ */
  .responsive-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    max-width: 100%;
  }
  .responsive-container >>> iframe, .responsive-container >>> object, .responsive-container >>> embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

</style>
