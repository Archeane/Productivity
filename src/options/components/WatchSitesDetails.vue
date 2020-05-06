<template>
  <v-container fluid fill-height>
    <h2 class="font-weight-light">Watch Sites Details</h2>
    <v-row>
      <v-col cols="6">
        <v-row>
          <v-col cols="12">
            <v-card v-if="loaded" max-height="55vh">
              <v-row dense style="height: 5vh;">
                <v-col cols="6">
                  <v-row align="start" justify="start">
                    <v-card-title class="ml-3">Day Timeline</v-card-title>
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field :value="timelineDate" v-on="on" dense readonly outlined style="max-width: 6.5rem;" class="mt-3"></v-text-field>
                      </template>
                      <v-date-picker v-model="timelineDate" no-title></v-date-picker>
                    </v-menu>
                  </v-row>
                </v-col>
                <v-col offset="3" cols="3">
                  <v-row align="start" justify="start" class="mt-3">
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="timelineTimeStart" :value="timelineTimeStart" v-on="on" readonly dense style="max-width: 3rem;"></v-text-field>
                      </template>
                      <v-time-picker v-model="timelineTimeStart" :max="timelineTimeEnd" ampm-in-title scrollable></v-time-picker>
                    </v-menu>
                    <v-card-subtitle>to</v-card-subtitle>
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="timelineTimeEnd" :value="timelineTimeEnd" v-on="on" readonly dense style="max-width: 3rem"></v-text-field>
                      </template>
                      <v-time-picker v-model="timelineTimeEnd" :min="timelineTimeStart" ampm-in-title scrollable></v-time-picker>
                    </v-menu>
                  </v-row>
                </v-col>
              </v-row>
              <div v-if="sitesIntervals.data.length > 0" style="max-height: 50vh;">
                <timeline-site-chart :chartSeries="sitesIntervals" :key="sitesIntervals" style="height: 50vh;" />
              </div>
              <v-card-subtitle v-else>You didn't visit any watch sites for more than 5 minutes today 🏆</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card>
              <v-row align="start" class="ml-1 mr-1" style="max-height: 6vh;">
                <v-card-title>Usage Stats</v-card-title>
                <v-menu>
                  <template v-slot:activator="{ on }">
                    <v-text-field v-on="on" dense readonly outlined v-model="tableDateRangeText" style="max-width: 13.5rem;" class="ml-auto mt-2 mr-2"></v-text-field>
                  </template>
                  <v-date-picker v-model="tableDateRange" no-title range></v-date-picker>
                </v-menu>
              </v-row>
              <v-data-table max-height="34vh" v-if="loaded" :headers="tableHeaders" :items="tableItems" :key="tableItems" multi-sort class="elevation-1" dense></v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="6">
        <v-card v-if="loaded" max-height="90vh">
          <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
            <v-tab>Visit Frequency</v-tab>
            <v-tab>Visit Density</v-tab>
            <v-menu>
              <template v-slot:activator="{ on }">
                <v-text-field :value="visitCardDate" v-on="on" dense readonly outlined style="max-width: 6.5rem;" class="mt-2 mr-2"></v-text-field>
                <span class="title ml-auto mr-2 mt-3" style="color: black">Week of</span>
              </template>
              <v-date-picker v-model="visitCardDate" no-title></v-date-picker>
            </v-menu>
            <v-tab-item>
              <v-container fluid>
                <scatter-chart :chartdata="sitesVisitsScatter" :key="sitesVisitsScatter" />
              </v-container>
            </v-tab-item>
            <v-tab-item>
              <v-container fluid>
                <v-radio-group row v-model="heatmapSite">
                  <v-radio v-for="url in heatmapSitesItems" :label="url" :value="url" :key="url"></v-radio>
                </v-radio-group>
                {{ heatmapSite }}
                <v-text-field label="Other..." v-model="heatmapSite" solo></v-text-field>
                <heat-map :chartSeries="sitesVisitsHeatmap" :key="sitesVisitsHeatmap" />
              </v-container>
            </v-tab-item>
          </v-tabs>
        </v-card>
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
import HeatMap from '../../charts/HeatMap';

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
    tableDateRange: [
      moment()
        .subtract('2', 'd')
        .format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD'),
    ],
    // watchSitesSorted: null,
    timelineDate: moment().format('YYYY-MM-DD'),
    timelineTimeStart: '00:00',
    timelineTimeEnd: '23:59',
    visitCardDate: moment().format('YYYY-MM-DD'),
    heatmapData: null,
    heatmapSitesItems: [],
    heatmapSite: null,
    chartDataProcessor: new ChartData(),
    loaded: false,
    tableItems: null,
    sitesIntervals: null,
    sitesVisitsScatter: null,
    sitesVisitsHeatmap: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.tableItems = this.chartDataProcessor.timeFrameWatchSitesUsageFrequency(-3, 0);
    // this.watchSitesSorted = Array.from(this.tableItems.sort((a,b) => {return b["total"] - a["total"]}), x => x["name"])

    var start = moment(this.timelineDate + ' ' + this.timelineTimeStart).toDate();
    var end = moment(this.timelineDate + ' ' + this.timelineTimeEnd).toDate();
    this.sitesIntervals = this.chartDataProcessor.daySitesTimeline(moment(this.timelineDate).toDate(), [start, end], null, true);

    this.sitesVisitsScatter = this.chartDataProcessor.weekSiteVisitScatter(null, null, true);
    this.heatmapData = this.chartDataProcessor.weekSiteVisitHeatMap(null, null, true);
    this.heatmapSitesItems = Object.keys(this.heatmapData);
    this.heatmapSite = this.heatmapSitesItems[0];
    this.sitesVisitsHeatmap = this.heatmapData[this.heatmapSite];

    this.loaded = true;
  },
  watch: {
    timelineDate: function(val) {
      this.loadTimeline(val, this.timelineTimeStart, this.timelineTimeEnd);
    },
    timelineTimeStart: function(val) {
      this.loadTimeline(this.timelineDate, val, this.timelineTimeEnd);
    },
    timelineTimeEnd: function(val) {
      this.loadTimeline(this.timelineDate, this.timelineTimeStart, val);
    },
    tableDateRange: function(arr) {
      this.tableItems = this.chartDataProcessor.timeFrameWatchSitesUsageFrequency(moment(arr[0]).toDate(), moment(arr[1]).toDate());
    },
    visitCardDate: function(val) {
      if (this.heatmapSite) {
        this.heatmapData = this.chartDataProcessor.weekSiteVisitHeatMap(moment(val).toDate(), [this.heatmapSite], true);
        this.sitesVisitsHeatmap = this.heatmapData[this.heatmapSite];
      } else {
        this.heatmapData = this.chartDataProcessor.weekSiteVisitHeatMap(null, null, true);
        this.heatmapSitesItems = Object.keys(heatmapData);
        this.heatmapSite = this.heatmapSitesItems[0];
        this.sitesVisitsHeatmap = this.heatmapData[this.heatmapSite];
      }
      this.sitesVisitsScatter = this.chartDataProcessor.weekSiteVisitScatter(moment(val).toDate(), null, true);
    },
    heatmapSite: function(val) {
      if (val in this.heatmapData) this.sitesVisitsHeatmap = this.heatmapData[val];
      else this.sitesVisitsHeatmap = this.chartDataProcessor.weekSiteVisitHeatMap(this.visitCardDate, [val], false)[val];
    },
  },
  methods: {
    loadTimeline: function(date, start, end) {
      this.sitesIntervals = this.chartDataProcessor.daySitesTimeline(moment(date).toDate(), [moment(date + ' ' + start).toDate(), moment(date + ' ' + end).toDate()], null, true);
    },
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
  },
  computed: {
    tableDateRangeText() {
      return this.tableDateRange.join(' ~ ');
    },
  },
  components: { TimelineSiteChart, ScatterChart, HeatMap },
};
</script>
