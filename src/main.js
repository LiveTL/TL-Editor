import Vue from 'vue';
import Router from './Router.vue';
import { Auth0Plugin } from './plugins/auth0';
import vuetify from './plugins/vuetify';
import router from './router/index.js';
import store from './store.js';
import { audience, clientId, domain } from '../auth0-config.json';

Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  // eslint-disable-next-line space-before-function-paren
  onRedirectCallback: async (appState) => {
    await router.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname);
  }
});

Vue.config.productionTip = false;

new Vue({
  store,
  vuetify,
  router,
  render: h => h(Router)
}).$mount('#app');
