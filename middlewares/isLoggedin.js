// const jwt = require('jsonwebtoken');
// const userModel = require('../models/userModel');

// module.exports.isLoggedin = async function (req, res, next) {
//     try {
//         const token = req.cookies?.token;
//         if (!token) {
//             return res.redirect('/login?message=Please%20login%20to%20continue');
//         }
//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.JWT_KEY);
//         } catch (error) {
//             return res.redirect('/login?message=Invalid%20token%20please%20login%20again');
//         }
//         let user = await userModel.findOne({ email: decoded.email }).select('-password');
//         if (!user) {
//             return res.redirect('/login?message=User%20not%20found');
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         return res.redirect('login?message=An%20error%20occurred%20while%20checking%20login%20status');
//     }
// };
