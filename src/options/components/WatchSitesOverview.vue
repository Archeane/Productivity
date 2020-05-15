<template>
  <v-container fluid fill-height>
    <v-row dense>
      <h2 class="font-weight-light ml-3">Watch Sites Overview</h2>
      <v-btn-toggle color="primary" v-model="isMonth" dense rounded mandatory class="mr-auto ml-3">
        <v-btn :value="false" text>week</v-btn>
        <v-btn :value="true" text>month</v-btn>
      </v-btn-toggle>
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
    <!-- <h2 class="font-weight-light">Watch Sites Overview</h2>
    <v-btn-toggle color="primary" v-model="isMonth" dense rounded mandatory style="margin-left:auto;">
      <v-btn :value="false" text>week</v-btn>
      <v-btn :value="true" text>month</v-btn>
    </v-btn-toggle>-->
    <v-col cols="12" style="max-height: 33vh;">
      <v-row>
        <v-col cols="3">
          <v-card height="30vh">
            <v-card-title>
              <span class="caption font-weight-light">Total (last {{ this.isMonth ? 30 : 7 }} days):</span>
              <span class="headline font-weight-bold" style="margin-left: auto;">{{ totalTime }}</span>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-actions>
              <v-row class="chart-container" style="margin-top: -20%;" justify="center" align="center">
                <v-col cols="10">
                  <half-donut-chart v-if="loaded" :chartdata="halfDonut" :key="halfDonut" />
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="9" style="margin-top: -2vh;">
          <h3>Watch Sites Usage Ranking Last {{ this.isMonth ? 30 : 7 }} Days</h3>
          <v-row :key="topSites">
            <v-col v-for="usage in topSites" :key="usage.url" cols="4">
              <v-card max-height="15vh">
                <v-list-item three-line>
                  <v-list-item-content>
                    <div class="overline mb-4">{{ usage.url }}</div>
                    <v-list-item-title class="headline mb-1">{{ usage.total }}</v-list-item-title>
                    <div v-if="usage.change" v-html="renderChange(usage.change[0])"></div>
                  </v-list-item-content>
                </v-list-item>
                <!-- <h3 class="display-1 font-weight-bold ml-5 pl-3 mt-2">#{{index+1}}</h3> -->
                <!-- <v-card-subtitle>{{ usage.url }}</v-card-subtitle> -->
                <!-- <v-img :src="usage.favicon" class="ml-auto mr-5 mt-3" max-height="32" max-width="32"></v-img> -->
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" style="max-height: 55vh;">
      <v-row>
        <v-col cols="5">
          <v-card height="52vh">
            <v-card-title class="pb-2 pt-2">Watch Sites Total Time</v-card-title>
            <v-divider></v-divider>
            <div v-if="loaded && weekRadar" class="chart-container" style="position: relative; width: 90%;">
              <p class="caption pl-2">If your area is getting smaller, it means you're reducing time on watch sites!</p>
              <radar-chart :chartdata="weekRadar" :key="weekRadar" style="max-height: 45vh;" />
            </div>
            <div v-else style="text-align: center; padding: 15px">
              <h2>
                Have at least 3 watch sites to use this feature!
              </h2>
            </div>
          </v-card>
        </v-col>
        <v-col cols="7">
          <v-card>
            <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
              <v-tab>Watch sites time</v-tab>
              <v-tab>Total time</v-tab>
              <v-tab-item>
                <v-container fluid fillheight>
                  <line-chart v-if="loaded" :chartdata="weekSitesLine" :key="weekSitesLine" />
                </v-container>
              </v-tab-item>
              <v-tab-item>
                <v-container fluid>
                  <line-chart v-if="loaded" :options="weekTotalLineOptions" :chartdata="weekTotalLineData" :key="weekTotalLineData" />
                </v-container>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import RadarChart from '../../charts/RadarChart';
import HalfDonutChart from '../../charts/HalfDonutChart';
import LineChart from '../../charts/LineChart';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    watchSites: null,
    isMonth: false,

    weekRadar: null,
    weekSitesLine: null,
    weekTotalLineData: null,
    weekTotalLineOptions: null,
    halfDonut: null,
    totalTime: null,
    topSites: [],

    weeksRadarSelect: [],
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();

    this.loadData();

    this.loaded = true;
  },
  watch: {
    isMonth: function(val) {
      this.loadData();
    },
  },
  methods: {
    loadData: function() {
      var days;
      this.isMonth ? (days = 30) : (days = 7);
      this.totalTime = this.minutesToHours(
        this.chartDataProcessor.timeFrameWatchSitesTotalUsage(days * -1, 0).reduce((a, b) => {
          return a + b;
        })
      );
      this.halfDonut = this.chartDataProcessor.timeFrameWatchSitesHalfDonut(days * -1, 0);
      this.topSites = [];
      var topSites = this.chartDataProcessor
        .topWatchSites(days * -1, 0)
        .slice(0, 6)
        .sort((a, b) => {
          return b[1] - a[1];
        });
      var lastWeekTopSites = this.chartDataProcessor.topWatchSites(days * -2, days * -1);
      topSites.forEach(site =>
        this.topSites.push({
          url: site[0],
          total: this.minutesToHours(site[1]),
          favicon: this.getFavIconUrl(site[0]),
          change: lastWeekTopSites
            ? lastWeekTopSites
                .filter(value => {
                  return value[0] == site[0];
                })
                .map(value => {
                  return Math.floor(((site[1] - value[1]) / value[1]) * 100);
                })
            : null,
        })
      );

      var weekRadar = this.chartDataProcessor.nWeeksWatchSitesChartRadar(3, null, this.isMonth);
      if (weekRadar && 'labels' in weekRadar && weekRadar.labels.length > 2) this.weekRadar = weekRadar;

      this.weekSitesLine = this.chartDataProcessor.weekWatchSitesLineChart(null, this.isMonth);

      this.weekTotalLineData = this.chartDataProcessor.watchSitesTotalLineChart(moment().toDate(), 3, true, this.isMonth);
      this.weekTotalLineOptions = {
        plugins: {
          datalabels: {
            display: false,
          },
        },
        title: {
          display: true,
          text: 'Combined time of all watch sites',
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
    },
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
    renderChange: function(change) {
      if (parseInt(change) < 0) {
        return `<span style="color: green;"> ${change}% from last week</span>`;
      } else {
        return `<span style="color: red;"> +${change}% from last week</span>`;
      }
    },
    getFavIconUrl: function(domain) {
      return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`;
    },
  },
  components: { LineChart, RadarChart, HalfDonutChart },
};
</script>
