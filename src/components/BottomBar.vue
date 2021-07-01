<template>
  <v-app-bar
    app
    bottom
    dense
    color="primary">
    <div class="wrapper">
    <div style="margin-right: auto;">
      <v-btn style="float: left; position: relative; margin: 20px; width: min-content;"
      @click="addTL()">
      <v-icon>
        mdi-plus
      </v-icon>
      New Caption
      </v-btn>
    </div>
    <div>
      <v-text-field
      label="Video"
      filled dark
      v-model="videoID"
      style="width: 8em !important;"
      outlined
      ></v-text-field>
      <v-text-field
      label="Hour"
      filled dark
      :rules="[isValidTimestamp]"
      v-model="timestamp[0]"
      @change="currentTimeChanged()"
      @focus="player.pauseVideo()"
      outlined
      ></v-text-field>
      <v-text-field
      label="Minute"
      filled dark
      :rules="[isValidTimestamp]"
      v-model="timestamp[1]"
      @change="currentTimeChanged()"
      @focus="player.pauseVideo()"
      outlined
      ></v-text-field>
      <v-text-field
      label="Second"
      filled dark
      :rules="[isValidTimestamp]"
      v-model="timestamp[2]"
      @change="currentTimeChanged()"
      @focus="player.pauseVideo()"
      outlined
      ></v-text-field>
      <v-btn
      class="mx-2"
      id="play"
      fab
      dark
      small
      color="cyan"
      @click="togglePlay()"
      >
      <v-icon dark v-if="getPlayerState() == 1">
        mdi-pause
      </v-icon>
      <v-icon dark v-else>
        mdi-play
      </v-icon>
      </v-btn>
    </div>
    <div />
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
    }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    ...utils,
    getPlayerState() {
      return this.$store.playerState;
    }
  }
};
</script>
