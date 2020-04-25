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
              <v-select v-model="selects.totalTime" v-on:change="fetchTotalUsage" style="width: 50px;" :items="['3', '7', '14', '30']" label="7"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-card-text>
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
              <v-select v-model="selects.siteUsageSum" v-on:change="fetchSiteUsageSum" style="width: 50px;" :items="['2', '3', '4', '5', '6', '7']" label="3"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" />
        </v-card>
      </v-col>
      <v-col :cols="4">
        <v-card>
          <v-row>
            <v-col cols="8">
              <v-card-title>Total Time Online</v-card-title>
            </v-col>
            <v-col cols="4">
              <v-select v-model="selects.siteUsageByDay" v-on:change="fetchSiteUsageByDay" style="width: 50px;" :items="['2', '3', '4', '5', '6', '7']" label="3"></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <stacked-bar-chart v-if="loaded" :chartdata="weekChartData.stackedBar" />
        </v-card>
      </v-col>
    </v-row>

    <DashboardLineChartContainer
      v-if="loaded"
      :weekTotal="weekChartData.totalLine"
      :weekWatch="weekChartData.watchSitesLine"
      :weekSites="weekChartData.sitesLine"
      :visitedSites="monthVisitedSites"
    />
  </v-container>
  <!-- <v-card
      class="mx-auto"
      max-width="800"
      raised=true
        >
        <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
            <v-tab :key="weekTotalLine">Total time</v-tab>
            <v-tab :key="weekWatchLine">Watch sites time</v-tab>
            <v-tab :key="weekSitesLine">Specific sites</v-tab>
            <v-btn-toggle
                v-model="toggle_exclusive"
                color="primary"
                mandatory>
                <v-btn :value="1" text>
                    week
                </v-btn>
                <v-btn :value="2" text>
                    month
                </v-btn>
            </v-btn-toggle>
            <v-tab-item :key="weekTotalLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
                </v-container>
            </v-tab-item>
            <v-tab-item :key="weekWatchLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
                </v-container>
            </v-tab-item>
            <v-tab-item :key="weekSitesLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" />
                </v-container>
            </v-tab-item>
        </v-tabs>
  </v-card>-->

  <!-- <timeline-chart v-if="loaded" :data="TimelineChart" /> -->
  <!-- <timeline-site-chart v-if="loaded" :chartSeries="SitesIntervals" /> -->
  <!-- <radar-chart v-if="loaded" :chartdata="weekChartData.watchSitesRadar" /> -->
  <!-- <pie-chart v-if="loaded" :chartSeries="PieChartDaySeries" :chartLabels="PieChartDayLabels" /> -->
  <!-- <pie-chart v-if="loaded" :chartSeries="weekChartData.seriesPie" :chartLabels="weekChartData.labelsPie" /> -->
</template>
<script>
import LineChart from '../../charts/LineChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import DashboardLineChartContainer from './DashboardLineChartContainer';

// import RadarChart from '../../charts/RadarChart';
// import ScatterChart from '../../charts/ScatterChart';
// import PieChart from '../../charts/PieChart';
// import TimelineSiteChart from '../../charts/TimelineSiteChart';
// import TimelineChart from '../../charts/TimelineChart';

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
    selects: {
      totalTime: 0,
      siteUsageByDay: 0,
    },
    weekChartData: {
      totalLine: null,
      watchSitesLine: null,
      sitesLine: null,
      seriesPie: null,
      labelsPie: null,
      halfDonut: null,
      watchSitesRadar: null,
      stackedBar: null,
      usageFrequencyTable: null,
      sitesVisitsScatter: null,
    },
    TimelineChart: null,
    PieChartDaySeries: null,
    PieChartDayLabels: null,
    SitesIntervals: null,
    monthVisitedSites: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();
    const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-7, 0);
    this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
    var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-13, -7);
    lastWeekTotalMinutes /= 1000;
    if (weekTotalMinutes > lastWeekTotalMinutes) this.lastWeekTotalUsageCmp = `+${Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100)} % from last week`;
    else
      (this.lastWeekTotalUsageCmpColor = colors.green.lighten1), (this.lastWeekTotalUsageCmp = `-${Math.round((weekTotalMinutes / lastWeekTotalMinutes) * 100)} % from last week`);

    this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData(-3, 0);
    this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(-3, 0);
    this.weekChartData.totalLine = this.chartDataProcessor.weekTotalTimeLineChart(false);
    this.weekChartData.watchSitesLine = this.chartDataProcessor.weekWatchSitesLineChart();
    this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']);
    this.monthVisitedSites = this.chartDataProcessor.timeFrameVisitedSites(-30, 0);
    console.log(this.monthVisitedSites);
    // var PieChartDayData = chartDataProcessor.dayChartPieData();
    // this.PieChartDaySeries = PieChartDayData.series;
    // this.PieChartDayLabels = PieChartDayData.labels;
    // var PieChartWeekData = chartDataProcessor.weekChartPieData();
    // this.weekChartData.seriesPie = PieChartWeekData.series;
    // this.weekChartData.labelsPie = PieChartWeekData.labels;
    // this.weekChartData.watchSitesRadar = chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    // var yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);
    // this.SitesIntervals = chartDataProcessor.daySitesTimeline(yesterday, null, null, true);
    // this.weekChartData.usageFrequencyTable = chartDataProcessor.weekSitesUsageFrequency();
    // this.TimelineChart = chartDataProcessor.dayTimeline();
    // this.weekChartData.sitesVisitsScatter = chartDataProcessor.weekSiteVisitScatter(null, null, true);
    // console.log(this.weekChartData.sitesVisitsScatter);
    this.loaded = true;
  },
  methods: {
    fetchTotalUsage: function() {
      const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(parseInt(-1 * this.selects.totalTime), 0);
      this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
      var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-2 * this.selects.totalTime + 1, -1 * this.selects.totalTime);
      if (weekTotalMinutes > lastWeekTotalMinutes)
        (this.lastWeekTotalUsageCmpColor = colors.red.lighten1),
          (this.lastWeekTotalUsageCmp = `+${Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100)} % from last week`);
      else
        (this.lastWeekTotalUsageCmpColor = colors.green.lighten1),
          (this.lastWeekTotalUsageCmp = `-${Math.round((weekTotalMinutes / lastWeekTotalMinutes) * 100)} % from last week`);
    },
    fetchSiteUsageByDay: function() {
      this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(parseInt(-1 * this.selects.siteUsageByDay), 0);
    },
    fetchSiteUsageSum: function() {
      this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData();
    },
  },
  components: { LineChart, HalfDonutChart, StackedBarChart, DashboardLineChartContainer },
};
</script>
