<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col cols="3">
        <v-card>
          <v-card-title>{{ totalTime }}</v-card-title>
        </v-card>
        <v-card>
          <half-donut-chart v-if="loaded" :chartdata="halfDonut" />
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-row>
          <v-col v-for="usage in topSites" :key="usage[0]" cols="4">
            <v-card>
              <v-card-subtitle>{{ usage[0] }}</v-card-subtitle>
              <v-card-title>{{ minutesToHours(usage[1]) }}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="5">
        <v-card>
          <v-row>
            <v-col cols="8">
              <v-card-title>Total Time Online</v-card-title>
            </v-col>
            <v-col cols="4">
              <v-checkbox v-model="weeksRadarSelect" label="Last Week" value="2" v-on:change="fetchWeeksRadar"></v-checkbox>
              <v-checkbox v-model="weeksRadarSelect" label="Last last week" value="3" v-on:change="fetchWeeksRadar"></v-checkbox>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <radar-chart v-if="loaded" :chartdata="weekRadar" />
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card>
          <line-chart v-if="loaded" :chartdata="weekSitesLine" :key="weekSitesSelect" />
          <div v-for="url in watchSites" :key="url">
            <v-checkbox v-model="weekSitesSelect" :label="url" :value="url"></v-checkbox>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import RadarChart from '../../charts/RadarChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import LineChart from '../../charts/LineChart';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    watchSites: null,

    weekRadar: null,
    weekSitesLine: null,
    halfDonut: null,
    totalTime: null,
    topSites: null,

    weeksRadarSelect: [],
    weekSitesSelect: [],
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.totalTime = this.minutesToHours(this.chartDataProcessor.timeFrameWatchSitesTotalUsage(-7, 0));
    this.topSites = this.chartDataProcessor.topWatchSites(-7, 0).slice(0, 6);

    this.weekRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(2);
    this.weekSitesLine = this.chartDataProcessor.weekWatchSitesLineChart(
      moment()
        .subtract(1, 'd')
        .toDate()
    );
    console.log(this.weekSitesLine);
    this.watchSites = this.weekSitesLine.datasets.map(data => {
      return data.label;
    });
    this.weekSitesSelect = this.watchSites;

    this.halfDonut = this.chartDataProcessor.timeFrameWatchSitesHalfDonut(-7, 0);

    this.loaded = true;
  },
  watch: {
    weekSitesSelect: function(urls) {
      // this.weekSitesLine = this.chartDataProcessor.weekSiteUsageLineChart(urls);
      let intersection = this.watchSites.filter(x => !urls.includes(x));
      console.log(intersection);
      for (var i = 0; i < this.weekSitesLine.datasets.length; i++) {
        // console.log(this.weekSitesLine.datasets[i].label, this.weekSitesLine.datasets[i].label in intersection)
        if (intersection.includes(this.weekSitesLine.datasets[i].label)) {
          this.weekSitesLine.datasets[i].hidden = true;
        }
      }
      //this.weekSitesLine.datasets[0].hidden = true;
    },
  },
  methods: {
    fetchWeeksRadar: function() {
      this.weeksRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(parseInt(select.weeksRadar));
    },
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
  },
  components: { LineChart, RadarChart, HalfDonutChart },
};
</script>
