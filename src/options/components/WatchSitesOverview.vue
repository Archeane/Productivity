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
          <v-card-title>Watch Sites Total Time</v-card-title>
          <v-divider></v-divider>
          <radar-chart v-if="loaded" :chartdata="weekRadar" />
        </v-card>
      </v-col>
      <v-col cols="7">
        <v-card>
          <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
            <v-tab>Watch sites time</v-tab>
            <v-tab>Total time</v-tab>
            <v-tab-item>
              <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekSitesLine" />
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid>
                <line-chart v-if="loaded" :options="weekTotalLineOptions" :chartdata="weekTotalLineData" />
              </v-container>
            </v-tab-item>
          </v-tabs>
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
    weekTotalLineData: null,
    weekTotalLineOptions: null,
    halfDonut: null,
    totalTime: null,
    topSites: null,

    weeksRadarSelect: [],
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.totalTime = this.minutesToHours(this.chartDataProcessor.timeFrameWatchSitesTotalUsage(-7, 0));
    this.topSites = this.chartDataProcessor.topWatchSites(-7, 0).slice(0, 6);

    this.weekRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(3);
    this.weekSitesLine = this.chartDataProcessor.weekWatchSitesLineChart(
      moment()
        .subtract(2, 'd')
        .toDate()
    );
    console.log(this.weekSitesLine);
    this.weekTotalLineData = this.chartDataProcessor.watchSitesTotalLineChart(
      moment()
        .subtract(1, 'd')
        .toDate(),
      1,
      true
    );
    this.weekTotalLineOptions = {
      plugins: {
        datalabels: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              stepSize: 60,
              callback: function(label, index, labels) {
                return label / 60 + ' Hrs ';
              },
            },
          },
        ],
      },
    };
    this.halfDonut = this.chartDataProcessor.timeFrameWatchSitesHalfDonut(-7, 0);

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
