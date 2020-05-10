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
 *      3) Half donut site => total_usage_this_week
 *
 *  Bar:
 *          1) x: date, y: site time on date    - bar stacked
 *  Radar:  1) x: watch site, y: total time this week   - column overlap
 *
 * TimeLine:
 *      Day:
 *          1) x: time, y: which site   -group by label: today's usage pattern
 *          2) x: time, y: site - no group by label: site usage patterns
 *          3) x: hour y: watch site - no group by label
 *
 * Scatter:
 *      1) x - day, y - site. point = single entry
 *
 * Table:
 *      1) week usage & freuqncy
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
   * @param {String} day 2020-04-20
   * @returns timeTable[day]
   */
  getDayUsage(day) {
    return day in this.timeTable ? this.timeTable[day] : {};
  }

  /**
   *
   * @param {*} day
   * @param {*} timeTable
   * @returns sorted url => total_time_today
   */
  getDayUsageSorted(day) {
    if (!(day in this.timeTable)) {
      return {};
    }
    const dayUsage = {};
    Object.entries(this.timeTable[day])
      .sort((a, b) => b[1]['total'] - a[1]['total'])
      .forEach((url, usage) => {
        dayUsage[url] = Math.floor(usage['total'] / 60);
      });
    return dayUsage;
  }

  /**
   *
   * @param {String} day
   * @param {[Date, Date]} dayFrame
   * @param {Array} urls
   * @returns [{ x: facebook.com, y: first_interval}, {x: facebook.com, y: second_interval}]
   */
  getDaySiteVisits(day, dayFrame, urls) {
    const date = fn.getDateString(day);
    if (!(date in this.timeTable)) return [];
    var frameStart,
      frameEnd,
      isFrame = dayFrame !== null,
      data = [];
    if (isFrame) {
      frameStart = dayFrame[0].getHours();
      frameEnd = dayFrame[1].getHours();
    }
    if (urls !== null) {
      urls.forEach(url => {
        if (date in this.timeTable[date] && url in this.timeTable[date] && this.timeTable[date][url]['total'] > 300) {
          const visits = this.timeTable[date][url]['visits'];
          visits.forEach(visit => {
            if (isFrame) {
              if ((new Date(visit[0]).getHours() < frameEnd || new Date(visit[1]).getHours() > frameStart) && visit[1] - visit[0] > 30 * 1000)
                data.push({
                  x: url,
                  y: visit,
                });
            } else {
              if (visit[1] - visit[0] > 30 * 1000)
                data.push({
                  x: url,
                  y: visit,
                });
            }
          });
        }
      });
    } else {
      for (let [url, usage] of Object.entries(this.timeTable[date])) {
        if (usage['total'] > 300) {
          const visits = usage['visits'];
          visits.forEach(visit => {
            if (isFrame) {
              var visitStart = new Date(visit[0]).getHours(),
                visitEnd = new Date(visit[1]).getHours();
              if (
                visit[1] - visit[0] > 30 * 1000 &&
                ((visitStart <= frameStart && visitEnd > frameStart) || (visitStart >= frameStart && visitEnd <= frameEnd) || (visitEnd > frameEnd && visitStart < frameEnd))
              ) {
                console.log(visitStart, visitEnd, '\t', frameStart, frameEnd);
                data.push({
                  x: url,
                  y: visit,
                });
              }
            } else {
              if (visit[1] - visit[0] > 30 * 1000)
                data.push({
                  x: url,
                  y: visit,
                });
            }
          });
        }
      }
    }
    return data;
  }

  /**
   *
   * @param {Array} week
   * @returns {Array} [day1_total, 0, day3_total...]
   */
  getWeekTotalTime(week) {
    var weekTotal = [...Array(week.length)].fill(0);
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
   * @return {Map} (url => total visits this week)
   */
  getSitesWeekTotalFrequencyUsage(week) {
    var urlUsage = {};
    week.forEach(day => {
      if (!(day in this.timeTable)) return;
      for (let [url, usage] of Object.entries(this.timeTable[day])) {
        if (!(url in urlUsage))
          urlUsage[url] = {
            total: 0,
            frequency: 0,
          };
        (urlUsage[url]['total'] += Math.floor(usage['total'] / 60)), (urlUsage[url]['frequency'] += usage['visits'].length);
      }
    });
    return urlUsage;
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

  getSiteDayVisits(day, url) {
    if (!(day in this.timeTable) || !(url in this.timeTable[day])) return [];
    return this.timeTable[day][url]['visits'];
  }

  /**
   *
   * @param {String} day
   * @returns  [{timeRange: [entry, exit], val: url}]
   */
  getDayVisits(date) {
    if (!(date in this.timeTable)) return [];
    var visits = [];
    for (let [url, usage] of Object.entries(this.timeTable[date])) {
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
    return visits;
  }

  /**
   *
   * @param {number} n
   * @param {Array} timeFrame
   * @return {Array} [site1, site2 ... site n]
   */
  topNUsageSites(n, timeFrame) {
    if (timeFrame.length == 1) {
      return Object.keys(this.timeTable[day])
        .sort((a, b) => {
          return this.timeTable[day][b]['total'] - this.timeTable[day][a]['total'];
        })
        .slice(0, n);
    }
    var timeFrameUsage = {}; // url: total usage this week
    timeFrame.forEach(day => {
      if (!(day in this.timeTable)) return;
      for (let [url, usage] of Object.entries(this.timeTable[day])) {
        if (typeof usage['total'] !== 'number') continue;
        if (!(url in timeFrameUsage)) timeFrameUsage[url] = 0;
        timeFrameUsage[url] += usage['total'];
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
   * @param {Number} n
   * @param {Array} timeFrame
   * @returns sorted by visit frequency [url1, url2 .. urln]
   */
  topNFrequentSites(n, timeFrame) {
    if (timeFrame.length == 1) {
      return Object.keys(this.timeTable[timeFrame[0]])
        .sort((a, b) => {
          return this.timeTable[day][b]['visits'].length - this.timeTable[day][a]['visits'].length;
        })
        .slice(0, n);
    }
    var timeFrameUsage = {}; // url: total usage this week
    timeFrame.forEach(day => {
      if (day in this.timeTable) {
        for (let [url, usage] of Object.entries(this.timeTable[day])) {
          if (!(url in timeFrameUsage)) timeFrameUsage[url] = 0;
          timeFrameUsage[url] += usage['visits'].length;
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
        data.push(Math.floor(this.timeTable[day][url]['total'] / 60));
      } else {
        data.push(0);
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

  getWatchSites() {
    return this.watchSites;
  }

  /**
   *
   * @param {String} day
   * @param {[Date, Date]} dayFrame
   * @param {Array} urls
   * @returns [{ x: facebook.com, y: first_interval}, {x: facebook.com, y: second_interval}]
   */
  getDaySiteVisits(day, dayFrame) {
    const date = fn.getDateString(day);
    if (!(date in this.timeTable)) return [];
    var frameStart,
      frameEnd,
      isFrame = dayFrame !== null,
      data = [];
    if (isFrame) {
      frameStart = dayFrame[0].getHours();
      frameEnd = dayFrame[1].getHours();
    }
    this.watchSites.forEach(url => {
      if (date in this.timeTable && url in this.timeTable[date] && this.timeTable[date][url]['total'] > 300) {
        const visits = this.timeTable[date][url]['visits'];
        visits.forEach(visit => {
          if (isFrame) {
            var visitStart = new Date(visit[0]).getHours(),
              visitEnd = new Date(visit[1]).getHours();
            if (
              visit[1] - visit[0] > 30 * 1000 &&
              ((visitStart <= frameStart && visitEnd > frameStart) || (visitStart >= frameStart && visitEnd <= frameEnd) || (visitEnd > frameEnd && visitStart < frameEnd))
            ) {
              data.push({
                x: url,
                y: visit,
              });
            }
          } else {
            if (visit[1] - visit[0] > 30 * 1000)
              data.push({
                x: url,
                y: visit,
              });
          }
        });
      }
    });
    console.log(data);
    return data;
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
        if (day in this.timeTable && url in this.timeTable[day]) {
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
        if (day in this.timeTable && url in this.timeTable[day]) weekUsage += Math.floor(this.timeTable[day][url]['total'] / 60);
      });
    });
    return weekUsage;
  }

  /**
   *
   * @param {Array} week
   * @returns sorted url => total time
   */
  weekTopWatchSites(week) {
    var weekUsage = {};
    this.watchSites.forEach(url => {
      for (var i = 0; i < week.length; i++) {
        const day = week[i];
        if (day in this.timeTable && url in this.timeTable[day]) {
          if (!(url in weekUsage)) weekUsage[url] = 0;
          weekUsage[url] += Math.floor(this.timeTable[day][url]['total'] / 60);
        }
      }
    });
    return Object.entries(weekUsage).sort(function(a, b) {
      return weekUsage[b] - weekUsage[a];
    });
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

  /**
   *
   * @param {Number/Date} start
   * @param {Number/Date} end
   * if start & end are dates, return all dates from start to end
   * else return dates range [today+start, today+end]
   */
  getTimeFrame(start, end) {
    var dates = [],
      currDate,
      lastDate;
    if (typeof end === 'number' && typeof start === 'number') {
      if (start < 0) currDate = moment().subtract(-1 * start, 'd');
      if (start > 0) currDate = moment().add(start, 'd');
      if (end < 0) lastDate = moment().subtract(-1 * end, 'd');
      if (end > 0) lastDate = moment().add(end, 'd');
      if (start == 0) (currDate = moment()), lastDate.subtract(1, 'd');
      if (end == 0) (lastDate = moment()), currDate.add(1, 'd');
      while (!currDate.isSame(lastDate, 'date')) {
        dates.push(currDate.clone().format('YYYY-MM-DD'));
        currDate.add(1, 'd');
      }
      dates.push(lastDate.format('YYYY-MM-DD'));
    }
    return dates;
  }

  timeFrameTotalTime(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    return this.TimeTable.getWeekTotalTime(timeFrame).reduce((a, b) => {
      return a + b;
    });
  }

  topWatchSites(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    return this.WatchSites.weekTopWatchSites(timeFrame);
  }

  timeFrameWatchSitesTotalUsage(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    return this.WatchSites.weekWatchSitesTotalUsage(timeFrame);
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
    datasets.push({
      label: 'Total Usage This Week',
      borderColor: '#ff7f7f',
      data: weekTotal,
      backgroundColor: '#444444',
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

  weekWatchSitesLineChart(today = new Date()) {
    var datasets = [];
    const week = this.getWeek(today);
    const weekUsage = this.WatchSites.weekWatchSitesUsage(week);
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

  timeFrameVisitedSites(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    return this.TimeTable.topNUsageSites(-1, timeFrame);
  }
  // ============================= Pie charts =========================================

  dayChartPieData(date, max = 15) {
    if (date == null) {
      date = this.today;
    }
    const dayUsage = this.TimeTable.getDayUsageSorted(date);
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

  weekChartHalfDonutData(start, end, max = 10) {
    const week = this.getTimeFrame(start, end);
    const weekUsage = this.TimeTable.getSitesWeekTotalUsage(week);
    let labels = [...weekUsage.keys()].slice(0, max);
    let data = [...weekUsage.values()].slice(0, max);
    const colors = this.colors(data.length);
    return {
      labels: labels,
      datasets: [
        {
          label: "Today's usage",
          backgroundColor: colors,
          data: data,
        },
      ],
    };
  }

  timeFrameWatchSitesHalfDonut(start, end, max = 10) {
    const week = this.getTimeFrame(start, end);
    const weekUsage = this.WatchSites.weekTopWatchSites(week);
    console.log(weekUsage);
    let labels = weekUsage.map(x => x[0]).slice(0, max);

    let data = weekUsage.map(x => x[1]).slice(0, max);
    const colors = this.colors(data.length);
    return {
      labels: labels,
      datasets: [
        {
          label: "Today's usage",
          backgroundColor: colors,
          data: data,
        },
      ],
    };
  }
  // ============================= Radar charts =========================================
  /**
   *
   * @param {Number} n - number of weeks away from data
   * @param {String} date
   */
  nWeeksWatchSitesChartRadar(n, date) {
    if (date == null) date = this.today;
    var datasets = [];
    const colors = this.colors(n);
    const watchSites = this.WatchSites.getWatchSites();
    for (var i = 0; i < n; i++) {
      const week = this.getWeek(date);
      const weekTotal = [];
      watchSites.forEach(url => {
        weekTotal.push(
          this.TimeTable.siteWeekTime(week, url).reduce((a, b) => {
            return a + b;
          })
        );
      });
      const color = colors.pop();
      datasets.push({
        label: `week of ${fn.getDateString(date)}`,
        borderColor: color,
        backgroundColor: color,
        pointBorderColor: '#fff',
        data: weekTotal,
        fill: true,
      });
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
    }
    return {
      labels: watchSites,
      datasets: datasets,
    };
  }

  // ============================= Bar charts =========================================

  /**
   *
   * @param {Number} start
   * @param {Number} end
   * end - start <= 7
   * @return day -> {url: total time on the day} filtered
   */
  siteUsageStackedBarData(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    let weekUsage = {};
    let weekTotalTime = 0;
    let dayTotalTimes = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < timeFrame.length; i++) {
      const dayUsage = this.TimeTable.getDayUsage(timeFrame[i]);
      for (let [url, usage] of Object.entries(dayUsage)) {
        if (!(url in weekUsage)) weekUsage[url] = [0, 0, 0, 0, 0, 0, 0];
        const total = Math.floor(usage['total'] / 60);
        weekUsage[url][i] = total;
        weekTotalTime += total;
        dayTotalTimes[i] += total;
      }
    }
    const colors = this.colors(Object.keys(weekUsage).length);
    let datasets = [];
    const weekMinutesThreshold = Math.floor(weekTotalTime / 100);
    const daysThreshold = Math.floor((end - start) / 3);
    for (let [url, usageArr] of Object.entries(weekUsage)) {
      const totalUsage = usageArr.reduce((a, b) => a + b, 0);
      if (
        totalUsage > weekMinutesThreshold &&
        usageArr.filter(x => {
          return x !== 0;
        }).length > daysThreshold &&
        usageArr.every((e, i) => {
          if (e != 0 && e < Math.floor(dayTotalTimes[i] / 100) * 2.5) {
            usageArr[i] = 0;
          }
          return true;
        })
      ) {
        datasets.push({
          label: url,
          backgroundColor: colors.pop() || 'RED',
          data: usageArr,
          datalabels: {
            formatter: function(value, context) {
              if (value > 1) {
                const url = context.dataset.label;
                return url.replace(/([.]\w+)$/, '').replace(/^www\./, '');
              } else {
                return '';
              }
            },
          },
        });
      }
    }
    return {
      labels: timeFrame,
      datasets: datasets,
    };
  }

  // ============================= Timeline Charts =========================================
  /**
   *
   * @param {String} date - defaults to today
   * @param {[Date, Date]} dayFrame - if specified, show intervals inbetween this frame
   * @param {Array} urls - if specified, show intervals of specific urls
   * @param {Boolean} watchSites - if true, show watch sites
   */
  daySitesTimeline(date, dayFrame, urls, watchSites) {
    if (date == null) date = this.today;
    if (watchSites) {
      return {
        name: fn.getDateString(date),
        data: this.WatchSites.getDaySiteVisits(date, dayFrame),
      };
    }
    var data = this.TimeTable.getDaySiteVisits(date, dayFrame, urls);
    return {
      name: fn.getDateString(date),
      data: data,
    };
    // var visits = [];
    // for (let [url, usage] of Object.entries(timeTable[date])) {
    //     if (usage['total'] > 600) {
    //         var data = [];
    //         usage['visits'].forEach(interval => {
    //             typeof interval === 'object' &&
    //                 interval[1] - interval[0] > 300 &&
    //                 data.push({
    //                     x: date,
    //                     y: interval,
    //                 });
    //         });
    //         visits.push({
    //             name: url,
    //             data: data,
    //         });
    //     }
    // }
    // for (let [url, usage] of Object.entries(timeTable[date])){
    //     if (usage['total'] > 600){
    //         var data = []
    //         usage['visits'].forEach((interval) => {
    //             typeof(interval) === "object" && data.push({x: url, y: interval})
    //         });
    //         visits.push({name: url, data: data})
    //     }
    // }
    // return visits;
  }

  daysSitesTimeline(timeFrame) {
    let series = [];
    timeFrame.forEach(day => {
      series.push(this.daySitesTimeline(day));
    });
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

  dayTimeline(day = this.today) {
    const date = fn.getDateString(day);
    const visits = this.TimeTable.getDayVisits(date);
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

  // ============================= Table =========================================

  weekSitesUsageFrequency(date = this.today) {
    const urlUsage = this.TimeTable.getSitesWeekTotalFrequencyUsage(this.getWeek(date));
    var data = [];
    for (let [url, usage] of Object.entries(urlUsage)) {
      data.push({
        name: url,
        total: usage['total'],
        frequency: usage['frequency'],
        timePerVist: Math.round((usage['total'] * 100) / usage['frequency']) / 100,
      });
    }
    return data;
  }

  // ============================= Scatter =========================================
  weekSiteVisitScatter(date, urls, watchSites) {
    if (date == null) date = this.today;
    var fetchUrls;
    if (watchSites) fetchUrls = this.WatchSites.getWatchSites();
    if (urls) fetchUrls = urls;
    const week = this.getWeek(date);
    let urlVisits = {}; // url => [[4-20-2020, 1580153151321]...]
    fetchUrls.forEach(url => {
      urlVisits[url] = [];
      week.forEach(day => {
        const dayVisits = this.TimeTable.getSiteDayVisits(day, url);
        for (var i = 0; i < dayVisits.length; i++) {
          typeof dayVisits[i][0] === 'number' &&
            urlVisits[url].push({
              x: new Date(day).getTime(),
              y: new Date(dayVisits[i][0]),
            });
        }
      });
    });
    var data = [];
    const colors = this.colors(fetchUrls.length);
    for (let [url, dataObj] of Object.entries(urlVisits)) {
      // data.push({name: url, data: dataObj})    apex
      data.push({
        label: url,
        borderColor: colors.pop(),
        data: dataObj,
      });
    }
    return {
      datasets: data,
    };
  }

  weekTopNFrequentSites(n = 10, date = this.today) {
    return this.TimeTable.topNFrequentSites(n, this.getWeek(date));
  }

  weekTopNUsageSites(n = 10, date = this.today) {
    return this.TimeTable.topNUsageSites(n, this.getWeek(date));
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
    const topNSites = this.TimeTableData.topNUsageSites(n, week);
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
