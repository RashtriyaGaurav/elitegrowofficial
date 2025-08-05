const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports.isAdmin = async function (req, res, next) {
    try {
        // fetch token 
        const token = req.cookies?.token;
        if (!token) {
            return res.redirect('/login?message=Please login to continue');
        }
        // decoded the token 
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return res.redirect('/login?message=Invalid token please login again');
        }
        let user = await User.findOne({ email: decoded.email }).select('-password');
        if (!user) {
            return res.redirect('/login?message=Please login to continue');
        }
        // Check if user is an admin
        if (!user.isAdmin) {
            return res.redirect('/?message=You can access this by Collaborating'); // Redirect non-admin users to home
        }
        req.user = user;
        next();
    } catch (error) {
        return res.redirect('login?message=An error has occurred please login again');
    }
};
