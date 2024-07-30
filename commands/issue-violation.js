const Eris = require("eris");

const rules = require('../rules.json')["rules"]

module.exports.run = async (client, interaction) => {
	const member =  client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const ruleClause = interaction.data.options[1].value
	const ruleViolated = rules.find(rule => rule.id === ruleClause)
	
	const lastViolations = client.db.get(`violations_${member.id}`) || []
	let violationId = 1
	for (let violation of lastViolations) {
		if (violation.id >= violationId) violationId = violation.id + 1
	}
	lastViolations.push({ id: violationId, ruleId: ruleViolated.id, rule: ruleViolated.rule, severity: ruleViolated.severity })
	client.db.set(`violations_${member.id}`, lastViolations)
	
	interaction.createMessage(`<@${member.id}> violated: ${ruleViolated.id} - ${ruleViolated.rule}`)
}

module.exports.help = {
	name: "issue-violation",
	description: "Allows to issue a violation to someone",
	options: [
		{
			name: "user",
			description: "User to timeout",
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			required: true
		},
		{
			name: "rule-clause",
			description: "Which rule is violated",
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			required: true,
			choices: rules.map(rule => ({ name: `${rule.id} - ${rule.rule}`, value: rule.id }))
		}
	]
}
