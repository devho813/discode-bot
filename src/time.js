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

function initUserTimer(user, dateTypes){
  for(type of dateTypes){
    user[type] = 0;
  }
}

function initialUserStudyTime(message) {
  setInterval(async () => {
    const date = new Date();
    const hours = date.getHours(); // 5 -> 새벽 5시
    const week = date.getDay(); // 1 -> 월요일

    if (hours === 15 && week === 1) {
      await message.channel.send(`⏳ 오늘, 이번 주 스터디 시간이 초기화되었습니다.`);
      await message.channel.send('$스터디 랭킹');
      
      db.get('users')
        .each((user) => initUserTimer(user, ['startTime', 'today', 'week']))
        .write();
      return;
    } 
    
    if (hours === 15 && week !== 1) {
      await message.channel.send(`⏳ 오늘 스터디 시간이 초기화되었습니다.`);
      await message.channel.send('$스터디 랭킹');

      db.get('users')
        .each((user) => !user.isStudying && initUserTimer(user, ['today']))
        .write()
      return; 
    }
  }, 1000 * 60 * 60);
}

exports.initialUserStudyTime = initialUserStudyTime;
exports.parseTime = parseTime;