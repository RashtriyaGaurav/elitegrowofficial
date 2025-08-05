const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const multer = require('multer');
const User = require('../models/userModel'); // Assuming you have a user model defined
const { generateToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Contact = require('../models/contactModel');
const { isValue } = require('../middlewares/isValue');


router.get('/',isValue, async function (req, res) {
  const items = await itemModel.find();
  
  res.render('index', { items,  value: req.value });
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

router.get('/privacy',isValue, (req, res) => {
  res.render('privacy', {  value: req.value}); // or whatever logic for logged-in user
});

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    console.log('New contact form submission:', name, email, message);
    res.redirect('/contact?message=Message sent successfully');
    const contact = new Contact({ name, email, message });
    await contact.save();

    res.render('contact', { submitted: true  });
  } catch (err) {
    res.redirect('/contact?message=Something went wrong');
  }
});




router.get('/contact',isValue ,async function (req, res) {
  res.render('contact' , {  value: req.value });
});



router.get('/about',isValue,async function(req,res){
 
 
  res.render( 'about',{  value: req.value });
})



module.exports = router;
