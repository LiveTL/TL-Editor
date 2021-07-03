import Vue from 'vue';
import VueRouter from 'vue-router';
import EditorUI from '../components/EditorUI.vue';
import BrowserUI from '../components/BrowserUI.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/edit/:videoID?/',
    name: 'Editor',
    component: EditorUI
  },
  {
    path: '/',
    name: 'Browser',
    component: BrowserUI // () => import('../components/BrowserUI.vue')
  }
];

const router = new VueRouter({
  routes
});

export default router;
