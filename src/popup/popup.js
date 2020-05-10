import Vue from 'vue';
import vuetify from '../plugins/vuetify';
import Vuetify from 'vuetify';

// import AddWatchSiteButton from './components/AddWatchSiteButton'
// import {
//   ChartData
// } from '../js/data.js';
// import PieChart from '../charts/PieChart';
// import TotalUsage from './components/TotalUsage';
import App from './App';
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

new Vue({
  el: '#app',
  // render: h => h(App),
  components: { App },
  vuetify: new Vuetify({ theme: { dark: false } }),
});
/*
new Vue({
  el: '#app',
  //vuetify: new Vuetify(),
  data:  {
      loaded: false,
      currentTab: null,
      chartData: new ChartData(),
      pieSeries: [84,37,10,9,2,1],
      pieLabels: ["luoxia", "youtube", "stackoverflow", "google", "personality", "vueifyjs"],
      tableData: null,
      tableHeaders: [{
          text: 'Url',
          align: 'start',
          value: 'name',
        },
        {
          text: 'Total time',
          value: 'total'
        },
        {
          text: 'Visit freq',
          value: 'frequency'
        },
      ],
  },
  // async mounted() {
  //   this.loaded = false;
  //   await this.chartData.init();
  //   // this.currentTab = await getCurrentTab();
  //   // const pieData = this.chartData.dayChartPieData();
  //   // this.pieSeries = pieData.series;
  //   // this.pieLabels = pieData.labels;
  //   // console.log(this.pieSeries, this.pieLabels);
  //   // this.tableData = this.chartData.dayUsageTable();
  //   // console.log(this.tableData);
  //   this.loaded = true;
  // },
  methods: {
    redirectOptions: function (tab) {
      chrome.runtime.sendMessage({
        request: "redirectOptions",
        tab: tab
      })
    }
  },
  components: {
    // AddWatchSiteButton,
    PieChart,
    // TotalUsage
  },
  
});
*/
// window.setInterval(function() {
//     chrome.runtime.sendMessage({request: "getTimeTable"}, function(response){
//         timeTable = response.done;
//         // console.log(timeTable);
//         // cb(timeTable);
//     });
// }, 6e4)
