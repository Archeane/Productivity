<script>
import { Radar } from 'vue-chartjs';
import Chart from 'chart.js';

export default {
  extends: Radar,
  props: {
    chartdata: { type: Object, default: null },
  },
  data: () => {
    return {
      options: {
        title: { display: false },
        scale: {
          ticks: {
            beginAtZero: true,
            stepSize: null,
          },
        },
        tooltips: {
          enabled: true,
        },
        plugins: {
          datalabels: {
            display: false,
          },
        },
      },
    };
  },
  mounted() {
    var numDigits = x => {
      return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
    };
    var scaleRound = num => {
      var multiplier = Math.pow(10, numDigits(num) - 1);
      return Math.round(num / multiplier) * multiplier;
    };
    try {
      var scales = [];
      for (let dataset of this.chartdata.datasets) scales.push(...dataset.data);
      this.options.scale.ticks.stepSize = scaleRound(Math.max(scales) / 4);
    } catch (e) {
      console.log(e);
    }
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
