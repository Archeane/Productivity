<template>
  <section class="container">
    <v-card>
      <v-card-title>
        Usage Stats Week of {{ new Date().getMonth() }}
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>

      <v-data-table v-if="loaded" :headers="tableHeaders" :items="weekChartData.usageFrequencyTable" :search="search" multi-sort class="elevation-1"></v-data-table>
    </v-card>
    <!-- <timeline-chart v-if="loaded" :data="TimelineChart" /> -->
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" /> -->
    <!-- <timeline-site-chart v-if="loaded" :chartSeries="SitesIntervals" /> -->
    <!-- <radar-chart v-if="loaded" :chartdata="weekChartData.watchSitesRadar" /> -->
    <!-- <pie-chart v-if="loaded" :chartSeries="PieChartDaySeries" :chartLabels="PieChartDayLabels" /> -->
    <!-- <pie-chart v-if="loaded" :chartSeries="weekChartData.seriesPie" :chartLabels="weekChartData.labelsPie" /> -->
    <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" />
    <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" />
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
// import ScatterChart from '../../charts/ScatterChart';
import PieChart from '../../charts/PieChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
// import TimelineSiteChart from '../../charts/TimelineSiteChart';
// import TimelineChart from '../../charts/TimelineChart';
import RadarChart from '../../charts/RadarChart';
import { ChartData } from '../../js/data.js';

let chartDataProcessor = new ChartData();

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
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
  }),
  async mounted() {
    this.loaded = false;
    await chartDataProcessor.init();
    this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(true);
    this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart();
    this.weekChartData.sitesLine = chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']);
    // this.weekChartData.stackedBar = chartDataProcessor.weekChartStackedBarData()
    var PieChartDayData = chartDataProcessor.dayChartPieData();
    this.PieChartDaySeries = PieChartDayData.series;
    this.PieChartDayLabels = PieChartDayData.labels;
    var PieChartWeekData = chartDataProcessor.weekChartPieData();
    this.weekChartData.seriesPie = PieChartWeekData.series;
    this.weekChartData.labelsPie = PieChartWeekData.labels;
    this.weekChartData.halfDonut = chartDataProcessor.weekChartHalfDonutData();
    this.weekChartData.watchSitesRadar = chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.SitesIntervals = chartDataProcessor.daySitesTimeline(yesterday, null, null, true);
    this.weekChartData.usageFrequencyTable = chartDataProcessor.weekSitesUsageFrequency();
    this.TimelineChart = chartDataProcessor.dayTimeline();
    this.weekChartData.sitesVisitsScatter = chartDataProcessor.weekSiteVisitScatter(null, null, true);
    console.log(this.weekChartData.sitesVisitsScatter);
    this.loaded = true;
  },
  components: { LineChart, PieChart, HalfDonutChart, RadarChart, StackedBarChart },
};
</script>
