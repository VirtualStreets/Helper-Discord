const Eris = require("eris");

module.exports.run = async (client, interaction) => {
	const member =  client.guilds.get(interaction.guildID).members.get(interaction.data.options[0].value)
	const severity = interaction.data.options[1].value
	
	let hoursofTimeout = 0
	switch (severity) {
		case "1":
			hoursofTimeout = 0
			break
		case "2":
			hoursofTimeout = 0
			break
		case "3":
			hoursofTimeout = 3
			break
		case "4":
			hoursofTimeout = 48
			break
	}
	
	const lastViolations = client.db.get(`violations_${member.id}`) || []
	let violationPoint = 0
	for (let violation of lastViolations) {
		switch (violation.severity) {
			case 1:
				violationPoint += 1
				break
			case 2:
				violationPoint += 3
				break
			case 3:
				violationPoint += 5
				break
			case 4:
				violationPoint += 10
				break
		}
	}
	
	switch (severity) {
		case "1":
			hoursofTimeout += Math.round(violationPoint * 0.75)
			break
		case "2":
			hoursofTimeout += Math.round(violationPoint)
			break
		case "3":
			hoursofTimeout += Math.round(violationPoint * 1.75)
			break
		case "4":
			hoursofTimeout += Math.round(violationPoint * 3)
			break
	}
	if (violationPoint < 5 && severity <= 2) hoursofTimeout = 0
	if (violationPoint < 8 && severity <= 1) hoursofTimeout = 0
	if (violationPoint >= 30 || severity == 5) return interaction.createMessage(`Expected timeout duration: immediate ban`)
	
	
	interaction.createMessage(`Expected timeout duration: ${hoursofTimeout} hours`)
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
