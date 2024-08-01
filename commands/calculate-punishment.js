const Eris = require("eris");
const calculateTimeoutTime = require("../functions/calculateTimeoutTime")

module.exports.run = async (client, interaction) => {
	const member =  client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const severity = interaction.data.options[1].value

	const lastViolations = client.db.get(`violations_${member.id}`) || []
	const timeoutTime = await calculateTimeoutTime(lastViolations ,severity)
	
	interaction.createMessage(`Expected timeout duration: ${timeoutTime} hours`)
}

module.exports.help = {
	name: "calculate-punishment",
	description: "Allows to calculate a punishment after a violation",
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "User to timeout",
			required: true
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			name: "new-violation-severity",
			description: "Severity of the violation",
			required: true
		}
	]
}
