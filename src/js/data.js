'use strict';

import Fn from './fn.js';
import Config from './config.js';
import moment from 'moment';
import { colors } from 'vuetify/lib';

var fn = new Fn();
var config = new Config();
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

export async function getWatchSites() {
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

export async function removeWatchSite(url) {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'removeWatchSite',
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

export async function getStartOfWeek() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'getStartOfWeek',
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

export async function setStartOfWeek(day) {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'setStartOfWeek',
          day: day,
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

export async function getIdleTime() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'getIdleTime',
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

export async function setIdleTime(time) {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'setIdleTime',
          time: time,
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

export async function exportToCSV() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'exportToCSV',
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

export async function clearAllData() {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
        {
          request: 'clearAllData',
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

  getDaySiteUsage(day, url) {
    return day in this.timeTable && url in this.timeTable[day] ? this.timeTable[day][url] : {};
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
          if ('total' in usage) weekTotal[i] += Math.floor(usage['total'] / 60);
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

  /**
   *
   * @param {String} day
   * @param {String} url
   * @returns timetable[day][url]['visits]
   */
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
              val: url.replace(/([.]\w+)$/, '').replace(/^www\./, ''),
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

  timeFrameTotalTime(timeFrame) {
    var timeFrameUsage = Array(timeFrame.length).fill(0);
    for (var i = 0; i < timeFrame.length; i++) {
      var day = timeFrame[i];
      if (day in this.timeTable) {
        this.watchSites.forEach(url => {
          if (url in this.timeTable[day]) {
            timeFrameUsage[i] += Math.floor(this.timeTable[day][url]['total'] / 60);
          }
        });
      }
    }
    return timeFrameUsage;
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

  /**
   *
   * @param {Array} time frame
   * @return {Map} (url => {total: , frequency:, timeBtwVisits:,})
   */
  getTimeFrameTotalFrequencyUsage(week) {
    var urlUsage = {};

    this.watchSites.forEach(url => {
      var days = 0;
      week.forEach(day => {
        if (!(day in this.timeTable)) return;
        if (!(url in this.timeTable[day])) return;
        if (!(url in urlUsage))
          urlUsage[url] = {
            total: 0,
            frequency: 0,
            timeBtwVisit: 0,
          };
        const usage = this.timeTable[day][url];
        urlUsage[url]['total'] += Math.floor(usage['total'] / 60);
        var totalIntervalTime = 0,
          freq = 0;
        for (var i = 1; i < usage['visits'].length; i++) {
          if (typeof usage['visits'][i] !== 'number' && typeof usage['visits'][i - 1] !== 'number') {
            var s = usage['visits'][i - 1][1],
              e = usage['visits'][i][0];
            if (e - s > 60 * 1000) (totalIntervalTime += e - s), (freq += 1);
          }
        }
        if (freq > 0 && totalIntervalTime != null) {
          urlUsage[url]['timeBtwVisit'] += totalIntervalTime / (1000 * freq);
          urlUsage[url]['frequency'] += freq;
        }
        // console.log(`${day}, ${url}, seconds btw visit: ${urlUsage[url]['timeBtwVisit']}, visits.length: ${usage['visits'].length}, totalIntervaltime: ${totalIntervalTime}, freq: ${freq}`)
        days += 1;
      });
      if (url in urlUsage) urlUsage[url]['timeBtwVisit'] /= days;
    });
    return urlUsage;
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
    if (num_of_colors == null) return color_palette;
    if (num_of_colors > color_palette.length) {
      // todo: resolve
      return color_palette;
    }
    // var colors = [];
    // for (var i = 0; i < num_of_colors; i++) {
    //   let rand = [Math.floor(Math.random() * color_palette.length)];
    //   colors.push(color_palette[rand]);
    //   color_palette.splice(rand, 1);
    // }
    return color_palette.slice(0, num_of_colors);
  } // return same number of colors as number of items in data passed in

  getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
  getWeek(day) {
    let week = [];
    const startOfWeek = moment(day).startOf(config.getStartOfWeek());
    const endOfWeek = moment(day).endOf(config.getStartOfWeek());
    while (!startOfWeek.isSame(endOfWeek, 'date')) {
      week.push(startOfWeek.clone().format('YYYY-MM-DD'));
      startOfWeek.add(1, 'd');
    }
    week.push(endOfWeek.format('YYYY-MM-DD'));
    return week;
  }
  getMonth(day) {
    let month = [];
    const startOfMonth = moment(day).startOf('month');
    const endOfMonth = moment(day).endOf('month');
    while (!startOfMonth.isSame(endOfMonth, 'date')) {
      month.push(startOfMonth.clone().format('YYYY-MM-DD'));
      startOfMonth.add(1, 'd');
    }
    month.push(endOfMonth.format('YYYY-MM-DD'));
    return month;
  }

  getWatchSites() {
    return this.WatchSites.getWatchSites();
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
    } else if (
      start instanceof Date &&
      end instanceof Date &&
      Object.prototype.toString.call(start) === '[object Date]' &&
      Object.prototype.toString.call(end) === '[object Date]'
    ) {
      (currDate = moment(start)), (lastDate = moment(end));
    } else if (typeof start === 'number' && end instanceof Date) {
      (currDate = moment(end).subtract(-1 * start, 'd')), (lastDate = moment(end));
    } else {
      return [];
    }
    while (!currDate.isSame(lastDate, 'date')) {
      dates.push(currDate.clone().format('YYYY-MM-DD'));
      currDate.add(1, 'd');
    }
    dates.push(lastDate.format('YYYY-MM-DD'));
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
    return this.WatchSites.timeFrameTotalTime(timeFrame);
  }

  // =============================Line charts =========================================

  weekWatchSitesLineChart(today, isMonth) {
    if (today == null) today = this.today;
    var datasets = [],
      week;
    isMonth ? (week = this.getMonth(today)) : (week = this.getWeek(today));
    const weekUsage = this.WatchSites.weekWatchSitesUsage(week);
    const colors = this.colors(); //Object.keys(weekUsage).length);
    for (let [url, usageArr] of Object.entries(weekUsage)) {
      datasets.push({
        label: url.replace(/([.]\w+)$/, '').replace(/^www\./, ''),
        borderColor: colors.shift(),
        data: usageArr,
        fill: false,
      });
    }
    return {
      labels: week,
      datasets: datasets,
    };
  }

  /**
   *
   * @param {Date} date
   * @param {Number} n 0 = just this wk, 1 = this + last wk; n weeks before this date
   */
  watchSitesTotalLineChart(date, n, isWatchSites, isMonth) {
    var datasets = [],
      labels = [],
      urls = [];
    const colors = ['#ffb3ba', '#bae1ff', '#baffc9', '#ffdfba', '#ffffba'];
    if (date == null) date = this.today;
    if (n == null) n = 0;
    if (isWatchSites) urls = this.getWatchSites();
    if (!isMonth) labels = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
    for (var k = 0; k < n; k++) {
      var week, weekTotal, dateK;
      if (isMonth) {
        dateK = moment(date).subtract(k, 'month');
        week = this.getMonth(dateK);
        weekTotal = Array(week.length).fill(0);
        labels = week;
      } else {
        dateK = moment(date).subtract(k, 'week');
        week = this.getWeek(dateK);
        weekTotal = Array(7).fill(0);
      }
      for (var i = 0; i < week.length; i++) {
        if (!isWatchSites) urls = this.timeFrameVisitedSites(null, null, week);
        urls.forEach(url => {
          var dayUsage = this.TimeTable.getDaySiteUsage(week[i], url);
          if (dayUsage != {} && 'total' in dayUsage) weekTotal[i] += Math.floor(dayUsage.total / 60);
        });
      }
      if (isMonth) (weekTotal[6] /= 1000), (weekTotal[8] /= 100), (weekTotal[10] /= 500), (weekTotal[13] /= 3000); //todo: delete
      const color = colors.shift();
      datasets.push({
        label: isMonth ? `Month of ${dateK.format('MM/DD')}` : `Week of ${dateK.format('MM/DD')}`,
        borderColor: color,
        backgroundColor: fn.hex2rgba(color, 0.2),
        fill: true,
        data: weekTotal,
      });
    }
    return {
      labels: labels,
      datasets: datasets,
    };
  }

  weekSiteUsageLineChart(urls, day, isMonth) {
    if (urls == null) return {};
    if (day == null) day = this.today;
    var week,
      datasets = [];
    isMonth ? (week = this.getMonth(day)) : (week = this.getWeek(day));
    const colors = this.colors(); //urls.length);
    urls.forEach(url => {
      datasets.push({
        label: url,
        borderColor: colors.shift(),
        fill: false,
        data: this.TimeTable.siteWeekTime(week, url),
      });
    });
    return {
      labels: week,
      datasets: datasets,
    };
  }

  timeFrameVisitedSites(start, end, week) {
    var timeFrame;
    if (week) timeFrame = week;
    else timeFrame = this.getTimeFrame(start, end);
    return this.TimeTable.topNUsageSites(-1, timeFrame);
  }
  // ============================= Pie charts =========================================

  dayChartPieData(date, max = 15) {
    if (date == null) date = moment(this.today).format('YYYY-MM-DD');
    else date = moment(date).format('YYYY-MM-DD');
    var dayUsage = this.TimeTable.getDayUsage(date);
    dayUsage = Object.entries(dayUsage)
      .sort((a, b) => b[1]['total'] - a[1]['total'])
      .slice(0, max);
    var labels = dayUsage.map(arr => {
      return arr[0];
    });
    var series = dayUsage.map(arr => {
      return Math.floor(arr[1]['total'] / 60);
    });
    return {
      labels: labels,
      series: series,
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
  nWeeksWatchSitesChartRadar(n, date, isMonth) {
    if (date == null) date = this.today;
    var datasets = [];
    const watchSites = this.WatchSites.getWatchSites();
    const backgroundColors = ['rgba(255,99,132, 0.2)', 'rgba(54,162,235, 0.2)', 'rgba(153,102,255, 0.2)', 'rgba(75,192,192, 0.2)', 'rgba(255,159,64, 0.2)'];
    const borderColors = ['rgb(255,99,132)', 'rgb(54,162,235)', 'rgb(153,102,255)', 'rgb(75,192,192)', 'rgb(255,159,64)'];
    for (var i = 0; i < n; i++) {
      var week;
      isMonth ? (week = this.getMonth(date)) : (week = this.getWeek(date));
      const weekTotal = [];
      watchSites.forEach(url => {
        weekTotal.push(
          this.TimeTable.siteWeekTime(week, url).reduce((a, b) => {
            return a + b;
          })
        );
      });
      const color = borderColors.shift();
      datasets.push({
        label: isMonth ? `month of ${fn.getDateString(date)}` : `week of ${fn.getDateString(date)}`,
        borderColor: color,
        backgroundColor: backgroundColors.shift(),
        pointBorderColor: color,
        data: weekTotal,
        fill: true,
      });
      isMonth ? (date = moment(date).subtract(1, 'months')) : (date = moment(date).subtract(1, 'week'));
    }
    return {
      labels: watchSites.map(url => url.replace(/([.]\w+)$/, '').replace(/^www\./, '')),
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
  siteUsageStackedBarData(start, end, watchSites) {
    const timeFrame = this.getTimeFrame(start, end);
    let weekUsage = {};
    let weekTotalTime = 0;
    let dayTotalTimes = Array(timeFrame.length).fill(0);
    for (var i = 0; i < timeFrame.length; i++) {
      const dayUsage = this.TimeTable.getDayUsage(timeFrame[i]);
      for (let [url, usage] of Object.entries(dayUsage)) {
        if (!(url in weekUsage)) weekUsage[url] = Array(timeFrame.length).fill(0);
        const total = Math.floor(usage['total'] / 60);
        weekUsage[url][i] = total;
        weekTotalTime += total;
        dayTotalTimes[i] += total;
      }
    }
    const colors = this.colors(); //Object.keys(weekUsage).length);
    let datasets = [];
    const datalabels = {
      formatter: function(value, context) {
        if (value > 1) {
          const url = context.dataset.label;
          return url.replace(/([.]\w+)$/, '').replace(/^www\./, '');
        } else {
          return '';
        }
      },
    };
    if (watchSites) {
      const urls = this.WatchSites.getWatchSites();
      urls.forEach(url => {
        datasets.push({
          label: url,
          backgroundColor: colors.shift(),
          data: weekUsage[url],
        });
      });
      return {
        labels: timeFrame,
        datasets: datasets,
        datalabels: datalabels,
      };
    }
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
          backgroundColor: colors.shift(),
          data: usageArr,
          datalabels: datalabels,
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
    if (urls) {
      var data = this.TimeTable.getDaySiteVisits(date, dayFrame, urls);
      return [
        {
          name: fn.getDateString(date),
          data: data,
        },
      ];
    } else if (watchSites) {
      return [
        {
          name: fn.getDateString(date),
          data: this.WatchSites.getDaySiteVisits(date, dayFrame),
        },
      ];
    } else {
      return {};
    }
  }

  watchSitesWeekTimeline(dayFrame, date, separateUrl) {
    if (date == null) date = this.today;
    const week = this.getTimeFrame(-2, date);
    var sitesData = {};
    if (separateUrl) {
      week.forEach(day => {
        var dayData = this.WatchSites.getDaySiteVisits(day, dayFrame);
        dayData.forEach(visit => {
          var url = visit.x;
          if (!(url in sitesData)) sitesData[url] = [];
          var s = moment(visit.y[0]),
            e = moment(visit.y[1]);
          var h = s.hour(),
            m = s.minute(),
            h1 = e.hour(),
            m1 = e.minute(),
            interval = [0, 0];
          interval[0] = moment(week[0])
            .hour(h)
            .minute(m)
            .valueOf();
          interval[1] = moment(week[0])
            .startOf('week')
            .hour(h1)
            .minute(m1)
            .valueOf();
          sitesData[url].push({
            x: day,
            y: interval,
          });
        });
      });
      var series = [];
      for (let [url, usage] of Object.entries(sitesData)) {
        series.push({ name: url, data: usage });
      }
      return series;
    } else {
      var data = [];
      week.forEach(day => {
        var dayData = this.WatchSites.getDaySiteVisits(day, dayFrame);
        dayData.forEach(visit => {
          var s = moment(visit.y[0]),
            e = moment(visit.y[1]);
          var h = s.hour(),
            m = s.minute(),
            h1 = e.hour(),
            m1 = e.minute(),
            interval = [0, 0];
          interval[0] = moment(week[0])
            .hour(h)
            .minute(m)
            .valueOf();
          interval[1] = moment(week[0])
            .hour(h1)
            .minute(m1)
            .valueOf();
          data.push({
            x: day,
            y: interval,
          });
        });
      });
      return [{ data: data }];
    }
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
        if (currentHour < intByHours.length) {
          intByHours[currentHour].push({
            timeRange: [interval[0], this.getNewDateByHour(currentHour + 1, interval[0])],
            val: intervalObj['val'],
          });
        }
        currentHour += 1;
        while (interval[1].getHours() > currentHour) {
          if (currentHour < intByHours.length) {
            intByHours[currentHour].push({
              timeRange: [this.getNewDateByHour(currentHour, interval[0]), this.getNewDateByHour(currentHour + 1, interval[0])],
              val: intervalObj['val'],
            });
          }
          currentHour += 1;
        }
        if (currentHour < intByHours.length) {
          intByHours[currentHour].push({
            timeRange: [this.getNewDateByHour(currentHour, interval[0]), interval[1]],
            val: intervalObj['val'],
          });
        }
      } else if (interval[0].getHours() == currentHour && interval[1].getHours() == currentHour) {
        if (currentHour < intByHours.length) {
          intByHours[currentHour].push({
            timeRange: [interval[0], interval[1]],
            val: intervalObj['val'],
          });
        }
      } else if (interval[0].getHours() > currentHour) {
        while (interval[0].getHours() > currentHour) {
          currentHour += 1;
        }
        if (interval[1].getHours() == currentHour) {
          if (currentHour < intByHours.length) {
            intByHours[currentHour].push({
              timeRange: [interval[0], interval[1]],
              val: intervalObj['val'],
            });
          }
        } else {
          if (currentHour < intByHours.length) {
            intByHours[currentHour].push({
              timeRange: [interval[0], this.getNewDateByHour(currentHour + 1, interval[0])],
              val: intervalObj['val'],
            });
          }
          currentHour += 1;
          while (interval[1].getHours() > currentHour) {
            if (currentHour < intByHours.length) {
              intByHours[currentHour].push({
                timeRange: [this.getNewDateByHour(currentHour, interval[0]), this.getNewDateByHour(currentHour + 1, interval[0])],
                val: intervalObj['val'],
              });
            }
            currentHour += 1;
          }
          if (currentHour < intByHours.length) {
            intByHours[currentHour].push({
              timeRange: [this.getNewDateByHour(currentHour, interval[0]), interval[1]],
              val: intervalObj['val'],
            });
          }
        }
      }
    }
    return intByHours;
  }

  dayTimeline(day = this.today) {
    const date = moment(day).format('YYYY-MM-DD');
    const visits = this.TimeTable.getDayVisits(date);
    if (visits.length > 0) {
      var intByHour = this.breakDayToHoursIntervals(visits);
      return intByHour;
    }
    return null;
  }

  // ============================= Table =========================================

  dayUsageTable(date, watchSite) {
    if (date == null) date = this.today;
    const dayUsage = this.TimeTable.getDayUsage(moment(date).format('YYYY-MM-DD'));
    var data = [],
      urls;
    if (watchSite) urls = this.getWatchSites();
    for (let [url, usage] of Object.entries(dayUsage)) {
      if (usage['total'] / 60 > 1) {
        if (watchSite) {
          if (url in urls)
            data.push({
              name: url,
              total: Math.floor(usage['total'] / 60),
              frequency: usage['visits'].length - 2,
            });
        } else {
          data.push({
            name: url,
            total: Math.floor(usage['total'] / 60),
            frequency: usage['visits'].length - 2,
          });
        }
      }
    }
    return data.sort((a, b) => {
      return b['total'] - a['total'];
    });
  }

  weekSitesUsageFrequency(date) {
    if (date == null) date = this.today;
    const urlUsage = this.TimeTable.getSitesWeekTotalFrequencyUsage(this.getWeek(date));
    var data = [];
    for (let [url, usage] of Object.entries(urlUsage)) {
      if (usage['total'] > 0) {
        data.push({
          name: url,
          total: usage['total'],
          frequency: usage['frequency'],
          timePerVist: Math.round((usage['total'] * 100) / usage['frequency']) / 100,
        });
      }
    }
    return data;
  }

  timeFrameWatchSitesUsageFrequency(start, end) {
    const timeFrame = this.getTimeFrame(start, end);
    const urlUsage = this.WatchSites.getTimeFrameTotalFrequencyUsage(timeFrame);
    var data = [];
    for (let [url, usage] of Object.entries(urlUsage)) {
      data.push({
        name: url,
        total: usage['total'],
        frequency: usage['frequency'],
        timePerVist: Math.round((usage['total'] * 100) / usage['frequency']) / 100,
        freqDay: Math.round(usage['frequency'] / timeFrame.length),
        timeBtwVisit: Math.round(usage['timeBtwVisit'] / 60),
      });
    }
    return data;
  }

  // ============================= Scatter =========================================
  weekSiteVisitScatter(date, urls, watchSites) {
    if (date == null) date = this.today;
    var fetchUrls,
      labels = [],
      data = [];
    if (watchSites) fetchUrls = this.WatchSites.getWatchSites();
    if (urls) fetchUrls = urls;
    const week = this.getWeek(date);
    let urlVisits = {}; // url => [[4-20-2020, 1580153151321]...]
    fetchUrls.forEach(url => {
      urlVisits[url] = [];
      week.forEach(day => {
        const dayVisits = this.TimeTable.getSiteDayVisits(day, url);
        if (dayVisits == []) return;
        for (var i = 0; i < dayVisits.length; i++) {
          if (typeof dayVisits[i] !== 'number') {
            var d = new Date(dayVisits[i][0]),
              h = d.getHours(),
              m = d.getMinutes();
            var x = new Date(day).setHours(0, 0, 0, 0);
            if (!labels.includes(x)) labels.push(x);
            urlVisits[url].push({
              x: x,
              y: h * 60 + m,
            });
          }
        }
      });
    });
    const colors = this.colors(); //fetchUrls.length);
    for (let [url, dataObj] of Object.entries(urlVisits)) {
      // console.log(url)
      // dataObj.forEach(obj => console.log(obj.x, new Date(obj.x)))
      // data.push({name: url, data: dataObj})    apex
      const color = colors.shift();
      data.push({
        label: url,
        borderColor: color,
        backgroundColor: color,
        data: dataObj,
      });
    }
    return {
      labels: labels,
      datasets: data,
    };
  }
  //=================== Heat map
  /**
   *
   * @param {Array} interval = single [milisecond enter, miliseconds exit]
   * @returns {1: minutes in hour 1, 2: minutes in hour 2...}
   */
  breakIntervalByHour(interval) {
    var start = moment(interval[0]),
      end = moment(interval[1]),
      data = {};
    //console.log(start.toDate(), end.toDate())
    if (start.hour() < end.hour()) {
      data[start.hour()] = 60 - parseInt(start.minute());
      if (end.hour() - start.hour() == 1) data[end.hour()] = parseInt(end.minute());
      else {
        start.add('1', 'hour');
        while (start.hour() < end.hour()) {
          data[start.hour()] = 60;
          start.add('1', 'hour');
        }
        data[end.hour()] = parseInt(end.minute());
      }
    } else {
      data[start.hour()] = parseInt(end.minute()) - parseInt(start.minute());
    }
    return data;
  }

  weekSiteVisitHeatMap(date, sites, watchSites) {
    if (date == null) date = this.today;
    const timeFrame = this.getWeek(date);
    // const timeFrame = this.getTimeFrame(start, end);
    var urls,
      urlVisits = {};
    if (sites) urls = sites;
    else if (watchSites) urls = this.getWatchSites();
    else return;
    var dataseries = {}; // url => [{name: "1AM", data: [{x: Day1, y: 30mins}]}]
    urls.forEach(url => {
      if (!(url in urlVisits)) urlVisits[url] = {}; // url => {1AM: [day1 minutes, day2_minutes, ...]
      for (var k = 0; k < timeFrame.length; k++) {
        const dayVisits = this.TimeTable.getSiteDayVisits(timeFrame[k], url);
        // console.log(url, dayVisits);
        if (dayVisits == []) return;
        for (var i = 0; i < dayVisits.length; i++) {
          if (typeof dayVisits[i] !== 'number') {
            const hoursVisit = this.breakIntervalByHour(dayVisits[i]);
            for (let [hour, minutes] of Object.entries(hoursVisit)) {
              if (!(hour in urlVisits[url])) urlVisits[url][hour] = Array(timeFrame.length).fill(0);
              urlVisits[url][hour][k] += parseInt(minutes);
              // console.log(hoursVisit, urlVisits[url][hour])
            }
          }
        }
      }
      // console.log(url, urlVisits[url]);
      dataseries[url] = [];
      for (var hour = 0; hour < 24; hour++) {
        if (hour in urlVisits[url]) {
          var hourObj = {
            name: hour,
            data: [],
          };
          for (var dayCounter = 0; dayCounter < urlVisits[url][hour].length; dayCounter++) {
            const minutesInDay = urlVisits[url][hour][dayCounter];
            hourObj.data.push({
              x: timeFrame[dayCounter],
              y: minutesInDay,
            });
          }
          dataseries[url].push(hourObj);
        }
      }
      // console.log(dataseries[url]);
    });
    return dataseries;
  }
}
