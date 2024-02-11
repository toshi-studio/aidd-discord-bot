require('dotenv').config();

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
module.exports = {
    database: null,
    name: 'sync',
    description: 'Discord client',
    client: new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    }),

    // Init the module
    init: function () {
        return new Promise((resolve) => {
            this.client.once('ready', async () => {
                resolve();
            });
            // Log the bot in (will trigger its presence online in the Discord server)
            this.client.login(process.env.DISCORD_TOKEN);
        });
    },

    // Crawls the guild and save the messages
    crawl: async function () {
        // Initialize the Firebase app
        const firebaseAdmin = require('firebase-admin');
        var serviceAccount = require(`../${process.env.FIREBASE_SERVICE_ACCOUNT}`);
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });

        const database = firebaseAdmin.database();

        // Initialize the channel repository
        const fb_channels = require('../repository/channels');
        fb_channels.init(database);
        const allChannels = await fb_channels.getAll();

        // Initialize the message repository
        const fb_messages = require('../repository/messages');
        fb_messages.init(database);

        const _self = this;
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

                // Loop through the text channels and log the messages
                await Promise.all(textChannels.map(async (channel) => {

                    // Create the message filter
                    const messageFilter = (allChannels && allChannels[channel.id])
                        ? { after: allChannels[channel.id].lastSyncMessageId }
                        : {};
                    // Fetch the messages
                    let messages = await channel.messages.fetch(messageFilter);

                    // Reverse order (oldest to newest)
                    messages = new Map(Array.from(messages).reverse());

                    await Promise.all(Array.from(messages.values()).map(async (message) => {
                        // Update the channel last sync message
                        await fb_channels.set(
                            channel.id,
                            channel.name,
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
                }));
                console.log('Crawling done!');
                resolve();
            }
        });
    },

    logout: function () {
        this.client.destroy();
    }
};