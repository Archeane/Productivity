<template>
  <section class="container">
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" /> -->
    <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" />
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
import PieChart from '../../charts/PieChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData, getTimeTable, getWatchSites } from '../../js/data.js';

let chartDataProcessor = new ChartData();

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
    timeTable: null,
    watchSites: null,
    weekChartData: {
      totalLine: null,
      watchSitesLine: null,
      sitesLine: null,
    },
    // PieChartDayData: null,
    // PieChartWeekData: null,
    // LineChartData: null,
    // StackedBarWeekChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    await chartDataProcessor.init();
    this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(true);
    this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart();
    this.weekChartData.sitesLine = chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']);
    this.loaded = true;
  },
  components: { LineChart, PieChart, StackedBarChart },
};
</script>
