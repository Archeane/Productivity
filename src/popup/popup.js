import Vue from 'vue';
import App from './App';
import Chart from 'chart.js';
import $ from 'jquery';

//import Config from '../js/config.js'
import { ChartData, getTimeTable } from '../js/data.js';
//const config = Config();
// import LineChart from './LineChart'

let chartData = new ChartData();

// const ctx = $("#dayPieChart");
let timeTable = null;
// getTimeTable((response) => {
//     timeTable = response;
//     var data = chartData.dayChartPieData(null, timeTable);
//     console.log(data);
//     var dayPieChart = new Chart(ctx, {
//         type: 'doughnut',
//         data: data,
//         options: Chart.defaults.doughnut
//     })

// })
/* eslint-disable no-new */
// Vue.component("ChartContainer", {
//     data: () => ({
//         loaded: false,
//         chartdata: null
//     }),
//     template: '<line-chart v-if="loaded":chartdata="chartdata":options="options"/>',
//     mounted () {
//         this.loaded = false
//         this.chartdata = {
//             labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
//             datasets: [{
//                 label: '# of Votes',
//                 data: [12, 19, 3, 5, 2, 3],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.2)',
//                     'rgba(54, 162, 235, 0.2)',
//                     'rgba(255, 206, 86, 0.2)',
//                     'rgba(75, 192, 192, 0.2)',
//                     'rgba(153, 102, 255, 0.2)',
//                     'rgba(255, 159, 64, 0.2)'
//                 ],
//                 borderColor: [
//                     'rgba(255, 99, 132, 1)',
//                     'rgba(54, 162, 235, 1)',
//                     'rgba(255, 206, 86, 1)',
//                     'rgba(75, 192, 192, 1)',
//                     'rgba(153, 102, 255, 1)',
//                     'rgba(255, 159, 64, 1)'
//                 ],
//                 borderWidth: 1
//             }]
//         }
//         this.loaded = true
//     }
// });

new Vue({
  el: '#app',
  render: h => h(App),
});

// window.setInterval(function() {
//     chrome.runtime.sendMessage({request: "getTimeTable"}, function(response){
//         timeTable = response.done;
//         // console.log(timeTable);
//         // cb(timeTable);
//     });
// }, 6e4)
