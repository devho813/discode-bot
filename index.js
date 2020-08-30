const { prefix } = require('./config.json');
const dotenv = require('dotenv');
const Discord = require(`discord.js`);
const client = new Discord.Client();

dotenv.config();

client.once('ready', () => {
  console.log("스터디 봇이 준비되었습니다");
});

client.on('message', message => {
  if (message.channel.type == 'dm') return
  if (!message.content.startsWith(prefix)) return

  const mes = message.content.split(" ");
  if (mes[0] === `${prefix}스터디`) {
    switch (mes[1]) {
      case '시작':
        message.channel.send(`
            🔥  ${message.author.username}님이 스터디를 시작하셨습니다.
            \`\`\`금일 누적: 03:32:02 (5위)\n금주 누적: 08:12:34 (5위)\n총 누적: 13:22:34 (5위)\`\`\`
        `);
        break;
      case '종료':
        message.channel.send(`
            🎉  ${message.author.username}님이 스터디를 종료하셨습니다.
          \`\`\`금일 누적: 03:32:02 (5위)\n금주 누적: 08:12:34 (5위)\n총 누적: 13:22:34 (5위)\`\`\`
        `);
        break;
      default:
        message.channel.send(`⚠ 잘못된 명령어입니다!`);
    }
  }
});

client.login(process.env.TOKEN);

// TODO: 
// 현재 공부중인 사람 체크
// 순위 보기 체크