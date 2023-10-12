const moment = require('moment');
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
  
    seconds = seconds % 60;
    minutes = minutes % 60;
  
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
      seconds,
    )}`;
  }
const getDaysBwDtaes=(startDate,endDate)=>{
  const dateArray = new Array();
    let currentDate = moment(startDate);
    let stopDate=moment(endDate)
    while (currentDate <= stopDate) {
        dateArray.push(moment(currentDate).format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'days');
    }
    return dateArray;
}
module.exports={
    convertMsToTime,
    getDaysBwDtaes
}