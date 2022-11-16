// Auth Middleware - Used to verify the token and get the userid & pass it along to the job routes
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');
// const User = require('../models/User');

const auth = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError('Authentication Failed');
    }

    // Fetching the token from client
    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user to the Job Routes
        req.user = { userId: payload.userId, name: payload.name };
        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication failed during payload');
    }
}

module.exports = auth;