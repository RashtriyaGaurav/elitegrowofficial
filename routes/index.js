const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const multer = require('multer');
const User = require('../models/userModel'); // Assuming you have a user model defined
const jwt = require('jsonwebtoken');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Contact = require('../models/contactModel');
const { isValue } = require('../middlewares/isValue');
const { isLoggedin } = require('../middlewares/isLoggedin');



router.get('/', isValue, async function (req, res) {
  const items = await itemModel.find();

  res.render('index', { items, value: req.value });
});

router.get('/capcutapk/:id',isValue, async function (req, res) {
  const itemId = req.params.id;
  await itemModel.findOneAndUpdate(
    { _id: itemId },
    { $inc: { clicks: 1 } }
  );
  res.render('capcut',{value: req.value});
})

router.get('/item/:id', async function (req, res) {
  const itemId = req.params.id;

  try {
    // Increment clicks and get the item in one go
    const item = await itemModel.findOneAndUpdate(
      { _id: itemId },
      { $inc: { clicks: 1 } },
      { new: true } // Return the updated document
    );

    if (!item || !item.itemLink) {
      return res.status(404).send('Item not found or itemLink missing.');
    }

    // Redirect to the item's link
    res.redirect(item.itemLink);
  } catch (error) {
    console.error('Error redirecting to item link:', error);
    res.status(500).send('Internal server error');
  }
});



router.get('/upload', async function (req, res) {
  res.render('upload');
});

router.get('/profile', isLoggedin, isValue, async function (req, res) {
  // Format the creation date (e.g., "August 2024")
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long' };
    return new Date(date).toLocaleDateString('en-IN', options);
  }

  try {
    const uploadIDs = req.user.userUploads; // Array of ObjectIds
    const uploads = await itemModel.find({ _id: { $in: uploadIDs } });

    // Optional: calculate total clicks if you want it from DB
    const totalClicks = uploads.reduce((sum, item) => sum + (item.clicks || 0), 0);

    res.render('profile', {
      user: req.user,
      uploads,
      totalClicks,
      accountCreated: formatDate(req.user.createdAt),
      value: req.value
    });

  } catch (error) {
    console.error('Error fetching uploads for profile:', error);
    res.status(500).send('Something went wrong loading your profile.');
  }
});


router.get('/privacy', isValue, (req, res) => {
  res.render('privacy', { value: req.value }); // or whatever logic for logged-in user
});

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    console.log('New contact form submission:', name, email, message);
    res.redirect('/contact?message=Message sent successfully');
    const contact = new Contact({ name, email, message });
    await contact.save();

    res.render('contact', { submitted: true });
  } catch (err) {
    res.redirect('/contact?message=Something went wrong');
  }
});




router.get('/contact', isValue, async function (req, res) {
  res.render('contact', { value: req.value });
});



router.get('/about', isValue, async function (req, res) {


  res.render('about', { value: req.value });
})



module.exports = router;
