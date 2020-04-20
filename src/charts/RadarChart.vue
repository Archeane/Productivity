<script>
import { Radar } from 'vue-chartjs';
import Chart from 'chart.js';

export default {
  extends: Radar,
  props: {
    chartdata: { type: Object, default: null },
    options: { default: Chart.defaults.radar },
  },
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
