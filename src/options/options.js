import Vue from 'vue';
import App from './App';
import vuetify from '../plugins/vuetify';
import Vuetify from 'vuetify';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  vuetify: new Vuetify({
    theme: {
      dark: true,
    },
  }),
});
