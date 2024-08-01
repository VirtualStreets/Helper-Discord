const Eris = require("eris");

module.exports.run = async (client, interaction) => {
	const member =  client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const duration = interaction.data.options[1].value
	const durationUnit = interaction.data.options[2].value
	const reason = interaction.data.options[3]?.value || "No reason provided"
	
	let durationInMs = 0
	switch (durationUnit) {
		case "seconds":
			durationInMs = duration * 1000
			break
		case "minutes":
			durationInMs = duration * 1000 * 60
			break
		case "hours":
			durationInMs = duration * 1000 * 60 * 60
			break
		case "days":
			durationInMs = duration * 1000 * 60 * 60 * 24
			break
	}
	
	member.edit({communicationDisabledUntil: new Date(Date.now() + durationInMs)}, reason + ` | Moderator: ${interaction.member.user.username}`)
	interaction.createMessage(`<@${member.id}> has been timed out for ${duration} ${durationUnit} for the reason: ${reason}`)
}

module.exports.help = {
	name: "timeout",
	description: "Allows to timeout someone",
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "User to timeout",
			required: true
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.NUMBER,
			name: "duration",
			description: "Duration of the timeout",
			required: true,
			min_value: 1,
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			name: "duration-unit",
			description: "Duration unit of the timeout",
			required: true,
			choices: [
				{
					"name": "Seconds",
					"value": "seconds"
				},
				{
					"name": "Minutes",
					"value": "minutes"
				},
				{
					"name": "Hours",
					"value": "hours"
				},
				{
					"name": "Days",
					"value": "days"
				}
			]
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			name: "reason",
			description: "Reason of the timeout"
		},
	]
}
