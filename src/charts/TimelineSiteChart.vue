<template>
  <div class="example">
    <apexcharts width="500" height="300" type="rangeBar" :options="chartOptions" :series="series"></apexcharts>
  </div>
</template>

<script>

// top 10 sites of day usage pattern
import VueApexCharts from 'vue-apexcharts';

export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
      chartSeries: {type: Array, default: []}
  },
  data: function() {
      console.log(this.chartSeries);
    return {
      chartOptions: {
        chart: {
          type: 'rangeBar',
        },
        plotOptions: {
          bar: {
            horizontal: true,
            width: '150%',
          },
        },
        xaxis: {
          type: 'datetime',
        },
        stroke: {
              width: 1
            },
      },
      series: this.chartSeries
    };
  },
}
