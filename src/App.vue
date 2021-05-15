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

    <div v-for="tl in tls" :key="tl.id">
      <div class="tlmarker" :style="{
        left: `calc(${(tl.startTimeOffset / player.getDuration())} * (100% - 20px) + 10px - var(--width) / 2)`
      }" @click="editTL(tl);"></div>
      <transition name="fade">
        <div class="editableWrapper" v-if="tl.editing">
          <div contenteditable id="editableElement" @blur="() => {if (tl.editing) editTL(tl)}">{{tl.translatedText}}</div>
          <div style="font-size: 1rem;">Press Enter to save edits</div>
          <div style="font-size: 1rem;">Press Esc to discard edits</div>
          <v-progress-circular
            v-if="saving"
            style="margin-top: 25px;"
            :size="50"
            color="white"
            indeterminate
          ></v-progress-circular>
        </div>
      </transition>
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
    tls: [],
    saving: false
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
    },
    async editTL(tl) {
      this.setNewTime(tl.startTimeOffset);
      this.timeChanged();
      this.player.pauseVideo();
      tl.editing = true;
      await this.$nextTick();
      const elem = document.querySelector('#editableElement');
      elem.focus();
      elem.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          this.stopEditing(tl);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          this.stopEditing(tl, false);
        }
      });
      await this.$forceUpdate();
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(elem.childNodes[0], elem.innerText.length);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    },
    stopEditing(tl, save = true) {
      if (save) {
        tl.translatedText = document.querySelector('#editableElement').innerText;
        this.saving = true;
        setTimeout(() => {
          tl.editing = false;
          this.saving = false;
          this.$forceUpdate();
        }, 1000);
        // SIMULATION OF API PUSH DELAY
      } else {
        tl.editing = false;
        this.$forceUpdate();
      }
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
  background-color: gold;
  height: 25px;
  position: fixed;
  bottom: 30px;
  --width: 4px;
  width: var(--width);
  transition: 0.1s;
  cursor: pointer;
  border-radius: 2px;
}
.tlmarker:hover {
  --width: 10px;
  background-color: orange;
  z-index: 5;
}
.editableWrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 3rem;
  flex-direction: column;
  color: white;
  text-align: center;
}
.editableWrapper * {
  display: flex;
}
#editableElement {
  padding: 10px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
