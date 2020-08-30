const { parseTime } = require('../utils/time');
const db = require('../lib/database');

function messageProcess(message, option) {
  const { author: { id, username } } = message;
  const user = db.find({ id }).value();
  const messageSendTime = new Date().getTime();

  switch (option) {
    case '명령어':
      break;
    case '시작':
      if (!user) {
        // 신규 생성
        db.push({
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

        db.find({ id })
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

      db.find({ id })
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
    case '공지':
      break;
    default:
      message.channel.send(`⚠ 잘못된 명령어입니다!`);
  }
}

exports.messageProcess = messageProcess;