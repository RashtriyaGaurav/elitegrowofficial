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

router.get('/createItem', async function (req, res) {
  res.render('createItem');
})

router.get('/capcutapk/:id', async function (req, res) {
  const itemId = req.params.id;
  await itemModel.findOneAndUpdate(
    { _id: itemId },
    { $inc: { clicks: 1 } }
  );
  res.render('capcut');
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

router.get('/login', async function (req, res) {
  res.render('login');
});

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


router.get('/register', async function (req, res) {
  res.render('register');
});

router.get('/contact', async function (req, res) {
  res.render('contact');
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

  const items = await itemModel.find();

  res.render('analytics', { items });
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

router.get('/logout', function(req,res){
   res.cookie('token', '');
    res.redirect('/?message=Logout successful')
})

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
