<template>
  <v-app dark>
    <v-app-bar
      app
      bottom
      dense
      color="primary"
    >
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
        <div />
      </div>
    </v-app-bar>

    <v-main style="max-height: 100%;">
      <div class="horizontalsplit">
        <div :style="`height: 100%; width: calc(100% * (1 - ${videoWidth})); flex-direction: column; display: flex; overflow: auto;`">
          <v-list dark>
            <v-list-item v-if="!tls.length" class="tlentry">
              <v-list-item-content>
                No caption entries to display
              </v-list-item-content>
            </v-list-item>
            <div v-for="tl in sortedTLs" class="tlentry splash" :key="tl ? tl.id : ''">
              <v-list-item :id="`tl${tl.index}`">
                <v-list-item-content>
                  <v-textarea
                    dark
                    filled
                    name="input-7-4"
                    label="Caption text"
                    :value="tl.translatedText"
                    v-model="tl.translatedText"
                    @focus="editTL(tl)"
                    focused
                  ></v-textarea>
                </v-list-item-content>
                <v-list-item-action style="display: flex; align-items: center; justify-content: flex-end;">
                  <v-text-field
                    label="Hour"
                    class="tltimeindicator"
                    filled dark
                    :rules="[validTimestamp]"
                    v-model="tl.timestamp[0]"
                    @change="tlTimeChanged(tl)"
                    outlined
                  ></v-text-field>
                  <v-text-field
                    label="Minute"
                    class="tltimeindicator"
                    filled dark
                    :rules="[validTimestamp]"
                    v-model="tl.timestamp[1]"
                    @change="tlTimeChanged(tl)"
                    outlined
                  ></v-text-field>
                  <v-text-field
                    label="Second"
                    class="tltimeindicator"
                    filled dark
                    :rules="[validTimestamp]"
                    v-model="tl.timestamp[2]"
                    @change="tlTimeChanged(tl)"
                    outlined
                  ></v-text-field>
                  <div style="margin-top: 15px;">
                    <v-btn icon :disabled="(tl.originalText == tl.translatedText) || tl.saving" @click="stopEditing(tl)">
                      <v-icon v-if="!tl.saving" :color="`${((tl.originalText != tl.translatedText) ? 'green' : '')} lighten-1`">mdi-check</v-icon>
                      <v-progress-circular
                        indeterminate
                        color="white"
                        v-else
                      ></v-progress-circular>
                    </v-btn>
                    <v-btn icon @click="removeTL(tl)">
                      <v-icon color="red lighten-1">mdi-close</v-icon>
                    </v-btn>
                  </div>
                </v-list-item-action>
              </v-list-item>
            </div>
          </v-list>
        </div>
        <div :style="`height: 100%; width: calc(100% * ${videoWidth})`">
          <Video :videoID="videoID" @ytPlayer="initPlayer"/>
        </div>
      </div>
    </v-main>

    <div style="position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1;"
      v-if="repositioning" />

    <div v-for="tl in tls" :key="tl.id">
      <div class="tlmarker" :style="{
        left: calcLeft(tl),
        }" @click="editTL(tl);" @mouseover="statusMessage = `Click to edit, drag to reposition (ID: ${tl.id})`" @mouseleave="statusMessage = null"
        @mousedown="event => dragStarted(event, tl)"></div>
    </div>

  </v-app>
</template>

<script>
import Video from './Video.vue';

