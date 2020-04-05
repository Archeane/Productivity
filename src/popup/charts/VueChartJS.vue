<template>
  <section class="container">
    <h1>Demo examples of vue-chartjs</h1>
    <div class="columns">
      <div class="column">
        <h3>Line Chart</h3>
        <line-chart v-if="loaded" :chartdata="chartData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>

<script>
import LineChart from './LineChart';
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
      console.log(data);
      this.chartData = data;
      this.loaded = true;
      console.log(this.chartData);
    });
  },
  components: { LineChart },
};
</script>
