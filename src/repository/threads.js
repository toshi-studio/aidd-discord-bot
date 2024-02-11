module.exports = {
    database: null,
    name: 'sync',
    description: 'Access to the threads table in firebase',

    // Init the module
    init: function(database) {
        this.database = database;
    },

    // Get the channels table
    get: async function(threadId) {
        const ref = this.database.ref(`threads/${threadId}`);
        const snapshot = await ref.once('value');
        return snapshot.val();
    },

    // Set a thread
    set: async function(channelId, threadId, archived, threadName) {
        const threadNameRef = this.database.ref(`threads/${threadId}/name`);
        const channelRef = this.database.ref(`threads/${threadId}/channelId`);
        const archivedRef = this.database.ref(`threads/${threadId}/archived`);

        await Promise.all([
            threadNameRef.set(threadName),
            channelRef.set(channelId),
            archivedRef.set(archived),
        ]);
    },

    setMessage: async function(threadId, messageId, author, messageContent, messageTimestamp) {
        const syncRef = this.database.ref(`threads/${threadId}/lastSyncMessageId`);
        const authorRef = this.database.ref(`threads/${threadId}/messages/${messageId}/author`);
        const contentRef = this.database.ref(`threads/${threadId}/messages/${messageId}/content`);
        const timestampRef = this.database.ref(`threads/${threadId}/messages/${messageId}/timestamp`);

        await Promise.all([
            syncRef.set(messageId),
            authorRef.set(author),
            contentRef.set(messageContent),
            timestampRef.set(messageTimestamp)
        ]);
    },

    // Get by channel id
    getAllByChannelId: async function(channelId) {
        const ref = this.database.ref('threads');        
        const snapshot = await ref.orderByChild('channelId').equalTo(channelId).once('value');
        return snapshot.val();
    }
};