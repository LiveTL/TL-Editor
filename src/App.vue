<template>
  <v-app dark>
    <v-app-bar
      app
      color="primary"
    >
      <div class="wrapper">
        <v-text-field
          label="Hour"
          filled dark
          :rules="[validTimestamp]"
          v-model="timestamp[0]"
          @change="timeChanged()"
          @focus="player.pauseVideo()"
        ></v-text-field>
        <v-text-field
          label="Minute"
          filled dark
          :rules="[validTimestamp]"
          v-model="timestamp[1]"
          @change="timeChanged()"
          @focus="player.pauseVideo()"
        ></v-text-field>
        <v-text-field
          label="Second"
          filled dark
          :rules="[validTimestamp]"
          v-model="timestamp[2]"
          @change="timeChanged()"
          @focus="player.pauseVideo()"
        ></v-text-field>
        <v-btn
          class="mx-2"
          fab
          dark
          small
          color="cyan"
          @click="togglePlay()"
        >
          <v-icon dark v-if="player && player.getPlayerState() == 1">
            mdi-pause
          </v-icon>
          <v-icon dark v-else>
            mdi-play
          </v-icon>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <MainUI videoID="1aQChs0biE8" @ytPlayer="p => player = p"/>
    </v-main>
  </v-app>
</template>

<script>
import MainUI from './components/MainUI';

export default {
  name: 'App',
  components: {
    MainUI
  },
  data: () => ({
    player: null,
    timestamp: [0, 0, 0]
  }),
  mounted() {
    window.addEventListener('message', packet => {
      const data = JSON.parse(packet.data);
      if (data.event === 'infoDelivery') {
        this.timestamp = new Date(
          parseFloat(data.info.currentTime) * 1000
        ).toISOString().substr(11, 8).split(':').map(i => parseInt(i));
      }
    });
  },
  methods: {
    validTimestamp(val) {
      return val >= 0 && val <= 60;
    },
    timeChanged() {
      this.player.seekTo(((this.timestamp[0] * 60) + this.timestamp[1]) * 60 + this.timestamp[2]);
    },
    togglePlay() {
      if (this.player.getPlayerState() === 1) this.player.pauseVideo();
      else this.player.playVideo();
    }
  }
};
</script>

<style>
html {
  overflow-y: hidden !important;
}
.v-main__wrap>div {
  height: 100%;
}
.v-input, .v-btn {
  margin: 10px !important;
  margin-top: 35px !important
}
.v-btn {
  transform: translateY(10px);
}
.wrapper {
  width: 100%;
  color: white;
  text-align: right;
  font-size: 2rem;
  display: flex;
}
.v-app-bar {
  overflow-y: hidden;
}
</style>
