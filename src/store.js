import Vue from 'vue';
import Vuex from 'vuex';
import { convertToClockTime, setCurrentTime } from './js/utils.js';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    player: null,
    videoID: '',
    captions: [],
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
    initializeCaptions(state, tls) {
      state.captions = new Set(tls);
    },
    addCaption(state, d) {
      state.captions.push(d);
    },
    deleteCaption(state, index) {
      state.captions.splice(index, 1);
      for (let i = index; i < state.captions.length; i++) {
        state.captions[i].index = i;
      }
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
      return [...state.captions.values()].sort((a, b) => {
        return (
          a.startTimeOffset !== b.startTimeOffset
            ? a.startTimeOffset - b.startTimeOffset : a.index - b.index
        );
      });
    }
  }
});
