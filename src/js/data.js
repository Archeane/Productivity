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
  colors(data) {} // return same number of colors as number of items in data passed in
  dayChartPieData(date, timeTable) {
    if (timeTable == null) {
      return;
    }
    const usage = timeTableFunctions.getDayUsage(date, timeTable);
    let data = [];
    let labels = [];
    for (let [url, time] of Object.entries(usage)) typeof url === 'string' && labels.push(url), typeof time === 'number' && data.push(time);

    return {
      datasets: [
        {
          data: data,
        },
      ],
      labels: labels,
    };
  }
  weekChartPieData() {}
  monthChartPieData() {}
  weekChartSite() {}
  monthChartSite() {}
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
