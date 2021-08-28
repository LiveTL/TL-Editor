import Vue from 'vue';
import Vuex from 'vuex';
import { convertToClockTime, setCurrentTime } from './js/utils.js';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    player: null,
    videoID: '',
    captions: {},
    currentTime: 0,
    videoDuration: 1,
    translator: null
  },
  mutations: {
    setCurrentTime(state, d) {
      setCurrentTime(state, d);
    },
    setTimestamp(state, d) {
      const parsed = d.map(i => parseInt(i));
      setCurrentTime(state, ((parsed[0] * 60) + parsed[1]) * 60 + parsed[2]);
    },
    setPlayer(state, p) {
      state.player = p;
    },
    initializeCaptions(state, captions) {
      state.captions = {}; // ensure we're starting fresh
      for (const caption of captions) {
        Vue.set(state.captions, caption.index, caption);
      }
    },
    addCaption(state, caption) {
      let maxIndex;
      // get the index, and check to see if the caption already exists
      for (const index in state.captions) {
        if (state.captions[index].id === caption.id) {
          break;
        }

        if (index > maxIndex) {
          maxIndex = index;
        }
      }

      caption.index = maxIndex + 1;
      Vue.set(state.captions, caption.index, caption);
    },
    deleteCaption(state, caption) {
      Vue.delete(state.captions, caption.index);
    },
    setVideoID(state, val) {
      state.videoID = val;
    },
    setDuration(state, val) {
      state.videoDuration = val;
    },
    setTranslator(state, translator) {
      state.translator = translator;
    }
  },
  getters: {
    timestamp(state) {
      return convertToClockTime(state.currentTime);
    },
    sortedCaptions(state) {
      const values = [];
      for (const propertyName in state.captions) {
        values.push(state.captions[propertyName]);
      }

      return values.sort((a, b) => a.start !== b.start ? a.start - b.start : a.index - b.index);
    }
  }
});
