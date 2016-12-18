const User = require('mongoose').model('User');
const Role=require('mongoose').model('Role');
const encryption = require('./../utilities/encryption');
const multer=require('multer');
var fs = require("fs");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+file.originalname);
    }
});
var upload=multer({storage:storage});
module.exports = {

    registerGet: (req, res) => {

        res.render('user/register');
    },

   registerPost:(req,res)=>{
       let registerArgs = req.body;

       User.findOne({email: registerArgs.email}).then(user => {
           let errorMsg = '';
           if (user) {
               errorMsg = 'User with the same username exists!';
           } else if (registerArgs.password !== registerArgs.repeatedPassword) {
               errorMsg = 'Passwords do not match!'
           }

           if (errorMsg) {
               registerArgs.error = errorMsg;
               res.render('user/register', registerArgs)
           } else {
               let salt = encryption.generateSalt();
               let passwordHash = encryption.hashPassword(registerArgs.password, salt);

               var userObject = new User();
               userObject.img.data=fs.readFileSync(req.file.path);
                console.log(req.file.path);
	       userObject.img.path=req.file.path;
               userObject.img.contentType='image/png';
               userObject.img.name=req.file.filename;
               userObject.salt=salt;
               userObject.email=registerArgs.email;
               userObject.passwordHash=passwordHash;
               userObject.fullName=registerArgs.fullName;
               let roles = [];
               Role.findOne({name: 'User'}).then(role=> {
                   roles.push(role.id);
                   userObject.roles = roles;

                   User.create(userObject).then(user => {
                       user.prepareInsert();
                       req.logIn(user, (err)=> {
                           if (err) {
                               registerArgs.error = err.message;
                               res.render('user/register', registerArgs);
                               return;
                           }
                           res.redirect('/');
                       })
                   });
               });
           }
       });
    },

    loginGet: (req, res) => {
        res.render('user/login');
    },

    loginPost: (req, res) => {
        let loginArgs = req.body;
        User.findOne({email: loginArgs.email}).then(user => {
            if (!user ||!user.authenticate(loginArgs.password)) {
                let errorMsg = 'Either username or password is invalid!';
                loginArgs.error = errorMsg;
                res.render('user/login', loginArgs);
                return;
            }

            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/user/login', {error: err.message});
                    return;
                }
                let returnUrl='/';
                if(req.session.returnUrl){
                    returnUrl=req.session.returnUrl;
                    delete req.session.returnUrl;
                }
                res.redirect('/');
            })
        })
    },

    logout: (req, res) => {
        req.logOut();
        res.redirect('/');
    },
    
    detailsGet: (req, res) => {
	    
	  res.render('user/details');
    }
};
