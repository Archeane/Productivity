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
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
