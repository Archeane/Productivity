<script>
import { Bar } from 'vue-chartjs';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default {
  extends: Bar,
  props: {
    chartdata: { type: Object, default: null },
  },
  data: () => {
    return {
      options: {
        legend: {
          display: false,
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(t, d) {
              if (t.yLabel != 0) {
                return d.datasets[t.datasetIndex].label + ':  ' + t.yLabel + ' mins';
              }
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
              ticks: {
                beginAtZero: true,
              },
              stacked: true,
            },
          ],
        },
      },
    };
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
