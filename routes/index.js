const express = require('express');
const router = express.Router();
const itemModel = require('../models/itemModel');
const multer = require('multer');
const User = require('../models/userModel'); // Assuming you have a user model defined
const views = require('../models/viewsModel'); // Assuming you have a user model defined
const { generateToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/', async function (req, res) {
  const items = await itemModel.find();
  let value = 0;

  //  fetch("https://ipapi.co/json/")
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log("Country:", data.country_name);
  //     console.log("City:", data.city);
  //     console.log("IP Address:", data.ip);

  //   });
 if (req.cookies?.view) {
      const view = await views.findById(req.cookies.view);
      if (view) {
        view.visited++;
        await view.save();
      } else {
        // cookie is invalid, remove it and start fresh
        const newView = await views.create({
          email: req.cookies?.token ? jwt.verify(req.cookies.token, process.env.JWT_KEY).email : 'Not Logged in',
          visited: 1,
          date: new Date().toISOString().split('T')[0],
        });
        res.cookie('view', newView._id);
      }
    } else {
      const newView = await views.create({
        email: req.cookies?.token ? jwt.verify(req.cookies.token, process.env.JWT_KEY).email : 'Not Logged in',
        visited: 1,
        date: new Date().toISOString().split('T')[0],
      });
      res.cookie('view', newView._id);
    }

  if (req.cookies?.token) {
    try {
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
      const user = await User.findOne({ email: decoded.email });
      if (user) {
        value = 1; // User is logged in
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

router.get('/createItem', async function (req, res) {
  res.render('createItem');
})

router.post('/createItem', upload.single('itemImage'), async function (req, res) {
  const { itemImage, itemName, itemLink } = req.body;
  const item = await itemModel.create({
    itemImage: req.file ? req.file.buffer : null,
    itemLink,
    itemName

  });
  res.redirect('/createItem');
});

router.get('/login', async function (req, res) {
  res.render('login');
});

router.get('/register', async function (req, res) {
  res.render('register');
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Email not registered");
    if (user.password !== password) return res.status(401).send("Invalid password");
    let token = generateToken(user);
    res.cookie("token", token);
    res.redirect('/?message=Login%20successful');
  } catch (err) {
    res.redirect('/login?message=Something%20went%20wrong');
  }
});

router.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) return res.redirect('/register?message=Email%20already%20exists');

    let useR = await User.create({ email, password });
    let token = generateToken(useR);
    res.cookie("token", token);
    res.redirect('/?message=Registered%20successfully');
  } catch (err) {
    res.redirect('/register?message=Something%20went%20wrong');
  }
});

module.exports = router;
