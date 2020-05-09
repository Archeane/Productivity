<template>
  <div id="timeline"></div>
</template>

<script>
import TimelinesChart from 'timelines-chart';
import moment from 'moment';

export default {
  props: {
    data: { type: Array, default: [] },
    width: { default: 600 },
    height: { default: 640 },
  },
  data: function() {
    return {
      timeline: null,
      timelineData: this.data,
    };
  },
  mounted: function() {
    let chartData = [];
    if (this.timelineData != null) {
      for (var i = 0; i < this.timelineData.length; i++) {
        var hourData = this.timelineData[i];
        for (var j = 0; j < hourData.length; j++) {
          if (hourData[j]['timeRange'][1].getHours() > hourData[j]['timeRange'][0].getHours()) {
            hourData[j]['timeRange'][1].setHours(1);
          } else {
            hourData[j]['timeRange'][1].setHours(0);
          }
          hourData[j]['timeRange'][0].setHours(0);
        }
        chartData.push({
          group: moment(i, ['HH']).format('h A'),
          data: [
            {
              label: '',
              data: this.timelineData[i],
            },
          ],
        });
      }

      var container = document.getElementById('timeline');

      const myChart = TimelinesChart();
      myChart
        .data(chartData)
        .zQualitative(true)
        .width(this.width)
        .maxHeight(this.height)
        .maxLineHeight(20)
        //.useUtc(true)
        .xTickFormat(x => {
          return x.getMinutes();
        })
        .enableOverview(false)(container);
    }
  },
};
</script>
<style></style>
