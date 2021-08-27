<template>
  <v-text-field v-model="videoInput" label="YouTube Video URL / ID" single-line solo dense hide-details
                append-icon="mdi-send" @click:append="loadVideo" @keypress.enter="loadVideo"/>
</template>

<script>
import { getVideoIdFromYoutubeUrl } from '@/js/utils';

export default {
  name: 'LoadVideoInput',
  data: () => {
    return {
      videoInput: ''
    };
  },
  methods: {
    loadVideo() {
      // convert a URL into an id
      if (this.videoInput.length > 11) {
        this.videoInput = getVideoIdFromYoutubeUrl(this.videoInput);
      }

      if (this.videoInput === '' || this.videoInput.length !== 11) {
        // TODO popup modal with warning?
        return;
      }

      this.$store.commit('setVideoID', this.videoInput);
      this.$router.push(`/edit/${this.videoInput}`);
    }
  }
};
</script>
