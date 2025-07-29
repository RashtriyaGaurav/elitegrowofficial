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
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cpuClass: navigator.cpuClass || 'Unknown',
        deviceMemory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
      };
      // cookie is invalid, remove it and start fresh
      const newView = await views.create({
        visited: 1,
        date: new Date().toISOString().split('T')[0],
        deviceInfo: deviceInfo
      });
      res.cookie('view', newView._id);
    }
  } else {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cpuClass: navigator.cpuClass || 'Unknown',
      deviceMemory: navigator.deviceMemory || 'Unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown'
    };
    const newView = await views.create({
      visited: 1,
      date: new Date().toISOString().split('T')[0],
      deviceInfo: deviceInfo
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

router.get('/capcutapk', async function (req, res) {
  res.render('capcut');
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

  const { itemName, itemLink ,itemPath } = req.body;
  await itemModel.create({
    itemImage: req.file ? req.file.buffer : null,
    itemLink,
    itemName,
    itemPath

  });
  res.redirect('/createItem');
});

router.get('/login', async function (req, res) {
  res.render('login');
});

router.get('/helpchat', async function (req, res) {
  res.render('helpchat');
});

router.get('/register', async function (req, res) {
  res.render('register');
});

router.get('/analytics', async function (req, res) {
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

  const today = new Date().toISOString().split('T')[0];
  const data = await views.find({ date: today });
  const count = data.length; // or await views.countDocuments({ date: today })

  res.render('analytics', {
    views: data,
    totalEntries: count
  });
});

router.post('/auth/login', async (req, res) => {
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

router.post('/auth/register', async (req, res) => {
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



module.exports = router;
