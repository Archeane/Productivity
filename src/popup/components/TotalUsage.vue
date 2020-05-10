<template>
  <v-container>
    <pie-chart v-bind:chartSeries="pieSeries" v-bind:chartLabels="pieLabels" />
  </v-container>
</template>
<script>
import PieChart from '../../charts/PieChart';

export default {
  components: {
    PieChart,
  },
  data: () => {
    return {
      loaded: false,
      chartData: new ChartData(),
      pieSeries: null,
      pieLabels: null,
      tableData: null,
      tableHeaders: [
        {
          text: 'Url',
          align: 'start',
          value: 'name',
        },
        {
          text: 'Total time',
          value: 'total',
        },
        {
          text: 'Visit freq',
          value: 'frequency',
        },
      ],
    };
  },
  async mounted() {
    this.loaded = false;
    await this.chartData.init();
    // this.currentTab = await getCurrentTab();
    const pieData = this.chartData.dayChartPieData();
    this.pieSeries = pieData.series;
    this.pieLabels = pieData.labels;
    console.log(this.pieSeries, this.pieLabels);
    this.tableData = this.chartData.dayUsageTable();
    console.log(this.tableData);
    this.loaded = true;
  },
  props: {
    pieSeries: Array,
    pieLabels: Array,
  },
};
</script>
