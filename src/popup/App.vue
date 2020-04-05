<template>
  <div id="app">
    <h1>My Vue App</h1>
    <VueChartJS />
  </div>
</template>

<script>
import VueChartJS from './VueChartJS.vue';

var chartdata = {
  labels: ['January', 'February'],
  datasets: [
    {
      label: 'Data One',
      backgroundColor: '#f87979',
      data: [40, 20],
    },
  ],
};
var options = {
  responsive: true,
  maintainAspectRatio: false,
};

export default {
  name: 'app',
  data: function() {
    return {
      chartdata: chartdata,
      options: options,
    };
  },
  components: {
    VueChartJS,
  },
};
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
