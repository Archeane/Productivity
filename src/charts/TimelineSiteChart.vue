<template>
  <apexcharts type="rangeBar" :options="chartOptions" :series="series"></apexcharts>
</template>

<script>
// top 10 sites of day usage pattern
import VueApexCharts from 'vue-apexcharts';

export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
    chartSeries: { type: Object, default: {} },
  },
  data: function() {
    console.log(this.chartSeries);
    return {
      chartOptions: {
        chart: {
          type: 'rangeBar',
          defaultLocale: 'en',
          height: '80%',
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '60%',
            columnWidth: '60%',
          },
        },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
          },
        },
        stroke: {
          width: 1,
        },
        fill: {
          type: 'solid',
          opacity: 0.6,
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
        },
        tooltip: {
          enabled: true,
          x: { show: true, format: 'HH:mm' },
          y: {
            title: {
              formatter: function(seriesName) {
                return '';
              },
            },
          },
          theme: 'dark',
        },
      },
      series: this.chartSeries,
    };
  },
};
</script>
