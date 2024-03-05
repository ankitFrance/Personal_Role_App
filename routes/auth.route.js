const router = require('express').Router();
const session = require('express-session');
const LastLogin = require('../models/lastLogin')
const User = require('../models/user.model')
const bcrypt = require('bcrypt');
const {titles} =  require('../models/constants'); 
const passport = require ('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendVerificationEmail } = require('../models/emailsender');
const { sendResetPasswordLink } = require('../models/emailsender');


router.get('/orcid', passport.authenticate('orcid',{

  //scope: ['openid', 'profile']
  scope: ['read-public']
 
}
))

router.get('/orcid/redirect', passport.authenticate('orcid'), (req, res, next)=>{

  req.session.ISORCIDUSER = true; // Seting session variable for Orcid
  console.log("Orcid Authentication Callback");
  console.log(req.session);
  res.redirect('/user/Profile');
  
 
});



router.get('/google', passport.authenticate('google',{
    scope: ['profile']
}))

router.get('/Login', (req, res, next)=>{
    res.render('login')   
});

router.get('/google/redirect',passport.authenticate('google'), (req, res, next)=>{
  req.session.ISGOOGLEUSER = true; // Set session variable for Google
  res.redirect('/user/Profile');
 
});


router.get('/Register', (req, res, next)=>{
   res.render('register'); 
});


router.post('/Login', (req, res, next)=>{
    
   
   const email_field = req.body.email_field   
   const password_field1 = req.body.password_field1  

   async function LoginData(){
    const FetchEmailForLogin = await User.findOne({email_field});
    //console.log(FetchEmailForLogin)
    
    try {
      
           if (FetchEmailForLogin) {

               const passwordMatch = await bcrypt.compare(password_field1, FetchEmailForLogin.password_field1);


              if (passwordMatch){

               
               if (!FetchEmailForLogin.is_verified) {
                console.log('please verify your email first');
                req.flash('error', 'Please verify your email first');
                return res.redirect('/auth/Login');
               }
            
                
              //---------------------TO SAVE LAST LOGIN FROM SESSION TO NEW DATABASE LOGININFO--------------------------------------//
             
                const existingLastLogin = await User.findOne({ email_field: FetchEmailForLogin.email_field });

                if (existingLastLogin) {
                  // Update the existing record instead of creating a new one
                  existingLastLogin.lastLogin = new Date();
                  await existingLastLogin.save();

                } else {
                  // Create a new record only if it doesn't already exist
                  FetchEmailForLogin.lastLogin = new Date();
                  const lastlogin = new User({
                   
                    lastLogin: FetchEmailForLogin.lastLogin,
                    
                  });

                  await lastlogin.save();

                }

                //---------------------END OF TO SAVE LAST LOGIN FROM SESSION TO NEW DATABASE LOGININFO--------------------------------------//

                req.session.isAuth = true;
                
                req.session.FetchEmailForLogin = {     //req.session is an object used to store session info part of express-session middleware
                  _id: FetchEmailForLogin._id,
                  email: FetchEmailForLogin.email_field,
                  lastLogin: FetchEmailForLogin.lastLogin,
                  roleGiven: FetchEmailForLogin.roleGiven
                  
                };
                //******************************************************************* */
                
                if(FetchEmailForLogin.roleGiven === 'ADMIN'){
                  req.session.isAuthWithAdmin = true;
                }


                //******************************************************************* */
                return res.redirect('/user/Profile');
                
               }

               else {
               console.log('incorrect password ')
               req.flash('error', 'incorrect password');
               res.redirect('/auth/Login');
               }
           }

           else{
           console.log('email not found ')
           req.flash('error', 'Email not found');
           res.redirect('/auth/Login');
           }
        } 

        catch (error) 
         {
           console.error('Error :', error);
         }
    
   }
   LoginData()
   
});




router.post('/Register', (req, res, next)=>{
   
    //*******************************INSERTION OF FIELD VALUES OF REGISTER FORM TO DATABASE********************************* */

    const email_field = req.body.email_field          // these are names in register.ejs
    const password_field1 = req.body.password_field1  // these are names in register.ejs
    const password_field2 = req.body.password_field2  // these are names in register.ejs


    async function saveData() {
        try {

                if (!email_field) {
                req.flash('error', 'Email cannot be blank');
                return res.redirect('/auth/Register');
                }
               //***********************CHECK IF EMAIL ALREADY EXIST/*************************************** */

               const doesExist = await User.findOne({email_field});
               if(doesExist){
                
                req.flash('error', 'Email already exists');
                 res.redirect('/auth/Register');
                 console.log('email already exist')
                
                 return
               }
               //***********************END OF CHECK IF EMAIL ALREADY EXIST/******************************** */

               //********************SEE IF PASSWORD MATCHES OR NOT ******************************************/
              
               else if (password_field1 !== password_field2) {
                 
                 req.flash('error', 'Password and confirm password do not match');
                 res.redirect('/auth/Register');
                 console.log('password and confirm passwords do not match') 
                 return
               } 

               else if (!password_field1 || !password_field2) {
                req.flash('error', 'Password cannot be blank');
                return res.redirect('/auth/Register');
               }

               else if (password_field1.length < 8) {
                req.flash('error', 'Password must be at least 8 characters long');
                return res.redirect('/auth/Register');
                }

               else {
                 console.log('Password and Confirm Password matches.');

                 //*********************************************************************************** */
                 const verificationToken = crypto.randomBytes(20).toString('hex');

                 //********************************************************* ***************************/
               // SO allowing user to register his credentials in database
               // Create an instance 'user' of the model 'User' that we imported in this file with the form data
               const user = new User({

                email_field,        // this is coming from user.model.js 
                password_field1,    // this is coming from user.model.js 
                verificationToken

               });
 
               // Save the instance to the database
                const savedData = await user.save();
                //***********************************REGISTER EMAIL GMAIL VERIFICATION **************************************************** */
              
                 await sendVerificationEmail(email_field, verificationToken);  //emailsender.js

                 //***********************************END REGISTER EMAIL GMAIL VERIFICATION******************************************************* */
                req.flash('success', 'You have been registered');
                
                console.log('Data saved successfully:', savedData);
                
                res.redirect('/auth/Register');
         
                
               }
            }


        catch (error) 
           {
               console.error('Error saving data:', error);
           } 
      }
      // Calling
      saveData();
      //**************************** END OF INSERTION OF FIELD VALUES OF REGISTER FORM TO DATABASE******************************* */
});


router.get('/Logout', async(req, res, next)=>{

  req.logout((err) => {
    if (err) {
        return next(err);
    }
    // Perform any additional actions before redirecting or responding to the client
    res.redirect('/');
});
  
  /* 
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
  */  
});




router.get('/verify', async (req, res) => {

  const token = req.query.token;

  try {
      const userForVerify = await User.findOne({ verificationToken: token });

      if (!userForVerify) {
          req.flash('error', 'Invalid verification token');
          return res.redirect('/auth/Register');
      }

      userForVerify.is_verified = true;
      userForVerify.verificationToken = null;
      await userForVerify.save();

      req.flash('success', 'Email verified successfully');
      res.redirect('/auth/Login'); 

  } catch (error) {

      console.error('Error verifying email:', error);
      req.flash('error', 'Error verifying email');
      res.redirect('/auth/Register');
  }
});



router.get('/Forgot', async (req, res) => {
  try {
      res.render("forgotPass")
  } catch (error) {
     console.log(error)
  }
});


router.post('/Forgot', async (req, res) => {
 
  const email_forgot_field = req.body.email_forgot_field;

  try {
    const userForgotexist = await User.findOne({ email_field: email_forgot_field });

    if (userForgotexist) {
      console.log(' your user exist')
      const verificationTokenForResetPass = crypto.randomBytes(20).toString('hex');
      await sendResetPasswordLink(email_forgot_field, verificationTokenForResetPass); 

       // Update the user's resetPassToken field in the database
       userForgotexist.resetPassToken = verificationTokenForResetPass;
       await userForgotexist.save();

      req.flash('success', 'Link has been sent ');
      res.redirect('/auth/Forgot');
    } else {
      // User not found
      res.send('userNotFound');
    }
  } catch (error) {
    console.log(error);
    
  }
  
});



router.get('/reset', async (req, res) => {
  const token = req.query.token;
  const email = req.query.email;
  
  

  try {
      const userForReset = await User.findOne({ resetPassToken: token });

      if (!userForReset) {
          req.flash('error', 'Invalid reset token');
          return res.redirect('/auth/Register');
      }

     // req.flash('success', 'now you can reset your password');
      res.render('reset', { token , email}); 
  } catch (error) {
      console.error('Error :', error);
      req.flash('error', 'Error in findinguser');
      res.redirect('/auth/Register');
  }
});


router.post('/reset', async (req, res) => {
  const token = req.body.token; // Change here
  const email = req.body.email;
  console.log('Received token:', token); 
  const newPassword = req.body.password_reset;
  const confirmPassword = req.body.password_reset2; 

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/auth/Register');
  }

  

  try {
    const user = await User.findOne({ resetPassToken: token,  email_field: email });

    if (!user) {
      req.flash('error', 'Invalid reset token or email');
      return res.redirect('/auth/Register');
    }

    // Update the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password_field1 = hashedPassword;

    // Clear the reset token
    user.resetPassToken = '';

    // Save the updated user
    await user.save();

    req.flash('success', 'Password reset successful');
    return res.redirect('/auth/Login');
  } catch (error) {
    console.error('Error:', error);
    req.flash('error', 'Error resetting password');
    res.redirect('/auth/Register');
  }
});



module.exports = router;




// ********************************************************************
/*
The await keyword is used to wait for the asynchronous operation to complete. In this case, user.save() is likely a database operation that returns a promise. The await ensures that the function pauses and waits for this promise to resolve before proceeding.
Once the user.save() operation is complete, and the result is stored in savedData, it sends the saved data as a response. 
*/