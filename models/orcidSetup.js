const passport = require('passport');
const OrcidStrategy = require('passport-orcid').Strategy;
const keys = require('./keys');
const User = require('./user.model');
const https = require('https');
const parseString = require('xml2js').parseString;

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  User.findById(_id).then((user) => {
    done(null, user._id);
  });
});

passport.use(new OrcidStrategy({
  sandbox: process.env.NODE_ENV !== 'production',
  clientID: keys.orcid.clientID,
  clientSecret: keys.orcid.clientSecret,
  callbackURL: "https://feb5-2a01-e0a-3cc-2cd0-9900-6a9e-5cc9-f5dd.ngrok-free.app/auth/orcid/redirect",
},
(accessToken, refreshToken, params, profile, done) => {
  const options = {
    hostname: 'pub.sandbox.orcid.org',
    path: `/v3.0/${params.orcid}/record`,
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.orcid+xml',
      'Authorization': `Bearer ${accessToken}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });
    console.log(params)
    res.on('end', () => {
      try {
        const contentType = res.headers['content-type'];

        if (contentType && contentType.includes('application/vnd.orcid+xml')) {
          // Parse XML to JavaScript object
          parseString(data, { explicitArray: false }, (err, result) => {
            if (err) {
              console.error('Error parsing XML:', err);
              done(err, null);
            } else {
              //console.log(result);

              const educations = result['record:record']['activities:activities-summary']['activities:educations'];
              const employments = result['record:record']['activities:activities-summary']['activities:employments'];
              const qualifications = result['record:record']['activities:activities-summary']['activities:qualifications'];

                //console.log("Educations:", educations);
                //console.log("Employments:", employments);
                //console.log("Qualifications:", qualifications);

              const educationRoleTitle = educations['activities:affiliation-group']['education:education-summary']['common:role-title'];
              console.log("Education Role Title:", educationRoleTitle);

              const employmentRoleTitle = employments['activities:affiliation-group']['employment:employment-summary']['common:role-title'];
              const employmentDepartmentName = employments['activities:affiliation-group']['employment:employment-summary']['common:department-name'];
              console.log(employmentRoleTitle)
              console.log(employmentDepartmentName)

              
            


    
             

              User.findOne({ orcidID: params.orcid }).then((currentUser) => {
                if (currentUser) {
                  console.log('user already exists');
                  currentUser.lastLogin = Date.now();
                  currentUser.save().then(updatedUser => {
                    console.log('User lastLogin updated:', updatedUser.lastLogin);
                    done(null, updatedUser);
                  });
                } else {
                  console.log('passport callback function fired');
                  console.log(params);
                  new User({
                    orcidID: params.orcid,
                    orcidName: params.name,
                    lastLogin: Date.now(),
                    orcidEmploymentDepartmentName: employmentDepartmentName,
                    orcidEmploymentRoleTitle:employmentRoleTitle,
                    orcidEducationRoleTitle:educationRoleTitle
                  }).save().then((newUser) => {
                    console.log('new user created', newUser);
                    done(null, newUser);
                  });
                }
              });
            }
          });
        } else {
          console.error('Unexpected content type:', contentType);
          done(new Error('Unexpected content type'), null);
        }
      } catch (error) {
        console.error('Error handling ORCID record:', error);
        done(error, null);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error retrieving ORCID record:', error);
    done(error, null);
  });

  req.end();
}));
