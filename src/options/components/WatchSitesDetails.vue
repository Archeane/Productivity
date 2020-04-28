<template>
  <v-container class="grey lighten-5">
    <v-row>
      <v-col cols="6">
        <v-row>
          <v-col cols="12">
            <v-card>
              <timeline-site-chart v-if="loaded" :chartSeries="sitesIntervals" />
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title>Usage Stats Week of {{ new Date().getMonth() }}</v-card-title>
              <v-data-table v-if="loaded" :headers="tableHeaders" :items="tableItems" multi-sort class="elevation-1" dense></v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <scatter-chart v-if="loaded" :chartdata="sitesVisitsScatter" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import TimelineSiteChart from '../../charts/TimelineSiteChart';
import ScatterChart from '../../charts/ScatterChart';
import LineChart from '../../charts/LineChart';

export default {
  name: 'VueChartJS',
  data: () => ({
    search: '',
    tableHeaders: [
      {
        text: 'Url',
        aligh: 'start',
        value: 'name',
      },
      { text: 'Total time', value: 'total' },
      { text: 'Visit frequency', value: 'frequency' },
      { text: 'Avg mins per visit', value: 'timePerVist' },
      { text: 'Avg visits per day', value: 'freqDay' },
      { text: 'Avg mins btw visits', value: 'timeBtwVisit' },
    ],
    chartDataProcessor: new ChartData(),
    loaded: false,
    tableItems: null,
    sitesIntervals: null,
    sitesVisitsScatter: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.tableItems = this.chartDataProcessor.timeFrameWatchSitesUsageFrequency(-2, -1);
    this.sitesIntervals = this.chartDataProcessor.daySitesTimeline(
      moment()
        .subtract(1, 'd')
        .toDate(),
      null,
      null,
      true
    );
    console.log(this.sitesIntervals);
    this.sitesVisitsScatter = this.chartDataProcessor.weekSiteVisitScatter(
      moment()
        .subtract(1, 'd')
        .toDate(),
      null,
      true
    );
    console.log(this.sitesVisitsScatter);

    this.loaded = true;
  },
  methods: {
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
  },
  components: { TimelineSiteChart, ScatterChart },
};
</script>
