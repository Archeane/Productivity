<template>
  <section class="container">
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" /> -->
    <timeline-site-chart v-if="loaded" :chartSeries="SitesIntervals" />
    <!-- <radar-chart v-if="loaded" :chartdata="weekChartData.watchSitesRadar" />
    <pie-chart v-if="loaded" :chartSeries="PieChartDaySeries" :chartLabels="PieChartDayLabels" />
    <pie-chart v-if="loaded" :chartSeries="weekChartData.seriesPie" :chartLabels="weekChartData.labelsPie" />
    <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" />
    <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" /> -->
    <!-- <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" /> -->
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
import PieChart from '../../charts/PieChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
// import StackedBarChart from '../../charts/StackedBarChart';
import TimelineSiteChart from '../../charts/TimelineSiteChart';
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
      seriesPie: null,
      labelsPie: null,
      halfDonut: null,
      watchSitesRadar: null,
      stackedBar: null,
    },
    PieChartDaySeries: null,
    PieChartDayLabels: null,
    SitesIntervals: null,
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
    this.weekChartData.seriesPie = PieChartWeekData.series;
    this.weekChartData.labelsPie = PieChartWeekData.labels;
    this.weekChartData.halfDonut = chartDataProcessor.weekChartHalfDonutData();
    this.weekChartData.watchSitesRadar = chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.SitesIntervals = chartDataProcessor.daySitesTimeline(yesterday, null, null, true);
    console.log(this.SitesIntervals);
    this.loaded = true;
  },
  components: { LineChart, PieChart, HalfDonutChart, RadarChart, TimelineSiteChart },
};
</script>
