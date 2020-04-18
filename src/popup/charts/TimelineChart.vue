<template>
  <div id="timeline"></div>
</template>

<script>
/*
  import {DataSet, Timeline} from 'vis-timeline/standalone';
  import "vis-timeline/styles/vis-timeline-graph2d.css";
    
  export default {
      props: {
          items: {type: Array, default: []},
          options: {type: Object, default: {width: "500px", height: "300px"}},
      },
      data: function() {
          return {
              timeline: null,
              items: this.items,
              options: this.options
          };
      },
      mounted: function() {
          var container = document.getElementById('timeline');
          this.timeline = new Timeline(container, new DataSet(this.items), this.options)
          this.timeline.focus(0)
          this.timeline.fit("linear");
          this.timeline.getCustomTime(new Date());
      },
  };
*/

import TimelinesChart from 'timelines-chart';

export default {
  props: {
    data: { type: Array, default: [] },
  },
  data: function() {
    return {
      timeline: null,
      timelineData: this.data,
      /*
        [{
          group: "today",
          data: [
          {
              label: "",
              data: [
              {
                  timeRange: ["2013-07-28T07:09:33.709Z", "2013-08-06T15:18:28.937Z"],
                  val: "facebook.com"
              },
              {
                  timeRange: ["2014-01-02T01:58:32.225Z", "2014-01-20T05:50:50.286Z"],
                  val:"facebook.com"
              },
              {
                  timeRange: ["2013-08-28T07:09:33.709Z", "2013-08-29T15:18:28.937Z"],
                  val:"youtube.com"
              },
              ]
          },
          ],
        }]
      */
    };
  },
  mounted: function() {
    let chartData = [];
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
        group: i.toString(),
        data: [
          {
            label: '',
            data: this.timelineData[i],
          },
        ],
      });
      // let chartData = {
      //     group: i.toString(),
      //     data: [{
      //         label: "",
      //         data: this.timelineData[i]
      //     }]
      // }
      // var container = document.createElement('div');
      // document.getElementById('timeline').appendChild(container);
      // // var container = document.getElementById('timeline');
      // const myChart = TimelinesChart();
      // myChart
      //     .data([chartData])
      //     .zQualitative(true)
      //     .width(600)
      //     (container);
    }
    var container = document.getElementById('timeline');

    const myChart = TimelinesChart();
    myChart
      .data(chartData)
      .zQualitative(true)
      .width(600)(container);
  },
};
</script>
