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
        <!-- <div class="darkened">{{ statusMessage || `Displaying ${tls.length} caption entries` }}</div> -->
        <!--
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
        -->
      </div>
    </v-app-bar>

    <v-main>
      <div class="horizontalsplit">
        <div :style="`height: 100%; width: calc(100% * (1 - ${videoWidth})); flex-direction: column; display: flex;`">
          <v-btn style="float: left; position: relative; margin: 20px;"
            @click="addTL()">
            <v-icon>
              mdi-plus
            </v-icon>
            New Caption
          </v-btn>
          <v-list dark>
            <v-list-item v-for="tl in sortedTLs" class="tlentry" :key="tl ? tl.id : ''">
              <v-list-item-content>
                <v-textarea
                  dark
                  filled
                  name="input-7-4"
                  label="Caption text"
                  :value="tl.translatedText"
                  v-model="tl.translatedText"
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
                <v-btn icon>
                  <v-icon color="grey lighten-1">mdi-close</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
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
    videoWidth: 0.5
  }),
  computed: {
    sortedTLs() {
      return [...this.tls].sort((a, b) => (a.startTimeOffset - b.startTimeOffset));
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
          this.timestamp = this.setNewTime(data.info.currentTime);
        }
      } catch (e) {}
    });
    try {
      this.tls = await (await fetch(`https://api.livetl.app/translations/${this.videoID}/en`)).json();
      for (let i = 0; i < this.tls.length; i++) {
        this.tls[i].index = i;
        this.tls[i].timestamp = this.setNewTime(this.tls[i].startTimeOffset);
      }
      console.log(this.tls, this.videoID);
    } catch (e) {}
  },
  methods: {
    validTimestamp(val) {
      return val >= 0 && val <= 60;
    },
    timeChanged() {
      this.timestamp = this.timestamp.map(i => parseInt(i));
      this.player.seekTo(((this.timestamp[0] * 60) + this.timestamp[1]) * 60 + this.timestamp[2]);
    },
    tlTimeChanged(tl) {
      tl.timestamp = tl.timestamp.map(i => parseInt(i));
      tl.startTimeOffset = ((tl.timestamp[0] * 60) + tl.timestamp[1]) * 60 + tl.timestamp[2];
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
      tl.editing = true;
      await this.$nextTick();
      // const elem = document.querySelector('#editableElement');
      // elem.textContent = tl.translatedText;
      // elem.focus();
      // elem.addEventListener('keydown', event => {
      //   if (event.key === 'Enter') {
      //     event.preventDefault();
      //     this.stopEditing(tl);
      //   } else if (event.key === 'Escape') {
      //     event.preventDefault();
      //     this.stopEditing(tl, false);
      //   }
      // });
      // await this.$forceUpdate();
      // try {
      //   const range = document.createRange();
      //   const sel = window.getSelection();
      //   range.setStart(elem.childNodes[0], elem.innerText.length);
      //   range.collapse(true);
      //   sel.removeAllRanges();
      //   sel.addRange(range);
      // } catch (e) {}
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
      const currentTime = this.player.getCurrentTime();
      this.tls.push({
        translatedText: '',
        startTimeOffset: currentTime,
        index: this.tls.length,
        timestamp: this.setNewTime(currentTime)
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
  grid-template-columns: fit-content(50px) auto fit-content(25px);
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
</style>
