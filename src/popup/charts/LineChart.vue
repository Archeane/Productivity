<script>
import Chart from 'chart.js';
import { Line } from 'vue-chartjs';
export default {
  extends: Line,
  props: {
    chartdata: { type: Object, default: null },
    options: { default: Chart.defaults.line },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
