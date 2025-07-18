const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv').config();

const index = require('./routes/index')

app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/', index )

app.listen(85769, function (req, res) {
    console.log('Server is running on port 3000');
})