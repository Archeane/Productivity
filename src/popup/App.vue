<template>
  <div id="app">
    <v-card style="height: 800px; width: 400px;">
      <v-toolbar dense width="400px;" flat>
        <v-img src="../icons/PRODUCTIVITY-48.png" height="38" width="30" style="margin-left:-12px;"></v-img>
        <v-toolbar-title>Productivity</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text x-small @click="redirectOptions('')">Stats</v-btn>
        <v-btn text x-small @click="redirectOptions('settings')">Options</v-btn>
        <v-btn text x-small @click="redirectOptions('support')">Support</v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-row style="margin-left: auto; margin-right: auto">
        <v-col cols="6">
          <span style="font-size: 10px;font-color: grey">You are currently on</span>
          <span style="font-size: 16px; font-weight: 700;" v-if="loaded">{{ currentTabDomain }}</span>
        </v-col>
        <v-col offset="1" cols="4">
          <add-watch-site-button />
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-tabs background-color="#F5F5F5" grow v-if="loaded">
        <v-tab>All Sites</v-tab>
        <v-tab>Timeline</v-tab>
        <v-tab>Watch Sites</v-tab>
        <v-tab-item>
          <div v-if="pieContainsData" class="chart-container">
            <pie-chart :chartSeries="pieSeries" :chartLabels="pieLabels" />
          </div>
          <h2 v-else>
            Sorry, not enough data for today yet <br />
            check back later!<br />
          </h2>
          <div>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="text-left">Url</th>
                  <th class="text-left">Total Time (mins)</th>
                  <th class="text-left">Visit Frequency</th>
                </tr>
              </thead>
              <tbody v-if="tableContainsData">
                <tr v-for="item in tableData" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ item.total }}</td>
                  <td>{{ item.frequency }}</td>
                </tr>
              </tbody>
              <h2 v-else>
                Sorry, not enough data for today yet <br />
                check back later!<br />
              </h2>
            </v-simple-table>
          </div>
        </v-tab-item>
        <v-tab-item>
          <timeline-chart v-if="timelineContainsData" :data="timelineData" width="500" height="450" style="margin-left: -2rem;" />
          <h2 v-else>
            Sorry, not enough data for today yet <br />
            check back later!<br />
          </h2>
        </v-tab-item>
        <v-tab-item>
          <div v-if="containWatchSites">
            <div style="margin-top: 10px;">
              <span style="font-size: 12px; font-weight: 100; margin-left: 10px;">TODAY'S TOTAL TIME:</span>
              <span style="font-size: 26px; font-weight: 600; margin-left: 90px;">{{ minutesToHours(watchSitesTotalTime) }}</span>
            </div>
          </div>
          <div v-else class="ml-5">
            <h2>
              Not enough data for this feature! <br />Either you haven't added any watch sites (click the [+ Watch Sites button], or go to options), <br />
              or you haven't visited any watch sites today for longer than 5 minutes yet!
            </h2>
          </div>
          <stacked-bar-chart v-if="loaded" :chartdata="stackedBarData" style="padding-top: 5px;" />
        </v-tab-item>
      </v-tabs>
    </v-card>
  </div>
</template>

<script>
import { ChartData } from '../js/data.js';
import AddWatchSiteButton from './components/AddWatchSiteButton';
import TimelineChart from '../charts/TimelineChart';
import PieChart from '../charts/PieChart';
import StackedBarChart from '../charts/StackedBarChart';

async function getCurrentTab() {
  return new Promise(res => {
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
      if (tabs.length > 0 && 'url' in tabs[0]) {
        res(tabs[0].url);
      }
    });
  });
}

function parseDomainFromUrl(e) {
  var t, n;
  return (n = document.createElement('a')), (n.href = e), (t = n.hostname);
}
import moment from 'moment';
export default {
  name: 'app',
  data: () => ({
    loaded: false,
    currentTab: null,
    chartData: new ChartData(),
    containWatchSites: false,
    pieContainsData: false,
    pieSeries: null,
    pieLabels: null,
    timelineData: null,
    timelineContainsData: false,
    watchSitesTotalTime: 0,
    stackedBarData: null,
    tableData: null,
    tableContainsData: false,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartData.init();
    this.currentTab = await getCurrentTab();

    var pieData = this.chartData.dayChartPieData();
    if (pieData == null || !('series' in pieData) || !('labels' in pieData) || pieData.series.length == 0 || pieData.series.length == 0) this.pieContainsData = false;
    else {
      this.pieSeries = pieData.series;
      this.pieLabels = pieData.labels;
      this.pieContainsData = true;
    }
    var tableData = this.chartData.dayUsageTable();
    if (tableData != null) (this.tableData = tableData), (this.tableContainsData = true);

    var timelineData = this.chartData.dayTimeline();
    if (timelineData != null) (this.timelineData = timelineData), (this.timelineContainsData = true);
    var stackedBarData = this.chartData.siteUsageStackedBarData(-7, 0, true);
    if (stackedBarData) (this.stackedBarData = stackedBarData), (this.containWatchSites = true);
    var watchSitesTotalTime = this.chartData.timeFrameWatchSitesTotalUsage(-1, 0)[0];
    if (watchSitesTotalTime) (this.watchSitesTotalTime = watchSitesTotalTime), (this.containWatchSites = true);

    this.loaded = true;
  },
  methods: {
    minutesToHours: function(minutes) {
      var h = Math.floor(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
    redirectOptions: function(tab) {
      chrome.runtime.sendMessage({
        request: 'redirectOptions',
        tab: tab,
      });
    },
  },
  computed: {
    currentTabDomain: function() {
      var t, n;
      return (n = document.createElement('a')), (n.href = this.currentTab), (t = n.hostname);
    },
  },
  components: { AddWatchSiteButton, PieChart, TimelineChart, StackedBarChart },
};
</script>
<style>
g.legendG {
  display: none;
}
</style>
