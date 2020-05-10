/*
    1. modify page when needing to block
    2. add options and link to update blocked sites
    3. add time per date option to domains
    4. 
*/

'use strict';

import Fn from './js/fn.js';
import Config from './js/config.js';

var fn = new Fn();
var config = new Config();

var storageLocal = (function() {
  var r = function(r, t, a) {
      // console.log(`r:${r}, t: ${t}, a: ${a}`);
      var e = {};
      e[r] = JSON.stringify(t);
      chrome.storage.local.set(e, a);
      return !0;
    },
    /**
            @params
                r - what you are loading (ex. domains, date-start, seconds-alltime)
        **/
    t = function(r, t, a) {
      //console.log(`r:${r}, t: ${t}, a: ${a}`);
      var e = {};
      e[r] = JSON.stringify(t);
      chrome.storage.local.get(e, function(t) {
        var e = {};
        e[r] = JSON.parse(t[r]);
        //console.log(`r:${r} e[r]:${e[r]}`);
        a(e);
      });
      return !0;
    };
  return {
    save: r,
    load: t,
  };
})();

var domains = {},
  watchSites = [], // [url1, url2 ...]
  blockedSites = {},
  timeTable = {}, // date: [{domain: timeForDomain}...]
  dates = {
    today: fn.getDateString(),
    start: '',
  },
  seconds = {
    today: 0,
    alltime: 0,
  },
  timeIntervals = {
    update: 0,
    save: 0,
  },
  settings = {
    idleTime: config.IDLE_TIME_DEFAULT,
    startOfWeek: config.START_OF_WEEK,
    graphGap: config.GRAPH_GAP_DEFAULT,
    badgeDisplay: config.BADGE_DISPLAY_DEFAULT,
    screenshotInstructionsRead: config.SCREENSHOT_INSTRUCTIONS_READ_DEFAULT,
  },
  domainsChanged = !1,
  blockedSitesChanged = !1,
  STORAGE_DOMAINS = 'domains',
  STORAGE_WATCH_SITES = 'watch-sites',
  STORAGE_BLOCKED_SITES = 'blocked-sites',
  STORAGE_TIME_TABLE = 'time-table',
  STORAGE_DATE_START = 'date-start',
  STORAGE_SECONDS_ALLTIME = 'seconds-alltime',
  STORAGE_IDLE_TIME = 'idle-time',
  STORGAE_START_OF_WEEK = 'start-of-week',
  STORAGE_GRAPH_GAP = 'graph-gap',
  STORAGE_BADGE_DISPLAY = 'badge-display',
  STORAGE_SCREENSHOT_INSTRUCTIONS_READ = 'storage-instructions-read',
  /**
      loads STORAGE_DOMAINS from storageLocal <- json.strinify()
    **/
  loadDomains = function(e) {
    // returns the STORAGE_DOMAINS object in chrome.localStorage
    return (
      storageLocal.load(STORAGE_DOMAINS, {}, function(a) {
        e(a), fn.dcl('Domains loaded: ' + Object.keys(domains).length + ' domains');
      }),
      !0
    );
  },
  saveDomains = function() {
    // saves the domains object in local file to chrome.localStorage
    return (
      storageLocal.save(STORAGE_DOMAINS, domains, function() {
        (domainsChanged = !1), fn.dcl('Domains saved: ' + Object.keys(domains).length + ' domains');
      }),
      !0
    );
  },
  //=====================
  loadWatchSites = function(cb) {
    return (
      storageLocal.load(STORAGE_WATCH_SITES, [], function(watch_sites) {
        cb(watch_sites);
        fn.dcl('Watch Sites loaded: ' + Object.keys(watch_sites).length + ' watch_sites');
        console.log(watch_sites);
      }),
      !0
    );
  },
  saveWatchSites = function() {
    return (
      storageLocal.save(STORAGE_WATCH_SITES, watchSites, function() {
        fn.dcl('Watch Sites saved: ' + Object.keys(watchSites).length + ' watch sites');
      }),
      !0
    );
  },
  addWatchSites = function(url) {
    watchSites.indexOf(url) === -1 && watchSites.push(url);
  },
  removeWatchSites = function(url) {
    var index = watchSites.indexOf(url);
    index !== -1 && watchSites.splice(index, 1);
  },
  loadBlockedSites = function(cb) {
    return (
      storageLocal.load(STORAGE_BLOCKED_SITES, {}, function(blocked_sites) {
        cb(blocked_sites);
        fn.dcl('Blocked Sites loaded: ' + Object.keys(blocked_sites).length + ' blocked_sites');
        console.log(blocked_sites);
      }),
      !0
    );
  },
  appendBlockedSites = function(url, limit) {
    var domain = fn.parseDomainFromUrl(url);
    blockedSites.hasOwnProperty(domain) || ((blockedSites[domain] = getBlockedSiteObj()), (blockedSites[domain].name = domain));
    var i = blockedSites[domain];
    i.daylimit.seconds = limit;
  },
  deleteBlockedSites = function(url) {
    return blockedSites.hasOwnProperty(url) || blockedSites.hasOwnProperty(fn.parseDomainFromUrl(url))
      ? blockedSites.delete(url) || blockedSites.delete(fn.parseDomainFromUrl(url))
      : 'An error occured, please try again later';
  },
  saveBlockedSites = function() {
    return (
      storageLocal.save(STORAGE_BLOCKED_SITES, blockedSites, function() {
        blockedSitesChanged = !1;
        fn.dcl('Blocked Sites saved: ' + Object.keys(blockedSites).length + ' blockedSites');
        //console.log(blockedSites);
      }),
      !0
    );
  },
  loadTimeTable = function(cb) {
    return (
      storageLocal.load(STORAGE_TIME_TABLE, {}, function(timeTable) {
        cb(timeTable);
        fn.dcl('timeTable loaded: ' + Object.keys(timeTable).length + ' table entries');
        console.log(timeTable);
      }),
      !0
    );
  },
  saveTimeTable = function() {
    return (
      storageLocal.save(STORAGE_TIME_TABLE, timeTable, () => {
        fn.dcl('Time table saved: ' + Object.keys(timeTable).length + ' table entries');
      }),
      !0
    );
  },
  clearTimeTable = () => {
    return (timeTable = {}), saveTimeTable(), !0;
  },
  updateTimeTable = function(date, domainObj) {
    try {
      if (timeTable.hasOwnProperty(date)) {
        if (!timeTable[date].hasOwnProperty(domainObj.name)) {
          timeTable[date][domainObj.name] = { total: domainObj['days'][date]['seconds'] };
        }
        if (domainObj['days'][date].hasOwnProperty('seconds')) {
          let a = timeTable[date][domainObj.name];
          a['total'] = domainObj['days'][date]['seconds'];
          // update visiting period
          if (a.hasOwnProperty('visits')) {
            //check if current time is within tick frame of last visiting period's last active time
            a['lastActive'] = new Date().getTime();
            let lastActiveTime = a['visits'].slice(-1)[0][1];
            if (a['lastActive'] - lastActiveTime <= 30000) {
              // just update the last visiting interval
              a['visits'].slice(-1)[0][1] = a['lastActive'];
            } else {
              // push a new interval
              a['visits'].push([a['lastActive'], a['lastActive']]);
            }
          } else {
            a['lastActive'] = new Date().getTime();
            a['visits'] = [a['lastActive'], a['lastActive']];
          }
        }
      } else {
        timeTable[date] = {};
        timeTable[date][domainObj.name] = { total: domainObj['days'][date]['seconds'] };
      }
    } catch (err) {
      console.log('updateTimeTable Error ', err);
    }
  },
  //=====================
  clearAllGeneratedData = function() {
    return (
      (domains = {}),
      (watchSites = []),
      (blockedSites = {}),
      (timeTable = {}),
      saveDomains(),
      saveWatchSites(),
      saveBlockedSites(),
      saveTimeTable(),
      (seconds.today = 0),
      (seconds.alltime = 0),
      saveSecondsAlltime(),
      (dates.start = dates.today),
      saveDateStart(),
      fn.dcl('Clear all generated data: done'),
      !0
    );
  },
  /*
        loads the start date from chrome.storage.local
    */
  loadDateStart = function(e) {
    return (
      storageLocal.load(STORAGE_DATE_START, e, function(e) {
        dates.start = e[STORAGE_DATE_START];
        saveDateStart();
        fn.dcl('Start date loaded: ' + e[STORAGE_DATE_START]);
      }),
      !0
    );
  },
  /*
        saves the start date to chrome.storage.local
    */
  saveDateStart = function() {
    return (
      storageLocal.save(STORAGE_DATE_START, dates.start, function() {
        fn.dcl('Start date saved: ' + dates.start);
      }),
      !0
    );
  },
  loadSecondsAlltime = function() {
    return (
      storageLocal.load(STORAGE_SECONDS_ALLTIME, 0, function(e) {
        (seconds.alltime = e[STORAGE_SECONDS_ALLTIME]), saveSecondsAlltime(), fn.dcl('Seconds alltime loaded: ' + e[STORAGE_SECONDS_ALLTIME]);
      }),
      !0
    );
  },
  saveSecondsAlltime = function() {
    return (
      storageLocal.save(STORAGE_SECONDS_ALLTIME, seconds.alltime, function() {
        fn.dcl('Seconds alltime saved: ' + seconds.alltime);
      }),
      !0
    );
  },
  loadStartOfWeek = function() {
    return (
      storageLocal.load(STORGAE_START_OF_WEEK, config.START_OF_WEEK, function(e) {
        (settings.startOfWeek = e[STORGAE_START_OF_WEEK]), saveStartOfWeek(), fn.dcl('Start Of Week loaded: ' + e[STORGAE_START_OF_WEEK]);
      }),
      !0
    );
  },
  saveStartOfWeek = function() {
    return (
      storageLocal.save(STORGAE_START_OF_WEEK, settings.startOfWeek, function() {
        fn.dcl('Start Of Week saved: ' + settings.startOfWeek);
      }),
      !0
    );
  },
  setStartOfWeek = function(e) {
    return (settings.startOfWeek = e || config.START_OF_WEEK), config.toggleStartOfWeek(), saveStartOfWeek(), !0;
  },
  loadIdleTime = function() {
    return (
      storageLocal.load(STORAGE_IDLE_TIME, config.IDLE_TIME_DEFAULT, function(e) {
        (settings.idleTime = e[STORAGE_IDLE_TIME]), saveIdleTime(), fn.dcl('Idle time loaded: ' + e[STORAGE_IDLE_TIME]);
      }),
      !0
    );
  },
  saveIdleTime = function() {
    return (
      storageLocal.save(STORAGE_IDLE_TIME, settings.idleTime, function() {
        fn.dcl('Idle time saved: ' + settings.idleTime);
      }),
      !0
    );
  },
  setIdleTime = function(e) {
    return (settings.idleTime = parseInt(e) || config.IDLE_TIME_DEFAULT), saveIdleTime(), !0;
  },
  loadGraphGap = function() {
    return (
      storageLocal.load(STORAGE_GRAPH_GAP, config.GRAPH_GAP_DEFAULT, function(e) {
        (settings.graphGap = e[STORAGE_GRAPH_GAP]), saveGraphGap(), fn.dcl('Graph gap loaded: ' + e[STORAGE_GRAPH_GAP]);
      }),
      !0
    );
  },
  saveGraphGap = function() {
    return (
      storageLocal.save(STORAGE_GRAPH_GAP, settings.graphGap, function() {
        fn.dcl('Graph gap saved: ' + settings.graphGap);
      }),
      !0
    );
  },
  setGraphGap = function(e) {
    var a = parseFloat(e);
    return (settings.graphGap = isFinite(a) ? a : config.GRAPH_GAP_DEFAULT), !0;
  },
  loadBadgeDisplay = function() {
    return (
      storageLocal.load(STORAGE_BADGE_DISPLAY, config.BADGE_DISPLAY_DEFAULT, function(e) {
        (settings.badgeDisplay = e[STORAGE_BADGE_DISPLAY]), saveBadgeDisplay(), fn.dcl('Badge display loaded: ' + e[STORAGE_BADGE_DISPLAY]);
      }),
      !0
    );
  },
  saveBadgeDisplay = function() {
    return (
      storageLocal.save(STORAGE_BADGE_DISPLAY, settings.badgeDisplay, function() {
        fn.dcl('Badge display saved: ' + settings.badgeDisplay);
      }),
      !0
    );
  },
  setBadgeDisplay = function(e) {
    return (settings.badgeDisplay = 'boolean' == typeof e ? e : config.BADGE_DISPLAY_DEFAULT), !0;
  },
  loadScreenshotInstructionsRead = function() {
    return (
      storageLocal.load(STORAGE_SCREENSHOT_INSTRUCTIONS_READ, config.SCREENSHOT_INSTRUCTIONS_READ_DEFAULT, function(e) {
        (settings.screenshotInstructionsRead = e[STORAGE_SCREENSHOT_INSTRUCTIONS_READ]),
          saveScreenshotInstructionsRead(),
          fn.dcl('Storage instructions set loaded: ' + e[STORAGE_SCREENSHOT_INSTRUCTIONS_READ]);
      }),
      !0
    );
  },
  saveScreenshotInstructionsRead = function() {
    return (
      storageLocal.save(STORAGE_SCREENSHOT_INSTRUCTIONS_READ, settings.screenshotInstructionsRead, function() {
        fn.dcl('Storage instructions set saved: ' + settings.screenshotInstructionsRead);
      }),
      !0
    );
  },
  setScreenshotInstructionsRead = function(e) {
    return (settings.screenshotInstructionsRead = 'boolean' == typeof e ? e : config.SCREENSHOT_INSTRUCTIONS_READ_DEFAULT), !0;
  },
  setBadge = function(e, a) {
    return (
      settings.badgeDisplay || (a = ''),
      chrome.browserAction.setBadgeText({
        tabId: e,
        text: a,
      }),
      !0
    );
  },
  updateDomains = function(e) {
    // updates the domain object in file
    var a,
      t,
      s,
      n = fn.getDateString();
    dates.today !== n && ((dates.today = n), (seconds.today = 0)),
      chrome.idle.queryState(settings.idleTime, function(state) {
        chrome.windows.getLastFocused({ populate: true }, function(window) {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message);
          }

          if (!window) {
            return;
          }
          var ind,
            lastVisitedUrl,
            tab = null,
            ignoreTick = false;
          for (ind = 0; ind < window.tabs.length; ind += 1) {
            if (window.tabs[ind].highlighted) {
              tab = window.tabs[ind];
            }
          }
          if (tab && window.focused) {
            // Else There is no active tab. For ex.: It could be Developer Tool Window
            // console.log(tab.favIconUrl, tab.title);
            lastVisitedUrl = tab.url;
            var d = (window.id, window.focused, tab.id);
            var a = fn.parseDomainFromUrl(tab.url);
            fn.dcl('LOG (' + dates.today + '): ' + a), domains.hasOwnProperty(a) || ((domains[a] = fn.getDomainObj()), (domains[a].name = a));
            var i = domains[a];

            (i.days[dates.today] = i.days[dates.today] || fn.getDayObj()),
              e ||
                ((i.alltime.seconds += config.INTERVAL_UPDATE_S),
                (i.days[dates.today].seconds += config.INTERVAL_UPDATE_S),
                (seconds.today += config.INTERVAL_UPDATE_S),
                (seconds.alltime += config.INTERVAL_UPDATE_S),
                (domainsChanged = !0)),
              setBadge(d, fn.getBadgeTimeString(i.days[dates.today].seconds));
            updateTimeTable(dates.today, domains[a]);
          }
        });
      });
  };
