var Discord = require("discord.js");
var fs = require("fs")
var ytdl = require("ytdl-core");
var bot = new Discord.Client();
var voiceChannelid = "242327411247677442"
var commands = [];
var queues = [];
var currentVolume = 0.12000000000000006
var prefix = "!"
function addCommand(name,description,command,func) {
	commands.push({Name:name,Desc:description,Calls:command,Function:func});
}
addCommand("Ping","Replies with Pong",["ping"],function(message,splitString) {
	message.reply("Pong!")
});
addCommand("Help","Replys with all the commands",["help","cmds"],function(message,splitstring) {
	for(var i in commands) {
		message.reply("Command:"+commands[i].Name+" Description:"+commands[i].Desc+" Calls:"+commands[i].Calls);
	}
});

addCommand("poke","poke ur enemy",["poke"],function(message,splitstring) {

})
addCommand("play","Plays a song or queues a song",["play"],function(message,splitstring) {
	var voiceChannel = bot.channels.find("id",voiceChannelid)
	if (bot.voiceConnections.size == 0) {
		voiceChannel.join().then(connection => {
			let dispatcher;
			play=function(song) {
				ytdl.getInfo(song,function(err,info) {
					console.log(song)
   					console.log(queues.size)
   					console.log(queues.length)
					if (song == undefined || song == null || queues.size == 0 || queues.length == 0) {
						var voiceChannel = bot.channels.find("id",voiceChannelid)
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
						if (m.content.startsWith(prefix + "pause")) {
							message.channel.sendMessage("The song,"+info.title+", is now paused").then(() => {dispatcher.pause();});
						} else if (m.content.startsWith(prefix + "resume")){
							message.channel.sendMessage("The song,"+info.title+", is now resumed").then(() => {dispatcher.resume();});
						} else if (m.content.startsWith(prefix + "skip")){
							message.channel.sendMessage("Skipped the song,"+info.title).then(() => {dispatcher.end();});
						} else if (m.content.startsWith(prefix+"volume+")){
							if (Math.round(dispatcher.volume*50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(m.content.split("+").length-1)))/50,2));
							currentVolume = Math.min((dispatcher.volume*50 + (2*(m.content.split("+").length-1)))/50,2)
							message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith(prefix+"volume-")){
							if (Math.round(dispatcher.volume*50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
							dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(m.content.split("-").length-1)))/50,0));
							currentVolume = Math.max((dispatcher.volume*50 - (2*(m.content.split("-").length-1)))/50,0)
							message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
						} else if (m.content.startsWith(prefix + "time")){
							message.channel.sendMessage(`Current video time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? "0"+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
						} else if(m.content.startsWith(prefix + "clear")){
							message.channel.sendMessage("Cleared the queue").then(() => {queues.length = 0})
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
							var voiceChannel = bot.channels.find("id",voiceChannelid)
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
addCommand("setId","sets the voiceChannel in which the bot will join",["setid"],function(message,splitstring) {
	voiceChannelid = splitstring
})
addCommand("forceLeave","force leaves the bot",["forceleave"],function(message,splitstring) {
	var voiceChannel = bot.channels.find("id",voiceChannelid)
	voiceChannel.leave()
})
bot.on("message", message => {
	if (message.content.split("",1) == prefix) {
		for (var i in commands) {
			for (var a in commands[i].Calls) {
				var checkString = message.content.split(" ",1)[0];
				var length = checkString.length;
				if (prefix+commands[i].Calls[a] == checkString) {
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
bot.on("ready", () => {
  console.log("Bot Ready!");
  var channelmsg = bot.channels.find("id","234694901386838017");
  channelmsg.sendMessage("Hologram bot Online");
  bot.user.setGame("with Music")
});
bot.login("MjQyMzQ0MDAyNDU4ODc3OTUy.CvfGew.BC1NlQDxMarglXiUhPbtbbovJ0E");