/*
    1. modify page when needing to block
    2. add options and link to update blocked sites
    3. add time per date option to domains
    4. 
*/

"use strict";

import getDateString from './js/fn.js';

var domains = {},
    blockedSites = {},    //domain : time limite per day, 
    timeTable = {}, // date: [{domain: timeForDomain}...] 
    dates = {
        today: getDateString(),
        start: ""
    },
    seconds = {
        today: 0,
        alltime: 0
    },
    timeIntervals = {
        update: 0,
        save: 0
    },
    settings = {
        idleTime: IDLE_TIME_DEFAULT,
        graphGap: GRAPH_GAP_DEFAULT,
        badgeDisplay: BADGE_DISPLAY_DEFAULT,
        screenshotInstructionsRead: SCREENSHOT_INSTRUCTIONS_READ_DEFAULT
    },
    domainsChanged = !1,
    blockedSitesChanged = !1,
    STORAGE_DOMAINS = "domains",
    STORAGE_BLOCKED_SITES = "blocked-sites",
    STORAGE_TIME_TABLE = "time-table",
    STORAGE_DATE_START = "date-start",
    STORAGE_SECONDS_ALLTIME = "seconds-alltime",
    STORAGE_IDLE_TIME = "idle-time",
    STORAGE_GRAPH_GAP = "graph-gap",
    STORAGE_BADGE_DISPLAY = "badge-display",
    STORAGE_SCREENSHOT_INSTRUCTIONS_READ = "storage-instructions-read",
    /**
      loads STORAGE_DOMAINS from storageLocal <- json.strinify()
    **/
    loadDomains = function(e) {     // returns the STORAGE_DOMAINS object in chrome.localStorage 
        return storageLocal.load(STORAGE_DOMAINS, {}, function(a) {
            e(a), dcl("Domains loaded: " + Object.keys(domains).length + " domains")
        }), !0
    },
    saveDomains = function() {      // saves the domains object in local file to chrome.localStorage
        return storageLocal.save(STORAGE_DOMAINS, domains, function() {
            domainsChanged = !1, dcl("Domains saved: " + Object.keys(domains).length + " domains")
        }), !0
    },
    //=====================
    loadBlockedSites = function(cb){
        return storageLocal.load(STORAGE_BLOCKED_SITES, {}, function(blocked_sites){
            cb(blocked_sites);
            dcl("Blocked Sites loaded: "+ Object.keys(blocked_sites).length + " blocked_sites");
            console.log(blocked_sites);
        }), !0
    },
    appendBlockedSites = function(url, limit){
        var domain = parseDomainFromUrl(url);
        blockedSites.hasOwnProperty(domain) || (blockedSites[domain] = getBlockedSiteObj(), blockedSites[domain].name = domain);
        var i = blockedSites[domain];
        i.daylimit.seconds = limit;
    },
    deleteBlockedSites = function(url){
        return (blockedSites.hasOwnProperty(url) || blockedSites.hasOwnProperty(parseDomainFromUrl(url))) ? blockedSites.delete(url) || blockedSites.delete(parseDomainFromUrl(url)) : "An error occured, please try again later";
    },
    saveBlockedSites = function(){
        return storageLocal.save(STORAGE_BLOCKED_SITES, blockedSites, function(){
            blockedSitesChanged = !1;
            dcl("Blocked Sites saved: "+ Object.keys(blockedSites).length + " blockedSites");
            //console.log(blockedSites);
        }), !0
    },

    loadTimeTable = function(cb){
        return storageLocal.load(STORAGE_TIME_TABLE, {}, function(timeTable){
            cb(timeTable);
            dcl("timeTable loaded: "+Object.keys(timeTable).length+" table entries");
            console.log(timeTable);
            
        }), !0
    },
    saveTimeTable = function(){
        return storageLocal.save(STORAGE_TIME_TABLE, timeTable, ()=>{
            dcl("Time table saved: "+ Object.keys(timeTable).length + " table entries");
            console.log(`timeTable['2020-01-08'].facebook.com: ${timeTable['2020-01-08']['www.facebook.com']}`);
        }), !0
    },

    clearTimeTable = () =>{
        return timeTable = {}, saveTimeTable(), !0;
    },

    appendToTimeTable = function(date, domainObj){
        if(timeTable.hasOwnProperty(date)){
            if(timeTable[date].hasOwnProperty(domainObj.name)){//.some(e => e.name === domainObj.name)){
                timeTable[date][domainObj.name] += INTERVAL_UPDATE_S;
                return;
            }
            if(domainObj.days[date].hasOwnProperty(seconds)){
                return timeTable[date][domainObj.name] = domainObj.days[date].seconds;
            }else{
                console.log(domainObj.days[date]);
                return timeTable[date][domainObj.name] = 0;
            }
        }else{
            timeTable[date] = {};
            //var timeTableObj = getTimeTableObj(domainObj, date);
            if(domainObj && domainObj.hasOwnProperty(days) && domainObj[days].hasOwnProperty(date) && domainObj[days][date].hasOwnProperty(seconds)){
                return timeTable[date][domainObj.name] = domainObj.days[date].seconds;
            }else{
                return timeTable[date][domainObj.name] = null;
            }
        }
    },
    //=====================
    clearAllGeneratedData = function() {
        return domains = {}, blockedSites = {}, timeTable = {}, saveDomains(), saveBlockedSites(), saveTimeTable(), seconds.today = 0, seconds.alltime = 0, saveSecondsAlltime(), dates.start = dates.today, saveDateStart(), dcl("Clear all generated data: done"), !0
    },
    /*
        loads the start date from chrome.storage.local
    */
    loadDateStart = function(e) {
        return storageLocal.load(STORAGE_DATE_START, e, function(e) {
            dates.start = e[STORAGE_DATE_START];
            saveDateStart();
            dcl("Start date loaded: " + e[STORAGE_DATE_START]);
        }), !0
    },
    /*
        saves the start date to chrome.storage.local
    */
    saveDateStart = function() {
        return storageLocal.save(STORAGE_DATE_START, dates.start, function() {
            dcl("Start date saved: " + dates.start)
        }), !0
    },
    loadSecondsAlltime = function() {
        return storageLocal.load(STORAGE_SECONDS_ALLTIME, 0, function(e) {
            seconds.alltime = e[STORAGE_SECONDS_ALLTIME], saveSecondsAlltime(), dcl("Seconds alltime loaded: " + e[STORAGE_SECONDS_ALLTIME])
        }), !0
    },
    saveSecondsAlltime = function() {
        return storageLocal.save(STORAGE_SECONDS_ALLTIME, seconds.alltime, function() {
            dcl("Seconds alltime saved: " + seconds.alltime)
        }), !0
    },
    loadIdleTime = function() {
        return storageLocal.load(STORAGE_IDLE_TIME, IDLE_TIME_DEFAULT, function(e) {
            settings.idleTime = e[STORAGE_IDLE_TIME], saveIdleTime(), dcl("Idle time loaded: " + e[STORAGE_IDLE_TIME])
        }), !0
    },
    saveIdleTime = function() {
        return storageLocal.save(STORAGE_IDLE_TIME, settings.idleTime, function() {
            dcl("Idle time saved: " + settings.idleTime)
        }), !0
    },
    setIdleTime = function(e) {
        return settings.idleTime = parseInt(e) || IDLE_TIME_DEFAULT, !0
    },
    loadGraphGap = function() {
        return storageLocal.load(STORAGE_GRAPH_GAP, GRAPH_GAP_DEFAULT, function(e) {
            settings.graphGap = e[STORAGE_GRAPH_GAP], saveGraphGap(), dcl("Graph gap loaded: " + e[STORAGE_GRAPH_GAP])
        }), !0
    },
    saveGraphGap = function() {
        return storageLocal.save(STORAGE_GRAPH_GAP, settings.graphGap, function() {
            dcl("Graph gap saved: " + settings.graphGap)
        }), !0
    },
    setGraphGap = function(e) {
        var a = parseFloat(e);
        return settings.graphGap = isFinite(a) ? a : GRAPH_GAP_DEFAULT, !0
    },
    loadBadgeDisplay = function() {
        return storageLocal.load(STORAGE_BADGE_DISPLAY, BADGE_DISPLAY_DEFAULT, function(e) {
            settings.badgeDisplay = e[STORAGE_BADGE_DISPLAY], saveBadgeDisplay(), dcl("Badge display loaded: " + e[STORAGE_BADGE_DISPLAY])
        }), !0
    },
    saveBadgeDisplay = function() {
        return storageLocal.save(STORAGE_BADGE_DISPLAY, settings.badgeDisplay, function() {
            dcl("Badge display saved: " + settings.badgeDisplay)
        }), !0
    },
    setBadgeDisplay = function(e) {
        return settings.badgeDisplay = "boolean" == typeof e ? e : BADGE_DISPLAY_DEFAULT, !0
    },
    loadScreenshotInstructionsRead = function() {
        return storageLocal.load(STORAGE_SCREENSHOT_INSTRUCTIONS_READ, SCREENSHOT_INSTRUCTIONS_READ_DEFAULT, function(e) {
            settings.screenshotInstructionsRead = e[STORAGE_SCREENSHOT_INSTRUCTIONS_READ], saveScreenshotInstructionsRead(), dcl("Storage instructions set loaded: " + e[STORAGE_SCREENSHOT_INSTRUCTIONS_READ])
        }), !0
    },
    saveScreenshotInstructionsRead = function() {
        return storageLocal.save(STORAGE_SCREENSHOT_INSTRUCTIONS_READ, settings.screenshotInstructionsRead, function() {
            dcl("Storage instructions set saved: " + settings.screenshotInstructionsRead)
        }), !0
    },
    setScreenshotInstructionsRead = function(e) {
        return settings.screenshotInstructionsRead = "boolean" == typeof e ? e : SCREENSHOT_INSTRUCTIONS_READ_DEFAULT, !0
    },
    setBadge = function(e, a) {
        return settings.badgeDisplay || (a = ""), chrome.browserAction.setBadgeText({
            tabId: e,
            text: a
        }), !0
    },

    //============
    
    //============
    updateDomains = function(e) {   // updates the domain object in file
        var a, t, s, n = getDateString();
        dates.today !== n && (dates.today = n, seconds.today = 0), chrome.windows.getLastFocused({
            populate: !0
        }, function(n) {    // n = most recently focused window
            for (var o in n.tabs)
                if (n.tabs.hasOwnProperty(o) && n.tabs[o].active === !0) {  //find the active tab
                    s = n.tabs[o];  // s = the active tab
                    break
                }
            chrome.idle.queryState(settings.idleTime, function(o) { // o = newstate
                var d = (n.id, n.focused, s.id);
                s.url;
                if (a = parseDomainFromUrl(s.url), t = parseProtocolFromUrl(s.url), (n.focused && "active" === o || e) && -1 === BLACKLIST_DOMAIN.indexOf(a) && -1 === BLACKLIST_PROTOCOL.indexOf(t) && "" !== a) {
                    dcl("LOG (" + dates.today + "): " + a), domains.hasOwnProperty(a) || (domains[a] = getDomainObj(), domains[a].name = a);
                    var i = domains[a];
                   

                    i.days[dates.today] = i.days[dates.today] || getDayObj(), e || (i.alltime.seconds += INTERVAL_UPDATE_S, i.days[dates.today].seconds += INTERVAL_UPDATE_S, seconds.today += INTERVAL_UPDATE_S, seconds.alltime += INTERVAL_UPDATE_S, domainsChanged = !0), setBadge(d, getBadgeTimeString(i.days[dates.today].seconds));
                    //console.log(`today's time on ${a} is ${i.days[dates.today].seconds}s, limit: ${blockedSites.hasOwnProperty(a) && blockedSites[a].daylimit.seconds}`);
                    
                     //add to timetable
                    appendToTimeTable(dates.today, domains[a]); 
                    //console.log(timeTable);

                    //check if today's time exceeds limit
                    if (blockedSites.hasOwnProperty(a) && i.days[dates.today].seconds > blockedSites[a].daylimit.seconds){
                        console.log("time limit excced!");
                        var pattern = "*://"+a+"/*";
                        var redirectUrl = "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif";
                        function redirectAsync(requestDetails) {
                          console.log("Redirecting async: " + requestDetails.url);
                          return new Promise((resolve, reject) => {
                            window.setTimeout(() => {
                              resolve({redirectUrl});
                            }, 2000);
                          });
                        }
                        chrome.webRequest.onBeforeRequest.addListener(
                          redirectAsync,
                          {urls: [pattern]},
                          ["blocking"]
                        );
                    }
                }
            })
        })
    };
