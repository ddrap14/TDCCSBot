module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
		message.channel.awaitMessages(filter, {
			max: 1,
			time: waitTime,
			errors: ['time']
		})
	},
};
