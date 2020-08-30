const { parseTime } = require('../utils/time');
const db = require('../lib/database');

function messageProcess(message, option) {
  const { author: { id, username } } = message;
  const user = db.get('users').find({ id }).value();
  const messageSendTime = new Date().getTime();

  switch (option) {
    case '명령어':
      message.channel.send(`
          💡 사용 가능한 명령어를 확인합니다. \`\`\`$스터디 시작: 스터디를 시작합니다. (구현 완료) \n$스터디 종료: 스터디를 종료합니다. (구현 완료) \n$스터디 랭킹: 친구들의 스터디 랭킹을 확인합니다 (구현 중) \n$스터디 친구: 현재 공부중인 친구들을 확인합니다 (구현 중) \n\n☎ 필요한 기능 or 버그 발견 시 언제든지 말해주세요~\`\`\`
      `);
      break;
    case '시작':
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
          message.channel.send(`👨‍💻 ${username}님은 이미 학습 중입니다.`)
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
    case '종료':
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
    default:
      message.channel.send(`⚠ 잘못된 명령어입니다!`);
  }
}

exports.messageProcess = messageProcess;

// TODO: minify 하기