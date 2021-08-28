<template>
  <v-container fluid class="pa-0 fill-parent-height">
    <v-row no-gutters class="fill-parent-height">
      <!-- begin left caption panel -->
      <v-col md="6" cols="12" order-md="1" order="2" class="fill-parent-height">
          <v-row v-if="loadingCaptions" no-gutters>
            <v-col align="center">
              <v-progress-circular indeterminate/>
            </v-col>
          </v-row>
          <v-row v-else no-gutters class="overflow-y-auto align-content-start px-2"
                 :class="{'fill-parent-height': $vuetify.breakpoint.mdAndUp, 'half-height': !$vuetify.breakpoint.mdAndUp}">
            <v-col v-if="sortedCaptions.length === 0" cols="12" class="pr-0">
              <v-card>
                <v-card-title>No caption entries to display</v-card-title>
              </v-card>
            </v-col>
            <Caption v-for="caption in sortedCaptions" :key="caption.id" :caption="caption"
                         :id="`caption-${caption.index}`"/>
            <v-col cols="12" class="pr-0">
              <v-btn id="new-caption-btn" @click="addCaption()" width="100%">
                <v-icon>mdi-plus</v-icon>
                New Caption
              </v-btn>
            </v-col>
          </v-row>
      </v-col>

      <!-- begin right video panel -->
      <v-col md="6" cols="12" order-md="2" order="1" class="px-0"
             :class="{'fill-parent-height': $vuetify.breakpoint.mdAndUp, 'half-height': !$vuetify.breakpoint.mdAndUp}">
        <Video/>
      </v-col>
      <!-- end right video panel -->
    </v-row>

    <!-- begin overlay to prevent mouse glitches -->
    <div class="overlay" v-if="repositioning"/>
    <!-- end overlay -->

    <!-- begin yellow video time markers -->
    <div v-for="caption in sortedCaptions" :key="caption.id">
      <div class="caption-marker" :style="{
          left: calcLeft(caption),
          bottom: markerBottom
          }" @click="scrollIntoView(caption);"
           @mousedown="event => dragStarted(event, caption)"></div>
    </div>
    <!-- end video time markers -->
  </v-container>
</template>

<script>
import Video from '../components/Video.vue';
import Caption from '../components/Caption';
import { mapState } from 'vuex';
import utils from '../js/utils.js';
import { loadTranslations } from '@livetl/api-wrapper';

export default {
  name: 'EditorUI',
  components: {
    Caption,
    Video
  },
  data: () => ({
    repositioning: false,
    loadingCaptions: false,
    videoWidth: 0.5
  }),
  computed: {
    // captions in order of time
    ...mapState(['player', 'videoID', 'captions']),
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
    sortedCaptions: {
      get() { return this.$store.getters.sortedCaptions; }
    },
    markerBottom: {
      get() {
        /* future: figure out a way to align the marker without hard coding */
        return this.$vuetify.breakpoint.mdAndUp ? '29px' : 'calc(29px + 50% - 24px)';
      }
    }
  },
  watch: {
    // set the appropriate cursor
    repositioning() {
      document.body.style.setProperty('cursor', this.repositioning ? 'grabbing' : 'default', 'important');
    },
    async videoID() {
      this.loadingCaptions = true;
      await this.initLiveTLAPI();
      this.loadingCaptions = false;
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
              // animate caption entries that are supposed to be shown now
              for (let i = left; i < right; i++) {
                this.splash(this.sortedCaptions[i]); // this seems to break and constantly animate after hot reload. TODO Investigate to make sure it won't happen in prod
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
      // load initial batch of tls (ree why can't I have native named parameters)
      const tls = await loadTranslations(this.videoID, 'en', -1, [], [], false);
      if (Array.isArray(tls)) {
        for (let i = 0; i < tls.length; i++) {
          tls[i].index = i;
          tls[i].timestamp = this.convertToClockTime(tls[i].start);
        }
        this.$store.commit('initializeCaptions', tls);
      }
    },
    // end initializer methods

    // start actions
    async addCaption() {
      const currentTime = this.currentTime;
      const caption = {
        startTimeOffset: Math.floor(currentTime * 1000),
        index: this.captions.length,
        timestamp: this.convertToClockTime(currentTime)
      };
      this.$store.commit('addCaption', caption);
      this.player.pauseVideo(); // TODO add a setting for this

      await this.$nextTick();
      this.scrollIntoView(caption);
    },
    // end actions

    // start event handlers
    dragStarted(event, caption) {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      event.cancelBubble = true;
      event.returnValue = false;
      this.repositioning = true;
      const repositionElement = (event) => {
        const time = this.videoDuration *
          (event.clientX - 10 - window.innerWidth * this.videoWidth) / (window.innerWidth * this.videoWidth - 20);

        caption.startTimeOffset = Math.floor(Math.max(Math.min(this.videoDuration, time), 0) * 1000);
        caption.timestamp = this.convertToClockTime(caption.startTimeOffset);
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
    scrollIntoView(caption) {
      // FIXME for whatever reason, the height/layout of the page completely breaks when scrolling to the bottom element
      // const e = document.getElementById(`caption-${caption.index}`);
      // e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    },
    splash(caption) {
      const e = document.getElementById(`caption-${caption.index}`);
      e.parentElement.classList.remove('splash');
      // eslint-disable-next-line no-unused-expressions
      e.offsetHeight;
      e.parentElement.classList.add('splash');
    },
    // end dom triggers

    // start utility functions
    calcLeft(caption) {
      // calculate the left offset of caption markers
      if (this.$vuetify.breakpoint.mdAndUp) {
        return `calc(${(caption.startTimeOffset / 1000 / this.videoDuration)} * (50% - 20px) + 10px - var(--width) / 2 + 50%)`;
      } else {
        return `calc(${(caption.startTimeOffset / 1000 / this.videoDuration)} * (100% - 20px) + 10px - var(--width) / 2)`;
      }
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
.half-height {
  height: 50%;
}

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

.caption-marker {
  background-color: gold;
  height: 25px;
  position: fixed;
  --width: 4px;
  width: var(--width);
  transition: 0.1s;
  transition: left 0s;
  cursor: grab;
  border-radius: 2px;
}

.caption-marker:hover {
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
