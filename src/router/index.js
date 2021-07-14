import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home')
  },
  {
    path: '/edit/:videoID?/',
    name: 'Editor',
    component: () => import(/* webpackChunkName: "editor" */ '@/views/Editor')
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/views/404')
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
