'use strict';

import Fn from './fn.js';
import Config from './config.js';

var fn = new Fn();
var config = new Config();

function UserException(message) {
  this.message = message;
  this.name = 'UserException';
}

class TimeTable {
  // get usage total per time unit
  // @return {url: time}
  getDayUsage(day, timeTable) {
    return timeTable[fn.getDateString(day)];
  }

  getWeekUsage(week, timeTable) {
    weekUsage = [];
    week.forEach(day => {
      if (timeTable.hasOwnProperty(day)) {
        weekUsage.push(timeTable[day]);
      } else {
        weekUsage.push(null);
      }
    });
    return weekUsage;
  }

  getMonthUsage(month) {
    month = [];
    for (day in month) month.push(this.timeTable[day]);
    return month;
  }

  // get usage for specific site per time unit
  getSiteDayUsage(url, day) {
    return (url = fn.parseDomainFromUrl(url)), (day = fn.getDateString), this.timeTable[day][url];
  }

  getSiteWeekUsage(site, week) {
    //return url = fn.parseDomainFromUrl(url), day = fn.getDateString, this.timeTable[day][url];
  }

  getSiteMonthUsage(site, month) {}

  /**
   *
   * @param {number} n
   * @param {Array} timeFrame
   * @param {Object} timeTable
   */
  getTopNSites(n, timeFrame, timeTable) {
    if (timeFrame.length == 1) {
      return Object.keys(timeTable[day])
        .sort((a, b) => {
          return timeTable[day][b]['total'] - timeTable[day][a]['total'];
        })
        .slice(0, n);
    }
    var timeFrameUsage = {}; // url: total usage this week
    timeFrame.forEach(day => {
      if (timeTable.hasOwnProperty(day)) {
        for (let [url, usage] of Object.entries(timeTable[day])) {
          if (typeof usage['total'] !== 'number') {
            continue;
          }
          if (timeFrameUsage.hasOwnProperty(url)) {
            timeFrameUsage[url] += usage['total'];
          } else {
            timeFrameUsage[url] = usage['total'];
          }
        }
      }
    });
    return Object.keys(timeFrameUsage)
      .sort((a, b) => {
        return timeFrameUsage[b] - timeFrameUsage[a];
      })
      .slice(0, n);
  }
}

const timeTableFunctions = new TimeTable();

export class ChartData {
  colors(num_of_colors) {
    var color_palette = [
      '#18e6cf',
      '#dcedc1',
      '#ffd3b6',
      '##bada55',
      '#7fe5f0',
      '#c0c0c0',
      '#5ac18e',
      '#e6e6fa',
      '#ffd700',
      '#ffc0cb',
      '#ff7373',
      '#b0e0e6',
      '#f0f8ff',
      '#d3ffce',
      '#ffa500',
      '#ffb6c1',
      '#fff68f',
      '#f08080',
      '#ffc3a0',
      '#66cdaa',
      '#4ca3dd',
      '#ff6666',
      '#f5f5f5',
      '#ff7f50',
      '#ffff66',
      '#00ff7f',
      '#6897bb',
      '#66cccc',
      '#3399ff',
      '#a0db8e',
      '#daa520',
      '#b4eeb4',
      '#b6fcd5',
      '#f5f5f5',
      '#afeeee',
      '#333333',
      '#ff8b94',
      '#ffaaa5',
      '#1ebbd7',
      '#71c73c',
      '#189ad3',
    ];
    var colors = [];
    for (var i = 0; i < num_of_colors; i++) {
      let rand = [Math.floor(Math.random() * color_palette.length)];
      colors.push(color_palette[rand]);
      color_palette.splice(rand, 1);
    }
    return colors;
  } // return same number of colors as number of items in data passed in

  getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  getWeek(day) {
    let week = [];
    var d = this.getMonday(day);
    for (let i = 1; i <= 7; i++) week.push(fn.getDateString(d)), d.setDate(d.getDate() + 1);
    return week;
  }

  dayChartPieData(date, timeTable) {
    if (timeTable == null) {
      return;
    }
    const usage = timeTableFunctions.getDayUsage(date, timeTable);
    let data = [];
    let labels = [];
    for (let [url, usage] of Object.entries(usage)) {
      if (typeof url === 'string' && typeof usage['total'] === 'number') {
        labels.push(url);
        data.push(usage['total']);
      }
    }
    let color = this.colors(data.length);
    return {
      labels: labels,
      datasets: [
        {
          label: "Today's usage",
          backgroundColor: color,
          data: data,
        },
      ],
    };
  }
  weekChartPieData(date, timeTable) {
    if (timeTable == null) {
      return;
    }
    const week = this.getWeek(date);
    const usage = timeTableFunctions.getWeekUsage(week, timeTable);
    let data = [];
    let labels = [];
    for (let [url, usage] of Object.entries(usage)) {
      if (typeof url === 'string' && usage.hasOwnProperty('total') && typeof usage['total'] === 'number') {
        labels.push(url);
        data.push(usage['total']);
      }
    }
    let color = this.colors(data.length);
    return {
      labels: labels,
      datasets: [
        {
          label: "This Week's usage",
          backgroundColor: color,
          data: data,
        },
      ],
    };
  }
  monthChartPieData() {}

  /**
   *
   * @param {Date} date
   * @param {number} n
   * @param {Object} timeTable
   * @returns {LineChartDataObject} {labels: Array, datasets: Array[Objects]}
   */
  weekTopNSitesLineChartData(date, n, timeTable) {
    var sitesUsage = {}; // url: [mon_usage, tues_usage ...]
    const week = this.getWeek(date);
    const topNSites = timeTableFunctions.getTopNSites(n, week, timeTable);
    topNSites.forEach(site => {
      sitesUsage[site] = this.siteWeekTime(week, site, timeTable);
    });
    var datasets = [];
    for (let [url, time_arr] of Object.entries(sitesUsage)) datasets.push({ data: time_arr, label: url, fill: false });
    const colors = this.colors(n);
    datasets.forEach(dataset => {
      dataset['borderColor'] = colors.pop();
    });
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'],
      datasets: datasets,
    };
  }
  monthSitesLineChartData() {}
  weekTotalTimeLineChart() {}
  monthTotalTimeLineChart() {}

  siteWeekTime(week, url, timeTable) {
    let data = [];
    week.forEach(day => {
      if (timeTable.hasOwnProperty(day) && timeTable[day].hasOwnProperty(url) && timeTable[day][url].hasOwnProperty('total') && typeof timeTable[day][url]['total'] === 'number') {
        data.push(timeTable[day][url]['total']);
      } else {
        data.push(null);
      }
    });
    return data;
  }
  siteMonthTime() {}
}

export async function getTimeTable(cb) {
  chrome.runtime.sendMessage(
    {
      request: 'getTimeTable',
    },
    function(response) {
      cb(response.done);
    }
  );
}
