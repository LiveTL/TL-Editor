import Vue from 'vue';
import VueRouter from 'vue-router';
import MainUI from '../components/MainUI.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/edit/:videoID?/',
    name: 'App',
    component: MainUI
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  }
];

const router = new VueRouter({
  routes
});

export default router;
