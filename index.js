const { prefix } = require('./config.json');
const dotenv = require('dotenv');
const Discord = require('discord.js');
const client = new Discord.Client();
const db = require('./lib/database');
const { messageProcess } = require('./src/message');
const { initialUserStudyTime } = require('./src/time');

dotenv.config();

client.once('ready', () => {
  db.defaults({ users: [] }).write();
  console.log("스터디 봇이 준비되었습니다");
});

let studyTimerFlag = false;

client.on('message', message => {
  if(!studyTimerFlag){
    initialUserStudyTime(message);
    studyTimerFlag = true;
  }
  
  const [command, option] = message.content.split(" ");
  if (message.channel.name !== '독서실📚') return;
  if (message.channel.type == 'dm') return;
  if (!message.content.startsWith(prefix)) return;
  if (command !== `${prefix}스터디`) return;

  messageProcess(message, option);
});

client.login(process.env.TOKEN);