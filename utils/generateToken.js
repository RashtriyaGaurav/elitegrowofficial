const jwt = require('jsonwebtoken');

const generateToken = function(user){
    return jwt.sign(
        { email: user.email, id: user._id },
        process.env.JWT_KEY,
        { expiresIn: '365d' }
    );
}

module.exports.generateToken = generateToken;