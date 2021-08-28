import * as Utils from './utils.js';
import store from '../store.js';

export function isValidTimestamp(val) {
  return val >= 0 && val <= 60;
}

export function binarySearch(time) {
  let left = 0;
  let right = store.getters.sortedCaptions.length;
  while (left < right) {
    const index = Math.floor((left + right) / 2);
    if (time <= store.getters.sortedCaptions[index].startTimeOffset) {
      right = index;
    } else {
      left = index + 1;
    }
  }
  if (left < store.getters.sortedCaptions.length && store.getters.sortedCaptions[left] < time) left++;
  return left;
}

export function convertToClockTime(time) {
  return new Date(
    parseFloat(time) * 1000
  ).toISOString().substr(11, 8).split(':').map(i => parseInt(i));
}

export function setCurrentTime(state, d) {
  const t = convertToClockTime(d);
  if (Math.abs(d - state.currentTime) >= 0.5 && t[1] <= 60 && t[2] <= 60) {
    state.player.seekTo(((t[0] * 60) + t[1]) * 60 + t[2]);
  }
  state.currentTime = d;
}

export function getVideoIdFromYoutubeUrl(youtubeUrl) {
  const regex = /(\/|\?v=)([\w-]{11})/; // simple way to get the ID from `youtube.com/watch?v={x}` and `youtu.be/{x}` links
  const matches = youtubeUrl.match(regex);
  if (matches !== null) {
    return matches[2];
  } else {
    return null;
  }
}

const utils = {};
for (const u in Utils) {
  if (u !== 'default') { utils[u] = Utils[u]; }
}
export default utils;
