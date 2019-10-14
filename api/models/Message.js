const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isRead: { type: Boolean, default: false },
    dateSent: { type: Date, required: true },
    dateRead: { type: Date },
    content: { type: String, required: true }
});

mongoose.model('messages', MessageSchema);
