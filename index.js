const Eris = require('eris');
const settings = require("./settings.json")
const arkdb = require('ark.db');
const fs = require("fs");
const db = new arkdb.Database()

const client = new Eris(`Bot ${settings.token}`, {intents: ["all"]})
client.db = db
client.commands = new Eris.Collection(undefined, undefined)
client.userApplications = new Eris.Collection(undefined, undefined)

client.on('ready', async () => {
	client.editStatus("online", {name: `VirtualStreets.org`, type: Eris.Constants.ActivityTypes.LISTENING})
	
	fs.readdir("commands", (err, files) => {
		const jsfile = files.filter(f => f.split(".").pop() == "js");
		if (jsfile.length <= 0 || err || !files) return console.log("Unable to find commands.");
		
		client.getGuildCommands(settings.serverId).then(async cmds => {
			for (const f of jsfile) {
				const props = require(`./commands/${f}`);
				client.commands.set(props.help.name, props);
				if (!cmds.find(c => c.name == props.help.name)) {
					client.createGuildCommand(settings.serverId, {
						name: props.help.name,
						options: props.help.options || [],
						description: props.help.description
					})
					console.log(`added ${f}`)
				}else{
					client.editGuildCommand(settings.serverId, cmds.find(c => c.name == props.help.name).id, {
						name: props.help.name,
						description: props.help.description,
						options: props.help.options || []
					})
					console.log(`edited ${f}`)
				}
			}
			
			for (let data of cmds) {
				if (data.type == Eris.Constants.ApplicationCommandTypes.CHAT_INPUT && !client.commands.has(data.name)) {
					client.deleteGuildCommand(settings.serverId, data.id)
					console.log(`deleted ${data.name}`)
				}
			}
		}).then(() => console.log("All commands have been loaded successfully."))
	});
	
	fs.readdir("userApplications", (err, files) => {
		const jsfile = files.filter(f => f.split(".").pop() == "js");
		if (jsfile.length <= 0 || err || !files) return console.log("Unable to find user applications.");
		
		client.getGuildCommands(settings.serverId).then(async cmds => {
			for (const f of jsfile) {
				const props = require(`./userApplications/${f}`);
				client.userApplications.set(props.help.name, props);
				if (!cmds.find(c => c.name == props.help.name)) {
					client.createGuildCommand(settings.serverId, {
						name: props.help.name,
						type: Eris.Constants.ApplicationCommandTypes.USER
					})
					console.log(`[user applications] added ${props.help.name}`)
				}
			}
			
			for (let data of cmds) {
				if (data.type == Eris.Constants.ApplicationCommandTypes.USER && !client.userApplications.has(data.name)) {
					await client.deleteGuildCommand(settings.serverId, data.id)
					console.log(`[user applications] deleted ${data.name}`)
				}
			}
		}).then(() => console.log("[user applications] All commands have been loaded successfully."))
	});
})

client.on("interactionCreate", async interaction => {
	if (client.userApplications.has(interaction.data.name)) {
		const command = client.userApplications.get(interaction.data.name)
		command.run(client, interaction)
	} else if (client.commands.has(interaction.data.name)) {
		const command = client.commands.get(interaction.data.name)
		command.run(client, interaction)
	}
})

client.connect()
