//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash')
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret:'Our Little Secret.',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB', {useNewUrlParser:true});
// mongoose.set('useCreateIndex',true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
  });

// userSchema.plugin(encrypt, {secret:process.env.secret,excludeFromEncryption:['email']});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// async function findUser(reqUsername, reqPassword) {

//   const findUser = await User.findOne({ email: reqUsername });

//   const matchPw = await bcrypt.compare(reqPassword, findUser.password)

//   if (matchPw) {
//     return findUser;
//   }
// }

async function findUser(reqUserId){

  const findUser = await User.findById({_id:reqUserId});

  if (findUser){
    return findUser;
  }

}

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/logout", function (req, res, next) {
  req.logOut(function(err){
    if(err){
      return next(err);
    } 
    res.redirect('/')
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get('/secrets', function(req, res){
  // if(req.isAuthenticated()){
  //   res.render('secrets');
  // } else {
  //   res.redirect('/login');
  // }
  findUser(req.user.id).then(function(foundUser){
    if(foundUser){
      const arr = Object.values(foundUser);
      res.render('secrets',{userWithSecrets:arr})
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {

  User.register({username:req.body.username},req.body.password,function(err, user){
  if (err){
    console.log(err);
    res.redirect('/register');  
  } else {
    passport.authenticate('local')(req, res, function(){
      res.redirect('/secrets');
    });
  }
})

  // bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
  //   const newUser = new User({
  //     email: req.body.username,
  //     password: hash
  //   });

  //   newUser.save();

  //   res.render("secrets");
  // });
});

app.get("/submit", function (req, res) {
  res.render("submit");
});


app.post("/submit", function (req, res){
  const submittedContent = req.body.secret;

  findUser(req.user.id).then(function(foundUser){
    if (foundUser){
      foundUser.secret = submittedContent;
      foundUser.save();
      res.redirect('/secrets');
    } else {
      res.redirect('/')
    }
  });
});

app.post("/login",function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.logIn(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, function(){
        res.redirect('/secrets');
      });
    };
  });
    // const userName = req.body.username;
    // const userPassword = req.body.password;
    
    // findUser(userName,userPassword).then(function(foundUser){
    //     if(foundUser){
    //         res.render('secrets');
    //     }else{
    //         res.render('login');
    //     }
    // });
});

app.post('/', function(req, res){
//res.send('');
//res.sendFile('__dirname+/file.html');
});


app.listen(3000, function(){
console.log('Server started on port 3000');
});