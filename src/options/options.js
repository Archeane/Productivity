import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';
import vuetify from '../plugins/vuetify';
import Vuetify from 'vuetify';

import Dashboard from './components/Dashboard';
import WatchSitesOverview from './components/WatchSitesOverview';
import WatchSitesDetails from './components/WatchSitesDetails';
import UsagePattern from './components/UsagePattern';
/* eslint-disable no-new */

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    component: Dashboard,
  },
  {
    path: '/watchsitesoverview',
    component: WatchSitesOverview,
  },
  {
    path: '/watchsitesdetails',
    component: WatchSitesDetails,
  },
  {
    path: '/usagepattern',
    component: UsagePattern,
  },
];
const router = new VueRouter({
  routes,
});
var vm = new Vue({
  el: '#app',
  router: router,
  vuetify: new Vuetify({
    theme: {
      dark: false,
    },
  }),
});
global.vm = vm;
