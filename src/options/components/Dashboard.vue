<template>
  <v-container class="grey lighten-5">
    <v-row class="mb-6">
      <v-col :cols="4">
        <v-card>
          <v-row>
            <v-col cols="8">
              <v-card-title>Total Time Online</v-card-title>
            </v-col>
            <v-col cols="4">
              <v-select v-model="weekTotalSelect" style="width: 50px;" :items="['3', '7', '14', '30']"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-card-text :key="weekTotalUsage">
            <p class="display-1 text--primary">{{ weekTotalUsage }}</p>
            <div class="text--primary">
              <p :style="{ color: lastWeekTotalUsageCmpColor }">{{ lastWeekTotalUsageCmp }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col :cols="4">
        <v-card>
          <v-row>
            <v-col cols="8">
              <v-card-title>Total Time Online</v-card-title>
            </v-col>
            <v-col cols="4">
              <v-select v-model="halfDonutSelect" style="width: 50px;" :items="['2', '3', '4', '5', '6', '7']"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" :key="weekChartData.halfDonut" />
        </v-card>
      </v-col>
      <v-col :cols="4">
        <v-card>
          <v-row>
            <v-col cols="8">
              <v-card-title>Total Time Online</v-card-title>
            </v-col>
            <v-col cols="4">
              <v-select v-model="stackedBarSelect" style="width: 50px;" :items="['2', '3', '4', '5', '6', '7']"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <stacked-bar-chart v-if="loaded" :chartdata="weekChartData.stackedBar" :key="weekChartData.stackedBar" />
        </v-card>
      </v-col>
    </v-row>

    <DashboardLineChartContainer
      v-if="loaded"
      :weekTotal="weekChartData.totalLine"
      :weekTotalOptions="weekChartData.totalLineOptions"
      :weekSites.sync="weekChartData.sitesLine"
      :visitedSites="monthVisitedSites"
      :weekSitesSelection.sync="weekSitesSelection"
    />
  </v-container>
  <!-- <v-card>
      <v-card-title>
        Usage Stats Week of {{ new Date().getMonth() }}
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table v-if="loaded" :headers="tableHeaders" :items="weekChartData.usageFrequencyTable" :search="search" multi-sort class="elevation-1"></v-data-table>
    </v-card>-->
</template>
<script>
import LineChart from '../../charts/LineChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import DashboardLineChartContainer from './DashboardLineChartContainer';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    weekTotalUsage: '',
    lastWeekTotalUsageCmp: 0,
    lastWeekTotalUsageCmpColor: colors.red.lighten1, // true = usage increased compared to last week
    tableHeaders: [
      {
        text: 'Url',
        aligh: 'start',
        value: 'name',
      },
      { text: 'Total Time', value: 'total' },
      { text: 'Visit Frequency', value: 'frequency' },
      { text: 'Avg Time Per Visit (mins)', value: 'timePerVist' },
    ],
    weekTotalSelect: 7,
    halfDonutSelect: 3,
    stackedBarSelect: 3,
    weekSitesSelection: [],
    weekChartData: {
      totalLine: null,
      totalLineOptions: null,
      sitesLine: null,
      halfDonut: null,
      stackedBar: null,
      usageFrequencyTable: null,
    },
    monthVisitedSites: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-7, 0);
    this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
    var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-13, -7);
    if (weekTotalMinutes > lastWeekTotalMinutes)
      this.lastWeekTotalUsageCmp = `+${Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100)} % from last ${this.weekTotalSelect} days`;
    else
      (this.lastWeekTotalUsageCmpColor = colors.green.lighten1),
        (this.lastWeekTotalUsageCmp = `-${Math.round((weekTotalMinutes / lastWeekTotalMinutes) * 100)} % from last ${this.weekTotalSelect} days`);

    this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData(-3, 0);
    this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(-3, 0);

    this.weekChartData.totalLine = this.chartDataProcessor.watchSitesTotalLineChart(new Date(), 2, false);
    this.weekChartData.totalLineOptions = {
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
    this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart();
    this.monthVisitedSites = this.chartDataProcessor.timeFrameVisitedSites(-30, 0);

    this.loaded = true;
  },
  watch: {
    weekTotalSelect: function(val) {
      const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(parseInt(-1 * parseInt(this.weekTotalSelect)), 0);
      var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-2 * parseInt(this.weekTotalSelect) + 1, -1 * parseInt(this.weekTotalSelect));
      if (lastWeekTotalMinutes == null) {
        this.lastWeekTotalUsageCmp = `Not enough data for last ${this.weekTotalSelect} days`;
      } else {
        if (weekTotalMinutes > lastWeekTotalMinutes) {
          this.lastWeekTotalUsageCmpColor = colors.red.lighten1;
          var percentage = Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100);
          this.lastWeekTotalUsageCmp = `+${percentage} % from last ${this.weekTotalSelect} days`;
        } else {
          this.lastWeekTotalUsageCmpColor = colors.green.lighten1;
          var percentage = Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100);
          this.lastWeekTotalUsageCmp = `${percentage} % from last ${this.weekTotalSelect} days`;
        }
      }
      if (weekTotalMinutes == null) {
        this.weekTotalUsage = 'Not enough data!';
      } else {
        this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
      }
    },
    halfDonutSelect: function(val) {
      this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData(parseInt(val) * -1, 0);
    },
    stackedBarSelect: function(val) {
      this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(parseInt(val) * -1, 0);
    },
    weekSitesSelection: function(val) {
      this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart(val);
    },
  },
  components: { LineChart, HalfDonutChart, StackedBarChart, DashboardLineChartContainer },
};
</script>
