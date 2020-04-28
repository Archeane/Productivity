<script>
import Chart from 'chart.js';
import moment from 'moment';
import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartdata: { type: Object, default: null },
    options: {
      type: Object,
      default: () => ({
        plugins: {
          datalabels: {
            display: false,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                callback: function(label, index, labels) {
                  return moment(label).format('MM/DD');
                },
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
              },
              ticks: {
                beginAtZero: true,
                min: 0,
                stepSize: 60,
                callback: function(label, index, labels) {
                  return label / 60 + ' Hrs ';
                },
              },
            },
          ],
        },
      }),
    },
  },
  mounted() {
    this.lineChart = this.renderChart(this.chartdata, this.options);
  },
};
</script>