fn.dcl('Webtime Tracker - background.js loaded');
loadDateStart(dates.today);
loadSecondsAlltime();
loadIdleTime();
loadStartOfWeek();
loadGraphGap();
loadBadgeDisplay();
loadScreenshotInstructionsRead();
loadDomains(function(e) {
  // e = callback from storageLocal, sets domains in current file to e
  console.log(e[STORAGE_DOMAINS]);
  // console.log([], seconds.today = fn.getTotalSecondsForDate(domains, fn.getDateString()));
  return (domains = e[STORAGE_DOMAINS] || []), (seconds.today = fn.getTotalSecondsForDate(domains, fn.getDateString())), !0;
});
loadBlockedSites(function(e) {
  blockedSites = e[STORAGE_BLOCKED_SITES];
});
loadWatchSites(function(e) {
  watchSites = e[STORAGE_WATCH_SITES];
});
loadTimeTable(function(e) {
  timeTable = e[STORAGE_TIME_TABLE];
});
/*
appendBlockedSites("https://www.facebook.com", 10);
chrome.webRequest.onBeforeRequest.addListener(
    function(details) { return {cancel: true}; },
    {urls: ["*://www.facebook.com/*"]},
    ["blocking"]
);*/
//saveBlockSites();
timeIntervals.update = window.setInterval(function() {
  updateDomains();
}, config.INTERVAL_UPDATE_MS);
timeIntervals.save = window.setInterval(function() {
  domainsChanged &&
    (saveDomains(),
    saveWatchSites(),
    saveBlockedSites(),
    saveTimeTable(),
    saveSecondsAlltime(),
    chrome.storage.local.getBytesInUse(null, function(e) {
      fn.dcl('Total storage used: ' + e + ' B');
    }));
}, config.INTERVAL_SAVE_MS);

