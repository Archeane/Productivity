<script>
/*
import VueApexCharts from 'vue-apexcharts';

export default {
  components: {
    apexcharts: VueApexCharts,
  },
  props: {
    chartSeries: { type: Array },
  },
  data: function() {
    console.log(this.chartSeries);
    return {
      chartOptions: {
        chart: {
          height: 350,
          type: 'scatter',
          animations: {
            enabled: true,
          },
          zoom: {
            type: 'xy',
          },
          xaxis: {
            labels: {
                formatter: function(value){
                    console.log(value);
                    return new Date(value);
                }
            }
          }
        },
      },
      series: this.chartSeries,
    };
  },
};
*/
import Chart from 'chart.js';
import moment from 'moment';
import { Scatter } from 'vue-chartjs';
export default {
  extends: Scatter,
  props: {
    chartdata: { type: Object, default: null },
  },
  data: function() {
    return {
      options: {
        scales: {
          xAxes: [
            {
              ticks: {
                type: 'linear',
                callback: function(val, index, values) {
                  return moment(val).format('MM/DD');
                },
              },
            },
          ],
          yAxes: [
            {
              type: 'time',
              unit: 'hour',
              distribution: 'linear',
              time: {
                stepSize: 1,
              },
            },
          ],
        },
      },
    };
  },
  mounted() {
    console.log(this.chartdata);
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
