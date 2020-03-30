"use strict";
var storageLocal = function() {
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
        load: t
    }
}();