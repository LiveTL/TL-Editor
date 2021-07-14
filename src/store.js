import Vue from 'vue';
import Vuex from 'vuex';
import { convertToClockTime, setCurrentTime } from './js/utils.js';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    player: null,
    videoID: 'Z-a58aBXH58',
    tls: [],
    sortedTLs: [],
    currentTime: 0,
    videoDuration: 1,
    auth0: null,
    authenticationState: undefined,
    user: null
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
    initializeTls(state, tls) {
      state.tls = tls;
    },
    pushTL(state, d) {
      state.tls.push(d);
    },
    addAttrTL(state, { index, data }) {
      Object.keys(data).forEach(key => {
        state.tls[index][key] = data[key];
      });
    },
    removeTL(state, index) {
      state.tls.splice(index, 1);
      for (let i = index; i < state.tls.length; i++) {
        state.tls[i].index = i;
      }
    },
    setVideoID(state, val) {
      state.videoID = val;
    },
    setDuration(state, val) {
      state.videoDuration = val;
    },
    setAuth(state, data) {
      state.auth0 = data;
    },
    setUser(state, data) {
      state.user = data;
    },
    setAuthenticationState(state, val) {
      state.authenticationState = val;
    }
  },
  getters: {
    timestamp(state) {
      return convertToClockTime(state.currentTime);
    },
    sortedTLs(state) {
      return [...state.tls].sort((a, b) => {
        return (
          a.startTimeOffset !== b.startTimeOffset
            ? a.startTimeOffset - b.startTimeOffset : a.index - b.index
        );
      });
    }
  }
});