// //check if current url is contained in blocked_sites
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.request == 'redirectOptions') {
    chrome.tabs.create({ url: `options/options.html#/${message.tab}` });
  }
  if (message.request == 'getWatchSites') {
    sendResponse({ done: watchSites });
  }
  if (message.request == 'addWatchSite') {
    var url = fn.parseDomainFromUrl(message.url);
    addWatchSites(url);
  }
  if (message.request == 'removeWatchSite') {
    removeWatchSites(message.url), sendResponse({ status: 200 });
  }
  if (message.request == 'getStartOfWeek') {
    sendResponse({ data: settings.startOfWeek });
  }
  if (message.request == 'setStartOfWeek') {
    setStartOfWeek(message.day), sendResponse({ status: 200 });
  }
  if (message.request == 'getIdleTime') {
    sendResponse({ data: settings.idleTime });
  }
  if (message.request == 'setIdleTime') {
    setIdleTime(message.time), sendResponse({ status: 200 });
  }
  if (message.request == 'clearDataRange') {
    //clearDataRange(message.start, message.end) ? sendResponse({status: 200}) : sendResponse({status: 400});
    sendResponse({ status: 200 });
  }
  if (message.request == 'exportToCSV') {
    console.log('export to csv request');
  }
  if (message.request == 'clearAllData') {
    console.log(message);
    //clearAllGeneratedData(), sendResponse({status: 200});
  }

  // if (message.request == 'getBlockedSites') {
  //   sendResponse({ done: blockedSites });
  // }
  // if (message.request == 'appendBlockedSites') {
  //   var data = message.data;
  //   //console.log(data, data.domain, data.limit);
  //   appendBlockedSites(data.domain, data.limit);
  //   sendResponse({ done: message.data });
  // }
  // if (message.request == 'deleteBlockedSites') {
  //   var data = message.data;
  //   var response = deleteBlockedSites(data.domain);
  //   return response == true ? sendResponse({ done: true, message: null }) : sendResponse({ done: false, message: response });
  // }
  if (message.request == 'getTimeTable') {
    sendResponse({ done: timeTable });
  }
  // if(message.request == "getBlockedSites"){
  //     var filename = getSpecificFilename(sender.url);
  //     chrome.tabs.executeScript(sender.tab.id, {file: filename}, function() {
  //         sendResponse({ done: true });
  //     });
  //     return true; // Required for async sendResponse()
  // }

  //   if (message.checkBlocked){
  //      chrome.storage.sync.get('blocked_sites', function(sites){
  //      console.log(sites['blocked_sites']);
  //      // check if current tab is in blocked sites
  //      chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
  //          console.log(tabs);
  //          });
  //      });
});
