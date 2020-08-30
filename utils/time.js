function parseTime(time) {
  let hour = Math.floor(((time / (1000 * 60 * 60)) % 24));
  let minute = Math.floor(((time / (1000 * 60)) % 60));
  let second = Math.floor((time / 1000) % 60);

  hour = hour < 10 ? '0' + hour : hour;
  minute = minute < 10 ? '0' + minute : minute;
  second = second < 10 ? '0' + second : second;

  return `${hour}:${minute}:${second}`
}

exports.parseTime = parseTime;