const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String },
    dateOfBirth: { type: Date, required: true },
    knownAs: { type: String },
    createdDate: { type: Date, required: true },
    lastActive: { type: Date },
    introduction: { type: String, default: 'No description...' },
    lookingFor: { type: String, default: 'No description...' },
    interests: { type: String, default: 'No description...' },
    city: { type: String },
    country: { type: String },
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'photos' }]
});

mongoose.model('users', UserSchema);
