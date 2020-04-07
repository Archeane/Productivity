<template>
  <section class="container">
    <line-chart v-if="loaded" :chartdata="LineChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" />
  </section>
</template>

<script>
import LineChart from './LineChart';
import PieChart from './PieChart';
import { ChartData, getTimeTable } from '../../js/data.js';

let chartDataProcessor = new ChartData();
const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
        gridLines: {
          display: true,
        },
      },
    ],
    xAxes: [
      {
        gridLines: {
          display: false,
        },
      },
    ],
  },
  legend: {
    display: true,
  },
  responsive: true,
  maintainAspectRatio: false,
};

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
    PieChartDayData: null,
    PieChartWeekData: null,
    LineChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      this.PieChartDayData = chartDataProcessor.dayChartPieData(null, response);
      this.LineChartData = chartDataProcessor.weekTopNSitesLineChartData(new Date(), 5, response);
      this.loaded = true;
    });
  },
  components: { LineChart, PieChart },
};
</script>
