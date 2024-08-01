const Eris = require("eris")
const calculateTimeoutTime = require("../functions/calculateTimeoutTime")

const rules = require('../rules.json')["rules"]

module.exports.run = async (client, interaction) => {
	const member =  client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const ruleClause = interaction.data.options[1].value
	const ruleViolated = rules.find(rule => rule.id === ruleClause)
	
	const lastViolations = client.db.get(`violations_${member.id}`) || []
	const timeoutDuration = await calculateTimeoutTime(lastViolations, ruleViolated.severity)
	console.log(timeoutDuration)
	let violationId = 1
	for (let violation of lastViolations) {
		if (violation.id >= violationId) violationId = violation.id + 1
	}
	lastViolations.push({ id: violationId, ruleId: ruleViolated.id, rule: ruleViolated.rule, severity: ruleViolated.severity })
	client.db.set(`violations_${member.id}`, lastViolations)
	let reason = `${ruleViolated.id} - ${ruleViolated.rule} | Moderator: ${interaction.member.user.username}`
	if (timeoutDuration === -1) member.ban(0, reason)
	if (timeoutDuration > 0) member.edit({communicationDisabledUntil: new Date(Date.now() + (timeoutDuration * 60 * 60 * 1000))}, reason)
	interaction.createMessage(`<@${member.id}> violated: ${ruleViolated.id} - ${ruleViolated.rule}\n${timeoutDuration === -1 ? "Member banned!" : (timeoutDuration > 0 ? `Member got timeout for ${timeoutDuration} hours!` : `No action for member.`)}`)
}

module.exports.help = {
	name: "issue-violation",
	description: "Allows to issue a violation to someone",
	options: [
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "User to timeout",
			required: true
		},
		{
			type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
			name: "rule-clause",
			description: "Which rule is violated",
			required: true,
			choices: rules.map(rule => ({ name: `${rule.id} - ${rule.rule}`, value: rule.id }))
		}
	]
}
