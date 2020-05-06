<template>
  <div id="app">
    <v-card style="height: 600px; width: 400px;">
      <v-toolbar dense width="400px;" flat>
        <v-toolbar-title>Productivity</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn text x-small @click="redirectOptions('')">Stats</v-btn>
        <v-btn text x-small @click="redirectOptions('usagepattern')">Options</v-btn>
        <v-btn text x-small>Support</v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-row>
        <v-col cols="6">
          <span class="overline">You are currently on</span>
          <span class="headline" v-if="loaded">{{ currentTab }}</span>
        </v-col>
        <v-col cols="6">
          <add-watch-site-button />
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <v-tabs background-color="transparent" grow color="basil" v-if="loaded">
        <v-tab>All Sites</v-tab>
        <v-tab>Timeline</v-tab>
        <v-tab>Watch Sites</v-tab>
        <v-tab-item>
          <div class="chart-container">
            <pie-chart :chartSeries="pieSeries" :chartLabels="pieLabels" />
          </div>
          <div>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="text-left">Url</th>
                  <th class="text-left">Total Time (mins)</th>
                  <th class="text-left">Visit Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tableData" :key="item.name">
                  <td>{{ item.name }}</td>
                  <td>{{ item.total }}</td>
                  <td>{{ item.frequency }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </div>
        </v-tab-item>
        <v-tab-item>
          <timeline-chart v-if="timelineData" :data="timelineData" width="500" height="450" style="margin-left: -2rem;" />
        </v-tab-item>
        <v-tab-item>
          <span class="overline">Today's total time: </span><span class="display-2 font-weight-black" style="text-align: right;"> {{ minutesToHours(watchSitesTotalTime) }}</span>
          <stacked-bar-chart v-if="loaded" :chartdata="stackedBarData" />
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
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'getCurrentTab',
        },
        response => {
          res(response.domain);
        }
      );
    } catch (err) {
      rej(err);
    }
  });
}

export default {
  name: 'app',
  data: () => ({
    loaded: false,
    currentTab: null,
    chartData: new ChartData(),
    pieSeries: null,
    pieLabels: null,
    timelineData: null,
    watchSitesTotalTime: 0,
    stackedBarData: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartData.init();
    // this.currentTab = await getCurrentTab();
    // console.log(this.currentTab);
    const pieData = this.chartData.dayChartPieData();
    this.pieSeries = pieData.series;
    this.pieLabels = pieData.labels;
    this.tableData = this.chartData.dayUsageTable();

    this.timelineData = this.chartData.dayTimeline(new Date());
    console.log(this.timelineData);
    this.stackedBarData = this.chartData.siteUsageStackedBarData(-7, 0, true);
    this.watchSitesTotalTime = this.chartData.timeFrameWatchSitesTotalUsage(-1, 0)[0];

    this.loaded = true;
  },
  methods: {
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
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
  components: { AddWatchSiteButton, PieChart, TimelineChart, StackedBarChart },
};
</script>
