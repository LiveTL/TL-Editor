import Vue from 'vue';
import Router from './Router.vue';
import vuetify from './plugins/vuetify';
import router from './router';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(Router)
}).$mount('#app');
