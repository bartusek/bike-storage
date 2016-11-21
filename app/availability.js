export const tourLength = 6; //number of tour days

export const parseTourCode = function parseTourCode(tourCode) {
  const nr=Number(tourCode);
  if (isNaN(nr)) return undefined;
  if (nr>1231) return undefined;
  const d = nr % 100;
  const m = ((nr - d) % 10000) / 100;
  let mok = (d>0) && (d<=getDaysInMonth(m));
  // console.log('Parse tour code ' + tourCode + ' - nr:' + nr + ', d:' + d + ', m:' + m);
  return ((m<13 && m>0) && mok) ? {month:m,day:d} : undefined;
}

export const validateAndNormalizeTourCode = function validateAndNormalizeTourCode(tourCode) {
  let src = tourCode;
  if (typeof(tourCode) === 'string' ) {
    //check and substract first three letters if they are 'CZB'
    if (tourCode.substring(0,3).toLowerCase() == 'czb') {
      src = tourCode.substring(3);
    }
  }
  if (parseTourCode(src)!=undefined) {
    return src;
  } else {
    return undefined;
  }
}

export const getDaysInMonth = function getDaysInMonth(month) {
  switch(month) {
    case 1: return 31;
    case 2: return 28;
    case 3: return 31;
    case 4: return 30;
    case 5: return 31;
    case 6: return 30;
    case 7: return 31;
    case 8: return 31;
    case 9: return 30;
    case 10: return 31;
    case 11: return 30;
    case 12: return 31;
    default: return 0;
  }
}

export const getTourMask = function getTourMask(tourCode) {
  let tc = parseTourCode(tourCode);
  let timeMask = [0,0,0,0,0,0,0,0,0,0,0,0];
  let curMonthDays = 0;
  let nextMonthDays = 0;

  if (tc === undefined) return timeMask;
  if ((tc.day+5) > getDaysInMonth(tc.month)) {
    curMonthDays = getDaysInMonth(tc.month) - tc.day + 1;
    nextMonthDays = tourLength - curMonthDays;
    //console.log('overlaps ' + nextMonthDays );
  } else {
    curMonthDays = tourLength;
    //console.log('doesn\'t overlap');
  }

  const firstMonthMask = (-1 >>> (32-curMonthDays)) << (tc.day - 1);
  const secondMonthMask = (-1 >>> (31-nextMonthDays)) >>> 1;
  const secondMonthIdx = tc.month === 12 ? 1 : tc.month + 1;

  timeMask[tc.month-1] = firstMonthMask;
  timeMask[secondMonthIdx-1] = secondMonthMask;
  //detect if tour overlaps
  return timeMask;
}

export const getTourDays = function getTourDays(tourCode) {
  let startDate = parseTourCode(tourCode);
  let endDate = {day:0, month:0};
  let curMonthDays = 0;

  if (startDate === undefined) return undefined;
  if ((startDate.day+5) > getDaysInMonth(startDate.month)) {
    curMonthDays = getDaysInMonth(startDate.month) - startDate.day + 1;
    endDate.month = startDate.month==12?1:startDate.month+1;
    endDate.day = tourLength - curMonthDays;
    //console.log('overlaps ' + nextMonthDays );
  } else {
    endDate.month = startDate.month;
    endDate.day = startDate.day + tourLength;
    //console.log('doesn\'t overlap');
  }
  return {start:startDate, end:endDate};
}

export const and = function and(m1,m2) {
  let timeMask = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<timeMask.length;i++) {
    timeMask[i]=m1[i] & m2[i];
  }
  return timeMask;
}

export const zeros = function zeros(m) {
  return (m[0] || m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || m[7] || m[8] || m[9] || m[10] || m[11]) === 0;
}

export const or = function or(m1,m2) {
  let timeMask = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<timeMask.length;i++) {
    timeMask[i]=m1[i] | m2[i];
  }
  return timeMask;
}

export const not = function not(m) {
  let timeMask = [0,0,0,0,0,0,0,0,0,0,0,0];
  for (let i=0;i<timeMask.length;i++) {
    timeMask[i]=~(m[i]);
  }
  return timeMask;
}

export const getBestFrameSize = function getBestFrameSize(hfoot,hinch,suffix) {
  if (hfoot<6) {
    if (hinch<6) {
      return '17' + suffix;
    } else if (hinch<10) {
      return '19' + suffix;
    } else {
      return '21' + suffix;
    }
  } else {
    if (hinch<1) {
      return 21 + suffix;
    } else {
      return 23 + suffix;
    }
  }
}

export const getGoodFrameSizes = function getGoodFrameSize(hfoot,hinch,suffix) {
  if (hfoot<6) {
    if (hinch<6) {
      return ['17' + suffix, '19' + suffix];
    } else if (hinch<10) {
      return ['17' + suffix, '19' + suffix, '21' + suffix];
    } else {
      return ['21' + suffix, '23' + suffix];
    }
  } else {
    if (hinch<1) {
      return ['21' + suffix, '23' + suffix];
    } else {
      return ['21' + suffix, '23' + suffix];
    }
  }
}
