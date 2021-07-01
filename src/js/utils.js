import * as Utils from './utils.js';
import store from '../store.js';

export function isValidTimestamp(val) {
  return val >= 0 && val <= 60;
}
export function binarySearch(time) {
  let left = 0;
  let right = store.getters.sortedTLs.length;
  while (left < right) {
    const index = Math.floor((left + right) / 2);
    if (time <= store.getters.sortedTLs[index].startTimeOffset) {
      right = index;
    } else {
      left = index + 1;
    }
  }
  if (left < store.getters.sortedTLs.length && store.getters.sortedTLs[left] < time) left++;
  return left;
}
export function convertToClockTime(time) {
  return new Date(
    parseFloat(time) * 1000
  ).toISOString().substr(11, 8).split(':').map(i => parseInt(i));
}
const utils = {};
for (const u in Utils) {
  if (u !== 'default') { utils[u] = Utils[u]; }
}
export default utils;
