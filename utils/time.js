module.exports = {
  // Expect date in US format m/d/y
  stringToDate: (date) => {
    if (this.isString) {
      date = date.split(/\D/);
      return new Date(date[2], --date[0], date[1]);
    }

    return date;
  },
  dateFuture: (offset) => {
    let now = new Date();
    now.setDate(now.getDate() + offset);

    return now;
  },
  datePast: (offset) => {
    let now = new Date();
    now.setDate(now.getDate() - offset);

    return now;
  },
  isString: (date) => {
    return typeof input === 'string' ? true : false;
  },
  relative_time = (date) => {
    if (!date) return;

    var now = new Date().getTime() / 1000;
    var elapsed = Math.round(now - date);

    if (elapsed <= 1) {
      return 'Baru saja';
    }

    var rounded, title;
    if (elapsed > 31104000) {
      rounded = elapsed / 31104000;
      title = 't';
    } else
    if (elapsed > 2592000) {
      rounded = elapsed / 2592000;
      title = 'b';
    } else
    if (elapsed > 604800) {
      elapsed = elapsed / 604800;
      title = 'mg';
    } else
    if (elapsed > 86400) {
      rounded = elapsed / 86400;
      title = 'h';
    } else
    if (elapsed > 3600) {
      rounded = elapsed / 3600;
      title = 'j';
    } else
    if (elapsed > 60) {
      rounded = elapsed / 60;
      title = 'm';
    }
    else if (elapsed >= 1) {
      rounded = elapsed / 1;
      title = 'd';
    }
    if (rounded > 1) {
      rounded = Math.round(rounded);
      return rounded ? rounded + title + ' yang lalu' : this.getHHMM(date);
    }
  },
  getHHMM = (t) => {
    let d = new Date(t * 1000);
    let h = d.getHours();
    let m = d.getMinutes();
    let a = '';
    let ms = '';
    if (h > 0 && h < 12) {
      a = 'AM';
    }
    else {
      if (h == 0) 
        a = 'AM';
      else
        a = 'PM';
    }
    if (m < 10) ms = '0' + m;
    else ms = '' + m;
    return ((h == 0 || h == 12) ? 12 : h % 12) + ':' + ms + ' ' + a;
  },
  timeSince = (date) => {
    let now = new Date();
    date = new Date(date);
    
    let seconds = Math.floor((now - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
  
    if (interval > 1) {
      return interval + " tahun yang lalu";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " bulan yang lalu";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " hari yang lalu";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " jam yang lalu";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " menit yang lalu";
    }
    if (interval == 0 ) {
      return "baru saja";
    }
    return Math.floor(seconds) + " detik yang lalu";
  },
  timeUntil = (date) => {
    date = date + "";
    let dates = date.split("/");
    let year = parseInt(dates[0]);
    let month = parseInt(dates[1]);
    let day = parseInt(dates[2]);
    let hour = 0;
    let minute = 0;
    let second = 0;
    let yrr = 0;
    let eventtext = "menjelang panen";
    let endtext = "Waktu panen tiba";
    let end = new Date(year, month, day, hour, minute, second);
    let now = new Date();
    if (now.getFullYear() < 1900) yrr = now.getFullYear() + 1900;
    let sec = second - now.getSeconds();
    let min = minute - now.getMinutes();
    let hr = hour - now.getHours();
    let dy = day - now.getDate();
    let mnth = month - now.getMonth();
    let yr = year - yrr;
    let daysinmnth = 32 - new Date(now.getFullYear(),now.getMonth(), 32).getDate();
    if (sec < 0) {
      sec = (sec + 60) % 60;
      min--;
    }
    if (min < 0) {
      min = (min + 60) % 60;
      hr--;	
    }
    if (hr < 0) {
      hr = (hr + 24) % 24;
      dy--;	
    }
    if (dy < 0) {
      dy = (dy + daysinmnth) % daysinmnth;
      mnth--;	
    }
    if (mnth < 0) {
      mnth = (mnth + 12) % 12;
      yr--;
    }	
    let dytext = " hari, ";
    let mnthtext = " bulan, ";
    let yrtext = " tahun, ";
    if (yr == 1) yrtext = " tahun, ";
    if (mnth == 1)  mnthtext = " bulan, ";
    if (dy == 1) dytext = " hari, ";
    if(now >= end) {
      return endtext;
    }
    else {
      return yr + yrtext + mnth + mnthtext + dy + dytext + eventtext;
    }
  },
  timeUntilHours = (date) => {
    let startDate = new Date();
    let endDate = new Date(date);
    let dates = (endDate.getTime() - startDate.getTime()) / (24 * 3600) + "";
    
    return parseInt(dates, 10);
  },
  timeUntilDays = (date) => {
    let startDate = new Date();
    let endDate = new Date(date);
    let dates = (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000) + "";
    
    return parseInt(dates, 10);
  },
  timeUntilWeeks = (date) => {
    let startDate = new Date();
    let endDate = new Date(date);
    let dates = (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000 * 7) + "";
    
    return parseInt(dates, 10);
  },
  timeUntilMonths = (date) => {
    let startDate = new Date();
    let endDate = new Date(date);
    
    return (endDate.getMonth() + 12 * endDate.getFullYear()) - (startDate.getMonth() + 12 * startDate.getFullYear());
  },
  timeUntilYears = (date) => {
    let startDate = new Date();
    let endDate = new Date(date);
    
    return endDate.getFullYear() - startDate.getFullYear();
  }
};