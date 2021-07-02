<template>
  <v-list-item :id="`tl${tl.index}`">
    <v-list-item-content>
      <v-textarea
        dark
        filled
        name="input-7-4"
        label="Caption text"
        :value="tl.translatedText"
        v-model="tl.translatedText"
        @focus="$emit('editTL', tl)"
        focused
      ></v-textarea>
    </v-list-item-content>
    <v-list-item-action style="display: flex; align-items: center; justify-content: flex-end;">
      <v-text-field
        label="Hour"
        class="tl-time-indicator"
        filled dark
        :rules="[isValidTimestamp]"
        v-model="tl.timestamp[0]"
        @change="$emit('tlTimeChanged', tl)"
        outlined
      ></v-text-field>
      <v-text-field
        label="Minute"
        class="tl-time-indicator"
        filled dark
        :rules="[isValidTimestamp]"
        v-model="tl.timestamp[1]"
        @change="$emit('tlTimeChanged', tl)"
        outlined
      ></v-text-field>
      <v-text-field
        label="Second"
        class="tl-time-indicator"
        filled dark
        :rules="[isValidTimestamp]"
        v-model="tl.timestamp[2]"
        @change="$emit('tlTimeChanged', tl)"
        outlined
      ></v-text-field>
      <div style="margin-top: 15px;">
        <v-btn icon
          :disabled="(tl.originalText == tl.translatedText) || tl.saving"
          @click="$emit('stopEditing', tl)">
          <v-icon
            v-if="!tl.saving"
            :color="`${((tl.originalText != tl.translatedText) ? 'green' : '')} lighten-1`">
            mdi-check
          </v-icon>
          <v-progress-circular
            indeterminate
            color="white"
            v-else
          ></v-progress-circular>
        </v-btn>
        <v-btn icon @click="$emit('removeTL', tl)">
          <v-icon color="red lighten-1">mdi-close</v-icon>
        </v-btn>
      </div>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
import utils from '../js/utils.js';
export default {
  name: 'TL',
  props: {
    tl: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...utils
  }
};
</script>
