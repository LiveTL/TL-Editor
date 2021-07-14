<template>
  <v-app-bar
    app
    bottom
    dense
    color="primary">
    <div class="wrapper">
      <div style="margin-right: auto;">
        <v-btn style="float: left; position: relative; margin: 20px; width: min-content;"
               @click="$emit('addTL')">
          <v-icon>
            mdi-plus
          </v-icon>
          New Caption
        </v-btn>
      </div>
      <div>
        <v-text-field
          label="Hour" class="timecode-input"
          filled outlined hide-details dense
          :rules="[isValidTimestamp]"
          v-model="timestamp[0]"
          @change="currentTimeChanged()"
          @focus="player.pauseVideo()"/>

        <v-text-field
          label="Minute" class="timecode-input"
          filled outlined hide-details dense
          :rules="[isValidTimestamp]"
          v-model="timestamp[1]"
          @change="currentTimeChanged()"
          @focus="player.pauseVideo()"/>

        <v-text-field
          label="Second" class="timecode-input"
          filled outlined hide-details dense
          :rules="[isValidTimestamp]"
          v-model="timestamp[2]"
          @change="currentTimeChanged()"
          @focus="player.pauseVideo()"/>
        <v-btn
          class="mx-2"
          id="play"
          fab
          small
          color="cyan"
          @click="togglePlay()"
        >
          <v-icon v-if="getPlayerState() === 1">
            mdi-pause
          </v-icon>
          <v-icon v-else>
            mdi-play
          </v-icon>
        </v-btn>
      </div>
      <div/>
    </div>
  </v-app-bar>
</template>

<script>
import { mapState } from 'vuex';
import utils from '../js/utils.js';

export default {
  name: 'BottomBar',
  computed: {
    ...mapState(['player', 'timestamp']),
    videoID: {
      set(val) { this.$store.commit('setVideoID', val); },
      get() { return this.$store.state.videoID; }
    },
    timestamp: {
      set(val) { this.$store.commit('setTimestamp', val); },
      get() { return this.$store.getters.timestamp; }
    }
  },
  watch: {},
  mounted() {
  },
  methods: {
    ...utils,
    getPlayerState() {
      if (!this.$store.state.player || !this.$store.state.player.getPlayerState) return -1;
      return this.$store.state.player.getPlayerState();
    },
    currentTimeChanged() {
      // eslint-disable-next-line no-self-assign
      this.timestamp = this.timestamp;
    },
    togglePlay() {
      if (this.$store.state.player.getPlayerState() === 1) {
        this.player.pauseVideo();
      } else this.player.playVideo();
    }
  }
};
</script>

<style scoped>
.timecode-input {
  width: 5em !important;
}
</style>
