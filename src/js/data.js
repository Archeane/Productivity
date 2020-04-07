'use strict';

import Fn from './fn.js';
import Config from './config.js';

var fn = new Fn();
var config = new Config();

function UserException(message) {
  this.message = message;
  this.name = 'UserException';
}

export class AllBlockSite {
  constructor() {
    this.AllBlockSite = {};
  }

  addBlockSite(site, siteTimeLimit) {
    var blockSite = new BlockSite(site, siteTimeLimit);
    AllBlockSite[blockSite.url] = blockSite;
  }

  isBlockSite(url) {
    return this.AllBlockSite.hasOwnProperty(urlFormatter(url));
  }

  siteReachedLimit(url, siteTime) {
    if (!isBlockSite(url)) {
      return false;
    }
    var formattedUrl = urlFormatter(url);
    if (isWorkday(new Date()) && this.AllBlockSite[formattedUrl].hasWorkDayLimit() && this.AllBlockSite[formattedUrl].workdayLimitReached(siteTime)) {
      return true;
    }
    if (this.AllBlockSite[formattedUrl].hasWeekLimit() && this.AllBlockSite[formattedUrl].weekLimitReached(siteTime)) {
      return true;
    }
    if (this.AllBlockSite[formattedUrl].dayLimitReached(siteTime)) {
      return true;
    }
    return false;
  }
}

class BlockSite {
  constructor(site, dayLimit, weekLimit = null, workdayLimit = null) {
    this.url = urlFormatter(site);
    this.dayLimit = dayLimit;
    this.weekLimit = weekLimit;
    this.workdayLimit = workdayLimit;
    this.blockedOccurance = 0; // number of times the site is blocked
  }

  hasWorkDayLimit() {
    return this.workdayLimit != null;
  }

  workdayLimitReached(time) {
    if (time >= this.workdayLimit) {
      this.blockedOccurance++;
      return true;
    }
    return false;
  }

  hasWeekLimit() {
    return this.weekLimit != null;
  }

  weekLimitReached(time) {
    if (time >= this.weekLimit) {
      this.blockedOccurance++;
      return true;
    }
    return false;
  }

  dayLimitReached(time) {
    if (time >= this.dayLimit) {
      this.blockedOccurance++;
      return true;
    }
    return false;
  }
}

class TimeTable {
  // get usage total per time unit
  // @return {url: time}
  getDayUsage(day, timeTable) {
    return timeTable[fn.getDateString(day)];
  }

  getWeekUsage(week) {
    week = [];
    for (day in week) week.push(this.timeTable[day]);
    return week;
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
  weekChartPieData() {}
  monthChartPieData() {}
  weekSiteDataArray(date, url, timeTable) {
    var week = this.getWeek(date);
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
  monthChartSiteLineData() {}
  weekChartTotalTime() {}
  monthChartTotalTime() {}
  siteWeekTime() {}
  siteMonthTime() {}
  sitesWeekTime() {}
  sitesMonthTime() {}
}

export async function getTimeTable(cb) {
  chrome.runtime.sendMessage({ request: 'getTimeTable' }, function(response) {
    cb(response.done);
  });
}
