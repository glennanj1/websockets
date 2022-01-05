require('dotenv').config()
const express = require('express');
const cors = require('cors')
const passport = require('passport');
const session = require('express-session');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
//import socket fn
const messageToServer = require('./socket.js')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

if (process.env.NODE_ENV !== "production") {
  // Load environment variables from .env file in non prod environments
  require("dotenv").config()
}
//server
const app = express();
//Parses the request body from the requests like POST request.
app.use(bodyParser.json())
//To create and read refreshToken cookie.
app.use(cookieParser(process.env.COOKIE_SECRET))

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : []
//cors options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
//use cors
app.use(cors(corsOptions))
// constant port
const port = 8081;
// Required to get data from user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Initiate Strategy
passport.use(new SteamStrategy({
  returnURL: 'http://localhost:' + port + '/api/auth/steam/return',
  realm: 'http://localhost:' + port + '/',
  apiKey: process.env.STEAM_API_KEY
}, function (identifier, profile, done) {
  process.nextTick(function () {
    profile.identifier = identifier;
    return done(null, profile);
  });
}
));

//session cookie 
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 3600000
  }
}))
app.use(passport.initialize());
app.use(passport.session());

// Routes

//index
app.get('/', (req, res) => {
  res.send(req.user);
});

//sign in / redirect
app.get('/api/auth/steam', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
  res.redirect('/')
});

//when authed logic
app.get('/api/auth/steam/return', passport.authenticate('steam', {failureRedirect: '/'}), function (req, res) {
  res.redirect('http://localhost:3000/')
  //probably store the user data then redirect to home 
  //react could then fetch the authed users info and 
  //present logout button
});


//log user out
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('http://localhost:3000/');
});

//call websocket still debugging this
app.get('/serverinfo', function(req, res){
  messageToServer('status', 1)
  res.json('sent command incoming return')
  console.log(res);
});

// Spin up the server
const server = app.listen(process.env.PORT || 8081, function () {
  const port = server.address().port
  console.log("App started at port:", port)
})