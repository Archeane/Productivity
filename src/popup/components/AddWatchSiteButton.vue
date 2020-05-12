<template>
  <div>
    <span v-if="showSuccessMsg" style="color: green;">{{ watchSiteUrl }} added to watched sites</span>
    <v-btn depressed tile small dark @click="addToWatchSites()"><v-icon left small>fas fa-plus</v-icon>Watch Sites</v-btn>
  </div>
</template>
<script>
import { addWatchSite } from '../../js/data.js';
import { VBtn, VIcon } from 'vuetify/lib';
function getCurrentTabUrl(cb) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    cb(tabs[0].url);
  });
}
export default {
  components: {
    VBtn,
    VIcon,
  },
  data: () => ({
    showSuccessMsg: false,
    watchSiteUrl: '',
  }),
  methods: {
    addToWatchSites: function() {
      var self = this;
      getCurrentTabUrl(url => {
        console.log(url);
        addWatchSite(url)
          .then(function(response) {
            console.log(response);
            if (response.status == 200) {
              self.watchSiteUrl = response.url;
              self.showSuccessMsg = true;
            }
          })
          .catch(err => console.log(err));
      });
    },
  },
};
</script>
