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
              <v-checkbox v-model="select.weeksRadar" label="Last Week" value="2" v-on:change="fetchWeeksRadar"></v-checkbox>
              <v-checkbox v-model="select.weeksRadar" label="Last last week" value="3" v-on:change="fetchWeeksRadar"></v-checkbox>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <radar-chart v-if="loaded" :chartdata="weekRadar" />
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card>
          <line-chart :chartdata="weekLine" />
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
    weekRadar: null,
    weekLine: null,
    halfDonut: null,
    totalTime: null,
    topSites: null,
    select: {
      weeksRadar: null,
    },
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.totalTime = this.minutesToHours(this.chartDataProcessor.timeFrameWatchSitesTotalUsage(-7, 0));
    this.topSites = this.chartDataProcessor.topWatchSites(-7, 0).slice(0, 6);

    this.weekRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(2);
    this.weekLine = this.chartDataProcessor.weekWatchSitesLineChart();
    this.halfDonut = this.chartDataProcessor.timeFrameWatchSitesHalfDonut(-7, 0);
    console.log(this.halfDonut);

    this.loaded = true;
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
