<template>
  <v-container fluid fill-height>
    <h2 class="font-weight-light">Usage Pattern</h2>
    <v-row>
      <v-col cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field :value="date1" label="Timeline Date" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date1" no-title></v-date-picker>
        </v-menu>
        <timeline-chart v-if="loaded" :data="timelines[0]" :key="timelines[0]" />
      </v-col>
      <v-col cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field label="Timeline Date" :value="date2" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date2" no-title></v-date-picker>
        </v-menu>
        <timeline-chart v-if="loaded" :data="timelines[1]" :key="timelines[1]" />
      </v-col>
      <v-col cols="4">
        <v-menu>
          <template v-slot:activator="{ on }">
            <v-text-field label="Timeline Date" :value="date3" v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date3" no-title></v-date-picker>
        </v-menu>
        <timeline-chart v-if="loaded" :data="timelines[2]" :key="timelines[2]" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ChartData } from '../../js/data.js';
import colors from 'vuetify/lib/util/colors';
import moment from 'moment';
import TimelineChart from '../../charts/TimelineChart';
import 'vuetify/lib';

export default {
  name: 'VueChartJS',
  data: () => ({
    chartDataProcessor: new ChartData(),
    loaded: false,
    timelines: [[], [], []],
    date1: moment().format('YYYY-MM-DD'),
    date2: moment().format('YYYY-MM-DD'),
    date3: moment().format('YYYY-MM-DD'),
  }),
  async mounted() {
    this.loaded = false;
    await this.chartDataProcessor.init();
    this.timelines[0] = this.chartDataProcessor.dayTimeline(moment(this.date1).toDate());
    // console.log(this.timelines[0]);
    // this.timelines[1] = this.chartDataProcessor.dayTimeline(moment(this.date2).toDate());
    // this.timelines[2] = this.chartDataProcessor.dayTimeline(moment(this.date3).toDate());
    this.loaded = true;
  },
  watch: {
    date1: function(val) {
      this.changeTimeline(0, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
    },
    date2: function(val) {
      this.changeTimeline(1, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
    },
    date3: function(val) {
      this.changeTimeline(2, this.chartDataProcessor.dayTimeline(moment(val).toDate()));
    },
  },
  methods: {
    changeTimeline: function(n, data) {
      this.timelines[n] = data;
    },
    minutesToHours: function(minutes) {
      var h = Math.round(minutes / 60),
        m = minutes % 60;
      return `${h} hrs ${m} mins`;
    },
  },
  components: { TimelineChart },
};
</script>
