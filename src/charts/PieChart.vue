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
    chartSeries: { type: Array },
    chartLabels: { type: Array },
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
</script>
