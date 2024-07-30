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
			name: "user",
			description: "User to remove violation",
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			required: true
		},
		{
			name: "violation-id",
			description: "Violation ID to remove",
			type: Eris.Constants.ApplicationCommandOptionTypes.NUMBER,
			min_value: 1,
			required: true
		}
	]
}
