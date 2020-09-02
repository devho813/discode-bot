const db = require("../lib/database");

function parseTime(time) {
  let hour = Math.floor(((time / (1000 * 60 * 60)) % 24));
  let minute = Math.floor(((time / (1000 * 60)) % 60));
  let second = Math.floor((time / 1000) % 60);

  hour = hour < 10 ? '0' + hour : hour;
  minute = minute < 10 ? '0' + minute : minute;
  second = second < 10 ? '0' + second : second;

  return `${hour}:${minute}:${second}`
}

function initialUserStudyTime() {
  setInterval(() => {
    const date = new Date();
    const hours = date.getHours(); // 5 -> 새벽 5시
    const week = date.getDay(); // 1 -> 월요일

    if (hours === 5 && week === 1) {
      db.get('users')
        .find({ isStudying: false })
        .assign({ today: 0, week: 0 })
        .write()
    } else if (hours === 5) {
      db.get('users')
        .find({ isStudying: false })
        .assign({ today: 0 })
        .write()
    }
  }, 1000 * 60 * 60);
}

exports.initialUserStudyTime = initialUserStudyTime;
exports.parseTime = parseTime;