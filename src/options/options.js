import Vue from 'vue';
import App from './App';
import vuetify from '../plugins/vuetify';
import Vuetify from 'vuetify';

import Dashboard from './components/Dashboard';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    Dashboard,
  },
  data() {
    return {
      drawer: true,
      items: [
        { title: 'Home', icon: 'mdi-home-city' },
        { title: 'My Account', icon: 'mdi-account' },
        { title: 'Users', icon: 'mdi-account-group-outline' },
      ],
      mini: true,
    };
  },
  vuetify: new Vuetify({
    theme: {
      dark: false,
    },
  }),
});
