'use strict';

import Fn from './fn.js';
import Config from './config.js';
import moment from 'moment';

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
    const dayUsage = {};
    Object.entries(timeTable[fn.getDateString(day)])
      .sort((a, b) => b[1]['total'] - a[1]['total'])
      .forEach(day => {
        dayUsage[day[0]] = day[1]['total'];
      });
    return dayUsage;
  }

  /**
   *
   * @param {Array} week
   * @param {Object} timeTable
   * @return {Map} sorted url => usage
   */
  getWeekTotalUsage(week, timeTable) {
    var weekUsage = {}; // url: total_time
    week.forEach(day => {
      if (timeTable.hasOwnProperty(day)) {
        for (let [url, usage] of Object.entries(timeTable[day])) {
          if (typeof url === 'string' && typeof usage['total'] === 'number') {
            if (weekUsage.hasOwnProperty(url)) weekUsage[url] += usage['total'];
            else weekUsage[url] = usage['total'];
          }
        }
      }
    });
    return new Map(Object.entries(weekUsage).sort((a, b) => b[1] - a[1]));
  }

  /**
   *
   * @param {Array} week
   * @param {Object} timeTable
   * @returns url => [day1_usage, day2_usage ... day7_usage]
   */
  getWeekUsage(week, timeTable) {
    var weekUsage = {};
    for (var i = 0; i < week.length; i++) {
      const day = week[i];
      if (day in timeTable) {
        for (let [url, usage] of Object.entries(timeTable[day])) {
          if (typeof url === 'string') {
            if (!(url in weekUsage)) {
              weekUsage[url] = [0, 0, 0, 0, 0, 0, 0];
            }
            if (usage['total'] / 60 < 1000) {
              weekUsage[url][i] = usage['total'] / 60;
            }
          }
        }
      }
    }
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
   * @return {Array} [site1, site2, site3...]
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
    if (num_of_colors > color_palette.length) {
      return color_palette;
    }
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

  weekChartBarData(date, timeTable) {
    if (timeTable == null) {
      return;
    }
    const week = this.getWeek(date);
    var weekUsage = timeTableFunctions.getWeekUsage(week, timeTable);
    const colors = this.colors(Object.keys(weekUsage).length);
    var datasets = [];
    for (let [url, usageArr] of Object.entries(weekUsage)) {
      const totalUsage = usageArr.reduce((a, b) => a + b, 0);
      if (
        totalUsage > 300 &&
        usageArr.filter(x => {
          return x !== 0;
        }).length > 1
      ) {
        datasets.push({
          label: url,
          backgroundColor: colors.pop() || 'RED',
          data: usageArr,
        });
      }
    }
    return {
      labels: week,
      datasets: datasets,
    };
  }

  getDaySiteIntervals(day, timeTable) {
    const date = fn.getDateString(day);
    var visits = [];
    for (let [url, usage] of Object.entries(timeTable[date])) {
      if (usage['total'] > 600) {
        var data = [];
        usage['visits'].forEach(interval => {
          typeof interval === 'object' &&
            interval[1] - interval[0] > 300 &&
            data.push({
              x: date,
              y: interval,
            });
        });
        visits.push({
          name: url,
          data: data,
        });
      }
    }
    // for (let [url, usage] of Object.entries(timeTable[date])){
    //     if (usage['total'] > 600){
    //         var data = []
    //         usage['visits'].forEach((interval) => {
    //             typeof(interval) === "object" && data.push({x: url, y: interval})
    //         });
    //         visits.push({name: url, data: data})
    //     }
    // }
    return visits;
  }

  getNewDateByHour(hour, date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0);
  }

  breakDayToHoursIntervals(intervals) {
    intervals.sort((a, b) => {
      return a['timeRange'][0] - b['timeRange'][0];
    });
    var intByHours = [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ];
    var currentHour = intervals[0]['timeRange'][0].getHours();
    for (let intervalObj of intervals) {
      let interval = intervalObj['timeRange'];
      if (interval[0].getHours() == currentHour && interval[1].getHours() > currentHour) {
        intByHours[currentHour].push({
          timeRange: [interval[0], this.getNewDateByHour(currentHour + 1, interval[0])],
          val: intervalObj['val'],
        });
        currentHour += 1;
        while (interval[1].getHours() > currentHour) {
          intByHours[currentHour].push({
            timeRange: [this.getNewDateByHour(currentHour, interval[0]), this.getNewDateByHour(currentHour + 1, interval[0])],
            val: intervalObj['val'],
          });
          currentHour += 1;
        }
        intByHours[currentHour].push({
          timeRange: [this.getNewDateByHour(currentHour, interval[0]), interval[1]],
          val: intervalObj['val'],
        });
      } else if (interval[0].getHours() == currentHour && interval[1].getHours() == currentHour) {
        intByHours[currentHour].push({
          timeRange: [interval[0], interval[1]],
          val: intervalObj['val'],
        });
      } else if (interval[0].getHours() > currentHour) {
        while (interval[0].getHours() > currentHour) {
          currentHour += 1;
        }
        if (interval[1].getHours() == currentHour) {
          intByHours[currentHour].push({
            timeRange: [interval[0], interval[1]],
            val: intervalObj['val'],
          });
        } else {
          intByHours[currentHour].push({
            timeRange: [interval[0], this.getNewDateByHour(currentHour + 1, interval[0])],
            val: intervalObj['val'],
          });
          currentHour += 1;
          while (interval[1].getHours() > currentHour) {
            intByHours[currentHour].push({
              timeRange: [this.getNewDateByHour(currentHour, interval[0]), this.getNewDateByHour(currentHour + 1, interval[0])],
              val: intervalObj['val'],
            });
            currentHour += 1;
          }
          intByHours[currentHour].push({
            timeRange: [this.getNewDateByHour(currentHour, interval[0]), interval[1]],
            val: intervalObj['val'],
          });
        }
      }
    }
    return intByHours;
  }

  getDayIntervals(day, timeTable) {
    const date = fn.getDateString(day);
    var visits = [];
    for (let [url, usage] of Object.entries(timeTable[date])) {
      if (usage['total'] > 600) {
        usage['visits'].forEach(interval => {
          typeof interval === 'object' &&
            interval[1] - interval[0] > 100 * 1000 &&
            visits.push({
              timeRange: [new Date(interval[0]), new Date(interval[1])],
              val: url,
            });
        });
      }
    }

    var intByHour = this.breakDayToHoursIntervals(visits);
    return intByHour;
    return [{
      group: date,
      data: [{
        label: '',
        data: visits,
      }, ],
    }, ];
  }

  dayChartPieData(date, timeTable, max) {
    if (timeTable == null) {
      return;
    }
    const dayUsage = timeTableFunctions.getDayUsage(date, timeTable);
    let labels = Object.keys(dayUsage).slice(0, max);
    let data = Object.values(dayUsage).slice(0, max);
    let color = this.colors(data.length);
    return {
      labels: labels,
      datasets: [{
        label: "Today's usage",
        backgroundColor: color,
        data: data,
      }, ],
    };
  }
  weekChartPieData(date, timeTable, max) {
    if (timeTable == null) {
      return;
    }
    const week = this.getWeek(date);
    var weekUsage = timeTableFunctions.getWeekTotalUsage(week, timeTable);
    let labels = [...weekUsage.keys()].slice(0, max);
    let data = [...weekUsage.values()].slice(0, max);
    let color = this.colors(data.length);
    return {
      labels: labels,
      datasets: [{
        label: "This Week's usage",
        backgroundColor: color,
        data: data,
      }, ],
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
    for (let [url, time_arr] of Object.entries(sitesUsage))
      datasets.push({
        data: time_arr,
        label: url,
        fill: false,
      });
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
  weekTotalTimeLineChart(date, timeTable) {
    var weekTotal = [0, 0, 0, 0, 0, 0, 0];
    const week = this.getWeek(date);
    for (var i = 0; i < week.length; i++) {
      if (timeTable.hasOwnProperty(day)) {
        for (let [url, usage] in timeTable[day])
          if (usage.hasOwnProperty('total') && typeof usage['total'] === 'number') weekTotal[i] += usage['total'];
      }
    }
    return weekTotal;
  }
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
  chrome.runtime.sendMessage({
      request: 'getTimeTable',
    },
    function (response) {
      cb(response.done);
    }
  );
}

export async function addWatchSite(url) {
  return new Promise((res, rej) => {
    try{
      chrome.runtime.sendMessage({
        request: 'addWatchSite',
        url: url,
      }, (response) => {
        res(response)
      });
    }catch(err){rej(err)}
  });
}