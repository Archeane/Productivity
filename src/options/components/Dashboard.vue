<template>
  <section class="container">
    <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" />
    <line-chart v-if="loaded" :chartdata="LineChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" />
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
import PieChart from '../../charts/PieChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData, getTimeTable } from '../../js/data.js';

let chartDataProcessor = new ChartData();

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
    PieChartDayData: null,
    PieChartWeekData: null,
    LineChartData: null,
    StackedBarWeekChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      this.PieChartDayData = chartDataProcessor.dayChartPieData(new Date(), response, 10);
      this.LineChartData = chartDataProcessor.weekTopNSitesLineChartData(new Date(), 5, response);
      this.PieChartWeekData = chartDataProcessor.weekChartPieData(new Date(), response, 10);
      var data = chartDataProcessor.weekChartBarData(new Date(), response);
      console.log(data);
      this.StackedBarWeekChartData = data;
      this.loaded = true;
    });
  },
  components: { LineChart, PieChart, StackedBarChart },
};
</script>
