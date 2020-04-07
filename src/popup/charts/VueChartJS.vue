<template>
  <section class="container">
    <line-chart v-if="loaded" :chartdata="LineChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartData" />
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
    PieChartData: null,
    LineChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      var data = chartDataProcessor.dayChartPieData(null, response);
      this.PieChartData = data;
      var data_array = chartDataProcessor.weekSiteDataArray(new Date(), 'www.google.com', response);
      console.log(data_array);
      this.LineChartData = {
        labels: ['mon', 'tue'],
        datasets: [
          {
            data: data_array,
            label: 'www.google.com',
            borderColor: '#3e95cd',
            fill: false,
          },
        ],
      };
      this.loaded = true;
    });
  },
  components: { LineChart, PieChart },
};
</script>
