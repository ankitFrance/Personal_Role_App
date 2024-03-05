const router = require('express').Router();




const renderGoogleProfile = (req, res, next, user) => {
  
  const GoogleUser = req.user;
  res.render('profile', { GoogleUser });
  //next(); // Call next to pass control to the next middleware
 
};


const renderOrcidProfile = (req, res, next, user) => {
 // console.log(req.user);
  const orcidUser = req.user;
  
  res.render('profile', { orcidUser });
  //next(); // Call next to pass control to the next middleware
 
};


const renderNormalprofile = (req, res, next) => {
  const userData = req.session.FetchEmailForLogin;
  console.log(req.sessionID);
  res.render('profile', { userData });
  
};



const isAuthGoogleOrcid = (req, res, next) => {
  if (req.session.ISGOOGLEUSER) {
    // Google authentication successful
    renderGoogleProfile(req, res, next, req.user);
  } else if (req.session.ISORCIDUSER) {
    // Orcid authentication successful
    renderOrcidProfile(req, res, next, req.user);
  } else {
    req.session.ISGOOGLEUSER = false;
    req.session.ISORCIDUSER = false;
    next();
  }
};




const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    if (req.session.isAuthWithAdmin) {
      res.redirect('/admin/AllUsers');
    } else {
      renderNormalprofile(req, res, next);
    }
  } else {
    res.redirect('/auth/Login');
  }
};


/*
const isClient = (req, res, next)=>{
  if (req.session.isAuthWithClient  ){
    next()
  }
  else {
    req.flash('error', 'Not Authorizedrr');
    res.redirect('/auth/Login');
    
  }
}*/

router.get('/Profile',  isAuthGoogleOrcid, isAuth );




/*********************************************************************** */


module.exports = router;