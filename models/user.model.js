
const mongoose  = require('mongoose');
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;
const {titles} =  require('./constants');   // for making admin



let userSchema = new schema({

    email_field : {
        type : String
    }, 

    password_field1 : {
        type : String
    },

 

    is_verified: {
        type: Boolean,
        default: false, 
    },

    verificationToken:{
        type: String, 
        default: '', 
    }, 

    resetPassToken: {
        type: String,
        default: '',
    },
    roleGiven: {
        type: String,
        default: 'default', // Default role for new users
    },

    lastLogin: {

        type: Date
    },
    googleID : {
    
        type : String
    }, 

    googleUsername : {

        type : String
    }, 
    orcidName : {
    
        type : String
    }, 

    orcidID : {

        type : String
    }, 

    orcidEmploymentDepartmentName : {

        type : String
    }, 
    orcidEmploymentRoleTitle : {

        type : String
    }, 

   
    orcidEducationRoleTitle : {

        type : String
    }
   

  
   
});
//*******************************************BCRYPT***********************************

userSchema.pre('save', async function (next){  //This code is a middleware function in a Mongoose schema using the pre hook, which means it runs before the specified event, in this case, before saving a new user document.
    try {
        if(this.isNew)   // if the user document is new  then only it will hash otherwise it will call next()
        {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password_field1, salt)
        this.password_field1 = hashedPassword
        if (this.email_field===process.env.ADMIN_EMAIL.toLowerCase()){   //admin 
         
            this.roleGiven = 'ADMIN'
        }
        }
        next();  //This is a callback function that tells Mongoose to move on to the next middleware in the sequence or proceed with the save operation.
    }  
    catch (error) {
        console.log('some error occurred', error)
    }
})

//*************************************************BCRYPT*****************************


module.exports = mongoose.model('utilisateurs', userSchema)




