const client = require('./discord/client');
client.init()
.then(async () => {
    await client.crawl();
    client.logout();
});
