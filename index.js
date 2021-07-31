require("dotenv").config();

const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./comands');

for (const folder of commandFolders) {
	if (folder !== "cars") {
		const commandFiles = fs.readdirSync(`./comands/${folder}`).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`./comands/${folder}/${file}`);
			client.commands.set(command.name, command);
		}
	}
}

const { prefix } = require('./config.json');

client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message => {
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		const args = message.content.slice(prefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

		if (!client.commands.has(commandName)) return;

		const command = client.commands.get(commandName);

		if (command.guildOnly && message.channel.type === 'dm') {
			return message.reply('I can\'t execute that command inside DMs!');
		}

		if (command.args && !args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		}

		try {
			command.execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}
});

client.login(process.env.BOT_TOKEN);
