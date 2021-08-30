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
                <caption-timestamp-input :timestamp="localCaption.start" @timestampChanged="timestampChanged"
                                         kind="start"/>
              </div>
            </v-col>

            <v-col lg="6" cols="12" class="pt-1">
              <div class="px-3" style="background-color: #1f1f1f; border-radius: 6px">
                <h4 class="text-center pb-1">End Time</h4>
                <caption-timestamp-input :timestamp="localCaption.end" @timestampChanged="timestampChanged" kind="end"/>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-dialog v-model="deleteDialog" width="500">
          <v-card>
            <v-card-title>Request Deletion of Caption</v-card-title>

            <v-card-text>
              <v-form ref="deleteRequestForm">
                <h3 class="pb-2">Please provide a reason to delete the caption:</h3>
                <v-text-field outlined hide-details label="Reason" placeholder="Reason" required
                              :rules="[v => !!v || 'Must specify a reason']" v-model="deleteReason"/>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn plain small color="blue" @click="deleteDialog = false">Cancel</v-btn>
              <v-spacer/>
              <v-btn plain small color="red" @click="$refs.deleteRequestForm.validate() ? deleteCaption() : ''">Submit
                Request
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn plain small color="red" :loading="deleting" :disabled="deleting"
               @click="isOwnCaption ? deleteCaption() : deleteDialog = true">
          <v-icon>mdi-delete</v-icon>
          <span class="hidden-md-and-down"> {{ isOwnCaption ? 'Delete Caption' : 'Request Delete' }} </span>
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

        <v-btn plain small color="blue" :loading="creating" :disabled="canCreateCaption() === false || creating"
               @click="createCaption">
          <v-icon>mdi-upload</v-icon>
          <span class="hidden-md-and-down">Create Caption</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import CaptionTimestampInput from './CaptionTimestampInput';
import { mapState } from 'vuex';
import { createTranslation, deleteTranslation, updateTranslation } from '@livetl/api-wrapper';

export default {
  name: 'Caption',
  components: { CaptionTimestampInput },
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
      isOwnCaption: this.caption.translatorId === this.$store.state.translator.userID,
      deleteDialog: false,
      deleteReason: '',
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
    async createCaption() {
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
        console.debug(`Got error message "${response}" when creating caption with API`);
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
        console.debug(`Got error message "${response}" when saving caption with API`);
        // TODO should probably show an error modal here
        this.saving = false;
        return;
      }

      this.$store.commit('modifyCaption', this.localCaption);
      this.saving = false;
    },
    async deleteCaption() {
      this.deleting = true;
      this.deleteDialog = false;
      const reason = this.isOwnCaption ? 'Owner Delete' : this.deleteReason;
      await deleteTranslation(this.caption.id, reason, await this.$auth.getTokenSilently());
      if (this.isOwnCaption) {
        // don't remove it from the local store, since it's only been requested to be deleted
        this.$store.commit('deleteCaption', this.caption);
      }

      this.deleting = false;
    },
    undoLocalChanges() {
      this.localCaption = { ...this.caption };
    },
    // validators
    isCaptionValid() {
      return this.localCaption.translatedText !== undefined && this.localCaption.translatedText !== null && this.localCaption.translatedText !== ''; // TODO more involved validation
    },
    canCreateCaption() {
      return this.isCaptionValid() && this.localCaption.id === undefined;
    },
    hasChanges() {
      return this.localCaption.translatedText !== this.caption.translatedText ||
        this.localCaption.start !== this.caption.start ||
        this.localCaption.end !== this.caption.end;
    }
  }
};
</script>
