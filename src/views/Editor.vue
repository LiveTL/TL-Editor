<template>
  <v-container fluid class="pa-0 fill-parent-height">
    <div class="d-flex flex-column flex-md-row fill-parent-height">
      <!-- begin left caption panel -->
      <div class="order-1 order-md-0" style="min-height: 0"
           :style="$vuetify.breakpoint.mdAndUp ? 'flex: 0 0 50%; max-width: 50%' : ''">
        <!-- future: ^mimicking previous behavior, decide if we really want button covered for equal width -->
        <v-row v-if="loadingCaptions" no-gutters>
          <v-col align="center">
            <v-progress-circular indeterminate/>
          </v-col>
        </v-row>
        <v-row v-else no-gutters class="align-content-start overflow-y-auto px-2 fill-parent-height pt-2">
          <v-col v-if="sortedCaptions.length === 0" cols="12" class="pb-2">
            <v-card>
              <v-card-title>No caption entries to display</v-card-title>
            </v-card>
          </v-col>
          <Caption v-for="caption in sortedCaptions" :key="caption.id" :caption="caption"
                   :id="`caption-${caption.index}`"/>
          <v-col cols="12" class="pb-2">
            <v-btn id="new-caption-btn" @click="addCaption()" width="100%">
              <v-icon>mdi-plus</v-icon>
              New Caption
            </v-btn>
          </v-col>
          <v-col cols="12" class="pb-2">
            <input hidden type="file" ref="subtitleFile" accept=".ass, .srt" @change="previewCaptions"/>
            <v-btn id="new-caption-btn" @click="$refs.subtitleFile.click()" width="100%">
              <v-icon>mdi-file-move-outline</v-icon>
              Import Captions From Subtitle File
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- begin right video panel -->
      <div class="order-0 order-md-1" style="position: relative"
           :style="$vuetify.breakpoint.mdAndUp ? 'flex: 0 0 50%; max-width: 50%' : ''">
        <!-- future: ^mimicking previous behavior, decide if we really want button covered for equal width -->
        <Video :stretch="$vuetify.breakpoint.mdAndUp"/>
        <!-- begin yellow video time markers TODO move to caption.vue, and make it listen for the `timestampChanged` event -->
        <div v-for="caption in sortedCaptions" :key="caption.id">
          <div class="caption-marker" style="position: absolute" :style="{
          left: calcLeft(caption),
          }" @click="scrollIntoView(caption);"
               @mousedown="event => dragStarted(event, caption)"></div>
        </div>
        <!-- end video time markers -->
      </div>
      <!-- end right video panel -->
    </div>

    <!-- begin overlay to prevent mouse glitches -->
    <div class="overlay" v-if="repositioning"/>
    <!-- end overlay -->

  </v-container>
</template>

<script>
import Video from '../components/Video.vue';
import Caption from '../components/Caption';
import { mapState } from 'vuex';
import utils from '../js/utils.js';
import { loadTranslations } from '@livetl/api-wrapper';

// wrapper around FileReader (from https://stackoverflow.com/a/44161989)
function readFileContents(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

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
    currentTime: {
      set(val) {
        this.$store.commit('setCurrentTime', val);
      },
      get() {
        return this.$store.state.currentTime;
      }
    },
    videoDuration: {
      set(val) {
        this.$store.commit('setDuration', val);
      },
      get() {
        return this.$store.state.videoDuration;
      }
    },
    sortedCaptions: {
      get() {
        return this.$store.getters.sortedCaptions;
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
          this.videoDuration = p.getDuration() * 1000;
          clearInterval(interval);
        }
      }, 100);

      // listen to player seek events
      window.addEventListener('message', packet => {
        let data;
        try {
          data = JSON.parse(packet.data);
        } catch {
        }

        if (data?.event === 'infoDelivery') {
          if (!data.info.currentTime) {
            return;
          }

          data.info.currentTime *= 1000;
          const left = this.binarySearch(this.currentTime);
          const right = this.binarySearch(data.info.currentTime);
          // animate caption entries that are supposed to be shown now
          for (let i = left; i < right; i++) {
            this.splash(this.sortedCaptions[i]); // this seems to break and constantly animate after hot reload. TODO Investigate to make sure it won't happen in prod
          }
          this.currentTime = data.info.currentTime;
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
          if (tls[i].end === null) {
            tls[i].end = tls[i].start;
          }
        }
        this.$store.commit('initializeCaptions', tls);
      }
    },
    // end initializer methods

    // start actions
    async addCaption() {
      const currentTime = Math.floor(this.currentTime);
      const caption = {
        start: currentTime,
        end: currentTime + 1000 * 5, // default to 5s after start
        translatorId: this.$store.state.translator.userID
      };
      this.$store.commit('addCaption', caption);
      this.player.pauseVideo(); // TODO add a setting for this

      await this.$nextTick();
      this.scrollIntoView(caption);
    },
    async previewCaptions() {
      // TODO send this to the API to parse (going to require reworking a bit about the API so I can have a 'preview' of the captions before actually creating them)
      console.log(await readFileContents(this.$refs.subtitleFile.files[0]));
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

        const duration = caption.end - caption.start;
        caption.start = Math.floor(Math.max(Math.min(this.videoDuration, time), 0));
        caption.end = caption.start + duration;
        // this.player.seekTo(time); // I don't know if I should re-enable this, personally I don't like the seek-on-drag (plus I don't wanna fix it)
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
      return `calc(${(caption.start / this.videoDuration)} * (100% - 20px) + 10px - var(--width) / 2)`;
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

.caption-marker {
  background-color: gold;
  height: 25px;
  bottom: 29px;
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
