<template>
  <div>
    <span v-if="showSuccessMsg">{{watchSiteUrl}} added to watched sites</span>
    <v-btn small color="primary" dark @click="addToWatchSites()">Watch Sites</v-btn>
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
        addWatchSite(url)
          .then(function(response) {
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