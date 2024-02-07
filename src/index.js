require('dotenv').config();

const { Client, GatewayIntentBits, ChannelType  } = require('discord.js');


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// Event listener for when the bot is ready
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
   
    const guilds = await client.guilds.fetch({ limit : 1 });
    if(guilds.size === 0) {
        console.log('No guilds found');
        return;
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
        textChannels.forEach(async(channel) => {
            console.log("Channel", channel.name);
                
            const messages = await channel.messages.fetch();
            messages.forEach(message => {            
                console.log("On", (new Date(message.createdTimestamp)).toLocaleDateString());
                console.log("Author", message.author.username );
                console.log("Message", message.cleanContent);
            });
        });        
        
        // Log the bot out
        client.destroy();
    }
});

// Log the bot in (will trigger its presence online in the Discord server)
client.login(process.env.DISCORD_TOKEN);
