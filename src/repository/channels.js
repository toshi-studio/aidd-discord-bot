module.exports = {
    database: null,
    name: 'sync',
    description: 'Access to the channels table in firebase',

    // Init the module
    init: function(database) {
        this.database = database;
    },

    // Get the channels table
    get: async function(channelId) {
        const ref = this.database.ref(`channels/${channelId}`);
        const snapshot = await ref.once('value');
        return snapshot.val();
    },

    // Set a channel
    set: async function(channelId, channelName) {
        const nameRef = this.database.ref(`channels/${channelId}/name`);
        await nameRef.set(channelName);
    },

    updateLastSyncMessage: async function(channelId, lastSyncMessageSnowflake) {
        const syncRef = this.database.ref(`channels/${channelId}/lastSyncMessageId`);
        await syncRef.set(lastSyncMessageSnowflake);
    },

    updateLastSyncThread: async function(channelId, lastSyncThreadSnowflake) {
        const syncRef = this.database.ref(`channels/${channelId}/lastSyncThreadId`);
        await syncRef.set(lastSyncThreadSnowflake);
    },

    // Get all the channels
    getAll: async function() {
        const ref = this.database.ref('channels');
        const snapshot = await ref.once('value');
        return snapshot.val();
    }
};