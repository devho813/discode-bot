const { prefix } = require('./config.json');
const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

dotenv.config();

function parseTime(time) {
  let hour = Math.floor(((time / (1000 * 60 * 60)) % 24));
  let minute = Math.floor(((time / (1000 * 60)) % 60));
  let second = Math.floor((time / 1000) % 60);

  hour = hour < 10 ? '0' + hour : hour;
  minute = minute < 10 ? '0' + minute : minute;
  second = second < 10 ? '0' + second : second;

  return `${hour}:${minute}:${second}`
}

function messageProcess(message, option) {
  const { author: { id, username } } = message;
  const user = db.get('users').find({ id }).value();
  const messageSendTime = new Date().getTime();

  switch (option) {
    case '시작':
      if (!user) {
        // 신규 생성
        db.get('users').push({
          id,
          username,
          isStudying: true,
          startTime: messageSendTime,
          today: 0,
          week: 0,
          total: 0,
        }).write();
      } else {
        // 업데이트
        const { isStudying } = user;

        if (isStudying) {
          message.channel.send(`👨‍💻  ${username}님은 이미 학습 중입니다.`)
          return;
        }

        db.get('users')
          .find({ id })
          .assign({
            isStudying: true,
            startTime: messageSendTime,
          })
          .write();
      }

      message.channel.send(`
          🚀  ${username}님이 스터디를 시작하셨습니다. \`\`\`누적 시간은 스터디 종료 시 확인 가능합니다.\`\`\`
      `);
      break;
    case '종료':
      const { isStudying, startTime, today, week, total } = user;

      if (!user || !isStudying) {
        message.channel.send(`⚠  스터디를 시작하지 않았습니다.`);
        return;
      }

      const studyAmount = messageSendTime - startTime;

      db.get('users')
        .find({ id })
        .assign({
          isStudying: false,
          startTime: 0,
          today: today + studyAmount,
          week: week + studyAmount,
          total: total + studyAmount
        })
        .write();

      message.channel.send(`
          🎉  ${username}님이 스터디를 종료하셨습니다. \`\`\`금일 누적: ${parseTime(today + studyAmount)}\n금주 누적: ${parseTime(week + studyAmount)}\n총 누적: ${parseTime(total + studyAmount)}\`\`\`
      `);
      break;
    default:
      message.channel.send(`⚠ 잘못된 명령어입니다!`);
  }
}

client.once('ready', () => {
  db.defaults({ users: [] }).write();
  console.log("스터디 봇이 준비되었습니다");
});

client.on('message', message => {
  const [command, option] = message.content.split(" ");

  if (message.channel.type == 'dm') return;
  if (!message.content.startsWith(prefix)) return;
  if (command !== `${prefix}스터디`) return;

  messageProcess(message, option);
});

client.login(process.env.TOKEN);

// TODO: 
// 현재 공부중인 사람 체크
// 순위 보기 체크