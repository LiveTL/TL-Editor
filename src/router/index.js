import Vue from 'vue';
import VueRouter from 'vue-router';
import MainUI from '../components/MainUI.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/:videoID?/',
    name: 'App',
    component: MainUI
  }
];

const router = new VueRouter({
  routes
});

export default router;
