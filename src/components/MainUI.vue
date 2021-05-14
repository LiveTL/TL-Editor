<template>
  <div>
    <div id="player" />
  </div>
</template>

<script>
import YouTubeIframeLoader from 'youtube-iframe';
export default {
  name: 'MainUI',

  data: () => ({
    player: null
  }),
  mounted() {
    YouTubeIframeLoader.load(YT => {
      this.$emit('ytPlayer', new YT.Player('player', {
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
  props: {
    videoID: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
</style>
