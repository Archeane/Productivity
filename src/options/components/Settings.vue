<template>
  <v-container fluid fill-height>
    <v-row dense>
      <h2 class="font-weight-light mr-auto ml-3">Settings</h2>
      <span class="subtitle-2 ml-auto mr-3">
        Have you find this tool useful? Please make a donation! <br />
        Any amount is appreciated 😁</span
      >
      <div>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="EF6BJM8AY86QA" />
          <input type="hidden" name="currency_code" value="USD" />
          <input
            type="image"
            src="https://www.empowerhaititogether.org/wp-content/uploads/2016/10/Donate-Button-heart-300x97.png"
            border="0"
            height="40"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Donate with PayPal button"
          />
          <img alt border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </div>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card>
          <v-card-title>Current Watch Sites:</v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item-group v-model="watchSites">
              <v-list-item v-for="(url, i) in watchSites" :key="url">
                <v-list-item-icon>
                  <v-img :src="favIcon(url)" max-height="32" max-width="32"></v-img>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="url"></v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon color="red" @click="removeWatchSite(i)">
                    <v-icon>fas fa-times</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
          <v-form v-model="valid" onsubmit="return false;">
            <p class="subtitle-1 pl-5 mt-5">You can put sites you want to reduce browsing time, and track your progress in our tool!</p>
            <p class="subtitle-1 pl-5">Add a watch site:</p>
            <v-text-field v-model="watchSite" :rules="validate" label="www.facebook.com" required style="max-width: 80%;" class="ml-auto mr-auto pb-5">
              <template v-slot:append>
                <v-btn :disabled="!valid" @click="addWatchSite" depressed tile color="primary"> <v-icon left>fas fa-plus</v-icon>Add </v-btn>
              </template>
            </v-text-field>
          </v-form>
        </v-card>
      </v-col>
      <v-col cols="6">
        <div>
          <p class="title ml-auto mr-auto">Stop tacking if idled for:</p>
          <v-slider v-model="idleTime" min="30" step="15" ticks="always" thumb-label>
            <template v-slot:prepend>
              <v-text-field v-model="idleTime" class="mt-0 pt-0" hide-details readonly single-line type="number" style="width: 50px"></v-text-field>
            </template>
          </v-slider>
        </div>
        <div class="ml-auto mr-auto">
          <p class="title">First Day of Week:</p>
          <v-btn-toggle color="primary" v-model="startOfWeek" dense rounded mandatory>
            <v-btn text :value="true" @click="setStartOfWeek('week')">Sunday</v-btn>
            <v-btn text :value="false" @click="setStartOfWeek('isoweek')">Monday</v-btn>
          </v-btn-toggle>
        </div>
        <div class="pt-5">
          <p class="title">Clear Data In Range:</p>
          <v-row>
            <v-col cols="6">
              <v-date-picker v-model="clearDataRange" no-title range></v-date-picker>
            </v-col>
            <v-col cols="6">
              <v-text-field v-on="on" readonly style="max-width: 15rem;" v-model="clearDataRangeText"></v-text-field>
              <v-btn color="error" class="ml-auto mr-auto" depressed tile> <v-icon left>fas fa-eraser</v-icon>Clear Data </v-btn>
            </v-col>
          </v-row>
        </div>
        <div class="mt-5">
          <v-btn color="primary" tile depressed @click="exportToCSV"> <v-icon left>mdi-file-excel</v-icon>Data To CSV </v-btn>
          <v-btn @click="clearAllData" color="error" tile depressed> <v-icon left>fas fa-exclamation</v-icon>Clear All Data </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { getWatchSites, addWatchSite, removeWatchSite, getStartOfWeek, setStartOfWeek, getIdleTime, setIdleTime, clearAllData, exportToCSV } from '../../js/data.js';
import moment from 'moment';
export default {
  data: () => ({
    valid: true,
    loaded: false,
    watchSite: null,
    watchSites: [],
    idleTime: null,
    startOfWeek: null,
    clearDataRange: [
      moment()
        .subtract('1', 'd')
        .format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD'),
    ],
    urlRules: [
      v => !!v || 'URL is required',
      v => /^((ftp|http|https):\/\/)?www\.([A-z0-9]+)\.([A-z]{2,})/.test(v) || 'Invalid URL: URL must contain .www and domain name of at least 2 characters',
    ],
  }),
  async mounted() {
    this.watchSites = await getWatchSites();
    var payload = await getStartOfWeek();
    this.startOfWeek = payload.data == 'week' ? true : false;
    payload = await getIdleTime();
    this.idleTime = payload.data;
    this.loaded = true;
  },
  watch: {
    idleTime: function(val) {
      if (val > 15) setIdleTime(val);
    },
  },
  methods: {
    removeWatchSite: function(i) {
      var url = this.watchSites.splice(i, 1)[0];
      removeWatchSite(url);
    },
    addWatchSite: async function() {
      if (!this.watchSites.includes(this.watchSite)) {
        this.watchSites.push(this.watchSite);
        await addWatchSite(this.watchSite);
      }
    },
    setStartOfWeek: function(val) {
      setStartOfWeek(val);
    },
    favIcon(domain) {
      return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`;
    },
    clearAllData() {
      clearAllData();
    },
    exportToCSV() {
      exportToCSV();
    },
  },
  computed: {
    clearDataRangeText() {
      return this.clearDataRange.join(' ~ ');
    },
    validate() {
      return [
        v => !!v || 'URL is required',
        v => /^((ftp|http|https):\/\/)?www\.([A-z0-9]+)\.([A-z]{2,})/.test(v) || 'Invalid URL: URL must contain .www and domain name of at least 2 characters',
        v => !this.watchSites.includes(v) || `${v} is already an watch site!`,
      ];
    },
  },
};
</script>
