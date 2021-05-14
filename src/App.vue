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
      <MainUI :videoID="videoID" @ytPlayer="p => player = p"/>
    </v-main>

    <div v-for="tl in tls" :key="tl.id" class="tlmarker" :style="{
      left: `calc(${(tl.startTimeOffset / player.getDuration())} * (100% - 20px) + 10px - var(--width) / 2)`
    }" @click="setNewTime(tl.startTimeOffset); timeChanged();">
    </div>
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
    timestamp: [0, 0, 0],
    videoID: 'lZs9DLVt7Uw',
    tls: []
  }),
  async mounted() {
    window.addEventListener('message', packet => {
      try {
        const data = JSON.parse(packet.data);
        if (data.event === 'infoDelivery') {
          this.setNewTime(data.info.currentTime);
        }
      } catch (e) {}
    });
    this.tls = await (await fetch(`https://api.livetl.app/translations/${this.videoID}/en`)).json();
    console.log(this.tls);
  },
  methods: {
    validTimestamp(val) {
      return val >= 0 && val <= 60;
    },
    timeChanged() {
      this.timestamp = this.timestamp.map(i => parseInt(i));
      this.player.seekTo(((this.timestamp[0] * 60) + this.timestamp[1]) * 60 + this.timestamp[2]);
    },
    togglePlay() {
      if (this.player.getPlayerState() === 1) this.player.pauseVideo();
      else this.player.playVideo();
    },
    setNewTime(time) {
      this.timestamp = new Date(
        parseFloat(time) * 1000
      ).toISOString().substr(11, 8).split(':').map(i => parseInt(i));
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
  margin-top: 37.5px !important;
}
.v-btn {
  transform: translateY(10px);
}
.v-input {
  width: 5em !important;
}
.wrapper {
  width: auto;
  color: white;
  text-align: right;
  font-size: 2rem;
  display: flex;
  position: absolute;
  right: 10px;
}
.v-app-bar {
  overflow-y: hidden;
}
.v-toolbar__content {
  position: absolute;
  right: 0;
}
.tlmarker {
  background-color: yellow;
  height: 25px;
  position: fixed;
  bottom: 30px;
  --width: 5px;
  width: var(--width);
  transition: 0.1s;
  cursor: pointer;
  border: 1px solid black;
}
.tlmarker:hover {
  --width: 10px;
  background-color: orange;
  z-index: 5;
}
</style>
