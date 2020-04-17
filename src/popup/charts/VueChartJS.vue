<template>
  <section class="container">
    <!-- <line-chart v-if="loaded" :chartdata="LineChartData" />
    <pie-chart v-if="loaded" :chartdata="PieChartDayData" />
    <pie-chart v-if="loaded" :chartdata="PieChartWeekData" /> -->
    <!-- <timeline-chart v-if="loaded" :chartSeries="TimelineChartData" /> -->
    <timeline-chart v-if="loaded" :data="DayTimelineChartData" />
  </section>
</template>
<script>
import LineChart from './LineChart';
import PieChart from './PieChart';
import TimelineChart from './TimelineChart';
import { ChartData, getTimeTable } from '../../js/data.js';

let chartDataProcessor = new ChartData();

export default {
  name: 'VueChartJS',
  data: () => ({
    loaded: false,
    PieChartDayData: null,
    PieChartWeekData: null,
    LineChartData: null,
    TimelineChartData: null,
    DayTimelineChartData: null,
  }),
  async mounted() {
    this.loaded = false;
    getTimeTable(response => {
      this.PieChartDayData = chartDataProcessor.dayChartPieData(new Date(), response, 10);
      this.LineChartData = chartDataProcessor.weekTopNSitesLineChartData(new Date(), 5, response);
      this.PieChartWeekData = chartDataProcessor.weekChartPieData(new Date(), response, 10);
      this.TimelineChartData = chartDataProcessor.getDaySiteIntervals(new Date(), response);
      this.DayTimelineChartData = chartDataProcessor.getDayIntervals(new Date(), response);
      console.log(this.DayTimelineChartData);
      // [
      //   { id: 1, content: "item 1", start: "2014-04-20", end: "2014-04-21"},
      //   { id: 3, content: "item 3", start: "2014-04-18" , end: "2014-04-19"},
      //   { id: 4, content: "item 4", start: "2014-04-16", end: "2014-04-19" },
      //   { id: 5, content: "item 5", start: "2014-04-25", end: "2014-04-28"},
      // ]
      this.loaded = true;
    });
  },
  components: { LineChart, PieChart, TimelineChart },
};
</script>
