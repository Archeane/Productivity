<template>
  <section class="container">
    <!-- <v-card>
      <v-card-title>
        Usage Stats Week of {{ new Date().getMonth() }}
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>

      <v-data-table v-if="loaded" :headers="tableHeaders" :items="weekChartData.usageFrequencyTable" :search="search" multi-sort class="elevation-1"></v-data-table>
    </v-card>-->
    <stacked-bar-chart v-if="loaded" :chartdata="weekChartData.stackedBar" />
    <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" />

    <!-- <DashboardLineChartContainer :loaded="loaded" :chartDataProcessor="chartDataProcessor" /> -->

    <!-- <v-card
      class="mx-auto"
      max-width="800"
      raised=true
        >
        <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
            <v-tab :key="weekTotalLine">Total time</v-tab>
            <v-tab :key="weekWatchLine">Watch sites time</v-tab>
            <v-tab :key="weekSitesLine">Specific sites</v-tab>
            <v-btn-toggle
                v-model="toggle_exclusive"
                color="primary"
                mandatory>
                <v-btn :value="1" text>
                    week
                </v-btn>
                <v-btn :value="2" text>
                    month
                </v-btn>
            </v-btn-toggle>
            <v-tab-item :key="weekTotalLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.totalLine" />
                </v-container>
            </v-tab-item>
            <v-tab-item :key="weekWatchLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.watchSitesLine" />
                </v-container>
            </v-tab-item>
            <v-tab-item :key="weekSitesLine">
                <v-container fluid>
                <line-chart v-if="loaded" :chartdata="weekChartData.sitesLine" />
                </v-container>
            </v-tab-item>
        </v-tabs>
    </v-card> -->

    <!-- <timeline-chart v-if="loaded" :data="TimelineChart" /> -->
    <!-- <timeline-site-chart v-if="loaded" :chartSeries="SitesIntervals" /> -->
    <!-- <radar-chart v-if="loaded" :chartdata="weekChartData.watchSitesRadar" /> -->
    <!-- <pie-chart v-if="loaded" :chartSeries="PieChartDaySeries" :chartLabels="PieChartDayLabels" /> -->
    <!-- <pie-chart v-if="loaded" :chartSeries="weekChartData.seriesPie" :chartLabels="weekChartData.labelsPie" /> -->
  </section>
</template>
<script>
import LineChart from '../../charts/LineChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData } from '../../js/data.js';

import DashboardLineChartContainer from './DashboardLineChartContainer';

// import RadarChart from '../../charts/RadarChart';
// import ScatterChart from '../../charts/ScatterChart';
// import PieChart from '../../charts/PieChart';
// import TimelineSiteChart from '../../charts/TimelineSiteChart';
// import TimelineChart from '../../charts/TimelineChart';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    tableHeaders: [
      {
        text: 'Url',
        aligh: 'start',
        value: 'name',
      },
      { text: 'Total Time', value: 'total' },
      { text: 'Visit Frequency', value: 'frequency' },
      { text: 'Avg Time Per Visit (mins)', value: 'timePerVist' },
    ],
    weekChartData: {
      totalLine: null,
      watchSitesLine: null,
      sitesLine: null,
      seriesPie: null,
      labelsPie: null,
      halfDonut: null,
      watchSitesRadar: null,
      stackedBar: null,
      usageFrequencyTable: null,
      sitesVisitsScatter: null,
    },
    TimelineChart: null,
    PieChartDaySeries: null,
    PieChartDayLabels: null,
    SitesIntervals: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();
    // this.weekChartData.totalLine = chartDataProcessor.weekTotalTimeLineChart(false);
    // this.weekChartData.watchSitesLine = chartDataProcessor.weekWatchSitesLineChart();
    // this.weekChartData.sitesLine = chartDataProcessor.weekSiteUsageLineChart(['www.facebook.com', 'www.bilibili.com']);
    this.weekChartData.stackedBar = this.chartDataProcessor.weekChartStackedBarData();
    this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData();
    console.log(this.weekChartData.halfDonut);
    // var PieChartDayData = chartDataProcessor.dayChartPieData();
    // this.PieChartDaySeries = PieChartDayData.series;
    // this.PieChartDayLabels = PieChartDayData.labels;
    // var PieChartWeekData = chartDataProcessor.weekChartPieData();
    // this.weekChartData.seriesPie = PieChartWeekData.series;
    // this.weekChartData.labelsPie = PieChartWeekData.labels;
    // this.weekChartData.watchSitesRadar = chartDataProcessor.nWeeksWatchSitesChartRadar(1);
    // var yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);
    // this.SitesIntervals = chartDataProcessor.daySitesTimeline(yesterday, null, null, true);
    // this.weekChartData.usageFrequencyTable = chartDataProcessor.weekSitesUsageFrequency();
    // this.TimelineChart = chartDataProcessor.dayTimeline();
    // this.weekChartData.sitesVisitsScatter = chartDataProcessor.weekSiteVisitScatter(null, null, true);
    // console.log(this.weekChartData.sitesVisitsScatter);
    this.loaded = true;
  },
  components: { LineChart, HalfDonutChart, StackedBarChart, DashboardLineChartContainer },
};
</script>
