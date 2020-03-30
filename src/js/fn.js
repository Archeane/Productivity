"use strict";

function sha256(e) {
    var t = new TextEncoder("utf-8").encode(e);
    return crypto.subtle.digest("SHA-256", t).then(function(e) {
        return hex(e)
    })
}

function hex(e) {
    for (var t = [], n = new DataView(e), r = 0; r < n.byteLength; r += 4) {
        var o = n.getUint32(r),
            i = o.toString(16),
            a = "00000000",
            u = (a + i).slice(-a.length);
        t.push(u)
    }
    return t.join("")
}
var dclCounter = 0,
    dcl = function(e) {
        return dclCounter++, DEVELOPMENT_MODE && console.log(e), !0
    },
    parseDomainFromUrl = function(e) {
        var t, n;
        return n = document.createElement("a"), n.href = e, t = n.hostname
    },
    parseProtocolFromUrl = function(e) {
        var t, n;
        return n = document.createElement("a"), n.href = e, t = n.protocol
    },
    getDomainObj = function() {
        return {
            name: "",
            alltime: {
                seconds: 0
            },
            days: {}
        }
    },
    //=========
    getBlockedSiteObj = function() {
        return {
            name: "",
            daylimit: {
                seconds: 0
            }
        }
    },
    getTimeTableObj = function(domainObj, date){
        if(domainObj.days.hasOwnProperty(date)){
            return {
                name: domainObj.name,
                time: {
                    seconds: domainObj.days[date].seconds || 0
                }
            }
        }
        return {
            name: domainObj.name,
            time:{
                seconds: 0
            }
        }
    },
    //==========
    getDayObj = function() {
        return {
            seconds: 0
        }
    },
    getTimeObj = function() {
        return {
            day: {
                tens: 0,
                units: 0,
                implicitlyActive: !1,
                unit: TIME_UNIT_DAY
            },
            hour: {
                tens: 0,
                units: 0,
                implicitlyActive: !1,
                unit: TIME_UNIT_HOUR
            },
            minute: {
                tens: 0,
                units: 0,
                implicitlyActive: !1,
                unit: TIME_UNIT_MINUTE
            },
            second: {
                tens: 0,
                units: 0,
                implicitlyActive: !1,
                unit: TIME_UNIT_SECOND
            }
        }
    },
    getDateString = function(e) {
        var t, n, r, o, i;
        return n = e ? new Date(e) : new Date, r = n.getFullYear(), o = n.getMonth() + 1, o = 10 > o ? "0" + o : o, i = n.getDate(), i = 10 > i ? "0" + i : i, t = r + "-" + o + "-" + i
    },
    getClosestMatchingAncestor = function(e, t) {
        do {
            if (e.matches(t)) return e;
            e = e.parentNode
        } while (e.parentNode)
    },
    addDelegateEventListener = function(e, t, n) {
        var r;
        return document.addEventListener(t, function(t) {
            t.stopPropagation(), r = getClosestMatchingAncestor(t.target, e), r && n(t, r)
        }), !0
    },
    addMultipleDelegatedEventListeners = function(e, t, n) {
        var r, o = t.split(",");
        for (r = 0; r < o.length; r++) addDelegateEventListener(e, o[r].trim(), n)
    },
    addMultiEventListener = function(e, t, n, r) {
        var o, i = t.split(",");
        for (o = 0; o < i.length; o++) e.addEventListener(i[o], function(e) {
            n(e, this)
        }, r)
    },
    getHSL = function(e, t) {
        var n, r, o, i;
        return t = t || 1, r = e * (300 / t), o = 100, i = 50, n = "hsl(" + r + ", " + o + "%, " + i + "%)"
    },
    getDateDiffDays = function(e, t) {
        var n, r, o;
        return r = new Date(e), o = new Date(t), n = parseInt(r.getTime() - o.getTime()) / 864e5, n = Math.abs(n)
    },
    getTotalSecondsForDate = function(e, t) {
        var n = 0;
        for (var r in e) e.hasOwnProperty(r) && e[r].days[t] && (n += e[r].days[t].seconds);
        return n
    },
    getPercentageString = function(e, t) {
        var n = parseInt(100 * e).toString(),
            r = n.substr(0, n.length - 2) || 0,
            o = n.substr(-2);
        10 > o && (o = "0" + parseInt(o)), t && 10 > r && (r = "0" + parseInt(r));
        var i = r + "." + o + " %";
        return i
    },
    getBadgeTimeString = function(e) {
        var t = "";
        return t = 60 > e ? e + "s" : 59999 > e ? parseInt(e / 60) + "m" : parseInt(e / 60 / 60) + " h"
    },
    getIdleTimeComputedString = function(e) {
        var t;
        return t = 90 >= e ? e + " seconds" : parseInt(e / 60) + " minutes"
    },
    getIdleTimeComputedFromRaw = function(e) {
        var t = IDLE_TIME_TABLE[e];
        return "undefined" == typeof t && (t = IDLE_TIME_DEFAULT, console.error("Undefined raw value: " + e)), t
    },
    getIdleTimeRawFromComputed = function(e) {
        var t = IDLE_TIME_TABLE.indexOf(e);
        if (-1 === t) {
            var t = IDLE_TIME_TABLE.indexOf(IDLE_TIME_DEFAULT);
            console.error("Computed value with no match: " + e)
        }
        return t
    },
    getSliderComputedFromRaw = function(e, t, n) {
        var r = e[n];
        return "undefined" == typeof r && (r = t, console.error("Undefined raw value: " + n)), r
    },
    getSliderRawFromComputed = function(e, t, n) {
        var r = e.indexOf(n);
        return -1 === r && (r = e.indexOf(t), console.error("Computed value with no match: " + n)), r
    },
    getDatesSparse = function(e, t) {
        var n, r = [],
            o = new Date(e);
        for (r.push(e), n = 0; t > n; n++) o.setDate(o.getDate() + 1), r.push(getDateString(o));
        return r
    },
    convertArrayToCsv = function(e, t, n) {
        var r, o, i, a, u, d = "",
            s = [];
        for (r = getDateDiffDays(t, n), s = getDatesSparse(t, r), o = Object.keys(e).sort(), d = "Domain," + s.join(",") + "\n", i = 0; i < o.length; i++) {
            for (d += o[i], a = 0; a < s.length; a++) u = e[o[i]].days[s[a]], d += "," + (u ? u.seconds : 0);
            d += "\n"
        }
        return d
    },
    initiateDownload = function(e, t, n) {
        var r = new Blob(e, {
                type: t
            }),
            o = window.URL.createObjectURL(r),
            i = document.createElement("a");
        return i.href = o, i.download = n, i.style.display = "none", document.body.appendChild(i), i.click(), dcl("Download initiated."), !0
    },
    getAvailableElementWidth = function(e) {
        var t = 0;
        return t += parseInt(window.getComputedStyle(e).getPropertyValue("width")), t -= parseInt(window.getComputedStyle(e).getPropertyValue("padding-left")), t -= parseInt(window.getComputedStyle(e).getPropertyValue("padding-right")), t -= parseInt(window.getComputedStyle(e).getPropertyValue("border-left-width")), t -= parseInt(window.getComputedStyle(e).getPropertyValue("border-right-width"))
    };
    

export default getDateString;


