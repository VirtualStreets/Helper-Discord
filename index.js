const Eris = require('eris');
const settings = require("./settings.json");
const arkdb = require('ark.db');
const fs = require("fs");
const db = new arkdb.Database();

const client = new Eris(`Bot ${settings.token}`, { intents: ["all"] });
client.db = db;
client.commands = new Eris.Collection(undefined, undefined);
client.userApplications = new Eris.Collection(undefined, undefined);
client.messageApplications = new Eris.Collection(undefined, undefined);

async function loadCommands(directory, commandType) {
    const files = fs.readdirSync(directory);
    const jsfile = files.filter(f => f.split(".").pop() == "js");
    if (jsfile.length <= 0) return console.log(`[${directory}] Unable to find commands.`);

    const cmds = await client.getGuildCommands(settings.serverId);
	let collection = commandType === Eris.Constants.ApplicationCommandTypes.CHAT_INPUT ? client.commands : (Eris.Constants.ApplicationCommandTypes.USER ? client.userApplications : client.messageApplications)

    for (const f of jsfile) {
        const props = require(`./${directory}/${f}`);
        collection.set(props.help.name, props);

        const existingCommand = cmds.find(c => c.name == props.help.name);
        const commandData = {
            name: props.help.name,
            type: commandType
        }
        
        if (commandType === Eris.Constants.ApplicationCommandTypes.CHAT_INPUT) {
            commandData.description = props.help.description;
            commandData.options = props.help.options;
        }
        
        if (!existingCommand) {
            await client.createGuildCommand(settings.serverId, commandData)
            console.log(`[${directory}] added ${f}`);
        } else {
            let notSame = existingCommand.name !== commandData.name ||
                  (commandType === Eris.Constants.ApplicationCommandTypes.CHAT_INPUT && (existingCommand.description !== commandData.description ||
                  (existingCommand.options?.length ? existingCommand.options.length : 0) !== commandData.options.length ||
                      existingCommand.options?.some(option => {
                      const commandOption = commandData.options.find(o => o.name === option.name);
                      return !commandOption || JSON.stringify(commandOption) !== JSON.stringify(option);
                  })
                  ))
            
            if (notSame) {
                await client.editGuildCommand(settings.serverId, existingCommand.id, commandData)
                console.log(`[${directory}] edited ${f}`);
            }
        }
    }

    for (let data of cmds) {
        if (data.type == commandType && !collection.has(data.name)) {
            await client.deleteGuildCommand(settings.serverId, data.id);
            console.log(`[${directory}] deleted ${data.name}`);
        }
    }
    console.log(`[${directory}] All commands have been loaded successfully.`);
}

client.on('ready', async () => {
    await loadCommands("commands", Eris.Constants.ApplicationCommandTypes.CHAT_INPUT);
    await loadCommands("userApplications", Eris.Constants.ApplicationCommandTypes.USER);
    await loadCommands("messageApplications", Eris.Constants.ApplicationCommandTypes.MESSAGE);

    await client.editStatus("online", { name: `VirtualStreets.org`, type: Eris.Constants.ActivityTypes.LISTENING });
    
    console.log("Bot is ready.");
});

client.on("interactionCreate", async interaction => {
    if (client.commands.has(interaction.data.name)) client.commands.get(interaction.data.name).run(client, interaction);
    else if (client.userApplications.has(interaction.data.name)) client.userApplications.get(interaction.data.name).run(client, interaction);
    else if (client.messageApplications.has(interaction.data.name)) client.messageApplications.get(interaction.data.name).run(client, interaction);
});

client.connect();
