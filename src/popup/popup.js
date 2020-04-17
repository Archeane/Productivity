import Vue from 'vue';
import App from './App';

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
