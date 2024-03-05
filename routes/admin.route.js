
const router = require('express').Router()
const User = require('../models/user.model')
const LastLogin = require('../models/lastLogin')
const mongoose = require('mongoose')
const { titles } = require('../models/constants')


const isAdmin = (req, res, next)=>{
    if (req.session.isAuthWithAdmin){
      next()
    }
    else {
      req.flash('error', 'Not Authorized');
      res.redirect('/');
      
    }
}



router.get('/AllUsers',isAdmin,  async(req, res, next)=>{

 
    try {

        const Allusers = await User.find()
        

        res.render('manageUsers', {Allusers})
      
        
    } catch (error) {
        console.log(" users not found ")
        next()
    }
  });



// this route  is for when user click ' view profile' 
  router.get('/AllUsers/:id',isAdmin,  async(req, res, next)=>{

    try {

        const {id} = req.params
        if(!mongoose.Types.ObjectId.isValid(id)) {
          req.flash('error', 'Not a valid id');
          res.redirect('/admin/Allusers')
          return
        }

        const Person = await User.findById(id)
        res.render('userProfByAdmin', {Person})

    } catch (error) {
        console.log(" error occ ")
        next()
    }
  
  });




// this route  is for when user click ' add role'
  router.get('/AddRole',isAdmin,  async(req, res, next)=>{

 
    try {
      const Allusers = await User.find()
      res.render('AddRoleByAdmin', {Allusers})
      } 
      catch (error) {
        console.log(" page not found  ")
        next()
      }
  
  });





  router.post('/updateRole', isAdmin, async (req, res, next) => {
    try {
      const { userId, roleUpdate } = req.body;
      console.log('User ID:', userId);
      console.log('Role Update:', roleUpdate);

  
      // Validate user ID 
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        req.flash('error', 'Not a valid user ID');
        res.redirect('/admin/AllUsers');
        return;
      }

      // Check if the user's role is 'ADMIN'
      const user = await User.findById(userId);
        if (user.roleGiven === 'ADMIN') {
            req.flash('error', 'You cannot change the role of an admin user');
            res.redirect('/admin/AllUsers');
            return;
        }
  
      // Update the user's role
      await User.findByIdAndUpdate(userId, { roleGiven: roleUpdate });
  
      req.flash('success', 'Role updated successfully');
      res.redirect('/admin/AllUsers');
    } catch (error) {
      console.error('Error updating role:', error);
      req.flash('error', 'Error updating role');
      res.redirect('/admin/AllUsers');
    }
  });




  router.post('/UpadateDBafterDeletion', async (req, res) => {
    const { deletedRoleTitle } = req.body;

    try {

        

        // Update user roles in the database using async/await

        const result = await User.updateMany(
            { roleGiven: deletedRoleTitle },
            { $set: { roleGiven: 'default' } }
        );

        console.log('User roles updated successfully:', result);
        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



  module.exports = router;



