<template>
  <section class="container">
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" /> -->
    <radar-chart v-if="loaded" :chartdata="RadarChartWatchSites" />
    <pie-chart v-if="loaded" :chartSeries="PieChartDaySeries" :chartLabels="PieChartDayLabels" />
    <pie-chart v-if="loaded" :chartSeries="PieChartWeekSeries" :chartLabels="PieChartWeekLabels" />
    <half-donut-chart v-if="loaded" :chartdata="HalfDonutWeekData" />
    <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
    <!-- <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" /> -->
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
import PieChart from '../../charts/PieChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
import RadarChart from '../../charts/RadarChart';
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
    PieChartDaySeries: null,
    PieChartDayLabels: null,
    PieChartWeekSeries: null,
    PieChartWeekLabels: null,
    HalfDonutWeekData: null,
    RadarChartWatchSites: null,
  }),
  async mounted() {
    this.loaded = false;
    await chartDataProcessor.init();
    this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(true);
    this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart();
    // this.weekChartData.sitesLine = chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']);
    var PieChartDayData = chartDataProcessor.dayChartPieData();
    this.PieChartDaySeries = PieChartDayData.series;
    this.PieChartDayLabels = PieChartDayData.labels;
    var PieChartWeekData = chartDataProcessor.weekChartPieData();
    this.PieChartWeekSeries = PieChartWeekData.series;
    this.PieChartWeekLabels = PieChartWeekData.labels;
    this.HalfDonutWeekData = chartDataProcessor.weekChartHalfDonutData();
    this.RadarChartWatchSites = chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    console.log(this.RadarChartWatchSites);
    this.loaded = true;
  },
  components: { LineChart, PieChart, HalfDonutChart, StackedBarChart, RadarChart },
};
</script>
