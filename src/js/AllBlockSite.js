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

export class BlockSite {
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
