<template>
  <v-col cols="12" class="py-2 pr-0">
    <v-card  class="grey darken-4" flat>
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
        <v-btn plain small color="red">
          <v-icon>mdi-undo-variant</v-icon>
          <span class="hidden-md-and-down">Undo Modifications</span>
        </v-btn>
        <v-btn plain small color="red">
          <v-icon>mdi-delete</v-icon>
          <span class="hidden-md-and-down">Delete Translation</span>
        </v-btn>
        <v-spacer/>
        <v-btn plain small color="green">
          <v-icon>mdi-content-save</v-icon>
          <span class="hidden-md-and-down">Save Modifications</span>
        </v-btn>
        <v-btn plain small color="blue">
          <v-icon>mdi-upload</v-icon>
          <span class="hidden-md-and-down">Create Translation</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import TranslationTimestampInput from './CaptionTimestampInput';

export default {
  name: 'Caption',
  components: { TranslationTimestampInput },
  props: {
    tl: {
      type: Object,
      required: true
    }
  }
};
</script>
