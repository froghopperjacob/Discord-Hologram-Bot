var Discord = require("discord.js");
var fs = require("fs")
var nodegit = require('nodegit')
var ytdl = require("ytdl-core");
var childprocess = require('child_process')
var bot = new Discord.Client();
var guild = null
var voiceChannelid = "242327411247677442"
var voiceChannel = bot.channels.find('id',voiceChannelid)
var textChannel = null
var messageBool = false
var commands = [];
var queues = [];
var currentVolume = 0.12000000000000006
function addCommand(name,description,command,func) {
	commands.push({Name:name,Desc:description,Calls:command,Function:func});
}
addCommand("Ping","Replies with Pong",["ping"],function(message,splitString) {
	message.channel.sendMessage("Ping?").then(msg => {
		var took = msg.createdTimestamp - message.createdTimestamp
		msg.edit("Pong! ``"+took+"ms``")
	})
});
addCommand("Commands","Replys with all the commands",["cmds"],function(message,splitstring) {
	for(var i in commands) {
		message.channel.sendMessage("``Command:"+commands[i].Name+" Description:"+commands[i].Desc+" Calls:"+commands[i].Calls+"``");
	}
	message.channel.sendMessage('Do ``@Hologram help <cmd>`` to get a better desc from a command')
});

addCommand("Update","Updates the bot to the newest version",["update"],function(message,splitstring) {
	message.channel.sendMessage('Downloading latest push/version').then(m => {
		nodegit.Clone("https://github.com/froghopperjacob/Discord-Hologram-Bot", "./download").then(function(repository) {
		  var took = m.createdTimestamp - message.createdTimestamp
		  m.edit('Downloaded commit '+repository.getCommit()+'``'+took+'``')
		  message.channel.sendMessage('Shutting down and updating')
		  childprocess.exec('C:/Users/frogh/Discord-Hologram-Bot/update.bat')
		});
	})
})

addCommand("play","Plays a song or queues a song",["play"],function(message,splitstring) {
	if (bot.voiceConnections.size == 0) {
		voiceChannel.join().then(connection => {
			let dispatcher;
			play=function(song) {
				ytdl.getInfo(song,function(err,info) {
					console.log(song)
   					console.log(queues.size)
   					console.log(queues.length)
					if (song == undefined || song == null || queues.size == 0 || queues.length == 0) {
						message.channel.sendMessage("Queue is finished")
						voiceChannel.leave()
						console.log('nil')
						return
					}
					if (err) return message.channel.sendMessage('Invalid Youtube Link: ' + err)
	   				message.channel.sendMessage("Now playing "+info.title+" and was queued by "+message.author.username)
					const stream = ytdl(song, {filter : "audioonly"});
	   				const dispatcher = connection.playStream(stream)
	   				dispatcher.setVolume(currentVolume)
	   				let collector = message.channel.createCollector(m => m)
	   				collector.on("message", m => {
	   					if (m.isMentioned(bot.user)) {
	   						var checkString = m.content.split(" ")[1];
	   						if(checkString == 'pause') {
	   							message.channel.sendMessage("The song,"+info.title+", is now paused").then(() => {dispatcher.pause();});
	   						} else if(checkString == 'resume') {
	   							message.channel.sendMessage("The song,"+info.title+", is now resumed").then(() => {dispatcher.resume();});
	   						} else if(checkString == 'skip') {
								message.channel.sendMessage("Skipped the song,"+info.title).then(() => {dispatcher.end();});
	   						} else if(checkString == 'volume+') {
	   							if (Math.round(dispatcher.volume*50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
								dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split("+").length-1)))/50,2));
								currentVolume = Math.min((dispatcher.volume*50 + (2*(m.content.split("+").length-1)))/50,2)
								message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
	   						} else if(checkString == 'volume-') {
								if (Math.round(dispatcher.volume*50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
								dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split("-").length-1)))/50,0));
								currentVolume = Math.max((dispatcher.volume*50 - (2*(m.content.split("-").length-1)))/50,0)
	   						} else if(checkString == 'time') {
								message.channel.sendMessage(`Current video time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? "0"+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
	   						} else if(checkString == 'clear') {
								message.channel.sendMessage("Cleared the queue").then(() => {queues.length = 0})
	   						}
	   					}
	   				})
	   				dispatcher.on("end", () => {
	   					collector.stop();
	   					queues.shift()
	   					play(queues[0])
	   					console.log(queues[0])
	   					console.log(queues.size)
	   					console.log(queues.length)
	   					if(queues[0] == undefined || queues[0] == null || queues.size == 0 || queues.length == 0) {
							console.log('nil')
							message.channel.sendMessage("Queue is finished")
							voiceChannel.leave()
							return
	   					}
	   				})
	   				dispatcher.on("error", error => {
	   					return message.channel.sendMessage("error: "+error).then(() => {
	   						collector.stop()
	   						queues.shift()
	   						play(queues[0])
	   					})
	   				})
				})
			}
			play(splitstring)
			queues.push(splitstring)
		}).catch(console.error)
	} else if (bot.voiceConnections.size != 0) {
		queues.push(splitstring)
		ytdl.getInfo(splitstring,function(err,info) {
			message.channel.sendMessage("Queued "+info.title+" in #"+queues.length+" queue spot by "+message.author.username)
		})
	}
})
addCommand("setVoice","sets the voiceChannel in which the bot will join",["setVoice"],function(message,splitstring) {
	var find = bot.channels.find('id',splitstring)
	voiceChannel = find
	message.channel.sendMessage('Set main voice channel to '+find.name)
})
addCommand("forceLeave","force leaves the bot",["forceleave"],function(message,splitstring) {
	voiceChannel.leave()
	message.channel.sendMessage('Left voice channel:'+voiceChannel.name)
})
addCommand('setTxtChannel',"set's the bots normal text channel",['setTxtChannel'],function(message,splitstring) {
	var find = bot.channels.find('id',splitstring)
	textChannel = find
	message.channel.sendMessage('Set main text channel to '+find.name)
})
bot.on("message", message => {
	guild = message.guild
	if(messageBool == true) {
		textChannel = guild.defaultChannel
		message.guild.defaultChannel.sendMessage("Hologram bot Online");
		message.guild.defaultChannel.sendMessage('type in ``@Hologram cmds`` for cmds and help')
		messageBool = false
	}
	if (message.isMentioned(bot.user)) {
		for (var i in commands) {
			for (var a in commands[i].Calls) {
				var checkString = message.content.split(" ")[1];
				var length = checkString.length;
				if (commands[i].Calls[a] == checkString) {
					try {
						var splitString = message.content.split(" ")[2]
						if (splitString == undefined) {
							commands[i].Function(message,null);
						} else {
							commands[i].Function(message,splitString);
						}
					} catch(e) {
						console.log("[ERROR] : " + e);
						message.reply("There is a error with the "+commands[i].Name+" command please tell froghopperjacob/Jacob this error:"+e);
					}
				}
			}
		}
	}
});
bot.on("ready", () => {
  console.log("Bot Ready!");
  messageBool = true
  bot.user.setGame("with Music")
});
bot.login("MjQyMzQ0MDAyNDU4ODc3OTUy.CvfGew.BC1NlQDxMarglXiUhPbtbbovJ0E");