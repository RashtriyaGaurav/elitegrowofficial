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

router.get('/login', async function (req, res) {
  res.render('login');
});

router.get('/register', async function (req, res) {
  res.render('register');
});

router.post('/form/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Email not registered");
    if (user.password !== password) return res.status(401).send("Invalid password");
    let token = generateToken(user);
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: "Lax",
      secure: true // IMPORTANT: true because Render uses HTTPS by default
    });

    res.redirect('/?message=Login%20successful');
  } catch (err) {
    res.redirect('/login?message=Something%20went%20wrong');
  }
});

router.post('/form/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) return res.redirect('/register?message=Email%20already%20exists');

    let useR = await User.create({ name, email, password });
    let token = generateToken(useR);
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
      httpOnly: true,
      sameSite: "Lax",
      secure: true // IMPORTANT: true because Render uses HTTPS by default
    });

    res.redirect('/?message=Registered%20successfully');
  } catch (err) {
    res.redirect('/register?message=Something%20went%20wrong');
  }
});

router.get('/logout', function(req,res){
   res.cookie('token', '');
    res.redirect('/?message=Logout successful')
})

module.exports = router;
