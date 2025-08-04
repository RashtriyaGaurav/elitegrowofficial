const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const User = require('../models/userModel');
const { isAdmin } = require('../middlewares/isAdmin');

router.get('/', isAdmin, async function (req, res) {
  const users = await User.find(); // your user model
  const totalUsers = users.length;
  const items = await itemModel.find();
  const totalClicks = items.reduce((sum, i) => sum + (i.clicks || 0), 0);

  res.render('analytics', { users, totalUsers, totalClicks });
});

module.exports = router;
