<script>
import { Doughnut } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js';

export default {
  extends: Doughnut,
  components: {
    ChartJsPluginDataLabels,
  },
  props: {
    chartdata: { type: Object, default: null },
    options: {
      // Chart.defaults.Doughnut
      default: {
        plugins: {
          datalabels: {
            formatter: function(value, context) {
              var label = context.chart.data.labels[context.dataIndex];
              var minutes = context.dataset.data[context.dataIndex];
              var percentage =
                (minutes * 100) /
                context.dataset.data.reduce((a, b) => {
                  return a + b;
                });
              if (percentage > 10) return [label, minutes + ' mins'];
              else return label;
            },
          },
        },
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true,
        },
        rotation: 1 * Math.PI,
        circumference: 1 * Math.PI,
        maintainAspectRatio: true,
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var label = data.labels[tooltipItem.index];
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                return previousValue + currentValue;
              });
              //get the concerned dataset
              var dataset = data.datasets[tooltipItem.datasetIndex];
              //calculate the total of this data set
              var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
                return previousValue + currentValue;
              });
              //get the current items value
              var currentValue = dataset.data[tooltipItem.index];
              //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
              var percentage = Math.floor((currentValue / total) * 100 + 0.5);

              return [currentValue + ' mins , \t' + percentage + '%'];
            },
          },
        },
      },
    },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
