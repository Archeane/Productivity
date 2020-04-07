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
  blockedSites = {}, //domain : time limite per day,
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
    graphGap: config.GRAPH_GAP_DEFAULT,
    badgeDisplay: config.BADGE_DISPLAY_DEFAULT,
    screenshotInstructionsRead: config.SCREENSHOT_INSTRUCTIONS_READ_DEFAULT,
  },
  domainsChanged = !1,
  blockedSitesChanged = !1,
  STORAGE_DOMAINS = 'domains',
  STORAGE_BLOCKED_SITES = 'blocked-sites',
  STORAGE_TIME_TABLE = 'time-table',
  STORAGE_DATE_START = 'date-start',
  STORAGE_SECONDS_ALLTIME = 'seconds-alltime',
  STORAGE_IDLE_TIME = 'idle-time',
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
    if (timeTable.hasOwnProperty(date)) {
      if (!timeTable[date].hasOwnProperty(domainObj.name)) {
        timeTable[date][domainObj.name] = {};
      }
      if (domainObj.days[date].hasOwnProperty('seconds')) {
        let a = timeTable[date][domainObj.name];
        a['total'] += config.INTERVAL_UPDATE_S;
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
      } else {
        return (timeTable[date][domainObj.name]['total'] = 0);
      }
    } else {
      timeTable[date] = {};
      if (domainObj && domainObj.hasOwnProperty('days') && domainObj['days'].hasOwnProperty(date) && domainObj['days'][date].hasOwnProperty('seconds')) {
        return (timeTable[date][domainObj.name]['total'] = domainObj.days[date].seconds);
      }
    }
  },
  // updateTimeTableOccurance = function(date, url) {
  //   var formatted_url = fn.parseDomainFromUrl(url);
  //   console.log(`formatted url: ${formatted_url}`);
  //   if (timeTable.hasOwnProperty(date)) {
  //     if (!timeTable[date].hasOwnProperty(formatted_url)) {
  //       timeTable[date][domainObj.name] = {};
  //     }
  //     if (timeTable[date][formatted_url].hasOwnProperty('visits')) {
  //       return timeTable[date][formatted_url]['visits'].push(Date.now());
  //     } else {
  //       return (timeTable[date][formatted_url]['visits'] = [Date.now()]);
  //     }
  //   } else {
  //     timeTable[date] = {};
  //     timeTable[date][formatted_url] = {};
  //     return (timeTable[date][formatted_url]['visits'] = [Date.now()]);
  //   }
  // },
  //   updateVisitPeriod = function(){
  //       chrome.idle.queryState

  //   }
  //=====================
  clearAllGeneratedData = function() {
    return (
      (domains = {}),
      (blockedSites = {}),
      (timeTable = {}),
      saveDomains(),
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
    return (settings.idleTime = parseInt(e) || config.IDLE_TIME_DEFAULT), !0;
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
  //============

  //============
  updateDomains = function(e) {
    // updates the domain object in file
    var a,
      t,
      s,
      n = fn.getDateString();
    dates.today !== n && ((dates.today = n), (seconds.today = 0)),
      chrome.windows.getLastFocused(
        {
          populate: !0,
        },
        function(n) {
          // n = most recently focused window
          for (var o in n.tabs)
            if (n.tabs.hasOwnProperty(o) && n.tabs[o].active === !0) {
              //find the active tab
              s = n.tabs[o]; // s = the active tab
              break;
            }
          chrome.idle.queryState(settings.idleTime, function(o) {
            // o = newstate
            var d = (n.id, n.focused, s.id);
            s.url;
            if (
              ((a = fn.parseDomainFromUrl(s.url)),
              (t = fn.parseProtocolFromUrl(s.url)),
              ((n.focused && 'active' === o) || e) && -1 === config.BLACKLIST_DOMAIN.indexOf(a) && -1 === config.BLACKLIST_PROTOCOL.indexOf(t) && '' !== a)
            ) {
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
              //console.log(`today's time on ${a} is ${i.days[dates.today].seconds}s, limit: ${blockedSites.hasOwnProperty(a) && blockedSites[a].daylimit.seconds}`);

              //add to timetable
              updateTimeTable(dates.today, domains[a]);
              //console.log(timeTable[dates.today][domains[a].name]['visits'].slice(-1)[0], timeTable[dates.today][domains[a].name]['lastActive']);

              //check if today's time exceeds limit
              if (blockedSites.hasOwnProperty(a) && i.days[dates.today].seconds > blockedSites[a].daylimit.seconds) {
                console.log('time limit excced!');
                var pattern = '*://' + a + '/*';
                var redirectUrl = 'https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif';
                function redirectAsync(requestDetails) {
                  console.log('Redirecting async: ' + requestDetails.url);
                  return new Promise((resolve, reject) => {
                    window.setTimeout(() => {
                      resolve({ redirectUrl });
                    }, 2000);
                  });
                }
                chrome.webRequest.onBeforeRequest.addListener(redirectAsync, { urls: [pattern] }, ['blocking']);
              }
            }
          });
        }
      );
  };
// chrome.tabs.onActivated.addListener(function(e) {
//   var a,
//     t = e.tabId;
//   return (
//     chrome.tabs.get(t, function(e) {
//       //a = fn.parseDomainFromUrl(e.url), setBadge(t, ""), domains[a] && domains[a].days[dates.today] && setBadge(t, getBadgeTimeString(domains[a].days[dates.today].seconds))
//       updateTimeTableOccurance(dates.today, e.url);
//       a = fn.parseDomainFromUrl(e.url);
//       console.log(timeTable[dates.today][a]['visits']);
//     }),
//     !0
//   );
// });
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
//   if (changeInfo.status == 'complete') {
//     console.log(changeInfo);
//     return (
//       chrome.tabs.get(tabId, function(tab) {
//         if (!tab.url.includes('chrome://newtab')) {
//           updateTimeTableOccurance(dates.today, tab.url);
//           var a = fn.parseDomainFromUrl(tab.url);
//           console.log(timeTable[dates.today][a]['visits']);
//         }
//       }),
//       !0
//     );
//   }
// });
fn.dcl('Webtime Tracker - background.js loaded');
loadDateStart(dates.today);
loadSecondsAlltime();
loadIdleTime();
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
    saveBlockedSites(),
    saveTimeTable(),
    saveSecondsAlltime(),
    chrome.storage.local.getBytesInUse(null, function(e) {
      fn.dcl('Total storage used: ' + e + ' B');
    }));
}, config.INTERVAL_SAVE_MS);

// //check if current url is contained in blocked_sites
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.request == 'getBlockedSites') {
    sendResponse({ done: blockedSites });
  }
  if (message.request == 'appendBlockedSites') {
    var data = message.data;
    //console.log(data, data.domain, data.limit);
    appendBlockedSites(data.domain, data.limit);
    sendResponse({ done: message.data });
  }
  if (message.request == 'deleteBlockedSites') {
    var data = message.data;
    var response = deleteBlockedSites(data.domain);
    return response == true ? sendResponse({ done: true, message: null }) : sendResponse({ done: false, message: response });
  }
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
