var Discord = require('discord.js');
var bot = new Discord.Client();
var owner = 'froghopperjacob';
var coOwner = 'Musdoy';
var gConnection = null;
var sbVoiceId = '234048547073425408';
var sbTextId = '232587822870036480';
var commands = [];
var muted = [];
function addCommand(name,description,command,func) {
	commands.push({Name:name,Desc:description,Calls:command,Function:func});
}
addCommand("Ping","Replys with 'Pong'",['ping'],function(message,splitstring) {
	message.reply("Pong!");
});
addCommand('Help','Replys with all the commands',['help','cmds'],function(message,splitstring) {
	for(var i in commands) {
		message.reply("Command:"+commands[i].Name+" Description:"+commands[i].Desc+" Calls:"+commands[i].Calls);
	}
});
addCommand('Enable tts','enables tts',['enabletts'],function(message,splitstring) {
	var textchannel = bot.channels.find('id',sbTextId)
	textchannel.overwritePermissions(everyone, {
		SEND_TTS_MESSAGES: true
	})
});
addCommand('Disable tts','disables tts',['disabletts'],function(message,splitstring) {
	var textchannel = bot.channels.find('id',sbTextId)
	textchannel.overwritePermissions(everyone, {
		SEND_TTS_MESSAGES: false
	})
});
addCommand('Mute','Makes a person server muted in a voice channel and he cant talk in a text channel',["mute"],function(message,splitstring) {
	var tableString = splitstring.split(" ");
	var name = tableString[0];
	var id = tableString[1];
	muted.push(name);
	var serverTxt = bot.channels.find('id',sbTextId);
	serverTxt.sendTTSMessage(name+" is now muted in the voice channel and in the text channel");
	var serverVoice = bot.channels.find('id',sbVoiceId);
	var members = serverVoice.members;
	console.log(members);
	console.log(members.get(id))
});
addCommand('Code','sends the message into code',['code'],function(message,splitstring) {
	message.channel.sendCode('lua',splitstring)
});
addCommand('Resembalance','that resembalance',['mrbean'],function(message,splitstring) {
	var sendmessage = bot.channels.find('id',sbTextId);
	sendmessage.sendMessage('https://cdn.discordapp.com/attachments/2018111111111111111111111111111111111111111169670846824448/201870072837308416/mrbean.jpg');
});
addCommand('Blame','The bot says that it blames somebody',['blame'],function(message,splitstring) {
	var sendtts = bot.channels.find('id',sbTextId);
	sendtts.sendTTSMessage(message.author.username+" blames "+splitstring);
});
bot.on('ready', () => {
  console.log('Bot Ready!');
  var channelmsg = bot.channels.find("id",sbTextId);
	channelmsg.sendTTSMessage('SB BOT Online');
});

bot.on('message', message => {
	if (message.content.split("",1) == '/') {
		for (var i in commands) {
			for (var a in commands[i].Calls) {
				var checkString = message.content.split(" ",1)[0];
				var length = checkString.length;
				if ("/"+commands[i].Calls[a] == checkString) {
					try {
						var splitString = message.content.slice(length+1);
						commands[i].Function(message,splitString);
					} catch(e) {
						console.log("[ERROR] : " + e);
						message.reply("There is a error with the "+commands[i].Name+" command please tell froghopperjacob/Jacob this error:"+e);
					}
				}
			}
		}
	}
});
bot.login("MjMyNTgyMTk4MTkwOTMxOTY4.CtREUA.6gwUtoslC_tRBEUMUGIoDn1gmA4");
