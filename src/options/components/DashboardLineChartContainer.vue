<template>
  <v-card class="mx-auto" max-width="800">
    <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
      <v-tab>Total time</v-tab>
      <v-tab>Watch sites time</v-tab>
      <v-tab>Specific sites</v-tab>
      <v-btn-toggle color="primary" mandatory>
        <v-btn :value="1" text>week</v-btn>
        <v-btn :value="2" text>month</v-btn>
      </v-btn-toggle>
      <v-tab-item>
        <v-container fluid>
          <line-chart :chartdata="weekTotal" />
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <v-container fluid>
          <line-chart :chartdata="weekWatch" />
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <v-container fluid>
          <line-chart :chartdata="weekSites" />
        </v-container>
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>
<script>
import LineChart from '../../charts/LineChart';
import { VCard, VTab, VBtn } from 'vuetify/lib';
export default {
  props: {
    weekTotal: { type: Object, default: null },
    weekWatch: { type: Object, default: null },
    weekSites: { type: Object, default: null },
    visitedSites: { type: Array, default: [] },
  },
  components: {
    VCard,
    VTab,
    VBtn,
    LineChart,
  },
};
</script>
