<template>
  <apexcharts type="donut" :options="chartOptions" :series="series"></apexcharts>
</template>
<script>
import VueApexCharts from 'vue-apexcharts';

export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
    chartSeries: { type: Array, default: [] },
    chartLabels: { type: Array, default: [] },
  },
  data: function() {
    return {
      chartOptions: {
        labels: this.chartLabels,
        chart: {
          type: 'donut',
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  showAlways: true,
                  show: true,
                },
              },
            },
          },
        },
        dataLabels: {
          formatter(val, opts) {
            console.log(val, opts);
            const name = opts.w.globals.labels[opts.seriesIndex];
            const minutes = opts.w.globals.series[opts.seriesIndex].toString() + ' mins';
            return [name, minutes];
          },
        },
        theme: {
          palette: 'palette1',
        },
        legend: {
          show: false,
          total: {
            show: true,
          },
        },
        responsive: [
          {
            breakpoint: 480,
          },
        ],
      },
      series: this.chartSeries,
    };
  },
};

/*
import { Doughnut } from 'vue-chartjs';
import Chart from 'chart.js';

export default {
  extends: Doughnut,
  props: {
    chartdata: { type: Object, default: null },
    options: {
      default: {
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        maintainAspectRatio: true,
        elements: {
          center: { text: '40%' },
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                return previousValue + currentValue;
              });
              //get the concerned dataset
              var dataset = data.datasets[tooltipItem.datasetIndex];
              //calculate the total of this data set
              var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                return previousValue + currentValue;
              });
              //get the current items value
              var currentValue = dataset.data[tooltipItem.index];
              //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
              var percentage = Math.floor((currentValue / total) * 100 + 0.5);

              return percentage + '%';
            },
          },
        },
      },
    },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
*/
</script>
