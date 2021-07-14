<template>
  <v-text-field v-model="videoId" label="YouTube Video URL / ID" single-line solo dense hide-details append-icon="mdi-send"
                @click:append="loadVideo" @keypress.enter="loadVideo"/>
</template>

<script>
export default {
  name: 'LoadVideoInput',
  data: () => {
    return {
      videoId: ''
    };
  },
  methods: {
    loadVideo() {
      console.log(this.videoId);
      if (this.videoId === '') {
        return;
      }

      // TODO don't assume it's the raw ID
      this.$router.push(`/edit/${this.videoId}`);
    }
  }
};
</script>
