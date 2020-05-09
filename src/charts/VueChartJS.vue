<template>
  <section class="container">
    <!-- <stacked-bar-chart v-if="loaded" :chartdata="StackedBarWeekChartData" /> -->
    <!-- <line-chart v-if="loaded" :chartdata="LineChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" />
    <timeline-chart v-if="loaded" :chartSeries="TimelineSiteChartData" />
    <timeline-chart v-if="loaded" :data="DayTimelineChartData" /> -->
  </section>
</template>
<script>
/*
import LineChart from './LineChart';
import PieChart from './PieChart';
import TimelineChart from './TimelineChart';
import TimelineSiteChart from './TimelineSiteChart';
import StackedBarChart from './StackedBarChart';
import { ChartData, getTimeTable } from '../js/data.js';

let chartDataProcessor = new ChartData();

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
    PieChartDayData: null,
    PieChartWeekData: null,
    LineChartData: null,
    TimelineSiteChartData: null,
    DayTimelineChartData: null,
    StackedBarWeekChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      this.PieChartDayData = chartDataProcessor.dayChartPieData(new Date(), response, 10);
      this.LineChartData = chartDataProcessor.weekTopNSitesLineChartData(new Date(), 5, response);
      this.PieChartWeekData = chartDataProcessor.weekChartPieData(new Date(), response, 10);
      this.TimelineSiteChartData = chartDataProcessor.daySitesTimeline(new Date(), response);
      this.DayTimelineChartData = chartDataProcessor.dayTimeline(new Date(), response);
      var data = chartDataProcessor.weekChartBarData(new Date(), response);
      console.log(data);
      this.StackedBarWeekChartData = data;
      this.loaded = true;
    });
  },
  components: { LineChart, PieChart, TimelineChart, StackedBarChart },
};
*/
</script>
