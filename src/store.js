import Vue from 'vue';
import Vuex from 'vuex';
import { convertToClockTime, setCurrentTime, sortTLs } from './js/utils.js';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    player: null,
    videoID: 'Z-a58aBXH58',
    tls: [],
    sortedTLs: [],
    currentTime: 0
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
    pushTL(state, d) {
      state.tls.push(d);
      sortTLs(state);
    },
    addAttrTL(state, { index, data }) {
      Object.keys(data).forEach(key => {
        state.tls[index][key] = data[key];
      });
      sortTLs(state);
    },
    removeTL(state, index) {
      state.tls.splice(index, 1);
      for (let i = index; i < state.tls.length; i++) {
        state.tls[i].index = i;
      }
      sortTLs(state);
    },
    setVideoID(state, val) {
      state.videoID = val;
    }
  },
  getters: {
    timestamp(state) {
      return convertToClockTime(state.currentTime);
    }
  }
});
