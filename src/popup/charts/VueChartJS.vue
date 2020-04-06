<template>
  <section class="container">
    <line-chart v-if="loaded" :chartdata="chartData" :options="chartOptions" />
    <pie-chart v-if="loaded" :chartdata="chartData" />
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
    chartData: null,
    chartOptions: options,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      var data = chartDataProcessor.dayChartPieData(null, response);
      this.chartData = data;
      this.loaded = true;
      console.log(this.chartData);
    });
  },
  components: { LineChart, PieChart },
};
</script>
