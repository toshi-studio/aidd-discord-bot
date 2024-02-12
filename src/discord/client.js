require('dotenv').config();

const { Client, GatewayIntentBits, ChannelType, SlashCommandBuilder } = require('discord.js');
module.exports = {
    database: null,
    name: 'sync',
    description: 'Discord client',
    client: new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    }),
    database: null,

    // Init the module
    init: function () {
        // Initialize the Firebase app
        const firebaseAdmin = require('firebase-admin');
        var serviceAccount = require(`../../${process.env.FIREBASE_SERVICE_ACCOUNT}`);
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        this.database = firebaseAdmin.database();
        
        this.execCommands();

        return new Promise((resolve) => {
            this.client.once('ready', async () => {
                this.defineCommands();

                console.log('Logged in as ' + this.client.user.tag);
                resolve();
            });
            
            // Log the bot in (will trigger its presence online in the Discord server)
            this.client.login(process.env.DISCORD_TOKEN);
        });
    },

    // Crawls the guild and save the messages
    crawl: async function () {
        const _self = this;

        // Initialize the channel repository
        const fb_channels = require('../repository/channels');
        fb_channels.init(this.database);
        const allChannels = await fb_channels.getAll();

        // Let's crawl 
        return new Promise(async function (resolve) {
            // Fetch the guilds
            const guilds = await _self.client.guilds.fetch({ limit: 1 });

            if (guilds.size === 0) {
                console.log('No guilds found');
                resolve(syncData);
            } else {
                // Assume that the first and only guild is AIDD
                const aiddOAuth2Guild = guilds.values().next().value;
                // Get the guild object
                const aiddGuild = await aiddOAuth2Guild.fetch();
                // Get the channels in the guild
                const channels = await aiddGuild.channels.fetch();
                // Filter the channels to only get the text channels
                const textChannels = channels.filter(channel => channel.type === ChannelType.GuildText);

                // Loop through the text channels and log the messages and the threads
                await Promise.all(textChannels.map(async (channel) => {
                    // --------------------------------------
                    // -- MESSAGES
                    // --------------------------------------
                    // Create the message filter
                    const messageFilter = (allChannels && allChannels[channel.id])
                                            ? { after: allChannels[channel.id].lastSyncMessageId }
                                            : {};
                    // Fetch the messages
                    let messages = await channel.messages.fetch(messageFilter);
                    // Reverse order (oldest to newest)
                    messages = new Map(Array.from(messages).reverse());

                    // --------------------------------------
                    // -- THREADS
                    // --------------------------------------
                    const threadManager = await channel.threads.fetch();
                    const threads = new Map(Array.from(threadManager.threads));

                    // Save the channel
                    await fb_channels.set(
                        channel.id,
                        channel.name
                    );

                    // --------------------------------------
                    // -- SAVES
                    // --------------------------------------
                    await _self.saveMessages(channel, messages);

                    await _self.saveThread(channel, threads);

                }));
                console.log('Crawling done!');
                resolve();
            }
        });
    },

    saveMessages: async function (channel, messages) {     
        // Initialize the channel repository
        const fb_channels = require('../repository/channels');
        fb_channels.init(this.database);

        // Initialize the message repository
        const fb_messages = require('../repository/messages');
        fb_messages.init(this.database);

        return Promise.all(Array.from(messages.values()).map(async (message) => {
            // Update the channel last sync message
            await fb_channels.updateLastSyncMessage(
                channel.id,
                message.id
           );

           // Save the message
           await fb_messages.set(
                channel.id,
                message.id,
                message.author.username,
                message.cleanContent,
                message.createdTimestamp
           );
           const _humanDate = (new Date(message.createdTimestamp)).toLocaleString();
           console.log(`Synching message in ${channel.name} from ${message.author.username} on ${_humanDate}`);
       }));
    },

    saveThread: async function (channel, threads) {        
        // Initialize the thread repository
        const fb_threads = require('../repository/threads');
        fb_threads.init(this.database);

        // Get all known threads first
        const allThreads = await fb_threads.getAllByChannelId(channel.id);

        return Promise.all(Array.from(threads.values()).map(async (thread) => {

            // Create the message filter
            const messageFilter = (allThreads && allThreads[thread.id])
                        ? { after: allThreads[thread.id].lastSyncMessageId }
                        : {};
            // Fetch the messages
            let messages = await thread.messages.fetch(messageFilter);
            // Reverse order (oldest to newest)
            messages = new Map(Array.from(messages).reverse());

            // Save the thread
            await fb_threads.set(
                channel.id,
                thread.id,
                thread.archived,
                thread.name
            );

            await Promise.all(Array.from(messages.values()).map(async (message) => {
                await fb_threads.setMessage(
                    thread.id,
                    message.id,
                    message.author.username,
                    message.cleanContent,
                    message.createdTimestamp
                );
            }));
            console.log(`Synching thread ${thread.name}`);
        }));
    },

    defineCommands: async function () {
        const autoPromptData = new SlashCommandBuilder()
        .setName('auto-prompt')
        .setDescription('Sends prompt message to API')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('the espanso trigger')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL of the discord message to send')
                .setRequired(true));
            
        // Adding the command globally
        await this.client.application.commands.create(autoPromptData);
    },  
    
    execCommands: async function (interaction) {
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;
            // when the interaction is from the 'auto-prompt' command, extract the url from the options, get the message content and send it to API
            if (interaction.commandName === 'auto-prompt') {
                const urlparts = interaction.options.getString('url').split('/');
                const messageId = urlparts[urlparts.length - 1];
                const channelId = urlparts[urlparts.length - 2];
                const guildId = urlparts[urlparts.length - 3];
        
                if (messageId !== undefined && channelId !== undefined && guildId !== undefined) {
                    const guild = await this.client.guilds.fetch(guildId);
                    const channel = await guild.channels.fetch(channelId);
                    const message = await channel.messages.fetch(messageId);
                    const prompt = interaction.options.getString('trigger');
                    const response = message.content;
                    if(response.length > 0) {
                        // console.log(response);
                        // updateEspansoConfig(prompt, response);
                    }    
                    await interaction.reply({ content: `J'ai envoyé le prompt ${prompt} à l'API`, ephemeral: true });
                }
            }
        });
    },
    logout: function () {
        this.client.destroy();
        console.log('Logged out!');
    }
};