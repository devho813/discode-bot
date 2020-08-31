const { parseTime } = require('./time');
const db = require('../lib/database');

function messageProcess(message, option) {
  const { author: { id, username } } = message;
  const messageSendTime = new Date().getTime();

  switch (option) {
    case '명령어':{
      message.channel.send(`
          💡 사용 가능한 명령어를 확인합니다. \`\`\`$스터디 시작: 스터디를 시작합니다. \n$스터디 종료: 스터디를 종료합니다. \n$스터디 랭킹: 친구들의 스터디 랭킹을 확인합니다. \n$스터디 업데이트: 다음 업데이트 때 추가될 기능 내역을 확인합니다. \n\n☎ 필요한 기능 or 버그 발견 시 언제든지 말해주세요~\`\`\`
      `);
      break;
    }
    case '시작': {
      const user = db.get('users').find({ id }).value();

      if (!user) {
        // 신규 생성
        db.get('users')
          .push({
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
          message.channel.send(`👨‍💻 ${username}님은 이미 스터디 중입니다.`);
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
          🚀 ${username}님이 스터디를 시작하셨습니다. \`\`\`누적 시간은 스터디 종료 시 확인 가능합니다.\`\`\`
      `);
      break;
    }
    case '종료':{
      const user = db.get('users').find({ id }).value();
      const { isStudying, startTime, today, week, total } = user;

      if (!user || !isStudying) {
        message.channel.send(`⚠ 스터디를 시작하지 않았습니다.`);
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
          🎉 ${username}님이 스터디를 종료하셨습니다. \`\`\`오늘 공부한 시간: ${parseTime(today + studyAmount)} \n이번 주 공부한 시간: ${parseTime(week + studyAmount)} \n총 공부 시간: ${parseTime(total + studyAmount)}\`\`\`
      `);
      break;
    }
    case '업데이트':{
      message.channel.send(`
          🗓 다음 업데이트 때 추가될 기능 내역을 확인합니다. \`\`\`1. 봇 성능 최적화 (Minify Code) \`\`\`
      `);
      break;
    }
    case '랭킹':{
      const users = db.get('users').value();
      const sortUsers = users.map(({ username, week }) => ({
        username,
        week
      }))

      for (let i = 0; i < (sortUsers.length >= 4 ? 4 : sortUsers.length); i++) {
        for (let j = i + 1; j < sortUsers.length; j++) {

          if (sortUsers[i].week < sortUsers[j].week) {
            const temp = sortUsers[i].week;
            sortUsers[i].week = sortUsers[j].week;
            sortUsers[j].week = temp;
          }
        }
      }


      message.channel.send(`
          🏆 친구들의 일주일 스터디 랭킹을 확인합니다. \`\`\`${sortUsers[0] ? '🏅' + sortUsers[0].username + ' (' + parseTime(sortUsers[0].week) + ')': ''} ${sortUsers[1] ? '\n🥇' + sortUsers[1].username + ' (' + parseTime(sortUsers[1].week) + ')' : ''} ${sortUsers[2] ? '\n🥈' + sortUsers[2].username + ' (' + parseTime(sortUsers[2].week) + ')' : ''} ${sortUsers[3] ? '\n🥉' + sortUsers[3].username + ' (' + parseTime(sortUsers[3].week) + ')' : ''}\`\`\`
      `);
      break;
    }
    default:
      message.channel.send(`⚠ 잘못된 명령어입니다!`);
  }
}

exports.messageProcess = messageProcess;