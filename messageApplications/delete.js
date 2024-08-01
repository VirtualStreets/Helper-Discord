//only a template command for message applications

module.exports.run = async (client, interaction) => {
	const message = await interaction.channel.getMessage(interaction.data.target_id)
	message.delete()
	interaction.createMessage("Message deleted!")
}

module.exports.help = {
	name: "Delete Message"
}
