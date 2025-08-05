const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const multer = require('multer');
const User = require('../models/userModel');
// const { generateToken } = require('../utils/generateToken');
const { isValue } = require('../middlewares/isValue');
const jwt = require('jsonwebtoken');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const ActiveUser = require('../models/activeUserModel');
// const Contact = require('../models/contactModel');


router.get('/createItem',isValue , async function (req, res) {
  res.render('createItem');
})

router.get('/item/:id', async function (req, res) {
  const itemId = req.params.id;
  let item = await itemModel.findOne({ _id: itemId });
  await itemModel.findOneAndUpdate(
    { _id: itemId },
    { $inc: { clicks: 1 } }
  );

  res.redirect(item.itemLink);
})

router.post('/createItem', upload.single('itemImage'), async function (req, res) {
  try {
    const token = req.cookies.token; // Get JWT from cookies

    if (!token) {
      return res.redirect('/login'); // Redirect if no token found
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Find user in database
    const user = await User.findOne({ email: decoded.email }).select('-password');

    if (!user) {
      return res.redirect('/login?message=Please#20login%20first'); // Redirect if user is not found
    }

    // Check if user is an admin
    if (!user.isAdmin) {
      return res.redirect('/?message=Please%20do%20not%20try%20otherwise...'); // Redirect non-admin users to home
    }
  } catch (error) {
    return res.redirect('/login?message=Invalid%20token%20or%20session%20expired'); // Redirect if token verification fails
  }

  const { itemName, itemLink, itemPath } = req.body;
  await itemModel.create({
    itemImage: req.file ? req.file.buffer : null,
    itemLink,
    itemName,
    itemPath

  });
  res.redirect('/createItem');
});

module.exports = router;
