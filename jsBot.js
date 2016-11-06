const Discord = require("discord.js");
const google = require('googleapis')
const fs = require("fs")
const nodegit = require('nodegit')
const ytdl = require("ytdl-core");
const childprocess = require('child_process')
const bot = new Discord.Client();
let guild = null
let voiceChannelid = "242368987021836289"
let textChannel = null
let messageBool = false
let commands = [];
let queues = [];
let currentVolume = 0.12000000000000006
function addCommand(name,description,command,func) {
	commands.push({Name:name,Desc:description,Calls:command,Function:func});
}
addCommand("Ping","Replies with Pong",["ping"],function(message,splitString) {
	message.channel.sendMessage("Ping?").then(msg => {
		var took = msg.createdTimestamp - message.createdTimestamp
		msg.edit("Pong! ``"+took+"ms``")
	})
});
addCommand("Commands","Replys with all the commands",["cmds",'commands'],function(message,splitstring) {
	for(var i in commands) {
		message.channel.sendMessage("``Command:"+commands[i].Name+" Description:"+commands[i].Desc+" Calls:"+commands[i].Calls+"``");
	}
	message.channel.sendMessage('Do ``@Hologram help <cmd>`` to get a better desc from a command')
});
addCommand('Help','Gives the full description of a command',['help'],function(message,splitstring) {

})
addCommand("Updategit","Updates the bot to the newest version of the repository",["updategit"],function(message,splitstring) {
	message.channel.sendMessage('Downloading latest push/version').then(m => {
		nodegit.Clone("https://github.com/froghopperjacob/Discord-Hologram-Bot", "./download").then(function(repository) {
		  var took = m.createdTimestamp - message.createdTimestamp
		  m.edit('Downloaded commit '+repository.getCommit()+'``'+took+'ms``')
		  message.channel.sendMessage('Shutting down and updating')
		  childprocess.exec('C:/Users/frogh/Discord-Hologram-Bot/update.bat')
		});
	})
})
addCommand('Search images','Searches google for images',['image'],function(message,splitstring) {
	customsearch = google.customsearch('v1')
	customsearch.cse.list({cx:'010090593600436946172:tki7yhxfw7u',q:splitstring,auth:'AIzaSyDBaQK3vYdBdVWIZyc_td498I5zoGfEp9E',searchType:'image'},function(err,resp) {
		if (err) {
			message.channel.sendMessage('Error!\n```'+err+'\n```')
		}

		if (resp.items && resp.items.length > 0) {
			randomR = resp.items[Math.floor((Math.random() * resp.items.length) + 1)]
			message.channel.sendMessage('Results:'+resp.searchInformation.formattedTotalResults)
			message.channel.sendMessage('Image:``'+randomR.title+'``\n'+randomR.link)
		} else {
			message.channel.sendMessage('No results :(')
		}
	})
})
addCommand('Search giphy','Searches giphy for images',['gif'],function(message,splitstring) {
	customsearch = google.customsearch('v1')
	customsearch.cse.list({cx:'010090593600436946172:tki7yhxfw7u',q:splitstring,auth:'AIzaSyDBaQK3vYdBdVWIZyc_td498I5zoGfEp9E',searchType:'image',linkSite:'www.giphy.com'},function(err,resp) {
		if (err) {
			message.channel.sendMessage('Error!\n```'+err+'\n```')
		}

		if (resp.items && resp.items.length > 0) {
			randomR = resp.items[Math.floor((Math.random() * resp.items.length) + 1)]
			message.channel.sendMessage('Results:'+resp.searchInformation.formattedTotalResults)
			message.channel.sendMessage('Image:``'+randomR.title+'``\n'+randomR.link)
		} else {
			message.channel.sendMessage('No results :(')
		}
	})
})
addCommand('Search','Searches google',['search'],function(message,splitstring) {
	customsearch = google.customsearch('v1')
	customsearch.cse.list({cx:'010090593600436946172:tki7yhxfw7u',q:splitstring,auth:'AIzaSyDBaQK3vYdBdVWIZyc_td498I5zoGfEp9E'},function(err,resp) {
		if (err) {
			message.channel.sendMessage('Error:\n```'+err+'\n```')
		}

		if (resp.items && resp.items.length > 0) {
			firstR = resp.items[0]
			message.channel.sendMessage('Results:'+resp.searchInformation.formattedTotalResults)
			message.channel.sendMessage('The first result is \n```Title:'+firstR.title+'\n\nLink : '+firstR.link+'\nDescription : '+firstR.snippet+"\n```")
		} else {
			message.channel.sendMessage('No results :(')
		}
	})

})
addCommand('Update','Updates the bot from the local machine',['update'],function(message,splitstring) {
	message.channel.sendMessage('Updating and shutting down..').then(m => {
		childprocess.exec('cmd /c start "" cmd /c run.bat', function(){
		   // …you callback code may run here…
		});
		setTimeout(function(){
			process.exit()
		},2000)
	})
})

