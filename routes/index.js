const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const multer = require('multer');
const User = require('../models/userModel'); // Assuming you have a user model defined
const { generateToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const ActiveUser = require('../models/activeUserModel');
const Contact = require('../models/contactModel');


router.get('/', async function (req, res) {
  const items = await itemModel.find();
  let value = 0;
  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
      const user = await User.findOne({ email: decoded.email });
      if (user) {
        value = 1; // User is logged in
        if (user.isAdmin) {
          value=7;
        }
      } else {
        res.cookie('token', '');
        return res.redirect('/?message=User%20not%20found');
      }
    } catch (error) {
      res.cookie('token', '');
      return res.redirect('/?message=We%20are%20sending%20error%20to%20Elite%20team%20to%20fix%20it.');
    }
  } else {
    value = 0; // User is not logged in
  }
  res.render('index', { items, value });
});

router.get('/capcutapk/:id', async function (req, res) {
  const itemId = req.params.id;
  await itemModel.findOneAndUpdate(
    { _id: itemId },
    { $inc: { clicks: 1 } }
  );
  res.render('capcut');
})



router.get('/upload', async function (req, res) {
  res.render('upload');
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { value: 0 }); // or whatever logic for logged-in user
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




router.get('/contact', async function (req, res) {
  res.render('contact');
});



router.get('/about',async function(req,res){
  let value = 0;
  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
      const user = await User.findOne({ email: decoded.email });
      if (user) {
        value = 1; // User is logged in
        if (user.isAdmin) {
          value=7;
        }
      } else {
        res.cookie('token', '');
        return res.redirect('/?message=User%20not%20found');
      }
    } catch (error) {
      res.cookie('token', '');
      return res.redirect('/?message=We%20are%20sending%20error%20to%20Elite%20team%20to%20fix%20it.');
    }
  } else {
    value = 0; // User is not logged in
  }
 
  res.render( 'about',{  value });
})

router.get('/analytics/traffic-data', async (req, res) => {
  try {
    const data = await ActiveUser.find().sort({ timestamp: 1 }).limit(100); // limit to recent 100 for speed
    const formatted = data.map(record => ({
      timestamp: record.timestamp,
      count: record.count,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch traffic data' });
  }
});



module.exports = router;
