<template>
  <apexcharts type="donut" :options="chartOptions" :series="series" height="250"></apexcharts>
</template>
<script>
import VueApexCharts from 'vue-apexcharts';

export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
    chartSeries: Array,
    chartLabels: Array,
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
            //console.log(val, opts);
            const name = opts.w.globals.labels[opts.seriesIndex].replace(/([.]\w+)$/, '').replace(/^www\./, '');
            // const minutes = opts.w.globals.series[opts.seriesIndex].toString() + ' mins';
            return name;
          },
        },
        tooltip: {
          y: {
            formatter: (val, opts) => {
              const total = opts.globals.series.reduce((a, b) => {
                return a + b;
              });
              const percentage = Math.floor((val / total) * 100);
              return `${val} mins, ${percentage} %`;
            },
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
      },
      series: this.chartSeries,
    };
  },
};
</script>
