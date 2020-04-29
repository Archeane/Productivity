<template>
  <v-card class="mx-auto" max-width="800">
    <v-tabs background-color="white" color="deep-purple accent-4" class="elevation-2">
      <v-tab>Total time</v-tab>
      <v-tab>Specific sites</v-tab>
      <v-btn-toggle color="primary" v-model="lineIsMonth" @change="$emit('update:lineIsMonth', lineIsMonth)" mandatory>
        <v-btn :value="false" text>week</v-btn>
        <v-btn :value="true" text>month</v-btn>
      </v-btn-toggle>
      <v-tab-item>
        <v-container fluid>
          <v-select
            v-model="weekTotalLinesSelect"
            style="width: 50px;"
            :items="['1', '2', '3', '4']"
            @change="$emit('update:weekTotalLinesSelect', weekTotalLinesSelect)"
          ></v-select>
          <line-chart :chartdata="weekTotal" :options="weekTotalOptions" :key="weekTotal" />
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <v-container fluid>
          <v-autocomplete
            v-model="weekSitesSelection"
            :items="visitedSites"
            multiple
            chips
            label="Websites"
            @change="$emit('update:weekSitesSelection', weekSitesSelection)"
          ></v-autocomplete>
          <line-chart :chartdata="weekSites" :key="weekSites" />
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
    weekTotalOptions: { type: Object, default: null },
    weekSites: { type: Object, default: null },
    visitedSites: { type: Array, default: [] },
    weekSitesSelection: { type: Array, default: [] },
    weekTotalLinesSelect: { type: Number, default: 2 },
    lineIsMonth: { type: Boolean, default: false },
  },
  components: {
    VCard,
    VTab,
    VBtn,
    LineChart,
  },
};
</script>
