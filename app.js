const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv').config();

const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// DB
const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB_URI}/EliteGrow`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Model
const ActiveUser = require('./models/activeUserModel');

// Routes
const index = require('./routes/index');
const analytics = require('./routes/analytics');
const auth = require('./routes/auth');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use('/', index);
app.use('/analytics', analytics);
app.use('/auth', auth);

// --- Active User Tracking ---
let activeUsers = 0;

io.on('connection', (socket) => {
  activeUsers++;
  io.emit('updateActiveUsers', activeUsers);
  logActiveUsersToDB(activeUsers);

  socket.on('disconnect', () => {
    activeUsers = Math.max(0, activeUsers - 1);
    io.emit('updateActiveUsers', activeUsers);
    logActiveUsersToDB(activeUsers);
  });
});

// --- Save active user count to DB ---
function logActiveUsersToDB(count) {
  const record = new ActiveUser({ count });
  record.save().catch(err => console.error('Error saving active user count:', err));
}

// --- Server Start ---
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
