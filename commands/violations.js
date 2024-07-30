const Eris = require("eris");

module.exports.run = async (client, interaction) => {
	const member = interaction.data.options ? client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value) : interaction.member
	
	let lastViolations = client.db.get(`violations_${member.id}`) || []
	lastViolations = lastViolations.map(violation => `Violation #${violation.id} - \`${violation.ruleId}\` ${violation.rule}`).join("\n")
	console.log(lastViolations)
	if (lastViolations.length === 0) lastViolations = "No violations"
	
	interaction.createMessage(`<@${member.id}> violations:\n${lastViolations}`)
}

module.exports.help = {
	name: "violations",
	description: "Allows to see violations of someone",
	options: [
		{
			name: "user",
			description: "User to see violations - yourself if blank",
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			required: false
		}
	]
}