chrome.tabs.onActivated.addListener(function(e) {
    var a, t = e.tabId;
    //console.log(`a:: ${a}, t: ${t}`);
    return chrome.tabs.get(t, function(e) {
        //a = parseDomainFromUrl(e.url), setBadge(t, ""), domains[a] && domains[a].days[dates.today] && setBadge(t, getBadgeTimeString(domains[a].days[dates.today].seconds))
        a = parseDomainFromUrl(e.url);
        //console.log(`a:${a}, domains[a]:${domains[a]}: ${domains[a].days[dates.today].seconds}`);
    }), !0
})
dcl("Webtime Tracker - background.js loaded");
loadDateStart(dates.today);
loadSecondsAlltime();
loadIdleTime();
loadGraphGap();
loadBadgeDisplay();
loadScreenshotInstructionsRead();
loadDomains(function(e) {   // e = callback from storageLocal, sets domains in current file to e
    //console.log(e);
    console.log(e[STORAGE_DOMAINS]);
    console.log([], seconds.today = getTotalSecondsForDate(domains, getDateString()));
    return domains = e[STORAGE_DOMAINS] || [], seconds.today = getTotalSecondsForDate(domains, getDateString()), !0
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
    updateDomains()
}, INTERVAL_UPDATE_MS)
timeIntervals.save = window.setInterval(function() {
    
    domainsChanged && (saveDomains(), saveBlockSites(), saveTimeTable(), saveSecondsAlltime(), chrome.storage.local.getBytesInUse(null, function(e) {
        dcl("Total storage used: " + e + " B")
    }))
}, INTERVAL_SAVE_MS);


// //check if current url is contained in blocked_sites
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.request == "getBlockedSites"){
        sendResponse({done:blockedSites});
    }
    if(message.request == "appendBlockedSites"){
        var data = message.data;
        //console.log(data, data.domain, data.limit);
        appendBlockedSites(data.domain, data.limit);
        sendResponse({done:message.data});
    }
    if(message.request == "deleteBlockedSites"){
        var data = message.data;
        var response = deleteBlockedSites(data.domain);
        return response == true ? sendResponse({done: true, message: null}) : sendResponse({done: false, message: response});
    }
    if(message.request == "getTimeTable"){
        sendResponse({done: timeTable});
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

