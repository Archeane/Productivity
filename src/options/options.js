import Vue from 'vue';
import App from './App';
import vuetify from '../plugins/vuetify';
import Vuetify from 'vuetify';
import Dashboard from './components/Dashboard.vue'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    "Dashboard": Dashboard
  },
  vuetify: new Vuetify({
    theme: {
      dark: true,
    },
  }),
});
