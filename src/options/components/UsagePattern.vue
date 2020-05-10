<template>
  <v-container fluid fill-height>
    <v-row dense>
      <h2 class="font-weight-light mr-auto ml-3">Usage Pattern</h2>
      <span class="subtitle-2 ml-auto mr-3">
        Did you find this tool useful? Please make a donation!
        <br />Any amount is appreciated 😁
      </span>
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
    <v-row align="center">
      <v-col offset="1" cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field :value="date1" label="Timeline 1 Date" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date1" no-title></v-date-picker>
        </v-menu>
      </v-col>
      <v-col offset="1" cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field label="Timeline 2 Date" :value="date2" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date2" no-title></v-date-picker>
        </v-menu>
      </v-col>
      <!-- <v-col cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field label="Timeline 3 Date" :value="date3" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date3" no-title></v-date-picker>
        </v-menu>
      </v-col> -->
    </v-row>
    <div v-if="loaded" id="timelines-charts-container" style="margin-left: 2rem;">
      <timeline-chart :data="timelines[0]" :key="timelines[0]" width="600" height="800"></timeline-chart>
      <timeline-chart :data="timelines[1]" :key="timelines[1]" width="600" height="800" class="timelines-chart"></timeline-chart>
      <!-- <timeline-chart :data="timelines[2]" :key="timelines[2]" width="500" height="600" class="timelines-chart"></timeline-chart> -->
    </div>
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import TimelineChart from '../../charts/TimelineChart';
import 'vuetify/lib';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    timelines: [[], [], []],
    date1: moment().format('YYYY-MM-DD'),
    date2: moment()
      .subtract(1, 'd')
      .format('YYYY-MM-DD'),
    // date3: moment()
    //   .subtract(2, 'd')
    //   .format('YYYY-MM-DD'),
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();
    this.timelines[0] = this.chartDataProcessor.dayTimeline(moment(this.date1).toDate());
    this.timelines[1] = this.chartDataProcessor.dayTimeline(moment(this.date2).toDate());
    // this.timelines[2] = this.chartDataProcessor.dayTimeline(moment(this.date3).toDate());
    this.loaded = true;
  },
  watch: {
    date1: function(val) {
      this.changeTimeline(0, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
    },
    date2: function(val) {
      this.changeTimeline(1, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
      var chartContainer = document.getElementById('timeline');
      var oldChildIdx,
        svgCounter = 1;
      for (var i = 0; i < chartContainer.childNodes.length; i++) {
        if (chartContainer.childNodes[i].nodeName == 'svg') svgCounter += 1;
        if (svgCounter == 2) oldChildIdx = i;
      }
      if (oldChildIdx) chartContainer.removeChild(chartContainer.childNodes[oldChildIdx]);
      else chartContainer.removeChild(chartContainer.childNodes[2]);
    },
    // date3: function(val) {
    //   this.changeTimeline(2, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
    // },
  },
  methods: {
    changeTimeline: function(n, data) {
      this.timelines[n] = null;
      this.timelines[n] = data;
    },
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
  },
  components: { TimelineChart },
};
</script>
<style scoped>
#timeline {
  display: flex;
}
</style>
