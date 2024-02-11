module.exports = {
    database: null,
    name: 'sync',
    description: 'Access to the messages table in firebase',

    // Init the module
    init: function(database) {
        this.database = database;
    },

    // Get the channels table
    get: async function(messageId) {
        const ref = this.database.ref(`messages/${messageId}`);
        const snapshot = await ref.once('value');
        return snapshot.val();
    },

    // Set a message
    set: async function(channelId, messageId, author, messageContent, messageTimestamp) {
        const channelRef = this.database.ref(`messages/${messageId}/channelId`);
        await channelRef.set(channelId);

        const authorRef = this.database.ref(`messages/${messageId}/author`);
        await authorRef.set(author);

        const contentRef = this.database.ref(`messages/${messageId}/content`);
        await contentRef.set(messageContent);

        const timestampRef = this.database.ref(`messages/${messageId}/timestamp`);
        await timestampRef.set(messageTimestamp);
    },

    // Get by channel id
    getAllByChannelId: async function(channelId) {
        const ref = this.database.ref('messages');        
        const snapshot = await ref.orderByChild('channelId').equalTo(channelId).once('value');
        return snapshot.val();
    }
};