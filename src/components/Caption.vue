<template>
  <v-col cols="12" class="py-2 pr-0">
    <v-card class="grey darken-4" flat>
      <v-card-text class="pa-3">
        <v-textarea class="pt-0" label="Caption Text" rows="1" auto-grow filled dense hide-details
                    :value="tl.translatedText" v-model="tl.translatedText"/>

        <v-container class="pb-0 px-0 pt-5">
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

      <v-card-actions>
        <v-btn plain small color="red" :disabled="disableUndoBtn">
          <v-icon>mdi-undo-variant</v-icon>
          <span class="hidden-md-and-down">Undo Modifications</span>
        </v-btn>
        <v-btn plain small color="red" :loading="deleting" :disabled="deleting" @click="deleteTranslation">
          <v-icon>mdi-delete</v-icon>
          <!-- TODO check if this is our translation, or someone else's. If it's someone else's, and we aren't a verified TL, then display "Request Delete" -->
          <span class="hidden-md-and-down">Delete Translation</span>
        </v-btn>
        <v-spacer/>
        <v-btn plain small color="green" :loading="saving" :disabled="disableSaveBtn || saving">
          <v-icon>mdi-content-save</v-icon>
          <span class="hidden-md-and-down">Save Modifications</span>
        </v-btn>
        <v-btn plain small color="blue" :loading="creating" :disabled="canCreateTranslation() || creating" @click="createTranslation">
          <v-icon>mdi-upload</v-icon>
          <span class="hidden-md-and-down">Create Translation</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import TranslationTimestampInput from './CaptionTimestampInput';
import { mapState } from 'vuex';
import { createTranslation, deleteTranslation } from '@livetl/api-wrapper';

export default {
  name: 'Caption',
  components: { TranslationTimestampInput },
  computed: {
    ...mapState(['videoID'])
  },
  props: {
    tl: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      disableUndoBtn: true, // TODO check for modifications
      disableSaveBtn: true, // TODO check for modifications
      deleting: false,
      saving: false,
      creating: false
    };
  },
  methods: {
    // actions
    async createTranslation() {
      this.creating = true;
      const translation = {
        videoId: this.videoID,
        languageCode: 'en', // TODO don't hardcode to en
        translatedText: this.tl.translatedText,
        start: this.tl.startTimeOffset
        // end: this.tl.endTimeOffset // TODO
      };

      const response = await createTranslation(translation, await this.$auth.getTokenSilently());
      if (typeof response !== 'number') {
        console.debug(`Got error message "${response}" when creating translation with API`);
        // TODO should probably show an error modal here
        this.creating = false;
        return;
      }

      this.tl.translationId = response;
      this.$forceUpdate(); // force update so the create translation btn gets disabled
      this.creating = false;
    },
    async deleteTranslation() {
      this.deleting = true;
      await deleteTranslation(this.tl.translationId, 'TODO', await this.$auth.getTokenSilently()); // TODO don't hardcode delete reason
      this.$store.commit('removeTL', this.tl.index);
      this.deleting = false;
    },
    // validators
    isTranslationValid() {
      return this.tl.translatedText === ''; // TODO more involved validation
    },
    canCreateTranslation() {
      return this.isTranslationValid() || this.tl.translationId !== undefined;
    }
  }
};
</script>
