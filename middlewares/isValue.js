const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports.isValue = async function (req, res, next) {
  let value = 0;

  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
      const user = await User.findOne({ email: decoded.email });

      if (user) {
        value = user.isAdmin ? 7 : 1;
        req.value = value; // attach to req object
      } else {
        res.cookie('token', '');
        return res.redirect('/?message=User%20not%20found');
      }
    } catch (error) {
      res.cookie('token', '');
      return res.redirect('/?message=We%20are%20sending%20error%20to%20Elite%20team%20to%20fix%20it.');
    }
  } else {
    req.value = 0;
  }

  next();
};
