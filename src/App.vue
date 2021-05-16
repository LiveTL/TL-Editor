<template>
  <v-app dark>
    <v-app-bar
      app
      bottom
      dense
      color="primary"
    >
      <div class="wrapper">
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
            :rules="[validTimestamp]"
            v-model="timestamp[0]"
            @change="timeChanged()"
            @focus="player.pauseVideo()"
            outlined
          ></v-text-field>
          <v-text-field
            label="Minute"
            filled dark
            :rules="[validTimestamp]"
            v-model="timestamp[1]"
            @change="timeChanged()"
            @focus="player.pauseVideo()"
            outlined
          ></v-text-field>
          <v-text-field
            label="Second"
            filled dark
            :rules="[validTimestamp]"
            v-model="timestamp[2]"
            @change="timeChanged()"
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
            <v-icon dark v-if="player && player.getPlayerState && player.getPlayerState() == 1">
              mdi-pause
            </v-icon>
            <v-icon dark v-else>
              mdi-play
            </v-icon>
          </v-btn>
        </div>
        <div class="darkened">{{ statusMessage || `Displaying ${tls.length} caption entries` }}</div>
        <div class="right">
          <v-btn
            class="mx-2"
            id="plus"
            fab
            dark
            small
            color="pink"
            @click="addTL()"
          >
            <v-icon dark>
              mdi-plus
            </v-icon>
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <v-main>
      <MainUI :videoID="videoID" @ytPlayer="p => player = p"/>
    </v-main>

    <div v-for="tl in tls" :key="tl.id">
      <div class="tlmarker" :style="{
        left: `calc(${(tl.startTimeOffset / player.getDuration())} * (100% - 20px) + 10px - var(--width) / 2)`
        }" @click="editTL(tl);" @mouseover="statusMessage = `Click to edit caption (ID: ${tl.id})`" @mouseleave="statusMessage = null"></div>
      <div class="editableWrapper" v-if="tl.editing">
        <div :contenteditable="!saving" id="editableElement" @blur="() => {if (tl.editing && !saving) editTL(tl)}"></div>
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
    videoID: 'Z-a58aBXH58',
    tls: [],
    saving: false,
    statusMessage: null
  }),
  created() {
    this.videoID = this.$route.params.videoID || this.videoID;
  },
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
    for (let i = 0; i < this.tls.length; i++) this.tls[i].index = i;
    console.log(this.tls, this.videoID);
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
      if (this.player && this.player.getPlayerState && this.player.getPlayerState() === 1) this.player.pauseVideo();
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
      elem.textContent = tl.translatedText;
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
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(elem.childNodes[0], elem.innerText.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}
      this.statusMessage = `Editing caption (ID: ${tl.id})`;
    },
    stopEditing(tl, save = true) {
      if (save) {
        this.statusMessage = `Saving caption (ID: ${tl.id})`;
        tl.translatedText = document.querySelector('#editableElement').innerText.trim();
        this.saving = true;
        setTimeout(() => {
          tl.editing = false;
          this.saving = false;
          this.removeIfEmpty(tl);
          this.statusMessage = null;
          this.$forceUpdate();
        }, 1000);
        // SIMULATION OF API PUSH DELAY
      } else {
        tl.editing = false;
        this.statusMessage = null;
        this.removeIfEmpty(tl);
        this.$forceUpdate();
      }
    },
    removeIfEmpty(tl) {
      if (!tl.translatedText) this.tls.splice(tl.index, 1);
    },
    async addTL() {
      this.tls.push({
        translatedText: '',
        startTimeOffset: this.player.getCurrentTime(),
        index: this.tls.length
      });
      this.editTL(this.tls[this.tls.length - 1]);
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
}
#plus {
}
#play {
}
.v-input {
  width: 5em !important;
  transform: translateY(14px);
}
.v-text-field--filled:not(.v-text-field--single-line) input {
  margin-top: 8px !important;
}
.darkened {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 6px;
}
.wrapper {
  width: 100%;
  height: 100%;
  color: white;
  font-size: 2rem;
  grid-template-columns: fit-content(50px) auto fit-content(25px);
  grid-auto-flow: row;
  display: grid;
}
.wrapper>div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}
.v-input__slot {
  margin-bottom: 0px !important;
  min-height: 0px !important;
}
.right {
  right: 0px !important;
  justify-content: flex-end !important;
}
.left {
  left: 0px;
}
.v-app-bar {
}
.v-toolbar__content {
  padding: 0px 0px 0px 0px !important;
  position: absolute;
  width: 100%;
}
.tlmarker {
  background-color: gold;
  height: 25px;
  position: fixed;
  bottom: 77px;
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
</style>
