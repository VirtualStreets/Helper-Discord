//only a template command for user applications

module.exports.run = async (client, interaction) => {
	interaction.createMessage("Timeout 1 min!")
	client.guilds.get(interaction.data.guild_id).members.get(interaction.data.target_id).edit({communicationDisabledUntil: new Date(Date.now() + (1000 * 60))})
}

module.exports.help = {
	name: "Timeout"
}
