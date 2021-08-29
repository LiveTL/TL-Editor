<template>
  <v-row>
    <v-col cols="4">
      <v-text-field class="caption-timestamp" filled outlined dense hide-details label="Hours" v-model="timestampArr[0]" @change="$emit('timestampChanged', timestampArr, kind)"/>
    </v-col>
    <v-col cols="4">
      <v-text-field class="caption-timestamp" filled outlined dense hide-details label="Minutes" v-model="timestampArr[1]" @change="$emit('timestampChanged', timestampArr, kind)"/>
    </v-col>
    <v-col cols="4">
      <v-text-field class="caption-timestamp" filled outlined dense hide-details label="Seconds" v-model="timestampArr[2]" @change="$emit('timestampChanged', timestampArr, kind)"/>
    </v-col>
  </v-row>
</template>

<script>
import { convertToClockTime } from '@/js/utils';

export default {
  name: 'CaptionTimestampInput',
  props: {
    timestamp: {
      type: Number,
      required: true
    },
    kind: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      timestampArr: convertToClockTime(this.timestamp)
    };
  }
};
</script>

<style scoped>

</style>
