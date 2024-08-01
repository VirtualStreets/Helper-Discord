const Eris = require("eris");

module.exports.run = async (client, interaction) => {
	const member = client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const violationId = interaction.data.options[1].value
	
	let lastViolations = client.db.get(`violations_${member.id}`) || []
	const violationIndex = lastViolations.findIndex(violation => violation.id === violationId)
	if (violationIndex === -1) return interaction.createMessage(`Violation #${violationId} not found`)
	lastViolations.splice(violationIndex, 1)
	client.db.set(`violations_${member.id}`, lastViolations)
	interaction.createMessage(`Removed violation #${violationId} from <@${member.id}>`)
}

module.exports.help = {
	name: "remove-violation",
	description: "Allows to remove a violation of someone",
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "User to remove violation",
			required: true
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.NUMBER,
			name: "violation-id",
			description: "Violation ID to remove",
			required: true,
			min_value: 1
		}
	]
}
