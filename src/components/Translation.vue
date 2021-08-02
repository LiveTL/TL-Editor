<template>
  <v-col cols="12" class="py-2 pr-0">
    <v-card class="grey darken-4" flat>
      <v-card-text class="pa-3">
        <v-textarea class="pt-0" label="Caption Text" rows="1" auto-grow filled dense :value="tl.translatedText"
                    v-model="tl.translatedText"/>

        <v-container class="pa-0">
          <v-row>
            <v-col lg="6" cols="12" class="pt-1">
              <div class="px-3" style="background-color: #1f1f1f; border-radius: 6px">
                <h4 class="text-center pb-1">Start Time</h4>
                <v-row>
                  <translation-timestamp-input label="Hours" :model="tl.timestamp[0]"/>
                  <translation-timestamp-input label="Minutes" :model="tl.timestamp[1]"/>
                  <translation-timestamp-input label="Seconds" :model="tl.timestamp[2]"/>
                </v-row>
              </div>
            </v-col>

            <v-col lg="6" cols="12" class="pt-1">
              <div class="px-3" style="background-color: #1f1f1f; border-radius: 6px">
                <h4 class="text-center pb-1">End Time</h4>
                <v-row>
                  <translation-timestamp-input label="Hours" :model="tl.timestamp[0]"/>
                  <translation-timestamp-input label="Minutes" :model="tl.timestamp[1]"/>
                  <translation-timestamp-input label="Seconds" :model="tl.timestamp[2]"/>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-col>
  <!--  <v-list-item :id="`tl${tl.index}`">-->
  <!--    <v-list-item-content>-->
  <!--      <v-textarea-->
  <!--        filled-->
  <!--        name="input-7-4"-->
  <!--        label="Caption text"-->
  <!--        :value="tl.translatedText"-->
  <!--        v-model="tl.translatedText"-->
  <!--        @focus="$emit('editTL', tl)"-->
  <!--        focused/>-->
  <!--    </v-list-item-content>-->
  <!--    <v-list-item-action style="display: flex; align-items: center; justify-content: flex-end;">-->
  <!--      <v-text-field-->
  <!--        label="Hour"-->
  <!--        class="tl-time-indicator"-->
  <!--        filled outlined dense-->
  <!--        :rules="[isValidTimestamp]"-->
  <!--        v-model="tl.timestamp[0]"-->
  <!--        @change="$emit('tlTimeChanged', tl)"/>-->
  <!--      <v-text-field-->
  <!--        label="Minute"-->
  <!--        class="tl-time-indicator"-->
  <!--        filled outlined dense-->
  <!--        :rules="[isValidTimestamp]"-->
  <!--        v-model="tl.timestamp[1]"-->
  <!--        @change="$emit('tlTimeChanged', tl)"/>-->
  <!--      <v-text-field-->
  <!--        label="Second"-->
  <!--        class="tl-time-indicator"-->
  <!--        filled outlined dense-->
  <!--        :rules="[isValidTimestamp]"-->
  <!--        v-model="tl.timestamp[2]"-->
  <!--        @change="$emit('tlTimeChanged', tl)"/>-->
  <!--      <div style="margin-top: 15px;">-->
  <!--        <v-btn icon-->
  <!--               :disabled="(tl.originalText === tl.translatedText) || tl.saving"-->
  <!--               @click="$emit('stopEditing', tl)">-->
  <!--          <v-icon-->
  <!--            v-if="!tl.saving"-->
  <!--            :color="`${((tl.originalText !== tl.translatedText) ? 'green' : '')} lighten-1`">-->
  <!--            mdi-check-->
  <!--          </v-icon>-->
  <!--          <v-progress-circular-->
  <!--            indeterminate-->
  <!--            color="white"-->
  <!--            v-else-->
  <!--          ></v-progress-circular>-->
  <!--        </v-btn>-->
  <!--        <v-btn icon @click="$emit('removeTL', tl)">-->
  <!--          <v-icon color="red lighten-1">mdi-close</v-icon>-->
  <!--        </v-btn>-->
  <!--      </div>-->
  <!--    </v-list-item-action>-->
  <!--  </v-list-item>-->
</template>

<script>
import TranslationTimestampInput from './TranslationTimestampInput';

export default {
  name: 'Translation',
  components: { TranslationTimestampInput },
  props: {
    tl: {
      type: Object,
      required: true
    }
  }
};
</script>
