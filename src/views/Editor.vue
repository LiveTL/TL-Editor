<template style="overflow-y: hidden">
  <v-container fluid class="pa-0 d-flex fill-parent-height">
    <v-row class="pa-0" style="min-height: 0; max-width: 100%"> <!-- TODO FIXME for some reason setting max-width to 100% adds 10px of spacing between the right edge of the page, and the video, but without it, there's horizontal scrolling on mobile -->
      <!-- begin left tl panel -->
      <v-col md="6" cols="12" class="fill-parent-height" style="overflow-y: scroll">
        <v-container>
          <v-row>
            <v-col v-if="tls.length === 0" cols="12" class="pr-0">
              <v-card>
                <v-card-title>No caption entries to display</v-card-title>
              </v-card>
            </v-col>
            <Translation v-for="tl in sortedTLs" :key="tl.id" :tl="tl" :id="`tl-${tl.index}`"/>
            <v-col cols="12" class="pr-0">
              <v-btn id="new-caption-btn" @click="addTL" width="100%">
                <v-icon>mdi-plus</v-icon>
                New Caption
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>

      <!-- begin right video panel -->
      <v-col md="6" cols="12" class="px-0 fill-parent-height">
        <Video/>
      </v-col>
      <!-- end right video panel -->
    </v-row>

    <!-- begin overlay to prevent mouse glitches -->
    <div class="overlay" v-if="repositioning"/>
    <!-- end overlay -->

    <!-- begin yellow video time markers -->
    <div v-for="tl in tls" :key="tl.id">
      <div class="tl-marker" :style="{
          left: calcLeft(tl),
          }" @click="scrollIntoView(tl);"
           @mousedown="event => dragStarted(event, tl)"></div>
    </div>
    <!-- end video time markers -->
  </v-container>
</template>

<script>
import Video from '../components/Video.vue';
import Translation from '../components/Caption';
import { mapState } from 'vuex';
import utils from '../js/utils.js';
import { loadTranslations } from '@livetl/api-wrapper';

export default {
  name: 'EditorUI',
  components: {
    Translation,
    Video
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
    async videoID() {
      await this.initLiveTLAPI();
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
                this.splash(this.sortedTLs[i]); // this seems to break and constantly animate after hot reload. TODO Investigate to make sure it won't happen in prod
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
  },
  methods: {
    ...utils,
    // start initializer methods
    async initLiveTLAPI() {
      // load initial batch of tls
      try {
        const tls = await loadTranslations(this.videoID, 'en');
        if (Array.isArray(tls)) {
          this.$store.commit('initializeTls', tls);
        }

        for (let i = 0; i < this.tls.length; i++) {
          this.$store.commit('addAttrTL', {
            index: i,
            data: {
              index: i,
              timestamp: this.convertToClockTime(this.tls[i].start),
              saving: false,
              originalText: this.tls[i].translatedText
            }
          });
        }
      } catch (e) {}
    },
    // end initializer methods

    // start actions
    async addTL() {
      const currentTime = this.currentTime;
      const tl = {
        translatedText: '',
        startTimeOffset: Math.floor(currentTime * 1000),
        index: this.tls.length,
        timestamp: this.convertToClockTime(currentTime),
        saving: false,
        originalText: ''
      };
      this.$store.commit('pushTL', tl);
      this.player.pauseVideo(); // TODO add a setting for this

      await this.$nextTick();
      this.scrollIntoView(tl);
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
          // TODO FIXME this can be uncommented, and the line below removed, when the page width issue at the top of the file is resolved
          // (event.clientX - 10 - window.innerWidth * this.videoWidth) / (window.innerWidth * this.videoWidth - 20);
          (event.clientX - window.innerWidth * this.videoWidth) / (window.innerWidth * this.videoWidth - 20);

        tl.startTimeOffset = Math.floor(Math.max(Math.min(this.videoDuration, time), 0) * 1000);
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
      // FIXME for whatever reason, the height/layout of the page completely breaks when scrolling to the bottom element
      // const e = document.getElementById(`tl-${tl.index}`);
      // e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    },
    splash(tl) {
      const e = document.getElementById(`tl-${tl.index}`);
      e.parentElement.classList.remove('splash');
      // eslint-disable-next-line no-unused-expressions
      e.offsetHeight;
      e.parentElement.classList.add('splash');
    },
    // end dom triggers

    // start utility functions
    calcLeft(tl) {
      // calculate the left offset of TL markers
      // TODO FIXME this can be uncommented, and the line below removed, when the page width issue at the top of the file is resolved
      // return `calc(${(tl.startTimeOffset / this.videoDuration)} * (50% - 20px) + 10px - var(--width) / 2 + 50%)`;
      return `calc(${(tl.startTimeOffset / 1000 / this.videoDuration)} * (50% - 20px) - var(--width) / 2 + 50%)`;
    }
    // end utility functions
  }
};
</script>

<style>
html {
  overflow-y: hidden !important;
}
</style>

<style scoped>
.fill-parent-height {
  height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.tl-marker {
  background-color: gold;
  height: 25px;
  position: fixed;
  bottom: 29px;
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
  to {
  }
}

.splash {
  animation: splash 1s normal forwards ease-in-out;
}
</style>
