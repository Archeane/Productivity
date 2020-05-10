<script>
import { Bar } from 'vue-chartjs';
import Chart from 'chart.js';
//import ChartDataLabels from 'chartjs-plugin-datalabels';
import moment from 'moment';
export default {
  extends: Bar,
  props: {
    chartdata: { type: Object, default: null },
  },
  data: () => {
    return {
      options: {
        plugins: {
          datalabels: {
            display: false,
          },
        },
        legend: {
          display: false,
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(t, d) {
              if (t.yLabel != 0) {
                var h = Math.floor(t.yLabel / 60),
                  m = t.yLabel % 60;
                return `${d.datasets[t.datasetIndex].label}: ${h} hrs ${m} mins`;
              }
            },
          },
        },
        responsive: true,
        scales: {
          xAxes: [
            {
              stacked: true,
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
              stacked: true,
              ticks: {
                beginAtZero: true,
                min: 0,
                stepSize: 120,
                callback: function(label, index, labels) {
                  return label / 60 + ' hrs ';
                },
              },
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
