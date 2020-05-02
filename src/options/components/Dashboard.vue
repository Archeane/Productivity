<template>
  <v-container fluid fillheight>
    <v-row>
      <v-col cols="7">
        <v-row>
          <v-col cols="5">
            <v-card height="34vh">
              <v-row dense style="max-height: 6vh;">
                <v-col cols="11">
                  <v-row align="start" justify="center" style="margin-top: -1.5vh;">
                    <v-card-title style="margin-left: 8px;">Time Online</v-card-title>
                    <v-row justify="end" style="padding-right: 8px;">
                      <v-card-title>Last</v-card-title>
                      <div style="width: 80px">
                        <v-select v-model="weekTotalSelect" :items="monthSelectItems" :item-text="text" :item-value="value"></v-select>
                      </div>
                    </v-row>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <!-- <v-row align="center" justify="center" style="height:28vh;"> -->
              <div style="text-align: center; margin-top: 10%;">
                <v-card-text class="font-weight-bold display-1" :key="weekTotalUsage">
                  {{ weekTotalUsage }}
                </v-card-text>
                <v-card-text>
                  <p class="font-weight-medium subtitle-1" :style="{ color: lastWeekTotalUsageCmpColor }">{{ lastWeekTotalUsageCmp }}</p>
                </v-card-text>
              </div>
              <!-- </v-row> -->
            </v-card>
          </v-col>
          <v-col cols="7">
            <v-card height="34vh">
              <v-row dense style="max-height: 17.5%;">
                <v-col cols="11">
                  <v-row align="start" justify="center" style="margin-top: -2.5%;">
                    <v-card-title style="margin-left: 2.5%;">Total Time Online</v-card-title>
                    <v-row justify="end">
                      <v-card-title>Last</v-card-title>
                      <div style="width: 90px">
                        <v-select v-model="halfDonutSelect" :items="monthSelectItems" :item-text="text" :item-value="value"></v-select>
                      </div>
                    </v-row>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="chart-container" style="margin-top: -20%;" justify="center" align="center">
                <v-col cols="10">
                  <half-donut-chart v-if="loaded" :chartdata="weekChartData.halfDonut" :key="weekChartData.halfDonut" />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <DashboardLineChartContainer
              v-if="loaded"
              :weekTotal="weekChartData.totalLine"
              :weekTotalOptions="weekChartData.totalLineOptions"
              :weekSites.sync="weekChartData.sitesLine"
              :visitedSites="monthVisitedSites"
              :weekSitesSelection.sync="weekSitesSelection"
              :weekTotalLinesSelect.sync="weekTotalLinesSelect"
              :lineIsMonth.sync="lineIsMonth"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="5">
        <v-row>
          <v-col cols="12">
            <v-card height="40vh">
              <v-row dense style="max-height: 6vh;">
                <v-col cols="11">
                  <v-row align="start" justify="center" style="margin-top: -1.5vh;">
                    <v-card-title style="margin-left: 2vh;">Total Time Online</v-card-title>
                    <v-row justify="end">
                      <v-card-title>Last</v-card-title>
                      <div style="width: 90px">
                        <v-select v-model="stackedBarSelect" :items="weekSelectItems" :item-text="text" :item-value="value"></v-select>
                      </div>
                    </v-row>
                  </v-row>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <div class="chart-container" style="position: relative; width: 90%;">
                <stacked-bar-chart v-if="loaded" :chartdata="weekChartData.stackedBar" :key="weekChartData.stackedBar" style="max-height: 33vh;" />
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-card height="40vh">
              <v-row dense style="height: 6vh;">
                <v-col cols="8" style="margin-top: -0.5rem;">
                  <v-row align="start" justify="start">
                    <v-card-title class="ml-3">Week of</v-card-title>
                    <v-menu>
                      <template v-slot:activator="{ on }">
                        <v-text-field :value="tableDate" v-on="on" style="max-width: 7.5rem; margin-top: 1rem; padding: 0 0 0 0" dense></v-text-field>
                      </template>
                      <v-date-picker v-model="tableDate" no-title></v-date-picker>
                    </v-menu>
                  </v-row>
                </v-col>
                <v-col cols="3" style="margin-top:-0.75rem; margin-right: -0.5rem;">
                  <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                </v-col>
              </v-row>

              <v-data-table
                v-if="loaded"
                :items-per-page="5"
                :headers="tableHeaders"
                :items="weekChartData.usageFrequencyTable"
                :search="search"
                :key="weekChartData.usageFrequencyTable"
                multi-sort
                class="elevation-1"
              ></v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import LineChart from '../../charts/LineChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import StackedBarChart from '../../charts/StackedBarChart';
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import DashboardLineChartContainer from './DashboardLineChartContainer';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    weekTotalUsage: '',
    lastWeekTotalUsageCmp: 0,
    lastWeekTotalUsageCmpColor: colors.red.lighten1, // true = usage increased compared to last week
    search: '',
    tableDate: moment().format('YYYY-MM-DD'),
    tableHeaders: [
      {
        text: 'Url',
        align: 'start',
        value: 'name',
      },
      { text: 'Total time', value: 'total' },
      { text: 'Visit freq', value: 'frequency' },
      { text: 'Avg time/visit', value: 'timePerVist' },
    ],
    weekTotalSelect: 7,
    halfDonutSelect: 3,
    stackedBarSelect: 3,
    monthSelectItems: [
      { value: 3, text: '3 days' },
      { value: 7, text: '7 days' },
      { value: 14, text: '14 days' },
      { value: 30, text: '30 days' },
    ],
    weekSelectItems: [
      { value: 2, text: '2 days' },
      { value: 3, text: '3 days' },
      { value: 4, text: '4 days' },
      { value: 5, text: '5 days' },
      { value: 6, text: '6 days' },
      { value: 7, text: '7 days' },
    ],
    weekSitesSelection: [],
    weekTotalLinesSelect: 2,
    lineIsMonth: false,
    weekChartData: {
      totalLine: null,
      totalLineOptions: null,
      sitesLine: null,
      halfDonut: null,
      stackedBar: null,
      usageFrequencyTable: null,
    },
    monthVisitedSites: null,
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-7, 0);
    this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
    var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-13, -7);
    if (weekTotalMinutes > lastWeekTotalMinutes)
      this.lastWeekTotalUsageCmp = `+${Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100)} % from last ${this.weekTotalSelect} days`;
    else
      (this.lastWeekTotalUsageCmpColor = colors.green.lighten1),
        (this.lastWeekTotalUsageCmp = `-${Math.round((weekTotalMinutes / lastWeekTotalMinutes) * 100)} % from last ${this.weekTotalSelect} days`);

    this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData(-3, 0);
    this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(-3, 0);
    this.weekChartData.usageFrequencyTable = this.chartDataProcessor.weekSitesUsageFrequency();

    this.weekChartData.totalLine = this.chartDataProcessor.watchSitesTotalLineChart(null, 2, false, this.lineIsMonth);
    this.weekChartData.totalLineOptions = {
      plugins: {
        datalabels: {
          display: false,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            gridLines: {
              display: false,
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              stepSize: 60,
              callback: function(label, index, labels) {
                return label / 60 + ' Hrs ';
              },
            },
          },
        ],
      },
    };
    this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart();
    this.monthVisitedSites = this.chartDataProcessor.timeFrameVisitedSites(-30, 0);

    this.loaded = true;
  },
  watch: {
    weekTotalSelect: function(val) {
      const weekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(parseInt(-1 * parseInt(this.weekTotalSelect)), 0);
      var lastWeekTotalMinutes = this.chartDataProcessor.timeFrameTotalTime(-2 * parseInt(this.weekTotalSelect) + 1, -1 * parseInt(this.weekTotalSelect));
      if (lastWeekTotalMinutes == null) {
        this.lastWeekTotalUsageCmp = `Not enough data for last ${this.weekTotalSelect} days`;
      } else {
        if (weekTotalMinutes > lastWeekTotalMinutes) {
          this.lastWeekTotalUsageCmpColor = colors.red.lighten1;
          var percentage = Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100);
          this.lastWeekTotalUsageCmp = `+${percentage} % from last ${this.weekTotalSelect} days`;
        } else {
          this.lastWeekTotalUsageCmpColor = colors.green.lighten1;
          var percentage = Math.round((weekTotalMinutes / lastWeekTotalMinutes - 1) * 100);
          this.lastWeekTotalUsageCmp = `${percentage} % from last ${this.weekTotalSelect} days`;
        }
      }
      if (weekTotalMinutes == null) {
        this.weekTotalUsage = 'Not enough data!';
      } else {
        this.weekTotalUsage = `${Math.floor(weekTotalMinutes / 60)} Hours ${weekTotalMinutes % 60} Mins`;
      }
    },
    halfDonutSelect: function(val) {
      this.weekChartData.halfDonut = this.chartDataProcessor.weekChartHalfDonutData(parseInt(val) * -1, 0);
    },
    stackedBarSelect: function(val) {
      this.weekChartData.stackedBar = this.chartDataProcessor.siteUsageStackedBarData(parseInt(val) * -1, 0);
    },
    tableDate: function(val) {
      this.weekChartData.usageFrequencyTable = this.chartDataProcessor.weekSitesUsageFrequency(val);
    },
    weekSitesSelection: function(val) {
      this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart(val, null, this.lineIsMonth);
    },
    weekTotalLinesSelect: function(val) {
      this.weekChartData.totalLine = this.chartDataProcessor.watchSitesTotalLineChart(null, val, false, this.lineIsMonth);
    },
    lineIsMonth: function(isMonth) {
      this.weekChartData.sitesLine = this.chartDataProcessor.weekSiteUsageLineChart(this.weekSitesSelection, null, isMonth);
      this.weekChartData.totalLine = this.chartDataProcessor.watchSitesTotalLineChart(null, this.weekTotalLinesSelect, false, isMonth);
    },
  },
  components: { LineChart, HalfDonutChart, StackedBarChart, DashboardLineChartContainer },
};
</script>