addCommand("play","Plays a song or queues a song",["play"],function(message,splitstring) {
	var voiceChannel = bot.channels.find('id',voiceChannelid)
	if (bot.voiceConnections.size == 0) {
		voiceChannel.join().then(connection => {
			let dispatcher;
			play=function(song) {+
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
	   						let checkString = m.content.split(" ")[1];
	   						let args = m.content.split(' ')[2]
	   						if(checkString == 'pause') {
	   							message.channel.sendMessage("The song,"+info.title+", is now paused").then(() => {dispatcher.pause();});
	   						} else if(checkString == 'resume') {
	   							message.channel.sendMessage("The song,"+info.title+", is now resumed").then(() => {dispatcher.resume();});
	   						} else if(checkString == 'skip') {
								message.channel.sendMessage("Skipped the song,"+info.title).then(() => {dispatcher.end();});
	   						} else if(checkString == 'volume+') {
	   							if (Math.round(dispatcher.volume*50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
								dispatcher.setVolume(Math.min((dispatcher.volume*50 + (2*(args.split("+").length-1)))/50,2));
								currentVolume = Math.min((dispatcher.volume*50 + (2*(args.split("+").length-1)))/50,2)
								message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
	   						} else if(checkString == 'volume-') {
								if (Math.round(dispatcher.volume*50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
								dispatcher.setVolume(Math.max((dispatcher.volume*50 - (2*(args.split("-").length-1)))/50,0));
								currentVolume = Math.max((dispatcher.volume*50 - (2*(args.split("-").length-1)))/50,0)
								message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume*50)}%`);
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
	let find = message.guild.channels.find('name',splitstring)
	voiceChannelid = find.id
	message.channel.sendMessage('Set main voice channel to '+find.name)
})
addCommand("forceLeave","force leaves the bot",["forceleave"],function(message,splitstring) {
	let voiceChannel = message.guild.channels.find('id',voiceChannelid)
	voiceChannel.leave()
	message.channel.sendMessage('Left voice channel:'+voiceChannel.name)
})
addCommand('setTxtChannel',"set's the bots normal text channel",['setTxtChannel'],function(message,splitstring) {
	let find = message.guild.channels.find('name',splitstring)
	textChannel = find
	message.channel.sendMessage('Set main text channel to '+find.name)
})
addCommand('Kick','Kicks a play from a server',['kick'],function(message,splitstring) {
	let object = bot.users.find('username',splitstring)
	message.guild.member(object).kick()
	message.channel.sendMessage('Kicked player '+splitstring)
})
addCommand('Ban','Bans a play from a server',['ban'],function(message,splitstring) {
	let object = bot.users.find('username',splitstring)
	message.guild.member(object).ban()
	message.channel.sendMessage('Kicked player '+splitstring)
})
addCommand('Eval','Runs a piece of code',['eval'],function(message,splitstring) {
	message.channel.sendMessage('Running..').then(m => {
		try {
			m.edit("```js\n"+eval(splitstring.trim())+"\n```")
		} catch (err) {
			m.edit('Error!\n```js\n'+err.message+"\n```")
			console.log(err.stack)
		}
	})
})
bot.on("message", message => {
	if(message.author.bot) return;
	guild = message.guild
	if(messageBool == true) {
		textChannel = guild.defaultChannel
		var find = message.guild.channels.find('name','General')
		voiceChannelid = find.id
		//message.guild.defaultChannel.sendMessage("Hologram bot Online");
		//message.guild.defaultChannel.sendMessage('type in ``@Hologram cmds`` for cmds and help')
		messageBool = false
	}
	if (message.isMentioned(bot.user)) {
		let check = false
		let checkString = message.content.split(" ")[1];
		let length = checkString.length;
		for (var i in commands) {
			for (var a in commands[i].Calls) {
				if (commands[i].Calls[a] == checkString) {
					check = true
					try {
						let splitString = message.content.slice(length+23);
						commands[i].Function(message,splitString);
					} catch(e) {
						console.log("[ERROR] : " + e);
						message.reply("There is a error with the "+commands[i].Name+" command please tell froghopperjacob/Jacob this error:"+e);
					}
				}
			}
		}
		if (check == false) {
			//message.channel.sendMessage('Unknown command "'+checkString+'" type ``@Hologram commands`` for commands')
		}
	}
});
bot.on("ready", () => {
  console.log("Bot Ready!");
  messageBool = true
  bot.user.setGame("@Hologram cmds")
});
bot.login("MjQyMzQ0MDAyNDU4ODc3OTUy.CvfGew.BC1NlQDxMarglXiUhPbtbbovJ0E");