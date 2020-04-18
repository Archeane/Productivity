<template>
  <div id="app">
    <h1>My Vue App</h1>
    <AddWatchSiteButton />
    <VueChartJS />
  </div>
</template>

<script>
import VueChartJS from '../charts/VueChartJS.vue';
import AddWatchSiteButton from './components/AddWatchSiteButton'

export default {
  name: 'app',
  components: {
    VueChartJS, AddWatchSiteButton
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
