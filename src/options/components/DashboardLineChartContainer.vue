<template>
  <v-card v-if="loaded" class="mx-auto" max-width="800" raised="true">
    <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
      <v-tab :key="weekTotalLine">Total time</v-tab>
      <v-tab :key="weekWatchLine">Watch sites time</v-tab>
      <v-tab :key="weekSitesLine">Specific sites</v-tab>
      <v-btn-toggle v-model="toggle_exclusive" color="primary" mandatory>
        <v-btn :value="1" text>week</v-btn>
        <v-btn :value="2" text>month</v-btn>
      </v-btn-toggle>
      <v-tab-item :key="weekTotalLine">
        <v-container fluid>
          <line-chart :chartdata="LineChartData.weekTotal" />
        </v-container>
      </v-tab-item>
      <v-tab-item :key="weekWatchLine">
        <v-container fluid>
          <line-chart :chartdata="LineChartData.weekWatch" />
        </v-container>
      </v-tab-item>
      <v-tab-item :key="weekSitesLine">
        <v-container fluid>
          <line-chart :chartdata="LineChartData.weekSites" />
        </v-container>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script>
import LineChart from '../../charts/LineChart';
export default {
  props: {
    chartDataProcessor: null,
    loaded: false,
  },
  data: () => {
    return {
      LineChartData: {
        totalLine: this.chartDataProcessor.weekTotalTimeLineChart(false),
        watchSitesLine: this.chartDataProcessor.weekWatchSitesLineChart(),
        sitesLine: this.chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']),
      },
    };
  },
};
</script>