export default {
  name: 'MainUI',
  components: {
    Video
  },
  data: () => ({
    player: null,
    timestamp: [0, 0, 0],
    videoID: 'Z-a58aBXH58',
    tls: [],
    saving: false,
    statusMessage: null,
    repositioning: false,
    duration: 1,
    videoWidth: 0.5,
    currentTime: 0
  }),
  computed: {
    sortedTLs() {
      return [...this.tls].sort((a, b) => {
        return (a.startTimeOffset !== b.startTimeOffset ? a.startTimeOffset - b.startTimeOffset : a.index - b.index);
      });
    }
  },
  watch: {
    repositioning() {
      document.body.style.setProperty('cursor', this.repositioning ? 'grabbing' : 'default', 'important');
    }
  },
  created() {
    this.videoID = this.$route.params.videoID || this.videoID;
  },
  async mounted() {
    window.addEventListener('message', packet => {
      try {
        const data = JSON.parse(packet.data);
        if (data.event === 'infoDelivery') {
          try {
            const left = this.binarySearch(this.currentTime);
            const right = this.binarySearch(data.info.currentTime);
            for (let i = left; i < right; i++) {
              const e = document.querySelector(`#tl${this.sortedTLs[i].index}`);
              this.splash(e);
            }
          } catch (e) {
            console.log(e);
          }
          this.currentTime = data.info.currentTime;
          this.timestamp = this.setNewTime(data.info.currentTime);
        }
      } catch (e) {
        console.log(e);
      }
    });
    try {
      this.tls = await (await fetch(`https://api.livetl.app/translations/${this.videoID}/en`)).json();
      for (let i = 0; i < this.tls.length; i++) {
        this.tls[i].index = i;
        this.tls[i].timestamp = this.setNewTime(this.tls[i].startTimeOffset);
        this.tls[i].saving = false;
        this.tls[i].originalText = this.tls[i].translatedText;
      }
      console.log(this.tls, this.videoID);
    } catch (e) {}
  },
  methods: {
    binarySearch(time) {
      let left = 0;
      let right = this.sortedTLs.length;
      while (left < right) {
        const index = Math.floor((left + right) / 2);
        if (time <= this.sortedTLs[index].startTimeOffset) {
          right = index;
        } else {
          left = index + 1;
        }
      }
      if (left < this.sortedTLs.length && this.sortedTLs[left] < time) left++;
      return left;
    },
    validTimestamp(val) {
      return val >= 0 && val <= 60;
    },
    timeChanged() {
      this.timestamp = this.timestamp.map(i => parseInt(i));
      if (this.timestamp[1] <= 60 && this.timestamp[2] <= 60) {
        this.player.seekTo(((this.timestamp[0] * 60) + this.timestamp[1]) * 60 + this.timestamp[2]);
      }
    },
    tlTimeChanged(tl) {
      tl.timestamp = tl.timestamp.map(i => parseInt(i));
      if (tl.timestamp[1] <= 60 && tl.timestamp[2] <= 60) {
        tl.startTimeOffset = ((tl.timestamp[0] * 60) + tl.timestamp[1]) * 60 + tl.timestamp[2];
      }
    },
    togglePlay() {
      if (this.player && this.player.getPlayerState && this.player.getPlayerState() === 1) this.player.pauseVideo();
      else this.player.playVideo();
    },
    setNewTime(time) {
      return new Date(
        parseFloat(time) * 1000
      ).toISOString().substr(11, 8).split(':').map(i => parseInt(i));
    },
    async editTL(tl) {
      this.timestamp = this.setNewTime(tl.startTimeOffset);
      this.timeChanged();
      this.player.pauseVideo();
      await this.$nextTick();
      this.scrollIntoView(tl);
    },
    scrollIntoView(tl) {
      const e = document.querySelector(`#tl${tl.index}`);
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      this.splash(e);
    },
    splash(e) {
      e.parentElement.classList.remove('splash');
      // eslint-disable-next-line no-unused-expressions
      e.offsetHeight;
      e.parentElement.classList.add('splash');
    },
    stopEditing(tl, save = true) {
      tl.originalText = tl.translatedText;
      if (save) {
        tl.saving = true;
        if (!this.removeIfEmpty(tl)) {
          setTimeout(() => {
            tl.saving = false;
            this.$forceUpdate();
          }, 1000);
        }
        // SIMULATION OF API PUSH DELAY
      } else {
        this.removeIfEmpty(tl);
        this.$forceUpdate();
      }
    },
    removeIfEmpty(tl) {
      if (!tl.translatedText) {
        this.removeTL(tl);
        return true;
      }
    },
    removeTL(tl) {
      this.tls.splice(tl.index, 1);
      for (let i = tl.index; i < this.tls.length; i++) {
        this.tls[i].index = i;
      }
    },
    async addTL() {
      const currentTime = this.player.getCurrentTime();
      this.tls.push({
        translatedText: '',
        startTimeOffset: currentTime,
        index: this.tls.length,
        timestamp: this.setNewTime(currentTime),
        saving: false,
        originalText: ''
      });
      this.editTL(this.tls[this.tls.length - 1]);
    },
    dragStarted(event, tl) {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      event.cancelBubble = true;
      event.returnValue = false;
      this.repositioning = true;
      const repositionElement = (event) => {
        const time = this.duration *
          (event.clientX - 10 - window.innerWidth * this.videoWidth) / (window.innerWidth * this.videoWidth - 20);
        tl.startTimeOffset = Math.max(Math.min(this.duration, time), 0);
        tl.timestamp = this.setNewTime(tl.startTimeOffset);
        this.player.seekTo(time);
      };
      window.addEventListener('mousemove', repositionElement);
      const mouseup = window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', repositionElement);
        window.removeEventListener('mouseup', mouseup);
        this.repositioning = false;
      });
    },
    calcLeft(tl) {
      return `calc(${(tl.startTimeOffset / this.duration)} * (50% - 20px) + 10px - var(--width) / 2 + 50%)`;
    },
    async initPlayer(p) {
      this.player = p;
      const interval = setInterval(() => {
        if (p.getDuration) {
          this.duration = p.getDuration();
          clearInterval(interval);
        }
      }, 10);
    }
  }
};
</script>

<style>
.horizontalsplit {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  background-color: #181818;
}
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
  grid-template-columns: 1fr repeat(1, auto) 1fr;
  grid-auto-flow: row;
  display: grid;
  justify-content: center;
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
  transition: left 0s;
  cursor: grab;
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
.tlentry {
  margin: 10px 5px 10px 5px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}
.tlentry:last-child {
  margin-bottom: 0px !important;
}
.tlentry:first-child {
  margin-top: 0px !important;
}
.tltimeindicator {
  max-height: 50px;
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #888;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
* {
  scrollbar-width: thin;
}
@keyframes splash {
  from {
    background-color: rgba(0, 119, 255, 0.466);
  }
  to {}
}
.splash {
  animation: splash 1s normal forwards ease-in-out;
}
</style>
