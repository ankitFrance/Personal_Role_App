// A SESSION IS CREATED IN THIS FILE 

const storeSession = require('./sessionTOdatabase.model'); //coming from different file   // to store session details to the mongoose database 
const session = require('express-session');

// Configure session middleware
const sessionMiddleware = session({
  secret: 'iamkey',
  resave: false,
  saveUninitialized: true,
  name: 'my session',
  store: storeSession ,  // coming from sessionTOdatabase.model
  
});

module.exports = sessionMiddleware;
