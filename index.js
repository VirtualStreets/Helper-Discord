// Required modules
const Eris = require('eris');
const arkdb = require('ark.db');
const fs = require("fs");
const dotenv = require('dotenv');
const pino = require('pino');

// Load environment variables
dotenv.config();

// Initialize the logger
const logger = pino({ level: 'info' });

// Bot Configuration
const { TOKEN, SERVER_ID, PREFIX } = require('./config');

// Initialize the bot client
const client = new Eris.Client(TOKEN, { intents: ["all"] });
client.db = new arkdb.Database();
client.commands = new Map();
client.userApplications = new Map();
client.messageApplications = new Map();

// Command Cooldowns
const cooldowns = new Map();

(async () => {
    const QuickLRU = (await import('quick-lru')).default;
    client.commandCache = new QuickLRU({ maxSize: 100 });

    async function loadCommands(directory, commandType) {
        const files = fs.readdirSync(directory).filter(f => f.endsWith(".js"));
        if (!files.length) return logger.info(`[${directory}] No commands found.`);

        const cmds = await client.getGuildCommands(SERVER_ID);
        const collection = getCollectionByType(commandType);

        const tasks = files.map(async (file) => {
            const command = require(`./${directory}/${file}`);
            const commandData = {
                name: command.help.name,
                type: commandType,
                description: command.help.description,
                options: command.help.options,
            };

            const existingCommand = cmds.find(c => c.name === command.help.name);

            if (!existingCommand) {
                await client.createGuildCommand(SERVER_ID, commandData);
                logger.info(`[${directory}] Added ${file}`);
            } else if (JSON.stringify(existingCommand) !== JSON.stringify(commandData)) {
                await client.editGuildCommand(SERVER_ID, existingCommand.id, commandData);
                logger.info(`[${directory}] Updated ${file}`);
            }

            collection.set(command.help.name, command);
        });

        await Promise.all(tasks);

        for (const cmd of cmds) {
            if (cmd.type === commandType && !collection.has(cmd.name)) {
                await client.deleteGuildCommand(SERVER_ID, cmd.id);
                logger.info(`[${directory}] Deleted ${cmd.name}`);
            }
        }
        logger.info(`[${directory}] Commands loaded.`);
    }

    // Utility function to get the right collection for the command type
    function getCollectionByType(type) {
        return {
            [Eris.Constants.ApplicationCommandTypes.CHAT_INPUT]: client.commands,
            [Eris.Constants.ApplicationCommandTypes.USER]: client.userApplications,
            [Eris.Constants.ApplicationCommandTypes.MESSAGE]: client.messageApplications,
        }[type];
    }

    // Check command cooldowns
    function checkCooldown(userId, commandName) {
        if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Map());

        const now = Date.now();
        const timestamps = cooldowns.get(commandName);
        const command = client.commandCache.get(commandName);
        const cooldownAmount = (command.cooldown || 3) * 1000; // Default 3 seconds

        if (timestamps.has(userId)) {
            const expirationTime = timestamps.get(userId) + cooldownAmount;
            if (now < expirationTime) {
                return (expirationTime - now) / 1000;
            }
        }

        timestamps.set(userId, now);
        setTimeout(() => timestamps.delete(userId), cooldownAmount);
        return null;
    }

    // Event: Bot Ready
    client.on('ready', async () => {
        await Promise.all([
            loadCommands("commands", Eris.Constants.ApplicationCommandTypes.CHAT_INPUT),
            loadCommands("userApplications", Eris.Constants.ApplicationCommandTypes.USER),
            loadCommands("messageApplications", Eris.Constants.ApplicationCommandTypes.MESSAGE)
        ]);

        client.editStatus("online", { name: `VirtualStreets.org`, type: Eris.Constants.ActivityTypes.LISTENING });
        logger.info("Bot is ready.");
    });

    // Event: Interaction Create
    client.on("interactionCreate", async interaction => {
        const commandName = interaction.data.name;
        let command = client.commandCache.get(commandName);

        if (!command) {
            command = client.commands.get(commandName) ||
                client.userApplications.get(commandName) ||
                client.messageApplications.get(commandName);

            if (command) client.commandCache.set(commandName, command);
        }

        if (command) {
            try {
                await command.run(client, interaction);
            } catch (error) {
                logger.error(`Error executing command ${commandName}:`, error);
            }
        }
    });

    // Event: Message Create
    client.on("messageCreate", async message => {
        if (message.author.bot || !message.content.startsWith(PREFIX)) return;

        console.log("hello")

        const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        console.log("hello2")

        let command = client.commandCache.get(commandName);

        if (!command) {
            command = client.commands.get(commandName);
            if (command) client.commandCache.set(commandName, command);
        }
        console.log("hello3")

        if (command) {
            // Check cooldown
            console.log("cooldown shi")

            console.log(message.author)
            console.log(message.author.id)
            const cooldownTime = checkCooldown(message.author.id, commandName);
            if (cooldownTime) {
                return message.channel.createMessage(`Please wait ${cooldownTime.toFixed(1)} more seconds before reusing the \`${commandName}\` command.`);
            }

            console.log("command run    ")

            try {
                await command.run(client, message, args);
            } catch (error) {
                logger.error(`Error executing message command ${commandName}:`, error);
                message.channel.createMessage("There was an error executing that command.");
            }
        }
    });

    // Event: Warn (Rate Limit Handling)
    client.on('warn', (message) => {
        logger.warn('Rate limit warning:', message);
    });

    // Graceful Shutdown Handling
    async function shutdown() {
        logger.info('Shutting down...');
        await client.editStatus("dnd", { name: "Shutting down..." });
        await client.disconnect({ reconnect: false });
        process.exit(0);
    }

    // Catch SIGINT and SIGTERM for graceful shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Centralized Error Handling
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', error => {
        logger.error('Uncaught Exception thrown:', error);
    });

    // Command Auto-Reloading (Development Only)
    if (process.env.NODE_ENV === 'development') {
        fs.watch('./commands', (eventType, filename) => {
            if (filename && eventType === 'change') {
                delete require.cache[require.resolve(`./commands/${filename}`)];
                logger.info(`Reloaded command: ${filename}`);
            }
        });
    }

    // Connect the bot
    client.connect();
})();