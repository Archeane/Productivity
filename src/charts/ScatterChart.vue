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
import { Scatter, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;
export default {
  extends: Scatter,
  mixins: [reactiveProp],
  props: {
    chartdata: { type: Object, default: null },
  },
  data: function() {
    return {
      options: {
        chart: {
          height: '100%',
        },
        plugins: {
          datalabels: { display: false },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              // ticks: {
              // callback: function(val, index, values) {
              //   console.log(val, index, values)
              //   return moment(val).format('MM/DD');
              // },
              type: 'time',
              time: {
                unit: 'day',
                stepSize: 1,
                displayFormats: {
                  millisecond: 'MMM DD',
                  second: 'MMM DD',
                  hour: 'MMM DD',
                  day: 'MMM DD',
                },
              },
              // },
            },
          ],
          yAxes: [
            {
              ticks: {
                reverse: true,
                stepSize: 60,
                callback: function(label, index, labels) {
                  return moment(parseInt(Math.round(label / 60)), ['HH']).format('h A');
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
