const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  // Extract the token from the 'Authorization' header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization denied: No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user data (excluding password) to the request object
    req.user = await User.findById(decoded.userId).select('-password');

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again', logout: true });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token, authorization denied', logout: true });
    } else {
      console.error('Token verification error:', err);
      return res.status(500).json({ message: 'Internal server error during token verification' });
    }
  }
};

module.exports = authMiddleware;
