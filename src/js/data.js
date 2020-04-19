'use strict';

import Fn from './fn.js';
import Config from './config.js';
import moment from 'moment';
import { colors } from 'vuetify/lib';

var fn = new Fn();
/**
 * Line charts:
 *        1) Week total usage
 *        2) week watch sites usage - date => site usage on date
 *        3) specifc site usage
 *
 * Donghout:
 *   Day:
 *      1) Day site => day_usage
 *   Week:
 *      2) Week site => total_usage_this_week
 *
 *  Bar:
 *      Week:
 *          1) x: date, y: site time on date    - bar stacked
 *          2) x: watch site, y: total time this week   - column overlap
 *
 * TimeLine:
 *      Day:
 *          1) x: time, y: which site   -group by label: today's usage pattern
 *          2) x: time, y: site - no group by label: site usage patterns
 *      Week:
 *          3 & 4
 *
 * Table:
 *      1) week top N sites
 */

async function getTimeTable() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'getTimeTable',
        },
        response => {
          res(response.done);
        }
      );
    } catch (err) {
      rej(err);
    }
  });
}

async function getWatchSites() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'getWatchSites',
        },
        response => {
          res(response.done);
        }
      );
    } catch (err) {
      rej(err);
    }
  });
}

export async function addWatchSite(url) {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'addWatchSite',
          url: url,
        },
        response => {
          res(response);
        }
      );
    } catch (err) {
      rej(err);
    }
  });
}

class TimeTableData {
  async init() {
    this.timeTable = await getTimeTable();
  }

  /**
   *
   * @param {*} day
   * @param {*} timeTable
   * @returns sorted url => total_time_today
   */
  getDayUsage(day) {
    if (!(fn.getDateString(day) in this.timeTable)) {
      return {};
    }
    const dayUsage = {};
    Object.entries(this.timeTable[fn.getDateString(day)])
      .sort((a, b) => b[1]['total'] - a[1]['total'])
      .forEach(day => {
        dayUsage[day[0]] = Math.floor(day[1]['total'] / 60);
      });
    return dayUsage;
  }

