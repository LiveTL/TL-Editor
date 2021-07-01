import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    player: null,
    videoID: 'Z-a58aBXH58',
    tls: [],
    timestamp: [0, 0, 0]
  },
  mutations: {
    setTimestamp(state, d) {
      state.setTimestamp = d;
    },
    setPlayer(state, p) {
      state.player = p;
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
    }
  },
  getters: {
    playerState(state) {
      if (state.player && state.player.getPlayerState) {
        return state.player.getPlayerState();
      }
    },
    sortedTLs(state) {
      return [...state.tls].sort((a, b) => {
        return (a.startTimeOffset !== b.startTimeOffset ? a.startTimeOffset - b.startTimeOffset : a.index - b.index);
      });
    }
  }
});
