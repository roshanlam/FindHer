const jwt = require('jsonwebtoken');
const actionFilter = require('../middleware/action-filter')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.loggedInUserData = decoded;
        next(
            actionFilter(decoded, res)
        );
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};
