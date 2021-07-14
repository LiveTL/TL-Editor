import Vue from 'vue';
import Router from './Router.vue';
import vuetify from './plugins/vuetify';
import router from './router/index.js';
import store from './store.js';

Vue.config.productionTip = false;

new Vue({
  store,
  vuetify,
  router,
  render: h => h(Router)
}).$mount('#app');
