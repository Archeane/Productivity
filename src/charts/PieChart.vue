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
    chartSeries: Array,
    chartLabels: Array,
  },
  data: function() {
    console.log('???');
    // console.log(this.chartSeries);
    // console.log(this.chartLabels);
    return {
      chartOptions: {
        labels: this.chartLabels, //["luoxia", "youtube", "stackoverflow", "google", "personality", "vueifyjs"],
        chart: {
          type: 'donut',
          height: '50%',
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
        // responsive: [
        //   {
        //     breakpoint: 480,
        //   },
        // ],
      },
      series: this.chartSeries, //[84,37,10,9,2,1]
    };
  },
};
</script>
