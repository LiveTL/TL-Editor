<template>
  <v-app dark>

    <!-- begin bottom app bar -->
    <BottomBar @addTL="addTL()" />
    <!-- end bottom app bar -->

    <v-main style="max-height: 100%;">
      <div class="horizontal-split">

        <!-- begin left tl panel -->
        <div :style="`width: calc(100% * (1 - ${videoWidth}));`" class="left-panel">
          <v-list dark>
            <v-list-item v-if="!tls.length" class="tl-entry">
              <v-list-item-content>
                No caption entries to display
              </v-list-item-content>
            </v-list-item>
            <div v-for="tl in sortedTLs" class="tl-entry splash" :key="tl ? tl.id : ''">
              <TL :tl="tl"
                @editTL="editTL"
                @tlTimeChanged="tlTimeChanged"
                @removeTL="removeTL"
                @stopEditing="stopEditing"/>
            </div>
          </v-list>
        </div>
        <!-- end left tl panel -->

        <!-- begin right video panel -->
        <div :style="`height: 100%; width: calc(100% * ${videoWidth})`">
          <Video />
        </div>
        <!-- end right video panel -->
      </div>
    </v-main>

    <!-- begin overlay to prevent mouse glitches -->
    <div class="overlay" v-if="repositioning" />
    <!-- end overlay -->

    <!-- begin yellow video time markers -->
    <div v-for="tl in tls" :key="tl.id">
      <div class="tl-marker" :style="{
        left: calcLeft(tl),
        }" @click="editTL(tl);"
        @mousedown="event => dragStarted(event, tl)"></div>
    </div>
    <!-- end video time markers -->
  </v-app>
</template>

<script>
import Video from './Video.vue';
import BottomBar from './BottomBar.vue';
import TL from './TL.vue';
import { mapState } from 'vuex';
import utils from '../js/utils.js';

export default {
  name: 'MainUI',
  components: {
    Video,
    BottomBar,
    TL
  },
  data: () => ({
    repositioning: false,
    saving: false,
    videoWidth: 0.5
  }),
  computed: {
    // tls in order of time
    ...mapState(['player', 'videoID', 'tls']),
    timestamp: {
      set(val) { this.$store.commit('setTimestamp', val); },
      get() { return this.$store.getters.timestamp; }
    },
    currentTime: {
      set(val) { this.$store.commit('setCurrentTime', val); },
      get() { return this.$store.state.currentTime; }
    },
    videoDuration: {
      set(val) { this.$store.commit('setDuration', val); },
      get() { return this.$store.state.videoDuration; }
    },
    sortedTLs: {
      get() { return this.$store.getters.sortedTLs; }
    }
  },
  watch: {
    // set the appropriate cursor
    repositioning() {
      document.body.style.setProperty('cursor', this.repositioning ? 'grabbing' : 'default', 'important');
    },
    player() {
      // update timestamp frequently
      const p = this.player;
      if (!p) return;
      const interval = setInterval(() => {
        if (p.getDuration) {
          this.videoDuration = p.getDuration();
          clearInterval(interval);
        }
      }, 100);

      // listen to player seek events
      window.addEventListener('message', packet => {
        try {
          const data = JSON.parse(packet.data);
          if (data.event === 'infoDelivery') {
            try {
              const left = this.binarySearch(this.currentTime);
              const right = this.binarySearch(data.info.currentTime);
              // animate tl entries that are supposed to be shown now
              for (let i = left; i < right; i++) {
                this.splash(this.sortedTLs[i]);
              }
            } catch (e) {
            }
            if (data.info.currentTime) {
              this.currentTime = data.info.currentTime;
            }
          }
        } catch (e) {
        }
      });
    }
  },
  async mounted() {
    this.$store.commit('setVideoID', this.$route.params.videoID || this.videoID);
    this.initLiveTLAPI();
  },
  methods: {
    ...utils,
    // start initializer methods
    async initLiveTLAPI() {
      // load initial batch of tls
      try {
        this.tls = await (await fetch(`https://api.livetl.app/translations/${this.videoID}/en`)).json();
        for (let i = 0; i < this.tls.length; i++) {
          this.$store.commit('addAttrTL', {
            index: i,
            data: {
              index: i,
              timestamp: this.convertToClockTime(this.tls[i].startTimeOffset),
              saving: false,
              originalText: this.tls[i].translatedText
            }
          });
        }
      } catch (e) {}
    },
    // end initializer methods

    // start state listeners
    tlTimeChanged(tl) {
      tl.timestamp = tl.timestamp.map(i => parseInt(i));
      if (tl.timestamp[1] <= 60 && tl.timestamp[2] <= 60) {
        tl.startTimeOffset = ((tl.timestamp[0] * 60) + tl.timestamp[1]) * 60 + tl.timestamp[2];
      }
    },
    // end state listeners

    // start actions
    async editTL(tl) {
      this.player.pauseVideo();
      await this.$nextTick();
      this.scrollIntoView(tl);
    },
    async addTL() {
      const currentTime = this.currentTime;
      this.$store.commit('pushTL', {
        translatedText: '',
        startTimeOffset: currentTime,
        index: this.tls.length,
        timestamp: this.convertToClockTime(currentTime),
        saving: false,
        originalText: ''
      });
      this.editTL(this.tls[this.tls.length - 1]);
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
    removeTL(tl) {
      this.$store.commit('removeTL', tl.index);
    },
    removeIfEmpty(tl) {
      if (!tl.translatedText) {
        this.removeTL(tl);
        return true;
      }
    },
    // end actions

    // start event handlers
    dragStarted(event, tl) {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      event.cancelBubble = true;
      event.returnValue = false;
      this.repositioning = true;
      const repositionElement = (event) => {
        const time = this.videoDuration *
          (event.clientX - 10 - window.innerWidth * this.videoWidth) / (window.innerWidth * this.videoWidth - 20);
        tl.startTimeOffset = Math.max(Math.min(this.videoDuration, time), 0);
        tl.timestamp = this.convertToClockTime(tl.startTimeOffset);
        this.player.seekTo(time);
      };
      window.addEventListener('mousemove', repositionElement);
      const mouseup = window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', repositionElement);
        window.removeEventListener('mouseup', mouseup);
        this.repositioning = false;
      });
    },
    // end event handlers

    // start dom triggers
    scrollIntoView(tl) {
      const e = document.querySelector(`#tl${tl.index}`);
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      this.splash(tl);
    },
    splash(tl) {
      const e = document.querySelector(`#tl${tl.index}`);
      e.parentElement.classList.remove('splash');
      // eslint-disable-next-line no-unused-expressions
      e.offsetHeight;
      e.parentElement.classList.add('splash');
    },
    // end dom triggers

    // start utility functions
    calcLeft(tl) {
      // calculate the left offset of TL markers
      return `calc(${(tl.startTimeOffset / this.videoDuration)} * (50% - 20px) + 10px - var(--width) / 2 + 50%)`;
    }
    // end utility functions
  }
};
</script>

<style>
.overlay {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.left-panel {
  height: 100%;
  flex-direction: column;
  display: flex;
  overflow: auto;
}
.horizontal-split {
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
.tl-marker {
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
.tl-marker:hover {
  --width: 10px;
  background-color: orange;
  z-index: 5;
}
.editable-wrapper {
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
.editable-wrapper * {
  display: flex;
}
#editable-element {
  padding: 10px;
}
.tl-entry {
  margin: 10px 5px 10px 5px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}
.tl-entry:last-child {
  margin-bottom: 0px !important;
}
.tl-entry:first-child {
  margin-top: 0px !important;
}
.tl-time-indicator {
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
