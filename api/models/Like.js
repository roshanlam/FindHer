const mongoose = require('mongoose');
const LikeSchema = new mongoose.Schema({
    likerId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    likeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});
mongoose.model('likes', LikeSchema);
