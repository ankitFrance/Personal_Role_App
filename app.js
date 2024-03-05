const express = require('express')
const createHttpError = require('http-errors')
const morgan  = require('morgan')
const mongoose  = require('mongoose')
require ('dotenv').config()
const bodyParser = require('body-parser')
const sessionMiddleware = require('./models/server.model');
const flash = require('connect-flash');
const passportSetup = require('./models/passportSetup');
const orcidSetup = require('./models/orcidSetup');
const cookieSession = require('cookie-session')
const keys = require('./models/keys')
const passport = require ('passport')




//******************Initialization*************************
const app = express()
//******For storing cookies for Goggle Auth********/
/*
app.use(cookieSession({                  
  maxAge: 24*60*60*1000,
    keys:[keys.session.cookieKey]
}))
*/
//*********For storing cookies for Goggle Auth*****/
//********Fixing of error because of regenerate****//

/*
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
      request.session.regenerate = (cb) => {
        cb()
      }
    }
    if (request.session && !request.session.save) {
      request.session.save = (cb) => {
        cb()
      }
    }
    next()
  })
*/
//****END Fixing of error because of regenerate*****/
//********************Body parser*************************
app.use(bodyParser.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded

app.use(bodyParser.json())  // parse application/json
//*********************************************************
app.use(morgan('dev')); // to show us the logs 
app.use(express.static('public')); //to load the public folder
app.use(sessionMiddleware);
app.use(flash());
app.set('view engine', 'ejs');  // for view folder

//***********For google authentication*********
app.use(passport.initialize())                                  //google 
app.use(passport.session())                                     //google 
//*******END For google authentication*********


//******************END Initialization*************************

//*********************FOR FLASH MESSAGES************************************
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});
//***************************END FOR FLASH MESSAGES *************************


 // TO SHOW / HIDE NAVBAR LINKS
 app.use(function(req, res, next){
  res.locals.isLoggedIn = req.session.FetchEmailForLogin 
  next();
});


app.use(function(req, res, next){
 res.locals.isAuthWithAdminstrator = req.session.isAuthWithAdmin
 next();
});


app.use(function(req, res, next){
  res.locals.GoogleUser = req.session.ISGOOGLEUSER
  next();
  });

  app.use(function(req, res, next){
    res.locals.orcidUser = req.session.ISORCIDUSER
    next();
    });


  

 // TO SHOW / HIDE NAVBAR LINKS END




  
 

//************************Routing**************************
app.use('/', require('./routes/index.route'))
app.use('/auth', require('./routes/auth.route'))
app.use('/user', require('./routes/user.route'))
app.use('/admin',  require('./routes/admin.route'))
//*********************************************************

// Handling errors 
app.use((req, res, next)=>{
    next(createHttpError.NotFound())
});

app.use((error, req, res, next)=>{
    error.status = error.status || 500
    res.status(error.status);  // sending 404
   // res.render('error404')   //file can be included
    res.send(error)
})
// Handling errors end

const port = process.env.PORT || 3080;

//************************************Database connection********************************
mongoose.connect("mongodb://127.0.0.1:27017/GestDeUtil", {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', ()=>{
    console.log('something went wrong')
})

db.once( 'open', ()=>{
    console.log('connected sucessfully')
});
//************************************Database connection end********************************

app.listen(port , () => {
    console.log('app is running on ${port}')
});


//---------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------


/*

.on for 'error' event: Errors might occur at any time during the application's lifecycle, and you want to be informed whenever an error occurs. So, you use .on to continuously listen for 'error' events.

.once for 'open' event: The 'open' event is usually emitted once when the database connection is successfully established. After the connection is open, you don't need to listen for this event again. Using .once ensures that the success message is logged only once, avoiding unnecessary duplication

The .on and .once methods are commonly used with event emitters in Node.js. They are part of the EventEmitter class in Node.js

*/

