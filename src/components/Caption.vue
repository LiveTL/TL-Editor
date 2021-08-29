<template>
  <v-col cols="12" class="py-2 pr-0">
    <v-card class="grey darken-4" flat>
      <v-card-text class="pa-3">
        <v-textarea class="pt-0" label="Caption Text" rows="1" auto-grow filled dense hide-details
                    v-model="localCaption.translatedText"/>

        <v-container class="pb-0 px-0 pt-5">
          <v-row>
            <v-col lg="6" cols="12" class="pt-1">
              <div class="px-3" style="background-color: #1f1f1f; border-radius: 6px">
                <h4 class="text-center pb-1">Start Time</h4>
                <translation-timestamp-input :timestamp="localCaption.start" @timestampChanged="timestampChanged" kind="start"/>
              </div>
            </v-col>

            <v-col lg="6" cols="12" class="pt-1">
              <div class="px-3" style="background-color: #1f1f1f; border-radius: 6px">
                <h4 class="text-center pb-1">End Time</h4>
                <translation-timestamp-input :timestamp="localCaption.end" @timestampChanged="timestampChanged" kind="end"/>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-btn plain small color="red" :loading="deleting" :disabled="deleting" @click="deleteTranslation">
          <v-icon>mdi-delete</v-icon>
          <!-- TODO check if this is our translation, or someone else's. If it's someone else's, and we aren't a verified TL, then display "Request Delete" -->
          <span class="hidden-md-and-down">Delete Translation</span>
        </v-btn>
        <v-btn plain small color="red" :disabled="hasChanges() === false" @click="undoLocalChanges">
          <v-icon>mdi-undo-variant</v-icon>
          <span class="hidden-md-and-down">Undo Modifications</span>
        </v-btn>
        <v-spacer/>
        <v-btn plain small color="green" :loading="saving"
               :disabled="!this.localCaption.id || hasChanges() === false || saving" @click="saveLocalChanges">
          <v-icon>mdi-content-save</v-icon>
          <span class="hidden-md-and-down">Save Modifications</span>
        </v-btn>
        <v-btn plain small color="blue" :loading="creating" :disabled="canCreateTranslation() === false || creating"
               @click="createTranslation">
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
import { createTranslation, deleteTranslation, updateTranslation } from '@livetl/api-wrapper';

export default {
  name: 'Caption',
  components: { TranslationTimestampInput },
  computed: {
    ...mapState(['videoID'])
  },
  props: {
    caption: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localCaption: { ...this.caption },
      deleting: false,
      saving: false,
      creating: false
    };
  },
  methods: {
    // event handlers
    timestampChanged(timestampArr, kind) {
      const msInHour = 3_600_000;
      const msInMin = 60_000;
      const msInSec = 1_000;

      if (kind === 'start') {
        this.localCaption.start = timestampArr[0] * msInHour + timestampArr[1] * msInMin + timestampArr[2] * msInSec;
      } else if (kind === 'end') {
        this.localCaption.end = timestampArr[0] * msInHour + timestampArr[1] * msInMin + timestampArr[2] * msInSec;
      }
    },
    // actions
    async createTranslation() {
      this.creating = true;
      const translation = {
        videoId: this.videoID,
        languageCode: 'en', // TODO don't hardcode to en
        translatedText: this.localCaption.translatedText,
        start: this.localCaption.start,
        end: this.localCaption.end
      };

      const response = await createTranslation(translation, await this.$auth.getTokenSilently());
      if (typeof response !== 'number') {
        console.debug(`Got error message "${response}" when creating translation with API`);
        // TODO should probably show an error modal here
        this.creating = false;
        return;
      }

      this.localCaption.id = response;
      this.$store.commit('modifyCaption', this.localCaption);
      this.creating = false;
    },
    async saveLocalChanges() {
      this.saving = true;
      const translation = {
        translatedText: this.localCaption.translatedText,
        start: this.localCaption.start,
        end: this.localCaption.end
      };

      const response = await updateTranslation(this.localCaption.id, translation, await this.$auth.getTokenSilently());
      if (typeof (response) !== 'boolean') {
        console.debug(`Got error message "${response}" when creating translation with API`);
        // TODO should probably show an error modal here
        this.saving = false;
        return;
      }

      this.$store.commit('modifyCaption', this.localCaption);
      this.saving = false;
    },
    async deleteTranslation() {
      this.deleting = true;
      await deleteTranslation(this.caption.id, 'TODO', await this.$auth.getTokenSilently()); // TODO don't hardcode delete reason
      this.$store.commit('deleteCaption', this.caption);
      this.deleting = false;
    },
    undoLocalChanges() {
      this.localCaption = { ...this.caption };
    },
    // validators
    isTranslationValid() {
      return this.localCaption.translatedText !== undefined && this.localCaption.translatedText !== null && this.localCaption.translatedText !== ''; // TODO more involved validation
    },
    canCreateTranslation() {
      return this.isTranslationValid() && this.localCaption.id === undefined;
    },
    hasChanges() {
      return this.localCaption.translatedText !== this.caption.translatedText ||
        this.localCaption.start !== this.caption.start ||
        this.localCaption.end !== this.caption.end;
    }
  }
};
</script>
