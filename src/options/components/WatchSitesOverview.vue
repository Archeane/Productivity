<template>
  <v-container class="grey lighten-5">
    <radar-chart v-if="loaded" :chartdata="weekRadar" />
    <line-chart :chartdata="weekLine" />
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import RadarChart from '../../charts/RadarChart';
import PieChart from '../../charts/PieChart';
import LineChart from '../../charts/LineChart';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    weekRadar: null,
    weekLine: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();
    this.weekRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    this.weekLine = this.chartDataProcessor.weekWatchSitesLineChart();
    this.loaded = true;
  },
  methods: {},
  components: { LineChart, RadarChart },
};
</script>
