"use strict";
export default class Config {
    constructor(){
    this.DEVELOPMENT_MODE = !("update_url" in chrome.runtime.getManifest());
    this.SKIP_RESTORE_HASH_CHECK = !("update_url" in chrome.runtime.getManifest());
    this.SCREENSHOT_MODE = !1;
    this.SCREENSHOT_MODE_QUERY = "?screenshot=on";
    this.SCREENSHOT_WAIT = 50;
    this.SCREENSHOT_INSTRUCTIONS_READ_DEFAULT = !1;
    this.SCROLLBAR_WIDTH = "12";
    this.BADGE_DISPLAY_DEFAULT = !0;
    this.INTERVAL_UPDATE_S = 1;
    this.INTERVAL_UPDATE_MS = 1e3 * this.INTERVAL_UPDATE_S;
    this.INTERVAL_SAVE_MS = 6e4;
    this.INTERVAL_UI_LOADING = 2e3;
    this.UI_LOADING_BLINKING_INTERVAL = 600;
    this.UI_LOADING_BLINKING_COUNT = 3;
    this.IDLE_TIME_DEFAULT = 30;
    this.RESOLUTION_HOURS = "h";
    this.RESOLUTION_DAYS = "d";
    this.TIME_UNIT_DAY = "d";
    this.TIME_UNIT_HOUR = "h";
    this.TIME_UNIT_MINUTE = "m";
    this.TIME_UNIT_SECOND = "s";
    this.RANGE_TODAY = "today";
    this.RANGE_AVERAGE = "average";
    this.RANGE_ALLTIME = "alltime";
    this.GRAPH_SIZE = 240;
    this.GRAPH_COLOR_OTHER = "hsl(0, 0%, 50%)";
    this.GRAPH_MIN_PERCENTAGE_TO_INCLUDE = 1.5;
    this.GRAPH_GAP_DEFAULT = .4;
    this.CHART_STATS_STEP_HEIGHT_MIN = 1;
    this.CHART_STATS_HEIGHT_DAYS = 60;
    this.CHART_STATS_HEIGHT_DAYNAMES = 60;
    this.BLACKLIST_DOMAIN = [];
    this.BLACKLIST_PROTOCOL = ["chrome:", "chrome-extension:"];
    this.IDLE_TIME_TABLE = [15, this.IDLE_TIME_DEFAULT, 45, 60, 90, 120, 180, 240, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3e3, 3300, 3600, 7200];
    this.GRAPH_GAP_TABLE = [0, .1, .2, .3, this.GRAPH_GAP_DEFAULT, .5, .6, .7, .8, .9, 1];
}
}