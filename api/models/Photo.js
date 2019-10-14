const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    url: { type: String, required: true },
    description: { type: String },
    dateAdded: { type: Date, required: true },
    isMain: { type: Boolean, default: false },
    filePath: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

mongoose.model('photos', PhotoSchema);
