<template>
  <v-app dark>
    <v-app-bar
      app
      color="primary"
    >
      <div style="width: 100%; color: white; text-align: right; font-size: 2rem;">
        {{timestamp}}
      </div>
    </v-app-bar>

    <v-main>
      <MainUI videoID="1aQChs0biE8" @ytPlayer="p => player = p"/>
    </v-main>
  </v-app>
</template>

<script>
import MainUI from './components/MainUI';

export default {
  name: 'App',
  components: {
    MainUI
  },
  data: () => ({
    player: null,
    timestamp: '00:00:00'
  }),
  mounted() {
    window.addEventListener('message', packet => {
      const data = JSON.parse(packet.data);
      if (data.event === 'infoDelivery') {
        this.timestamp = new Date(
          parseFloat(data.info.currentTime) * 1000
        ).toISOString().substr(11, 8);
      }
    });
  }
};
</script>

<style>
html {
  overflow-y: hidden !important;
}
.v-main__wrap>div {
  height: 100%;
}
</style>