  /**
   *
   * @param {Array} week
   * @returns {Array} [day1_total, 0, day3_total...]
   */
  getWeekTotalTime(week) {
    var weekTotal = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < week.length; i++) {
      const day = week[i];
      if (day in this.timeTable) {
        for (let [_, usage] of Object.entries(this.timeTable[day])) {
          weekTotal[i] += Math.floor(usage['total'] / 60);
        }
      }
    }
    return weekTotal;
  }

  /**
   *
   * @param {Array} week
   * @return {Map} sorted (url => {Number}total_time this week)
   */
  getSitesWeekTotalUsage(week) {
    var weekUsage = {}; // url: total_time
    week.forEach(day => {
      if (this.timeTable.hasOwnProperty(day)) {
        for (let [url, usage] of Object.entries(this.timeTable[day])) {
          if (typeof url === 'string' && typeof usage['total'] === 'number') {
            if (url in weekUsage && usage['total'] / 60 < 1000) weekUsage[url] += Math.floor(usage['total'] / 60);
            else weekUsage[url] = Math.floor(usage['total'] / 60);
          }
        }
      }
    });
    return new Map(Object.entries(weekUsage).sort((a, b) => b[1] - a[1]));
  }

  /**
   *
   * @param {Array} week
   * @returns url => [day1_usage, day2_usage ... day7_usage]
   */
  getSitesWeekUsage(week) {
    var weekUsage = {};
    for (var i = 0; i < week.length; i++) {
      const day = week[i];
      if (day in this.timeTable) {
        for (let [url, usage] of Object.entries(this.timeTable[day])) {
          if (typeof url === 'string') {
            if (!(url in weekUsage)) {
              weekUsage[url] = [0, 0, 0, 0, 0, 0, 0];
            }
            if (usage['total'] / 60 < 1000) {
              weekUsage[url][i] = Math.floor(usage['total'] / 60);
            }
          }
        }
      }
    }
    return weekUsage;
  }

  getMonthUsage(month) {
    month = [];
    for (day in month) month.push(this.this.timeTable[day]);
    return month;
  }

  /**
   *
   * @param {number} n
   * @param {Array} timeFrame
   * @return {Array} [site1, site2 ... site n]
   */
  getTopNSites(n, timeFrame) {
    if (timeFrame.length == 1) {
      return Object.keys(this.timeTable[day])
        .sort((a, b) => {
          return this.timeTable[day][b]['total'] - this.timeTable[day][a]['total'];
        })
        .slice(0, n);
    }
    var timeFrameUsage = {}; // url: total usage this week
    timeFrame.forEach(day => {
      if (this.timeTable.hasOwnProperty(day)) {
        for (let [url, usage] of Object.entries(this.timeTable[day])) {
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

  /**
   *
   * @param {Array} week
   * @param {String} url
   * @returns [day1_total_usage, null, day3_total_usage ...]
   */
  siteWeekTime(week, url) {
    let data = [];
    week.forEach(day => {
      if (
        this.timeTable.hasOwnProperty(day) &&
        this.timeTable[day].hasOwnProperty(url) &&
        this.timeTable[day][url].hasOwnProperty('total') &&
        typeof this.timeTable[day][url]['total'] === 'number'
      ) {
        data.push(this.timeTable[day][url]['total']);
      } else {
        data.push(null);
      }
    });
    return data;
  }
  siteMonthTime() {}
}

class WatchSitesData {
  async init() {
    this.watchSites = await getWatchSites();
    this.timeTable = await getTimeTable();
  }

  /**
   *
   * @param {Array} week
   * @returns urls => [day1_usage, null, day3_usage ...]
   */
  weekWatchSitesUsage(week) {
    var weekUsage = {};
    this.watchSites.forEach(url => {
      for (var i = 0; i < week.length; i++) {
        const day = week[i];
        if (url in this.timeTable[day]) {
          if (!(url in weekUsage)) weekUsage[url] = [0, 0, 0, 0, 0, 0, 0];
          weekUsage[url][i] = Math.floor(this.timeTable[day][url]['total'] / 60);
        }
      }
    });
    return weekUsage;
  }

  /**
   *
   * @param {Array} week
   * @returns {Number} total minutes on watched sites this week
   */
  weekWatchSitesTotalUsage(week) {
    var weekUsage = 0;
    this.watchSites.forEach(url => {
      week.forEach(day => {
        if (url in this.timeTable[day]) weekUsage += Math.floor(this.timeTable[day][url]['total'] / 60);
      });
    });
    return weekUsage;
  }
}

export class ChartData {
  constructor() {
    this.today = new Date();
    this.thisWeek = this.getWeek(this.today);
  }

  async init() {
    this.TimeTable = new TimeTableData();
    this.WatchSites = new WatchSitesData();
    await this.TimeTable.init();
    await this.WatchSites.init();
  }

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

  // =============================Line charts =========================================
  /**
   *
   * @param {boolean} lastWeek - true: get two week's data
   */
  weekTotalTimeLineChart(lastWeek, date) {
    var datasets = [];
    if (date == null) {
      date = new Date();
    }
    const week = this.getWeek(date);
    const weekTotal = this.TimeTable.getWeekTotalTime(week);
    weekTotal[1] = weekTotal[1] / 1000; //todo: delete
    datasets.push({
      label: 'Total Usage This Week',
      borderColor: '#ffb3ba',
      data: weekTotal,
      backgroundColor: '#ffb3ba',
      fill: lastWeek,
    });
    if (lastWeek) {
      var date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
      const lastWeek = this.getWeek(date);
      const lastWeekTotal = this.TimeTable.getWeekTotalTime(lastWeek);
      datasets.push({
        label: `Total Usage Last Week`,
        borderColor: '#bae1ff',
        backgroundColor: '#bae1ff',
        data: lastWeekTotal,
        fill: true,
      });
    }
    return {
      labels: lastWeek ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] : week,
      datasets: datasets,
    };
  }

  weekWatchSitesLineChart(timeTable, watchSites, today = new Date()) {
    var datasets = [];
    const week = this.getWeek(today);
    const weekUsage = this.WatchSites.weekWatchSitesUsage(week, timeTable, watchSites);
    const colors = this.colors(Object.keys(weekUsage).length);
    for (let [url, usageArr] of Object.entries(weekUsage)) {
      datasets.push({
        label: url,
        borderColor: colors.pop(),
        data: usageArr,
        fill: false,
      });
    }
    return {
      labels: week,
      datasets: datasets,
    };
  }

  weekSiteUsageLineChart(urls, day) {
    const week = this.thisWeek;
    if (day != null) {
      week = this.getWeek(day);
    }
    var datasets = [];
    const colors = this.colors(urls.length);
    urls.forEach(url => {
      datasets.push({
        label: url,
        borderColor: colors.pop(),
        fill: false,
        data: this.TimeTable.siteWeekTime(week, url),
      });
    });
    return {
      labels: week,
      datasets: datasets,
    };
  }

  monthSitesLineChartData() {}
  monthTotalTimeLineChart() {}

  // ============================= Pie charts =========================================

  dayChartPieData(date, max = 15) {
    if (date == null) {
      date = this.today;
    }
    const dayUsage = this.TimeTable.getDayUsage(date);
    let labels = Object.keys(dayUsage).slice(0, max);
    let data = Object.values(dayUsage).slice(0, max);
    return {
      labels: labels,
      series: data,
    };
    // return {
    //     labels: labels,
    //     datasets: [{
    //         label: "Today's usage",
    //         backgroundColor: color,
    //         data: data,
    //     }, ],
    // };
  }
  weekChartPieData(date, max) {
    if (date == null) date = this.today;
    const week = this.getWeek(date);
    var weekUsage = this.TimeTable.getSitesWeekTotalUsage(week);
    let labels = [...weekUsage.keys()].slice(0, max);
    let data = [...weekUsage.values()].slice(0, max);
    return {
      labels: labels,
      series: data,
    };
  }

  // ============================= Bar charts =========================================

  weekChartBarData(date, timeTable) {
    if (timeTable == null) {
      return;
    }
    const week = this.getWeek(date);
    var weekUsage = timeTableFunctions.getSitesWeekUsage(week, timeTable);
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

  daySitesTimeline(day, timeTable) {
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
    var intByHours = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
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

  dayTimeline(day, timeTable) {
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
    return [
      {
        group: date,
        data: [
          {
            label: '',
            data: visits,
          },
        ],
      },
    ];
  }

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
    const topNSites = this.TimeTableData.getTopNSites(n, week, timeTable);
    topNSites.forEach(site => {
      sitesUsage[site] = this.TimeTableData.siteWeekTime(week, site, timeTable);
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
  monthChartPieData() {}
}
