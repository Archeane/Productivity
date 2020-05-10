<template>
  <apexcharts type="heatmap" :options="chartOptions" :series="series"></apexcharts>
</template>

<script>
// top 10 sites of day usage pattern
import VueApexCharts from 'vue-apexcharts';
import moment from 'moment';
export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
    chartSeries: { type: Array, default: [] },
  },
  data: function() {
    return {
      chartOptions: {
        chart: {
          type: 'heatmap',
        },
        dataLabels: { enabled: false },
        colors: ['#008FFB'],
        yaxis: {
          reversed: true,
          labels: {
            formatter: function(value, timestamp) {
              return moment(value, ['HH']).format('h A');
            },
          },
        },
        tooltip: {
          y: {
            formatter: function(value) {
              return value + ' mins';
            },
          },
        },
      },
      series: this.chartSeries,
    };
  },
};
</script>
