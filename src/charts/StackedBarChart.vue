<script>
import { HorizontalBar } from 'vue-chartjs';
import ChartJsPluginDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js';
import moment from 'moment';
export default {
  extends: HorizontalBar,
  components: {
    ChartJsPluginDataLabels,
  },
  props: {
    chartdata: { type: Object, default: null },
  },
  data: () => {
    return {
      options: {
        plugins: {
          datalabels: {
            formatter: function(value, context) {
              console.log(value, context);
              return context.chart.data.labels[context.dataIndex];
            },
            // display: true,
          },
        },
        legend: {
          display: false,
        },
        tooltips: {
          mode: 'label',
          callbacks: {
            label: function(t, d) {
              var h = Math.floor(t.x / 60),
                m = Math.floor(t.x % 60);
              if (h > 0) return `${d.datasets[t.datasetIndex].label}: ${h} hrs ${m} mins`;
              else return `${d.datasets[t.datasetIndex].label}: ${m} mins`;
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              stacked: true,
              gridLines: {
                display: false,
              },
              ticks: {
                reverse: true,
                callback: function(label, index, labels) {
                  return moment(label).format('MM/DD');
                },
              },
            },
          ],
          xAxes: [
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
