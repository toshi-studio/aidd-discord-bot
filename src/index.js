const client = require('./discord/client');
client.init()
.then(() => {
    client.crawl();
});


