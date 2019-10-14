const mongoose = require('mongoose');

require('../models/User');
const User = mongoose.model('users');

module.exports = ((decoded, res) => {
    User.findByIdAndUpdate(decoded._id, { lastActive: new Date().toISOString() }).exec().catch(() => {
        return res.status(404).json({
            message: 'Not found'
        });
    })
})
