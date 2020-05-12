<template>
  <v-container fluid fill-height>
    <v-row dense>
      <h2 class="font-weight-light mr-auto ml-3">Watch Sites Details</h2>
      <span class="subtitle-2 ml-auto mr-3">
        Have you find this tool useful? Please make a donation!
        <br />Any amount is appreciated 😁
      </span>
      <div>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="EF6BJM8AY86QA" />
          <input type="hidden" name="currency_code" value="USD" />
          <input
            type="image"
            src="https://www.empowerhaititogether.org/wp-content/uploads/2016/10/Donate-Button-heart-300x97.png"
            border="0"
            height="40"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Donate with PayPal button"
          />
          <img alt border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </div>
    </v-row>
    <v-divider></v-divider>
    <v-row>
      <v-col cols="6" style="margin-top: -0.75rem;">
        <v-row>
          <v-col cols="12">
            <v-card v-if="loaded" height="60vh">
              <!-- <v-row dense style="height: 6vh;">
                <v-col cols="6">
                  <v-row align="start" justify="start">
                    <v-card-title class="ml-3">Timeline Chart</v-card-title>
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          :value="timelineDate"
                          v-on="on"
                          dense
                          readonly
                          outlined
                          style="max-width: 6.5rem;"
                          class="mt-3"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="timelineDate" no-title></v-date-picker>
                    </v-menu>
                  </v-row>
                </v-col>
                <v-col offset="3" cols="3">
                  <v-row align="start" justify="start" class="mt-3">
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="timelineTimeStart"
                          :value="timelineTimeStart"
                          v-on="on"
                          readonly
                          dense
                          style="max-width: 3rem;"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-model="timelineTimeStart"
                        :max="timelineTimeEnd"
                        ampm-in-title
                        scrollable
                      ></v-time-picker>
                    </v-menu>
                    <v-card-subtitle>to</v-card-subtitle>
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          v-model="timelineTimeEnd"
                          :value="timelineTimeEnd"
                          v-on="on"
                          readonly
                          dense
                          style="max-width: 3rem"
                        ></v-text-field>
                      </template>
                      <v-time-picker
                        v-model="timelineTimeEnd"
                        :min="timelineTimeStart"
                        ampm-in-title
                        scrollable
                      ></v-time-picker>
                    </v-menu>
                  </v-row>
                </v-col>
              </v-row>-->
              <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
                <v-tab>Combined</v-tab>
                <v-tab>Separate</v-tab>
                <v-spacer></v-spacer>
                <v-menu>
                  <template v-slot:activator="{ on }">
                    <v-text-field :value="timelineDate" v-on="on" dense readonly outlined style="max-width: 6.5rem;" class="ml-auto mt-1 mr-5"></v-text-field>
                    <span class="subtitle-1 mt-2 mr-2" style="color: black">Last 3 days of</span>
                  </template>
                  <v-date-picker v-model="timelineDate" no-title></v-date-picker>
                </v-menu>
                <div style="display: flex;" class="ml-auto mt-1">
                  <v-menu>
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="timelineTimeStart" :value="timelineTimeStart" v-on="on" readonly dense style="max-width: 3rem; margin-right: -0.5rem;"></v-text-field>
                    </template>
                    <v-time-picker v-model="timelineTimeStart" :max="timelineTimeEnd" ampm-in-title scrollable></v-time-picker>
                  </v-menu>
                  <v-card-subtitle style="margin-right: -0.5rem;">to</v-card-subtitle>
                  <v-menu>
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="timelineTimeEnd" :value="timelineTimeEnd" v-on="on" readonly dense style="max-width: 3rem"></v-text-field>
                    </template>
                    <v-time-picker v-model="timelineTimeEnd" :min="timelineTimeStart" ampm-in-title scrollable></v-time-picker>
                  </v-menu>
                </div>
                <v-tab-item>
                  <div v-if="sitesIntervals.length > 0" class="mt-1">
                    <timeline-site-chart :chartSeries="sitesIntervalsCombined" :key="sitesIntervalsCombined" />
                  </div>
                  <v-card-subtitle v-else>You didn't visit any watch sites for more than 5 minutes today 🏆</v-card-subtitle>
                </v-tab-item>
                <v-tab-item>
                  <div v-if="sitesIntervals.length > 0">
                    <timeline-site-chart :chartSeries="sitesIntervals" :key="sitesIntervals" />
                  </div>
                  <v-card-subtitle v-else>You didn't visit any watch sites for more than 5 minutes today 🏆</v-card-subtitle>
                </v-tab-item>
              </v-tabs>
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
                <span>
                  Each dot represents a visit (of more than 30 seconds, and less than 5 minutes before the previous visit) to the site
                  <br />This can help you discover your visiting pattern, whether it's the time period or frequency you visit this site.
                </span>
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
    sitesIntervalsCombined: null,
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
    //this.sitesIntervals = this.chartDataProcessor.daySitesTimeline(moment(this.timelineDate).toDate(), [start, end], null, true);
    //console.log(this.sitesIntervals);
    this.sitesIntervals = this.chartDataProcessor.watchSitesWeekTimeline([start, end], null, true);
    this.sitesIntervalsCombined = this.chartDataProcessor.watchSitesWeekTimeline([start, end]);
    // console.log(this.sitesIntervals);

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
      // this.sitesIntervals = this.chartDataProcessor.daySitesTimeline(moment(date).toDate(), [moment(date + ' ' + start).toDate(), moment(date + ' ' + end).toDate()], null, true);
      this.sitesIntervals = this.chartDataProcessor.watchSitesWeekTimeline([moment(date + ' ' + start).toDate(), moment(date + ' ' + end).toDate()], moment(date).toDate(), true);
      this.sitesIntervalsCombined = this.chartDataProcessor.watchSitesWeekTimeline([moment(date + ' ' + start).toDate(), moment(date + ' ' + end).toDate()], moment(date).toDate());
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
