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
  },
  data: () => {
    // Chart.defaults.Doughnut
    return {
      options: {
        plugins: {
          datalabels: {
            formatter: function(value, context) {
              const url = context.chart.data.labels[context.dataIndex];
              //var favicon = `https://s2.googleusercontent.com/s2/favicons?domain=${url}`;
              var label = url.replace(/([.]\w+)$/, '').replace(/^www\./, '');
              var minutes = context.dataset.data[context.dataIndex];
              var percentage =
                (minutes * 100) /
                context.dataset.data.reduce((a, b) => {
                  return a + b;
                });
              if (percentage > 20) {
                var h = (minutes / 60) | 0,
                  m = minutes % 60 | 0;
                return label;
                // return [label, `${h} hrs ${m} mins`];
              } else if (percentage >= 5) {
                return minutes;
              } else return '';
            },
          },
        },
        legend: {
          display: false,
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
              var label = data.labels[tooltipItem.index].replace(/([.]\w+)$/, '').replace(/^www\./, '');
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
              var percentage = Math.floor((currentValue / total) * 100 + 0.5);
              var h = (currentValue / 60) | 0,
                m = currentValue % 60 | 0;
              return [`${label} \n ${h} hrs ${m} mins, ${percentage} %`];
            },
          },
        },
      },
    };
  },
  mounted() {
    console.log(this.options);
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
