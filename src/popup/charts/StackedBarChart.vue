<script>
import { Bar } from 'vue-chartjs';
import Chart from 'chart.js';

export default {
  extends: Bar,
  props: {
    chartdata: { type: Object, default: null },
    options: {
      default: {
        legend: {
          display: true,
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(t, d) {
              return t.yLabel;
            },
          },
        },
        responsive: true,
        scales: {
          xAxes: [
            {
              stacked: true,
            },
          ],
          yAxes: [
            {
              stacked: true,
            },
          ],
        },
      },
    },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
