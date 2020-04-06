<script>
import { Pie } from 'vue-chartjs';
import Chart from 'chart.js';

export default {
  extends: Pie,
  props: {
    chartdata: { type: Object, default: null },
    options: { default: Chart.defaults.doughnut },
  },
  mounted() {
    console.log(this.chartdata);
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
