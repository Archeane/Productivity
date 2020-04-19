<template>
  <section class="container">
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" /> -->
    <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
    <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
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
    },
    // PieChartDayData: null,
    // PieChartWeekData: null,
    // LineChartData: null,
    // StackedBarWeekChartData: null,
  }),
  async mounted() {
    await chartDataProcessor.init();
    this.loaded = false;
    // console.log(chartDataProcessor.weekSiteUsageLineChart("www.facebook.com"));
    this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(true);
    this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart();
    this.loaded = true;
    // getTimeTable(response => {
    //   this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(true, response);
    //   this.weekChartData.watchSitesLine = await chartDataProcessor.weekWatchSitesLineChart(response, watchSites);
    //   this.loaded = true;
    // getWatchSites().then((watchSites) => {
    //   this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart(response, watchSites);
    // })
    // this.PieChartDayData = chartDataProcessor.dayChartPieData(new Date(), response, 10);
    // this.LineChartData = chartDataProcessor.weekTopNSitesLineChartData(new Date(), 5, response);
    // this.PieChartWeekData = chartDataProcessor.weekChartPieData(new Date(), response, 10);
    // var data = chartDataProcessor.weekChartBarData(new Date(), response);
    // console.log(data);
    // this.StackedBarWeekChartData = data;

    // });
  },
  components: { LineChart, PieChart, StackedBarChart },
};
</script>
